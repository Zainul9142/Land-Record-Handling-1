import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Search, FileCheck, AlertTriangle, ArrowRight, CheckCircle2, Layers, Cpu, QrCode, Globe2, MapPin, Sparkles, Navigation, FolderLock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HomePageProps {
  lang?: string;
}

export const HomePage: React.FC<HomePageProps> = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const isEn = lang === 'en';
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const stateDemos = [
    { state: 'Jharkhand', dist: 'Bokaro', sub: 'Chas', id: 'JH-BOK-CHA-KURA-K125-K450-2', label: 'Jharkhand (Bokaro / Chas)' },
    { state: 'Uttar Pradesh', dist: 'Gautam Buddha Nagar (Noida)', sub: 'Dadri', id: 'UP-GAU-DAD-BHAN-P340-PL112-1', label: 'Uttar Pradesh (Noida / Dadri)' },
    { state: 'Maharashtra', dist: 'Pune', sub: 'Haveli', id: 'MH-PUN-HAV-HINJ-G145-P23-B', label: 'Maharashtra (Pune / Hinjawadi 7/12)' },
    { state: 'Karnataka', dist: 'Bengaluru Urban', sub: 'Bengaluru South', id: 'KA-BLR-SOU-WHIT-S89-P3-A', label: 'Karnataka (Bengaluru / RTC Pahani)' },
    { state: 'Bihar', dist: 'Patna', sub: 'Danapur', id: 'BR-PAT-DAN-KHAG-K201-P56-3', label: 'Bihar (Patna / Danapur)' },
    { state: 'Delhi', dist: 'South Delhi', sub: 'Hauz Khas', id: 'DL-SOU-HAU-MEH-K56-P12-A', label: 'Delhi (Hauz Khas / Mehrauli)' }
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Full-Screen Landscape Hero Section */}
      <section className="relative w-full min-h-[85vh] flex flex-col justify-center items-center pt-20 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-[2rem] shadow-2xl">
        {/* Photorealistic Background Image */}
        <div className="absolute inset-0 z-0">
          <img src="/landscape_bg.jpg" alt="Lush Green Agricultural Land India" className="w-full h-full object-cover object-center" />
          {/* Subtle gradient overlay to make text readable but keep the landscape stunningly visible */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/60"></div>
        </div>

        <div className="max-w-5xl w-full mx-auto text-center space-y-10 relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white text-sm font-semibold shadow-lg">
            <Globe2 className="w-5 h-5 text-emerald-400" />
            <span>
              {t('national_layer', 'Digital India Land Records Modernization Programme • 28 States & 8 UTs National Layer')}
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
            {t('hero_title', 'Digital India Land Records')}
            <span className="block text-3xl sm:text-4xl lg:text-5xl mt-2 font-semibold text-emerald-300">Modernization Programme</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-md">
            {t('hero_subtitle', 'Instant unified access to 7/12 Extracts, Khatauni RoR, RTC Pahani, Patta Chitta, and AI mutation fraud prevention across all 28 Indian States & 8 UTs.')}
          </p>

          {/* Massive Center Glass Search Bar */}
          <div className="w-full max-w-4xl mx-auto mt-8 relative z-20">
            <div className="bg-white/15 backdrop-blur-2xl p-4 sm:p-5 rounded-2xl border border-white/30 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full flex items-center">
                  <Search className="absolute left-6 w-6 h-6 text-white/70" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isEn ? "Search your property by State, District, Khata or Owner Name..." : "राज्य, ज़िला, खाता/गाटा/सर्वे सं., या मालिक का नाम खोजें..."}
                    className="w-full pl-16 pr-6 py-4 bg-transparent border-none text-lg text-white placeholder-white/70 focus:outline-none focus:ring-0"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
                >
                  <span>{isEn ? "Search Records" : "खोजें"}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>

              {/* Quick State Presets (Glass Pills) */}
              <div className="mt-8 pt-6 border-t border-white/20 flex flex-wrap items-center justify-center gap-3 text-sm">
                <span className="text-white font-semibold flex items-center space-x-2 mr-2 drop-shadow-md">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Popular States:</span>
                </span>
                {stateDemos.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate(`/land/${s.id}`)}
                    className="px-4 py-2 bg-black/40 hover:bg-emerald-600/80 border border-white/20 rounded-lg text-xs font-semibold transition-all text-white cursor-pointer backdrop-blur-md"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* State Portals Integration Ribbon (Floating Over Landscape Edge) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-20">
        <div className="bg-gradient-to-br from-white/95 via-white/85 to-emerald-50/90 backdrop-blur-3xl p-6 sm:p-8 rounded-[2rem] border border-white/80 shadow-[0_16px_40px_rgba(0,0,0,0.1)] space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center space-x-2">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <Globe2 className="w-6 h-6 text-emerald-600" />
                </div>
                <span>Multi-State Land Record Portals Integration Network</span>
              </h3>
              <p className="text-sm sm:text-base text-slate-500 mt-2 ml-12">
                Connected with official State Revenue Record Streams and Cadastral GIS layers across India
              </p>
            </div>
            <Link
              to="/search"
              className="px-6 py-3 bg-slate-50 hover:bg-emerald-50 text-emerald-700 text-sm font-bold rounded-xl transition-colors flex items-center space-x-2 shrink-0 border border-slate-200 hover:border-emerald-200"
            >
              <span>Launch Pan-India Explorer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link to="/search?state=Uttar+Pradesh" className="group relative bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-sky-300 text-center space-y-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/15 overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-sky-500/10 rounded-full blur-xl -mr-8 -mt-8 group-hover:bg-sky-500/20 transition-all"></div>
              <div className="font-extrabold text-sky-600 text-base relative z-10">UP Bhulekh</div>
              <div className="text-xs text-slate-500 font-medium relative z-10">Uttar Pradesh (Gata/Khatauni)</div>
              <div className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 border border-emerald-100 inline-block px-2 py-0.5 rounded-md relative z-10 shadow-sm">● Real-Time API</div>
            </Link>

            <Link to="/search?state=Maharashtra" className="group relative bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-emerald-300 text-center space-y-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/15 overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl -mr-8 -mt-8 group-hover:bg-emerald-500/20 transition-all"></div>
              <div className="font-extrabold text-emerald-600 text-base relative z-10">Mahabhulekh 7/12</div>
              <div className="text-xs text-slate-500 font-medium relative z-10">Maharashtra (Saat Bara)</div>
              <div className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 border border-emerald-100 inline-block px-2 py-0.5 rounded-md relative z-10 shadow-sm">● Real-Time API</div>
            </Link>

            <Link to="/search?state=Karnataka" className="group relative bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-amber-400 text-center space-y-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/15 overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl -mr-8 -mt-8 group-hover:bg-amber-500/20 transition-all"></div>
              <div className="font-extrabold text-amber-600 text-base relative z-10">Bhoomi RTC</div>
              <div className="text-xs text-slate-500 font-medium relative z-10">Karnataka (Pahani/Survey)</div>
              <div className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 border border-emerald-100 inline-block px-2 py-0.5 rounded-md relative z-10 shadow-sm">● Real-Time API</div>
            </Link>

            <Link to="/search?state=Jharkhand" className="group relative bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-indigo-300 text-center space-y-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/15 overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl -mr-8 -mt-8 group-hover:bg-indigo-500/20 transition-all"></div>
              <div className="font-extrabold text-indigo-600 text-base relative z-10">Jharbhoomi</div>
              <div className="text-xs text-slate-500 font-medium relative z-10">Jharkhand (Khata/Khesra)</div>
              <div className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 border border-emerald-100 inline-block px-2 py-0.5 rounded-md relative z-10 shadow-sm">● Real-Time API</div>
            </Link>

            <Link to="/search?state=Bihar" className="group relative bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-rose-300 text-center space-y-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-500/15 overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-full blur-xl -mr-8 -mt-8 group-hover:bg-rose-500/20 transition-all"></div>
              <div className="font-extrabold text-rose-600 text-base relative z-10">BiharBhumi</div>
              <div className="text-xs text-slate-500 font-medium relative z-10">Bihar (DCLR/Jamabandi)</div>
              <div className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 border border-emerald-100 inline-block px-2 py-0.5 rounded-md relative z-10 shadow-sm">● Real-Time API</div>
            </Link>

            <Link to="/search?state=Tamil+Nadu" className="group relative bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-teal-300 text-center space-y-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-500/15 overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/10 rounded-full blur-xl -mr-8 -mt-8 group-hover:bg-teal-500/20 transition-all"></div>
              <div className="font-extrabold text-teal-600 text-base relative z-10">Patta Chitta</div>
              <div className="text-xs text-slate-500 font-medium relative z-10">Tamil Nadu (e-Services)</div>
              <div className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 border border-emerald-100 inline-block px-2 py-0.5 rounded-md relative z-10 shadow-sm">● Real-Time API</div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
