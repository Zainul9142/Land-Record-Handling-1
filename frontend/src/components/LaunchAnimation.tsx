import React, { useState, useEffect } from 'react';
import { ShieldCheck, MapPin, Sparkles, Layers } from 'lucide-react';

interface LaunchAnimationProps {
  onComplete?: () => void;
}

export const LaunchAnimation: React.FC<LaunchAnimationProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'grid' | 'logo' | 'text' | 'fadeout' | 'hidden'>('grid');

  useEffect(() => {
    const t1 = setTimeout(() => setStage('logo'), 600);
    const t2 = setTimeout(() => setStage('text'), 1400);
    const t3 = setTimeout(() => setStage('fadeout'), 2600);
    const t4 = setTimeout(() => {
      setStage('hidden');
      if (onComplete) onComplete();
    }, 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  if (stage === 'hidden') return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950 text-white overflow-hidden transition-opacity duration-700 ease-out ${
        stage === 'fadeout' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 3D Topographic Scan Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c7_1px,transparent_1px),linear-gradient(to_bottom,#0284c7_1px,transparent_1px)] bg-[size:40px_40px] opacity-15 animate-pulse"></div>

      {/* Animated Radar Scanning Line */}
      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_15px_#38bdf8] animate-scanline pointer-events-none"></div>

      {/* Floating Topographic Contour Rings */}
      <div className="absolute w-[600px] h-[600px] border border-sky-500/20 rounded-full animate-ping opacity-25"></div>
      <div className="absolute w-[400px] h-[400px] border border-emerald-500/30 rounded-full animate-pulse opacity-40"></div>

      {/* Center Intro Card */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-6 px-4 max-w-lg">
        {/* Assembling Shield Crest */}
        <div
          className={`p-4 bg-gradient-to-tr from-sky-600 via-indigo-600 to-emerald-500 rounded-3xl shadow-[0_0_50px_rgba(2,132,199,0.5)] transition-all duration-700 ${
            stage === 'grid' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          <ShieldCheck className="w-16 h-16 text-white animate-bounce" />
        </div>

        {/* Text Reveal & Subtitles */}
        <div
          className={`space-y-2 transition-all duration-700 delay-200 ${
            stage === 'text' || stage === 'fadeout' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-sky-500/20 border border-sky-400/30 text-sky-400 text-xs font-bold rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GOVERNMENT OF JHARKHAND REVENUE LAYER</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-sky-200 to-emerald-400 bg-clip-text text-transparent">
            BHOOMISHIELD
          </h1>

          <p className="text-xs text-slate-300 font-medium tracking-wide">
            AI-Powered Land Identity, Verification & Risk Intelligence
          </p>

          <div className="pt-3 flex items-center justify-center space-x-3 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>Jharbhoomi</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Layers className="w-3 h-3 text-sky-400" />
              <span>JharBhuNaksha 3D</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
