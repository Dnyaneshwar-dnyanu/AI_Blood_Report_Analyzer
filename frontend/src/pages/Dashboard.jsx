import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  TrendingDown
} from "lucide-react";
import PatientDetail from "../components/PatientDetail";
import BiomarkerCard from "../components/BiomarkerCard";
import RangeGraph from "../components/RangeGraph";
import defaultReport from "../data/defaultReport";
import api from "../api/axios";

export default function Dashboard() {
  const [patientDetails, setPatientDetails] = useState(defaultReport.patientDetails);
  const [aiSummary, setAiSummary] = useState(defaultReport.aiSummary);
  const [biomarkers, setBiomarkers] = useState(defaultReport.biomarkers);
  const [guidanceInfo, setGuidanceInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("cards"); // "cards" | "graphs"
  const [reportId, setReportId] = useState(null);

  useEffect(() => {
    async function fetchReport() {
      const storedId = localStorage.getItem('activeReportId');
      if (!storedId) return;

      setReportId(storedId);

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
  }, []);

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

        {/* Biomarker Overview & Range Graph Toggle */}
        <section>

          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Biomarker Analysis ({biomarkers.length})
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Detailed comparison against clinical reference ranges.
              </p>
            </div>

            <div className="flex items-center rounded-xl bg-slate-200/60 p-1 self-start sm:self-auto">
              <button
                onClick={() => setActiveTab("cards")}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
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
                className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                  activeTab === "graphs"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <BarChart2 className="h-3.5 w-3.5 text-blue-600" />
                Range Graphs
              </button>
            </div>
          </div>


          {/* Render Cards or Graphs */}
          {activeTab === "cards" ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {biomarkers.map((biomarker, index) => (
                <BiomarkerCard
                  key={index}
                  name={biomarker.name}
                  value={biomarker.value}
                  unit={biomarker.unit}
                  range={biomarker.range}
                  status={biomarker.status}
                  comparisionText={biomarker.comparisonText}
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
    </div>
  );
}