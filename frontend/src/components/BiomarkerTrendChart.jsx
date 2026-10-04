import React, { useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Calendar,
  AlertTriangle,
  Info
} from "lucide-react";

export default function BiomarkerTrendChart({
  biomarkers = [],
  selectedKey,
  onSelectBiomarker
}) {
  if (!biomarkers || biomarkers.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400">
        No comparative biomarker chart data available.
      </div>
    );
  }

  // Find active biomarker data or default to first one with timeline
  const activeItem =
    biomarkers.find((b) => b.key === selectedKey) ||
    biomarkers.find((b) => b.chartTimeline?.length > 1) ||
    biomarkers[0];

  const timeline = activeItem?.chartTimeline || [];

  const minRef =
    timeline.find((t) => t.min !== null)?.min ??
    activeItem?.first?.range?.min ??
    0;
  const maxRef =
    timeline.find((t) => t.max !== null)?.max ??
    activeItem?.first?.range?.max ??
    100;

  const unit = activeItem?.latest?.unit || activeItem?.first?.unit || "";
  const isRising = activeItem?.trend === "up";
  const isFalling = activeItem?.trend === "down";
  const pct = activeItem?.deltaPercentage;
  const abs = activeItem?.deltaAbsolute;

  // Determine line accent color (stock trading metaphor)
  // If latest status is Normal, green trend. If latest is High, red trend. If Low, amber trend.
  const latestStatus = activeItem?.latest?.status || "Normal";
  const strokeColor =
    latestStatus === "High"
      ? "#e11d48" // Rose 600
      : latestStatus === "Low"
      ? "#d97706" // Amber 600
      : "#10b981"; // Emerald 500

  // Chart Y-axis domain padding
  const numericValues = timeline.map((t) => t.value);
  const minVal = Math.min(...numericValues, typeof minRef === "number" ? minRef : 0);
  const maxVal = Math.max(...numericValues, typeof maxRef === "number" ? maxRef : 100);
  const padding = (maxVal - minVal) * 0.2 || 5;
  const yDomain = [
    Math.max(0, Math.floor(minVal - padding)),
    Math.ceil(maxVal + padding)
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Trading Ticker Style Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {activeItem?.category || "Biomarker Trend"}
            </span>
            {activeItem?.unitMismatch && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                <AlertTriangle className="h-3 w-3 text-amber-500" />
                Unit Discrepancy Flag
              </span>
            )}
            {activeItem?.rangeShift && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                <Info className="h-3 w-3 text-slate-400" />
                Lab Reference Brackets Changed
              </span>
            )}
          </div>

          <h3 className="text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
            {activeItem?.displayName}
            <span className="text-xs font-semibold text-slate-400">
              ({unit})
            </span>
          </h3>

          <p className="text-xs text-slate-500 mt-0.5">
            Normal Clinical Corridor: <strong>{minRef} - {maxRef} {unit}</strong>
          </p>
        </div>

        {/* Financial Ticker Style Metrics */}
        <div className="flex items-center gap-4 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/70">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Initial Test
            </span>
            <span className="text-sm font-bold text-slate-700">
              {activeItem?.first?.value ?? "—"} {unit}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {activeItem?.first?.date}
            </span>
          </div>

          <div className="h-8 w-px bg-slate-200" />

          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Latest Test
            </span>
            <span className="text-base font-extrabold text-slate-900">
              {activeItem?.latest?.value ?? "—"} {unit}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {activeItem?.latest?.date}
            </span>
          </div>

          <div className="h-8 w-px bg-slate-200" />

          {/* Delta Pill */}
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Net Change
            </span>
            <div
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-black shadow-2xs ${
                latestStatus === "High"
                  ? "bg-rose-100 text-rose-700"
                  : latestStatus === "Low"
                  ? "bg-amber-100 text-amber-800"
                  : isRising
                  ? "bg-blue-100 text-blue-700"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {isRising ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : isFalling ? (
                <TrendingDown className="h-3.5 w-3.5" />
              ) : (
                <Minus className="h-3.5 w-3.5" />
              )}
              <span>
                {pct !== null
                  ? `${pct > 0 ? "+" : ""}${pct}%`
                  : abs !== null
                  ? `${abs > 0 ? "+" : ""}${abs}`
                  : "0.0%"}
              </span>
            </div>
            {abs !== null && (
              <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                ({abs > 0 ? "+" : ""}{abs} {unit})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Biomarker Switcher Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-3 border-b border-slate-100 scrollbar-none">
        {biomarkers.map((b) => {
          const isSelected = b.key === activeItem?.key;
          const isOut = b.latest?.status === "High" || b.latest?.status === "Low";
          return (
            <button
              key={b.key}
              onClick={() => onSelectBiomarker(b.key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                isSelected
                  ? "bg-slate-900 text-white shadow-xs"
                  : isOut
                  ? "bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span>{b.displayName}</span>
              {b.deltaPercentage !== null && (
                <span
                  className={`text-[10px] font-bold ${
                    isSelected
                      ? "text-slate-300"
                      : b.trend === "up"
                      ? "text-rose-600"
                      : b.trend === "down"
                      ? "text-emerald-600"
                      : "text-slate-400"
                  }`}
                >
                  {b.deltaPercentage > 0 ? "▲" : b.deltaPercentage < 0 ? "▼" : "•"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Chart Canvas */}
      <div className="mt-6 h-72 w-full">
        {timeline.length < 2 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <Activity className="h-8 w-8 text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-600">
              Only 1 recorded date available for {activeItem?.displayName}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
              This biomarker was only measured on one report date. Select another biomarker above to view longitudinal trend curves.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={timeline}
              margin={{ top: 15, right: 30, left: 10, bottom: 20 }}
            >
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColor} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="normalBandGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.03} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                dy={10}
              />

              <YAxis
                domain={yDomain}
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                unit={` ${unit}`}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-xs text-xs">
                        <p className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-blue-600" />
                          {d.date}
                        </p>
                        <div className="space-y-0.5 text-slate-600">
                          <p>
                            Observed Value:{" "}
                            <strong className="text-slate-900 font-extrabold">
                              {d.value} {d.unit}
                            </strong>
                          </p>
                          <p>
                            Normal Bracket:{" "}
                            <span>
                              {d.min} - {d.max} {d.unit}
                            </span>
                          </p>
                          <p>
                            Clinical Status:{" "}
                            <strong
                              className={
                                d.status === "High"
                                  ? "text-rose-600"
                                  : d.status === "Low"
                                  ? "text-amber-600"
                                  : "text-emerald-600"
                              }
                            >
                              {d.status}
                            </strong>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Shaded Reference Corridor (Green Zone) */}
              {typeof minRef === "number" && typeof maxRef === "number" && (
                <ReferenceArea
                  y1={minRef}
                  y2={maxRef}
                  fill="url(#normalBandGradient)"
                  stroke="#10b981"
                  strokeOpacity={0.25}
                  strokeDasharray="2 2"
                />
              )}

              {/* Reference Limit Boundary Lines */}
              {typeof maxRef === "number" && (
                <ReferenceLine
                  y={maxRef}
                  stroke="#10b981"
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                />
              )}

              {/* Area fill under curve */}
              <Area
                type="monotone"
                dataKey="value"
                stroke="none"
                fill="url(#trendGradient)"
              />

              {/* Main Trading-Style Trend Line */}
              <Line
                type="monotone"
                dataKey="value"
                stroke={strokeColor}
                strokeWidth={3}
                dot={{
                  r: 5,
                  fill: strokeColor,
                  stroke: "#ffffff",
                  strokeWidth: 2
                }}
                activeDot={{
                  r: 7,
                  fill: strokeColor,
                  stroke: "#ffffff",
                  strokeWidth: 2.5
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Chart Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-6 rounded bg-emerald-100 border border-emerald-400/40 inline-block" />
            <span>Target Reference Range</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-900 inline-block" />
            <span>Biomarker Trajectory Curve</span>
          </div>
        </div>
        <span>Interactive trading ticker view: Click any biomarker pill to inspect its trend</span>
      </div>
    </div>
  );
}
