import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  GitCompare,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  Layers,
  FileText,
  AlertCircle,
  Loader2,
  Info,
  BookOpen
} from "lucide-react";
import api from "../api/axios";
import BiomarkerTrendChart from "../components/BiomarkerTrendChart";
import ComparativeInsightsView from "../components/ComparativeInsightsView";
import BiomarkerExplainerDrawer from "../components/BiomarkerExplainerDrawer";
import { toast } from "react-toastify";

export default function CompareReportsPage() {
  const [searchParams] = useSearchParams();
  const [availableReports, setAvailableReports] = useState([]);
  const [report1Id, setReport1Id] = useState(searchParams.get("report1") || "");
  const [report2Id, setReport2Id] = useState(searchParams.get("report2") || "");

  const [loadingReports, setLoadingReports] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [insights, setInsights] = useState(null);

  const [selectedChartKey, setSelectedChartKey] = useState(null);
  const [explainingBiomarker, setExplainingBiomarker] = useState(null);

  // 1. Fetch available reports to populate the selector dropdowns
  useEffect(() => {
    async function loadReports() {
      setLoadingReports(true);
      try {
        let list = [];
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const userRes = await api.get("/api/report/user/all");
            if (userRes.data.success && Array.isArray(userRes.data.data)) {
              list = userRes.data.data;
            }
          } catch (e) {
            console.warn("Could not fetch user reports:", e.message);
          }
        }

        const guestIds = JSON.parse(localStorage.getItem("guestReportIds") || "[]");
        if (guestIds.length > 0) {
          try {
            const batchRes = await api.post("/api/report/batch", { ids: guestIds });
            if (batchRes.data.success && Array.isArray(batchRes.data.data)) {
              const existingIds = new Set(list.map((r) => r._id));
              for (const r of batchRes.data.data) {
                if (!existingIds.has(r._id)) {
                  list.push(r);
                  existingIds.add(r._id);
                }
              }
            }
          } catch (e) {
            console.warn("Could not fetch guest reports:", e.message);
          }
        }

        const activeId = localStorage.getItem("activeReportId");
        if (activeId && !list.some((r) => r._id === activeId)) {
          try {
            const sRes = await api.get(`/api/report/${activeId}`);
            if (sRes.data.success && sRes.data.data) {
              list.unshift(sRes.data.data);
            }
          } catch (e) {
            // ignore
          }
        }

        setAvailableReports(list);

        // Pre-select defaults if available
        if (list.length >= 2) {
          if (!report1Id) setReport1Id(list[1]._id);
          if (!report2Id) setReport2Id(list[0]._id);
        } else if (list.length === 1 && !report1Id) {
          setReport1Id(list[0]._id);
        }
      } catch (err) {
        console.error("Failed to load reports for selector:", err);
      } finally {
        setLoadingReports(false);
      }
    }

    loadReports();
  }, []);

  // 2. Trigger comparison when report IDs are selected
  useEffect(() => {
    if (!report1Id || !report2Id || report1Id === report2Id) {
      setComparisonResult(null);
      setInsights(null);
      return;
    }

    async function runComparison() {
      setComparing(true);
      try {
        const res = await api.post("/api/report/compare/insights", {
          reportIds: [report1Id, report2Id]
        });

        if (res.data.success && res.data.data) {
          setComparisonResult(res.data.data.comparisonData);
          setInsights(res.data.data.insights);

          // Select first biomarker with a timeline by default
          const comparisons = res.data.data.comparisonData?.biomarkerComparisons || [];
          if (comparisons.length > 0) {
            setSelectedChartKey(comparisons[0].key);
          }
        }
      } catch (err) {
        console.error("Comparison error:", err);
        toast.error(err.userMessage || "Failed to compare selected reports.");
      } finally {
        setComparing(false);
      }
    }

    runComparison();
  }, [report1Id, report2Id]);

  const summary = comparisonResult?.summary;
  const comparisons = comparisonResult?.biomarkerComparisons || [];
  const headers = comparisonResult?.reportHeaders || [];

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              <GitCompare className="h-3.5 w-3.5" />
              Longitudinal Comparison
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Compare Blood Reports Across Dates
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Track biomarker trajectories, observe trading-style trend graphs, detect lab unit differences, and view doctor consultation prompts.
            </p>
          </div>

          <Link
            to="/history"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs self-start sm:self-auto"
          >
            <span>View All Reports</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Report Selector Header */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            Select 2 Reports to Compare
          </h3>

          {loadingReports ? (
            <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              Loading available reports...
            </div>
          ) : availableReports.length < 2 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 text-center">
              <AlertCircle className="h-6 w-6 text-amber-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-amber-900">
                At least two blood reports are required for comparison
              </p>
              <p className="text-xs text-amber-700 mt-1">
                You currently have {availableReports.length} report in your records. Upload another report from a different test date to unlock comparative trajectory graphs.
              </p>
              <Link
                to="/upload"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
              >
                Upload Second Report
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Report 1 */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  Earlier Report (Baseline)
                </label>
                <select
                  value={report1Id}
                  onChange={(e) => setReport1Id(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 shadow-2xs"
                >
                  <option value="">Select Baseline Report...</option>
                  {availableReports.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.patientDetails?.name || "Patient"} — {r.patientDetails?.reportDate || "Date Unknown"} ({r.biomarkers?.length || 0} biomarkers)
                    </option>
                  ))}
                </select>
              </div>

              {/* Report 2 */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  Follow-up Report (Latest)
                </label>
                <select
                  value={report2Id}
                  onChange={(e) => setReport2Id(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 shadow-2xs"
                >
                  <option value="">Select Follow-up Report...</option>
                  {availableReports.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.patientDetails?.name || "Patient"} — {r.patientDetails?.reportDate || "Date Unknown"} ({r.biomarkers?.length || 0} biomarkers)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {report1Id === report2Id && report1Id !== "" && (
            <p className="mt-3 text-xs text-rose-600 font-semibold">
              Please choose two distinct reports to observe trajectory changes.
            </p>
          )}
        </div>

        {/* Comparison State */}
        {comparing ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">
              Aligning biomarkers and analyzing trajectories...
            </p>
            <p className="text-xs text-slate-400">
              Calculating metric deltas, detecting unit variances, and querying medical literature
            </p>
          </div>
        ) : comparisonResult ? (
          <>
            {/* Summary Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Matched Biomarkers
                </span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {summary?.totalCompared || 0}
                </span>
                <span className="text-[11px] text-slate-500">
                  Tracked across both tests
                </span>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                  Improved to Normal
                </span>
                <span className="text-2xl font-black text-emerald-800 mt-1 block">
                  {summary?.improved || 0}
                </span>
                <span className="text-[11px] text-emerald-600">
                  Resolved from abnormal
                </span>
              </div>

              <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
                  Newly Out of Range
                </span>
                <span className="text-2xl font-black text-rose-800 mt-1 block">
                  {summary?.newlyAbnormal || 0}
                </span>
                <span className="text-[11px] text-rose-600">
                  Shifted High or Low
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Ref Range Shifts
                </span>
                <span className="text-2xl font-black text-slate-800 mt-1 block">
                  {summary?.rangeDiscrepanciesCount || 0}
                </span>
                <span className="text-[11px] text-slate-500">
                  Different lab brackets
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Unit Discrepancies
                </span>
                <span className="text-2xl font-black text-slate-800 mt-1 block">
                  {summary?.unitDiscrepanciesCount || 0}
                </span>
                <span className="text-[11px] text-slate-500">
                  Different test units
                </span>
              </div>
            </div>

            {/* Section 1: Trading-Style Biomarker Trend Chart */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Interactive Biomarker Trajectory Visualizer
                  </h3>
                  <p className="text-xs text-slate-500">
                    Styled like a financial ticker with normal reference range corridors and direction indicators.
                  </p>
                </div>
              </div>

              <BiomarkerTrendChart
                biomarkers={comparisons}
                selectedKey={selectedChartKey}
                onSelectBiomarker={(key) => setSelectedChartKey(key)}
              />
            </section>

            {/* Section 2: AI Trajectory Insights & Considerations */}
            <ComparativeInsightsView insights={insights} loading={false} />

            {/* Section 3: Comprehensive Side-by-Side Comparison Table */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Biomarker Comparison Matrix ({comparisons.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Side-by-side values, absolute differences, percentage changes, and lab discrepancy warnings.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[760px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-3">Biomarker</th>
                      <th className="py-3 px-3">
                        {headers[0]?.reportDate || "Baseline"}
                      </th>
                      <th className="py-3 px-3">
                        {headers[1]?.reportDate || "Follow-up"}
                      </th>
                      <th className="py-3 px-3">Net Change (Δ)</th>
                      <th className="py-3 px-3">Status Shift</th>
                      <th className="py-3 px-3">Reference Shifts / Notices</th>
                      <th className="py-3 px-3 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {comparisons.map((c) => {
                      const isHigh = c.latest?.status === "High";
                      const isLow = c.latest?.status === "Low";
                      const isSelected = selectedChartKey === c.key;

                      return (
                        <tr
                          key={c.key}
                          className={`transition ${
                            isSelected
                              ? "bg-blue-50/50"
                              : isHigh
                              ? "bg-rose-50/20 hover:bg-rose-50/40"
                              : isLow
                              ? "bg-amber-50/20 hover:bg-amber-50/40"
                              : "hover:bg-slate-50/60"
                          }`}
                        >
                          {/* Biomarker Name & Category */}
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 block">
                              {c.displayName}
                            </span>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                              {c.category}
                            </span>
                          </td>

                          {/* Baseline Test */}
                          <td className="py-3 px-3">
                            {c.first ? (
                              <div>
                                <span className="font-bold text-slate-800">
                                  {c.first.value} {c.first.unit}
                                </span>
                                <span
                                  className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    c.first.status === "High"
                                      ? "bg-rose-100 text-rose-700"
                                      : c.first.status === "Low"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-emerald-100 text-emerald-800"
                                  }`}
                                >
                                  {c.first.status}
                                </span>
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  Range: {c.first.range?.rawText}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Not tested</span>
                            )}
                          </td>

                          {/* Follow-up Test */}
                          <td className="py-3 px-3">
                            {c.latest ? (
                              <div>
                                <span className="font-bold text-slate-900">
                                  {c.latest.value} {c.latest.unit}
                                </span>
                                <span
                                  className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    c.latest.status === "High"
                                      ? "bg-rose-100 text-rose-700"
                                      : c.latest.status === "Low"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-emerald-100 text-emerald-800"
                                  }`}
                                >
                                  {c.latest.status}
                                </span>
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  Range: {c.latest.range?.rawText}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Not tested</span>
                            )}
                          </td>

                          {/* Delta */}
                          <td className="py-3 px-3 font-semibold">
                            {c.deltaPercentage !== null ? (
                              <span
                                className={`inline-flex items-center gap-1 font-bold ${
                                  c.trend === "up"
                                    ? "text-rose-600"
                                    : c.trend === "down"
                                    ? "text-emerald-600"
                                    : "text-slate-500"
                                }`}
                              >
                                {c.trend === "up" ? (
                                  <TrendingUp className="h-3.5 w-3.5" />
                                ) : c.trend === "down" ? (
                                  <TrendingDown className="h-3.5 w-3.5" />
                                ) : null}
                                <span>
                                  {c.deltaPercentage > 0 ? "+" : ""}
                                  {c.deltaPercentage}%
                                </span>
                                {c.deltaAbsolute !== null && (
                                  <span className="text-[11px] text-slate-400 font-normal">
                                    ({c.deltaAbsolute > 0 ? "+" : ""}
                                    {c.deltaAbsolute})
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>

                          {/* Status Shift */}
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-700">
                              {c.statusShift}
                            </span>
                          </td>

                          {/* Notices / Discrepancies */}
                          <td className="py-3 px-3">
                            <div className="space-y-1">
                              {c.missingNotice && (
                                <span className="inline-block text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                  {c.missingNotice}
                                </span>
                              )}
                              {c.unitMismatch && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                                  Unit Mismatch ({c.first?.unit} vs {c.latest?.unit})
                                </span>
                              )}
                              {c.rangeShift && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                  <Info className="h-3 w-3 text-slate-400" />
                                  Lab Reference Shift
                                </span>
                              )}
                              {!c.missingNotice && !c.unitMismatch && !c.rangeShift && (
                                <span className="text-[11px] text-slate-400">
                                  Consistent brackets
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Action */}
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedChartKey(c.key)}
                                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                                  isSelected
                                    ? "bg-slate-900 text-white"
                                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                }`}
                              >
                                View Trend
                              </button>
                              <button
                                onClick={() =>
                                  setExplainingBiomarker({
                                    name: c.displayName,
                                    category: c.category,
                                    value: c.latest?.value || c.first?.value,
                                    unit: c.latest?.unit || c.first?.unit,
                                    range: c.latest?.range || c.first?.range,
                                    status: c.latest?.status || c.first?.status
                                  })
                                }
                                title="Explain this biomarker"
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                              >
                                <BookOpen className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}

      </main>

      {/* RAG Medical Term Explainer Drawer */}
      <BiomarkerExplainerDrawer
        isOpen={!!explainingBiomarker}
        onClose={() => setExplainingBiomarker(null)}
        biomarker={explainingBiomarker}
      />
    </div>
  );
}
