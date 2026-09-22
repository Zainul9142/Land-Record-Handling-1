import os
import hashlib
import qrcode
from io import BytesIO
from pathlib import Path
from typing import Dict, Any

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

REPORTS_DIR = Path(__file__).parent.parent.parent / "generated_reports"
REPORTS_DIR.mkdir(exist_ok=True)

def generate_qr_code_image(verify_url: str) -> BytesIO:
    """Generates a QR code image as BytesIO."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=5,
        border=2,
    )
    qr.add_data(verify_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return buffer

def generate_land_verification_pdf(
    report_id: str,
    parcel: Dict[str, Any],
    risk_analysis: Dict[str, Any],
    records_context: Dict[str, Any],
    verify_base_url: str = "http://localhost:5173"
) -> str:
    """
    Generates downloadable Land Verification Report PDF with embedded QR Code.
    Returns path to saved PDF.
    """
    pdf_filename = f"{report_id}.pdf"
    pdf_path = REPORTS_DIR / pdf_filename
    
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0F172A'), # Slate 900
        alignment=TA_LEFT,
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#475569'), # Slate 600
        alignment=TA_LEFT
    )

    section_header = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1E293B'),
        fontName='Helvetica-Bold',
        spaceBefore=10,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#334155')
    )

    elements = []

    # Header Title Banner
    header_data = [
        [
            Paragraph("<b>BHOOMISHIELD</b><br/><font size=9 color='#0284C7'>AI-Powered Land Identity & Verification Platform</font>", title_style),
            Paragraph(f"<b>GOVERNMENT OF JHARKHAND</b><br/>Revenue & Land Reforms Dept<br/><font size=8 color='#64748B'>Report ID: {report_id}</font>", ParagraphStyle('RHead', alignment=TA_RIGHT, fontSize=9, leading=12))
        ]
    ]
    header_table = Table(header_data, colWidths=[340, 200])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8)
    ]))
    elements.append(header_table)
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#0284C7"), spaceAfter=12))

    # Verification Metadata & QR Section
    verify_url = f"{verify_base_url}/verify/{report_id}"
    qr_img_stream = generate_qr_code_image(verify_url)
    qr_img = Image(qr_img_stream, width=70, height=70)

    land_id = parcel.get("land_identity_id", "")
    risk_level = risk_analysis.get("risk_level", "LOW")
    risk_score = risk_analysis.get("risk_score", 0)
    
    level_color = "#16A34A" if risk_level == "LOW" else ("#CA8A04" if risk_level == "MEDIUM" else "#DC2626")

    meta_text = f"""
    <b>Land Identity ID:</b> {land_id}<br/>
    <b>State / District:</b> Jharkhand / {parcel.get('district')}<br/>
    <b>Anchal / Mauza:</b> {parcel.get('anchal')} / {parcel.get('mauza')}<br/>
    <b>Khata / Khesra:</b> #{parcel.get('khata_no')} / #{parcel.get('khesra_no')}<br/>
    <b>Generated Date:</b> 22 Aug 2026<br/>
    <b>Overall Risk Rating:</b> <font color="{level_color}"><b>{risk_level} ({risk_score}/100)</b></font>
    """

    meta_table_data = [
        [
            Paragraph(meta_text, body_style),
            qr_img
        ]
    ]
    meta_table = Table(meta_table_data, colWidths=[450, 90])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#E2E8F0")),
        ('PADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (1,0), (1,0), 'CENTER')
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 10))

    # Parcel Information Table
    elements.append(Paragraph("1. Land Parcel Specifications", section_header))
    
    khatian_owner = records_context.get("khatian", {}).get("owner_name", "N/A") if records_context.get("khatian") else "Not Available"
    reg2_owner = records_context.get("register2", {}).get("current_owner_name", "N/A") if records_context.get("register2") else "Not Available"

    specs_data = [
        ["Attribute", "Specification", "Attribute", "Specification"],
        ["District", parcel.get("district"), "Area (Acres)", f"{parcel.get('area_acre')} Acres"],
        ["Anchal", parcel.get("anchal"), "Land Category", parcel.get("land_type")],
        ["Halka / Mauza", f"{parcel.get('halka')} / {parcel.get('mauza')}", "Khatian Owner", khatian_owner],
        ["Khata / Khesra", f"Khata #{parcel.get('khata_no')} / Khesra #{parcel.get('khesra_no')}", "Register-II Owner", reg2_owner],
    ]

    specs_table = Table(specs_data, colWidths=[110, 160, 110, 160])
    specs_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F1F5F9")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor("#0F172A")),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('PADDING', (0,0), (-1,-1), 6)
    ]))
    elements.append(specs_table)
    elements.append(Spacer(1, 10))

    # Record Consistency Check Matrix
    elements.append(Paragraph("2. Multi-Source Consistency Matrix", section_header))
    
    sum_map = risk_analysis.get("status_summary", {})
    matrix_data = [
        ["Source Record Layer", "Integrity Status", "Finding Summary"],
        ["Khatian / RoR", sum_map.get("khatian", "LOW"), "Record verified from digitized Khatian database"],
        ["Register-II (Tenant Roll)", sum_map.get("register2", "LOW"), "Current tenant entry and lagan payment history"],
        ["Mutation Application", sum_map.get("mutation", "LOW"), "Active & historical dakhil-kharij applications"],
        ["Registration / Deeds", sum_map.get("transaction", "LOW"), "Transaction deeds and transfer registry"],
        ["JharBhuNaksha Cadastral Map", sum_map.get("map", "LOW"), "Spatial polygon boundary mapping"],
        ["Revenue & Civil Court", sum_map.get("court", "LOW"), "Litigation indicators and dispute records"],
        ["Encumbrance / Bank Charge", sum_map.get("encumbrance", "LOW"), "Hypothecation & mortgage charges"]
    ]

    matrix_table = Table(matrix_data, colWidths=[150, 100, 290])
    matrix_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0284C7")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('PADDING', (0,0), (-1,-1), 5)
    ]))
    elements.append(matrix_table)
    elements.append(Spacer(1, 10))

    # Findings Breakdown
    elements.append(Paragraph("3. Risk Findings & Evidence Breakdown", section_header))
    findings = risk_analysis.get("findings", [])
    
    if not findings:
        elements.append(Paragraph("✓ <b>No record inconsistencies detected.</b> All cross-record integrity checks passed.", body_style))
    else:
        finding_rows = [["Rule ID", "Severity", "Finding Title", "Evidence Details"]]
        for f in findings:
            ev_str = ", ".join([f"{k}: {v}" for k, v in f.get("evidence", {}).items()])
            finding_rows.append([
                f.get("rule_id"),
                f.get("severity"),
                f.get("title"),
                Paragraph(ev_str, ParagraphStyle('Ev', fontSize=7, leading=9))
            ])
        
        findings_table = Table(finding_rows, colWidths=[55, 65, 170, 250])
        findings_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 8),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
            ('PADDING', (0,0), (-1,-1), 5)
        ]))
        elements.append(findings_table)

    elements.append(Spacer(1, 12))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1"), spaceAfter=8))

    # Disclaimer Footer
    disclaimer = (
        "<b>Disclaimer:</b> BhoomiShield is an intelligent verification aid for Jharkhand land records. "
        "This report synthesizes authorized digitized datasets from Jharbhoomi, JharBhuNaksha, and related registries. "
        "It does not replace official certified revenue copies or legal court title decrees. Scan the QR code to verify report integrity."
    )
    elements.append(Paragraph(disclaimer, ParagraphStyle('Disc', fontSize=7, leading=9, textColor=colors.HexColor("#64748B"))))

    # Build Document
    doc.build(elements)
    
    # Calculate Report Hash
    with open(pdf_path, 'rb') as f:
        report_hash = hashlib.sha256(f.read()).hexdigest()
        
    return str(pdf_path), report_hash
