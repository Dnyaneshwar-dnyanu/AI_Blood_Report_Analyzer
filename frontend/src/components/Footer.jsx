import React from 'react'

import { ShieldCheck } from 'lucide-react'

function Footer() {
    return (
        <div className="bg-white p-5">
            <div className='mx-auto max-w-7xl px-10 py-5 flex items-start gap-3 rounded-2xl border border-slate-200'>

                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />

                <div>
                    <p className="text-sm font-medium text-slate-700">
                        Important
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        BloodLens provides educational information based on
                        the values found in your report. It does not provide
                        a diagnosis or replace advice from a qualified
                        healthcare professional.
                    </p>
                </div>

            </div>
        </div>
    )
}

export default Footer