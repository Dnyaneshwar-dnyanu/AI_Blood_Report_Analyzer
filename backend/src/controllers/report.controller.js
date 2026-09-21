import processReport from "../services/report/upload.service.js";
import fs from 'fs';
import ReportModel from "../models/Report.model.js";
import { detectReportImbalances } from "../services/report/guidance.service.js";

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

export { uploadReport, getReport, getReportGuidance, getUserReports };