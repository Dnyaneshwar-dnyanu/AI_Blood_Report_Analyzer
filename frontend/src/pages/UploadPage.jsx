import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  ShieldCheck,
  FileText,
  Sparkles,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import api from "../api/axios";
import { toast } from "react-toastify";
import ExtractionReview from "../components/ExtractionReview";

export default function UploadPage() {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [status, setStatus] = useState("idle");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedReport, setExtractedReport] = useState(null);

  const uploadTheFile = async (file) => {
    if (!file) return;

    // Don't allow another upload while processing
    if (status === "processing") return;

    setUploadedFile(file);
    setStatus("processing");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/api/report/upload", formData);

      const response = res.data;

      if (res.status !== 200) {
        throw new Error("Upload failed.");
      }

      if (response.success) {
        localStorage.setItem("activeReportId", response.data._id);
        const existing = JSON.parse(localStorage.getItem("guestReportIds") || "[]");
        if (!existing.includes(response.data._id)) {
          existing.unshift(response.data._id);
          localStorage.setItem("guestReportIds", JSON.stringify(existing));
        }

        setExtractedReport(response.data);
        setStatus("review");
        toast.success("Extraction complete! Please review and verify values.");
      } else {
        throw new Error(
          response.message || "Report processing failed."
        );
      }

    } catch (error) {
      console.error(error);

      setStatus("failed");

      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Something went wrong."
      );
    }
  };


  const handleBoxClick = () => {
    if (status === "processing" || status === "success") {
      return;
    }

    fileInputRef.current?.click();
  };


  const handleFileInput = (e) => {
    if (
      e.target.files &&
      e.target.files[0] &&
      status !== "processing"
    ) {
      uploadTheFile(e.target.files[0]);
    }
  };


  const handleDragOver = (e) => {
    e.preventDefault();

    if (status === "processing" || status === "success") {
      return;
    }
  };


  const handleDrop = (e) => {
    e.preventDefault();

    if (status === "processing" || status === "success") {
      return;
    }

    if (
      e.dataTransfer.files &&
      e.dataTransfer.files[0]
    ) {
      uploadTheFile(e.dataTransfer.files[0]);
    }
  };


  const handleTryAgain = () => {
    setStatus("idle");
    setUploadedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  const handleDashboard = () => {
    navigate("/dashboard");
  };


  return (
    <div className="relative min-h-[calc(100vh-80px)] py-10 px-4 sm:px-6">
      {/* Ambient Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-[500px] w-full max-w-5xl rounded-full bg-gradient-to-b from-blue-400/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-10 -z-10 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl pointer-events-none animate-pulse-glow" />

      {/* Hero Headline (Shown on Idle) */}
      {status === "idle" && (
        <div className="mx-auto max-w-3xl text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-3.5 py-1.5 text-xs font-bold text-blue-700 shadow-2xs mb-4 backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5 text-blue-600 animate-spin-slow" />
            Next-Gen Clinical Extraction & Health Intelligence
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            Turn Cryptic Blood Reports into <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent">
              Actionable Health Clarity
            </span>
          </h2>
          <p className="mt-3 text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            Upload your laboratory blood test (PDF or scanned image). Our AI extracts every biomarker, flags uncertain values for your review, and provides non-diagnostic lifestyle guidance backed by medical research.
          </p>
        </div>
      )}

      <div
        className={`mx-auto rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 shadow-xl shadow-slate-200/40 sm:p-8 transition-all duration-300 ${
          status === "review" ? "max-w-5xl" : "max-w-3xl"
        }`}
      >

        {/* ============================= */}
        {/* REVIEW & VALIDATE EXTRACTION */}
        {/* ============================= */}

        {status === "review" && extractedReport && (
          <ExtractionReview
            initialData={extractedReport}
            reportId={extractedReport._id}
            onConfirmed={(confirmedData) => {
              setExtractedReport(confirmedData);
              setStatus("success");
            }}
            onCancel={handleTryAgain}
          />
        )}

        {/* ============================= */}
        {/* IDLE STATE */}
        {/* ============================= */}

        {status === "idle" && (
          <>
            <div
              className="
                group relative cursor-pointer rounded-2xl border-2 border-dashed
                border-slate-300/80 p-10 text-center transition-all duration-300
                hover:border-blue-500 hover:bg-gradient-to-b hover:from-blue-50/40 hover:to-white
                hover:shadow-lg hover:shadow-blue-500/5 sm:p-14 overflow-hidden
              "
              onClick={handleBoxClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {/* Corner Accents */}
              <div className="absolute top-3 left-3 h-2 w-2 rounded-full bg-slate-300 group-hover:bg-blue-500 transition-colors" />
              <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-slate-300 group-hover:bg-blue-500 transition-colors" />

              <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-blue-50 to-indigo-50 border border-blue-100/60 shadow-inner transition-all duration-300 group-hover:scale-110 group-hover:shadow-blue-500/20">
                <Upload className="h-9 w-9 text-blue-600 transition-transform group-hover:-translate-y-1" />
              </div>

              <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                Drop your blood report here
              </h3>

              <p className="mt-2 text-xs font-semibold text-slate-400">
                or <span className="text-blue-600 underline underline-offset-2">browse files</span> from your computer or phone
              </p>

              {/* Supported File Type Badges */}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <span className="rounded-xl border border-slate-200 bg-white/90 px-3 py-1.5 text-[11px] font-bold text-slate-700 shadow-2xs flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-rose-500" />
                  Native Lab PDF
                </span>
                <span className="rounded-xl border border-slate-200 bg-white/90 px-3 py-1.5 text-[11px] font-bold text-slate-700 shadow-2xs flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-blue-500" />
                  Scanned Paper (OCR)
                </span>
                <span className="rounded-xl border border-slate-200 bg-white/90 px-3 py-1.5 text-[11px] font-bold text-slate-700 shadow-2xs flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-emerald-500" />
                  JPG / PNG Photo
                </span>
              </div>

              <p className="mt-4 text-[11px] text-slate-400 font-medium">
                Maximum file size: 10 MB • Scanned photos automatically processed with OCR
              </p>

              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileInput}
              />
            </div>

            {/* Quick Demo Dashboard Shortcut */}
            <div className="mt-6 flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 via-slate-50 to-teal-50/50 border border-slate-200/80">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600 shadow-xs border border-blue-100">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Want to explore first without uploading?
                  </p>
                  <p className="text-[11px] text-slate-500">
                    View our interactive sample dashboard with normal & abnormal biomarkers.
                  </p>
                </div>
              </div>
              <button
                onClick={handleDashboard}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline shrink-0"
              >
                <span>Sample Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Privacy */}
            <PrivacyNotice />
          </>
        )}

        {/* ============================= */}
        {/* PROCESSING STATE */}
        {/* ============================= */}

        {status === "processing" && (
          <div className="relative overflow-hidden py-12">
            {/* High-tech Scanning Beam */}
            <div className="animate-scanline" />

            {/* Status Icon */}
            <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-50 border border-blue-100 shadow-inner">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              <div className="absolute inset-0 rounded-3xl border-2 border-blue-400/40 animate-ping" />
            </div>

            <div className="mt-6 text-center">
              <h3 className="text-2xl font-black text-slate-900">
                Extracting & Analyzing Biomarkers
              </h3>
              <p className="mt-2 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Reading your blood test with our dual OCR and Google Gemini engine.
                We'll present the extracted values for your review before finalizing.
              </p>
            </div>

            {/* Uploaded File Pill */}
            {uploadedFile && (
              <div className="mx-auto mt-8 flex max-w-xl items-center gap-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 shadow-2xs">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-xs border border-blue-100">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-800">
                    {uploadedFile.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Uploaded & Unlinked from disk
                  </p>
                </div>
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-blue-600" />
              </div>
            )}

            {/* Processing Steps */}
            <div className="mx-auto mt-8 max-w-xl space-y-2.5">
              <ProcessingStep
                title="1. Secure document received"
                description="Encrypted ingestion and temporary buffer check"
                completed
              />
              <ProcessingStep
                title="2. Extracting biomarker rows & units"
                description="Parsing numeric values, clinical bounds, and discrete indicators"
                active
              />
              <ProcessingStep
                title="3. Validating confidence & uncertainty"
                description="Preparing interactive review table for manual verification"
              />
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              Your data is private. Please do not close this window during extraction.
            </div>
          </div>
        )}

        {/* ============================= */}
        {/* SUCCESS STATE */}
        {/* ============================= */}

        {status === "success" && (
          <div className="py-12 text-center">
            {/* Success Icon */}
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-teal-50 border border-teal-100 shadow-inner">
              <CheckCircle2 className="h-12 w-12 text-teal-600" />
            </div>

            <h3 className="mt-6 text-3xl font-black text-slate-900">
              Your Health Dashboard is Ready!
            </h3>

            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-slate-500">
              Your verified report has been structured. Biomarkers, reference range meters, and proactive lifestyle insights are now available.
            </p>

            {/* Dashboard and Comparison Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleDashboard}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 py-3.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 hover:scale-[1.02]"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => navigate("/compare")}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <span>Compare with Previous Report</span>
              </button>
            </div>

            <p className="mt-6 text-[11px] text-slate-400">
              Report saved securely to your session vault.
            </p>
          </div>
        )}


      {/* ============================= */}
      {/* FAILED STATE */}
      {/* ============================= */}

      {status === "failed" && (
        <div className="py-10 text-center">

          {/* Error Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50">

            <AlertCircle className="h-10 w-10 text-red-500" />

          </div>


          <h3 className="mt-6 text-xl font-bold text-slate-900">
            We couldn't process your report
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Something went wrong while uploading or analyzing
            your report. Please try uploading it again.
          </p>


          {/* Uploaded File */}
          {uploadedFile && (
            <div className="mx-auto mt-7 flex max-w-md items-center gap-3 rounded-2xl border border-red-100 bg-red-50/50 p-4 text-left">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white">
                <FileText className="h-5 w-5 text-red-500" />
              </div>

              <div className="min-w-0 flex-1">

                <p className="truncate text-sm font-semibold text-slate-800">
                  {uploadedFile.name}
                </p>

                <p className="mt-1 text-xs text-red-500">
                  Processing failed
                </p>

              </div>

            </div>
          )}


          {/* Retry */}
          <button
            onClick={handleTryAgain}
            className="
              mx-auto mt-7 flex items-center justify-center
              gap-2 rounded-xl border border-slate-200
              bg-white px-6 py-3
              text-sm font-semibold text-slate-700
              transition hover:bg-slate-50
            "
          >
            <RotateCcw className="h-4 w-4" />

            Try Again
          </button>

        </div>
      )}

      </div>
    </div>
  );
}


/* ================================= */
/* Processing Step */
/* ================================= */

function ProcessingStep({
  title,
  description,
  completed,
  active,
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">

      <div
        className={`
          flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
          ${completed
            ? "bg-teal-50"
            : active
              ? "bg-blue-50"
              : "bg-slate-50"
          }
        `}
      >

        {completed ? (
          <CheckCircle2 className="h-5 w-5 text-teal-600" />
        ) : active ? (
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        ) : (
          <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        )}

      </div>


      <div className="text-left">

        <p className="text-sm font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-slate-500">
          {description}
        </p>

      </div>

    </div>
  );
}


/* ================================= */
/* Privacy Notice */
/* ================================= */

function PrivacyNotice() {
  return (
    <div className="mt-6 flex items-start gap-3 rounded-xl bg-slate-50 p-4">

      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />

      <div>

        <p className="text-sm font-medium text-slate-700">
          Your privacy matters
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Your uploaded report is used only for analysis.
          Avoid uploading documents containing unnecessary
          personal information.
        </p>

      </div>

    </div>
  );
}