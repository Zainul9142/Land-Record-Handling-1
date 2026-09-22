import sqlite3
import os
import json
from pathlib import Path

DB_PATH = Path(__file__).parent.parent.parent / "bhoomishield.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False, timeout=10.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    conn.execute("PRAGMA cache_size = -64000;")
    conn.execute("PRAGMA temp_store = MEMORY;")
    conn.execute("PRAGMA mmap_size = 268435456;")
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    # Parcels Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS land_parcels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        land_identity_id TEXT UNIQUE NOT NULL,
        state TEXT DEFAULT 'Jharkhand',
        district TEXT NOT NULL,
        anchal TEXT NOT NULL,
        halka TEXT NOT NULL,
        mauza TEXT NOT NULL,
        khata_no TEXT NOT NULL,
        khesra_no TEXT NOT NULL,
        area_acre REAL NOT NULL,
        land_type TEXT NOT NULL,
        polygon_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # Khatian Records Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS khatian_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        land_identity_id TEXT NOT NULL,
        owner_name TEXT NOT NULL,
        father_husband_name TEXT,
        caste TEXT,
        khata_no TEXT NOT NULL,
        khesra_no TEXT NOT NULL,
        recorded_area_acre REAL NOT NULL,
        khatian_type TEXT DEFAULT 'Sabik',
        record_date TEXT,
        FOREIGN KEY (land_identity_id) REFERENCES land_parcels(land_identity_id)
    );
    """)

    # Register-II Records Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS register2_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        land_identity_id TEXT NOT NULL,
        current_owner_name TEXT NOT NULL,
        volume_no TEXT,
        page_no TEXT,
        lagan_status TEXT DEFAULT 'PAID',
        last_paid_year TEXT DEFAULT '2025-2026',
        recorded_area_acre REAL NOT NULL,
        remarks TEXT,
        FOREIGN KEY (land_identity_id) REFERENCES land_parcels(land_identity_id)
    );
    """)

    # Mutation Records Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS mutations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        land_identity_id TEXT NOT NULL,
        application_no TEXT UNIQUE NOT NULL,
        applicant_name TEXT NOT NULL,
        buyer_name TEXT NOT NULL,
        seller_name TEXT NOT NULL,
        status TEXT NOT NULL,
        current_stage TEXT NOT NULL,
        submitted_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        age_days INTEGER NOT NULL,
        sla_days INTEGER DEFAULT 30,
        remarks TEXT,
        FOREIGN KEY (land_identity_id) REFERENCES land_parcels(land_identity_id)
    );
    """)

    # Transactions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        land_identity_id TEXT NOT NULL,
        deed_no TEXT NOT NULL,
        deed_type TEXT DEFAULT 'Sale Deed',
        seller_name TEXT NOT NULL,
        buyer_name TEXT NOT NULL,
        transacted_area_acre REAL NOT NULL,
        consideration_amount_inr REAL NOT NULL,
        registration_date TEXT NOT NULL,
        registration_office TEXT NOT NULL,
        FOREIGN KEY (land_identity_id) REFERENCES land_parcels(land_identity_id)
    );
    """)

    # Court Cases Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS court_cases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        land_identity_id TEXT NOT NULL,
        case_no TEXT NOT NULL,
        court_name TEXT NOT NULL,
        case_type TEXT NOT NULL,
        petitioner TEXT NOT NULL,
        respondent TEXT NOT NULL,
        status TEXT NOT NULL,
        stay_order INTEGER DEFAULT 0,
        filing_date TEXT NOT NULL,
        description TEXT,
        FOREIGN KEY (land_identity_id) REFERENCES land_parcels(land_identity_id)
    );
    """)

    # Encumbrances Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS encumbrances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        land_identity_id TEXT NOT NULL,
        bank_institution TEXT NOT NULL,
        mortgage_type TEXT DEFAULT 'Equitable Mortgage',
        loan_amount_inr REAL NOT NULL,
        charge_status TEXT NOT NULL,
        registration_date TEXT NOT NULL,
        FOREIGN KEY (land_identity_id) REFERENCES land_parcels(land_identity_id)
    );
    """)

    # Risk Findings Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS risk_findings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        land_identity_id TEXT NOT NULL,
        rule_id TEXT NOT NULL,
        rule_name TEXT NOT NULL,
        severity TEXT NOT NULL,
        score_contribution INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        evidence_json TEXT NOT NULL,
        status TEXT DEFAULT 'OPEN',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (land_identity_id) REFERENCES land_parcels(land_identity_id)
    );
    """)

    # Land Verification Reports Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS verification_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id TEXT UNIQUE NOT NULL,
        land_identity_id TEXT NOT NULL,
        risk_score INTEGER NOT NULL,
        risk_level TEXT NOT NULL,
        findings_count INTEGER NOT NULL,
        report_hash TEXT NOT NULL,
        pdf_path TEXT,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        FOREIGN KEY (land_identity_id) REFERENCES land_parcels(land_identity_id)
    );
    """)

    # Officer Reviews Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS officer_reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_no TEXT UNIQUE NOT NULL,
        land_identity_id TEXT NOT NULL,
        risk_level TEXT NOT NULL,
        officer_name TEXT NOT NULL,
        officer_role TEXT NOT NULL,
        decision TEXT NOT NULL,
        comment TEXT,
        reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (land_identity_id) REFERENCES land_parcels(land_identity_id)
    );
    """)

    # Authority Complaints Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS complaints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        complaint_id TEXT UNIQUE NOT NULL,
        user_name TEXT NOT NULL,
        user_mobile TEXT NOT NULL,
        target_authority TEXT NOT NULL,
        land_identity_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        complaint_text TEXT NOT NULL,
        status TEXT DEFAULT 'SUBMITTED',
        pdf_path TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Citizen Bhoomi Vault Locker Table (NEW)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vault_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_name TEXT DEFAULT 'Ramesh Sharma',
        land_identity_id TEXT NOT NULL,
        document_title TEXT NOT NULL,
        document_type TEXT NOT NULL, -- VERIFIED_REPORT, MUTATION_CERTIFICATE, SALE_DEED, KHATIAN_EXTRACT
        file_path TEXT,
        risk_level TEXT DEFAULT 'LOW',
        saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # System Audit Logs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_name TEXT NOT NULL,
        role TEXT NOT NULL,
        action TEXT NOT NULL,
        resource_type TEXT NOT NULL,
        resource_id TEXT,
        details_json TEXT,
        ip_address TEXT DEFAULT '127.0.0.1',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL,
        department TEXT,
        status TEXT DEFAULT 'ACTIVE'
    );
    """)

    # Performance Secondary Indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_parcels_identity ON land_parcels(land_identity_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_parcels_state_dist ON land_parcels(state, district);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_parcels_khata ON land_parcels(khata_no);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_parcels_khesra ON land_parcels(khesra_no);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_parcels_anchal_mauza ON land_parcels(anchal, mauza);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_register2_identity ON register2_records(land_identity_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_register2_owner ON register2_records(current_owner_name);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_khatian_identity ON khatian_records(land_identity_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_khatian_owner ON khatian_records(owner_name);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_mutations_identity ON mutations(land_identity_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_transactions_identity ON transactions(land_identity_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_court_cases_identity ON court_cases(land_identity_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_encumbrances_identity ON encumbrances(land_identity_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_reports_id ON verification_reports(report_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_user_docs_uid ON user_documents(user_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_user_props_uid ON user_properties(user_id);")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database updated with Bhoomi Vault schema.")
