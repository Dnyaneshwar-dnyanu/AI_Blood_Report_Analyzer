import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Upload,
  BarChart2,
  Sparkles,
  GitCompare,
  FolderClock,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Layers,
  Activity,
  Lock,
  BookOpen,
  FileText,
  HeartPulse,
  EyeOff,
  Cpu,
  HelpCircle,
  ChevronRight
} from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const [activePreviewTab, setActivePreviewTab] = useState("gauges"); // "gauges" | "trends" | "explainer"

  return (
    <div className="relative min-h-screen bg-slate-50 mesh-gradient-bg pb-24 overflow-hidden">
      {/* Ambient Glow Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[550px] w-[550px] rounded-full bg-blue-500/10 blur-[130px] animate-pulse-glow" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-teal-400/10 blur-[140px] animate-pulse-glow" style={{ animationDelay: "2.5s" }} />
        <div className="absolute -bottom-40 left-10 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse-glow" style={{ animationDelay: "4s" }} />
      </div>

      {/* ========================================================================= */}
      {/* HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24">
        <div className="mx-auto max-w-4xl text-center">
          
          {/* Announcement Pill */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-blue-200/80 bg-blue-50/90 px-4 py-1.5 text-xs font-bold text-blue-700 shadow-2xs backdrop-blur-md mb-6 hover:bg-blue-100/80 transition cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            <span className="font-extrabold tracking-wide uppercase text-[10px] bg-blue-200/60 px-2 py-0.5 rounded-full text-blue-800">
              BloodLens 2.0
            </span>
            <span>Intelligent Biomarker Analytics & Trajectory Engine</span>
            <ChevronRight className="h-3.5 w-3.5 text-blue-500" />
          </div>

          {/* Main Headline */}
          <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.08]">
            Decode Your Blood Work. <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent">
              Track Your Health Trajectory.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Transform confusing lab sheets and camera scans into clear visual metrics, trading-style trend graphs, and evidence-grounded health literacy backed by Google Gemini and medical research.
          </p>

          {/* CTA Buttons */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/upload"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-8 py-4 text-sm font-extrabold text-white shadow-xl shadow-blue-500/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-blue-500/35 active:scale-[0.98]"
            >
              <Upload className="h-4 w-4" />
              <span>Analyze Your Report</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md px-7 py-4 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900"
            >
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>Explore Demo Dashboard</span>
            </Link>

            <Link
              to="/compare"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md px-6 py-4 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:bg-slate-50 hover:text-slate-900"
            >
              <GitCompare className="h-4 w-4 text-teal-600" />
              <span>Compare Reports</span>
            </Link>
          </div>

          {/* Key Assurance Badges Strip */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-2xs">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              <span>HIPAA-Ready PII Masking</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-2xs">
              <Cpu className="h-4 w-4 text-blue-600" />
              <span>Dual OCR + PDF Ingestion</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-2xs">
              <BarChart2 className="h-4 w-4 text-indigo-600" />
              <span>Trading-Style Longitudinal Trends</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-2xs">
              <BookOpen className="h-4 w-4 text-purple-600" />
              <span>Curated Medical Literature RAG</span>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE PRODUCT PREVIEW COCKPIT (HERO MOCKUP) */}
        {/* ========================================================================= */}
        <div className="mt-14 mx-auto max-w-5xl rounded-3xl border border-slate-200/90 bg-white/90 p-4 sm:p-7 shadow-2xl shadow-blue-500/10 backdrop-blur-xl">
          
          {/* Mock Window Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-rose-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-teal-400" />
              </div>
              <span className="text-xs font-bold text-slate-400">
                BloodLens Intelligence Console
              </span>
            </div>

            {/* Interactive Preview Tabs */}
            <div className="flex items-center gap-1 rounded-2xl bg-slate-100/80 p-1 border border-slate-200/60 self-start sm:self-auto">
              <button
                onClick={() => setActivePreviewTab("gauges")}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  activePreviewTab === "gauges"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Range Corridors
              </button>
              <button
                onClick={() => setActivePreviewTab("trends")}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  activePreviewTab === "trends"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Trajectory Graph
              </button>
              <button
                onClick={() => setActivePreviewTab("explainer")}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  activePreviewTab === "explainer"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                RAG Term Explainer
              </button>
            </div>
          </div>

          {/* Tab 1: Range Corridors Preview */}
          {activePreviewTab === "gauges" && (
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {/* Card 1: Normal Hemoglobin */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover-lift">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200/60">
                    CBC Panel
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                    <CheckCircle2 className="h-3 w-3" /> Normal
                  </span>
                </div>
                <h4 className="font-extrabold text-slate-800 text-sm">Hemoglobin</h4>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="font-heading text-3xl font-black text-slate-900">14.2</span>
                  <span className="text-xs font-semibold text-slate-400">g/dL</span>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>12.0</span>
                    <span className="text-teal-700 font-bold">Target Zone</span>
                    <span>16.5</span>
                  </div>
                  <div className="relative h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="absolute inset-y-0 left-[20%] right-[20%] bg-teal-200/60" />
                    <div className="h-full rounded-full bg-teal-500" style={{ width: "55%" }} />
                  </div>
                </div>
              </div>

              {/* Card 2: Normal Fasting Glucose */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover-lift">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                    Metabolic
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                    <CheckCircle2 className="h-3 w-3" /> Normal
                  </span>
                </div>
                <h4 className="font-extrabold text-slate-800 text-sm">Fasting Blood Sugar</h4>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="font-heading text-3xl font-black text-slate-900">92</span>
                  <span className="text-xs font-semibold text-slate-400">mg/dL</span>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>70</span>
                    <span className="text-teal-700 font-bold">Optimal</span>
                    <span>99</span>
                  </div>
                  <div className="relative h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="absolute inset-y-0 left-[20%] right-[20%] bg-teal-200/60" />
                    <div className="h-full rounded-full bg-teal-500" style={{ width: "68%" }} />
                  </div>
                </div>
              </div>

              {/* Card 3: Vitamin D3 Low */}
              <div className="rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50/20 to-white p-5 shadow-xs hover-lift">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                    Vitamins
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    <TrendingDown className="h-3 w-3" /> Low
                  </span>
                </div>
                <h4 className="font-extrabold text-slate-800 text-sm">Vitamin D (25-OH)</h4>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="font-heading text-3xl font-black text-slate-900">18.4</span>
                  <span className="text-xs font-semibold text-slate-400">ng/mL</span>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>30</span>
                    <span className="text-slate-500 font-semibold">Corridor</span>
                    <span>100</span>
                  </div>
                  <div className="relative h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="absolute inset-y-0 left-[25%] right-[10%] bg-teal-200/50" />
                    <div className="h-full rounded-full bg-amber-400" style={{ width: "16%" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Trajectory Trends Preview */}
          {activePreviewTab === "trends" && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-slate-900 text-base">Hemoglobin Longitudinal Timeline</h4>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                      +1.4 g/dL (+10.9%)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Reference Corridor: 12.0 – 16.5 g/dL</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span>Upward Recovery Trend</span>
                </div>
              </div>

              {/* Mock Recharts Graph */}
              <div className="relative h-44 w-full rounded-xl bg-slate-50/70 p-4 border border-slate-100 flex flex-col justify-between overflow-hidden">
                {/* Shaded Reference Corridor */}
                <div className="absolute inset-x-0 top-[20%] bottom-[25%] bg-teal-100/40 border-y border-teal-200/40 pointer-events-none" />
                <span className="absolute right-3 top-[22%] text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                  Target Corridor (12.0 - 16.5)
                </span>

                {/* SVG Mock Curve */}
                <svg className="w-full h-full" viewBox="0 0 600 120" preserveAspectRatio="none">
                  <path
                    d="M 50 90 Q 250 50 350 40 T 550 25"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Data Points */}
                  <circle cx="50" cy="90" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
                  <circle cx="350" cy="40" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
                  <circle cx="550" cy="25" r="5" fill="#0d9488" stroke="#ffffff" strokeWidth="2.5" />
                </svg>

                {/* Timeline Axis Labels */}
                <div className="flex justify-between text-xs font-semibold text-slate-500 pt-2 border-t border-slate-200/80">
                  <span>15 May 2024 (12.8 g/dL)</span>
                  <span>10 Nov 2024 (13.6 g/dL)</span>
                  <span className="font-bold text-slate-900">04 Oct 2025 (14.2 g/dL)</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: RAG Explainer Preview */}
          {activePreviewTab === "explainer" && (
            <div className="mt-6 rounded-2xl border border-blue-100 bg-linear-to-br from-blue-50/60 via-white to-teal-50/40 p-6 shadow-xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">What is Serum Ferritin?</h4>
                  <p className="text-xs text-slate-500">RAG Term Retrieval • Verified Clinical Literature</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white/90 p-4 rounded-xl border border-slate-100">
                <strong>Ferritin</strong> is an intracellular protein that stores iron and releases it in a controlled fashion. While serum iron measures the iron currently circulating in your bloodstream, ferritin reflects your body's total iron reserves. A low ferritin result typically signals depleted iron stores well before complete anemia develops.
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 text-slate-500">
                  <FileText className="h-3.5 w-3.5 text-blue-500" />
                  Source: NIH Clinical Biochemistry & Complete Blood Count Guidelines
                </span>
                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Non-Diagnostic
                </span>
              </div>
            </div>
          )}

          {/* Mock Cockpit Footer Bar */}
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <span>Full Panel Evaluated • Multi-Format Extraction (PDF & OCR)</span>
            </div>
            <Link
              to="/upload"
              className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              <span>Try with your own report now</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* THE 5 CORE PILLARS FEATURE SHOWCASE */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 border-t border-slate-200/80">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3.5 py-1 text-xs font-bold text-teal-700 border border-teal-200/70 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
            End-to-End Medical Intelligence
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Built Around the 5 Pillars of Report Understanding
          </h2>
          <p className="mt-3 text-sm text-slate-500 leading-relaxed">
            From unreadable scanned documents to longitudinal trajectory graphs, BloodLens solves every challenge patients face when reviewing blood work.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          
          {/* Pillar 1 */}
          <div className="group rounded-3xl border border-slate-200/90 bg-white/95 p-7 shadow-xs backdrop-blur-md transition-all duration-300 hover-lift">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs mb-5 group-hover:scale-105 transition-transform">
              <Upload className="h-6 w-6" />
            </div>
            <div className="text-[11px] font-black uppercase tracking-wider text-blue-600 mb-1">Pillar 1</div>
            <h3 className="font-heading text-lg font-black text-slate-900 mb-2">
              Dual PDF & OCR Ingestion
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Upload laboratory digital PDFs or smartphone photos of printed reports. Our Scribe.js OCR and Gemini parser accurately extract biomarkers, units, and ranges.
            </p>
            <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600 border border-slate-100 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Uncertainty score review before saving</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="group rounded-3xl border border-slate-200/90 bg-white/95 p-7 shadow-xs backdrop-blur-md transition-all duration-300 hover-lift">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 shadow-2xs mb-5 group-hover:scale-105 transition-transform">
              <BarChart2 className="h-6 w-6" />
            </div>
            <div className="text-[11px] font-black uppercase tracking-wider text-teal-600 mb-1">Pillar 2</div>
            <h3 className="font-heading text-lg font-black text-slate-900 mb-2">
              Visual Reference Corridors
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Stop guessing what "14.2 g/dL" means. Our visual range meters display exact safe corridors with glowing status pills (**Normal**, **High**, **Low**).
            </p>
            <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600 border border-slate-100 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Immediate out-of-range filtering</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="group rounded-3xl border border-slate-200/90 bg-white/95 p-7 shadow-xs backdrop-blur-md transition-all duration-300 hover-lift">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs mb-5 group-hover:scale-105 transition-transform">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="text-[11px] font-black uppercase tracking-wider text-indigo-600 mb-1">Pillar 3</div>
            <h3 className="font-heading text-lg font-black text-slate-900 mb-2">
              Trading-Style Trend Charts
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Track biomarker evolution across test dates like financial market charts. Recharts-powered graphs show shaded target corridors and directional deltas.
            </p>
            <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600 border border-slate-100 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Side-by-side delta matrix & unit shift alerts</span>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="group rounded-3xl border border-slate-200/90 bg-white/95 p-7 shadow-xs backdrop-blur-md transition-all duration-300 hover-lift">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 shadow-2xs mb-5 group-hover:scale-105 transition-transform">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="text-[11px] font-black uppercase tracking-wider text-purple-600 mb-1">Pillar 4</div>
            <h3 className="font-heading text-lg font-black text-slate-900 mb-2">
              RAG Term Explainer Drawer
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Click any unfamiliar biomarker to slide open verified medical definitions, biological functions, and peer-reviewed literature citations.
            </p>
            <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600 border border-slate-100 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Direct references to medical guides</span>
            </div>
          </div>

          {/* Pillar 5 */}
          <div className="group rounded-3xl border border-slate-200/90 bg-white/95 p-7 shadow-xs backdrop-blur-md transition-all duration-300 hover-lift">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-100 shadow-2xs mb-5 group-hover:scale-105 transition-transform">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div className="text-[11px] font-black uppercase tracking-wider text-amber-700 mb-1">Pillar 5</div>
            <h3 className="font-heading text-lg font-black text-slate-900 mb-2">
              Everyday Factors & Doctor Notes
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Understand non-pathological influences (hydration, fasting state, stress, sleep) and copy a ready-to-use clinical checklist for your next doctor appointment.
            </p>
            <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600 border border-slate-100 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>One-click copyable consultation points</span>
            </div>
          </div>

          {/* Privacy & Vault */}
          <div className="group rounded-3xl border border-slate-200/90 bg-white/95 p-7 shadow-xs backdrop-blur-md transition-all duration-300 hover-lift">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-2xs mb-5 group-hover:scale-105 transition-transform">
              <Lock className="h-6 w-6" />
            </div>
            <div className="text-[11px] font-black uppercase tracking-wider text-emerald-600 mb-1">Privacy First</div>
            <h3 className="font-heading text-lg font-black text-slate-900 mb-2">
              Session Vault & PII Masking
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Instant on-screen PII obfuscation (`•••••••`) protects privacy in public spaces. Full cascade deletion removes files and chat logs on command.
            </p>
            <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600 border border-slate-100 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Guest session storage with zero data lock-in</span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3-STEP SEAMLESS WORKFLOW */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 border-t border-slate-200/80">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-heading text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How BloodLens Works
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            A frictionless three-step process from document upload to clinical clarity.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {/* Step 1 */}
          <div className="relative rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs hover-lift">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white font-black text-sm mb-4 shadow-md shadow-blue-500/20">
              01
            </div>
            <h3 className="font-heading text-base font-bold text-slate-900 mb-2">
              Drop Document
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Drag in your laboratory PDF or upload a scanned image. Our engine parses test dates, patient metadata, and biomarker tables automatically.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs hover-lift">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white font-black text-sm mb-4 shadow-md shadow-indigo-500/20">
              02
            </div>
            <h3 className="font-heading text-base font-bold text-slate-900 mb-2">
              Verify & Explore Dashboard
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Review any uncertain values in the interactive table, then explore your structured dashboard with reference meters and Gemini clinical synthesis.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs hover-lift">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-600 text-white font-black text-sm mb-4 shadow-md shadow-teal-500/20">
              03
            </div>
            <h3 className="font-heading text-base font-bold text-slate-900 mb-2">
              Compare & Consult
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Compare against previous reports to plot longitudinal trends, observe trading-style trajectories, and copy tailored talking points for your doctor.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FINAL BOTTOM CALL TO ACTION */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-10">
        <div className="relative overflow-hidden rounded-3xl border border-blue-200/80 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 p-8 sm:p-14 text-center text-white shadow-2xl shadow-blue-500/20">
          <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold text-white mb-5 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ready for Total Health Clarity?</span>
            </div>

            <h2 className="font-heading text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Start Understanding Your Blood Tests Today.
            </h2>

            <p className="mt-4 text-xs sm:text-sm text-blue-100 max-w-xl mx-auto leading-relaxed font-medium">
              Upload your report in seconds. No complex registration required to explore sample reports and interactive biomarker range corridors.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/upload"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-extrabold text-blue-700 shadow-lg hover:bg-blue-50 hover:scale-[1.02] transition"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Your Blood Report</span>
              </Link>

              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/40 bg-white/10 px-7 py-4 text-sm font-bold text-white hover:bg-white/20 transition backdrop-blur-md"
              >
                <span>View Sample Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
