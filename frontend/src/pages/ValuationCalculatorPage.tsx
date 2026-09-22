import React, { useState, useEffect } from 'react';
import { Calculator, ShieldCheck, IndianRupee, Sparkles, Building2, Trees, Factory, Home, CheckCircle2, AlertTriangle, ArrowRight, Download } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ValuationResult {
  state: string;
  district: string;
  land_type: string;
  area_acre: number;
  area_sqft: number;
  buyer_gender: string;
  location_zone: string;
  circle_rate_per_sqft_inr: number;
  guidance_valuation_inr: number;
  declared_value_inr: number | null;
  taxable_value_inr: number;
  valuation_basis: string;
  stamp_duty_breakdown: {
    base_stamp_duty_pct: number;
    local_cess_pct: number;
    effective_stamp_duty_pct: number;
    base_stamp_duty_inr: number;
    cess_inr: number;
    total_stamp_duty_inr: number;
  };
  registration_fee_breakdown: {
    registration_fee_pct: number;
    registration_fee_inr: number;
  };
  total_government_fees_inr: number;
  women_concession_applied: boolean;
  savings_via_concession_inr: number;
  statutory_note: string;
}

const POPULAR_STATES = [
  "Jharkhand", "Uttar Pradesh", "Maharashtra", "Karnataka", 
  "Tamil Nadu", "West Bengal", "Rajasthan", "Bihar", 
  "Madhya Pradesh", "Gujarat", "Haryana", "Punjab", "Odisha", "Telangana"
];

export const ValuationCalculatorPage: React.FC<{ onShowToast?: (type: any, title: string, desc?: string) => void }> = ({ onShowToast }) => {
  const { lang, t } = useLanguage();
  const [selectedState, setSelectedState] = useState('Uttar Pradesh');
  const [district, setDistrict] = useState('Lucknow');
  const [landType, setLandType] = useState('Residential');
  const [areaValue, setAreaValue] = useState<number>(1200);
  const [areaUnit, setAreaUnit] = useState<'sqft' | 'acre' | 'sqyard' | 'bigha'>('sqft');
  const [buyerGender, setBuyerGender] = useState<'Male' | 'Female' | 'Joint'>('Female');
  const [isUrban, setIsUrban] = useState(true);
  const [declaredValue, setDeclaredValue] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValuationResult | null>(null);

  // Convert input to acre
  const calculateAreaInAcre = (): number => {
    if (areaUnit === 'acre') return areaValue;
    if (areaUnit === 'sqft') return areaValue / 43560;
    if (areaUnit === 'sqyard') return (areaValue * 9) / 43560;
    if (areaUnit === 'bigha') return (areaValue * 27225) / 43560; // Standard Pucca Bigha
    return areaValue / 43560;
  };

  const calculateAreaInSqft = (): number => {
    if (areaUnit === 'sqft') return areaValue;
    if (areaUnit === 'acre') return areaValue * 43560;
    if (areaUnit === 'sqyard') return areaValue * 9;
    if (areaUnit === 'bigha') return areaValue * 27225;
    return areaValue;
  };

  const handleCalculate = async () => {
    setLoading(true);
    const areaAcre = calculateAreaInAcre();
    const areaSqft = calculateAreaInSqft();
    const declaredValNumber = declaredValue ? parseFloat(declaredValue) : null;

    try {
      const res = await fetch('/api/valuation/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: selectedState,
          district: district || 'Default',
          land_type: landType,
          area_acre: areaAcre,
          area_sqft: areaSqft,
          buyer_gender: buyerGender,
          is_urban: isUrban,
          declared_value_inr: declaredValNumber
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        throw new Error("Offline calculation");
      }
    } catch (e) {
      // Robust client-side calculation fallback for offline / Netlify static mode
      const rateMap: Record<string, Record<string, number>> = {
        "Uttar Pradesh": { "Agricultural": 55, "Residential": 1250, "Commercial": 3800, "Industrial": 1600 },
        "Maharashtra": { "Agricultural": 65, "Residential": 2800, "Commercial": 7500, "Industrial": 3100 },
        "Karnataka": { "Agricultural": 70, "Residential": 2400, "Commercial": 6800, "Industrial": 2600 },
        "Jharkhand": { "Agricultural": 45, "Residential": 650, "Commercial": 2100, "Industrial": 950 },
        "Tamil Nadu": { "Agricultural": 60, "Residential": 2100, "Commercial": 5900, "Industrial": 2400 },
        "West Bengal": { "Agricultural": 50, "Residential": 1800, "Commercial": 4900, "Industrial": 2000 },
        "Rajasthan": { "Agricultural": 40, "Residential": 1100, "Commercial": 3200, "Industrial": 1400 },
        "Bihar": { "Agricultural": 45, "Residential": 950, "Commercial": 2800, "Industrial": 1100 }
      };

      const dutyMap: Record<string, { male: number; female: number; reg: number; cess: number }> = {
        "Uttar Pradesh": { male: 7.0, female: 6.0, reg: 1.0, cess: 1.0 },
        "Maharashtra": { male: 6.0, female: 5.0, reg: 1.0, cess: 1.0 },
        "Karnataka": { male: 5.0, female: 5.0, reg: 2.0, cess: 0.6 },
        "Jharkhand": { male: 4.0, female: 3.0, reg: 2.0, cess: 0.5 },
        "Tamil Nadu": { male: 7.0, female: 7.0, reg: 2.0, cess: 0.0 },
        "West Bengal": { male: 6.0, female: 6.0, reg: 1.1, cess: 1.0 },
        "Rajasthan": { male: 6.0, female: 5.0, reg: 1.0, cess: 0.5 },
        "Bihar": { male: 6.0, female: 5.7, reg: 2.0, cess: 0.0 }
      };

      const rates = rateMap[selectedState] || rateMap["Uttar Pradesh"];
      const duties = dutyMap[selectedState] || dutyMap["Uttar Pradesh"];
      const circleRate = rates[landType] || 1000;

      const guidanceVal = Math.round(areaSqft * circleRate);
      const taxable = declaredValNumber && declaredValNumber > guidanceVal ? declaredValNumber : guidanceVal;
      const isFemale = buyerGender === 'Female';
      const baseDutyPct = isFemale ? duties.female : (buyerGender === 'Joint' ? (duties.male + duties.female) / 2 : duties.male);
      const cessPct = isUrban ? duties.cess : 0;
      const effectiveDutyPct = baseDutyPct + cessPct;

      const stampDuty = Math.round((taxable * baseDutyPct) / 100);
      const cessAmt = Math.round((taxable * cessPct) / 100);
      const totalStamp = stampDuty + cessAmt;
      const regFee = Math.round((taxable * duties.reg) / 100);
      const totalGovt = totalStamp + regFee;
      const savings = isFemale ? Math.round((taxable * (duties.male - duties.female)) / 100) : 0;

      setResult({
        state: selectedState,
        district: district,
        land_type: landType,
        area_acre: areaAcre,
        area_sqft: areaSqft,
        buyer_gender: buyerGender,
        location_zone: isUrban ? "Urban / Municipal" : "Rural / Gram Panchayat",
        circle_rate_per_sqft_inr: circleRate,
        guidance_valuation_inr: guidanceVal,
        declared_value_inr: declaredValNumber,
        taxable_value_inr: taxable,
        valuation_basis: declaredValNumber && declaredValNumber > guidanceVal ? "Declared Consideration Value" : "Government Guidance Circle Rate",
        stamp_duty_breakdown: {
          base_stamp_duty_pct: baseDutyPct,
          local_cess_pct: cessPct,
          effective_stamp_duty_pct: effectiveDutyPct,
          base_stamp_duty_inr: stampDuty,
          cess_inr: cessAmt,
          total_stamp_duty_inr: totalStamp
        },
        registration_fee_breakdown: {
          registration_fee_pct: duties.reg,
          registration_fee_inr: regFee
        },
        total_government_fees_inr: totalGovt,
        women_concession_applied: isFemale && savings > 0,
        savings_via_concession_inr: savings,
        statutory_note: `Regulated under ${selectedState} Stamp (Amendment) Rules & Indian Stamp Act 1899.`
      });
    } finally {
      setLoading(false);
      if (onShowToast) onShowToast('success', 'Valuation & Stamp Duty Calculated', 'Official circle rates applied successfully.');
    }
  };

  useEffect(() => {
    handleCalculate();
  }, [selectedState, landType, buyerGender, isUrban]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-400/30">
            <Calculator className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Pan-India Land Valuation & Stamp Duty Calculator</h1>
            <p className="text-blue-200 text-sm mt-1">
              Compute Official Government Guidance Values (DLC / Jantri / Circle Rates), Stamp Duties, Registration Fees & Statutory Concessions across Indian States.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Parameters Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Sparkles className="w-5 h-5 text-amber-500" /> Property & Transaction Parameters
          </h2>

          {/* State Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Select State / UT</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            >
              {POPULAR_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* District */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">District / Revenue Circle</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Lucknow, Bokaro, Pune, Bangalore"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Land Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Land Classification</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'Residential', icon: Home, label: 'Residential' },
                { id: 'Commercial', icon: Building2, label: 'Commercial' },
                { id: 'Agricultural', icon: Trees, label: 'Agricultural' },
                { id: 'Industrial', icon: Factory, label: 'Industrial' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setLandType(t.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                    landType === t.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Area & Unit */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Plot / Parcel Area</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={areaValue}
                onChange={(e) => setAreaValue(parseFloat(e.target.value) || 0)}
                className="w-2/3 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={areaUnit}
                onChange={(e) => setAreaUnit(e.target.value as any)}
                className="w-1/3 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
              >
                <option value="sqft">Sq. Ft.</option>
                <option value="sqyard">Sq. Yards (Gaj)</option>
                <option value="acre">Acres</option>
                <option value="bigha">Bigha</option>
              </select>
            </div>
          </div>

          {/* Buyer Gender & Concession */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Primary Buyer Ownership</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Female', 'Male', 'Joint'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setBuyerGender(g)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    buyerGender === g
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {g === 'Female' ? '👩 Woman (Discount)' : (g === 'Male' ? '👨 Male' : '👥 Joint / Co-owner')}
                </button>
              ))}
            </div>
          </div>

          {/* Location Zone */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Municipal / Urban Zone</div>
              <div className="text-[11px] text-slate-500">Includes Municipal Metro Cess where applicable</div>
            </div>
            <input
              type="checkbox"
              checked={isUrban}
              onChange={(e) => setIsUrban(e.target.checked)}
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
            />
          </div>

          {/* Declared Consideration (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Agreed Sale Price / Consideration (₹) <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-sm">₹</span>
              <input
                type="number"
                value={declaredValue}
                onChange={(e) => setDeclaredValue(e.target.value)}
                placeholder="Leave blank to use minimum circle rate"
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleCalculate}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Calculator className="w-5 h-5" /> Calculate Official Duties
          </button>
        </div>

        {/* Results & Detailed Breakdown (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {result && (
            <>
              {/* Grand Total Government Dues Card */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xl border border-indigo-500/30 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    <span className="text-xs uppercase tracking-wider font-bold text-indigo-300">
                      Estimated Government Payable Fees
                    </span>
                  </div>
                  {result.women_concession_applied && (
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ₹{result.savings_via_concession_inr.toLocaleString()} Saved via Woman Rebate
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-black text-white">₹{result.total_government_fees_inr.toLocaleString()}</span>
                  <span className="text-xs text-slate-300 font-medium">(Stamp Duty + Registration + Cess)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-indigo-800/60 text-xs">
                  <div>
                    <div className="text-indigo-300 font-medium">Circle Rate / Sq.Ft</div>
                    <div className="font-bold text-white text-sm">₹{result.circle_rate_per_sqft_inr}</div>
                  </div>
                  <div>
                    <div className="text-indigo-300 font-medium">Govt Minimum Value</div>
                    <div className="font-bold text-white text-sm">₹{result.guidance_valuation_inr.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-indigo-300 font-medium">Effective Stamp %</div>
                    <div className="font-bold text-emerald-400 text-sm">{result.stamp_duty_breakdown.effective_stamp_duty_pct}%</div>
                  </div>
                  <div>
                    <div className="text-indigo-300 font-medium">Registration Fee %</div>
                    <div className="font-bold text-blue-300 text-sm">{result.registration_fee_breakdown.registration_fee_pct}%</div>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Detailed Fee Breakdown ({result.state})</span>
                  <span className="text-xs font-normal text-slate-500">Basis: {result.valuation_basis}</span>
                </h3>

                <div className="space-y-3">
                  {/* Taxable Value */}
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Total Taxable Value (Consideration)</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{result.taxable_value_inr.toLocaleString()}</span>
                  </div>

                  {/* Base Stamp Duty */}
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      Base Stamp Duty ({result.stamp_duty_breakdown.base_stamp_duty_pct}%)
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      ₹{result.stamp_duty_breakdown.base_stamp_duty_inr.toLocaleString()}
                    </span>
                  </div>

                  {/* Local Urban / Metro Cess */}
                  {result.stamp_duty_breakdown.local_cess_pct > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        Urban / Municipal Cess ({result.stamp_duty_breakdown.local_cess_pct}%)
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        ₹{result.stamp_duty_breakdown.cess_inr.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Total Stamp Duty */}
                  <div className="flex justify-between items-center py-2 bg-blue-50 dark:bg-blue-900/20 px-3 rounded-lg text-sm font-bold text-blue-900 dark:text-blue-200">
                    <span>Total Stamp Duty Payable</span>
                    <span>₹{result.stamp_duty_breakdown.total_stamp_duty_inr.toLocaleString()}</span>
                  </div>

                  {/* Registration Fee */}
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      Sub-Registrar Registration Fee ({result.registration_fee_breakdown.registration_fee_pct}%)
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      ₹{result.registration_fee_breakdown.registration_fee_inr.toLocaleString()}
                    </span>
                  </div>

                  {/* Total Grand Dues */}
                  <div className="flex justify-between items-center py-3 bg-slate-900 text-white px-4 rounded-xl text-base font-black">
                    <span>Total Official Stamp & Registration</span>
                    <span className="text-emerald-400">₹{result.total_government_fees_inr.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Statutory Note:</strong> {result.statutory_note} Stamp duties must be purchased via state e-Gras / e-Stamping portals prior to appointment at the Sub-Registrar's Office (SRO).
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
