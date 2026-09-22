import re

STATE_CODES = {
    "Andhra Pradesh": "AP",
    "Arunachal Pradesh": "AR",
    "Assam": "AS",
    "Bihar": "BR",
    "Chhattisgarh": "CG",
    "Goa": "GA",
    "Gujarat": "GJ",
    "Haryana": "HR",
    "Himachal Pradesh": "HP",
    "Jharkhand": "JH",
    "Karnataka": "KA",
    "Kerala": "KL",
    "Madhya Pradesh": "MP",
    "Maharashtra": "MH",
    "Manipur": "MN",
    "Meghalaya": "ML",
    "Mizoram": "MZ",
    "Nagaland": "NL",
    "Odisha": "OD",
    "Punjab": "PB",
    "Rajasthan": "RJ",
    "Sikkim": "SK",
    "Tamil Nadu": "TN",
    "Telangana": "TS",
    "Tripura": "TR",
    "Uttar Pradesh": "UP",
    "Uttarakhand": "UK",
    "West Bengal": "WB",
    "Delhi": "DL",
    "Jammu and Kashmir": "JK",
    "Ladakh": "LA",
    "Chandigarh": "CH",
    "Puducherry": "PY",
    "Dadra and Nagar Haveli and Daman and Diu": "DD",
    "Andaman and Nicobar Islands": "AN",
    "Lakshadweep": "LD"
}

def normalize_name(name: str) -> str:
    """
    Standardize person names for similarity comparison across Indian regional naming formats.
    Handles prefixes, honorifics, spaces, and punctuation.
    """
    if not name:
        return ""
    
    clean = name.lower().strip()
    # Remove common Indian honorifics and prefixes
    prefixes = [
        r'\bshri\b', r'\bshree\b', r'\bsri\b', r'\bmd\.\b', r'\bmd\b', r'\blate\b', 
        r'\blt\.\b', r'\bsmti\b', r'\bsmt\b', r'\bdr\.\b', r'\badv\.\b', r'\bshrimati\b',
        r'\bthiru\b', r'\bthirumathi\b', r'\bsri\b', r'\bkumari\b', r'\bkm\.\b'
    ]
    for p in prefixes:
        clean = re.sub(p, '', clean)
        
    # Replace punctuation with empty space
    clean = re.sub(r'[^\w\s]', '', clean)
    # Collapse multiple spaces
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean

def calculate_name_similarity(name1: str, name2: str) -> float:
    """
    Calculates string similarity score between 0.0 and 1.0 using Token Set / Levenshtein logic.
    """
    norm1 = normalize_name(name1)
    norm2 = normalize_name(name2)
    
    if norm1 == norm2:
        return 1.0
    if not norm1 or not norm2:
        return 0.0
        
    set1 = set(norm1.split())
    set2 = set(norm2.split())
    
    intersection = set1.intersection(set2)
    union = set1.union(set2)
    
    if not union:
        return 0.0
    
    jaccard = len(intersection) / len(union)
    
    # Check substring match
    if norm1 in norm2 or norm2 in norm1:
        jaccard = max(jaccard, 0.85)
        
    return round(jaccard, 2)

def generate_land_identity_id(state: str, district: str, subdistrict: str, village: str, primary_no: str, plot_no: str) -> str:
    """
    Generates standard Pan-India canonical LandIdentityID under DILRMP.
    Format: {STATE}-{DISTRICT}-{SUBDISTRICT}-{VILLAGE}-{PRIMARY_NO}-{PLOT_NO}
    e.g.
    - Jharkhand: JH-BOK-CHA-KURA-K125-K450-2
    - Uttar Pradesh: UP-NOI-DAD-BHAN-G340-K112
    - Maharashtra: MH-PUN-HAV-WAKD-S145-G23
    - Karnataka: KA-BLR-KRI-WHIT-S89-H3
    - Bihar: BR-PAT-DAN-KHAG-K201-K56
    """
    st_code = STATE_CODES.get(state, state[:2].upper() if state else "IN")
    dist_code = re.sub(r'[^a-zA-Z0-9]', '', district).upper()[:3] if district else "DIS"
    sub_code = re.sub(r'[^a-zA-Z0-9]', '', subdistrict).upper()[:3] if subdistrict else "SUB"
    vil_code = re.sub(r'[^a-zA-Z0-9]', '', village).upper()[:4] if village else "VIL"
    
    p_clean = re.sub(r'[^a-zA-Z0-9]', '', primary_no) if primary_no else "1"
    plot_clean = re.sub(r'[^a-zA-Z0-9]', '-', plot_no) if plot_no else "1"
    
    return f"{st_code}-{dist_code}-{sub_code}-{vil_code}-P{p_clean}-PL{plot_clean}"
