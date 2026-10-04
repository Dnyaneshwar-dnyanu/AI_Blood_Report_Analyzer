import React, { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Save,
  ArrowRight,
  User,
  Calendar,
  Sparkles,
  Info,
  RotateCcw
} from "lucide-react";
import api from "../api/axios";
import { toast } from "react-toastify";

const CATEGORIES = [
  "CBC",
  "Lipids",
  "Metabolic",
  "Kidney",
  "Liver",
  "Thyroid",
  "Vitamins",
  "Other"
];

export default function ExtractionReview({
  initialData,
  reportId,
  onConfirmed,
  onCancel
}) {
  const [patientDetails, setPatientDetails] = useState({
    name: initialData?.patientDetails?.name || "",
    age: initialData?.patientDetails?.age || "",
    gender: initialData?.patientDetails?.gender || "",
    reportDate: initialData?.patientDetails?.reportDate || ""
  });

  const [biomarkers, setBiomarkers] = useState(
    Array.isArray(initialData?.biomarkers) ? initialData.biomarkers : []
  );

  const [saving, setSaving] = useState(false);

  // Helper to re-evaluate biomarker status on value or range change
  const computeStatus = (val, min, max, currentStatus) => {
    const numVal = parseFloat(val);
    const numMin = parseFloat(min);
    const numMax = parseFloat(max);

    if (!isNaN(numVal) && !isNaN(numMin) && !isNaN(numMax)) {
      if (numVal < numMin) return "Low";
      if (numVal > numMax) return "High";
      return "Normal";
    }
    return currentStatus || "Normal";
  };

  const handleBiomarkerChange = (index, field, value) => {
    setBiomarkers((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };

      if (field === "min" || field === "max") {
        item.range = {
          ...item.range,
          [field]: value,
          rawText: `${field === "min" ? value : item.range?.min || ""}-${field === "max" ? value : item.range?.max || ""}`
        };
      } else {
        item[field] = value;
      }

      // Re-evaluate status
      item.status = computeStatus(
        item.value,
        item.range?.min,
        item.range?.max,
        item.status
      );

      // If user edited an uncertain row, clear uncertain flag if now complete
      if (item.uncertainFlag && item.name && item.value !== "" && item.range?.min && item.range?.max) {
        item.uncertainFlag = false;
        item.uncertaintyReason = "";
      }

      updated[index] = item;
      return updated;
    });
  };

  const handleAddBiomarker = () => {
    setBiomarkers((prev) => [
      ...prev,
      {
        name: "",
        category: "Other",
        value: "",
        unit: "",
        range: { min: "", max: "", rawText: "" },
        status: "Normal",
        confidence: "high",
        uncertainFlag: false,
        uncertaintyReason: ""
      }
    ]);
  };

  const handleDeleteBiomarker = (index) => {
    setBiomarkers((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveAndConfirm = async () => {
    if (biomarkers.length === 0) {
      toast.warning("Please include at least one biomarker in the report.");
      return;
    }

    setSaving(true);
    try {
      const res = await api.put(`/api/report/${reportId}`, {
        patientDetails,
        biomarkers
      });

      if (res.data.success) {
        // Track guest report ID
        const existing = JSON.parse(localStorage.getItem("guestReportIds") || "[]");
        if (!existing.includes(reportId)) {
          existing.unshift(reportId);
          localStorage.setItem("guestReportIds", JSON.stringify(existing));
        }

        toast.success("Extraction confirmed and verified!");
        onConfirmed(res.data.data);
      } else {
        throw new Error(res.data.message || "Failed to save verified data");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.userMessage || err.message || "Could not save corrections.");
    } finally {
      setSaving(false);
    }
  };

  const uncertainCount = biomarkers.filter((b) => b.uncertainFlag).length;
  const outOfRangeCount = biomarkers.filter(
    (b) => b.status === "High" || b.status === "Low"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 via-white to-teal-50/50 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/70 px-3 py-1 text-xs font-bold text-blue-700 mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              Extraction Review & Verification
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Review & Correct Extracted Report Data
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Double check the parsed biomarkers below. Fix any misread values or reference ranges before finalizing your dashboard.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Re-upload
            </button>
            <button
              onClick={handleSaveAndConfirm}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Confirm & View Dashboard
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-slate-200/60">
          <span className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200 shadow-2xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
            {biomarkers.length} Biomarkers Total
          </span>

          {uncertainCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200 shadow-2xs">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              {uncertainCount} Need Review (Missing Range or Uncertain)
            </span>
          )}

          {outOfRangeCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-200 shadow-2xs">
              <Info className="h-3.5 w-3.5 text-rose-600" />
              {outOfRangeCount} Outside Reference Range
            </span>
          )}
        </div>
      </div>

      {/* Patient Details Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
          <User className="h-4 w-4 text-blue-600" />
          Patient & Report Details
        </h4>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Patient Name
            </label>
            <input
              type="text"
              value={patientDetails.name}
              onChange={(e) =>
                setPatientDetails({ ...patientDetails, name: e.target.value })
              }
              placeholder="e.g. John Doe"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Age
            </label>
            <input
              type="text"
              value={patientDetails.age}
              onChange={(e) =>
                setPatientDetails({ ...patientDetails, age: e.target.value })
              }
              placeholder="e.g. 32 years"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Gender
            </label>
            <input
              type="text"
              value={patientDetails.gender}
              onChange={(e) =>
                setPatientDetails({ ...patientDetails, gender: e.target.value })
              }
              placeholder="e.g. Male / Female"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Report Date
            </label>
            <div className="relative">
              <input
                type="text"
                value={patientDetails.reportDate}
                onChange={(e) =>
                  setPatientDetails({
                    ...patientDetails,
                    reportDate: e.target.value
                  })
                }
                placeholder="e.g. 15 Sep 2026"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
              />
              <Calendar className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Biomarkers Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Biomarkers & Reference Ranges
            </h4>
            <p className="text-[11px] text-slate-500">
              Verify values and reference limits. Amber badges indicate items needing manual confirmation.
            </p>
          </div>
          <button
            onClick={handleAddBiomarker}
            className="flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Biomarker
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-3">Biomarker</th>
                <th className="py-2.5 px-2">Category</th>
                <th className="py-2.5 px-2 w-24">Value</th>
                <th className="py-2.5 px-2 w-20">Unit</th>
                <th className="py-2.5 px-2 w-36">Normal Range (Min - Max)</th>
                <th className="py-2.5 px-2 w-24">Status</th>
                <th className="py-2.5 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {biomarkers.map((b, idx) => {
                const isUncertain = b.uncertainFlag === true;
                const isOutOfRange = b.status === "High" || b.status === "Low";

                return (
                  <tr
                    key={idx}
                    className={`transition ${
                      isUncertain
                        ? "bg-amber-50/40 hover:bg-amber-50/60"
                        : isOutOfRange
                        ? "bg-rose-50/20 hover:bg-rose-50/40"
                        : "hover:bg-slate-50/60"
                    }`}
                  >
                    {/* Name & Uncertainty Tag */}
                    <td className="py-2 px-3">
                      <div className="flex flex-col">
                        <input
                          type="text"
                          value={b.name}
                          onChange={(e) =>
                            handleBiomarkerChange(idx, "name", e.target.value)
                          }
                          placeholder="e.g. Hemoglobin"
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-slate-800 outline-none focus:border-blue-500"
                        />
                        {isUncertain && (
                          <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700">
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                            {b.uncertaintyReason || "Needs verification"}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-2 px-2">
                      <select
                        value={b.category || "Other"}
                        onChange={(e) =>
                          handleBiomarkerChange(idx, "category", e.target.value)
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-medium text-slate-700 outline-none focus:border-blue-500"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Value */}
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={b.value}
                        onChange={(e) =>
                          handleBiomarkerChange(idx, "value", e.target.value)
                        }
                        placeholder="14.2"
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-bold text-slate-900 outline-none focus:border-blue-500 text-center"
                      />
                    </td>

                    {/* Unit */}
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={b.unit}
                        onChange={(e) =>
                          handleBiomarkerChange(idx, "unit", e.target.value)
                        }
                        placeholder="g/dL"
                        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-slate-600 outline-none focus:border-blue-500 text-center"
                      />
                    </td>

                    {/* Reference Range (Min - Max) */}
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={b.range?.min ?? ""}
                          onChange={(e) =>
                            handleBiomarkerChange(idx, "min", e.target.value)
                          }
                          placeholder="Min"
                          className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center text-slate-700 outline-none focus:border-blue-500"
                        />
                        <span className="text-slate-400 font-bold">-</span>
                        <input
                          type="text"
                          value={b.range?.max ?? ""}
                          onChange={(e) =>
                            handleBiomarkerChange(idx, "max", e.target.value)
                          }
                          placeholder="Max"
                          className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center text-slate-700 outline-none focus:border-blue-500"
                        />
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-2 px-2">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] font-bold ${
                          b.status === "High"
                            ? "bg-rose-100 text-rose-700"
                            : b.status === "Low"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {b.status || "Normal"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-2 text-right">
                      <button
                        onClick={() => handleDeleteBiomarker(idx)}
                        title="Remove row"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Clicking confirm will apply your verified parameters to your personal analytics dashboard.
          </p>

          <button
            onClick={handleSaveAndConfirm}
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? (
              "Saving..."
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Confirm & Open Dashboard
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
