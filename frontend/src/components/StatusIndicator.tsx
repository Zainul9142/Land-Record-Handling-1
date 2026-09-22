import React from 'react';
import { RiskLevel } from '../types';

interface StatusIndicatorProps {
  summary: {
    khatian: RiskLevel;
    register2: RiskLevel;
    mutation: RiskLevel;
    transaction: RiskLevel;
    map: RiskLevel;
    court: RiskLevel;
    encumbrance: RiskLevel;
  };
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ summary }) => {
  const items = [
    { label: 'KHATIAN', key: 'khatian', value: summary.khatian },
    { label: 'REGISTER-II', key: 'register2', value: summary.register2 },
    { label: 'MUTATION', key: 'mutation', value: summary.mutation },
    { label: 'TRANSACTION', key: 'transaction', value: summary.transaction },
    { label: 'MAP', key: 'map', value: summary.map },
    { label: 'COURT INDICATOR', key: 'court', value: summary.court },
    { label: 'ENCUMBRANCE', key: 'encumbrance', value: summary.encumbrance },
  ];

  const getDot = (val: RiskLevel) => {
    if (val === 'LOW') return <span className="text-emerald-500 font-bold text-lg">🟢</span>;
    if (val === 'MEDIUM') return <span className="text-amber-500 font-bold text-lg">🟡</span>;
    return <span className="text-rose-500 font-bold text-lg">🔴</span>;
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800 shadow-lg">
      <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3 pb-2 border-b border-slate-800 flex justify-between items-center">
        <span>Multi-Record Integrity Matrix</span>
        <span className="text-[10px] text-slate-500">Live Synthesis Layer</span>
      </div>

      <div className="divide-y divide-slate-800/60">
        {items.map((item) => (
          <div key={item.key} className="py-2.5 flex items-center justify-between hover:bg-slate-800/40 px-2 rounded transition-colors">
            <span className="text-xs font-semibold text-slate-300 tracking-wide">{item.label}</span>
            <div className="flex items-center space-x-2">
              <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded ${
                item.value === 'LOW' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                item.value === 'MEDIUM' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                'bg-rose-950 text-rose-400 border border-rose-800'
              }`}>
                {item.value}
              </span>
              {getDot(item.value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
