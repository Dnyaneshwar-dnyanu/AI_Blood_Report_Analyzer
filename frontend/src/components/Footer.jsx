import React from 'react';
import { ShieldCheck, Activity, Sparkles, Lock, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* Notice Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-slate-200/90 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 p-5 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 border border-teal-200/60 shadow-2xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Medical Information & Safety Notice
                </p>
                <span className="rounded-full bg-slate-200/70 px-2 py-0.2 text-[9px] font-bold text-slate-600">
                  Non-Diagnostic
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 max-w-3xl">
                BloodLens delivers educational interpretations, biomarker range corridors, and trajectory visual analytics based on your laboratory report. It does not formulate clinical diagnoses or replace evaluation from a licensed healthcare provider.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 shadow-2xs">
              <Lock className="h-3 w-3 text-emerald-600" />
              <span>HIPAA-Ready PII Mode</span>
            </span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white">
              <Activity className="h-3.5 w-3.5" />
            </div>
            <span className="font-extrabold text-slate-800">BloodLens AI</span>
            <span>• Clinical Biomarker Intelligence Platform</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link to="/upload" className="hover:text-blue-600 transition">Upload</Link>
            <Link to="/dashboard" className="hover:text-blue-600 transition">Dashboard</Link>
            <Link to="/history" className="hover:text-blue-600 transition">Reports Vault</Link>
            <Link to="/compare" className="hover:text-blue-600 transition">Compare</Link>
            <Link to="/chat" className="hover:text-blue-600 transition">Health Guide</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;