import json
import sqlite3
import hashlib
import os
import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Depends, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.db.database import get_db_connection
from app.engine.risk_engine import evaluate_land_parcel_risk
from app.engine.ai_explainer import generate_risk_explanation, answer_parcel_question
from app.engine.official_scraper import fetch_live_official_records
from app.engine.legal_advisor import consult_legal_advisor
from app.services.pdf_service import generate_land_verification_pdf, REPORTS_DIR
from app.services.complaint_service import generate_official_complaint_pdf, COMPLAINTS_DIR
from app.services.valuation_service import calculate_stamp_duty_and_valuation

router = APIRouter()

# --- Pydantic Schemas ---
class AIQuestionRequest(BaseModel):
    land_identity_id: str
    question: str

class ReportGenerateRequest(BaseModel):
    land_identity_id: str

class OfficerDecisionRequest(BaseModel):
    case_no: str
    land_identity_id: str
    officer_name: str
    officer_role: str
    decision: str
    comment: Optional[str] = ""

class LegalConsultRequest(BaseModel):
    question: str
    land_identity_id: Optional[str] = None

class ComplaintSubmitRequest(BaseModel):
    user_name: str
    user_mobile: str
    target_authority: str
    land_identity_id: str
    subject: str
    complaint_text: str

class VaultAddItemRequest(BaseModel):
    user_name: Optional[str] = "Ramesh Sharma"
    land_identity_id: str
    document_title: str
    document_type: str
    risk_level: Optional[str] = "LOW"

class LoginRequest(BaseModel):
    username: str


# --- Helper to load complete parcel context ---
def fetch_parcel_context(land_identity_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM land_parcels WHERE land_identity_id = ?", (land_identity_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None, None, None, [], [], [], []
    
    parcel = dict(row)
    
    cursor.execute("SELECT * FROM khatian_records WHERE land_identity_id = ?", (land_identity_id,))
    k_row = cursor.fetchone()
    khatian = dict(k_row) if k_row else None
    
    cursor.execute("SELECT * FROM register2_records WHERE land_identity_id = ?", (land_identity_id,))
    r_row = cursor.fetchone()
    register2 = dict(r_row) if r_row else None
    
    cursor.execute("SELECT * FROM mutations WHERE land_identity_id = ?", (land_identity_id,))
    mutations = [dict(m) for m in cursor.fetchall()]
    
    cursor.execute("SELECT * FROM transactions WHERE land_identity_id = ?", (land_identity_id,))
    transactions = [dict(t) for t in cursor.fetchall()]
    
    cursor.execute("SELECT * FROM court_cases WHERE land_identity_id = ?", (land_identity_id,))
    court_cases = [dict(c) for c in cursor.fetchall()]

    cursor.execute("SELECT * FROM encumbrances WHERE land_identity_id = ?", (land_identity_id,))
    encumbrances = [dict(e) for e in cursor.fetchall()]
    
    conn.close()
    return parcel, khatian, register2, mutations, transactions, court_cases, encumbrances


# --- Endpoints ---

@router.get("/health")
def health_check():
    return {
        "status": "ONLINE",
        "platform": "BhoomiShield Pan-India",
        "version": "3.0",
        "scope": "All India 28 States & 8 Union Territories",
        "standard": "Digital India Land Records Modernization Programme (DILRMP)"
    }

@router.get("/official/live-search")
def live_official_portal_search(
    district: str,
    anchal: str,
    mauza: str,
    khata: Optional[str] = None,
    khesra: Optional[str] = None,
    owner: Optional[str] = None
):
    return fetch_live_official_records(district, anchal, mauza, khata, khesra, owner)

@router.get("/valuation/calculate")
def get_stamp_duty_valuation(
    state: str = "Jharkhand",
    area_sqft: float = 21780.0, # 0.5 acre
    property_type: str = "Residential"
):
    return calculate_stamp_duty_and_valuation(state, area_sqft, property_type)

@router.get("/vault/items")
def get_vault_items(user_name: str = "Ramesh Sharma"):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vault_items WHERE user_name = ? ORDER BY id DESC", (user_name,))
    items = [dict(r) for r in cursor.fetchall()]
    conn.close()
    
    # If empty, return realistic sample items for Ramesh Sharma
    if not items:
        items = [
            {
                "id": 101,
                "user_name": "Ramesh Sharma",
                "land_identity_id": "JH-BOK-CHA-KURA-K125-K450-2",
                "document_title": "Verified Land Integrity Report #BS-2026-1001",
                "document_type": "VERIFIED_REPORT",
                "risk_level": "MEDIUM",
                "saved_at": "2026-08-22 16:10:00"
            },
            {
                "id": 102,
                "user_name": "Ramesh Sharma",
                "land_identity_id": "JH-BOK-CHA-KURA-K125-K450-2",
                "document_title": "Official Revenue Grievance Complaint #JH-COMP-2026-5001",
                "document_type": "GRIEVANCE_NOTICE",
                "risk_level": "HIGH",
                "saved_at": "2026-08-22 16:20:00"
            }
        ]
    return {"count": len(items), "items": items}

@router.post("/vault/add")
def add_to_vault(req: VaultAddItemRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO vault_items (user_name, land_identity_id, document_title, document_type, risk_level)
    VALUES (?, ?, ?, ?, ?)
    """, (req.user_name, req.land_identity_id, req.document_title, req.document_type, req.risk_level))
    conn.commit()
    conn.close()
    return {"status": "SUCCESS", "message": f"Document '{req.document_title}' saved to My Bhoomi Vault."}

_CACHED_LOCATIONS = None

@router.get("/land/locations")
def get_locations():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT district, anchal, mauza FROM land_parcels LIMIT 500")
    rows = cursor.fetchall()
    conn.close()
    
    loc_map = {}
    for r in rows:
        d, a, m = r["district"], r["anchal"], r["mauza"]
        if d not in loc_map: loc_map[d] = {}
        if a not in loc_map[d]: loc_map[d][a] = []
        if m not in loc_map[d][a]: loc_map[d][a].append(m)
            
    return {"districts": loc_map}

@router.get("/land/search")
def search_land(
    district: Optional[str] = None,
    anchal: Optional[str] = None,
    mauza: Optional[str] = None,
    khata: Optional[str] = None,
    khesra: Optional[str] = None,
    owner: Optional[str] = None,
    query: Optional[str] = None,
    limit: int = 50
):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    sql = "SELECT p.*, r.current_owner_name as owner_name FROM land_parcels p LEFT JOIN register2_records r ON p.land_identity_id = r.land_identity_id WHERE 1=1"
    params = []
    
    if district:
        sql += " AND p.district = ?"
        params.append(district)
    if anchal:
        sql += " AND p.anchal = ?"
        params.append(anchal)
    if mauza:
        sql += " AND p.mauza LIKE ?"
        params.append(f"%{mauza}%")
    if khata:
        sql += " AND p.khata_no = ?"
        params.append(khata)
    if khesra:
        sql += " AND p.khesra_no LIKE ?"
        params.append(f"%{khesra}%")
    if owner:
        sql += " AND (r.current_owner_name LIKE ? OR p.land_identity_id IN (SELECT land_identity_id FROM khatian_records WHERE owner_name LIKE ?))"
        params.extend([f"%{owner}%", f"%{owner}%"])
    if query:
        sql += " AND (p.land_identity_id LIKE ? OR r.current_owner_name LIKE ? OR p.khata_no = ? OR p.khesra_no = ?)"
        params.extend([f"%{query}%", f"%{query}%", query, query])
        
    sql += " LIMIT ?"
    params.append(limit)
    
    cursor.execute(sql, params)
    results = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return {"count": len(results), "results": results}

@router.get("/land/{land_identity_id}")
def get_land_profile(land_identity_id: str):
    parcel, khatian, register2, mutations, transactions, court_cases, encumbrances = fetch_parcel_context(land_identity_id)
    if not parcel:
        raise HTTPException(status_code=404, detail="Land parcel not found")
        
    risk_analysis = evaluate_land_parcel_risk(parcel, khatian, register2, mutations, transactions, court_cases, encumbrances)
    ai_explanation = generate_risk_explanation(risk_analysis, parcel)
    
    return {
        "parcel": parcel,
        "records": {
            "khatian": khatian,
            "register2": register2,
            "mutations": mutations,
            "transactions": transactions,
            "court_cases": court_cases,
            "encumbrances": encumbrances
        },
        "risk_analysis": risk_analysis,
        "ai_explanation": ai_explanation
    }

@router.get("/land/{land_identity_id}/risk")
def get_land_risk(land_identity_id: str):
    parcel, khatian, register2, mutations, transactions, court_cases, encumbrances = fetch_parcel_context(land_identity_id)
    if not parcel:
        raise HTTPException(status_code=404, detail="Land parcel not found")
        
    risk_analysis = evaluate_land_parcel_risk(parcel, khatian, register2, mutations, transactions, court_cases, encumbrances)
    return risk_analysis

@router.post("/ai/ask")
def ask_ai(req: AIQuestionRequest):
    parcel, khatian, register2, mutations, transactions, court_cases, encumbrances = fetch_parcel_context(req.land_identity_id)
    if not parcel:
        raise HTTPException(status_code=404, detail="Land parcel not found")
        
    risk_analysis = evaluate_land_parcel_risk(parcel, khatian, register2, mutations, transactions, court_cases, encumbrances)
    records_context = {
        "khatian": khatian,
        "register2": register2,
        "mutations": mutations,
        "transactions": transactions,
        "court_cases": court_cases,
        "encumbrances": encumbrances
    }
    
    return answer_parcel_question(req.question, risk_analysis, parcel, records_context)

@router.post("/legal-advisor/consult")
def consult_legal_ai(req: LegalConsultRequest):
    risk_findings = []
    if req.land_identity_id:
        p, k, r2, m, t, c, e = fetch_parcel_context(req.land_identity_id)
        if p:
            res = evaluate_land_parcel_risk(p, k, r2, m, t, c, e)
            risk_findings = res.get("findings", [])
            
    return consult_legal_advisor(req.question, req.land_identity_id, risk_findings)

@router.post("/complaints/submit")
def submit_complaint(req: ComplaintSubmitRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM complaints")
    c_num = cursor.fetchone()[0] + 5001
    complaint_id = f"JH-COMP-2026-{c_num}"
    submitted_at = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S IST")
    
    pdf_path = generate_official_complaint_pdf(
        complaint_id, req.user_name, req.user_mobile, req.target_authority,
        req.land_identity_id, req.subject, req.complaint_text, submitted_at
    )
    
    cursor.execute("""
    INSERT INTO complaints (complaint_id, user_name, user_mobile, target_authority, land_identity_id, subject, complaint_text, status, pdf_path, submitted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (complaint_id, req.user_name, req.user_mobile, req.target_authority, req.land_identity_id, req.subject, req.complaint_text, "SUBMITTED", pdf_path, submitted_at))
    
    cursor.execute("""
    INSERT INTO audit_logs (user_name, role, action, resource_type, resource_id, details_json)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (req.user_name, "CITIZEN", "FILE_AUTHORITY_COMPLAINT", "COMPLAINT", complaint_id, json.dumps({
        "authority": req.target_authority,
        "land_identity_id": req.land_identity_id
    })))

    conn.commit()
    conn.close()
    
    return {
        "complaint_id": complaint_id,
        "status": "SUBMITTED",
        "target_authority": req.target_authority,
        "submitted_at": submitted_at,
        "download_url": f"/api/v1/complaints/download/{complaint_id}",
        "message": f"Grievance complaint #{complaint_id} routed successfully to {req.target_authority} office."
    }

@router.get("/complaints/track/{complaint_id}")
def track_complaint(complaint_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM complaints WHERE complaint_id = ?", (complaint_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Complaint ID not found")
        
    return dict(row)

@router.get("/complaints/download/{complaint_id}")
def download_complaint_pdf(complaint_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT pdf_path FROM complaints WHERE complaint_id = ?", (complaint_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row or not row["pdf_path"] or not os.path.exists(row["pdf_path"]):
        raise HTTPException(status_code=404, detail="Complaint PDF file not found")
        
    return FileResponse(path=row["pdf_path"], media_type="application/pdf", filename=f"{complaint_id}.pdf")

@router.post("/reports/generate")
def generate_report(req: ReportGenerateRequest):
    parcel, khatian, register2, mutations, transactions, court_cases, encumbrances = fetch_parcel_context(req.land_identity_id)
    if not parcel:
        raise HTTPException(status_code=404, detail="Land parcel not found")
        
    risk_analysis = evaluate_land_parcel_risk(parcel, khatian, register2, mutations, transactions, court_cases, encumbrances)
    records_context = {
        "khatian": khatian,
        "register2": register2,
        "mutations": mutations,
        "transactions": transactions,
        "court_cases": court_cases,
        "encumbrances": encumbrances
    }
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM verification_reports")
    report_num = cursor.fetchone()[0] + 1001
    report_id = f"BS-2026-{report_num}"
    
    pdf_path, report_hash = generate_land_verification_pdf(
        report_id, parcel, risk_analysis, records_context
    )
    
    cursor.execute("""
    INSERT INTO verification_reports (report_id, land_identity_id, risk_score, risk_level, findings_count, report_hash, pdf_path)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (report_id, req.land_identity_id, risk_analysis["risk_score"], risk_analysis["risk_level"], len(risk_analysis["findings"]), report_hash, pdf_path))
    
    conn.commit()
    conn.close()
    
    return {
        "report_id": report_id,
        "land_identity_id": req.land_identity_id,
        "risk_score": risk_analysis["risk_score"],
        "risk_level": risk_analysis["risk_level"],
        "report_hash": report_hash,
        "download_url": f"/api/v1/reports/download/{report_id}",
        "verify_url": f"/verify/{report_id}"
    }

@router.get("/reports/download/{report_id}")
def download_report(report_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT pdf_path FROM verification_reports WHERE report_id = ?", (report_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row or not row["pdf_path"] or not os.path.exists(row["pdf_path"]):
        raise HTTPException(status_code=404, detail="Report PDF file not found")
        
    return FileResponse(path=row["pdf_path"], media_type="application/pdf", filename=f"{report_id}.pdf")

@router.get("/reports/verify/{report_id}")
def verify_report_qr(report_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT r.*, p.district, p.anchal, p.mauza, p.khata_no, p.khesra_no, p.area_acre FROM verification_reports r JOIN land_parcels p ON r.land_identity_id = p.land_identity_id WHERE r.report_id = ?", (report_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return {
            "verified": False,
            "status": "NOT_FOUND",
            "message": f"Report ID '{report_id}' was not issued by BhoomiShield or has been revoked."
        }
        
    rep = dict(row)
    return {
        "verified": True,
        "status": "VERIFIED",
        "report_id": rep["report_id"],
        "land_identity_id": rep["land_identity_id"],
        "district": rep["district"],
        "anchal": rep["anchal"],
        "mauza": rep["mauza"],
        "khata_no": rep["khata_no"],
        "khesra_no": rep["khesra_no"],
        "area_acre": rep["area_acre"],
        "risk_score": rep["risk_score"],
        "risk_level": rep["risk_level"],
        "findings_count": rep["findings_count"],
        "generated_at": rep["generated_at"],
        "report_hash": rep["report_hash"]
    }

@router.get("/mutation/track/{application_no}")
def track_mutation(application_no: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT m.*, p.district, p.anchal, p.mauza, p.khata_no, p.khesra_no FROM mutations m JOIN land_parcels p ON m.land_identity_id = p.land_identity_id WHERE m.application_no = ?", (application_no,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Mutation application number not found")
        
    m = dict(row)
    stages = ["Submitted", "Doc Verification", "Field Verification", "Revenue Review", "Final Decision", "Record Update"]
    current = m["current_stage"]
    curr_idx = stages.index(current) if current in stages else 3
    
    timeline = []
    for idx, stage in enumerate(stages):
        if idx < curr_idx:
            status = "COMPLETED"
        elif idx == curr_idx:
            status = "CURRENT"
        else:
            status = "PENDING"
        timeline.append({"stage": stage, "status": status})

    return {
        "application_no": m["application_no"],
        "land_identity_id": m["land_identity_id"],
        "applicant": m["applicant_name"],
        "buyer": m["buyer_name"],
        "seller": m["seller_name"],
        "district": m["district"],
        "anchal": m["anchal"],
        "status": m["status"],
        "current_stage": m["current_stage"],
        "submitted_at": m["submitted_at"],
        "age_days": m["age_days"],
        "sla_days": m["sla_days"],
        "sla_exceeded": m["age_days"] > m["sla_days"],
        "timeline": timeline
    }

@router.get("/admin/dashboard")
def get_admin_dashboard():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM land_parcels")
    total_parcels = cursor.fetchone()[0]
    
    cursor.execute("SELECT district, COUNT(*) as cnt FROM land_parcels GROUP BY district")
    districts_cnt = [dict(r) for r in cursor.fetchall()]
    
    cursor.execute("SELECT COUNT(*) FROM mutations WHERE status = 'PENDING'")
    pending_mutations = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM officer_reviews")
    total_reviews = cursor.fetchone()[0]
    
    conn.close()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT land_identity_id FROM land_parcels LIMIT 500")
    sample_ids = [r["land_identity_id"] for r in cursor.fetchall()]
    conn.close()
    
    high_cnt = 0
    med_cnt = 0
    low_cnt = 0
    
    for lid in sample_ids[:100]:
        p, k, r2, m, t, c, e = fetch_parcel_context(lid)
        res = evaluate_land_parcel_risk(p, k, r2, m, t, c, e)
        if res["risk_level"] == "HIGH":
            high_cnt += 1
        elif res["risk_level"] == "MEDIUM":
            med_cnt += 1
        else:
            low_cnt += 1
            
    total_sample = len(sample_ids[:100]) or 1
    extrapolate = total_parcels / total_sample
    
    return {
        "parcels_analyzed": total_parcels,
        "high_risk_count": int(high_cnt * extrapolate),
        "medium_risk_count": int(med_cnt * extrapolate),
        "low_risk_count": int(low_cnt * extrapolate),
        "pending_reviews": pending_mutations,
        "officer_decisions_logged": total_reviews,
        "district_risk_breakdown": districts_cnt
    }

@router.get("/admin/cases")
def get_flagged_cases(limit: int = 20):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT p.*, r.current_owner_name as owner_name 
    FROM land_parcels p 
    LEFT JOIN register2_records r ON p.land_identity_id = r.land_identity_id
    LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    
    cases = []
    for row in rows:
        lid = row["land_identity_id"]
        p, k, r2, m, t, c, e = fetch_parcel_context(lid)
        res = evaluate_land_parcel_risk(p, k, r2, m, t, c, e)
        if res["risk_level"] in ["HIGH", "MEDIUM"]:
            cases.append({
                "case_no": f"CASE-{lid}",
                "land_identity_id": lid,
                "district": p["district"],
                "anchal": p["anchal"],
                "mauza": p["mauza"],
                "khata_no": p["khata_no"],
                "khesra_no": p["khesra_no"],
                "owner_name": r2.get("current_owner_name") if r2 else "N/A",
                "risk_level": res["risk_level"],
                "risk_score": res["risk_score"],
                "findings": res["findings"],
                "evidence_sources": {
                    "khatian": k,
                    "register2": r2,
                    "mutations": m,
                    "transactions": t,
                    "court_cases": c,
                    "encumbrances": e
                }
            })
            
    return {"count": len(cases), "cases": cases}

@router.post("/admin/cases/decision")
def record_officer_decision(req: OfficerDecisionRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    INSERT OR REPLACE INTO officer_reviews (case_no, land_identity_id, risk_level, officer_name, officer_role, decision, comment)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (req.case_no, req.land_identity_id, "FLAGGED", req.officer_name, req.officer_role, req.decision, req.comment))
    
    cursor.execute("""
    INSERT INTO audit_logs (user_name, role, action, resource_type, resource_id, details_json)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (req.officer_name, req.officer_role, "RECORD_CASE_DECISION", "OFFICER_REVIEW", req.case_no, json.dumps({
        "decision": req.decision,
        "comment": req.comment,
        "land_identity_id": req.land_identity_id
    })))
    
    conn.commit()
    conn.close()
    
    return {"status": "SUCCESS", "message": f"Officer decision '{req.decision}' recorded for case {req.case_no}."}

@router.get("/admin/audit")
def get_audit_logs(limit: int = 50):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_logs ORDER BY id DESC LIMIT ?", (limit,))
    logs = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"count": len(logs), "logs": logs}

@router.post("/auth/login")
def login_user(req: LoginRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (req.username,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=401, detail="User not found")
        
    u = dict(row)
    return {
        "token": f"mock-jwt-token-{u['id']}",
        "user": u
    }
