"""
BhoomiShield - Spatial Encroachment & Buffer Zone Scanner Engine
Evaluates parcel centroid against government eco-sensitive zones,
forest conservation borders, waterbody high-flood buffers, and infrastructure ROWs.
"""

from typing import Dict, Any, List
import json
import math

# Statutory Minimum Buffer Zones in India (in meters)
STATUTORY_BUFFERS = {
    "WATERBODY": {
        "zone_name": "Waterbody / River / Jalasay Prohibited Buffer",
        "statutory_buffer_meters": 30.0,
        "law_reference": "National Green Tribunal (NGT) Directives & State Revenue Codes (§132 UP Revenue Code / Sec 21 CNT Act)",
        "restriction": "Strictly Non-Buildable / Non-Alienatable Government Catchment Area"
    },
    "FOREST_RESERVE": {
        "zone_name": "Reserved / Protected Forest Eco-Sensitive Perimeter",
        "statutory_buffer_meters": 100.0,
        "law_reference": "Forest (Conservation) Act 1980 & Wildlife Protection Act 1972",
        "restriction": "Requires Prior Central MoEFCC Clearance; Non-Forest Activity Prohibited"
    },
    "HIGHWAY_ROW": {
        "zone_name": "National / State Highway Right of Way (ROW)",
        "statutory_buffer_meters": 45.0,
        "law_reference": "Control of National Highways (Land and Traffic) Act 2002",
        "restriction": "Building Line Restriction; No Permanent RCC Construction"
    },
    "POWER_GRID": {
        "zone_name": "High-Tension Transmission Corridor (132kV / 400kV)",
        "statutory_buffer_meters": 27.0,
        "law_reference": "Indian Electricity Act 2003 & Central Electricity Authority Regulations",
        "restriction": "Vertical & Horizontal Clearance Mandatory; Danger Zone"
    }
}

def scan_parcel_encroachment_buffers(parcel_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes distances to simulated eco-sensitive, hydrological, and infrastructure boundaries.
    """
    land_id = parcel_data.get("land_identity_id", "JH-BOK-CHA-KURA-K125-K450-2")
    state = parcel_data.get("state", "Jharkhand")
    land_type = parcel_data.get("land_type", "Agricultural")
    polygon_json = parcel_data.get("polygon_json")

    # Generate deterministic distance metrics based on land_identity_id hash
    hash_val = int(str(hash(land_id))[-6:])
    
    # Distance in meters
    dist_waterbody = round(20.0 + (hash_val % 450), 1)
    dist_forest = round(60.0 + ((hash_val // 10) % 800), 1)
    dist_highway = round(35.0 + ((hash_val // 100) % 600), 1)
    dist_powergrid = round(22.0 + ((hash_val // 1000) % 350), 1)

    # If land_type is explicitly Jalasay or Jungle, force critical buffer breach
    if "jalasay" in land_type.lower() or "nadi" in land_type.lower() or "water" in land_type.lower():
        dist_waterbody = 0.0
    if "jungle" in land_type.lower() or "forest" in land_type.lower():
        dist_forest = 0.0

    buffer_evaluations = []
    has_critical_violation = False
    has_warning = False

    # 1. Waterbody Check
    wb_rule = STATUTORY_BUFFERS["WATERBODY"]
    wb_status = "SAFE"
    if dist_waterbody < wb_rule["statutory_buffer_meters"]:
        wb_status = "CRITICAL_VIOLATION" if dist_waterbody == 0 else "ENCROACHMENT_BREACH"
        has_critical_violation = True
    elif dist_waterbody < (wb_rule["statutory_buffer_meters"] + 20):
        wb_status = "BUFFER_WARNING"
        has_warning = True

    buffer_evaluations.append({
        "zone_type": "WATERBODY",
        "zone_name": wb_rule["zone_name"],
        "statutory_limit_m": wb_rule["statutory_buffer_meters"],
        "measured_distance_m": dist_waterbody,
        "status": wb_status,
        "color": "red" if "CRITICAL" in wb_status or "BREACH" in wb_status else ("amber" if "WARNING" in wb_status else "emerald"),
        "law_reference": wb_rule["law_reference"],
        "restriction": wb_rule["restriction"]
    })

    # 2. Forest Reserve Check
    fr_rule = STATUTORY_BUFFERS["FOREST_RESERVE"]
    fr_status = "SAFE"
    if dist_forest < fr_rule["statutory_buffer_meters"]:
        fr_status = "CRITICAL_VIOLATION" if dist_forest == 0 else "FOREST_BUFFER_BREACH"
        has_critical_violation = True
    elif dist_forest < (fr_rule["statutory_buffer_meters"] + 50):
        fr_status = "BUFFER_WARNING"
        has_warning = True

    buffer_evaluations.append({
        "zone_type": "FOREST_RESERVE",
        "zone_name": fr_rule["zone_name"],
        "statutory_limit_m": fr_rule["statutory_buffer_meters"],
        "measured_distance_m": dist_forest,
        "status": fr_status,
        "color": "red" if "CRITICAL" in fr_status or "BREACH" in fr_status else ("amber" if "WARNING" in fr_status else "emerald"),
        "law_reference": fr_rule["law_reference"],
        "restriction": fr_rule["restriction"]
    })

    # 3. Highway Right-of-Way Check
    hw_rule = STATUTORY_BUFFERS["HIGHWAY_ROW"]
    hw_status = "SAFE"
    if dist_highway < hw_rule["statutory_buffer_meters"]:
        hw_status = "HIGHWAY_ROW_OVERLAP"
        has_warning = True
    elif dist_highway < (hw_rule["statutory_buffer_meters"] + 30):
        hw_status = "BUFFER_WARNING"
        has_warning = True

    buffer_evaluations.append({
        "zone_type": "HIGHWAY_ROW",
        "zone_name": hw_rule["zone_name"],
        "statutory_limit_m": hw_rule["statutory_buffer_meters"],
        "measured_distance_m": dist_highway,
        "status": hw_status,
        "color": "amber" if "WARNING" in hw_status or "OVERLAP" in hw_status else "emerald",
        "law_reference": hw_rule["law_reference"],
        "restriction": hw_rule["restriction"]
    })

    # 4. Power Grid Corridor Check
    pg_rule = STATUTORY_BUFFERS["POWER_GRID"]
    pg_status = "SAFE"
    if dist_powergrid < pg_rule["statutory_buffer_meters"]:
        pg_status = "TRANSMISSION_CLEARANCE_VIOLATION"
        has_warning = True

    buffer_evaluations.append({
        "zone_type": "POWER_GRID",
        "zone_name": pg_rule["zone_name"],
        "statutory_limit_m": pg_rule["statutory_buffer_meters"],
        "measured_distance_m": dist_powergrid,
        "status": pg_status,
        "color": "amber" if "VIOLATION" in pg_status else "emerald",
        "law_reference": pg_rule["law_reference"],
        "restriction": pg_rule["restriction"]
    })

    overall_encroachment_verdict = "CRITICAL_ENCROACHMENT_RISK" if has_critical_violation else ("MODERATE_BUFFER_RESTRICTION" if has_warning else "CLEAR_NO_ENCROACHMENT")
    safety_score = 96
    if has_critical_violation:
        safety_score -= 55
    if has_warning:
        safety_score -= 20

    safety_score = max(10, min(100, safety_score))

    return {
        "land_identity_id": land_id,
        "state": state,
        "land_type": land_type,
        "safety_score": safety_score,
        "verdict": overall_encroachment_verdict,
        "has_critical_violation": has_critical_violation,
        "has_warning": has_warning,
        "buffer_evaluations": buffer_evaluations,
        "recommendation": "DO NOT PURCHASE: Parcel overlaps statutory prohibited waterbody or forest reserve." if has_critical_violation else ("Consult local Town Planning authority for setback clearances." if has_warning else "Parcel conforms with all statutory eco-sensitive buffer distances.")
    }
