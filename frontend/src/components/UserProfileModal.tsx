import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, User, Mail, Phone, MapPin, ShieldCheck, KeyRound, 
  Camera, Lock, Check, AlertTriangle, Shield, Laptop, 
  Smartphone, Download, Eye, EyeOff, Save, RefreshCw, CheckCircle2,
  FileText, Landmark
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const { user, updateUserProfile, changePassword, toggle2FA, twoFactorEnabled, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'DETAILS' | 'AVATAR' | 'SECURITY' | 'SESSIONS' | 'DATA'>('DETAILS');

  // Form States
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [designation, setDesignation] = useState(user?.designation || '');
  const [state, setState] = useState(user?.jurisdiction_state || 'Uttar Pradesh');
  const [district, setDistrict] = useState(user?.jurisdiction_district || 'Gautam Buddha Nagar');
  const [tehsil, setTehsil] = useState(user?.jurisdiction_tehsil || 'Dadri');
  const [aadhaarLast4, setAadhaarLast4] = useState(user?.aadhaar_last4 || '5412');
  const [panNumber, setPanNumber] = useState(user?.pan_number || 'ABCPS1234F');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || PRESET_AVATARS[0]);

  // Security Form States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [savingDetails, setSavingDetails] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  if (!isOpen || !user) return null;

  // Handle Photo File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        if (onShowToast) onShowToast('error', 'File Too Large', 'Please select an image smaller than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarUrl(result);
        if (onShowToast) onShowToast('info', 'Photo Loaded', 'Click Save Profile to apply changes.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Personal Details Save
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDetails(true);
    const res = await updateUserProfile({
      full_name: fullName.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
      department: department.trim(),
      designation: designation.trim(),
      jurisdiction_state: state.trim(),
      jurisdiction_district: district.trim(),
      jurisdiction_tehsil: tehsil.trim(),
      aadhaar_last4: aadhaarLast4.trim(),
      pan_number: panNumber.trim(),
      avatar_url: avatarUrl
    });
    setSavingDetails(false);

    if (res.success) {
      if (onShowToast) onShowToast('success', 'Profile Updated', res.message);
    } else {
      if (onShowToast) onShowToast('error', 'Update Failed', res.message);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setSavingPassword(true);
    const res = await changePassword(oldPassword, newPassword);
    setSavingPassword(false);

    if (res.success) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (onShowToast) onShowToast('success', 'Password Changed', 'Your security password has been updated.');
    } else {
      setPasswordError(res.message);
      if (onShowToast) onShowToast('error', 'Error', res.message);
    }
  };

  // Handle 2FA Toggle
  const handleToggle2FA = async () => {
    const res = await toggle2FA();
    if (onShowToast) {
      onShowToast(
        'info', 
        res.isEnabled ? 'Two-Factor Authentication Enabled' : 'Two-Factor Authentication Disabled',
        res.isEnabled ? 'SMS OTP required for revenue operations.' : 'Standard single-factor login restored.'
      );
    }
  };

  // Export User Data
  const handleExportData = () => {
    const exportPayload = {
      profile: user,
      twoFactorEnabled,
      exported_at: new Date().toISOString(),
      platform: "BhoomiShield — Digital India Land Records Modernization Programme"
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BhoomiShield_Profile_${user.username}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (onShowToast) onShowToast('success', 'Data Exported', 'Your profile and activity summary has been downloaded.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 p-6 text-white border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-4">
            <div className="relative group">
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-400 shadow-lg"
              />
              <button
                onClick={() => setActiveTab('AVATAR')}
                className="absolute -bottom-1 -right-1 p-1.5 bg-sky-600 text-white rounded-lg shadow-md hover:bg-sky-500 transition-all cursor-pointer"
                title="Change Avatar"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold">{user.full_name}</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{user.kyc_status}</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center space-x-1.5">
                <span className="font-mono text-sky-400 font-bold">{user.user_id}</span>
                <span>•</span>
                <span className="text-slate-400">{user.designation || user.role}</span>
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2 mt-6 overflow-x-auto pb-1 text-xs border-t border-slate-800/80 pt-3">
            <button
              onClick={() => setActiveTab('DETAILS')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'DETAILS' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Personal Details</span>
            </button>
            <button
              onClick={() => setActiveTab('AVATAR')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'AVATAR' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Profile Photo</span>
            </button>
            <button
              onClick={() => setActiveTab('SECURITY')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'SECURITY' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Security & Password</span>
            </button>
            <button
              onClick={() => setActiveTab('SESSIONS')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'SESSIONS' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Active Sessions</span>
            </button>
            <button
              onClick={() => setActiveTab('DATA')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'DATA' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Data & Vault</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          
          {/* TAB 1: Personal Details Form */}
          {activeTab === 'DETAILS' && (
            <form onSubmit={handleSaveDetails} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Designation / Role</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Primary State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Aadhaar (Last 4 Digits)</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={aadhaarLast4}
                    onChange={(e) => setAadhaarLast4(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">PAN Card Number</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold uppercase"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingDetails}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingDetails ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Avatar Photo Selection */}
          {activeTab === 'AVATAR' && (
            <div className="space-y-6 text-xs">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Upload Custom Profile Photo</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-3">
                  Upload an image from your computer (PNG, JPG, max 2MB) or pick from one of the official avatar presets.
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center space-x-2 cursor-pointer shadow"
                >
                  <Camera className="w-4 h-4 text-sky-400" />
                  <span>Choose Photo from Device</span>
                </button>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">Or Choose Official Avatar Preset</h3>
                <div className="grid grid-cols-4 gap-3">
                  {PRESET_AVATARS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setAvatarUrl(url);
                        updateUserProfile({ avatar_url: url });
                        if (onShowToast) onShowToast('success', 'Avatar Updated', 'Profile photo changed.');
                      }}
                      className={`p-1.5 rounded-2xl border-2 transition-all cursor-pointer ${
                        avatarUrl === url ? 'border-sky-500 bg-sky-500/10 scale-105' : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                      }`}
                    >
                      <img src={url} alt={`Avatar ${i+1}`} className="w-full h-16 rounded-xl object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Security & Password */}
          {activeTab === 'SECURITY' && (
            <div className="space-y-6 text-xs">
              {/* 2FA Card */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-slate-900 dark:text-white text-sm">Two-Factor Authentication (2FA)</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    Adds an extra layer of security requiring SMS OTP for official property transactions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggle2FA}
                  className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
                    twoFactorEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {twoFactorEnabled ? 'Enabled ✓' : 'Enable 2FA'}
                </button>
              </div>

              {/* Password Change Form */}
              <form onSubmit={handleChangePassword} className="space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Change Security Password</h3>
                
                {passwordError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-xl text-xs flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                      placeholder="Minimum 6 characters"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                      placeholder="Re-enter new password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{savingPassword ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: Active Sessions */}
          {activeTab === 'SESSIONS' && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Active Login Sessions & Devices</h3>
              
              <div className="space-y-3">
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                        <span>Windows PC (Chrome 124)</span>
                        <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500 text-white font-bold rounded">Current Session</span>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                        IP: 103.21.244.112 • New Delhi, India • Active Now
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        Android Device (Mobile Chrome)
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                        IP: 157.34.89.201 • Lucknow, India • 2 hours ago
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onShowToast) onShowToast('info', 'Session Revoked', 'Android session terminated.');
                    }}
                    className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Data & Vault */}
          {activeTab === 'DATA' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center space-x-2">
                  <Download className="w-4 h-4 text-sky-500" />
                  <span className="font-bold text-slate-900 dark:text-white text-sm">Download My Bhoomi Data Archive</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Export all your personal profile records, linked land parcels, uploaded document metadata, and activity audit logs in standard JSON format.
                </p>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl flex items-center space-x-2 cursor-pointer shadow"
                >
                  <Download className="w-4 h-4" />
                  <span>Download JSON Archive</span>
                </button>
              </div>

              <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/30 flex items-center justify-between">
                <div>
                  <span className="font-bold text-rose-500 block">Sign Out of Account</span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs">Clear local credentials and end this session.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    onClose();
                    if (onShowToast) onShowToast('info', 'Logged Out', 'You have been signed out.');
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
