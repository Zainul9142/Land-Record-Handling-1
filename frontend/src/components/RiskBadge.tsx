import React from 'react';
import { RiskLevel } from '../types';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, showScore = true, size = 'md' }) => {
  let bgColor = 'bg-emerald-50 text-emerald-700 border-emerald-300';
  let icon = <ShieldCheck className="w-4 h-4 text-emerald-600" />;
  let dotColor = 'bg-emerald-500';

  if (level === 'MEDIUM') {
    bgColor = 'bg-amber-50 text-amber-800 border-amber-300';
    icon = <AlertTriangle className="w-4 h-4 text-amber-600" />;
    dotColor = 'bg-amber-500';
  } else if (level === 'HIGH') {
    bgColor = 'bg-rose-50 text-rose-800 border-rose-300';
    icon = <AlertOctagon className="w-4 h-4 text-rose-600" />;
    dotColor = 'bg-rose-500';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm font-semibold',
    lg: 'px-4 py-2 text-base font-bold'
  };

  return (
    <span className={`inline-flex items-center space-x-1.5 rounded-full border shadow-sm ${bgColor} ${sizeClasses[size]}`}>
      <span className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`}></span>
      <span>{level} RISK</span>
      {showScore && score !== undefined && (
        <span className="opacity-80 font-mono text-[11px] bg-white/60 px-1.5 py-0.2 rounded border border-current">
          {score}/100
        </span>
      )}
    </span>
  );
};
