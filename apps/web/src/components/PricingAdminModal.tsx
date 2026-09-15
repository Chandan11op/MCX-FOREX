import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, CheckCircle2, Sliders, RefreshCw } from 'lucide-react';
import { CommodityCode, PricingRule } from '@mcx/shared-types';
import { COMMODITY_NAMES } from '@mcx/shared-utils';

interface PricingAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRuleUpdated: () => void;
}

const COMMODITIES: CommodityCode[] = ['GOLD', 'SILVER', 'COPPER', 'CRUDE_OIL', 'NATURAL_GAS'];

export const PricingAdminModal: React.FC<PricingAdminModalProps> = ({ isOpen, onClose, onRuleUpdated }) => {
  const [rules, setRules] = useState<Record<CommodityCode, Partial<PricingRule>>>({} as any);
  const [selectedCommodity, setSelectedCommodity] = useState<CommodityCode>('GOLD');
  const [loading, setLoading] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchRules = async () => {
      try {
        const res = await fetch('/api/admin/pricing-rules');
        if (res.ok) {
          const list: PricingRule[] = await res.json();
          const map: Record<CommodityCode, Partial<PricingRule>> = {} as any;
          for (const r of list) {
            map[r.commodity] = r;
          }
          setRules(map);
        }
      } catch (err) {
        console.error('Failed to load rules:', err);
      }
    };

    fetchRules();
  }, [isOpen]);

  if (!isOpen) return null;

  const currentRule = rules[selectedCommodity] || {
    commodity: selectedCommodity,
    gstRate: 3.0,
    customDutyRate: 6.0,
    otherCharges: 0,
    formulaVersion: 'v1.1-custom',
  };

  const handleFieldChange = (field: keyof PricingRule, value: any) => {
    setRules((prev) => ({
      ...prev,
      [selectedCommodity]: {
        ...prev[selectedCommodity],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setSavedSuccess(false);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/pricing-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity: selectedCommodity,
          gstRate: currentRule.gstRate,
          customDutyRate: currentRule.customDutyRate,
          otherCharges: currentRule.otherCharges,
          formulaVersion: currentRule.formulaVersion || 'v1.1-admin',
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update pricing rule');
      }

      setSavedSuccess(true);
      onRuleUpdated();
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-dark-700 flex items-center justify-between bg-dark-950">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Admin Pricing Engine & Duty Configuration
              </h3>
              <p className="text-xs text-slate-400">
                Configure dynamic 15-day custom duty, GST, and premium/charges
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-400 hover:text-white border border-dark-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Commodity Tabs */}
        <div className="px-4 py-2.5 bg-dark-900 border-b border-dark-800 flex items-center space-x-1 overflow-x-auto">
          {COMMODITIES.map((code) => (
            <button
              key={code}
              onClick={() => setSelectedCommodity(code)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                selectedCommodity === code
                  ? 'bg-amber-500 text-dark-950 font-bold shadow'
                  : 'bg-dark-800 text-slate-400 hover:bg-dark-700 hover:text-white'
              }`}
            >
              {COMMODITY_NAMES[code]?.name || code}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              Custom duty rates on bullion/metals are revised periodically (every 15 days by CBIC). Changes here calculate the customer landing price in real-time while strictly keeping raw MCX exchange prices unchanged.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Custom Duty Rate */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Custom Duty Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={currentRule.customDutyRate ?? 6.0}
                onChange={(e) => handleFieldChange('customDutyRate', parseFloat(e.target.value) || 0)}
                className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* GST Rate */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                GST Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={currentRule.gstRate ?? 3.0}
                onChange={(e) => handleFieldChange('gstRate', parseFloat(e.target.value) || 0)}
                className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Other Charges */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Other Charges / Premium / Logistics (₹)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={currentRule.otherCharges ?? 0}
                onChange={(e) => handleFieldChange('otherCharges', parseFloat(e.target.value) || 0)}
                className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Formula Version */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Formula / Rule Revision Identifier
              </label>
              <input
                type="text"
                value={currentRule.formulaVersion || 'v1.1-admin'}
                onChange={(e) => handleFieldChange('formulaVersion', e.target.value)}
                className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Feedback messages */}
          {savedSuccess && (
            <div className="flex items-center text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded-lg p-2.5">
              <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0" />
              Pricing rule updated successfully! Customer landing prices recalculated.
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center text-xs text-rose-400 bg-rose-950/60 border border-rose-800/60 rounded-lg p-2.5">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {errorMessage}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-dark-950 border-t border-dark-800 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold transition flex items-center gap-1.5 shadow"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save & Apply Rule
          </button>
        </div>
      </div>
    </div>
  );
};
