import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Activity, Clock, CheckCircle2, AlertTriangle, ArrowRight, Search, FileText } from 'lucide-react';

export const MutationTrackerPage: React.FC = () => {
  const { appNo } = useParams<{ appNo?: string }>();
  const [inputAppNo, setInputAppNo] = useState<string>(appNo || 'JH-MUT-2026-8941');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (inputAppNo) handleTrack();
  }, []);

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/mutation/track/${encodeURIComponent(inputAppNo)}`);
      const d = await res.json();
      setData(d);
    } catch (err) {
      console.error("Mutation tracking failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 transition-colors duration-300">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span>Statutory 30-Day Mutation SLA Tracker</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Live Mutation Application Tracker
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Track Dakhil-Kharij revenue application status, circle officer stage, and statutory SLA timeline.
        </p>
      </div>

      {/* Input Search Form */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 text-xs transition-colors">
        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={inputAppNo}
            onChange={e => setInputAppNo(e.target.value)}
            placeholder="Enter Application No (e.g. JH-MUT-2026-8941)"
            className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow transition-colors flex items-center justify-center space-x-2 shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? "Tracking..." : "Track Status"}</span>
          </button>
        </form>
      </div>

      {/* Mutation Status & Timeline Card */}
      {data && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-xs transition-colors animate-slide-up">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
                {data.application_no}
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Applicant: {data.applicant} (Buyer: {data.buyer})
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                data.sla_exceeded
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              }`}>
                {data.sla_exceeded ? `⚠️ SLA Delayed (${data.age_days} days / 30 SLA)` : `🟢 Active (${data.age_days} days)`}
              </span>
            </div>
          </div>

          {/* Timeline Bar */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white">Revenue Review Stage Progress:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {data.timeline?.map((step: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-center space-y-1 ${
                    step.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold'
                      : step.status === 'CURRENT'
                      ? 'bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400 font-extrabold shadow'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-400'
                  }`}
                >
                  <span className="text-[10px] block font-mono">Stage {idx + 1}</span>
                  <span className="text-xs font-bold block">{step.stage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
