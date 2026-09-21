import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import api from "../api/axios";
import { toast } from "react-toastify";

export default function UploadPage() {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [status, setStatus] = useState("idle");
  const [uploadedFile, setUploadedFile] = useState(null);

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

        setStatus("success");
        toast.success("Report analyzed successfully!");
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
    <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

      {/* ============================= */}
      {/* IDLE STATE */}
      {/* ============================= */}

      {status === "idle" && (
        <>
          <div
            className="
              group cursor-pointer rounded-2xl border-2 border-dashed
              border-slate-300 p-10 text-center transition-all
              hover:border-blue-400 hover:bg-slate-50
              sm:p-16
            "
            onClick={handleBoxClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 transition group-hover:scale-105">
              <Upload className="h-7 w-7 text-blue-600" />
            </div>

            <h3 className="text-lg font-semibold text-slate-900">
              Drop your report here
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              or click to browse from your device
            </p>


            {/* File Types */}
            <div className="mt-5 flex justify-center gap-2">

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                PDF
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                JPG
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                PNG
              </span>

            </div>


            <p className="mt-4 text-xs text-slate-400">
              Maximum file size: 10 MB
            </p>


            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileInput}
            />

          </div>


          {/* Privacy */}
          <PrivacyNotice />
        </>
      )}


      {/* ============================= */}
      {/* PROCESSING STATE */}
      {/* ============================= */}

      {status === "processing" && (
        <div className="py-10">

          {/* Status Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50">

            <Loader2 className="h-9 w-9 animate-spin text-blue-600" />

          </div>


          <div className="mt-6 text-center">

            <h3 className="text-xl font-bold text-slate-900">
              Analyzing your report
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              We've received your report. Our AI is extracting
              and analyzing your blood biomarkers.
            </p>

          </div>


          {/* Uploaded File */}
          {uploadedFile && (
            <div className="mx-auto mt-8 flex max-w-xl items-center gap-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-5">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>

              <div className="min-w-0 flex-1">

                <p className="truncate text-sm font-semibold text-slate-800">
                  {uploadedFile.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {(
                    uploadedFile.size / 1024 / 1024
                  ).toFixed(2)}{" "}
                  MB
                </p>

              </div>

              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-blue-600" />

            </div>
          )}


          {/* Processing Steps */}
          <div className="mx-auto mt-8 max-w-xl space-y-3">

            <ProcessingStep
              title="Report uploaded"
              description="Your report was received successfully"
              completed
            />

            <ProcessingStep
              title="Extracting biomarkers"
              description="Finding values from your blood report"
              active
            />

            <ProcessingStep
              title="Preparing your dashboard"
              description="Creating your personalized health overview"
            />

          </div>


          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">

            <ShieldCheck className="h-4 w-4 text-teal-600" />

            Please don't close this page while your report is being processed.

          </div>

        </div>
      )}


      {/* ============================= */}
      {/* SUCCESS STATE */}
      {/* ============================= */}

      {status === "success" && (
        <div className="py-10 text-center">

          {/* Success Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-teal-50">

            <CheckCircle2 className="h-10 w-10 text-teal-600" />

          </div>


          <h3 className="mt-6 text-2xl font-bold text-slate-900">
            Your dashboard is ready!
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            We've finished analyzing your blood report.
            Your biomarkers, AI summary, and health insights
            are now ready to view.
          </p>


          {/* File */}
          {uploadedFile && (
            <div className="mx-auto mt-7 flex max-w-md items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>

              <div className="min-w-0 flex-1">

                <p className="truncate text-sm font-semibold text-slate-800">
                  {uploadedFile.name}
                </p>

                <p className="mt-1 text-xs text-teal-600">
                  Analysis completed
                </p>

              </div>

              <CheckCircle2 className="h-5 w-5 shrink-0 text-teal-500" />

            </div>
          )}


          {/* Dashboard Button */}
          <button
            onClick={handleDashboard}
            className="
              mx-auto mt-7 flex items-center justify-center
              gap-2 rounded-xl bg-blue-600 px-6 py-3.5
              text-sm font-semibold text-white
              transition hover:bg-blue-700
            "
          >
            View Dashboard

            <ArrowRight className="h-5 w-5" />
          </button>


          <p className="mt-5 text-xs text-slate-400">
            Your report has been securely processed.
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