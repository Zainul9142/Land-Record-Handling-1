export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface LandParcel {
  id: number;
  land_identity_id: string;
  state: string;
  district: string;
  anchal: string; // Sub-district / Tehsil / Taluk / Mandal
  halka: string;
  mauza: string; // Village / Mauza / Sector
  khata_no: string; // Gata / Khata / Survey / Patta No
  khesra_no: string; // Khasra / Plot / Hissa / Gat No
  area_acre: number;
  land_type: string;
  polygon_json?: string;
  polygon_coords?: [number, number][];
  owner_name?: string;
  created_at?: string;
}

export interface StateMetadata {
  portal: string;
  subdistrict_name: string;
  primary_no_name: string;
  plot_no_name: string;
  record_type: string;
  districts: Record<string, Record<string, string[]>>;
}

export interface KhatianRecord {
  owner_name: string;
  father_husband_name: string;
  caste: string;
  khata_no?: string;
  khesra_no?: string;
  recorded_area_acre: number;
  khatian_type: string;
  record_date: string;
}

export interface Register2Record {
  current_owner_name: string;
  volume_no: string;
  page_no: string;
  lagan_status: string;
  last_paid_year: string;
  recorded_area_acre: number;
  remarks: string;
}

export interface MutationRecord {
  application_no: string;
  applicant_name: string;
  buyer_name: string;
  seller_name: string;
  status: string;
  current_stage: string;
  submitted_at: string;
  updated_at: string;
  age_days: number;
  sla_days: number;
  remarks: string;
}

export interface TransactionRecord {
  deed_no: string;
  deed_type: string;
  seller_name: string;
  buyer_name: string;
  transacted_area_acre: number;
  consideration_amount_inr: number;
  registration_date: string;
  registration_office: string;
}

export interface CourtCaseRecord {
  case_no: string;
  court_name: string;
  case_type: string;
  petitioner: string;
  respondent: string;
  status: string;
  stay_order: number;
  filing_date: string;
  description: string;
}

export interface EncumbranceRecord {
  bank_institution: string;
  mortgage_type: string;
  loan_amount_inr: number;
  charge_status: string;
  registration_date: string;
}

export interface RiskFinding {
  rule_id: string;
  rule_name: string;
  severity: RiskLevel;
  score_contribution: number;
  title: string;
  description: string;
  evidence: Record<string, any>;
}

export interface RiskAnalysis {
  land_identity_id: string;
  risk_score: number;
  risk_level: RiskLevel;
  findings_count: number;
  findings: RiskFinding[];
  status_summary: {
    khatian: RiskLevel;
    register2: RiskLevel;
    mutation: RiskLevel;
    transaction: RiskLevel;
    map: RiskLevel;
    court: RiskLevel;
    encumbrance: RiskLevel;
  };
}

export interface LandProfileResponse {
  parcel: LandParcel;
  records: {
    khatian?: KhatianRecord;
    register2?: Register2Record;
    mutations: MutationRecord[];
    transactions: TransactionRecord[];
    court_cases: CourtCaseRecord[];
    encumbrances: EncumbranceRecord[];
  };
  risk_analysis: RiskAnalysis;
  ai_explanation: string;
}

export interface OfficerCase {
  case_no: string;
  land_identity_id: string;
  state?: string;
  district: string;
  anchal: string;
  mauza: string;
  khata_no: string;
  khesra_no: string;
  owner_name: string;
  risk_level: RiskLevel;
  risk_score: number;
  findings: RiskFinding[];
  evidence_sources: Record<string, any>;
}

export type UserRole = 'CITIZEN' | 'REVENUE_OFFICER' | 'REVIEW_OFFICER' | 'DISTRICT_COLLECTOR' | 'VIGILANCE_OFFICER' | 'ADMIN' | 'BANK_USER';

export interface User {
  user_id: string;
  username: string;
  full_name: string;
  email: string;
  mobile?: string;
  role: UserRole;
  department?: string;
  designation?: string;
  employee_id?: string;
  jurisdiction_state?: string;
  jurisdiction_district?: string;
  jurisdiction_tehsil?: string;
  kyc_status: 'PENDING' | 'VERIFIED' | 'AADHAAR_LINKED';
  aadhaar_last4?: string;
  pan_number?: string;
  avatar_url?: string;
}

export type DocumentType =
  | 'SALE_DEED'
  | 'KHATAUNI_ROR'
  | 'SEVEN_TWELVE'
  | 'RTC_PAHANI'
  | 'PATTA_CHITTA'
  | 'MUTATION_CERT'
  | 'ENCUMBRANCE_CERT'
  | 'POSSESSION_LETTER'
  | 'TAX_RECEIPT'
  | 'COURT_ORDER'
  | 'OTHER';

export type VerificationStatus =
  | 'PENDING'
  | 'OFFICIALLY_VERIFIED'
  | 'FLAGGED_ANOMALY'
  | 'DIGILOCKER_AUTHENTICATED';

export interface UserDocument {
  id: number;
  document_id: string;
  user_id: string;
  land_identity_id?: string;
  title: string;
  document_type: DocumentType;
  state?: string;
  district?: string;
  khata_khasra_no?: string;
  issuing_authority?: string;
  issue_date?: string;
  file_name: string;
  file_size_kb: number;
  file_hash: string;
  file_data?: string;
  mime_type?: string;
  verification_status: VerificationStatus;
  verified_by_officer?: string;
  verification_date?: string;
  digital_stamp_id?: string;
  remarks?: string;
  created_at?: string;
  citizen_name?: string;
  citizen_mobile?: string;
  citizen_email?: string;
}

export interface UserProperty {
  id: number;
  user_id: string;
  land_identity_id: string;
  property_nickname: string;
  ownership_status: 'OWNER' | 'BUYER_INQUIRY' | 'FAMILY_INHERITANCE' | 'WATCHLIST';
  acquired_date?: string;
  registered_area_acre?: number;
  notes?: string;
  created_at?: string;
  state?: string;
  district?: string;
  anchal?: string;
  mauza?: string;
  khata_no?: string;
  khesra_no?: string;
  area_acre?: number;
  land_type?: string;
  risk_score?: number;
  risk_level?: RiskLevel;
  findings_count?: number;
  linked_documents_count?: number;
  owner_name?: string;
}

export interface VaultStats {
  total_documents: number;
  verified_documents: number;
  pending_verifications: number;
  saved_properties: number;
  storage_used_kb: number;
  storage_quota_kb: number;
}

