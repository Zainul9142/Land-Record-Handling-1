import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Search, Briefcase, Menu, Sun, Moon, Languages, UserCheck, Sparkles, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  lang: 'en' | 'hi';
  setLang: (l: 'en' | 'hi') => void;
  userRole: string;
  setUserRole: (role: string) => void;
  onOpenMenuDrawer: () => void;
  onOpenAuthModal: () => void;
  onReplayIntro?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ lang, setLang, userRole, setUserRole, onOpenMenuDrawer, onOpenAuthModal, onReplayIntro }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isEn = lang === 'en';

  return (
    <header className="sticky top-0 z-50 transition-colors duration-300 bg-slate-950 text-white shadow-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left Side: Menu 11+ Button & Brand Logo */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenMenuDrawer}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-white font-extrabold text-xs flex items-center space-x-2 transition-all hover:scale-105 shadow-md"
          >
            <Menu className="w-4 h-4 text-sky-400" />
            <span>Menu</span>
            <span className="text-[10px] font-bold bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded border border-sky-500/30">
              11+
            </span>
          </button>

          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="p-2 bg-gradient-to-tr from-sky-600 to-indigo-600 rounded-xl shadow-md group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white">BhoomiShield</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-sky-400 block -mt-1 tracking-wider">
                DILRMP NATIONAL LAYER
              </span>
            </div>
          </Link>
        </div>

        {/* Right Side: Land Search, My Vault, User Badge, Theme & Lang */}
        <div className="flex items-center space-x-3 text-xs">
          <Link
            to="/search"
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all font-semibold"
          >
            <Search className="w-4 h-4 text-sky-400" />
            <span>Land Search</span>
          </Link>

          <Link
            to="/vault"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all font-semibold"
          >
            <Briefcase className="w-4 h-4 text-sky-400" />
            <span>My Vault</span>
          </Link>

          {/* User Role Badge (Click opens AuthModal) */}
          <button
            onClick={onOpenAuthModal}
            className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-200 transition-all hover:scale-105"
            title="Click to Switch User Role / Sign In"
          >
            <User className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-bold">Ramesh Sharma</span>
            <span className="text-[9px] font-extrabold bg-emerald-950 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-800 uppercase">
              {userRole}
            </span>
          </button>

          {/* Theme Dropdown */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 transition-all flex items-center space-x-1 font-semibold text-xs shadow-sm"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <>
                <Moon className="w-4 h-4 text-sky-400" />
                <span className="hidden md:inline">Dark Midnight</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline">Light Mode</span>
              </>
            )}
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLang(isEn ? 'hi' : 'en')}
            className="flex items-center space-x-1 p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold"
          >
            <Languages className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">{isEn ? "English" : "हिंदी"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
