import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Calendar,
  User,
  Trash2,
  ArrowRight,
  Upload,
  AlertCircle,
  CheckCircle2,
  Layers,
  Sparkles,
  GitCompare,
  Eye,
  EyeOff,
  Search,
  Loader2,
  ShieldCheck
} from "lucide-react";
import api from "../api/axios";
import { toast } from "react-toastify";

export default function ReportHistoryPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [privacyMask, setPrivacyMask] = useState(() => {
    return localStorage.getItem("privacyMaskEnabled") === "true";
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const activeReportId = localStorage.getItem("activeReportId");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let loadedReports = [];

      // 1. Fetch user reports if logged in
      if (token) {
        try {
          const userRes = await api.get("/api/report/user/all");
          if (userRes.data.success && Array.isArray(userRes.data.data)) {
            loadedReports = userRes.data.data;
          }
        } catch (e) {
          console.warn("Could not fetch user reports:", e.message);
        }
      }

      // 2. Fetch guest session reports if any exist in localStorage
      const guestIds = JSON.parse(localStorage.getItem("guestReportIds") || "[]");
      if (guestIds.length > 0) {
        try {
          const batchRes = await api.post("/api/report/batch", { ids: guestIds });
          if (batchRes.data.success && Array.isArray(batchRes.data.data)) {
            // Deduplicate with user reports
            const existingIds = new Set(loadedReports.map((r) => r._id));
            for (const r of batchRes.data.data) {
              if (!existingIds.has(r._id)) {
                loadedReports.push(r);
                existingIds.add(r._id);
              }
            }
          }
        } catch (e) {
          console.warn("Could not fetch guest batch reports:", e.message);
        }
      }

      // 3. Fallback: Check if activeReportId is available and not yet loaded
      if (activeReportId && !loadedReports.some((r) => r._id === activeReportId)) {
        try {
          const singleRes = await api.get(`/api/report/${activeReportId}`);
          if (singleRes.data.success && singleRes.data.data) {
            loadedReports.unshift(singleRes.data.data);
          }
        } catch (e) {
          // ignore
        }
      }

      setReports(loadedReports);
    } catch (err) {
      console.error("Failed to load reports history:", err);
      toast.error("Could not retrieve reports history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const togglePrivacyMask = () => {
    const nextVal = !privacyMask;
    setPrivacyMask(nextVal);
    localStorage.setItem("privacyMaskEnabled", String(nextVal));
    window.dispatchEvent(new Event("privacyMaskChanged"));
  };

  const maskName = (name) => {
    if (!privacyMask || !name || name === "—") return name;
    return name
      .split(" ")
      .map((part) => (part.length > 1 ? part[0] + "*".repeat(part.length - 1) : part))
      .join(" ");
  };

  const handleSelectReport = (id) => {
    localStorage.setItem("activeReportId", id);
    navigate(`/dashboard?id=${id}`);
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      const res = await api.delete(`/api/report/${id}`);
      if (res.data.success) {
        toast.success("Report deleted successfully");
        setReports((prev) => prev.filter((r) => r._id !== id));

        // Remove from guestReportIds
        const guestIds = JSON.parse(localStorage.getItem("guestReportIds") || "[]");
        const filtered = guestIds.filter((item) => item !== id);
        localStorage.setItem("guestReportIds", JSON.stringify(filtered));

        if (activeReportId === id) {
          localStorage.removeItem("activeReportId");
        }
        setDeleteConfirmId(null);
      } else {
        throw new Error(res.data.message || "Failed to delete");
      }
    } catch (err) {
      toast.error(err.userMessage || err.message || "Failed to delete report");
    } finally {
      setDeleting(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    const name = (r.patientDetails?.name || "").toLowerCase();
    const date = (r.patientDetails?.reportDate || "").toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || date.includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end border-b border-slate-200 pb-6">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              <FileText className="h-3.5 w-3.5" />
              Document Vault
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Report History & Management
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Browse previously analyzed blood reports, view detailed dashboards, or compare changes across dates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Privacy Masking Toggle */}
            <button
              onClick={togglePrivacyMask}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                privacyMask
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
              title="Toggle PII masking on screen"
            >
              {privacyMask ? (
                <>
                  <EyeOff className="h-3.5 w-3.5 text-amber-600" />
                  <span>PII Masked</span>
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 text-slate-500" />
                  <span>Mask PII</span>
                </>
              )}
            </button>

            <Link
              to="/compare"
              className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition shadow-2xs"
            >
              <GitCompare className="h-4 w-4" />
              Compare Reports
            </Link>

            <Link
              to="/upload"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
            >
              <Upload className="h-4 w-4" />
              Upload New Report
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by patient name or date..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 shadow-2xs"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing {filteredReports.length} {filteredReports.length === 1 ? "report" : "reports"}
          </div>
        </div>

        {/* Content State */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Loading your report vault...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No reports found</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {searchQuery
                ? "No uploaded blood reports matched your search term."
                : "You haven't uploaded any blood reports yet. Upload your first PDF or scanned report to start analyzing biomarkers."}
            </p>
            <Link
              to="/upload"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm"
            >
              <Upload className="h-4 w-4" />
              Upload Report
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredReports.map((report) => {
              const bCount = report.biomarkers?.length || 0;
              const abnormal = (report.biomarkers || []).filter(
                (b) => b.status === "High" || b.status === "Low"
              );
              const isActive = activeReportId === report._id;

              return (
                <div
                  key={report._id}
                  className={`rounded-2xl border bg-white p-6 shadow-xs transition hover:shadow-md flex flex-col justify-between ${
                    isActive ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200"
                  }`}
                >
                  <div>
                    {/* Top Row: Active Pill + Out of range */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 border border-blue-200">
                          <CheckCircle2 className="h-3 w-3" />
                          Active Report
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400">
                          Saved Report
                        </span>
                      )}

                      {abnormal.length > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                          <AlertCircle className="h-3 w-3" />
                          {abnormal.length} Out of Range
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                          All Normal
                        </span>
                      )}
                    </div>

                    {/* Patient & Date Details */}
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600 shrink-0" />
                      <span>{maskName(report.patientDetails?.name || "Unspecified Patient")}</span>
                    </h3>

                    <div className="mt-2 space-y-1 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>Sample Date: <strong>{report.patientDetails?.reportDate || "—"}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5 text-slate-400" />
                        <span>{bCount} Biomarkers Extracted</span>
                      </div>
                    </div>

                    {/* Quick AI Summary Snippet */}
                    {report.aiSummary && (
                      <p className="mt-4 text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                        {report.aiSummary}
                      </p>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setDeleteConfirmId(report._id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Delete report"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/compare?report1=${report._id}`}
                        className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Compare
                      </Link>

                      <button
                        onClick={() => handleSelectReport(report._id)}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-2xs"
                      >
                        <span>View</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Security & Privacy Notice */}
        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-5 flex items-start gap-3 shadow-2xs">
          <ShieldCheck className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-800">Your Medical Privacy & Security</p>
            <p>
              Your uploaded files are processed in real-time and immediately unlinked from disk storage. Report records are protected with isolated user and guest session tokens. You can delete any report and its associated conversation history at any time.
            </p>
          </div>
        </div>

      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-200 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4">
              <Trash2 className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete Blood Report?</h3>
            <p className="text-xs text-slate-500 mt-2">
              This will permanently delete this report and its associated AI chat conversation history. This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleting}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleting}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition"
              >
                {deleting ? "Deleting..." : "Yes, Delete Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
