from typing import Dict, Any, List

def generate_risk_explanation(risk_analysis: Dict[str, Any], parcel: Dict[str, Any]) -> str:
    """
    Generates plain-language evidence-grounded risk explanation.
    """
    findings = risk_analysis.get("findings", [])
    level = risk_analysis.get("risk_level", "LOW")
    score = risk_analysis.get("risk_score", 0)
    land_id = parcel.get("land_identity_id", "")
    khata = parcel.get("khata_no", "")
    khesra = parcel.get("khesra_no", "")
    mauza = parcel.get("mauza", "")
    district = parcel.get("district", "")
    
    if not findings:
        return (
            f"Land parcel {land_id} (Khata #{khata}, Khesra #{khesra}, Mauza {mauza}, District {district}) "
            f"has been evaluated with a **LOW RISK** score ({score}/100).\n\n"
            f"All available records across Khatian, Register-II, Mutation status, Transaction history, "
            f"and Spatial cadastral layers are consistent. No active legal court disputes or unmutated transactions were detected."
        )

    paragraphs = [
        f"Land parcel {land_id} has been flagged with **{level} RISK** (Risk Score: {score}/100) due to {len(findings)} specific record inconsistency findings:\n"
    ]

    for idx, f in enumerate(findings, 1):
        rule = f.get("rule_name")
        sev = f.get("severity")
        title = f.get("title")
        desc = f.get("description")
        ev = f.get("evidence", {})

        sev_icon = "🔴" if sev == "HIGH" else ("🟡" if sev == "MEDIUM" else "🟢")
        paragraphs.append(f"### {idx}. {sev_icon} {title} ({sev} Severity)\n**Finding**: {desc}")
        
        if ev:
            ev_strs = [f"- `{k}`: {v}" for k, v in ev.items()]
            paragraphs.append("**Evidence Source**:\n" + "\n".join(ev_strs))

    paragraphs.append(
        "\n> **Note**: BhoomiShield provides automated evidence synthesis to assist verification. "
        "These findings are intended for informational guidance and do not constitute a legal title guarantee. "
        "Please consult the relevant Circle Officer or Revenue Court for authoritative clarification."
    )

    return "\n\n".join(paragraphs)


def answer_parcel_question(question: str, risk_analysis: Dict[str, Any], parcel: Dict[str, Any], records_context: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evidence-grounded Q&A assistant for citizens and revenue officers.
    Strictly uses retrieved record context and risk findings.
    """
    q_lower = question.lower()
    findings = risk_analysis.get("findings", [])
    level = risk_analysis.get("risk_level", "LOW")
    score = risk_analysis.get("risk_score", 0)
    
    # 1. Question about why risk is high/medium
    if any(k in q_lower for k in ["why", "risk", "reason", "flag", "medium", "high", "score"]):
        if not findings:
            answer = f"This parcel has a LOW risk score ({score}/100) because all verified Jharbhoomi records match across Khatian, Register-II, and Mutation layers."
        else:
            reasons = [f"• **{f['title']}**: {f['description']}" for f in findings]
            answer = f"This parcel is classified as **{level} RISK** (Score: {score}/100) for the following reasons:\n\n" + "\n\n".join(reasons) + "\n\nYou should verify these specific items with the Circle Officer prior to transaction."

    # 2. Question about ownership / owner name
    elif any(k in q_lower for k in ["owner", "who owns", "khatian owner", "register"]):
        khatian_owner = records_context.get("khatian", {}).get("owner_name", "N/A") if records_context.get("khatian") else "Not Available"
        reg2_owner = records_context.get("register2", {}).get("current_owner_name", "N/A") if records_context.get("register2") else "Not Available"
        answer = f"According to available records:\n- **Khatian Owner**: {khatian_owner}\n- **Register-II Current Owner**: {reg2_owner}\n"
        if khatian_owner != reg2_owner and khatian_owner != "Not Available":
            answer += "\n⚠️ Notice: There is a difference between recorded Khatian owner and current Register-II tenant. Check mutation history for title transfer."

    # 3. Question about mutation / application
    elif any(k in q_lower for k in ["mutation", "application", "pending", "dakhil", " खारिज"]):
        mutations = records_context.get("mutations", [])
        if not mutations:
            answer = "No active or past mutation records were found in the digital database for this parcel."
        else:
            m_list = [f"- **Case #{m.get('application_no')}**: Status `{m.get('status')}` at stage '{m.get('current_stage')}' (Age: {m.get('age_days')} days)" for m in mutations]
            answer = "Mutation record history:\n\n" + "\n".join(m_list)

    # 4. Question about litigation / court case
    elif any(k in q_lower for k in ["court", "case", "legal", "dispute", "lawsuit", "stay"]):
        cases = records_context.get("court_cases", [])
        if not cases:
            answer = "✓ No active revenue court or civil court cases are recorded against this land parcel."
        else:
            c_list = [f"- **Case #{c.get('case_no')}** ({c.get('court_name')}): {c.get('petitioner')} vs {c.get('respondent')} (Status: {c.get('status')})" for c in cases]
            answer = "⚖️ Court litigation records found:\n\n" + "\n".join(c_list)

    # 5. Default grounded fallback
    else:
        answer = (
            f"Based on the verified records for Parcel `{parcel.get('land_identity_id')}`:\n"
            f"- **Location**: District {parcel.get('district')}, Anchal {parcel.get('anchal')}, Mauza {parcel.get('mauza')}\n"
            f"- **Khata/Khesra**: Khata #{parcel.get('khata_no')}, Khesra #{parcel.get('khesra_no')}\n"
            f"- **Area**: {parcel.get('area_acre')} Acres ({parcel.get('land_type')})\n"
            f"- **Risk Status**: {level} ({score}/100)\n\n"
            f"Feel free to ask about ownership details, mutation status, court disputes, or risk reasons."
        )

    return {
        "question": question,
        "answer": answer,
        "grounded_evidence": [f.get("evidence") for f in findings if f.get("evidence")]
    }
