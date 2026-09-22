import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { SupportedLanguage } from '../i18n/translations';
import { UserProfileModal } from './UserProfileModal';
import { 
  ShieldCheck, Search, Lock, Languages, UserCheck, Scale, 
  ShieldAlert, Menu, X, Globe2, FolderLock, Landmark, 
  LogIn, LogOut, User as UserIcon, ChevronDown, Calculator, Database,
  Sparkles, Compass, FileCheck, Layers, Grid, ArrowRight, ExternalLink, BadgeCheck, FileText,
  Palette, Sun, Moon, Settings, Edit3
} from 'lucide-react';

interface NavbarProps {
  lang?: string;
  setLang?: (l: any) => void;
  userRole?: string;
  setUserRole?: (role: string) => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const location = useLocation();
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const { user, isAuthenticated, isOfficial, isAdmin, logout } = useAuth();
  const { lang, setLang, t, currentLangInfo, languages } = useLanguage();
  const { theme, setTheme, currentThemeInfo, themes } = useTheme();
  const isEn = lang === 'en';

  const toggleMenuDrawer = () => setMenuDrawerOpen(!menuDrawerOpen);
  const closeMenuDrawer = () => setMenuDrawerOpen(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl text-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border-b border-emerald-100">
        {/* Top Govt Bar */}
        <div className="bg-emerald-950 px-4 py-1.5 text-xs text-emerald-100 flex justify-end items-center">
          
          <div className="flex items-center space-x-2.5 shrink-0">
            {/* 🎨 Theme Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setThemeDropdownOpen(!themeDropdownOpen);
                  setLangDropdownOpen(false);
                }}
                className="flex items-center space-x-1.5 hover:text-white transition-colors text-emerald-200 font-semibold bg-emerald-900/50 border border-emerald-800/80 px-2.5 py-1 rounded-lg text-xs cursor-pointer"
                title="Change Color Theme (Dark, Light, Emerald Bhoomi, Cyber)"
              >
                <span>{currentThemeInfo.icon}</span>
                <span className="hidden sm:inline">{currentThemeInfo.name}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {themeDropdownOpen && (
                <div 
                  className="absolute right-0 mt-1 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 py-1.5 divide-y divide-slate-800"
                  onMouseLeave={() => setThemeDropdownOpen(false)}
                >
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center space-x-1.5">
                    <Palette className="w-3.5 h-3.5 text-sky-400" />
                    <span>Select Color Theme (4)</span>
                  </div>
                  <div className="py-1">
                    {themes.map((th) => (
                      <button
                        key={th.id}
                        onClick={() => {
                          setTheme(th.id);
                          setThemeDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                          theme === th.id ? 'bg-sky-950/80 text-sky-400 font-bold' : 'text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="text-base">{th.icon}</span>
                          <div>
                            <span className="block font-semibold">{th.name} ({th.nativeName})</span>
                            <span className="text-[10px] text-slate-400 font-normal">{th.description}</span>
                          </div>
                        </div>
                        {theme === th.id && <span className="text-sky-400 font-bold">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 11 Indian Languages Dropdown Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setLangDropdownOpen(!langDropdownOpen);
                  setThemeDropdownOpen(false);
                }}
                className="flex items-center space-x-1.5 hover:text-white transition-colors text-emerald-200 font-semibold bg-emerald-900/50 border border-emerald-800/80 px-2.5 py-1 rounded-lg text-xs cursor-pointer"
                title="Change Language across 11 Indian Languages"
              >
                <span>{currentLangInfo.flag}</span>
                <span>{currentLangInfo.nativeName}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {langDropdownOpen && (
                <div 
                  className="absolute right-0 mt-1 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 py-1.5 divide-y divide-slate-800 max-h-80 overflow-y-auto"
                  onMouseLeave={() => setLangDropdownOpen(false)}
                >
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Select Regional Language (11)
                  </div>
                  <div className="py-1">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLang(l.code as SupportedLanguage);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                          lang === l.code ? 'bg-sky-950/80 text-sky-400 font-bold' : 'text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span>{l.flag}</span>
                          <span>{l.nativeName} ({l.name})</span>
                        </div>
                        {lang === l.code && <span className="text-sky-400">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Auth Status & User Profile Trigger */}
            {isAuthenticated && user ? (
              <div className="hidden sm:flex items-center space-x-2 bg-emerald-900/50 px-2.5 py-1 rounded-lg border border-emerald-800/80 text-emerald-100">
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="flex items-center space-x-2 hover:text-white transition-colors cursor-pointer group"
                  title="Click to view & edit your profile details"
                >
                  <img
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40'}
                    alt={user.full_name}
                    className="w-4 h-4 rounded-full object-cover ring-1 ring-sky-400 group-hover:scale-110 transition-transform"
                  />
                  <span className="text-[11px] font-bold text-white max-w-[120px] truncate">{user.full_name}</span>
                  <Edit3 className="w-2.5 h-2.5 text-sky-400 opacity-70 group-hover:opacity-100" />
                </button>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                  isAdmin ? 'bg-purple-950 text-purple-300 border border-purple-800' : isOfficial ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-sky-950 text-sky-400 border border-sky-800'
                }`}>
                  {isAdmin ? 'Admin' : isOfficial ? 'Official' : 'Citizen'}
                </span>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="text-slate-400 hover:text-rose-400 ml-1 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center space-x-1 text-emerald-200 hover:text-white font-semibold bg-emerald-900/50 px-3 py-1 rounded-lg border border-emerald-800/80"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isEn ? "Sign In / Register" : "लॉग इन / रजिस्टर"}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Main Clean Navbar Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Top Left: Menu Button & Platform Logo */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* 🌟 Dedicated Top-Left Menu Trigger Button */}
            <button
              onClick={toggleMenuDrawer}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 border cursor-pointer ${
                menuDrawerOpen
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-inner'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-emerald-300 shadow-sm'
              }`}
              title="Open All Features & Services Menu"
            >
              {menuDrawerOpen ? (
                <X className="w-4 h-4 text-emerald-600" />
              ) : (
                <Menu className="w-4 h-4 text-emerald-600" />
              )}
              <span className="font-extrabold tracking-wide">{isEn ? "Menu" : "मेनू"}</span>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold">
                11+
              </span>
            </button>

            {/* Platform Logo & DILRMP National Layer Badge */}
            <Link to="/" onClick={closeMenuDrawer} className="flex items-center space-x-2.5 group">
              <div className="p-2 bg-gradient-to-tr from-emerald-500 to-emerald-700 rounded-xl shadow-lg shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg sm:text-2xl tracking-tight text-slate-900 leading-tight">BhoomiShield</span>
                <span className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase">DILRMP National Layer</span>
              </div>
            </Link>
          </div>

          {/* Desktop Right Quick Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Quick Land Search Link */}
            <Link
              to="/search"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all hidden md:flex items-center space-x-2 border ${
                location.pathname === '/search' || location.pathname === '/land-search'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200 hover:border-emerald-300'
              }`}
            >
              <Search className="w-4 h-4 text-emerald-600" />
              <span>{isEn ? "Land Search" : "भूमि खोज"}</span>
            </Link>

            {/* Quick Vault Link */}
            <Link
              to="/vault"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all hidden md:flex items-center space-x-2 border ${
                location.pathname === '/vault'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200 hover:border-emerald-300'
              }`}
            >
              <FolderLock className="w-4 h-4 text-emerald-600" />
              <span>{isEn ? "My Vault" : "मेरी वॉल्ट"}</span>
            </Link>

            {/* Account / User Profile Pill */}
            {!isAuthenticated ? (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{isEn ? "Sign In" : "लॉग इन"}</span>
              </Link>
            ) : (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-sm"
                  title="Manage Profile & Security Settings"
                >
                  <img
                    src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40'}
                    alt="Profile"
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  <span>{user?.full_name?.split(' ')[0] || 'Profile'}</span>
                  <Settings className="w-3 h-3 text-sky-400" />
                </button>
                <Link
                  to="/login"
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
                  title="Switch Persona Account"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 🌟 MEGA MENU DRAWER & FEATURE MODAL (SLIDES FROM LEFT) */}
      {menuDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-start animate-in fade-in duration-200">
          
          {/* Backdrop Click to Close */}
          <div className="fixed inset-0" onClick={closeMenuDrawer}></div>

          {/* Slide-over Content Panel */}
          <div className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl border-r border-emerald-100 shadow-[20px_0_50px_rgba(0,0,0,0.1)] h-full flex flex-col z-10 overflow-y-auto">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-emerald-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-20">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 border border-emerald-200">
                  <Grid className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-black text-slate-800 tracking-tight uppercase">
                  {isEn ? "Features & Services" : "सेवाएँ एवं मेनू"}
                </h2>
              </div>

              <button
                onClick={closeMenuDrawer}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Close Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Feature Options (Represented by Name Only) */}
            <div className="p-5 space-y-6 flex-1">
              
              {/* Category 1: National Layer & Land Discovery */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider px-1 mb-1">
                  1. National Layer & Land Discovery
                </div>

                <Link
                  to="/"
                  onClick={closeMenuDrawer}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all font-semibold text-xs group"
                >
                  <div className="flex items-center space-x-3">
                    <Globe2 className="w-4 h-4 text-sky-500" />
                    <span>National Portal Overview</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  to="/search"
                  onClick={closeMenuDrawer}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all font-semibold text-xs group"
                >
                  <div className="flex items-center space-x-3">
                    <Search className="w-4 h-4 text-emerald-500" />
                    <span>Universal Land Search</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  to="/check-buy"
                  onClick={closeMenuDrawer}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all font-semibold text-xs group"
                >
                  <div className="flex items-center space-x-3">
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    <span>Check Before You Buy</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  to="/track-mutation"
                  onClick={closeMenuDrawer}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all font-semibold text-xs group"
                >
                  <div className="flex items-center space-x-3">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Live Mutation Tracker</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  to="/valuation"
                  onClick={closeMenuDrawer}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all font-semibold text-xs group"
                >
                  <div className="flex items-center space-x-3">
                    <Calculator className="w-4 h-4 text-amber-500" />
                    <span>Stamp Duty & Valuation</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  to="/verify"
                  onClick={closeMenuDrawer}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all font-semibold text-xs group"
                >
                  <div className="flex items-center space-x-3">
                    <FileCheck className="w-4 h-4 text-sky-500" />
                    <span>Report Verification</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Category 2: Citizen Rights & Locker */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider px-1 mb-1">
                  2. Citizen Locker & Legal Redressal
                </div>

                <Link
                  to="/vault"
                  onClick={closeMenuDrawer}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all font-semibold text-xs group"
                >
                  <div className="flex items-center space-x-3">
                    <FolderLock className="w-4 h-4 text-sky-500" />
                    <span>My Bhoomi Vault</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  to="/legal-advisor"
                  onClick={closeMenuDrawer}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all font-semibold text-xs group"
                >
                  <div className="flex items-center space-x-3">
                    <Scale className="w-4 h-4 text-emerald-500" />
                    <span>AI Legal Advisor</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  to="/complaints"
                  onClick={closeMenuDrawer}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all font-semibold text-xs group"
                >
                  <div className="flex items-center space-x-3">
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    <span>Grievance Portal</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Category 3: Authorized Portals */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1 mb-1">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                    3. Authorized Portals (Protected)
                  </span>
                  <span className="text-[9px] bg-rose-100 text-rose-600 border border-rose-200 px-1.5 py-0.2 rounded font-mono uppercase font-bold">
                    Credentials
                  </span>
                </div>

                <Link
                  to="/official"
                  onClick={closeMenuDrawer}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-50/50 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 border border-emerald-100 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all font-semibold text-xs group"
                >
                  <div className="flex items-center space-x-3">
                    <Landmark className="w-4 h-4 text-emerald-600" />
                    <span>Revenue Officer Workspace</span>
                  </div>
                  <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white border border-emerald-700 uppercase shadow-sm">
                    Officer Gate
                  </span>
                </Link>

                <Link
                  to="/admin"
                  onClick={closeMenuDrawer}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-purple-50/50 hover:bg-purple-100 text-slate-700 hover:text-purple-800 border border-purple-100 hover:border-purple-300 shadow-sm hover:shadow-md transition-all font-semibold text-xs group"
                >
                  <div className="flex items-center space-x-3">
                    <Database className="w-4 h-4 text-purple-600" />
                    <span>Central DB & Admin Panel</span>
                  </div>
                  <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-purple-600 text-white border border-purple-700 uppercase shadow-sm">
                    Admin Gate
                  </span>
                </Link>

                <Link
                  to="/login"
                  onClick={closeMenuDrawer}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-sky-50/50 hover:bg-sky-100 text-slate-700 hover:text-sky-800 border border-sky-100 hover:border-sky-300 shadow-sm hover:shadow-md transition-all font-semibold text-xs group"
                >
                  <div className="flex items-center space-x-3">
                    <UserCheck className="w-4 h-4 text-sky-600" />
                    <span>Single Sign-On Gateway</span>
                  </div>
                  <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-sky-600 text-white border border-sky-700 uppercase shadow-sm">
                    Sign In / Switch
                  </span>
                </Link>
              </div>

              {/* Theme Selector Section in Drawer */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                    <Palette className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Visual Theme / दृश्य थीम</span>
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">{currentThemeInfo.name}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {themes.map((th) => (
                    <button
                      key={th.id}
                      onClick={() => setTheme(th.id)}
                      className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 border transition-all cursor-pointer ${
                        theme === th.id
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-300 shadow-sm'
                          : 'bg-slate-50 hover:bg-white text-slate-600 border-slate-200 hover:border-emerald-200 hover:shadow-sm'
                      }`}
                    >
                      <span>{th.icon}</span>
                      <span className="text-[11px] truncate">{th.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-emerald-100 bg-emerald-50 text-center text-[10px] font-semibold text-emerald-700">
              BhoomiShield National Land Governance Platform • DILRMP Compliant
            </div>

          </div>
        </div>
      )}

      {/* User Profile & Account Settings Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
};


