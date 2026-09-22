import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, User, Lock, KeyRound, Building2, Landmark, 
  BadgeCheck, CheckCircle2, ArrowRight, UserCheck, AlertCircle, 
  Fingerprint, Sparkles, MapPin, Briefcase, FileText, Eye, EyeOff, Check, X
} from 'lucide-react';

interface AuthPageProps {
  onShowToast?: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onShowToast }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, demoLogin, demoUsers, loading } = useAuth();

  const [activeTab, setActiveTab] = useState<'CITIZEN' | 'OFFICIAL' | 'ADMIN'>('CITIZEN');
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(() => {
    return location.pathname === '/register';
  });

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('ramesh_sharma');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('Citizen@Ramesh2026#');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Officer / Admin specific fields
  const [employeeId, setEmployeeId] = useState('UP-REV-OFF-8821');
  const [department, setDepartment] = useState('Revenue & Land Reforms');
  const [designation, setDesignation] = useState('Tahsildar / Circle Officer');
  const [state, setState] = useState('Uttar Pradesh');
  const [district, setDistrict] = useState('Gautam Buddha Nagar');
  const [tehsil, setTehsil] = useState('Dadri');
  
  // Citizen KYC simulation
  const [aadhaarLast4, setAadhaarLast4] = useState('5412');
  const [panNumber, setPanNumber] = useState('ABCPS1234F');
  
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Tab Switch default credentials
  const handleTabChange = (tab: 'CITIZEN' | 'OFFICIAL' | 'ADMIN') => {
    setActiveTab(tab);
    setErrorMsg('');
    if (tab === 'CITIZEN') {
      setUsername('ramesh_sharma');
      setPassword('Citizen@Ramesh2026#');
      setDepartment('General Public');
      setDesignation('Landowner & Citizen');
    } else if (tab === 'OFFICIAL') {
      setUsername('tahsildar_dadri');
      setPassword('Officer@Dadri2026#');
      setEmployeeId('UP-REV-OFF-8821');
      setDepartment('Revenue & Land Reforms Department');
      setDesignation('Tahsildar / Circle Officer');
    } else if (tab === 'ADMIN') {
      setUsername('admin_dilrmp');
      setPassword('Admin@BhoomiShield2026#');
      setEmployeeId('NIC-DILRMP-001');
      setDepartment('Ministry of Rural Development (DoLR)');
      setDesignation('National Technical Director');
    }
  };

  // Update register mode if route changes
  useEffect(() => {
    if (location.pathname === '/register') {
      setIsRegisterMode(true);
    } else if (location.pathname === '/login') {
      setIsRegisterMode(false);
    }
  }, [location.pathname]);

  const handleDemoSelect = async (demoUserId: string) => {
    setErrorMsg('');
    const success = await demoLogin(demoUserId);
    if (success) {
      const selected = demoUsers.find(u => u.user_id === demoUserId);
      if (onShowToast) {
        onShowToast('success', 'Logged in successfully', `Active persona: ${selected?.full_name} (${selected?.role})`);
      }
      if (selected?.role === 'CITIZEN') {
        navigate('/vault');
      } else if (selected?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/official');
      }
    } else {
      setErrorMsg('Failed to login with demo account.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isRegisterMode) {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your Full Legal Name.');
        return;
      }
      if (!email.trim() && !username.trim()) {
        setErrorMsg('Please enter your Email or Username.');
        return;
      }
      if (!password.trim()) {
        setErrorMsg('Please enter a secure password.');
        return;
      }
      if (password.length < 4) {
        setErrorMsg('Password should be at least 4 characters long.');
        return;
      }
      if (confirmPassword && password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please re-enter your password.');
        return;
      }

      const effectiveUsername = username.trim() || email.split('@')[0];
      const effectiveEmail = email.trim() || (username.includes('@') ? username : `${effectiveUsername}@example.in`);

      const regRole = activeTab === 'CITIZEN' ? 'CITIZEN' : activeTab === 'ADMIN' ? 'ADMIN' : 'REVENUE_OFFICER';

      const regData = {
        username: effectiveUsername,
        password: password,
        full_name: fullName.trim(),
        email: effectiveEmail,
        mobile: mobile.trim() || '+91 98765 43210',
        role: regRole,
        department: activeTab === 'CITIZEN' ? 'General Public' : department,
        designation: activeTab === 'CITIZEN' ? 'Landowner & Citizen' : designation,
        employee_id: activeTab === 'CITIZEN' ? null : employeeId,
        jurisdiction_state: state,
        jurisdiction_district: district,
        jurisdiction_tehsil: tehsil,
        aadhaar_last4: aadhaarLast4 || "5412",
        pan_number: panNumber || "ABCPS1234F"
      };

      const result = await register(regData);
      if (result.success) {
        if (onShowToast) onShowToast('success', 'Registration Successful', `Welcome ${fullName}! Your BhoomiShield account is ready.`);
        if (activeTab === 'CITIZEN') navigate('/vault');
        else if (activeTab === 'ADMIN') navigate('/admin');
        else navigate('/official');
      } else {
        setErrorMsg(result.message);
      }
    } else {
      const loginIdentifier = username.trim() || email.trim();
      if (!loginIdentifier) {
        setErrorMsg('Please enter your Username or Registered Email.');
        return;
      }
      if (!password.trim()) {
        setErrorMsg('Please enter your Password.');
        return;
      }

      const result = await login(loginIdentifier, password);
      if (result.success) {
        if (onShowToast) onShowToast('success', 'Welcome Back', result.message);
        if (activeTab === 'CITIZEN') navigate('/vault');
        else if (activeTab === 'ADMIN') navigate('/admin');
        else navigate('/official');
      } else {
        setErrorMsg(result.message);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>National DILRMP Single Sign-On Gateway</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            BhoomiShield Secure Access Portal
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Access your encrypted land document locker, track property mutation rights, or sign official revenue orders across all 28 Indian States & 8 UTs.
          </p>
        </div>

        {/* Fast One-Click Demo Personas Strip */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-sky-400 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>⚡ 1-Click Instant Demo Login (For Evaluators & Testing)</span>
            </div>
            <span className="text-[11px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
              Click any profile below to sign in instantly
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {demoUsers.map((demo) => {
              const isAdminUser = demo.role === 'ADMIN';
              const isOfficer = demo.role !== 'CITIZEN' && !isAdminUser;
              return (
                <button
                  key={demo.user_id}
                  onClick={() => handleDemoSelect(demo.user_id)}
                  className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-750 hover:border-sky-500 border border-slate-700 transition-all text-left group cursor-pointer"
                >
                  <img
                    src={demo.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'}
                    alt={demo.full_name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-600 group-hover:border-sky-400 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-white truncate group-hover:text-sky-300">
                        {demo.full_name.split(' ')[0]} {demo.full_name.split(' ')[1] || ''}
                      </span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase shrink-0 ${
                        isAdminUser 
                          ? 'bg-purple-950/90 text-purple-300 border border-purple-800' 
                          : isOfficer 
                            ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-800' 
                            : 'bg-sky-950/90 text-sky-300 border border-sky-800'
                      }`}>
                        {isAdminUser ? 'Admin' : isOfficer ? 'Official' : 'Citizen'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      {demo.designation || demo.role}
                    </p>
                    <p className="text-[9px] text-slate-500 truncate flex items-center space-x-1">
                      <MapPin className="w-2.5 h-2.5 inline text-slate-400" />
                      <span>{demo.jurisdiction_district || 'Central'}</span>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Portal Card */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Triple Tab Switcher for Citizen vs Official vs Admin */}
          <div className="grid grid-cols-3 border-b border-slate-700 text-center font-semibold text-xs sm:text-sm">
            <button
              onClick={() => handleTabChange('CITIZEN')}
              className={`py-3.5 px-3 sm:px-6 flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'CITIZEN'
                  ? 'bg-slate-800 text-sky-400 border-b-2 border-sky-500 shadow-inner font-bold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <User className="w-4 h-4 text-sky-400" />
              <span>1. Citizen Locker</span>
            </button>
            <button
              onClick={() => handleTabChange('OFFICIAL')}
              className={`py-3.5 px-3 sm:px-6 flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'OFFICIAL'
                  ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-500 shadow-inner font-bold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Landmark className="w-4 h-4 text-emerald-400" />
              <span>2. Revenue Official</span>
            </button>
            <button
              onClick={() => handleTabChange('ADMIN')}
              className={`py-3.5 px-3 sm:px-6 flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'ADMIN'
                  ? 'bg-slate-800 text-purple-400 border-b-2 border-purple-500 shadow-inner font-bold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Lock className="w-4 h-4 text-purple-400" />
              <span>3. National Admin</span>
            </button>
          </div>

          {/* Mode Switcher: Sign In vs Register */}
          <div className="px-6 sm:px-8 pt-6">
            <div className="flex items-center justify-between p-1 bg-slate-900/90 rounded-xl border border-slate-700 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => { setIsRegisterMode(false); setErrorMsg(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  !isRegisterMode
                    ? activeTab === 'ADMIN' ? 'bg-purple-600 text-white shadow-md' : activeTab === 'OFFICIAL' ? 'bg-emerald-600 text-white shadow-md' : 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Sign In to Account</span>
              </button>
              <button
                type="button"
                onClick={() => { setIsRegisterMode(true); setErrorMsg(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  isRegisterMode
                    ? activeTab === 'ADMIN' ? 'bg-purple-600 text-white shadow-md' : activeTab === 'OFFICIAL' ? 'bg-emerald-600 text-white shadow-md' : 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Create New Account (Register)</span>
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Header description for current mode */}
            <div className="border-b border-slate-700/60 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                {activeTab === 'CITIZEN' ? (
                  <>
                    <FileText className="w-5 h-5 text-sky-400" />
                    <span>{isRegisterMode ? 'Register New Citizen Bhoomi Account' : 'Sign In to Citizen Bhoomi Vault'}</span>
                  </>
                ) : activeTab === 'OFFICIAL' ? (
                  <>
                    <Building2 className="w-5 h-5 text-emerald-400" />
                    <span>{isRegisterMode ? 'Register Revenue Officer Credentials' : 'Govt. Land Revenue Officer Workspace'}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 text-purple-400" />
                    <span>{isRegisterMode ? 'Provision Central Admin Profile' : 'National DILRMP Administrator Gateway'}</span>
                  </>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {activeTab === 'CITIZEN'
                  ? 'Store, view, and cryptographically verify land records, sale deeds, tax receipts, and mutation tracking.'
                  : activeTab === 'OFFICIAL'
                    ? 'Authorized revenue workspace for Circle Officers, Tahsildars, SDMs, Sub-Registrars, and District Collectors.'
                    : 'Central registry administration for SQLite database inspection, direct SQL queries, and user role management.'}
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs flex items-center space-x-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* REGISTRATION SPECIFIC FIELDS */}
              {isRegisterMode ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Full Legal Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar Sharma"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Email Address <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. ramesh.sharma@example.in"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Preferred Username (or leave blank to use email)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="e.g. ramesh_sharma"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                        />
                        <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Mobile Number (Aadhaar linked)
                      </label>
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Create Password <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create strong password"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                          required
                        />
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Confirm Password <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                          required
                        />
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                        {confirmPassword && (
                          <span className="absolute right-3 top-3">
                            {confirmPassword === password ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <X className="w-4 h-4 text-rose-400" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Citizen KYC Linkage simulation */}
                  {activeTab === 'CITIZEN' ? (
                    <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-700/80 space-y-3">
                      <div className="flex items-center space-x-2 text-xs font-semibold text-sky-400">
                        <Fingerprint className="w-4 h-4 text-sky-400" />
                        <span>DigiLocker & Citizen KYC Verification (Verified)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Aadhaar (Last 4 Digits)</label>
                          <input
                            type="text"
                            maxLength={4}
                            value={aadhaarLast4}
                            onChange={(e) => setAadhaarLast4(e.target.value)}
                            placeholder="5412"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">PAN Card Number</label>
                          <input
                            type="text"
                            value={panNumber}
                            onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                            placeholder="ABCPS1234F"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white uppercase"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-3">
                      <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400">
                        <BadgeCheck className="w-4 h-4 text-emerald-400" />
                        <span>Official Revenue Authority Designation & Jurisdiction</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Employee Code</label>
                          <input
                            type="text"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            placeholder="UP-REV-8492"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Designation</label>
                          <select
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                          >
                            <option value="Tahsildar / Circle Executive">Tahsildar / Circle Executive</option>
                            <option value="Sub-Registrar (Stamps & Registration)">Sub-Registrar (Stamps & Registration)</option>
                            <option value="Sub-Divisional Magistrate (SDM/LRDC)">SDM / LRDC</option>
                            <option value="District Magistrate & Collector">District Magistrate & Collector</option>
                            <option value="Revenue Inspector / Lekhpal">Revenue Inspector / Lekhpal</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Jurisdiction State</label>
                          <select
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                          >
                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Karnataka">Karnataka</option>
                            <option value="Jharkhand">Jharkhand</option>
                            <option value="Bihar">Bihar</option>
                            <option value="Delhi">Delhi</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* LOGIN SPECIFIC FIELDS */
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {activeTab === 'CITIZEN' 
                          ? 'Username or Registered Email ID' 
                          : activeTab === 'OFFICIAL' 
                            ? 'Official Revenue Email / Officer User ID' 
                            : 'National Administrator User ID / Email'} <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder={
                            activeTab === 'CITIZEN' 
                              ? 'ramesh_sharma or ramesh@example.in' 
                              : activeTab === 'OFFICIAL' 
                                ? 'tahsildar_dadri or vikram.rao@revenue.gov.in' 
                                : 'admin_dilrmp or admin@bhoomishield.gov.in'
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono"
                          required
                        />
                        <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-slate-300">
                          {activeTab === 'ADMIN' ? 'Master Security Passcode' : 'Password'} <span className="text-rose-400">*</span>
                        </label>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {activeTab === 'CITIZEN' ? (
                            <span>Demo: <code className="text-sky-300">Citizen@Ramesh2026#</code></span>
                          ) : activeTab === 'OFFICIAL' ? (
                            <span>Demo: <code className="text-emerald-300">Officer@Dadri2026#</code></span>
                          ) : (
                            <span>Master: <code className="text-purple-300">Admin@BhoomiShield2026#</code></span>
                          )}
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your security password"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono"
                          required
                        />
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Submit Action Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  activeTab === 'CITIZEN'
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-sky-600/20'
                    : activeTab === 'OFFICIAL'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/20'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/20'
                }`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Authenticating Credentials...</span>
                  </div>
                ) : (
                  <>
                    <span>
                      {isRegisterMode 
                        ? 'Complete Registration & Enter Workspace' 
                        : activeTab === 'CITIZEN' 
                          ? 'Sign In to Citizen Bhoomi Vault' 
                          : activeTab === 'OFFICIAL' 
                            ? 'Sign In to Revenue Official Desk' 
                            : 'Sign In to National Admin Gateway'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Security Footer */}
            <div className="pt-4 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
              <div className="flex items-center space-x-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>SHA-256 Tamper-Proof Document Storage Encrypted</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>DILRMP Compliant</span>
                <span>•</span>
                <span>DigiLocker Integration Ready</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
