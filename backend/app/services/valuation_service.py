from typing import Dict, Any

STATE_STAMP_DUTY_RATES = {
    "Jharkhand": {"stamp_duty_pct": 4.0, "reg_fee_pct": 3.0, "circle_rate_sqft": 1850},
    "Uttar Pradesh": {"stamp_duty_pct": 7.0, "reg_fee_pct": 1.0, "circle_rate_sqft": 3200},
    "Maharashtra": {"stamp_duty_pct": 6.0, "reg_fee_pct": 1.0, "circle_rate_sqft": 4500},
    "Karnataka": {"stamp_duty_pct": 5.0, "reg_fee_pct": 1.0, "circle_rate_sqft": 3800},
    "Bihar": {"stamp_duty_pct": 6.0, "reg_fee_pct": 2.0, "circle_rate_sqft": 2100},
    "Delhi": {"stamp_duty_pct": 6.0, "reg_fee_pct": 1.0, "circle_rate_sqft": 6200},
}

def calculate_stamp_duty_and_valuation(state: str, area_sqft: float, property_type: str = "Residential") -> Dict[str, Any]:
    """
    Calculates State Circle Rate Valuation, Stamp Duty %, Registration Fee %, and Total Transfer Cost.
    """
    state_rates = STATE_STAMP_DUTY_RATES.get(state, STATE_STAMP_DUTY_RATES["Jharkhand"])
    
    base_circle_rate = state_rates["circle_rate_sqft"]
    if property_type == "Commercial":
        base_circle_rate *= 1.4
    elif property_type == "Industrial":
        base_circle_rate *= 1.25
    elif property_type == "Agricultural":
        base_circle_rate *= 0.65

    evaluated_market_value = round(area_sqft * base_circle_rate, 2)
    
    stamp_duty_amount = round(evaluated_market_value * (state_rates["stamp_duty_pct"] / 100.0), 2)
    registration_fee_amount = round(evaluated_market_value * (state_rates["reg_fee_pct"] / 100.0), 2)
    total_conveyance_cost = round(evaluated_market_value + stamp_duty_amount + registration_fee_amount, 2)

    return {
        "state": state,
        "area_sqft": area_sqft,
        "property_type": property_type,
        "circle_rate_per_sqft": base_circle_rate,
        "evaluated_market_value_inr": evaluated_market_value,
        "stamp_duty_pct": state_rates["stamp_duty_pct"],
        "stamp_duty_inr": stamp_duty_amount,
        "registration_fee_pct": state_rates["reg_fee_pct"],
        "registration_fee_inr": registration_fee_amount,
        "total_conveyance_cost_inr": total_conveyance_cost
    }
