import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_bhoomishield_pptx():
    prs = Presentation()
    # Set 16:9 widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    
    blank_slide_layout = prs.slide_layouts[6]
    
    # Theme Colors
    COLOR_BG = RGBColor(15, 23, 42)        # Slate 900
    COLOR_CARD = RGBColor(30, 41, 59)      # Slate 800
    COLOR_ACCENT = RGBColor(2, 132, 199)   # Sky 600
    COLOR_GOLD = RGBColor(217, 119, 6)     # Amber 600
    COLOR_GREEN = RGBColor(16, 185, 129)   # Emerald 500
    COLOR_TEXT_MAIN = RGBColor(255, 255, 255)
    COLOR_TEXT_MUTED = RGBColor(148, 163, 184)

    def set_slide_background(slide, color=COLOR_BG):
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = color

    def add_header(slide, title_text, category_text="BHOOMISHIELD PLATFORM"):
        # Header category badge
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.4))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(10)
        p_cat.font.bold = True
        p_cat.font.color.rgb = COLOR_ACCENT
        
        # Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11.7), Inches(0.8))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(24)
        p_title.font.bold = True
        p_title.font.color.rgb = COLOR_TEXT_MAIN

    # --- SLIDE 1: Title Slide ---
    slide1 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide1)
    
    # Title Box
    t_box = slide1.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(11.333), Inches(3.5))
    tf1 = t_box.text_frame
    tf1.word_wrap = True
    
    p0 = tf1.paragraphs[0]
    p0.text = "BHOOMISHIELD — JHARKHAND"
    p0.font.size = Pt(14)
    p0.font.bold = True
    p0.font.color.rgb = COLOR_GOLD
    p0.space_after = Pt(10)
    
    p1 = tf1.add_paragraph()
    p1.text = "AI-Powered Land Identity, Verification & Risk Intelligence Platform"
    p1.font.size = Pt(36)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_TEXT_MAIN
    p1.space_after = Pt(15)
    
    p2 = tf1.add_paragraph()
    p2.text = "Unifying Jharbhoomi, JharBhuNaksha, Registration Deeds & Revenue Court Data into One Explainable Citizen & Government Layer"
    p2.font.size = Pt(16)
    p2.font.color.rgb = COLOR_TEXT_MUTED
    
    # Bottom info box
    b_box = slide1.shapes.add_textbox(Inches(1.0), Inches(6.0), Inches(11.333), Inches(0.8))
    p_b = b_box.text_frame.paragraphs[0]
    p_b.text = "Government Pilot Prototype • Version 2.0 • Real-Time Scraper, AI Legal Advisor & 3D Cadastral Mapping"
    p_b.font.size = Pt(11)
    p_b.font.color.rgb = COLOR_ACCENT

    # --- SLIDE 2: Problem Statement ---
    slide2 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide2)
    add_header(slide2, "The Core Problem in Digitized Land Records", "EXECUTIVE SUMMARY & CHALLENGE")
    
    cards_data_s2 = [
        ("Fragmented Records", "Citizens must navigate multiple portals (District → Anchal → Mauza → Khata) across Khatian, Register-II, Mutation, Deeds, and Maps."),
        ("Unmutated Sale Deeds", "Registered deeds often remain unmutated in Register-II, creating ownership discrepancies and opportunities for fraudulent resales."),
        ("Tribal Land Restrictions", "Complex legal restrictions under CNT Act 1908 & SPT Act 1949 are difficult for citizens and buyers to interpret."),
        ("Opaque Risk & Litigation", "Pending revenue court stay orders and bank mortgages are hidden across separate institutional databases.")
    ]
    
    for idx, (title, desc) in enumerate(cards_data_s2):
        col = idx % 2
        row = idx // 2
        left = Inches(1.0 + col * 5.8)
        top = Inches(1.8 + row * 2.6)
        
        shape = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(5.4), Inches(2.2))
        shape.fill.solid()
        shape.fill.fore_color.rgb = COLOR_CARD
        shape.line.color.rgb = COLOR_ACCENT
        
        tf = shape.text_frame
        tf.word_wrap = True
        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(16)
        p_t.font.bold = True
        p_t.font.color.rgb = COLOR_GOLD
        p_t.space_after = Pt(8)
        
        p_d = tf.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(12)
        p_d.font.color.rgb = COLOR_TEXT_MAIN

    # --- SLIDE 3: Product Vision & Principles ---
    slide3 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide3)
    add_header(slide3, "BhoomiShield Product Vision & Non-Authoritative Rule", "PRODUCT ARCHITECTURE")
    
    box3 = slide3.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.333), Inches(5.0))
    tf3 = box3.text_frame
    tf3.word_wrap = True
    
    principles = [
        ("1. Government Records Remain Authoritative", "BhoomiShield never replaces official Jharbhoomi records; it consumes authorized APIs/feeds to perform cross-record risk synthesis."),
        ("2. Zero Hallucination Policy", "AI responses are strictly grounded in verified JSON record evidence with 100% statutory citations."),
        ("3. Standardized Land Identity", "Generates an internal canonical LandIdentityID (e.g. JH-BOK-CHA-KURA-K125-K450-2) linking all record layers."),
        ("4. Deterministic Risk Engine", "Uses transparent 0–100 scoring across rules R001 to R007 rather than black-box AI predictions."),
        ("5. Citizen & Official Empowerment", "Provides QR-verifiable PDF land reports, AI legal counsel, 3D cadastral GIS maps, and authority grievance redressal.")
    ]
    
    for title, desc in principles:
        p_t = tf3.add_paragraph()
        p_t.text = title
        p_t.font.size = Pt(15)
        p_t.font.bold = True
        p_t.font.color.rgb = COLOR_ACCENT
        p_t.space_after = Pt(2)
        
        p_d = tf3.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(12)
        p_d.font.color.rgb = COLOR_TEXT_MAIN
        p_d.space_after = Pt(12)

    # --- SLIDE 4: Deterministic Risk Engine (R001-R007) ---
    slide4 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide4)
    add_header(slide4, "Deterministic Risk Engine (Rules R001 – R007)", "INTELLIGENCE LAYER")
    
    rules = [
        ("R001: Owner Mismatch", "Khatian owner != Register-II tenant (High risk if no mutation, Medium if active mutation)."),
        ("R002: Area Variance", "Discrepancy > 0.05 Acres between Khatian and Register-II recorded area."),
        ("R003: Map Missing", "Textual land record exists but spatial polygon geometry is missing from JharBhuNaksha."),
        ("R004 & R005: Mutation SLA", "Tracks pending mutation applications and flags cases exceeding statutory 30-day SLA."),
        ("R006: Unmutated Deed", "Latest sale deed buyer differs from Register-II tenant without matching filed mutation."),
        ("R007: Court Litigation", "Matching active Revenue Court / Civil Court dispute or interim stay order detected.")
    ]
    
    for idx, (r_title, r_desc) in enumerate(rules):
        col = idx % 2
        row = idx // 2
        left = Inches(1.0 + col * 5.8)
        top = Inches(1.8 + row * 1.7)
        
        shape = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(5.4), Inches(1.4))
        shape.fill.solid()
        shape.fill.fore_color.rgb = COLOR_CARD
        shape.line.color.rgb = COLOR_GREEN
        
        tf = shape.text_frame
        tf.word_wrap = True
        p_t = tf.paragraphs[0]
        p_t.text = r_title
        p_t.font.size = Pt(14)
        p_t.font.bold = True
        p_t.font.color.rgb = COLOR_TEXT_MAIN
        p_t.space_after = Pt(4)
        
        p_d = tf.add_paragraph()
        p_d.text = r_desc
        p_d.font.size = Pt(11)
        p_d.font.color.rgb = COLOR_TEXT_MUTED

    # --- SLIDE 5: Real-time Live Portal Ingestion & Search ---
    slide5 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide5)
    add_header(slide5, "Real-Time Official Portal Search Engine", "LIVE DATA INGESTION")
    
    box5 = slide5.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.333), Inches(5.0))
    tf5 = box5.text_frame
    tf5.word_wrap = True
    
    points5 = [
        ("Direct Official Adapter", "Connects live to Jharbhoomi (jharbhoomi.jharkhand.gov.in) and Digital India Land Record endpoints."),
        ("Real-Time Query Parsing", "Fetches live District, Anchal, Mauza, Khata, Khesra, and Raiyat records in real time."),
        ("Automated Proxy Resilience", "Includes a high-speed live stream fallback proxy so search execution never fails during government CAPTCHA or server maintenance."),
        ("Authenticated Stream Badge", "Search results display a live verification badge (🟢 OFFICIAL JHARBHOOMI REAL-TIME STREAM) with exact timestamp.")
    ]
    
    for title, desc in points5:
        p_t = tf5.add_paragraph()
        p_t.text = f"• {title}"
        p_t.font.size = Pt(16)
        p_t.font.bold = True
        p_t.font.color.rgb = COLOR_ACCENT
        p_t.space_after = Pt(2)
        
        p_d = tf5.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(13)
        p_d.font.color.rgb = COLOR_TEXT_MAIN
        p_d.space_after = Pt(14)

    # --- SLIDE 6: Grounded AI Legal Advisor ---
    slide6 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide6)
    add_header(slide6, "Grounded AI Legal Advisor (Indian & Jharkhand Land Laws)", "CITIZEN EMPOWERMENT")
    
    laws = [
        ("CNT Act 1908 (Section 46 & 71A)", "Provides statutory advice on Scheduled Tribe land transfer prohibitions and Deputy Commissioner eviction remedies."),
        ("SPT Act 1949 (Section 20)", "Explains non-transferability rules of raiyati holdings in Santhal Parganas division."),
        ("Jharkhand Mutation Act 2011", "Guides citizens on 30-day SLA enforcement and Section 7 First Appeal procedures before LRDC."),
        ("Registration Act & Specific Relief Act", "Details remedies for unmutated sale deeds, partition suits, and court stay orders.")
    ]
    
    for idx, (l_title, l_desc) in enumerate(laws):
        col = idx % 2
        row = idx // 2
        left = Inches(1.0 + col * 5.8)
        top = Inches(1.8 + row * 2.5)
        
        shape = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(5.4), Inches(2.1))
        shape.fill.solid()
        shape.fill.fore_color.rgb = COLOR_CARD
        shape.line.color.rgb = COLOR_GOLD
        
        tf = shape.text_frame
        tf.word_wrap = True
        p_t = tf.paragraphs[0]
        p_t.text = l_title
        p_t.font.size = Pt(15)
        p_t.font.bold = True
        p_t.font.color.rgb = COLOR_GOLD
        p_t.space_after = Pt(6)
        
        p_d = tf.add_paragraph()
        p_d.text = l_desc
        p_d.font.size = Pt(12)
        p_d.font.color.rgb = COLOR_TEXT_MAIN

    # --- SLIDE 7: Interactive 3D Cadastral & Topography Viewer ---
    slide7 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide7)
    add_header(slide7, "Interactive 3D Cadastral Parcel & Terrain Viewer", "SPATIAL GIS INNOVATION")
    
    box7 = slide7.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.333), Inches(5.0))
    tf7 = box7.text_frame
    tf7.word_wrap = True
    
    points7 = [
        ("WebGL 3D Polygon Extrusion", "Parses official JharBhuNaksha GeoJSON boundary coordinates and projects actual 3D plot polygon geometry."),
        ("Terrain Elevation Contours", "Visualizes plot height, elevation contours, and surrounding topographic buffer zones."),
        ("360° Orbit Rotation Controls", "Interactive HUD controls for 3D Extrusion Height, Terrain Elevation, Pitch Tilt, and 360° Yaw Rotation."),
        ("3D View Modes", "Switch seamlessly between 3D Cadastral Solid, 3D Topography Contour, and Boundary Wireframe view modes.")
    ]
    
    for title, desc in points7:
        p_t = tf7.add_paragraph()
        p_t.text = f"• {title}"
        p_t.font.size = Pt(16)
        p_t.font.bold = True
        p_t.font.color.rgb = COLOR_GREEN
        p_t.space_after = Pt(2)
        
        p_d = tf7.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(13)
        p_d.font.color.rgb = COLOR_TEXT_MAIN
        p_d.space_after = Pt(14)

    # --- SLIDE 8: Authority Complaint & Grievance Redressal ---
    slide8 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide8)
    add_header(slide8, "Authority Complaint & Grievance Redressal System", "GOVERNANCE & TRANSPARENCY")
    
    box8 = slide8.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.333), Inches(5.0))
    tf8 = box8.text_frame
    tf8.word_wrap = True
    
    points8 = [
        ("Automated Complaint Wizard", "Enables citizens to file formal grievances regarding mutation delays or record mismatches."),
        ("Target Revenue Authorities", "Directly routes complaints to Circle Officers (CO), LRDC, District Collector (DC), or Anti-Corruption Cell."),
        ("Official PDF Letter Generator", "Auto-generates downloadable formal PDF Grievance Complaint letters with tracking ID (JH-COMP-2026-XXXX)."),
        ("Lifecycle Status Tracking", "Tracks complaint status from SUBMITTED → ASSIGNED → UNDER_INVESTIGATION → RESOLVED.")
    ]
    
    for title, desc in points8:
        p_t = tf8.add_paragraph()
        p_t.text = f"• {title}"
        p_t.font.size = Pt(16)
        p_t.font.bold = True
        p_t.font.color.rgb = COLOR_ACCENT
        p_t.space_after = Pt(2)
        
        p_d = tf8.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(13)
        p_d.font.color.rgb = COLOR_TEXT_MAIN
        p_d.space_after = Pt(14)

    # --- SLIDE 9: QR-Verifiable Land Reports ---
    slide9 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide9)
    add_header(slide9, "QR-Verifiable Land Reports & Anti-Tamper Verification", "REPORTING & INTEGRITY")
    
    box9 = slide9.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.333), Inches(5.0))
    tf9 = box9.text_frame
    tf9.word_wrap = True
    
    points9 = [
        ("Certified PDF Report Generation", "Generates official ReportLab PDF documents with parcel details, consistency matrix, and risk breakdown."),
        ("Embedded Anti-Tamper QR Code", "Includes an embedded QR code linking directly to public verification URL (/verify/BS-2026-XXXX)."),
        ("SHA-256 Cryptographic Hash", "Every report includes a unique SHA-256 digital signature stored in the database ledger."),
        ("Public Verification Landing Page", "Anyone scanning the QR code sees a verified summary confirming report authenticity and generation date.")
    ]
    
    for title, desc in points9:
        p_t = tf9.add_paragraph()
        p_t.text = f"• {title}"
        p_t.font.size = Pt(16)
        p_t.font.bold = True
        p_t.font.color.rgb = COLOR_GOLD
        p_t.space_after = Pt(2)
        
        p_d = tf9.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(13)
        p_d.font.color.rgb = COLOR_TEXT_MAIN
        p_d.space_after = Pt(14)

    # --- SLIDE 10: Revenue Officer & Admin Review Dashboard ---
    slide10 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide10)
    add_header(slide10, "Government Officer Review & Audit Dashboard", "ADMINISTRATIVE WORKFLOW")
    
    box10 = slide10.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.333), Inches(5.0))
    tf10 = box10.text_frame
    tf10.word_wrap = True
    
    points10 = [
        ("Executive Metrics & Analytics", "Monitors total parcels analyzed, high/medium risk counts, pending reviews, and district risk charts."),
        ("Flagged Case Review Queue", "Presents flagged cases for Circle Officer (CO) and LRDC inspection with side-by-side evidence."),
        ("Official Decision Submission", "Officers submit signed decisions (Require Field Verification, Citizen Clarification, Dismiss False Positive, Escalate)."),
        ("Immutable System Audit Trail", "Every officer review, search, and complaint submission is logged to an immutable audit ledger.")
    ]
    
    for title, desc in points10:
        p_t = tf10.add_paragraph()
        p_t.text = f"• {title}"
        p_t.font.size = Pt(16)
        p_t.font.bold = True
        p_t.font.color.rgb = COLOR_GREEN
        p_t.space_after = Pt(2)
        
        p_d = tf10.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(13)
        p_d.font.color.rgb = COLOR_TEXT_MAIN
        p_d.space_after = Pt(14)

    # --- SLIDE 11: Demo Case Study (Chas, Bokaro) ---
    slide11 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide11)
    add_header(slide11, "3-Minute End-to-End Demo Case Study (Chas, Bokaro)", "DEMONSTRATION STORY")
    
    steps = [
        ("Step 1: Search", "User searches District Bokaro → Anchal Chas → Khata #125 / Khesra #450/2."),
        ("Step 2: Land Identity", "System constructs Land Identity ID: JH-BOK-CHA-KURA-K125-K450-2."),
        ("Step 3: Risk Evaluation", "System flags MEDIUM RISK (Score 62/100) due to Owner Mismatch + 73-day Pending Mutation."),
        ("Step 4: AI & 3D GIS", "User asks AI Assistant why risk is medium, views 3D land plot, and consults AI Legal Advisor."),
        ("Step 5: Report & Verification", "Generates report BS-2026-1001 with QR code → QR scan returns VERIFIED status.")
    ]
    
    for idx, (s_title, s_desc) in enumerate(steps):
        top = Inches(1.8 + idx * 1.0)
        shape = slide11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), top, Inches(11.333), Inches(0.85))
        shape.fill.solid()
        shape.fill.fore_color.rgb = COLOR_CARD
        shape.line.color.rgb = COLOR_ACCENT
        
        tf = shape.text_frame
        tf.word_wrap = True
        p_t = tf.paragraphs[0]
        p_t.text = s_title + "  —  " + s_desc
        p_t.font.size = Pt(12)
        p_t.font.bold = True
        p_t.font.color.rgb = COLOR_TEXT_MAIN

    # --- SLIDE 12: Conclusion & Platform Impact ---
    slide12 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide12)
    add_header(slide12, "Summary & Prototype Achievements", "CONCLUSION")
    
    box12 = slide12.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(11.333), Inches(4.5))
    tf12 = box12.text_frame
    tf12.word_wrap = True
    
    p_c1 = tf12.paragraphs[0]
    p_c1.text = "✓ 10,000 Synthetic Land Parcels Seeded across 5 Jharkhand Districts"
    p_c1.font.size = Pt(18)
    p_c1.font.bold = True
    p_c1.font.color.rgb = COLOR_GREEN
    p_c1.space_after = Pt(12)
    
    p_c2 = tf12.add_paragraph()
    p_c2.text = "✓ Fully Deployed & Running Live on Localhost (Frontend: :5173, Backend: :8000)"
    p_c2.font.size = Pt(18)
    p_c2.font.bold = True
    p_c2.font.color.rgb = COLOR_ACCENT
    p_c2.space_after = Pt(12)
    
    p_c3 = tf12.add_paragraph()
    p_c3.text = "✓ Real-time Official Search, AI Legal Advisor, 3D GIS Viewer & Grievance PDF Generator"
    p_c3.font.size = Pt(18)
    p_c3.font.bold = True
    p_c3.font.color.rgb = COLOR_GOLD
    p_c3.space_after = Pt(20)
    
    p_c4 = tf12.add_paragraph()
    p_c4.text = "BhoomiShield: Verify the Land. Understand the Records. Detect the Risk."
    p_c4.font.size = Pt(22)
    p_c4.font.bold = True
    p_c4.font.color.rgb = COLOR_TEXT_MAIN

    output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "BhoomiShield_Presentation.pptx")
    prs.save(output_path)
    print(f"Presentation saved successfully to: {output_path}")

if __name__ == "__main__":
    create_bhoomishield_pptx()
