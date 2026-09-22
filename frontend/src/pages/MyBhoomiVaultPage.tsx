import React, { useState, useEffect } from 'react';
import { Briefcase, Download, FileText, ShieldCheck, Plus, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RiskBadge } from '../components/RiskBadge';

export const MyBhoomiVaultPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/v1/vault/items')
      .then(res => res.json())
      .then(data => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load vault items", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-600 dark:text-sky-400 text-xs font-bold">
            <Briefcase className="w-4 h-4 text-sky-500" />
            <span>Citizen Digital Property Locker</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Bhoomi Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Secure locker storing your verified land reports, mutation certificates, deeds, and official grievance notices.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/search"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Land Parcel to Vault</span>
          </Link>
        </div>
      </div>

      {/* Vault Items List */}
      <div className="space-y-4">
        <h2 className="font-bold text-base text-slate-900 dark:text-white">
          Saved Property Documents ({items.length} Records)
        </h2>

        {loading ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-500">Decrypting citizen vault records...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs space-y-3">
            <p>Your Bhoomi Vault is empty. Search land parcels and click "Save to Vault" to add records here.</p>
            <Link to="/search" className="inline-block px-4 py-2 bg-sky-600 text-white font-bold rounded-lg text-xs">
              Go to Land Search
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-mono text-[11px] font-bold text-sky-600 dark:text-sky-400 block">
                        {item.land_identity_id}
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        {item.document_title}
                      </h3>
                    </div>
                  </div>
                  <RiskBadge level={item.risk_level || 'LOW'} showScore={false} size="sm" />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Saved on {item.saved_at}</span>
                  <Link
                    to={`/land/${item.land_identity_id}`}
                    className="font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center space-x-1"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
