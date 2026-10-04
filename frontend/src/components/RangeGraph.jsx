import React from 'react';
import { AlertCircle, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';

function RangeGraph({ title, value, min, max, position, warning, unit }) {
  const minNum = parseFloat(min);
  const maxNum = parseFloat(max);
  const valNum = parseFloat(value);

  let computedPosition = position;
  if (!computedPosition && !isNaN(valNum) && !isNaN(minNum) && !isNaN(maxNum) && maxNum > minNum) {
    const pct = Math.max(5, Math.min(95, ((valNum - minNum) / (maxNum - minNum)) * 100));
    computedPosition = `${pct}%`;
  } else if (!computedPosition) {
    computedPosition = "50%";
  }

  const isLow = warning && !isNaN(valNum) && !isNaN(minNum) && valNum < minNum;
  const isHigh = warning && !isNaN(valNum) && !isNaN(maxNum) && valNum > maxNum;

  return (
    <div className="group rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all duration-300 hover-lift hover:border-slate-300">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
            {title}
          </h4>
          <p className="mt-0.5 text-xs font-medium text-slate-400">
            Standard Reference: {min || "—"} – {max || "—"} {unit || ''}
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border transition-colors ${
            warning
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-teal-50 text-teal-700 border-teal-200"
          }`}
        >
          {warning ? (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
              <span>{isHigh ? "High" : isLow ? "Low" : "Out of Range"}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
              <span>Normal</span>
            </>
          )}
        </span>
      </div>

      {/* Visual Range Indicator Bar */}
      <div className="mt-8">
        <div className="relative">
          {/* Background Track with 3 Zones: Low, Normal, High */}
          <div className="h-3 w-full rounded-full bg-slate-100 flex overflow-hidden">
            <div className="w-1/4 bg-amber-100/70" title="Low zone" />
            <div className="w-1/2 bg-teal-200/70" title="Optimal zone" />
            <div className="w-1/4 bg-rose-100/70" title="High zone" />
          </div>

          {/* Current Value Marker Needle */}
          <div
            className={`absolute top-1/2 h-7 w-7 -translate-y-1/2 -translate-x-1/2 rounded-full border-4 border-white shadow-lg transition-all duration-700 flex items-center justify-center ${
              warning
                ? "bg-gradient-to-tr from-amber-500 to-rose-500"
                : "bg-gradient-to-tr from-blue-600 to-teal-500"
            }`}
            style={{ left: computedPosition }}
          >
            <div className="h-1.5 w-1.5 rounded-full bg-white" />
          </div>
        </div>

        {/* Scale Labels */}
        <div className="mt-4 flex justify-between text-xs font-semibold text-slate-400">
          <span>{min || "0"}</span>
          <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
            Target Corridor
          </span>
          <span>{max || "100"}</span>
        </div>
      </div>

      {/* Current Result Strip */}
      <div className="mt-6 flex items-center justify-between rounded-2xl bg-slate-50/80 p-3.5 border border-slate-100">
        <span className="text-xs font-semibold text-slate-500">
          Extracted Lab Result
        </span>
        <div className="flex items-baseline gap-1">
          <span className="font-heading text-xl font-black text-slate-900">
            {value}
          </span>
          <span className="text-xs font-bold text-slate-400 uppercase">
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
}

export default RangeGraph;