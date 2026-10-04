import processReport from "../services/report/upload.service.js";
import fs from 'fs';
import ReportModel from "../models/Report.model.js";
import Conversation from "../models/Conversation.model.js";
import { detectReportImbalances } from "../services/report/guidance.service.js";
import { inferCategory, getNormalizedBiomarkerKey } from "../services/report/analyzeReport.service.js";
import { compareReports } from "../services/report/comparison.service.js";
import { generateComparisonInsights } from "../services/report/comparisonInsight.service.js";

async function getReport(req, res, next) {
    const reportId = req.params.id;
    try {
        if (!reportId) return res.status(404).json({ success: false, message: "Invalid Report Id" });

        const report = await ReportModel.findById(reportId);

        if (report) {
            // Check ownership if user is logged in and report has owner
            if (req.user && report.userId && report.userId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ success: false, message: "Unauthorized access to this report" });
            }
            return res.status(200).json({ success: true, data: report });
        }

        return res.status(404).json({ success: false, message: "Report Not Found" });

    } catch (error) {
        next(error);
    }
}

async function getReportGuidance(req, res, next) {
    const reportId = req.params.id;
    try {
        if (!reportId) return res.status(404).json({ success: false, message: "Invalid Report Id" });

        const report = await ReportModel.findById(reportId);
        if (!report) {
            return res.status(404).json({ success: false, message: "Report Not Found" });
        }

        const imbalances = detectReportImbalances(report.biomarkers || []);

        return res.status(200).json({
            success: true,
            data: {
                hasImbalances: imbalances.length > 0,
                imbalances: imbalances,
                disclaimer: "These suggestions are for general educational wellness and lifestyle awareness. They do not constitute a medical diagnosis or treatment plan."
            }
        });

    } catch (error) {
        next(error);
    }
}

async function uploadReport(req, res, next) {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: 'Upload failed: No file provided.' });

    try {
        const result = await processReport(file);

        const newReportData = await ReportModel.create({
            ...result,
            isDraft: false,
            userId: req.user ? req.user._id : null
        });

        console.log("Report saved to database with ID:", newReportData._id);

        return res.status(200).json({
            success: true,
            data: newReportData
        });

    } catch (error) {
        next(error);
    } finally {
        // Guaranteed cleanup of uploaded file regardless of success or error
        if (file && file.path && fs.existsSync(file.path)) {
            try {
                fs.unlinkSync(file.path);
                console.log("Temporary file cleaned up:", file.path);
            } catch (cleanupErr) {
                console.error("Failed to delete temp file:", cleanupErr.message);
            }
        }
    }
}

async function updateReport(req, res, next) {
    const reportId = req.params.id;
    const { patientDetails, biomarkers, aiSummary } = req.body;

    try {
        const report = await ReportModel.findById(reportId);
        if (!report) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }

        // Ownership check
        if (req.user && report.userId && report.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized to update this report" });
        }

        if (patientDetails) {
            report.patientDetails = {
                name: patientDetails.name ?? report.patientDetails?.name,
                age: patientDetails.age ?? report.patientDetails?.age,
                gender: patientDetails.gender ?? report.patientDetails?.gender,
                reportDate: patientDetails.reportDate ?? report.patientDetails?.reportDate
            };
        }

        if (aiSummary) {
            report.aiSummary = aiSummary;
        }

        if (Array.isArray(biomarkers)) {
            report.biomarkers = biomarkers.map(b => {
                const numVal = parseFloat(b.value);
                const numMin = parseFloat(b.range?.min);
                const numMax = parseFloat(b.range?.max);

                let status = b.status || "Normal";
                if (!isNaN(numVal) && !isNaN(numMin) && !isNaN(numMax)) {
                    if (numVal < numMin) status = "Low";
                    else if (numVal > numMax) status = "High";
                    else status = "Normal";
                }

                return {
                    name: b.name || "Unnamed Biomarker",
                    category: b.category || inferCategory(b.name || ""),
                    normalizedKey: b.normalizedKey || getNormalizedBiomarkerKey(b.name || ""),
                    value: isNaN(numVal) ? (b.value ?? "—") : numVal,
                    unit: b.unit || "",
                    range: {
                        min: isNaN(numMin) ? (b.range?.min ?? "-") : numMin,
                        max: isNaN(numMax) ? (b.range?.max ?? "-") : numMax,
                        rawText: b.range?.rawText || `${b.range?.min ?? ''} - ${b.range?.max ?? ''}`
                    },
                    status,
                    confidence: b.confidence || "high",
                    uncertainFlag: b.uncertainFlag === true,
                    uncertaintyReason: b.uncertaintyReason || "",
                    comparisonText: b.comparisonText || `Compared with reference range ${b.range?.min ?? ''}-${b.range?.max ?? ''}`
                };
            });
        }

        report.isDraft = false;
        await report.save();

        return res.status(200).json({
            success: true,
            data: report,
            message: "Report updated successfully"
        });

    } catch (error) {
        next(error);
    }
}

async function deleteReport(req, res, next) {
    const reportId = req.params.id;
    try {
        const report = await ReportModel.findById(reportId);
        if (!report) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }

        // Ownership check
        if (req.user && report.userId && report.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized to delete this report" });
        }

        await ReportModel.findByIdAndDelete(reportId);

        // Cascade delete conversations linked to this report
        try {
            await Conversation.deleteMany({ reportId });
        } catch (convErr) {
            console.warn("Could not delete associated conversations:", convErr.message);
        }

        return res.status(200).json({
            success: true,
            message: "Report deleted successfully"
        });

    } catch (error) {
        next(error);
    }
}

async function getBatchReports(req, res, next) {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: "Valid report IDs array is required" });
        }

        const query = { _id: { $in: ids } };
        // If user logged in, allow their own reports plus any requested IDs matching
        const reports = await ReportModel.find(query).sort({ createdAt: -1 });

        return res.status(200).json({ success: true, data: reports });
    } catch (error) {
        next(error);
    }
}

async function getUserReports(req, res, next) {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }
        const reports = await ReportModel.find({ userId: req.user._id }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: reports });
    } catch (error) {
        next(error);
    }
}

async function compareReportsController(req, res, next) {
    try {
        const { reportIds } = req.body;
        if (!Array.isArray(reportIds) || reportIds.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Please select at least 2 reports to compare."
            });
        }

        const result = await compareReports(reportIds);
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}

async function getComparisonInsightsController(req, res, next) {
    try {
        const { reportIds } = req.body;
        if (!Array.isArray(reportIds) || reportIds.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Please select at least 2 reports to generate insights."
            });
        }

        const result = await generateComparisonInsights(reportIds);
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}

export {
    uploadReport,
    getReport,
    getReportGuidance,
    getUserReports,
    updateReport,
    deleteReport,
    getBatchReports,
    compareReportsController,
    getComparisonInsightsController
};