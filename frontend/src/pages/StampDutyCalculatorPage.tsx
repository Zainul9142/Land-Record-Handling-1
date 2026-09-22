import React, { useState, useEffect } from 'react';
import { Calculator, IndianRupee, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';

export const StampDutyCalculatorPage: React.FC = () => {
  const [state, setState] = useState<string>('Jharkhand');
  const [areaSqft, setAreaSqft] = useState<number>(21780); // 0.5 acre
  const [propertyType, setPropertyType] = useState<string>('Residential');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    calculateValuation();
  }, [state, areaSqft, propertyType]);

  const calculateValuation = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/valuation/calculate?state=${encodeURIComponent(state)}&area_sqft=${areaSqft}&property_type=${encodeURIComponent(propertyType)}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Valuation calculation failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 transition-colors duration-300">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
          <Calculator className="w-4 h-4 text-indigo-500 animate-bounce" />
          <span>DILRMP Pan-India Property Circle Rate & Conveyance Calculator</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Stamp Duty & Circle Rate Valuation
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Calculate state-wise property market value, stamp duty percentage, registration fees, and legal transfer costs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Form Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 text-xs transition-colors">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Valuation Parameters</h3>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Indian State / Union Territory</label>
            <select
              value={state}
              onChange={e => setState(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 transition-all"
            >
              <option value="Jharkhand">Jharkhand (Circle Rate: ₹1,850/sq.ft)</option>
              <option value="Uttar Pradesh">Uttar Pradesh (Circle Rate: ₹3,200/sq.ft)</option>
              <option value="Maharashtra">Maharashtra (Circle Rate: ₹4,500/sq.ft)</option>
              <option value="Karnataka">Karnataka (Circle Rate: ₹3,800/sq.ft)</option>
              <option value="Bihar">Bihar (Circle Rate: ₹2,100/sq.ft)</option>
              <option value="Delhi">Delhi (Circle Rate: ₹6,200/sq.ft)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Property Area (Square Feet)</label>
            <input
              type="number"
              value={areaSqft}
              onChange={e => setAreaSqft(Number(e.target.value))}
              step="100"
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 transition-all"
            />
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              Equivalent: {(areaSqft / 43560).toFixed(2)} Acres ({areaSqft} sq.ft)
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Property Category</label>
            <select
              value={propertyType}
              onChange={e => setPropertyType(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 transition-all"
            >
              <option value="Residential">Residential Plot / Housing</option>
              <option value="Commercial">Commercial Real Estate (+40% Premium)</option>
              <option value="Industrial">Industrial Zone (+25% Premium)</option>
              <option value="Agricultural">Agricultural Land (-35% Subsidy)</option>
            </select>
          </div>
        </div>

        {/* Results Calculation Card (Adapted for Light and Dark) */}
        {result && (
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 text-xs transition-colors animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="font-bold text-sky-600 dark:text-sky-400 text-sm flex items-center space-x-2">
                <IndianRupee className="w-5 h-5 text-emerald-500" />
                <span>Estimated Conveyance Breakdown</span>
              </div>
              <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-300 dark:border-slate-700">
                {result.state}
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl flex justify-between items-center border border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-600 dark:text-slate-400 font-medium">State Base Circle Rate:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">₹{result.circle_rate_per_sqft?.toLocaleString()} / sq.ft</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl flex justify-between items-center border border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Evaluated Market Valuation:</span>
                <span className="font-bold text-sky-600 dark:text-sky-400 font-mono text-sm">₹{result.evaluated_market_value_inr?.toLocaleString()}</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl flex justify-between items-center border border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Stamp Duty ({result.stamp_duty_pct}%):</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">₹{result.stamp_duty_inr?.toLocaleString()}</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl flex justify-between items-center border border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Registration Fee ({result.registration_fee_pct}%):</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">₹{result.registration_fee_inr?.toLocaleString()}</span>
              </div>

              <div className="p-4 bg-emerald-500/10 dark:bg-emerald-950/80 border border-emerald-500/30 dark:border-emerald-800 rounded-2xl flex justify-between items-center shadow-md">
                <span className="font-bold text-emerald-700 dark:text-emerald-300">Total Conveyance Transfer Cost:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono text-lg">₹{result.total_conveyance_cost_inr?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
