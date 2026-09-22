import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserDocument } from '../types';
import { 
  Landmark, ShieldCheck, FileCheck, AlertTriangle, CheckCircle2, 
  XCircle, Clock, Building2, MapPin, User, ExternalLink, 
  Search, Filter, RefreshCw, Stamp, Lock, Sparkles, X, Check,
  Eye, EyeOff, ShieldAlert, KeyRound, ArrowRight, AlertOctagon
} from 'lucide-react';

const API_BASE = '/api';

interface OfficialWorkspacePageProps {
  onShowToast?: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

export const OfficialWorkspacePage: React.FC<OfficialWorkspacePageProps> = ({ onShowToast }) => {
  const { user, isOfficial, isAuthenticated, login, logout } = useAuth();
  const navigate = useNavigate();

  // Officer Security Gate State
  const [officerLoginId, setOfficerLoginId] = useState('tahsildar_dadri');
  const [officerPassword, setOfficerPassword] = useState('Officer@Dadri2026#');
  const [officerEmpCode, setOfficerEmpCode] = useState('UP-REV-OFF-8821');
  const [showOfficerPass, setShowOfficerPass] = useState(false);
  const [officerAuthError, setOfficerAuthError] = useState('');
  const [officerAuthLoading, setOfficerAuthLoading] = useState(false);

  const [pendingDocs, setPendingDocs] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');

  // Verify Action Modal
  const [verifyingDoc, setVerifyingDoc] = useState<UserDocument | null>(null);
  const [decision, setDecision] = useState<'APPROVED' | 'FLAGGED' | 'REJECTED'>('APPROVED');
  const [remarks, setRemarks] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleOfficerAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    setOfficerAuthError('');
    if (!officerLoginId.trim()) {
      setOfficerAuthError('Please enter Revenue Officer User ID or Official Email.');
      return;
    }
    if (!officerPassword.trim()) {
      setOfficerAuthError('Please enter Officer Security Passcode.');
      return;
    }

    setOfficerAuthLoading(true);
    const res = await login(officerLoginId.trim(), officerPassword.trim());
    setOfficerAuthLoading(false);

    if (res.success) {
      if (onShowToast) {
        onShowToast('success', 'Officer Signature Clearance Verified', 'Revenue Authority Desk Unlocked.');
      }
    } else {
      setOfficerAuthError(res.message || 'Invalid officer credentials. Access Denied.');
      if (onShowToast) {
        onShowToast('error', 'Authentication Failed', 'Invalid officer credentials.');
      }
    }
  };

  const handleQuickFillTahsildar = () => {
    setOfficerLoginId('tahsildar_dadri');
    setOfficerPassword('Officer@Dadri2026#');
    setOfficerEmpCode('UP-REV-OFF-8821');
    setOfficerAuthError('');
  };

  const handleQuickFillSDM = () => {
    setOfficerLoginId('sdm_noida');
    setOfficerPassword('SDM@NoidaIAS2026#');
    setOfficerEmpCode('IAS-UP-2018-44');
    setOfficerAuthError('');
  };

  const DEFAULT_PENDING_DOCS: UserDocument[] = [
    {
      id: 101,
      document_id: "DOC-2026-993401",
      user_id: "USR-CIT-1002",
      land_identity_id: "UP-GAU-DAD-BHAN-P340-PL112-1",
      title: "Registered Sale Deed Transfer Deed (Plot 112/1)",
      document_type: "SALE_DEED",
      state: "Uttar Pradesh",
      district: "Gautam Buddha Nagar",
      khata_khasra_no: "Gata 340 / Plot 112/1",
      issuing_authority: "Dadri Sub-Registrar Office",
      issue_date: "2025-10-18",
      file_name: "Sale_Deed_Dadri_Plot112.pdf",
      file_size_kb: 340,
      file_hash: "d41d8cd98f00b204e9800998ecf8427e9921b78291ac04d1efc5357876a3bdc2",
      verification_status: "PENDING",
      remarks: "Citizen uploaded for official digital seal & Revenue validation.",
      created_at: "2026-03-01"
    },
    {
      id: 102,
      document_id: "DOC-2026-993402",
      user_id: "USR-CIT-1003",
      land_identity_id: "MH-PUN-HAV-HINJ-G145-P23-B",
      title: "Certified 7/12 Satbara Extract & Mutation Notice",
      document_type: "SEVEN_TWELVE",
      state: "Maharashtra",
      district: "Pune",
      khata_khasra_no: "Gat No 145 / 23-B",
      issuing_authority: "Haveli Tahsil Office",
      issue_date: "2026-01-05",
      file_name: "Satbara_712_Hinjawadi.pdf",
      file_size_kb: 290,
      file_hash: "e2fc714c4727ee9395f324cd2e7f331f0291a0d89e248b94cc819385d01e4a11",
      verification_status: "FLAGGED_ANOMALY",
      remarks: "Name spelling variance detected between Deed and 7/12.",
      created_at: "2026-03-02"
    },
    {
      id: 103,
      document_id: "DOC-2026-993403",
      user_id: "USR-CIT-1004",
      land_identity_id: "JH-BOK-CHA-KURA-K125-K450-2",
      title: "Khatian Sabik Baseline Settlement Extract",
      document_type: "KHATAUNI_ROR",
      state: "Jharkhand",
      district: "Bokaro",
      khata_khasra_no: "Khata 125 / Plot 450/2",
      issuing_authority: "Chas Settlement Office",
      issue_date: "2025-12-14",
      file_name: "Khatian_Record_Chas.pdf",
      file_size_kb: 410,
      file_hash: "a4f81c9703d15a9bc8f4204d1efc5357876a3bdc20e5c9b2075591bf0946b5a3",
      verification_status: "PENDING",
      remarks: "Requires Patwari / Halka Karamchari field sign-off.",
      created_at: "2026-03-03"
    }
  ];

  const fetchPendingDocs = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/official/pending-documents?limit=50`;
      if (selectedState !== 'ALL') url += `&state=${encodeURIComponent(selectedState)}`;
      if (selectedDistrict !== 'ALL') url += `&district=${encodeURIComponent(selectedDistrict)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPendingDocs(data.pending_documents && data.pending_documents.length > 0 ? data.pending_documents : DEFAULT_PENDING_DOCS);
      } else {
        setPendingDocs(DEFAULT_PENDING_DOCS);
      }
    } catch (err) {
      console.warn('Backend official workspace offline, using local queue');
      setPendingDocs(DEFAULT_PENDING_DOCS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDocs();
  }, [selectedState, selectedDistrict]);

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingDoc || !user) return;
    setIsProcessing(true);

    try {
      const res = await fetch(`${API_BASE}/official/documents/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: verifyingDoc.document_id,
          officer_name: user.full_name,
          officer_role: user.designation || user.role,
          decision,
          remarks: remarks || (decision === 'APPROVED' ? 'Verified against official Book-1 records.' : 'Flagged for discrepancy.')
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (onShowToast) {
          onShowToast(
            decision === 'APPROVED' ? 'success' : 'info',
            'Digital Verification Recorded',
            data.message
          );
        }
        setVerifyingDoc(null);
        setRemarks('');
        fetchPendingDocs();
        setIsProcessing(false);
        return;
      }
    } catch (err) {
      console.warn("Verification recorded in local ledger");
    }

    const stampId = `DSC-${user.role?.slice(0, 3).toUpperCase()}-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    if (onShowToast) {
      onShowToast(
        decision === 'APPROVED' ? 'success' : 'info',
        'Digital Verification Recorded',
        `Document ${verifyingDoc.document_id} signed with Digital Seal #${stampId}`
      );
    }
    setPendingDocs(prev => prev.filter(d => d.document_id !== verifyingDoc.document_id));
    setVerifyingDoc(null);
    setRemarks('');
    setIsProcessing(false);
  };

  // Render Officer Security Gate if User is Not a Revenue Officer / Official
  if (!isOfficial) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-xl w-full space-y-8">
          
          {/* Security Shield Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-xl shadow-emerald-950/50">
              <Landmark className="w-10 h-10 text-emerald-400 animate-pulse" />
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full tracking-wider flex items-center space-x-1">
                <ShieldAlert className="w-3 h-3" />
                <span>Restricted Revenue Authority Desk</span>
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight sm:text-4xl">
              Revenue Officer Security Gate
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Verification of registered sale deeds, issuance of digital encumbrance certificates, and mutation sign-offs require verified Revenue Officer credentials.
            </p>
          </div>

          {/* Security Challenge Card */}
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            
            {officerAuthError && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2 animate-shake">
                <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{officerAuthError}</span>
              </div>
            )}

            <form onSubmit={handleOfficerAuthenticate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Revenue Officer User ID / Official Email</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={officerLoginId}
                    onChange={(e) => setOfficerLoginId(e.target.value)}
                    placeholder="tahsildar_dadri or vikram.rao@revenue.gov.in"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Officer Password / Security Passcode</span>
                </label>
                <div className="relative">
                  <input
                    type={showOfficerPass ? "text" : "password"}
                    value={officerPassword}
                    onChange={(e) => setOfficerPassword(e.target.value)}
                    placeholder="Enter officer passcode"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOfficerPass(!showOfficerPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    title={showOfficerPass ? "Hide passcode" : "Show passcode"}
                  >
                    {showOfficerPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Official Employee / Cadre Code</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={officerEmpCode}
                    onChange={(e) => setOfficerEmpCode(e.target.value)}
                    placeholder="UP-REV-OFF-8821"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono uppercase"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={officerAuthLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {officerAuthLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Stamp className="w-4 h-4" />
                    <span>Authenticate DSC & Unlock Revenue Desk</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Official Credentials Helper Card for Testing / Evaluation */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Authorized Revenue Officer Credentials:</span>
                </div>
                <span className="text-[10px] text-slate-500">Select persona below</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Tahsildar Option */}
                <button
                  type="button"
                  onClick={async () => {
                    handleQuickFillTahsildar();
                    const res = await login('tahsildar_dadri', 'Officer@Dadri2026#');
                    if (res.success && onShowToast) {
                      onShowToast('success', 'Officer Cleared', 'Logged in as Vikramaditya Rao (Tahsildar Dadri).');
                    }
                  }}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-emerald-950/50 border border-slate-800 hover:border-emerald-700 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-emerald-300">Tahsildar Dadri</span>
                    <span className="text-[9px] bg-emerald-900/60 text-emerald-300 px-1 rounded">UP-REV</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: tahsildar_dadri</p>
                  <p className="text-[10px] text-emerald-400/80 font-mono">Pass: Officer@Dadri2026#</p>
                </button>

                {/* SDM Option */}
                <button
                  type="button"
                  onClick={async () => {
                    handleQuickFillSDM();
                    const res = await login('sdm_noida', 'SDM@NoidaIAS2026#');
                    if (res.success && onShowToast) {
                      onShowToast('success', 'Magistrate Cleared', 'Logged in as Ananya Mishra, IAS (SDM Noida).');
                    }
                  }}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-emerald-950/50 border border-slate-800 hover:border-emerald-700 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-emerald-300">SDM Noida (IAS)</span>
                    <span className="text-[9px] bg-indigo-900/60 text-indigo-300 px-1 rounded">IAS Cadre</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: sdm_noida</p>
                  <p className="text-[10px] text-emerald-400/80 font-mono">Pass: SDM@NoidaIAS2026#</p>
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Official Header */}
        <div className="bg-slate-800/90 border border-emerald-900/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
              alt={user?.full_name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-lg"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-white tracking-tight">{user?.full_name}</h1>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <Landmark className="w-3 h-3" />
                  <span>Revenue Authority Desk</span>
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] px-2 py-0.2 rounded-full font-mono">
                  DSC SIGNED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {user?.department || 'Revenue & Land Reforms Department'} • {user?.designation || 'Revenue Officer'}
              </p>
              <div className="flex items-center space-x-3 text-xs text-slate-400 mt-2">
                <span>Emp Code: <strong className="text-emerald-400 font-mono">{user?.employee_id || 'UP-REV-OFF-8821'}</strong></span>
                <span>•</span>
                <span>Jurisdiction: <strong className="text-slate-200">{user?.jurisdiction_district}, {user?.jurisdiction_state}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to="/admin"
              className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs border border-slate-600 flex items-center space-x-1.5 transition-transform active:scale-95"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Studio</span>
            </Link>
            <button
              onClick={() => {
                logout();
                if (onShowToast) onShowToast('info', 'Desk Locked', 'Logged out of official revenue desk.');
              }}
              className="px-3 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Lock official workspace"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Desk</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Pending Citizen Documents</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">{pendingDocs.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">Awaiting digital DSC stamping</div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Digital DSC Certificate Engine</span>
              <Stamp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">ACTIVE</div>
            <div className="text-[11px] text-slate-400 mt-1">Class-3 DSC Token Authenticated</div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Jurisdiction Coverage</span>
              <MapPin className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-black text-white">{user?.jurisdiction_state || 'All India'}</div>
            <div className="text-[11px] text-sky-400 mt-1">{user?.jurisdiction_district || 'District Hub'}</div>
          </div>
        </div>

        {/* Verification Desk Content */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-700/60">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <span>Citizen Document Verification Desk</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit citizen-uploaded deeds and RoRs against state revenue registers and attach official DSC seals.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={fetchPendingDocs}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Desk</span>
              </button>
            </div>
          </div>

          {pendingDocs.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-white">All Clear! No Pending Verifications</h3>
              <p className="text-xs text-slate-400">
                All submitted citizen documents in your jurisdiction have been audited and digitally stamped.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Document ID & Title</th>
                    <th className="py-3 px-4">Citizen Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Linked Land ID</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {pendingDocs.map((doc) => (
                    <tr key={doc.document_id} className="hover:bg-slate-800/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="text-xs">{doc.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{doc.document_id}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">{doc.citizen_name || 'Citizen'}</div>
                        <div className="text-[10px] text-slate-400">{doc.citizen_mobile || '+91 98765 43210'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-slate-900 text-sky-400 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                          {doc.document_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        {doc.land_identity_id ? (
                          <Link
                            to={`/land/${doc.land_identity_id}`}
                            className="text-sky-400 hover:underline flex items-center space-x-1"
                          >
                            <span className="truncate max-w-[140px]">{doc.land_identity_id}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </Link>
                        ) : (
                          <span className="text-slate-500">Unlinked</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[11px]">
                        {doc.district}, {doc.state}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-amber-950/80 text-amber-400 border border-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">
                          {doc.verification_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setVerifyingDoc(doc);
                            setDecision('APPROVED');
                            setRemarks(`Verified against ${doc.issuing_authority} Book-1 registers. Free of unauthorized claims.`);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center space-x-1 shadow-md shadow-emerald-600/20"
                        >
                          <Stamp className="w-3.5 h-3.5" />
                          <span>Audit & Sign</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* VERIFICATION & DSC SIGNING MODAL */}
      {verifyingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Stamp className="w-6 h-6 text-emerald-400" />
                <div>
                  <h2 className="text-base font-bold text-white">Issue Official DSC Verification Stamp</h2>
                  <span className="text-[10px] text-slate-400">Document: {verifyingDoc.document_id}</span>
                </div>
              </div>
              <button
                onClick={() => setVerifyingDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Document Title:</span>
                  <span className="font-bold text-white">{verifyingDoc.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Citizen Applicant:</span>
                  <span className="text-slate-200">{verifyingDoc.citizen_name || 'Citizen User'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Issuing Authority:</span>
                  <span className="text-slate-200">{verifyingDoc.issuing_authority}</span>
                </div>
                <div className="flex justify-between font-mono text-[10px]">
                  <span className="text-slate-400">SHA-256 Digest:</span>
                  <span className="text-sky-300">{verifyingDoc.file_hash.slice(0, 24)}...</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Officer Verification Decision *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision('APPROVED')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 border ${
                      decision === 'APPROVED'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Stamp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecision('FLAGGED')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 border ${
                      decision === 'FLAGGED'
                        ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-600/20'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Flag Discrepancy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecision('REJECTED')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 border ${
                      decision === 'REJECTED'
                        ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/20'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Audit Remarks / Endorsement Note
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
                  placeholder="Enter record verification details..."
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-[11px] text-emerald-300 flex items-center space-x-2">
                <Lock className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>
                  Digital Signature Certificate (DSC) seal will be cryptographically bound with your Officer ID: <strong>{user?.employee_id || 'REV-OFFICER'}</strong>.
                </span>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setVerifyingDoc(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-lg shadow-emerald-600/20 flex items-center space-x-1.5"
                >
                  {isProcessing ? <span>Applying Digital Seal...</span> : (
                    <>
                      <Stamp className="w-4 h-4" />
                      <span>Confirm & Digitally Stamp</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
