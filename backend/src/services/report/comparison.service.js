import ReportModel from "../../models/Report.model.js";
import { getNormalizedBiomarkerKey, inferCategory } from "./analyzeReport.service.js";

/**
 * Normalizes report date string into a sortable Date object
 */
function parseReportDate(dateStr) {
    if (!dateStr || dateStr === "—" || dateStr === "-") return new Date(0);
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

/**
 * Aligns and compares biomarkers across multiple reports
 * @param {Array<string>} reportIds - Array of report MongoDB ObjectIDs
 */
export async function compareReports(reportIds) {
    if (!Array.isArray(reportIds) || reportIds.length < 2) {
        throw new Error("At least two valid report IDs are required for comparison.");
    }

    const reports = await ReportModel.find({ _id: { $in: reportIds } });
    if (!reports || reports.length < 2) {
        throw new Error("Could not find the requested reports for comparison.");
    }

    // Sort reports chronologically by test date (oldest to newest)
    reports.sort((a, b) => {
        const dateA = parseReportDate(a.patientDetails?.reportDate || a.createdAt);
        const dateB = parseReportDate(b.patientDetails?.reportDate || b.createdAt);
        return dateA - dateB;
    });

    const reportHeaders = reports.map(r => ({
        id: r._id,
        patientName: r.patientDetails?.name || "Unspecified Patient",
        reportDate: r.patientDetails?.reportDate || new Date(r.createdAt).toLocaleDateString(),
        createdAt: r.createdAt
    }));

    // Collect all unique normalized biomarker keys across all reports
    const biomarkerMap = new Map();

    reports.forEach((report, reportIndex) => {
        const rDate = report.patientDetails?.reportDate || new Date(report.createdAt).toLocaleDateString();

        (report.biomarkers || []).forEach(bm => {
            const normKey = bm.normalizedKey || getNormalizedBiomarkerKey(bm.name);
            const category = bm.category || inferCategory(bm.name);

            if (!biomarkerMap.has(normKey)) {
                biomarkerMap.set(normKey, {
                    key: normKey,
                    displayName: bm.name,
                    category: category,
                    occurrences: Array(reports.length).fill(null),
                    chartTimeline: []
                });
            }

            const entry = biomarkerMap.get(normKey);
            const numVal = typeof bm.value === 'number' ? bm.value : parseFloat(bm.value);
            const numMin = typeof bm.range?.min === 'number' ? bm.range.min : parseFloat(bm.range?.min);
            const numMax = typeof bm.range?.max === 'number' ? bm.range.max : parseFloat(bm.range?.max);

            const record = {
                reportId: report._id,
                reportIndex: reportIndex,
                date: rDate,
                value: bm.value,
                numericValue: isNaN(numVal) ? null : numVal,
                unit: bm.unit || "",
                status: bm.status || "Normal",
                range: {
                    min: isNaN(numMin) ? null : numMin,
                    max: isNaN(numMax) ? null : numMax,
                    rawText: bm.range?.rawText || `${bm.range?.min || ''}-${bm.range?.max || ''}`
                }
            };

            entry.occurrences[reportIndex] = record;
            if (!isNaN(numVal)) {
                entry.chartTimeline.push({
                    date: rDate,
                    reportIndex: reportIndex,
                    value: numVal,
                    min: isNaN(numMin) ? null : numMin,
                    max: isNaN(numMax) ? null : numMax,
                    unit: bm.unit || "",
                    status: bm.status || "Normal"
                });
            }
        });
    });

    // Compute deltas, unit discrepancies, and missing flags for each biomarker
    const comparisonResults = [];
    const firstIdx = 0;
    const lastIdx = reports.length - 1;

    for (const [key, data] of biomarkerMap.entries()) {
        const firstOccurrence = data.occurrences[firstIdx];
        const lastOccurrence = data.occurrences[lastIdx];

        let deltaAbsolute = null;
        let deltaPercentage = null;
        let trend = "stable";
        let statusShift = "Unchanged";
        let unitMismatch = false;
        let rangeShift = false;
        let missingNotice = null;

        // Check if missing in either first or latest report
        if (!firstOccurrence && lastOccurrence) {
            missingNotice = "New measurement: Not tested in earlier report";
        } else if (firstOccurrence && !lastOccurrence) {
            missingNotice = "Omitted: Not tested in latest report";
        } else if (firstOccurrence && lastOccurrence) {
            // Check unit mismatch
            if (firstOccurrence.unit && lastOccurrence.unit && firstOccurrence.unit.toLowerCase() !== lastOccurrence.unit.toLowerCase()) {
                unitMismatch = true;
            }

            // Check reference range shift
            if (firstOccurrence.range?.rawText !== lastOccurrence.range?.rawText) {
                rangeShift = true;
            }

            // Numeric deltas
            if (firstOccurrence.numericValue !== null && lastOccurrence.numericValue !== null) {
                const diff = lastOccurrence.numericValue - firstOccurrence.numericValue;
                deltaAbsolute = parseFloat(diff.toFixed(2));

                if (firstOccurrence.numericValue !== 0) {
                    deltaPercentage = parseFloat(((diff / firstOccurrence.numericValue) * 100).toFixed(1));
                }

                if (diff > 0.05) trend = "up";
                else if (diff < -0.05) trend = "down";
                else trend = "stable";
            }

            if (firstOccurrence.status !== lastOccurrence.status) {
                statusShift = `${firstOccurrence.status} → ${lastOccurrence.status}`;
            }
        }

        comparisonResults.push({
            key: data.key,
            displayName: data.displayName,
            category: data.category,
            first: firstOccurrence,
            latest: lastOccurrence,
            allOccurrences: data.occurrences,
            chartTimeline: data.chartTimeline,
            deltaAbsolute,
            deltaPercentage,
            trend,
            statusShift,
            unitMismatch,
            rangeShift,
            missingNotice
        });
    }

    // Sort comparison results by category, then by abnormal status
    comparisonResults.sort((a, b) => {
        const aOut = (a.latest?.status === "High" || a.latest?.status === "Low");
        const bOut = (b.latest?.status === "High" || b.latest?.status === "Low");
        if (aOut && !bOut) return -1;
        if (!aOut && bOut) return 1;
        return a.displayName.localeCompare(b.displayName);
    });

    return {
        reportHeaders,
        biomarkerComparisons: comparisonResults,
        summary: {
            totalCompared: comparisonResults.length,
            improved: comparisonResults.filter(r => (r.first?.status === "High" || r.first?.status === "Low") && r.latest?.status === "Normal").length,
            newlyAbnormal: comparisonResults.filter(r => r.first?.status === "Normal" && (r.latest?.status === "High" || r.latest?.status === "Low")).length,
            unitDiscrepanciesCount: comparisonResults.filter(r => r.unitMismatch).length,
            rangeDiscrepanciesCount: comparisonResults.filter(r => r.rangeShift).length
        }
    };
}
