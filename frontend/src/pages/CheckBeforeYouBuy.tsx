import React, { useState } from 'react';
import { ShieldCheck, Search, AlertTriangle, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CheckBeforeYouBuy: React.FC = () => {
  const navigate = useNavigate();
  const [khataNo, setKhataNo] = useState<string>('125');
  const [khesraNo, setKhesraNo] = useState<string>('450/2');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/land/JH-BOK-CHA-KURA-K125-K450-2`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 transition-colors duration-300">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-amber-500 animate-bounce" />
          <span>Buyer Due-Diligence & Anti-Fraud Shield</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Check Land Parcel Before You Buy
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Run automated multi-source consistency checks before paying advance money or signing sale deeds.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 transition-colors">
        <form onSubmit={handleVerify} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Khata No (खाता सं.)</label>
              <input
                type="text"
                value={khataNo}
                onChange={e => setKhataNo(e.target.value)}
                placeholder="e.g. 125"
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Khesra No (खेसरा सं.)</label>
              <input
                type="text"
                value={khesraNo}
                onChange={e => setKhesraNo(e.target.value)}
                placeholder="e.g. 450/2"
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center space-x-2 hover:scale-105"
          >
            <Search className="w-4 h-4" />
            <span>Run Buyer Due-Diligence Audit</span>
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Automated Checks Included:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-2 text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Khatian Owner vs Tenant Match (R001)</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-2 text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Active Revenue Court Disputes (R007)</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-2 text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Bank Mortgage Charges (R008)</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-2 text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Tribal Land Transfer Laws (CNT/SPT)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
