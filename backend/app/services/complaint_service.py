import os
import hashlib
from pathlib import Path
from typing import Dict, Any

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

COMPLAINTS_DIR = Path(__file__).parent.parent.parent / "generated_complaints"
COMPLAINTS_DIR.mkdir(exist_ok=True)

def generate_official_complaint_pdf(
    complaint_id: str,
    user_name: str,
    user_mobile: str,
    target_authority: str,
    land_identity_id: str,
    subject: str,
    complaint_text: str,
    submitted_at: str
) -> str:
    """
    Generates formal official Grievance Complaint PDF letter.
    """
    pdf_filename = f"{complaint_id}.pdf"
    pdf_path = COMPLAINTS_DIR / pdf_filename

    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=16,
        leading=20,
        textColor=colors.HexColor('#0F172A'),
        fontName='Helvetica-Bold'
    )

    body_style = ParagraphStyle(
        'BodyCustom',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155')
    )

    elements = []

    # Header
    elements.append(Paragraph("<b>OFFICIAL REVENUE GRIEVANCE & COMPLAINT NOTICE</b>", title_style))
    elements.append(Paragraph("<font size=9 color='#0284C7'>Issued via BhoomiShield Jharkhand Citizen Grievance Portal</font>", body_style))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#0284C7"), spaceAfter=12))

    # Meta Table
    meta_data = [
        ["Grievance Tracking ID:", complaint_id, "Filing Date:", submitted_at],
        ["Target Authority:", target_authority, "Complainant Name:", user_name],
        ["Contact Mobile:", user_mobile, "Land Identity ID:", land_identity_id]
    ]

    meta_table = Table(meta_data, colWidths=[120, 160, 120, 160])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#E2E8F0")),
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('PADDING', (0,0), (-1,-1), 6)
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 14))

    # To Addressee
    addressee = f"""
    <b>TO:</b><br/>
    <b>The Office of {target_authority}</b><br/>
    Department of Revenue & Land Reforms<br/>
    Government of Jharkhand
    """
    elements.append(Paragraph(addressee, body_style))
    elements.append(Spacer(1, 10))

    # Subject Line
    subj_text = f"<b>SUBJECT: FORMAL COMPLAINT REGARDING LAND PARCEL {land_identity_id} — {subject.upper()}</b>"
    elements.append(Paragraph(subj_text, ParagraphStyle('Subj', parent=body_style, fontName='Helvetica-Bold', fontSize=10, leading=14)))
    elements.append(Spacer(1, 10))

    # Complaint Body
    body_text = f"""
    Respected Sir/Madam,<br/><br/>
    I, <b>{user_name}</b> (Mobile: {user_mobile}), am submitting this formal grievance complaint regarding digitized land parcel <b>{land_identity_id}</b>.<br/><br/>
    <b>Grievance Statement & Evidence Findings:</b><br/>
    {complaint_text}<br/><br/>
    <b>Relief Requested:</b><br/>
    1. Initiate immediate revenue inspection and verify Register-II volume entries for Land Identity ID <code>{land_identity_id}</code>.<br/>
    2. Resolve pending SLA delay / record inconsistency within statutory timelines as prescribed under Jharkhand Land Revenue Rules.<br/>
    3. Issue written status disposition to the complainant.<br/><br/>
    Sincerely,<br/>
    <b>{user_name}</b><br/>
    Digital Signature Verified via BhoomiShield Portal
    """
    elements.append(Paragraph(body_text, body_style))
    elements.append(Spacer(1, 20))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1"), spaceAfter=8))

    footer_text = "<b>BhoomiShield Anti-Corruption & Grievance System</b> • Tracking URL: /track-complaint/" + complaint_id
    elements.append(Paragraph(footer_text, ParagraphStyle('Ftr', parent=body_style, fontSize=7, textColor=colors.HexColor("#64748B"))))

    doc.build(elements)
    return str(pdf_path)
