import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

function PatientDetail({ label, value, icon, isSensitive = false }) {
  const [masked, setMasked] = useState(() => {
    return localStorage.getItem("privacyMaskEnabled") === "true";
  });

  useEffect(() => {
    const handleMaskChange = () => {
      setMasked(localStorage.getItem("privacyMaskEnabled") === "true");
    };
    window.addEventListener("privacyMaskChanged", handleMaskChange);
    return () => window.removeEventListener("privacyMaskChanged", handleMaskChange);
  }, []);

  const shouldMask = isSensitive && masked && value && value !== "—";

  return (
    <div className="group relative rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition-all duration-200 hover:border-slate-200 hover:bg-white hover:shadow-xs">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
        <span className="flex items-center gap-2">
          {icon}
          {label}
        </span>
        {isSensitive && (
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-slate-400">
            {masked ? "Masked" : "Visible"}
          </span>
        )}
      </div>

      <div className="mt-2 flex items-baseline justify-between">
        {shouldMask ? (
          <span className="font-mono text-sm tracking-widest font-black text-slate-400 select-none">
            ••••••••
          </span>
        ) : (
          <p className="text-sm font-bold text-slate-900 tracking-tight">
            {value || "—"}
          </p>
        )}
      </div>
    </div>
  );
}

export default PatientDetail;