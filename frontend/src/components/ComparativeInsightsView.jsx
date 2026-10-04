import React, { useState } from "react";
import {
  Sparkles,
  HeartPulse,
  HelpCircle,
  ShieldCheck,
  Copy,
  Check,
  TrendingUp,
  AlertCircle,
  FileQuestion,
  Droplet
} from "lucide-react";
import { toast } from "react-toastify";

export default function ComparativeInsightsView({ insights, loading }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("narrative"); // narrative | factors | doctor

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center animate-pulse space-y-3">
        <Sparkles className="h-6 w-6 text-blue-500 mx-auto animate-spin" />
        <p className="text-sm font-semibold text-slate-700">
          Synthesizing longitudinal AI report insights...
        </p>
        <p className="text-xs text-slate-400">
          Comparing historical biomarker shifts against medical reference guides
        </p>
      </div>
    );
  }

  if (!insights) return null;

  const handleCopyQuestions = () => {
    if (!insights.doctorDiscussionQuestions) return;
    const text = insights.doctorDiscussionQuestions
      .map((q, idx) => `${idx + 1}. ${q}`)
      .join("\n");
    navigator.clipboard.writeText(
      `Blood Report Questions for My Doctor:\n\n${text}`
    );
    setCopied(true);
    toast.success("Questions copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/70 via-white to-teal-50/40 p-6 shadow-sm">
      {/* Header and Tab Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/70">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-bold text-blue-700 mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            AI Trajectory Synthesis & Health Guidance
          </div>
          <h3 className="text-xl font-black text-slate-900">
            Longitudinal Health Insights & Considerations
          </h3>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center rounded-xl bg-slate-200/70 p-1 self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab("narrative")}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeTab === "narrative"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("factors")}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeTab === "factors"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Everyday Factors
          </button>
          <button
            onClick={() => setActiveTab("doctor")}
            className={`rounded-lg px-3 py-1.5 transition flex items-center gap-1 ${
              activeTab === "doctor"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5 text-blue-600" />
            Doctor Questions ({insights.doctorDiscussionQuestions?.length || 0})
          </button>
        </div>
      </div>

      {/* Tab 1: Narrative & Progressions */}
      {activeTab === "narrative" && (
        <div className="mt-5 space-y-5">
          <div className="rounded-2xl border border-white bg-white/90 p-5 shadow-xs">
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {insights.narrative}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Key Progressions */}
            {insights.keyProgressions && insights.keyProgressions.length > 0 && (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  Positive or Stabilized Metrics
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {insights.keyProgressions.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Areas to Observe */}
            {insights.areasToObserve && insights.areasToObserve.length > 0 && (
              <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
                <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5 mb-2">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                  Notable Movements to Observe
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {insights.areasToObserve.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Everyday & Physiological Factors */}
      {activeTab === "factors" && (
        <div className="mt-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Droplet className="h-4 w-4 text-blue-500" />
              Evidence-Grounded Physiological Considerations
            </h4>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Biomarkers fluctuate naturally based on routine biological variables. These everyday factors commonly influence blood measurements:
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {insights.everydayFactors?.map((factor, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 flex items-start gap-2.5 text-xs text-slate-700"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">
                    {idx + 1}
                  </span>
                  <span className="font-medium leading-relaxed">{factor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Doctor Discussion Questions Checklist */}
      {activeTab === "doctor" && (
        <div className="mt-5 space-y-4">
          <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <FileQuestion className="h-4 w-4 text-indigo-600" />
                  Tailored Questions for Your Next Medical Consultation
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Use these personalized questions to have an informative, empowering discussion with your doctor.
                </p>
              </div>

              <button
                onClick={handleCopyQuestions}
                className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition shadow-2xs"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Questions</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-2.5">
              {insights.doctorDiscussionQuestions?.map((q, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 flex items-start gap-3 transition hover:bg-white hover:border-indigo-200 hover:shadow-2xs"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-xs font-black text-white">
                    {idx + 1}
                  </span>
                  <p className="text-xs font-semibold text-slate-800 leading-relaxed pt-0.5">
                    {q}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Medical Safety Disclaimer Callout */}
      <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-blue-50/80 p-3.5 border border-blue-100/70 text-[11px] text-slate-600">
        <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <span>
          <strong>Strictly Educational Awareness:</strong> These comparative insights and questions are synthesized to assist your personal health literacy. They are not medical diagnoses, prognoses, or treatment prescriptions. Always consult your personal physician regarding test changes.
        </span>
      </div>
    </div>
  );
}
