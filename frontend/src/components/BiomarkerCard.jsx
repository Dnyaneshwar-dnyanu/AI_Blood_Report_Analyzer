import { CheckCircle2, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

function BiomarkerCard({ name, value, unit, range, status, comparisionText }) {
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
    <div className={`rounded-2xl border bg-white p-5 shadow-xs transition hover:shadow-md ${
      isHigh ? "border-red-200" : isLow ? "border-amber-200" : "border-slate-200"
    }`}>

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-slate-500">
            {name}
          </p>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {value}
            </span>

            <span className="text-xs font-semibold text-slate-400">
              {unit}
            </span>
          </div>
        </div>

        <div
          className={`
            flex h-9 w-9 items-center justify-center rounded-xl
            ${
              isHigh
                ? "bg-red-50 text-red-600"
                : isLow
                ? "bg-amber-50 text-amber-600"
                : "bg-teal-50 text-teal-600"
            }
          `}
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
      <div className="mt-5">

        <div className="mb-2 flex justify-between text-xs">
          <span className="text-slate-400 font-medium">
            Reference range
          </span>

          <span
            className={`font-semibold ${
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


      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">

        <span className="text-xs text-slate-400">
          Normal range
        </span>

        <span className="text-xs font-semibold text-slate-700">
          {range?.rawText ? range.rawText : `${range?.min || '-'} - ${range?.max || '-'}`}
        </span>

      </div>


      {/* Trend Text */}
      {comparisionText && (
        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
          <span>{comparisionText}</span>
        </div>
      )}

    </div>
  );
}

export default BiomarkerCard;