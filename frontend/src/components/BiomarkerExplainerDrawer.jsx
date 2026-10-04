import React, { useEffect, useState } from "react";
import {
  X,
  BookOpen,
  Sparkles,
  HeartPulse,
  TrendingUp,
  TrendingDown,
  HelpCircle,
  ShieldAlert,
  FileText,
  ExternalLink,
  Loader2,
  CheckCircle2
} from "lucide-react";
import api from "../api/axios";

export default function BiomarkerExplainerDrawer({
  isOpen,
  onClose,
  biomarker
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !biomarker) {
      setData(null);
      setError(null);
      return;
    }

    let isMounted = true;
    const fetchExplanation = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(
          `/api/chat/explain/${encodeURIComponent(biomarker.name)}`
        );
        if (isMounted) {
          if (res.data.success) {
            setData(res.data.data);
          } else {
            throw new Error(res.data.message || "Failed to load explanation.");
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Explainer fetch error:", err);
          setError(
            err.userMessage ||
              "Could not retrieve full medical context at this time."
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchExplanation();

    return () => {
      isMounted = false;
    };
  }, [isOpen, biomarker]);

  if (!isOpen || !biomarker) return null;

  const isHigh = biomarker.status === "High";
  const isLow = biomarker.status === "Low";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-l border-slate-200">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-blue-50/70 via-white to-teal-50/40 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    {biomarker.category || "Biomarker Insight"}
                  </span>
                  {biomarker.status && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        isHigh
                          ? "bg-rose-100 text-rose-700"
                          : isLow
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {biomarker.status} ({biomarker.value} {biomarker.unit})
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  {biomarker.name}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              aria-label="Close explainer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Reference Bracket Callout */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 font-medium">Your Reported Result:</span>
                <p className="font-extrabold text-slate-900 text-sm mt-0.5">
                  {biomarker.value} {biomarker.unit}
                </p>
              </div>
              <div className="text-right">
                <span className="text-slate-500 font-medium">Standard Reference Range:</span>
                <p className="font-semibold text-slate-700 mt-0.5">
                  {biomarker.range?.rawText ||
                    `${biomarker.range?.min || "—"} - ${biomarker.range?.max || "—"} ${biomarker.unit || ""}`}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">
                  Retrieving medical literature & RAG analysis...
                </p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Searching verified clinical guides for {biomarker.name}
                </p>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
                <ShieldAlert className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-amber-900">{error}</p>
                <p className="text-xs text-amber-700 mt-1">
                  You can also ask our AI Assistant on the Chat page.
                </p>
              </div>
            ) : data ? (
              <>
                {/* 1. Overview & Biological Role */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                    Medical Overview
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700 bg-blue-50/40 p-4 rounded-xl border border-blue-100/60">
                    {data.summary}
                  </p>
                  <div className="rounded-xl border border-slate-200 p-4 bg-white shadow-2xs">
                    <h4 className="text-xs font-bold text-slate-800 mb-1">
                      Function in the Body
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {data.functionInBody}
                    </p>
                  </div>
                </section>

                {/* 2. Factors that May Influence Levels */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <HeartPulse className="h-3.5 w-3.5 text-teal-600" />
                    Everyday & Physiological Factors
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Elevated */}
                    <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-3.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 mb-2">
                        <TrendingUp className="h-3.5 w-3.5" />
                        Factors Associated with Higher Levels
                      </div>
                      <ul className="space-y-1.5 text-[11px] text-slate-600 list-disc list-inside">
                        {data.highFactors?.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Lower */}
                    <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 mb-2">
                        <TrendingDown className="h-3.5 w-3.5" />
                        Factors Associated with Lower Levels
                      </div>
                      <ul className="space-y-1.5 text-[11px] text-slate-600 list-disc list-inside">
                        {data.lowFactors?.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 3. Supportive Everyday Habits */}
                {data.supportiveHabits && data.supportiveHabits.length > 0 && (
                  <section className="rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50/50 to-white p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-teal-800 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-600" />
                      Everyday Supportive Habits
                    </div>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {data.supportiveHabits.map((habit, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                          <span>{habit}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* 4. Questions for Your Healthcare Provider */}
                {data.doctorQuestions && data.doctorQuestions.length > 0 && (
                  <section className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 mb-2">
                      <HelpCircle className="h-4 w-4 text-indigo-600" />
                      Suggested Questions to Ask Your Doctor
                    </div>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {data.doctorQuestions.map((q, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-indigo-100/50">
                          <span className="font-bold text-indigo-600 text-xs">Q:</span>
                          <span className="font-medium text-slate-800">{q}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* 5. Verified Medical Citations */}
                {data.sources && data.sources.length > 0 && (
                  <section className="space-y-2 pt-2 border-t border-slate-200/60">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-blue-600" />
                        Grounded Medical Literature Citations ({data.sources.length})
                      </span>
                    </div>

                    <div className="space-y-2">
                      {data.sources.map((s, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-slate-200/80 bg-slate-50/80 p-2.5 text-left"
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                            <span>{s.fileName}</span>
                            <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                              {s.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed italic">
                            "{s.snippet}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            ) : null}
          </div>

          {/* Footer Disclaimer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              <strong>Educational Awareness Only:</strong> This information is synthesized from trusted medical reference guides. It does not provide clinical diagnoses or replace evaluation with your personal physician.
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
