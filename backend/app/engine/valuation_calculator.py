"""
BhoomiShield - Land Valuation & Stamp Duty Calculator Engine
Computes Government Circle Rates (Guidance Value / Jantri / DLC Rate),
Stamp Duty, Registration Fees, and Gender/Rural Concessions across Indian States.
"""

from typing import Dict, Any, Optional

# State-wise Stamp Duty and Registration Fee Baseline Schedules (2025-2026)
STATE_STAMP_DUTY_RULES = {
    "Jharkhand": {
        "male_duty_pct": 4.0,
        "female_duty_pct": 3.0,
        "joint_duty_pct": 3.5,
        "registration_fee_pct": 2.0,
        "urban_cess_pct": 0.5,
        "rural_cess_pct": 0.0,
        "base_circle_rate_sqft": {
            "Agricultural": 45,
            "Residential": 650,
            "Commercial": 2100,
            "Industrial": 950
        }
    },
    "Uttar Pradesh": {
        "male_duty_pct": 7.0,
        "female_duty_pct": 6.0, # 1% rebate for women up to Rs 10 Lakh
        "joint_duty_pct": 6.5,
        "registration_fee_pct": 1.0,
        "urban_cess_pct": 1.0,
        "rural_cess_pct": 0.0,
        "base_circle_rate_sqft": {
            "Agricultural": 55,
            "Residential": 1250,
            "Commercial": 3800,
            "Industrial": 1600
        }
    },
    "Maharashtra": {
        "male_duty_pct": 6.0, # (5% + 1% Metro Cess in urban areas)
        "female_duty_pct": 5.0, # 1% concession for female buyer
        "joint_duty_pct": 5.5,
        "registration_fee_pct": 1.0, # Capped at Rs 30,000 for residential
        "urban_cess_pct": 1.0,
        "rural_cess_pct": 0.0,
        "base_circle_rate_sqft": {
            "Agricultural": 65,
            "Residential": 2800,
            "Commercial": 7500,
            "Industrial": 3100
        }
    },
    "Karnataka": {
        "male_duty_pct": 5.0,
        "female_duty_pct": 5.0,
        "joint_duty_pct": 5.0,
        "registration_fee_pct": 2.0,
        "urban_cess_pct": 0.6,
        "rural_cess_pct": 0.0,
        "base_circle_rate_sqft": {
            "Agricultural": 70,
            "Residential": 2400,
            "Commercial": 6800,
            "Industrial": 2600
        }
    },
    "Tamil Nadu": {
        "male_duty_pct": 7.0,
        "female_duty_pct": 7.0,
        "joint_duty_pct": 7.0,
        "registration_fee_pct": 2.0,
        "urban_cess_pct": 0.0,
        "rural_cess_pct": 0.0,
        "base_circle_rate_sqft": {
            "Agricultural": 60,
            "Residential": 2100,
            "Commercial": 5900,
            "Industrial": 2400
        }
    },
    "West Bengal": {
        "male_duty_pct": 6.0,
        "female_duty_pct": 6.0,
        "joint_duty_pct": 6.0,
        "registration_fee_pct": 1.1,
        "urban_cess_pct": 1.0,
        "rural_cess_pct": 0.0,
        "base_circle_rate_sqft": {
            "Agricultural": 50,
            "Residential": 1800,
            "Commercial": 4900,
            "Industrial": 2000
        }
    },
    "Rajasthan": {
        "male_duty_pct": 6.0,
        "female_duty_pct": 5.0, # 1% discount for women
        "joint_duty_pct": 5.5,
        "registration_fee_pct": 1.0,
        "urban_cess_pct": 0.5,
        "rural_cess_pct": 0.0,
        "base_circle_rate_sqft": {
            "Agricultural": 40,
            "Residential": 1100,
            "Commercial": 3200,
            "Industrial": 1400
        }
    },
    "Bihar": {
        "male_duty_pct": 6.0,
        "female_duty_pct": 5.7,
        "joint_duty_pct": 5.85,
        "registration_fee_pct": 2.0,
        "urban_cess_pct": 0.0,
        "rural_cess_pct": 0.0,
        "base_circle_rate_sqft": {
            "Agricultural": 45,
            "Residential": 950,
            "Commercial": 2800,
            "Industrial": 1100
        }
    }
}

# Default fallback rule for other states
DEFAULT_RULE = {
    "male_duty_pct": 5.0,
    "female_duty_pct": 4.5,
    "joint_duty_pct": 4.75,
    "registration_fee_pct": 1.5,
    "urban_cess_pct": 0.5,
    "rural_cess_pct": 0.0,
    "base_circle_rate_sqft": {
        "Agricultural": 50,
        "Residential": 1200,
        "Commercial": 3500,
        "Industrial": 1500
    }
}

def calculate_land_valuation_and_duties(
    state: str,
    district: str,
    land_type: str,
    area_acre: float,
    area_sqft: Optional[float] = None,
    buyer_gender: str = "Male", # Male, Female, Joint
    is_urban: bool = True,
    declared_value_inr: Optional[float] = None
) -> Dict[str, Any]:
    """
    Computes government circle valuation, taxable consideration, stamp duty,
    registration charges, applicable cess, and gender concessions.
    """
    rule = STATE_STAMP_DUTY_RULES.get(state, DEFAULT_RULE)
    
    # 1 Acre = 43,560 Sq Ft
    total_sqft = area_sqft if area_sqft and area_sqft > 0 else area_acre * 43560.0
    
    # Base circle rate
    rates_dict = rule.get("base_circle_rate_sqft", DEFAULT_RULE["base_circle_rate_sqft"])
    circle_rate_per_sqft = rates_dict.get(land_type, rates_dict.get("Agricultural", 50))
    
    # Government Minimum Valuation (Circle Rate Value)
    guidance_valuation_inr = round(total_sqft * circle_rate_per_sqft, 2)
    
    # Taxable Consideration = Max(Declared Value, Guidance Valuation)
    if declared_value_inr and declared_value_inr > guidance_valuation_inr:
        taxable_value = declared_value_inr
        valuation_basis = "Market Consideration (Higher than Circle Rate)"
    else:
        taxable_value = guidance_valuation_inr
        valuation_basis = "Government Minimum Circle Rate (Guidance Value)"

    # Determine Stamp Duty %
    gender_lower = buyer_gender.lower()
    if "female" in gender_lower or "woman" in gender_lower:
        base_stamp_pct = rule["female_duty_pct"]
        women_concession_applied = True
    elif "joint" in gender_lower or "co" in gender_lower:
        base_stamp_pct = rule["joint_duty_pct"]
        women_concession_applied = False
    else:
        base_stamp_pct = rule["male_duty_pct"]
        women_concession_applied = False
        
    cess_pct = rule["urban_cess_pct"] if is_urban else rule["rural_cess_pct"]
    effective_stamp_pct = base_stamp_pct + cess_pct
    
    reg_fee_pct = rule["registration_fee_pct"]
    
    # Calculations
    stamp_duty_amount = round((taxable_value * base_stamp_pct) / 100.0, 2)
    cess_amount = round((taxable_value * cess_pct) / 100.0, 2)
    total_stamp_duty = round(stamp_duty_amount + cess_amount, 2)
    
    registration_fee_amount = round((taxable_value * reg_fee_pct) / 100.0, 2)
    
    # Maharashtra Cap Example
    if state == "Maharashtra" and land_type == "Residential" and registration_fee_amount > 30000:
        registration_fee_amount = 30000.0
        
    total_government_fees = round(total_stamp_duty + registration_fee_amount, 2)
    
    # Savings from women concession if applicable
    savings_inr = 0.0
    if women_concession_applied and rule["male_duty_pct"] > rule["female_duty_pct"]:
        std_male_duty = (taxable_value * (rule["male_duty_pct"] + cess_pct)) / 100.0
        savings_inr = round(std_male_duty - total_stamp_duty, 2)

    return {
        "state": state,
        "district": district,
        "land_type": land_type,
        "area_acre": round(area_acre, 4),
        "area_sqft": round(total_sqft, 2),
        "buyer_gender": buyer_gender,
        "location_zone": "Urban / Municipal" if is_urban else "Rural / Gram Panchayat",
        "circle_rate_per_sqft_inr": circle_rate_per_sqft,
        "guidance_valuation_inr": guidance_valuation_inr,
        "declared_value_inr": declared_value_inr,
        "taxable_value_inr": taxable_value,
        "valuation_basis": valuation_basis,
        "stamp_duty_breakdown": {
            "base_stamp_duty_pct": base_stamp_pct,
            "local_cess_pct": cess_pct,
            "effective_stamp_duty_pct": effective_stamp_pct,
            "base_stamp_duty_inr": stamp_duty_amount,
            "cess_inr": cess_amount,
            "total_stamp_duty_inr": total_stamp_duty
        },
        "registration_fee_breakdown": {
            "registration_fee_pct": reg_fee_pct,
            "registration_fee_inr": registration_fee_amount
        },
        "total_government_fees_inr": total_government_fees,
        "women_concession_applied": women_concession_applied,
        "savings_via_concession_inr": savings_inr,
        "statutory_note": f"Regulated under {state} Stamp (Amendment) Rules & Indian Stamp Act 1899."
    }
