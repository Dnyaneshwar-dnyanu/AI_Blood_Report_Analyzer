import React from 'react';

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

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">

      <div className="flex items-center justify-between">

        <div>
          <h4 className="font-bold text-slate-800">
            {title}
          </h4>

          <p className="mt-1 text-xs text-slate-400">
            Reference range: {min} – {max} {unit || ''}
          </p>
        </div>

        <span
          className={`
            rounded-full px-3 py-1 text-xs font-semibold
            ${
              warning
                ? "bg-amber-50 text-amber-600 border border-amber-200"
                : "bg-teal-50 text-teal-600 border border-teal-200"
            }
          `}
        >
          {warning ? "Needs attention" : "Normal"}
        </span>

      </div>


      {/* Graph */}
      <div className="mt-8">

        <div className="relative">

          {/* Background Track */}
          <div className="h-3 rounded-full bg-slate-100" />

          {/* Target Normal Zone */}
          <div
            className="absolute left-[20%] right-[20%] top-0 h-3 rounded-full bg-teal-200/60"
          />

          {/* Current Value Marker */}
          <div
            className={`
              absolute top-1/2 h-6 w-6
              -translate-y-1/2 -translate-x-1/2
              rounded-full border-4 border-white shadow-md transition-all duration-500
              ${
                warning
                  ? "bg-amber-500"
                  : "bg-blue-600"
              }
            `}
            style={{ left: computedPosition }}
          />

        </div>


        {/* Scale Labels */}
        <div className="mt-4 flex justify-between text-xs font-medium text-slate-400">
          <span>{min}</span>

          <span className="text-teal-600 font-semibold">
            Optimal Range
          </span>

          <span>{max}</span>
        </div>

      </div>


      {/* Current Value Summary */}
      <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-100">

        <span className="text-sm font-medium text-slate-500">
          Your extracted result
        </span>

        <span className="text-lg font-bold text-slate-900">
          {value} <span className="text-xs font-normal text-slate-500">{unit}</span>
        </span>

      </div>

    </div>
  );
}

export default RangeGraph;