import React, { useState, useEffect } from 'react';
import { Lock, Building2, AlertTriangle, ShieldCheck, CheckCircle2, UserCheck, Activity, BarChart2, Eye, FileText } from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';

interface AdminDashboardProps {
  userRole: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userRole }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [decision, setDecision] = useState<string>('REQUIRE_FIELD_VERIFICATION');
  const [comment, setComment] = useState<string>('');
  const [decisionMsg, setDecisionMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [mRes, cRes] = await Promise.all([
        fetch('/api/v1/admin/dashboard'),
        fetch('/api/v1/admin/cases?limit=15')
      ]);
      const mData = await mRes.json();
      const cData = await cRes.json();
      setMetrics(mData);
      setCases(cData.cases || []);
      if (cData.cases && cData.cases.length > 0) {
        setSelectedCase(cData.cases[0]);
      }
    } catch (err) {
      console.error("Failed to load admin dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    try {
      const res = await fetch('/api/v1/admin/cases/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_no: selectedCase.case_no,
          land_identity_id: selectedCase.land_identity_id,
          officer_name: userRole === 'REVIEW_OFFICER' ? 'LRDC Bokaro' : 'CO Chas (Bokaro)',
          officer_role: userRole,
          decision,
          comment
        })
      });
      const d = await res.json();
      setDecisionMsg(d.message);
      setTimeout(() => setDecisionMsg(''), 3000);
    } catch (err) {
      console.error("Decision recording failed", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors duration-300">
      {/* Dashboard Title Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <Building2 className="w-4 h-4 text-emerald-500" />
            <span>Government Revenue Officer Workspace</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Circle Officer & LRDC Review Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Investigate flagged land risk cases, conduct side-by-side evidence analysis, and log signed decisions.
          </p>
        </div>

        <div className="px-4 py-2 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-2xl text-xs font-bold font-mono">
          OFFICER ROLE: {userRole}
        </div>
      </div>

      {/* Metrics Widgets */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Total Land Parcels</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{metrics.parcels_analyzed?.toLocaleString()}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">High Risk Cases Flagged</span>
            <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">{metrics.high_risk_count?.toLocaleString()}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Medium Risk Cases Flagged</span>
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">{metrics.medium_risk_count?.toLocaleString()}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Officer Decisions Logged</span>
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{metrics.officer_decisions_logged?.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Case Investigation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Flagged Case Queue */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Flagged Risk Review Queue ({cases.length})</h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {cases.map((c) => (
              <div
                key={c.case_no}
                onClick={() => setSelectedCase(c)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  selectedCase?.case_no === c.case_no
                    ? 'bg-sky-500/10 border-sky-500 shadow'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 hover:border-sky-500/50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-sky-600 dark:text-sky-400 block">{c.land_identity_id}</span>
                    <span className="font-bold text-slate-900 dark:text-white block mt-0.5">Khata #{c.khata_no} • Khesra #{c.khesra_no}</span>
                  </div>
                  <RiskBadge level={c.risk_level} score={c.risk_score} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Selected Case Details & Decision Form */}
        {selectedCase && (
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6 text-xs transition-colors">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400 block">{selectedCase.land_identity_id}</span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedCase.mauza}, {selectedCase.anchal}, {selectedCase.district}
                </h2>
              </div>
              <RiskBadge level={selectedCase.risk_level} score={selectedCase.risk_score} size="lg" />
            </div>

            {/* Findings List */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs">Flagged Evidence Findings:</h4>
              {selectedCase.findings?.map((f: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="font-bold text-rose-600 dark:text-rose-400 block">{f.rule_id}: {f.title}</span>
                  <p className="text-slate-600 dark:text-slate-300">{f.description}</p>
                </div>
              ))}
            </div>

            {/* Officer Decision Form */}
            <form onSubmit={handleDecisionSubmit} className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs">Submit Revenue Officer Decision:</h4>

              {decisionMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{decisionMsg}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Official Decision Action</label>
                <select
                  value={decision}
                  onChange={e => setDecision(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white"
                >
                  <option value="REQUIRE_FIELD_VERIFICATION">Require Field Inquiry (Amin Verification)</option>
                  <option value="CITIZEN_CLARIFICATION">Issue Notice for Tenant Clarification</option>
                  <option value="DISMISS_FALSE_POSITIVE">Dismiss (Verified Clean Records)</option>
                  <option value="ESCALATE_TO_LRDC">Escalate to LRDC Bench</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Officer Remark / Findings Summary</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={3}
                  placeholder="Enter official revenue review comments..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow transition-colors"
              >
                Log Revenue Decision
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
