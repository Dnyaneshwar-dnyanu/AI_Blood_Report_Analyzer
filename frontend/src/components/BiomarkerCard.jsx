import { CheckCircle2, AlertCircle, TrendingUp, TrendingDown, BookOpen } from "lucide-react";

function BiomarkerCard({
  name,
  category,
  value,
  unit,
  range,
  status,
  comparisionText,
  onExplain
}) {
  const isHigh = status === "High";
  const isLow = status === "Low";
  const isAbnormal = isHigh || isLow;

  const minNum = parseFloat(range?.min);
  const maxNum = parseFloat(range?.max);
  const valNum = parseFloat(value);

  let percent = 50;
  if (!isNaN(valNum) && !isNaN(minNum) && !isNaN(maxNum) && maxNum > minNum) {
    percent = Math.max(0, Math.min(100, ((valNum - minNum) / (maxNum - minNum)) * 100));
  }

  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-xs transition hover:shadow-md ${
        isHigh
          ? "border-red-200 bg-rose-50/10"
          : isLow
          ? "border-amber-200 bg-amber-50/10"
          : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          {category && (
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded mb-1">
              {category}
            </span>
          )}
          <p className="text-sm font-bold text-slate-800 line-clamp-1" title={name}>
            {name}
          </p>

          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">
              {value}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {unit}
            </span>
          </div>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            isHigh
              ? "bg-red-50 text-red-600"
              : isLow
              ? "bg-amber-50 text-amber-600"
              : "bg-teal-50 text-teal-600"
          }`}
        >
          {isHigh ? (
            <TrendingUp className="h-5 w-5" />
          ) : isLow ? (
            <TrendingDown className="h-5 w-5" />
          ) : (
            <CheckCircle2 className="h-5 w-5" />
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="mb-1.5 flex justify-between text-xs">
          <span className="text-slate-400 font-medium">Reference range</span>
          <span
            className={`font-bold ${
              isHigh
                ? "text-red-600"
                : isLow
                ? "text-amber-600"
                : "text-teal-600"
            }`}
          >
            {status}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isHigh ? "bg-red-500" : isLow ? "bg-amber-400" : "bg-teal-500"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
        <span className="text-xs text-slate-400 font-medium">Target range</span>
        <span className="text-xs font-semibold text-slate-700">
          {range?.rawText ? range.rawText : `${range?.min || "-"} - ${range?.max || "-"} ${unit || ""}`}
        </span>
      </div>

      {/* Footer with Explain Button */}
      <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex items-center justify-between">
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Explain Term
        </button>

        {isAbnormal && (
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
            Out of range
          </span>
        )}
      </div>
    </div>
  );
}

export default BiomarkerCard;