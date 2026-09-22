import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, AlertTriangle, FileText, Download, ArrowRight, Lock, Calendar, Layers } from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';

export const ReportVerificationPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (reportId) {
      fetch(`/api/v1/reports/verify/${reportId}`)
        .then(res => res.json())
        .then(d => {
          setData(d);
          setLoading(false);
        })
        .catch(err => {
          console.error("Report verification failed", err);
          setLoading(false);
        });
    }
  }, [reportId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500">Verifying SHA-256 report signature ledger...</p>
      </div>
    );
  }

  if (!data || !data.verified) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/30">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Report Verification Failed</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {data?.message || `Report ID '${reportId}' was not issued by BhoomiShield or has been revoked.`}
          </p>
        </div>
        <Link to="/" className="inline-block px-5 py-2.5 bg-sky-600 text-white font-bold text-xs rounded-xl shadow">
          Return to Portal Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 transition-colors duration-300">
      {/* Verification Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-8 rounded-3xl shadow-xl text-center space-y-3 relative overflow-hidden">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-bold text-emerald-100">
          <ShieldCheck className="w-4 h-4 text-emerald-200" />
          <span>AUTHENTIC REPORT VERIFIED</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight">
          Report ID #{data.report_id}
        </h1>

        <p className="text-xs text-emerald-100 font-mono">
          Issued on {data.generated_at} • Data Snapshot Verified
        </p>
      </div>

      {/* Verified Details Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 transition-colors">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">VERIFIED LAND IDENTITY ID</span>
            <Link
              to={`/land/${data.land_identity_id}`}
              className="text-base font-bold text-sky-600 dark:text-sky-400 font-mono hover:underline"
            >
              {data.land_identity_id}
            </Link>
          </div>

          <RiskBadge level={data.risk_level} score={data.risk_score} size="lg" />
        </div>

        {/* Parcel Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">District</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">{data.district}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Anchal</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">{data.anchal}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Mauza</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">{data.mauza}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Khata No</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">#{data.khata_no}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Khesra No</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">#{data.khesra_no}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Area</span>
            <span className="font-bold text-sky-600 dark:text-sky-400 text-sm">{data.area_acre} Acres</span>
          </div>
        </div>

        {/* Cryptographic Report Signature Card */}
        <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs transition-colors">
          <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold block">
            CRYPTOGRAPHIC REPORT SIGNATURE :
          </span>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-sky-600 dark:text-sky-400 break-all select-all">
            SHA-256: {data.report_hash}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
          <Link
            to={`/land/${data.land_identity_id}`}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-2"
          >
            <span>View Live Land Profile</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href={`/api/v1/reports/download/${data.report_id}`}
            download
            className="w-full sm:w-auto px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Certified PDF</span>
          </a>
        </div>
      </div>
    </div>
  );
};
