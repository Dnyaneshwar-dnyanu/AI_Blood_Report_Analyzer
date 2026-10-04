import React from "react";
import { CheckCircle2, AlertCircle, TrendingUp, TrendingDown, BookOpen, Sparkles, HelpCircle } from "lucide-react";

function BiomarkerCard({
  name,
  category,
  value,
  unit,
  range,
  status,
  comparisionText,
  uncertainFlag,
  onExplain
}) {
  const isHigh = status === "High";
  const isLow = status === "Low";
  const isNormal = status === "Normal";
  const isAbnormal = isHigh || isLow;

  const minNum = parseFloat(range?.min);
  const maxNum = parseFloat(range?.max);
  const valNum = parseFloat(value);

  // Calculate percentage within reference range for visual gauge (0% to 100%)
  let percent = 50;
  if (!isNaN(valNum) && !isNaN(minNum) && !isNaN(maxNum) && maxNum > minNum) {
    percent = Math.max(5, Math.min(95, ((valNum - minNum) / (maxNum - minNum)) * 100));
  } else if (isHigh) {
    percent = 92;
  } else if (isLow) {
    percent = 8;
  }

  // Category Color Accent
  const getCategoryColor = (cat = "") => {
    const c = cat.toLowerCase();
    if (c.includes("cbc") || c.includes("blood")) return "bg-rose-50 text-rose-700 border-rose-200/60";
    if (c.includes("lipid") || c.includes("cholesterol")) return "bg-purple-50 text-purple-700 border-purple-200/60";
    if (c.includes("metabolic") || c.includes("sugar")) return "bg-blue-50 text-blue-700 border-blue-200/60";
    if (c.includes("kidney") || c.includes("renal")) return "bg-indigo-50 text-indigo-700 border-indigo-200/60";
    if (c.includes("liver") || c.includes("hepatic")) return "bg-amber-50 text-amber-700 border-amber-200/60";
    if (c.includes("thyroid")) return "bg-teal-50 text-teal-700 border-teal-200/60";
    if (c.includes("vitamin") || c.includes("mineral")) return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-3xl border p-5 transition-all duration-300 hover-lift bg-white shadow-xs ${
        isHigh
          ? "border-rose-200/80 hover:border-rose-400 bg-gradient-to-b from-rose-50/20 to-white"
          : isLow
          ? "border-amber-200/80 hover:border-amber-400 bg-gradient-to-b from-amber-50/20 to-white"
          : "border-slate-200/80 hover:border-blue-300 hover:shadow-md"
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {category && (
              <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${getCategoryColor(category)}`}>
                {category}
              </span>
            )}
            {uncertainFlag && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">
                <HelpCircle className="h-3 w-3 text-amber-600" />
                Uncertain
              </span>
            )}
          </div>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border transition-all ${
              isHigh
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : isLow
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-teal-200 bg-teal-50 text-teal-700"
            }`}
          >
            {isHigh ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <TrendingUp className="h-3.5 w-3.5" />
                High
              </>
            ) : isLow ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <TrendingDown className="h-3.5 w-3.5" />
                Low
              </>
            ) : (
              <>
                <span className="inline-block h-2 w-2 rounded-full bg-teal-500"></span>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Normal
              </>
            )}
          </span>
        </div>

        {/* Biomarker Name */}
        <h4 className="text-base font-extrabold text-slate-900 tracking-tight line-clamp-1 group-hover:text-blue-600 transition-colors" title={name}>
          {name}
        </h4>

        {/* Numeric Value & Unit */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-heading text-3xl font-black tracking-tight text-slate-900">
            {value}
          </span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            {unit}
          </span>
        </div>
      </div>

      {/* Visual Corridor Bar */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="flex justify-between items-center text-[11px] mb-1.5 font-medium text-slate-400">
          <span>Min: {range?.min || "—"}</span>
          <span className="font-semibold text-slate-600">
            Target ({range?.min || "—"} - {range?.max || "—"})
          </span>
          <span>Max: {range?.max || "—"}</span>
        </div>

        {/* Visual Gauge Track */}
        <div className="relative h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
          {/* Target Safe Zone in center */}
          <div className="absolute inset-y-0 left-[25%] right-[25%] bg-teal-200/50 rounded-sm" />
          
          {/* Indicator fill */}
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isHigh
                ? "bg-gradient-to-r from-teal-400 via-amber-400 to-rose-500"
                : isLow
                ? "bg-gradient-to-r from-amber-400 to-teal-400"
                : "bg-gradient-to-r from-teal-300 to-teal-500"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Raw Reference text if available */}
        {range?.rawText && (
          <p className="mt-1.5 text-[10px] text-slate-400 line-clamp-1" title={range.rawText}>
            Lab Ref: {range.rawText}
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={() =>
            onExplain &&
            onExplain({
              name,
              category,
              value,
              unit,
              range,
              status
            })
          }
          className="group/btn inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/70 hover:text-blue-700 transition-all duration-200 shadow-2xs"
        >
          <Sparkles className="h-3.5 w-3.5 text-blue-500 group-hover/btn:rotate-12 transition-transform" />
          <span>Explain Term</span>
        </button>

        {isAbnormal ? (
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200/50">
            Out of range
          </span>
        ) : (
          <span className="text-[11px] font-semibold text-slate-400">
            Optimal
          </span>
        )}
      </div>
    </div>
  );
}

export default BiomarkerCard;