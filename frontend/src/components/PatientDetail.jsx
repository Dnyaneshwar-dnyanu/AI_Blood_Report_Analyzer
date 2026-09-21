import React from 'react'

function PatientDetail({ label, value, icon }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <div className="flex items-center gap-2 text-xs text-slate-400">
        {icon}
        {label}
      </div>

      <p className="mt-2 text-sm font-semibold text-slate-800">
        {value}
      </p>

    </div>
  );
}

export default PatientDetail