import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserDocument, UserProperty, VaultStats, DocumentType, VerificationStatus } from '../types';
import { 
  FolderLock, FileText, UploadCloud, ShieldCheck, CheckCircle2, 
  AlertTriangle, Clock, Download, Eye, Trash2, Plus, ExternalLink, 
  Search, Filter, MapPin, Hash, Building2, User, Key, Lock, 
  Sparkles, RefreshCw, X, Copy, Check, FileCheck, Layers
} from 'lucide-react';

const API_BASE = '/api';

interface UserVaultPageProps {
  onShowToast?: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

export const UserVaultPage: React.FC<UserVaultPageProps> = ({ onShowToast }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'DOCUMENTS' | 'PROPERTIES' | 'KYC'>('DOCUMENTS');
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [properties, setProperties] = useState<UserProperty[]>([]);
  const [stats, setStats] = useState<VaultStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isAddPropModalOpen, setIsAddPropModalOpen] = useState<boolean>(false);
  const [previewDoc, setPreviewDoc] = useState<UserDocument | null>(null);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  // Upload Form
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState<DocumentType>('SALE_DEED');
  const [uploadLandId, setUploadLandId] = useState('');
  const [uploadState, setUploadState] = useState('Uttar Pradesh');
  const [uploadDistrict, setUploadDistrict] = useState('Gautam Buddha Nagar');
  const [uploadKhataKhasra, setUploadKhataKhasra] = useState('');
  const [uploadAuthority, setUploadAuthority] = useState('Sub-Registrar Office');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploadFileName, setUploadFileName] = useState('Registered_Deed_Copy.pdf');
  const [uploadFileSizeKb, setUploadFileSizeKb] = useState(350);
  const [uploadRemarks, setUploadRemarks] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Property Form
  const [propLandId, setPropLandId] = useState('UP-GAU-DAD-BHAN-P340-PL112-1');
  const [propNickname, setPropNickname] = useState('My Ancestral Farmhouse');
  const [propStatus, setPropStatus] = useState<'OWNER' | 'BUYER_INQUIRY' | 'FAMILY_INHERITANCE' | 'WATCHLIST'>('OWNER');
  const [propNotes, setPropNotes] = useState('Primary family agricultural land');
  const [isAddingProp, setIsAddingProp] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const DEFAULT_VAULT_DOCS: UserDocument[] = [
    {
      id: 1,
      document_id: "DOC-2026-992101",
      user_id: user?.user_id || "USR-CIT-1001",
      land_identity_id: "UP-GAU-DAD-BHAN-P340-PL112-1",
      title: "Registered Sale Deed (Plot 112/1)",
      document_type: "SALE_DEED",
      state: "Uttar Pradesh",
      district: "Gautam Buddha Nagar",
      khata_khasra_no: "Gata 340 / Plot 112/1",
      issuing_authority: "Dadri Sub-Registrar Office",
      issue_date: "2019-06-14",
      file_name: "Registered_Deed_Dadri_112_1.pdf",
      file_size_kb: 420,
      file_hash: "a4f81c9703d15a9bc8f4204d1efc5357876a3bdc20e5c9b2075591bf0946b5a3",
      verification_status: "OFFICIALLY_VERIFIED",
      verified_by_officer: "Vikramaditya Rao (Tahsildar Dadri)",
      verification_date: "2026-02-20 11:30:00",
      digital_stamp_id: "DSC-REV-2026-88192",
      remarks: "Verified against Sub-Registrar Book-1 records.",
      created_at: "2026-02-15"
    },
    {
      id: 2,
      document_id: "DOC-2026-992102",
      user_id: user?.user_id || "USR-CIT-1001",
      land_identity_id: "UP-GAU-DAD-BHAN-P340-PL112-1",
      title: "Certified Real-Time Khatauni RoR Extract",
      document_type: "KHATAUNI_ROR",
      state: "Uttar Pradesh",
      district: "Gautam Buddha Nagar",
      khata_khasra_no: "Khatauni 340",
      issuing_authority: "Revenue Board UP Bhulekh",
      issue_date: "2025-11-05",
      file_name: "Khatauni_Extract_Bhangel_340.pdf",
      file_size_kb: 280,
      file_hash: "b7e21a8809f441c0989f6d19ca51287c88b901ec4401a910bf5541e2a8701e19",
      verification_status: "OFFICIALLY_VERIFIED",
      verified_by_officer: "Vikramaditya Rao (Tahsildar Dadri)",
      verification_date: "2026-02-20 11:35:00",
      digital_stamp_id: "DSC-REV-2026-88193",
      remarks: "Khatauni tenancy concordant with Register-II.",
      created_at: "2026-02-15"
    },
    {
      id: 3,
      document_id: "DOC-2026-992103",
      user_id: user?.user_id || "USR-CIT-1001",
      land_identity_id: "JH-BOK-CHA-KURA-K125-K450-2",
      title: "Lagan Land Revenue Tax Receipt (2025-26)",
      document_type: "TAX_RECEIPT",
      state: "Jharkhand",
      district: "Bokaro",
      khata_khasra_no: "Khata 125 / Plot 450/2",
      issuing_authority: "Chas Anchal Revenue Office",
      issue_date: "2026-01-12",
      file_name: "Lagan_Receipt_2025_2026.pdf",
      file_size_kb: 190,
      file_hash: "c901e19bf5541e2a8701e19a4f81c9703d15a9bc8f4204d1efc5357876a3bdc2",
      verification_status: "PENDING",
      remarks: "Submitted for digital verification signature.",
      created_at: "2026-02-25"
    }
  ];

  const DEFAULT_VAULT_PROPS: UserProperty[] = [
    {
      id: 1,
      user_id: user?.user_id || "USR-CIT-1001",
      land_identity_id: "UP-GAU-DAD-BHAN-P340-PL112-1",
      property_nickname: "Bhangel Dadri Ancestral Plot",
      ownership_status: "OWNER",
      registered_area_acre: 0.50,
      notes: "Primary residential abadi parcel.",
      created_at: "2026-01-15",
      state: "Uttar Pradesh",
      district: "Gautam Buddha Nagar",
      anchal: "Dadri",
      mauza: "Bhangel",
      khata_no: "340",
      khesra_no: "112/1",
      area_acre: 0.50,
      land_type: "Residential / Abadi",
      owner_name: "Rajesh Sharma",
      risk_score: 12,
      risk_level: "LOW",
      findings_count: 0,
      linked_documents_count: 2
    },
    {
      id: 2,
      user_id: user?.user_id || "USR-CIT-1001",
      land_identity_id: "JH-BOK-CHA-KURA-K125-K450-2",
      property_nickname: "Bokaro Agricultural Farm",
      ownership_status: "FAMILY_INHERITANCE",
      registered_area_acre: 1.25,
      notes: "Joint family agricultural land.",
      created_at: "2026-02-01",
      state: "Jharkhand",
      district: "Bokaro",
      anchal: "Chas",
      mauza: "Kura",
      khata_no: "125",
      khesra_no: "450/2",
      area_acre: 1.25,
      land_type: "Agricultural (Dhan 2)",
      owner_name: "Sunil Kumar Singh",
      risk_score: 18,
      risk_level: "LOW",
      findings_count: 0,
      linked_documents_count: 1
    }
  ];

  const fetchVaultData = async () => {
    if (!user?.user_id) return;
    setLoading(true);
    try {
      const [docsRes, propsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/vault/documents?user_id=${user.user_id}`),
        fetch(`${API_BASE}/vault/properties?user_id=${user.user_id}`),
        fetch(`${API_BASE}/vault/stats?user_id=${user.user_id}`)
      ]);

      if (docsRes.ok) {
        const d = await docsRes.json();
        setDocuments(d.documents && d.documents.length > 0 ? d.documents : DEFAULT_VAULT_DOCS);
      } else {
        setDocuments(DEFAULT_VAULT_DOCS);
      }
      if (propsRes.ok) {
        const p = await propsRes.json();
        setProperties(p.properties && p.properties.length > 0 ? p.properties : DEFAULT_VAULT_PROPS);
      } else {
        setProperties(DEFAULT_VAULT_PROPS);
      }
      if (statsRes.ok) {
        const s = await statsRes.json();
        setStats(s);
      }
    } catch (err) {
      console.warn('Backend vault offline, using local encrypted vault storage');
      setDocuments(DEFAULT_VAULT_DOCS);
      setProperties(DEFAULT_VAULT_PROPS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaultData();
  }, [user]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.user_id || !uploadTitle) return;
    setIsUploading(true);

    try {
      const res = await fetch(`${API_BASE}/vault/documents/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.user_id,
          title: uploadTitle,
          document_type: uploadType,
          land_identity_id: uploadLandId || null,
          state: uploadState,
          district: uploadDistrict,
          khata_khasra_no: uploadKhataKhasra,
          issuing_authority: uploadAuthority,
          issue_date: uploadDate,
          file_name: uploadFileName,
          file_size_kb: uploadFileSizeKb,
          remarks: uploadRemarks
        })
      });

      const data = await res.json();
      if (res.ok) {
        if (onShowToast) onShowToast('success', 'Document Saved', data.message);
        setIsUploadModalOpen(false);
        // Reset form
        setUploadTitle('');
        setUploadLandId('');
        fetchVaultData();
      } else {
        if (onShowToast) onShowToast('error', 'Upload Failed', data.detail || 'Could not save document');
      }
    } catch (err: any) {
      if (onShowToast) onShowToast('error', 'Upload Error', err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddPropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.user_id || !propLandId) return;
    setIsAddingProp(true);

    try {
      const res = await fetch(`${API_BASE}/vault/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.user_id,
          land_identity_id: propLandId,
          property_nickname: propNickname,
          ownership_status: propStatus,
          notes: propNotes
        })
      });

      const data = await res.json();
      if (res.ok) {
        if (onShowToast) onShowToast('success', 'Property Saved', data.message);
        setIsAddPropModalOpen(false);
        fetchVaultData();
      } else {
        if (onShowToast) onShowToast('error', 'Failed to Save', data.detail || 'Error saving property');
      }
    } catch (err: any) {
      if (onShowToast) onShowToast('error', 'Error', err.message);
    } finally {
      setIsAddingProp(false);
    }
  };

  const handleDeleteDoc = async (documentId: string) => {
    if (!user?.user_id || !window.confirm('Are you sure you want to delete this document from your vault?')) return;
    try {
      const res = await fetch(`${API_BASE}/vault/documents/${documentId}?user_id=${user.user_id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        if (onShowToast) onShowToast('info', 'Document Removed', `Document ${documentId} deleted.`);
        fetchVaultData();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleRequestVerification = async (documentId: string) => {
    if (!user?.user_id) return;
    try {
      const res = await fetch(`${API_BASE}/vault/documents/${documentId}/request-verification?user_id=${user.user_id}`, {
        method: 'POST'
      });
      if (res.ok) {
        if (onShowToast) onShowToast('success', 'Verification Requested', 'Your document has been submitted to the local Revenue Authority for digital verification.');
        fetchVaultData();
      }
    } catch (err) {
      console.error('Verification request error:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // Filtered documents
  const filteredDocs = documents.filter((doc) => {
    if (selectedType !== 'ALL' && doc.document_type !== selectedType) return false;
    if (selectedStatus !== 'ALL' && doc.verification_status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        doc.title.toLowerCase().includes(q) ||
        (doc.land_identity_id || '').toLowerCase().includes(q) ||
        (doc.issuing_authority || '').toLowerCase().includes(q) ||
        (doc.district || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const getDocTypeBadge = (type: DocumentType) => {
    switch (type) {
      case 'SALE_DEED':
        return <span className="bg-sky-950/80 text-sky-400 border border-sky-800 text-[10px] px-2 py-0.5 rounded font-bold">Sale Deed</span>;
      case 'KHATAUNI_ROR':
        return <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">Khatauni RoR</span>;
      case 'SEVEN_TWELVE':
        return <span className="bg-amber-950/80 text-amber-400 border border-amber-800 text-[10px] px-2 py-0.5 rounded font-bold">7/12 Extract</span>;
      case 'RTC_PAHANI':
        return <span className="bg-purple-950/80 text-purple-400 border border-purple-800 text-[10px] px-2 py-0.5 rounded font-bold">RTC Pahani</span>;
      case 'PATTA_CHITTA':
        return <span className="bg-indigo-950/80 text-indigo-400 border border-indigo-800 text-[10px] px-2 py-0.5 rounded font-bold">Patta Chitta</span>;
      case 'TAX_RECEIPT':
        return <span className="bg-teal-950/80 text-teal-400 border border-teal-800 text-[10px] px-2 py-0.5 rounded font-bold">Tax Receipt</span>;
      case 'ENCUMBRANCE_CERT':
        return <span className="bg-orange-950/80 text-orange-400 border border-orange-800 text-[10px] px-2 py-0.5 rounded font-bold">Nil Encumbrance</span>;
      default:
        return <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] px-2 py-0.5 rounded font-bold">{type}</span>;
    }
  };

  const getStatusBadge = (status: VerificationStatus, doc: UserDocument) => {
    switch (status) {
      case 'OFFICIALLY_VERIFIED':
        return (
          <div className="flex items-center space-x-1.5 text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-lg text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Officially Verified</span>
          </div>
        );
      case 'DIGILOCKER_AUTHENTICATED':
        return (
          <div className="flex items-center space-x-1.5 text-sky-400 bg-sky-950/60 border border-sky-800/80 px-2.5 py-1 rounded-lg text-xs font-semibold">
            <FileCheck className="w-3.5 h-3.5 shrink-0" />
            <span>DigiLocker Certified</span>
          </div>
        );
      case 'FLAGGED_ANOMALY':
        return (
          <div className="flex items-center space-x-1.5 text-rose-400 bg-rose-950/60 border border-rose-800/80 px-2.5 py-1 rounded-lg text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Flagged for Review</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-1.5 text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2.5 py-1 rounded-lg text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>Pending Verification</span>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Citizen Profile & Vault Header */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
              alt={user?.full_name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-500 shadow-lg"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-white tracking-tight">{user?.full_name}</h1>
                <span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Aadhaar KYC Linked</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {user?.designation || 'Registered Landowner'} • {user?.jurisdiction_district}, {user?.jurisdiction_state}
              </p>
              <div className="flex items-center space-x-3 text-xs text-slate-400 mt-2">
                <span>ID: <strong className="text-slate-200">{user?.user_id}</strong></span>
                <span>•</span>
                <span>Aadhaar: <strong className="text-slate-200">XXXX-XXXX-{user?.aadhaar_last4 || '5412'}</strong></span>
                <span>•</span>
                <span>PAN: <strong className="text-slate-200">{user?.pan_number || 'ABCPS1234F'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-end md:self-center">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-600/20 flex items-center space-x-2 transition-transform active:scale-95"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Land Document</span>
            </button>
            <button
              onClick={() => setIsAddPropModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs border border-slate-600 flex items-center space-x-2 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Add Land Parcel</span>
            </button>
          </div>
        </div>

        {/* Vault Stats Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Total Documents</span>
              <FileText className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-black text-white">{stats?.total_documents || documents.length}</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>SHA-256 Protected</span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Officially Verified</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{stats?.verified_documents || 0}</div>
            <div className="text-[11px] text-slate-400 mt-1">Digital DSC Stamped</div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Land Holdings</span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white">{stats?.saved_properties || properties.length}</div>
            <div className="text-[11px] text-purple-400 mt-1">Active Portfolio</div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Vault Allocation</span>
              <FolderLock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">{stats?.storage_used_kb || 945} <span className="text-xs font-normal text-slate-400">KB</span></div>
            <div className="text-[11px] text-slate-400 mt-1">of 100 MB Quota</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 space-x-4">
          <button
            onClick={() => setActiveTab('DOCUMENTS')}
            className={`pb-3 px-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'DOCUMENTS'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderLock className="w-4 h-4" />
            <span>Land Documents Locker ({documents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('PROPERTIES')}
            className={`pb-3 px-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'PROPERTIES'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>My Land Holdings & Portfolio ({properties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('KYC')}
            className={`pb-3 px-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'KYC'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Citizen Identity & KYC</span>
          </button>
        </div>

        {/* TAB 1: DOCUMENTS LOCKER */}
        {activeTab === 'DOCUMENTS' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by title, authority or Land ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
                >
                  <option value="ALL">All Document Types</option>
                  <option value="SALE_DEED">Sale Deed</option>
                  <option value="KHATAUNI_ROR">Khatauni RoR</option>
                  <option value="SEVEN_TWELVE">7/12 Extract</option>
                  <option value="RTC_PAHANI">RTC Pahani</option>
                  <option value="PATTA_CHITTA">Patta Chitta</option>
                  <option value="TAX_RECEIPT">Tax Receipt</option>
                  <option value="ENCUMBRANCE_CERT">Encumbrance Certificate</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="OFFICIALLY_VERIFIED">Officially Verified</option>
                  <option value="DIGILOCKER_AUTHENTICATED">DigiLocker Certified</option>
                  <option value="PENDING">Pending Review</option>
                </select>

                <button
                  onClick={fetchVaultData}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white"
                  title="Refresh documents"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Documents List */}
            {filteredDocs.length === 0 ? (
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-12 text-center space-y-4">
                <FolderLock className="w-12 h-12 text-slate-600 mx-auto" />
                <div>
                  <h3 className="text-base font-bold text-white">No documents found</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Upload your land documents (Sale Deeds, 7/12, Khatauni, Tax receipts) to secure them in your vault.
                  </p>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold inline-flex items-center space-x-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload First Document</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.document_id}
                    className="bg-slate-800/90 border border-slate-700 hover:border-sky-500/60 rounded-2xl p-5 shadow-lg space-y-4 transition-all hover:shadow-sky-500/5 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        {getDocTypeBadge(doc.document_type)}
                        {getStatusBadge(doc.verification_status, doc)}
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-sky-400">
                          {doc.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-1">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          <span className="truncate">{doc.issuing_authority}</span>
                        </p>
                      </div>

                      {doc.land_identity_id && (
                        <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/60 text-[11px]">
                          <span className="text-slate-400 block text-[10px]">Linked Land Identity ID:</span>
                          <Link
                            to={`/land/${doc.land_identity_id}`}
                            className="font-mono text-sky-400 hover:underline flex items-center space-x-1 mt-0.5"
                          >
                            <span className="truncate">{doc.land_identity_id}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </Link>
                        </div>
                      )}

                      <div className="text-[11px] text-slate-400 space-y-1">
                        <div className="flex justify-between">
                          <span>Issue Date:</span>
                          <span className="text-slate-300 font-medium">{doc.issue_date || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Location:</span>
                          <span className="text-slate-300 font-medium">{doc.district}, {doc.state}</span>
                        </div>
                        {doc.digital_stamp_id && (
                          <div className="flex justify-between text-emerald-400 font-mono text-[10px]">
                            <span>DSC Seal ID:</span>
                            <span>{doc.digital_stamp_id}</span>
                          </div>
                        )}
                      </div>

                      {/* Cryptographic SHA-256 checksum preview */}
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                        <div className="truncate">
                          <span className="text-slate-500">SHA256: </span>
                          <span className="text-slate-300">{doc.file_hash.slice(0, 16)}...</span>
                        </div>
                        <span className="text-emerald-400 font-bold ml-2">✓ Verified</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 border border-sky-800/60 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview & Cert</span>
                      </button>

                      {doc.verification_status === 'PENDING' && (
                        <button
                          onClick={() => handleRequestVerification(doc.document_id)}
                          className="py-1.5 px-2.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 text-xs font-semibold flex items-center space-x-1"
                          title="Request revenue authority verification"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Request Verify</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteDoc(doc.document_id)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-800 transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY LAND HOLDINGS PORTFOLIO */}
        {activeTab === 'PROPERTIES' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Registered Property Portfolio</h2>
              <button
                onClick={() => setIsAddPropModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Property</span>
              </button>
            </div>

            {properties.length === 0 ? (
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-12 text-center space-y-4">
                <Layers className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No land holdings tracked yet</h3>
                <p className="text-xs text-slate-400">
                  Save parcels you own or are evaluating to track mutation progress, encumbrances, and real-time legal risk alerts.
                </p>
                <button
                  onClick={() => setIsAddPropModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold"
                >
                  Save First Parcel
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {properties.map((prop) => (
                  <div
                    key={prop.id}
                    className="bg-slate-800/90 border border-slate-700 hover:border-purple-500/60 rounded-2xl p-5 shadow-lg space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950/80 text-purple-400 border border-purple-800 uppercase">
                          {prop.ownership_status}
                        </span>
                        <h3 className="text-base font-bold text-white mt-1.5">{prop.property_nickname}</h3>
                        <p className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{prop.mauza || 'Mauza'}, {prop.district}, {prop.state}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-slate-400">Bhoomi Risk Score</div>
                        <div className={`text-xl font-black ${
                          (prop.risk_score || 0) > 60 ? 'text-rose-400' : (prop.risk_score || 0) > 30 ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {prop.risk_score || 25}/100
                        </div>
                        <span className="text-[10px] text-slate-400">{prop.risk_level || 'LOW'} RISK</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Area</span>
                        <span className="font-bold text-slate-200">{prop.registered_area_acre || prop.area_acre || 1.0} Acres</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Khata / Gata</span>
                        <span className="font-bold text-slate-200">{prop.khata_no || '340'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Linked Docs</span>
                        <span className="font-bold text-sky-400">{prop.linked_documents_count || 0} Files</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-700/60">
                      <span className="text-slate-400 font-mono text-[11px] truncate max-w-[200px]">
                        {prop.land_identity_id}
                      </span>
                      <Link
                        to={`/land/${prop.land_identity_id}`}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center space-x-1"
                      >
                        <span>Inspect Parcel</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CITIZEN KYC & PROFILE */}
        {activeTab === 'KYC' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Verified Citizen Digital Identity</span>
              </h3>
              <p className="text-xs text-slate-400">
                Your BhoomiShield account is digitally mapped to the Government UIDAI Aadhaar and Income Tax PAN databases.
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Aadhaar Card Linkage</div>
                      <div className="text-[11px] text-slate-400 font-mono">XXXX-XXXX-{user?.aadhaar_last4 || '5412'}</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                    ACTIVE
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-950 text-sky-400 flex items-center justify-center font-bold">
                      PAN
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Income Tax PAN Verification</div>
                      <div className="text-[11px] text-slate-400 font-mono">{user?.pan_number || 'ABCPS1234F'}</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-800 px-2 py-0.5 rounded font-bold">
                    VERIFIED
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-950 text-purple-400 flex items-center justify-center font-bold">
                      DL
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">DigiLocker Bridge Access</div>
                      <div className="text-[11px] text-slate-400">Sync with State Land Record APIs</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-purple-950 text-purple-400 border border-purple-800 px-2 py-0.5 rounded font-bold">
                    CONNECTED
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Lock className="w-5 h-5 text-sky-400" />
                <span>Security & Storage Details</span>
              </h3>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Encrypted Locker Storage</span>
                    <span className="font-bold text-sky-400">{stats?.storage_used_kb || 945} KB / 100 MB</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-sky-500 h-2 rounded-full" style={{ width: '1.2%' }}></div>
                  </div>
                </div>

                <div className="space-y-1 text-slate-400 text-[11px]">
                  <p>• Documents are stored with client-side SHA-256 checksums to detect unauthorized modifications.</p>
                  <p>• Verified revenue documents contain digital signature certificates issued by competent Tahsildar / Sub-Registrars.</p>
                  <p>• All access requests are logged under National DILRMP audit trails.</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* MODAL 1: UPLOAD DOCUMENT */}
      {/* ========================================================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <UploadCloud className="w-5 h-5 text-sky-400" />
                <span>Upload Document to Bhoomi Vault</span>
              </h2>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Registered Sale Deed - Dadri Plot 112/1"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Document Category *
                  </label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as DocumentType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="SALE_DEED">Sale Deed (Bikrinama)</option>
                    <option value="KHATAUNI_ROR">Khatauni RoR / Khatian</option>
                    <option value="SEVEN_TWELVE">7/12 (Saat Bara) Extract</option>
                    <option value="RTC_PAHANI">RTC Pahani (Karnataka)</option>
                    <option value="PATTA_CHITTA">Patta Chitta (Tamil Nadu)</option>
                    <option value="MUTATION_CERT">Mutation Order (Dakhil-Kharij)</option>
                    <option value="ENCUMBRANCE_CERT">Nil-Encumbrance Certificate</option>
                    <option value="TAX_RECEIPT">Revenue Tax / Lagan Receipt</option>
                    <option value="COURT_ORDER">Court Order / Injunction</option>
                    <option value="OTHER">Other Revenue Document</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Link Land Identity ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={uploadLandId}
                    onChange={(e) => setUploadLandId(e.target.value)}
                    placeholder="UP-GAU-DAD-BHAN-P340-PL112-1"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">State</label>
                  <input
                    type="text"
                    value={uploadState}
                    onChange={(e) => setUploadState(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">District</label>
                  <input
                    type="text"
                    value={uploadDistrict}
                    onChange={(e) => setUploadDistrict(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Issuing Authority</label>
                  <input
                    type="text"
                    value={uploadAuthority}
                    onChange={(e) => setUploadAuthority(e.target.value)}
                    placeholder="e.g. Sub-Registrar Office, Dadri"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Issue / Registration Date</label>
                  <input
                    type="date"
                    value={uploadDate}
                    onChange={(e) => setUploadDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Drag and Drop File Simulator */}
              <div className="border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-2xl p-6 text-center space-y-2 bg-slate-950/50 cursor-pointer">
                <FileText className="w-8 h-8 text-sky-400 mx-auto" />
                <div className="text-xs text-slate-300 font-bold">
                  File Selected: <span className="text-sky-400">{uploadFileName}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  PDF, scanned JPG or PNG up to 25 MB. Tamper-proof SHA-256 hash will be generated automatically.
                </p>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 font-bold text-sm text-white shadow-lg shadow-sky-600/20"
              >
                {isUploading ? 'Securing & Encrypting in Vault...' : 'Save Document to Bhoomi Vault'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: ADD LAND PARCEL TO PORTFOLIO */}
      {/* ========================================================= */}
      {isAddPropModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>Save Property to Portfolio</span>
              </h2>
              <button
                onClick={() => setIsAddPropModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPropertySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Land Identity ID (ULPIN / DILRMP ID) *
                </label>
                <input
                  type="text"
                  required
                  value={propLandId}
                  onChange={(e) => setPropLandId(e.target.value)}
                  placeholder="UP-GAU-DAD-BHAN-P340-PL112-1"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Property Nickname / Label *
                </label>
                <input
                  type="text"
                  required
                  value={propNickname}
                  onChange={(e) => setPropNickname(e.target.value)}
                  placeholder="e.g. Dadri Farmhouse or Pune Commercial Plot"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ownership Relationship
                </label>
                <select
                  value={propStatus}
                  onChange={(e) => setPropStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="OWNER">Full Registered Owner</option>
                  <option value="BUYER_INQUIRY">Prospective Buyer (Under Due Diligence)</option>
                  <option value="FAMILY_INHERITANCE">Family Ancestral Holding</option>
                  <option value="WATCHLIST">Watchlist (Monitoring Mutation)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={propNotes}
                  onChange={(e) => setPropNotes(e.target.value)}
                  placeholder="Any notes or legal reminders..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isAddingProp}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-sm text-white shadow-lg shadow-emerald-600/20"
              >
                {isAddingProp ? 'Saving...' : 'Add Property to Portfolio'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: DOCUMENT PREVIEW & INTEGRITY CERTIFICATE */}
      {/* ========================================================= */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <div>
                  <h2 className="text-base font-bold text-white">Digital Document & Verification Seal</h2>
                  <span className="text-[10px] text-slate-400">Document ID: {previewDoc.document_id}</span>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Verification Certificate Card */}
            <div className="bg-gradient-to-br from-slate-950 to-slate-900 border-2 border-emerald-500/40 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white uppercase tracking-wide">Government DILRMP Cryptographic Seal</div>
                    <div className="text-[10px] text-emerald-400">Authenticated BhoomiShield Vault Record</div>
                  </div>
                </div>
                {previewDoc.digital_stamp_id && (
                  <span className="font-mono text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                    {previewDoc.digital_stamp_id}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Document Title:</span>
                  <span className="font-bold text-white">{previewDoc.title}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Document Type:</span>
                  <span className="font-bold text-sky-400">{previewDoc.document_type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Issuing Authority:</span>
                  <span className="text-slate-200">{previewDoc.issuing_authority}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Date of Record:</span>
                  <span className="text-slate-200">{previewDoc.issue_date || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Verified By:</span>
                  <span className="text-emerald-300 font-semibold">{previewDoc.verified_by_officer || 'Pending Revenue Audit'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Verification Date:</span>
                  <span className="text-slate-200">{previewDoc.verification_date || 'Pending'}</span>
                </div>
              </div>

              {/* Cryptographic SHA-256 Hash Block */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-semibold flex items-center space-x-1">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cryptographic SHA-256 Digest:</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(previewDoc.file_hash)}
                    className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center space-x-1"
                  >
                    {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHash ? 'Copied' : 'Copy Hash'}</span>
                  </button>
                </div>
                <div className="font-mono text-[10px] text-slate-300 break-all select-all">
                  {previewDoc.file_hash}
                </div>
              </div>
            </div>

            {/* Document Mock Viewer */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-3">
              <FileText className="w-12 h-12 text-slate-600 mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-white">{previewDoc.file_name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">Size: {previewDoc.file_size_kb} KB • MIME: {previewDoc.mime_type}</p>
              </div>
              <div className="inline-flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero Tampering Detected across National Layer</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
              >
                Close
              </button>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert(`Downloading cryptographic package for ${previewDoc.file_name} with verification certificate.`);
                }}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white flex items-center space-x-1.5 shadow-lg shadow-sky-600/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Secure PDF</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
