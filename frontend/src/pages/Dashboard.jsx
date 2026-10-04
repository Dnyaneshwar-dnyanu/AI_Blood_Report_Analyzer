import { useState, useEffect, useMemo } from "react";
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
  BookOpen,
  Copy,
  Check,
  ShieldCheck,
  Activity,
  ArrowRight,
  Eye,
  EyeOff
} from "lucide-react";
import PatientDetail from "../components/PatientDetail";
import BiomarkerCard from "../components/BiomarkerCard";
import RangeGraph from "../components/RangeGraph";
import BiomarkerExplainerDrawer from "../components/BiomarkerExplainerDrawer";
import defaultReport from "../data/defaultReport";
import api from "../api/axios";
import { toast } from "react-toastify";

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

// Reliable category fallback for older reports or documents without explicit category metadata
function inferCategoryFallback(name = "") {
  const n = name.toLowerCase();
  if (
    n.includes("hemoglobin") ||
    n.includes("rbc") ||
    n.includes("wbc") ||
    n.includes("platelet") ||
    n.includes("hematocrit") ||
    n.includes("mcv") ||
    n.includes("mch") ||
    n.includes("neutrophil") ||
    n.includes("lymphocyte") ||
    n.includes("eosinophil") ||
    n.includes("monocyte") ||
    n.includes("basophil")
  ) {
    return "CBC";
  }
  if (
    n.includes("cholesterol") ||
    n.includes("triglyceride") ||
    n.includes("hdl") ||
    n.includes("ldl") ||
    n.includes("vldl") ||
    n.includes("lipid")
  ) {
    return "Lipids";
  }
  if (
    n.includes("glucose") ||
    n.includes("hba1c") ||
    n.includes("sugar") ||
    n.includes("insulin") ||
    n.includes("fasting blood sugar")
  ) {
    return "Metabolic";
  }
  if (
    n.includes("creatinine") ||
    n.includes("urea") ||
    n.includes("bun") ||
    n.includes("uric") ||
    n.includes("egfr") ||
    n.includes("kidney")
  ) {
    return "Kidney";
  }
  if (
    n.includes("bilirubin") ||
    n.includes("sgot") ||
    n.includes("sgpt") ||
    n.includes("alt") ||
    n.includes("ast") ||
    n.includes("alkaline phosphatase") ||
    n.includes("alp") ||
    n.includes("albumin") ||
    n.includes("protein")
  ) {
    return "Liver";
  }
  if (
    n.includes("t3") ||
    n.includes("t4") ||
    n.includes("tsh") ||
    n.includes("thyroid") ||
    n.includes("ft3") ||
    n.includes("ft4")
  ) {
    return "Thyroid";
  }
  if (
    n.includes("vitamin") ||
    n.includes("b12") ||
    n.includes("d3") ||
    n.includes("iron") ||
    n.includes("ferritin") ||
    n.includes("calcium") ||
    n.includes("zinc") ||
    n.includes("magnesium")
  ) {
    return "Vitamins";
  }
  return "Other";
}

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const [patientDetails, setPatientDetails] = useState(defaultReport.patientDetails);
  const [aiSummary, setAiSummary] = useState(defaultReport.aiSummary);
  const [biomarkers, setBiomarkers] = useState(defaultReport.biomarkers);
  const [guidanceInfo, setGuidanceInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("cards"); // "cards" | "graphs"
  const [reportId, setReportId] = useState(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Filtering & explainer states
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyAbnormal, setOnlyAbnormal] = useState(false);
  const [explainingBiomarker, setExplainingBiomarker] = useState(null);
  const [privacyMask, setPrivacyMask] = useState(() => {
    return localStorage.getItem("privacyMaskEnabled") === "true";
  });

  useEffect(() => {
    const handleMaskChange = () => {
      setPrivacyMask(localStorage.getItem("privacyMaskEnabled") === "true");
    };
    window.addEventListener("privacyMaskChanged", handleMaskChange);
    return () => window.removeEventListener("privacyMaskChanged", handleMaskChange);
  }, []);

  useEffect(() => {
    async function fetchReport() {
      // Query param ?id=... takes precedence, fallback to localStorage
      const queryId = searchParams.get("id");
      const storedId = queryId || localStorage.getItem("activeReportId");
      if (!storedId) return;

      setReportId(storedId);
      if (queryId) {
        localStorage.setItem("activeReportId", queryId);
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

        // Fetch proactive lifestyle guidance if available
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

  // Copy AI summary handler
  const handleCopySummary = () => {
    if (!aiSummary) return;
    navigator.clipboard.writeText(aiSummary);
    setCopiedSummary(true);
    toast.success("AI clinical summary copied to clipboard!");
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  // Biomarker metrics calculations
  const totalBiomarkers = biomarkers.length;
  const abnormalBiomarkers = biomarkers.filter((b) => b.status === "High" || b.status === "Low");
  const abnormalCount = abnormalBiomarkers.length;
  const normalCount = biomarkers.filter((b) => b.status === "Normal").length;
  const optimalRatio = totalBiomarkers > 0 ? Math.round((normalCount / totalBiomarkers) * 100) : 100;

  // Category counts computation for responsive filter pills
  const categoryCounts = useMemo(() => {
    const counts = { All: biomarkers.length };
    for (const cat of DASHBOARD_CATEGORIES) {
      if (cat === "All") continue;
      counts[cat] = biomarkers.filter((b) => {
        const c = b.category || inferCategoryFallback(b.name);
        return c.toLowerCase() === cat.toLowerCase();
      }).length;
    }
    return counts;
  }, [biomarkers]);

  // Filtered biomarkers based on category, search, and abnormal toggle
  const filteredBiomarkers = useMemo(() => {
    return biomarkers.filter((b) => {
      // 1. Abnormal Only Filter
      if (onlyAbnormal && b.status !== "High" && b.status !== "Low") {
        return false;
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = b.name?.toLowerCase().includes(q);
        const cat = (b.category || inferCategoryFallback(b.name)).toLowerCase();
        const catMatch = cat.includes(q);
        const valMatch = String(b.value).toLowerCase().includes(q);
        if (!nameMatch && !catMatch && !valMatch) return false;
      }

      // 3. Category Filter
      if (selectedCategory && selectedCategory !== "All") {
        const cat = b.category || inferCategoryFallback(b.name);
        if (cat.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [biomarkers, selectedCategory, searchQuery, onlyAbnormal]);

  return (
    <div className="min-h-screen bg-slate-50 mesh-gradient-bg pb-20">
      {/* Ambient Glow Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl animate-pulse-glow" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-teal-400/10 blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      <main className="relative mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* Top Header Banner */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end border-b border-slate-200/80 pb-6">
          <div>
            <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50/80 px-3.5 py-1 text-xs font-bold text-blue-700 shadow-2xs backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
              <span>Diagnostic Intelligence & Analysis</span>
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Health Overview & Analytics
            </h2>

            <p className="mt-2 text-sm text-slate-500 max-w-2xl leading-relaxed">
              Multi-parameter clinical analysis comparing your biomarkers directly against lab-stated reference corridors, with interactive medical definitions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/compare"
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition"
            >
              <BarChart2 className="h-4 w-4 text-blue-600" />
              Compare Reports
            </Link>

            <Link
              to="/chat"
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition"
            >
              <MessageSquare className="h-4 w-4" />
              Ask AI Assistant
            </Link>
          </div>
        </div>

        {/* ========================================= */}
        {/* EXECUTIVE HEALTH METRICS STRIP (OG CARDS) */}
        {/* ========================================= */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Markers */}
          <div className="group rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-xs backdrop-blur-md transition-all duration-300 hover-lift">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Biomarkers</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100/60">
                <Layers className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-heading text-3xl font-black text-slate-900">{totalBiomarkers}</span>
              <span className="text-xs font-semibold text-slate-500">tests extracted</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Full panel evaluated</span>
            </div>
          </div>

          {/* Card 2: Optimal Ratio */}
          <div className="group rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-xs backdrop-blur-md transition-all duration-300 hover-lift">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Optimal Range</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 border border-teal-100/60">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-heading text-3xl font-black text-teal-700">{optimalRatio}%</span>
              <span className="text-xs font-semibold text-slate-500">within reference</span>
            </div>
            <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-500 transition-all duration-700"
                style={{ width: `${optimalRatio}%` }}
              />
            </div>
          </div>

          {/* Card 3: Attention Needed */}
          <div className={`group rounded-3xl border p-5 shadow-xs backdrop-blur-md transition-all duration-300 hover-lift ${
            abnormalCount > 0 
              ? "border-amber-200/90 bg-gradient-to-br from-amber-50/40 via-white to-rose-50/20" 
              : "border-slate-200/80 bg-white/90"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Attention Needed</span>
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                abnormalCount > 0 ? "bg-amber-100 text-amber-700" : "bg-teal-50 text-teal-600"
              }`}>
                {abnormalCount > 0 ? <AlertCircle className="h-5 w-5 animate-bounce" /> : <CheckCircle2 className="h-5 w-5" />}
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`font-heading text-3xl font-black ${abnormalCount > 0 ? "text-amber-700" : "text-teal-700"}`}>
                {abnormalCount}
              </span>
              <span className="text-xs font-semibold text-slate-500">out of range</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs font-bold">
              {abnormalCount > 0 ? (
                <span className="text-amber-700">Requires lifestyle or doctor review</span>
              ) : (
                <span className="text-teal-600">All markers in healthy range</span>
              )}
            </div>
          </div>

          {/* Card 4: Patient & Report File */}
          <div className="group rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-xs backdrop-blur-md transition-all duration-300 hover-lift">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Patient File</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/60">
                <User className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-heading text-lg font-black text-slate-900 truncate max-w-[170px]" title={patientDetails.name}>
                {privacyMask ? "••••••••" : (patientDetails.name || "Anonymous Patient")}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-400">
              <span>{patientDetails.reportDate || "Recent Lab Date"}</span>
              <span className="font-bold text-slate-700">{patientDetails.age ? `${patientDetails.age} Yrs` : "Adult"}</span>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* PATIENT METADATA SECTION */}
        {/* ========================================= */}
        <section className="mb-8 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-xs backdrop-blur-md">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100/60">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Patient Profile & Metadata</h3>
                <p className="text-xs text-slate-400">Extracted and verified from laboratory headers</p>
              </div>
            </div>

            {abnormalCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200/80 shadow-2xs">
                <AlertCircle className="h-3.5 w-3.5" />
                {abnormalCount} Metric{abnormalCount > 1 ? "s" : ""} Outside Standard Bounds
              </span>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <PatientDetail
              label="Patient Name"
              value={patientDetails.name || "—"}
              isSensitive={true}
              icon={<User className="h-3.5 w-3.5 text-blue-600" />}
            />

            <PatientDetail
              label="Age"
              value={patientDetails.age ? `${patientDetails.age} Years` : "—"}
              isSensitive={false}
              icon={<Calendar className="h-3.5 w-3.5 text-teal-600" />}
            />

            <PatientDetail
              label="Gender"
              value={patientDetails.gender || "—"}
              isSensitive={false}
              icon={<User className="h-3.5 w-3.5 text-indigo-600" />}
            />

            <PatientDetail
              label="Specimen / Test Date"
              value={patientDetails.reportDate || "—"}
              isSensitive={false}
              icon={<Calendar className="h-3.5 w-3.5 text-blue-600" />}
            />
          </div>
        </section>

        {/* ========================================= */}
        {/* AI CLINICAL EXPLANATION & SUMMARY CARD */}
        {/* ========================================= */}
        <section className="mb-8 rounded-3xl border border-blue-200/70 bg-gradient-to-br from-blue-50/90 via-white to-teal-50/50 p-6 shadow-sm backdrop-blur-md">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                <HeartPulse className="h-6 w-6 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-lg font-black text-slate-900">
                    AI Clinical Synthesis & Key Findings
                  </h3>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-700">
                    Gemini RAG
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-500">
                  Synthesized in plain, non-technical language for high clarity
                </p>
              </div>
            </div>

            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/90 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs self-start sm:self-auto"
            >
              {copiedSummary ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
              <span>{copiedSummary ? "Copied" : "Copy Summary"}</span>
            </button>
          </div>

          <div className="rounded-2xl border border-white/80 bg-white/95 p-5 shadow-xs">
            <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line font-medium">
              {aiSummary}
            </p>

            <div className="mt-4 flex items-start gap-3 rounded-xl bg-blue-50/70 p-3.5 border border-blue-100/80">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <p className="text-[11px] leading-5 text-slate-600">
                <strong>Safety Notice:</strong> This summary provides educational health literacy based on your uploaded laboratory figures. It is not an automated medical diagnosis and should always be reviewed with your primary physician.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================= */}
        {/* PROACTIVE HEALTH & LIFESTYLE GUIDANCE */}
        {/* ========================================= */}
        {abnormalCount > 0 && (
          <section className="mb-8 rounded-3xl border border-amber-200/80 bg-gradient-to-r from-amber-50/60 via-white to-teal-50/40 p-6 shadow-xs backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 border border-amber-200/60">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-extrabold text-slate-900">
                    Proactive Health & Everyday Lifestyle Considerations
                  </h3>
                  <p className="text-xs text-slate-500">
                    Evidence-informed considerations for detected out-of-range biomarkers
                  </p>
                </div>
              </div>

              <Link
                to="/chat"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 group"
              >
                <span>Ask AI Guide about these</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
              {abnormalBiomarkers.map((b, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs hover-lift">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-sm text-slate-900">{b.name}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                      b.status === "High" ? "bg-rose-50 text-rose-700 border border-rose-200/60" : "bg-amber-50 text-amber-700 border border-amber-200/60"
                    }`}>
                      {b.status === "High" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {b.status} ({b.value} {b.unit})
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    Standard lab corridor: <span className="font-semibold text-slate-700">{b.range?.rawText || `${b.range?.min || "—"} - ${b.range?.max || "—"}`} {b.unit}</span>
                  </p>
                  <Link
                    to="/chat"
                    onClick={() => {
                      localStorage.setItem("pendingChatPrompt", `Why is my ${b.name} ${b.status.toLowerCase()} (${b.value} ${b.unit}), and what everyday habits or diet factors can support it?`);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                    <span>Explore lifestyle habits for {b.name}</span>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================= */}
        {/* BIOMARKER OVERVIEW & CONTROLS TOOLBAR */}
        {/* ========================================= */}
        <section>
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-heading text-2xl font-black text-slate-900">
                  Biomarker Panel ({filteredBiomarkers.length} of {biomarkers.length})
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                  Click <span className="font-bold text-blue-600">Explain Term</span> on any biomarker to read non-diagnostic medical definitions and citations.
                </p>
              </div>

              {/* View Switcher: Cards vs Gauges */}
              <div className="flex items-center rounded-2xl bg-slate-200/70 p-1 border border-slate-200/60 self-start sm:self-auto">
                <button
                  onClick={() => setActiveTab("cards")}
                  className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
                    activeTab === "cards"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Card Grid
                </button>
                <button
                  onClick={() => setActiveTab("graphs")}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
                    activeTab === "graphs"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <BarChart2 className="h-3.5 w-3.5 text-blue-600" />
                  <span>Range Gauges</span>
                </button>
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search biomarker (e.g. Hemoglobin, Glucose, ALT)..."
                  className="w-full rounded-2xl border border-slate-200/90 bg-white/90 pl-10 pr-9 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-2xs transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Abnormal Only Quick Toggle */}
              <button
                onClick={() => setOnlyAbnormal(!onlyAbnormal)}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all duration-200 ${
                  onlyAbnormal
                    ? "bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20"
                    : "bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 shadow-2xs"
                }`}
              >
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Out of Range Only ({abnormalCount})</span>
              </button>
            </div>

            {/* Category Filter Pills with Dynamic Counts */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {DASHBOARD_CATEGORIES.map((cat) => {
                const count = categoryCounts[cat] || 0;
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center gap-1.5 rounded-2xl px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all duration-200 shadow-2xs ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]"
                        : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Biomarkers Rendering: Cards or Range Graphs */}
          {filteredBiomarkers.length === 0 ? (
            <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-12 text-center shadow-xs">
              <Layers className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-base font-extrabold text-slate-800">No biomarkers matched your filters</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Try clearing your search query, unchecking the out-of-range filter, or selecting a different category.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                  setOnlyAbnormal(false);
                }}
                className="mt-5 rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : activeTab === "cards" ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBiomarkers.map((biomarker, index) => (
                <BiomarkerCard
                  key={biomarker._id || biomarker.name || index}
                  name={biomarker.name}
                  category={biomarker.category || inferCategoryFallback(biomarker.name)}
                  value={biomarker.value}
                  unit={biomarker.unit}
                  range={biomarker.range}
                  status={biomarker.status}
                  comparisionText={biomarker.comparisonText}
                  uncertainFlag={biomarker.uncertainFlag}
                  onExplain={(marker) => setExplainingBiomarker(marker)}
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {filteredBiomarkers.map((biomarker, index) => (
                <RangeGraph
                  key={biomarker._id || biomarker.name || index}
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