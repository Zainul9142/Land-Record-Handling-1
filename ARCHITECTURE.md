# BhoomiShield System Architecture & UML Design Document

This document presents the complete system working architecture, class diagram, runtime object diagram, and data flow specifications for the **BhoomiShield** platform.

---

## 🏗️ 1. System Working Architecture Diagram

BhoomiShield follows a multi-tier, decoupled Digital Public Infrastructure (DPI) architecture:

```mermaid
flowchart TD
    subgraph Data_Sources ["1. Official Government Data Sources Layer"]
        DS1["Jharbhoomi Land Portal (jharbhoomi.jharkhand.gov.in)"]
        DS2["JharBhuNaksha Cadastral GIS Polygons"]
        DS3["Registration & Deed Registry Feed"]
        DS4["Revenue & Civil Court Litigation Database"]
        DS5["CERSAI & Bank Mortgage Charge Registry"]
    end

    subgraph Ingestion_Layer ["2. Live Scraper & Ingestion Adapter Layer"]
        SA1["Official Portal Scraper (official_scraper.py)"]
        SA2["Fuzzy Name Normalizer & Canonical ID Generator (normalization.py)"]
        SA3["Multi-State DILRMP Data Resolver"]
    end

    subgraph Engine_Layer ["3. Intelligence & Risk Engine Layer"]
        RE["Deterministic Risk Engine (risk_engine.py)"]
        R001["R001: Owner Record Mismatch"]
        R002["R002: Area Discrepancy"]
        R003["R003: Cadastral Map Missing"]
        R004["R004/5: Mutation SLA Delay (>30 Days)"]
        R006["R006: Unmutated Deed Alert"]
        R007["R007: Active Court Stay Order"]
        RE --> R001 & R002 & R003 & R004 & R006 & R007
    end

    subgraph AI_Services ["4. AI & Document Services Layer"]
        AI1["Grounded AI Explainer (ai_explainer.py)"]
        AI2["AI Legal Advisor (legal_advisor.py - CNT/SPT Acts)"]
        PDF1["ReportLab PDF Generator & QR Signer (pdf_service.py)"]
        PDF2["Grievance PDF Generator (complaint_service.py)"]
        VAL["State Property Circle Rate Calculator (valuation_service.py)"]
    end

    subgraph API_Layer ["5. FastAPI REST API Layer (localhost:8000)"]
        EP1["GET /api/v1/land/search"]
        EP2["GET /api/v1/land/{id}"]
        EP3["POST /api/v1/legal-advisor/consult"]
        EP4["GET /api/v1/valuation/calculate"]
        EP5["POST /api/v1/complaints/submit"]
        EP6["POST /api/v1/reports/generate"]
        EP7["GET /api/v1/reports/verify/{id}"]
        EP8["GET /api/v1/admin/dashboard"]
    end

    subgraph Database_Layer ["6. SQLite Persistent Ledger (bhoomishield.db)"]
        DB1[("land_parcels")]
        DB2[("khatian_records")]
        DB3[("register2_records")]
        DB4[("mutations")]
        DB5[("transactions")]
        DB6[("court_cases")]
        DB7[("verification_reports")]
        DB8[("complaints")]
        DB9[("vault_items")]
        DB10[("officer_reviews")]
    end

    subgraph Presentation_Layer ["7. React 18 + TypeScript Frontend (localhost:5173)"]
        UI0["LaunchAnimation Intro Splash"]
        UI1["Universal Pan-India Search (HomePage.tsx)"]
        UI2["Slide-Over Menu 11+ Drawer (MenuDrawer.tsx)"]
        UI3["Single Sign-On Auth Modal (AuthModal.tsx)"]
        UI4["Unified Profile & WebGL 3D GIS Viewer (LandMap3D.tsx)"]
        UI5["AI Legal Advisor Portal (LegalAdvisorPage.tsx)"]
        UI6["Grievance Redressal Portal (GrievancePage.tsx)"]
        UI7["My Bhoomi Vault Locker (MyBhoomiVaultPage.tsx)"]
        UI8["Stamp Duty Calculator (StampDutyCalculatorPage.tsx)"]
        UI9["Official Review Workspace (AdminDashboard.tsx)"]
    end

    %% Data Flow Connections
    DS1 & DS2 & DS3 & DS4 & DS5 --> SA1 & SA3
    SA1 & SA3 --> SA2 --> DB1
    DB1 & DB2 & DB3 & DB4 & DB5 & DB6 --> RE
    RE --> AI1 & PDF1
    AI2 & PDF1 & PDF2 & VAL --> API_Layer
    API_Layer <--> Database_Layer
    API_Layer <--> Presentation_Layer
```

---

## 📐 2. System Class Diagram

The class diagram outlines domain entity models, core analytical engines, AI advisors, service modules, and frontend state controllers:

```mermaid
classDiagram
    class LandParcel {
        +int id
        +string land_identity_id
        +string state
        +string district
        +string anchal
        +string halka
        +string mauza
        +string khata_no
        +string khesra_no
        +float area_acre
        +string land_type
        +string polygon_json
    }

    class KhatianRecord {
        +int id
        +string land_identity_id
        +string owner_name
        +string father_husband_name
        +string caste
        +string khata_no
        +string khesra_no
        +float recorded_area_acre
        +string khatian_type
    }

    class Register2Record {
        +int id
        +string land_identity_id
        +string current_owner_name
        +string volume_no
        +string page_no
        +string lagan_status
        +float recorded_area_acre
    }

    class MutationRecord {
        +int id
        +string land_identity_id
        +string application_no
        +string applicant_name
        +string buyer_name
        +string seller_name
        +string status
        +string current_stage
        +int age_days
        +int sla_days
    }

    class TransactionRecord {
        +int id
        +string land_identity_id
        +string deed_no
        +string seller_name
        +string buyer_name
        +float transacted_area_acre
        +float consideration_amount_inr
    }

    class CourtCase {
        +int id
        +string land_identity_id
        +string case_no
        +string court_name
        +string case_type
        +string status
        +bool stay_order
    }

    class Encumbrance {
        +int id
        +string land_identity_id
        +string bank_institution
        +float loan_amount_inr
        +string charge_status
    }

    class RiskFinding {
        +string rule_id
        +string rule_name
        +string severity
        +int score_contribution
        +string title
        +string description
        +dict evidence
    }

    class RiskEngine {
        +evaluate_land_parcel_risk(parcel, khatian, r2, mutations, txs, cases, enc) Dict
        +calculate_composite_score(findings) int
    }

    class AILegalAdvisor {
        +consult_legal_advisor(question, land_id, findings) Dict
        +evaluate_cnt_act_restrictions(parcel) Dict
        +evaluate_spt_act_restrictions(parcel) Dict
    }

    class PDFService {
        +generate_land_verification_pdf(report_id, parcel, risk_analysis) tuple
        +embed_qr_code(canvas, verify_url)
    }

    class ValuationService {
        +calculate_stamp_duty_and_valuation(state, area_sqft, property_type) Dict
    }

    class AuthModal {
        +bool isOpen
        +string selectedRole
        +handleRoleSelect(role)
        +handleLoginSubmit()
    }

    class ThemeContext {
        +string theme
        +toggleTheme()
    }

    LandParcel "1" -- "1" KhatianRecord
    LandParcel "1" -- "1" Register2Record
    LandParcel "1" -- "*" MutationRecord
    LandParcel "1" -- "*" TransactionRecord
    LandParcel "1" -- "*" CourtCase
    LandParcel "1" -- "*" Encumbrance
    RiskEngine ..> RiskFinding : produces
    RiskEngine ..> LandParcel : evaluates
    AILegalAdvisor ..> RiskFinding : consumes
    PDFService ..> LandParcel : generates
    ValuationService ..> LandParcel : calculates
```

---

## 🔮 3. Runtime Object Diagram (Instantiation Snapshot)

Snapshot of an active runtime object graph for parcel `JH-BOK-CHA-KURA-P125-PL450-2` in Chas, Bokaro:

```mermaid
classDiagram
    class Parcel_1001 {
        land_identity_id = "JH-BOK-CHA-KURA-P125-PL450-2"
        district = "Bokaro"
        anchal = "Chas"
        mauza = "Kura"
        khata_no = "125"
        khesra_no = "450/2"
        area_acre = 0.50
    }

    class Khatian_101 {
        owner_name = "Ramesh Mahato"
        father_husband_name = "Late Somra Mahato"
        recorded_area_acre = 0.50
    }

    class Register2_101 {
        current_owner_name = "Suresh Mahato"
        volume_no = "VOL-14"
        lagan_status = "PAID"
        recorded_area_acre = 0.50
    }

    class Mutation_8941 {
        application_no = "JH-MUT-2026-8941"
        applicant_name = "Suresh Mahato"
        status = "PENDING"
        current_stage = "Field Verification"
        age_days = 73
        sla_days = 30
    }

    class CourtCase_301 {
        case_no = "REV-CASE-2025-104"
        court_name = "LRDC Court Bokaro"
        status = "PENDING"
        stay_order = 0
    }

    class RiskFinding_R001 {
        rule_id = "R001"
        severity = "MEDIUM"
        title = "Owner Record Mismatch (Active Mutation Pending)"
        score_contribution = 25
    }

    class RiskFinding_R004 {
        rule_id = "R004"
        severity = "MEDIUM"
        title = "Mutation SLA Delayed (>30 Days)"
        score_contribution = 20
    }

    class RiskAnalysis_1001 {
        risk_score = 45
        risk_level = "MEDIUM"
        findings_count = 2
    }

    class Report_BS1001 {
        report_id = "BS-2026-1001"
        report_hash = "a4f81c9703d15a9bc..."
        pdf_path = "generated_reports/BS-2026-1001.pdf"
    }

    Parcel_1001 -- Khatian_101
    Parcel_1001 -- Register2_101
    Parcel_1001 -- Mutation_8941
    Parcel_1001 -- CourtCase_301
    RiskAnalysis_1001 -- RiskFinding_R001
    RiskAnalysis_1001 -- RiskFinding_R004
    Parcel_1001 -- RiskAnalysis_1001
    RiskAnalysis_1001 -- Report_BS1001
```

---

## ⚙️ 4. End-to-End System Execution & Data Flow

### Step 1: Pan-India Search & Canonical ID Resolution
1. The citizen enters search parameters (State, District, Khata, Khesra, or Owner Name) on the `HomePage` or `LandSearchPage`.
2. The `normalization.py` module constructs a canonical Land Identity ID:
   $$\text{LandIdentityID} = \text{StateCode}-\text{DistCode}-\text{AnchalCode}-\text{MauzaCode}-\text{Khata}-\text{Khesra}$$
3. Live adapters query `jharbhoomi.jharkhand.gov.in` and Digital India DILRMP streams in real-time.

### Step 2: Deterministic Risk Engine Evaluation (Rules R001–R007)
The `risk_engine.py` runs deterministic validation rules:
- **R001**: Compares `Khatian.owner_name` vs `Register2.current_owner_name`. If names differ and no mutation is filed, adds **35 points (HIGH)**. If an active mutation is pending, adds **25 points (MEDIUM)**.
- **R002**: Compares `Khatian.recorded_area_acre` vs `Register2.recorded_area_acre`. Discrepancies $>0.05$ acres add **15 points**.
- **R003**: Checks for missing GeoJSON polygon coordinates in JharBhuNaksha.
- **R004/R005**: Checks if `Mutation.age_days > 30`. Delays add **20 points**.
- **R006**: Flags unmutated sale deeds where buyer differs from current tenant roll.
- **R007**: Flags active Revenue/Civil Court stay orders (**40 points (HIGH)**).

Composite Risk Score Calculation:
$$\text{Composite Score} = \min\left(100, \sum_{i=1}^{n} \text{Finding Score}_i\right)$$

- **$0 - 29$**: `LOW RISK` (Green 🟢)
- **$30 - 69$**: `MEDIUM RISK` (Amber 🟡)
- **$70 - 100$**: `HIGH RISK` (Red 🔴)

### Step 3: Grounded AI Legal Counsel & WebGL 3D Mapping
- `legal_advisor.py` checks tribal land transfer prohibitions under **Chota Nagpur Tenancy (CNT) Act 1908 Section 46/71A** and **Santhal Parganas Tenancy (SPT) Act 1949 Section 20**.
- `LandMap3D.tsx` parses plot polygon coordinates and renders a WebGL 3D extruded land parcel with 360° terrain topography controls.

### Step 4: Anti-Tamper QR PDF Report Generation
- `pdf_service.py` compiles the certified verification PDF.
- Computes SHA-256 digital signature hash:
  $$\text{Hash} = \text{SHA256}(\text{LandID} \parallel \text{Score} \parallel \text{Timestamp})$$
- Embeds a QR code linking to `/verify/{report_id}`.

### Step 5: Revenue Officer Review Workflow
- Officers authenticate via `AuthModal.tsx` (`OFFICER GATE`).
- `AdminDashboard.tsx` presents flagged cases for Circle Officer & LRDC review.
- Officers submit signed decisions (`REQUIRE_FIELD_VERIFICATION`, `CITIZEN_CLARIFICATION`, `DISMISS`, `ESCALATE`) which are recorded in `officer_reviews` and `audit_logs`.
