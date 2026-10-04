import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  User,
  Calendar,
  FileText,
  AlertCircle,
  HeartPulse,
  MessageSquare,
  BarChart2,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Layers,
  BookOpen
} from "lucide-react";
import PatientDetail from "../components/PatientDetail";
import BiomarkerCard from "../components/BiomarkerCard";
import RangeGraph from "../components/RangeGraph";
import BiomarkerExplainerDrawer from "../components/BiomarkerExplainerDrawer";
import defaultReport from "../data/defaultReport";
import api from "../api/axios";

const DASHBOARD_CATEGORIES = [
  "All",
  "CBC",
  "Lipids",
  "Metabolic",
  "Kidney",
  "Liver",
  "Thyroid",
  "Vitamins",
  "Other"
];

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const [patientDetails, setPatientDetails] = useState(defaultReport.patientDetails);
  const [aiSummary, setAiSummary] = useState(defaultReport.aiSummary);
  const [biomarkers, setBiomarkers] = useState(defaultReport.biomarkers);
  const [guidanceInfo, setGuidanceInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("cards"); // "cards" | "graphs"
  const [reportId, setReportId] = useState(null);

  // New filtering & explainer states
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyAbnormal, setOnlyAbnormal] = useState(false);
  const [explainingBiomarker, setExplainingBiomarker] = useState(null);

  useEffect(() => {
    async function fetchReport() {
      // Support query param ?id=... or fallback to localStorage
      const queryId = searchParams.get("id");
      const storedId = queryId || localStorage.getItem('activeReportId');
      if (!storedId) return;

      setReportId(storedId);
      if (queryId) {
        localStorage.setItem('activeReportId', queryId);
      }

      try {
        const response = await api.get(`/api/report/${storedId}`);
        const result = response.data;

        if (result.success && result.data) {
          if (result.data.patientDetails) setPatientDetails(result.data.patientDetails);
          if (result.data.aiSummary) setAiSummary(result.data.aiSummary);
          if (result.data.biomarkers && Array.isArray(result.data.biomarkers)) {
            setBiomarkers(result.data.biomarkers);
          }
        }

        // Fetch proactive guidance
        const guidanceRes = await api.get(`/api/report/${storedId}/guidance`);
        if (guidanceRes.data.success) {
          setGuidanceInfo(guidanceRes.data.data);
        }
      } catch (err) {
        console.warn("Could not fetch uploaded report, displaying fallback report data:", err.message);
      }
    }

    fetchReport();
  }, [searchParams]);

  const abnormalBiomarkers = biomarkers.filter(b => b.status === "High" || b.status === "Low");
  const abnormalCount = abnormalBiomarkers.length;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end border-b border-slate-200 pb-6">

          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              <Sparkles className="h-3.5 w-3.5" />
              Blood Report Insights
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Health Overview & Analytics
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              A comprehensive breakdown of your biomarkers, extracted metrics, and medical reference ranges.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/chat"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
            >
              <MessageSquare className="h-4 w-4" />
              Ask AI About Report
            </Link>
          </div>

        </div>

        {/* Patient Information */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">

          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <User className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Patient Profile & Metadata
                </h3>

                <p className="text-xs text-slate-500">
                  Extracted automatically from your document
                </p>
              </div>
            </div>

            {abnormalCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                <AlertCircle className="h-3.5 w-3.5" />
                {abnormalCount} Value{abnormalCount > 1 ? 's' : ''} Out of Range
              </span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <PatientDetail
              label="Patient Name"
              value={patientDetails.name || "—"}
            />

            <PatientDetail
              label="Age"
              value={patientDetails.age || "—"}
            />

            <PatientDetail
              label="Gender"
              value={patientDetails.gender || "—"}
            />

            <PatientDetail
              label="Report Date"
              value={patientDetails.reportDate || "—"}
              icon={<Calendar className="h-4 w-4 text-blue-600" />}
            />

          </div>

        </section>


        {/* AI Summary */}
        <section className="mb-6 rounded-2xl border border-blue-100 bg-linear-to-br from-blue-50/80 via-white to-teal-50/60 p-6 shadow-xs">

          <div className="mb-5 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-xs">
              <HeartPulse className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                AI Clinical Explanation & Summary
              </h3>

              <p className="text-xs text-slate-500">
                Synthesized in clear, non-technical language by Gemini AI
              </p>
            </div>

          </div>


          <div className="rounded-xl border border-white bg-white/90 p-5 shadow-xs">

            <p className="text-sm leading-7 text-slate-700 whitespace-pre-line">
              {aiSummary}
            </p>

            <div className="mt-5 flex items-start gap-3 rounded-xl bg-blue-50/80 p-4 border border-blue-100">

              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

              <p className="text-xs leading-5 text-slate-600">
                <strong>Medical Notice:</strong> This summary is generated from your uploaded laboratory report for educational understanding. It does not replace clinical diagnosis or treatment planning from a licensed medical professional.
              </p>

            </div>

          </div>

        </section>

        {/* Proactive Health & Lifestyle Guidance Banner (When abnormal values detected) */}
        {abnormalCount > 0 && (
          <section className="mb-8 rounded-2xl border border-amber-200 bg-linear-to-r from-amber-50/70 via-white to-teal-50/50 p-6 shadow-xs">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">
                    Proactive Health & Lifestyle Guidance
                  </h3>
                  <p className="text-xs text-slate-500">
                    General informational suggestions based on detected test imbalances
                  </p>
                </div>
              </div>

              <Link
                to="/chat"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                Ask Assistant about these values →
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
              {abnormalBiomarkers.map((b, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-800">{b.name}</span>
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${
                      b.status === 'High' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {b.status === 'High' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {b.status} ({b.value} {b.unit})
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    Normal reference: {b.range?.rawText || `${b.range?.min || ''} - ${b.range?.max || ''}`} {b.unit}
                  </p>
                  <Link
                    to="/chat"
                    onClick={() => {
                      localStorage.setItem("pendingChatPrompt", `Why is my ${b.name} ${b.status.toLowerCase()}, and what healthy habits can support it?`);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
                  >
                    <span>Explore lifestyle habits for {b.name}</span>
                    <Sparkles className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
              <span>Guidance covers general nutrition, hydration, sleep, and activity. Never substitutes a physician's advice.</span>
            </div>
          </section>
        )}

        {/* Biomarker Overview & Filtering Controls */}
        <section>
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Biomarker Analysis ({biomarkers.length} of {biomarkers.length})
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Detailed comparison against clinical reference ranges with instant medical term explanations.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex items-center rounded-xl bg-slate-200/60 p-1">
                  <button
                    onClick={() => setActiveTab("cards")}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                      activeTab === "cards"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Card View
                  </button>
                  <button
                    onClick={() => setActiveTab("graphs")}
                    aria-label="Graph View"
                    className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                      activeTab === "graphs"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <BarChart2 className="h-3.5 w-3.5 text-blue-600" />
                    Range Gauges
                  </button>
                </div>
              </div>
            </div>

            {/* Search and Filters Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search biomarker (e.g. Hemoglobin, Glucose, ALT)..."
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Only Abnormal Toggle */}
              <button
                onClick={() => setOnlyAbnormal(!onlyAbnormal)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                  onlyAbnormal
                    ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Out of Range Only ({abnormalCount})</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {DASHBOARD_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Render Cards or Graphs */}
          {biomarkers.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <Layers className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">No biomarkers matched your filters</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing your search query or choosing another category.</p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                  setOnlyAbnormal(false);
                }}
                className="mt-4 rounded-xl bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : activeTab === "cards" ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {biomarkers.map((biomarker, index) => (
                <BiomarkerCard
                  key={index}
                  name={biomarker.name}
                  category={biomarker.category}
                  value={biomarker.value}
                  unit={biomarker.unit}
                  range={biomarker.range}
                  status={biomarker.status}
                  comparisionText={biomarker.comparisonText}
                  onExplain={(marker) => setExplainingBiomarker(marker)}
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {biomarkers.map((biomarker, index) => (
                <RangeGraph
                  key={index}
                  title={biomarker.name}
                  value={biomarker.value}
                  unit={biomarker.unit}
                  min={biomarker.range?.min || "0"}
                  max={biomarker.range?.max || "100"}
                  warning={biomarker.status === "High" || biomarker.status === "Low"}
                />
              ))}
            </div>
          )}
        </section>
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