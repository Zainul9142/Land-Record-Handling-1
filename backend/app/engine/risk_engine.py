from typing import Dict, Any, List
import json
from app.engine.normalization import calculate_name_similarity

def evaluate_land_parcel_risk(
    parcel: Dict[str, Any],
    khatian: Dict[str, Any],
    register2: Dict[str, Any],
    mutations: List[Dict[str, Any]],
    transactions: List[Dict[str, Any]],
    court_cases: List[Dict[str, Any]],
    encumbrances: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Evaluates rules R001 - R007 against normalized land records.
    Returns composite Risk Score (0-100), Risk Level (LOW, MEDIUM, HIGH),
    and structured evidence-backed findings.
    """
    findings = []
    total_score = 0

    # Rule R001: Owner Mismatch between Khatian & Register-II
    if khatian and register2:
        k_owner = khatian.get("owner_name", "")
        r_owner = register2.get("current_owner_name", "")
        similarity = calculate_name_similarity(k_owner, r_owner)
        
        if similarity < 0.70:
            # Check if active mutation explains the mismatch
            has_active_mutation = any(m.get("status") in ["PENDING", "APPROVED"] for m in mutations)
            if has_active_mutation:
                severity = "MEDIUM"
                score = 15
                desc = f"Recorded owner mismatch between Khatian ({k_owner}) and Register-II ({r_owner}). An active mutation case exists which may account for the change."
            else:
                severity = "HIGH"
                score = 30
                desc = f"Significant owner mismatch between Khatian ({k_owner}) and Register-II ({r_owner}) without any recorded mutation."
            
            total_score += score
            findings.append({
                "rule_id": "R001",
                "rule_name": "Owner Record Mismatch",
                "severity": severity,
                "score_contribution": score,
                "title": "Khatian vs Register-II Owner Difference",
                "description": desc,
                "evidence": {
                    "khatian_owner": k_owner,
                    "register2_owner": r_owner,
                    "similarity_score": f"{int(similarity * 100)}%",
                    "has_active_mutation": has_active_mutation
                }
            })

    # Rule R002: Area Mismatch across records
    if khatian and register2:
        k_area = float(khatian.get("recorded_area_acre", 0.0))
        r_area = float(register2.get("recorded_area_acre", 0.0))
        diff = abs(k_area - r_area)
        
        if diff > 0.05:  # threshold 0.05 acre
            score = 15
            total_score += score
            findings.append({
                "rule_id": "R002",
                "rule_name": "Area Discrepancy",
                "severity": "MEDIUM",
                "score_contribution": score,
                "title": "Area Variance Between Records",
                "description": f"Discrepancy of {diff:.2f} Acres detected between Khatian ({k_area:.2f} Acre) and Register-II ({r_area:.2f} Acre).",
                "evidence": {
                    "khatian_area_acre": k_area,
                    "register2_area_acre": r_area,
                    "difference_acre": round(diff, 2)
                }
            })

    # Rule R003: Cadastral Map Inconsistency
    has_map = bool(parcel.get("polygon_json"))
    if not has_map:
        score = 15
        total_score += score
        findings.append({
            "rule_id": "R003",
            "rule_name": "Spatial Polygon Missing",
            "severity": "MEDIUM",
            "score_contribution": score,
            "title": "Cadastral Map Boundary Unavailable",
            "description": "Textual land record is present, but spatial boundary polygon is missing from JharBhuNaksha layer.",
            "evidence": {
                "parcel_id": parcel.get("land_identity_id"),
                "map_layer_status": "NOT_LINKED"
            }
        })

    # Rule R004 & R005: Pending and SLA Delayed Mutations
    pending_mutations = [m for m in mutations if m.get("status") == "PENDING"]
    for m in pending_mutations:
        age_days = m.get("age_days", 0)
        sla_days = m.get("sla_days", 30)
        
        if age_days > sla_days:
            score = 20
            total_score += score
            findings.append({
                "rule_id": "R005",
                "rule_name": "Delayed Mutation Over SLA",
                "severity": "HIGH",
                "score_contribution": score,
                "title": f"Mutation Application Pending Beyond SLA ({age_days} Days)",
                "description": f"Mutation application #{m.get('application_no')} submitted by {m.get('applicant_name')} has been pending for {age_days} days (configured SLA: {sla_days} days).",
                "evidence": {
                    "application_no": m.get("application_no"),
                    "applicant": m.get("applicant_name"),
                    "stage": m.get("current_stage"),
                    "age_days": age_days,
                    "sla_days": sla_days
                }
            })
        else:
            score = 10
            total_score += score
            findings.append({
                "rule_id": "R004",
                "rule_name": "Active Pending Mutation",
                "severity": "MEDIUM",
                "score_contribution": score,
                "title": f"Active Mutation Application #{m.get('application_no')}",
                "description": f"Mutation application #{m.get('application_no')} is currently under processing at stage: '{m.get('current_stage')}'.",
                "evidence": {
                    "application_no": m.get("application_no"),
                    "applicant": m.get("applicant_name"),
                    "stage": m.get("current_stage"),
                    "submitted_at": m.get("submitted_at")
                }
            })

    # Rule R006: Transaction Inconsistency
    if transactions:
        latest_tx = max(transactions, key=lambda x: x.get("registration_date", ""))
        r_owner = register2.get("current_owner_name", "") if register2 else ""
        buyer = latest_tx.get("buyer_name", "")
        
        similarity = calculate_name_similarity(buyer, r_owner) if (buyer and r_owner) else 1.0
        
        # If transaction buyer != current Register-II owner and no pending/approved mutation for buyer
        if similarity < 0.70:
            has_matching_mutation = any(
                calculate_name_similarity(m.get("buyer_name", ""), buyer) > 0.70
                for m in mutations
            )
            
            if not has_matching_mutation:
                score = 25
                total_score += score
                findings.append({
                    "rule_id": "R006",
                    "rule_name": "Unmutated Transaction Detected",
                    "severity": "HIGH",
                    "score_contribution": score,
                    "title": "Registered Sale Deed Without Subsequent Mutation",
                    "description": f"Registered transaction (Deed #{latest_tx.get('deed_no')}) recorded buyer '{buyer}', but Register-II still reflects '{r_owner}' with no filed mutation.",
                    "evidence": {
                        "deed_no": latest_tx.get("deed_no"),
                        "deed_buyer": buyer,
                        "register2_owner": r_owner,
                        "registration_date": latest_tx.get("registration_date"),
                        "matching_mutation_found": False
                    }
                })

    # Rule R007: Court Litigation / Dispute Indicator
    active_court_cases = [c for c in court_cases if c.get("status") in ["PENDING", "STAY_GRANTED"]]
    for c in active_court_cases:
        score = 30
        total_score += score
        findings.append({
            "rule_id": "R007",
            "rule_name": "Legal Dispute Indicator",
            "severity": "HIGH",
            "score_contribution": score,
            "title": f"Active Litigation Found ({c.get('court_name')})",
            "description": f"Potential dispute indicator found: Case #{c.get('case_no')} ({c.get('case_type')}) filed by {c.get('petitioner')} vs {c.get('respondent')}. Stay order: {'YES' if c.get('stay_order') else 'NO'}.",
            "evidence": {
                "case_no": c.get("case_no"),
                "court_name": c.get("court_name"),
                "case_type": c.get("case_type"),
                "petitioner": c.get("petitioner"),
                "respondent": c.get("respondent"),
                "stay_order": bool(c.get("stay_order")),
                "filing_date": c.get("filing_date")
            }
        })

    # Encumbrance Check (Bank charge)
    active_loans = [e for e in encumbrances if e.get("charge_status") == "ACTIVE"]
    for e in active_loans:
        score = 15
        total_score += score
        findings.append({
            "rule_id": "R008",
            "rule_name": "Bank Encumbrance / Mortgage",
            "severity": "MEDIUM",
            "score_contribution": score,
            "title": f"Active Mortgage Charge by {e.get('bank_institution')}",
            "description": f"Active bank mortgage charge of ₹{e.get('loan_amount_inr'):,.2f} registered under {e.get('bank_institution')}.",
            "evidence": {
                "bank": e.get("bank_institution"),
                "loan_amount": f"₹{e.get('loan_amount_inr'):,.2f}",
                "registration_date": e.get("registration_date")
            }
        })

    # Cap score at 100
    final_score = min(total_score, 100)
    
    if final_score >= 66:
        risk_level = "HIGH"
    elif final_score >= 31:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return {
        "land_identity_id": parcel.get("land_identity_id"),
        "risk_score": final_score,
        "risk_level": risk_level,
        "findings_count": len(findings),
        "findings": findings,
        "status_summary": {
            "khatian": "LOW" if not any(f["rule_id"] == "R001" for f in findings) else ("MEDIUM" if any(f["severity"] == "MEDIUM" for f in findings if f["rule_id"] == "R001") else "HIGH"),
            "register2": "LOW" if not any(f["rule_id"] in ["R001", "R002"] for f in findings) else "MEDIUM",
            "mutation": "LOW" if not any(f["rule_id"] in ["R004", "R005"] for f in findings) else ("HIGH" if any(f["rule_id"] == "R005" for f in findings) else "MEDIUM"),
            "transaction": "LOW" if not any(f["rule_id"] == "R006" for f in findings) else "HIGH",
            "map": "LOW" if has_map else "MEDIUM",
            "court": "LOW" if not active_court_cases else "HIGH",
            "encumbrance": "LOW" if not active_loans else "MEDIUM"
        }
    }
