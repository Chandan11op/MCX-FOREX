import React, { useState, useEffect } from 'react';
import { PricingRulesTable } from '../components/pricing/PricingRulesTable';
import { PricingRule } from '../types/pricing';
import { pricingApi } from '../services/pricingApi';
import { Calculator } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    pricingApi.getPricingRules().then(setRules);
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800/80 pb-3">
        <h2 className="text-lg font-bold font-mono text-slate-100 tracking-tight">
          PRICING CALCULATION ENGINE & BUSINESS RULES
        </h2>
        <p className="text-xs text-slate-400">
          Configure taxation parameters, GST percentages, custom duties, and business markups for derived customer prices
        </p>
      </div>

      <PricingRulesTable rules={rules} onAddRule={() => setShowModal(true)} />

      {/* Pricing Rule Description */}
      <div className="bg-[#131A29] border border-slate-800 rounded-lg p-5 font-mono text-xs text-slate-400 space-y-2">
        <div className="flex items-center space-x-2 text-slate-200 font-bold mb-2">
          <Calculator className="w-4 h-4 text-blue-400" />
          <span>DERIVED PRICE FORMULA SPECIFICATION</span>
        </div>
        <p>
          Derived Customer Price = [ Exchange Quoted Market Price × (1 + Custom Duty %) ] × (1 + GST %)
        </p>
        <p className="text-[11px] text-slate-500 font-sans">
          Note: Exchange quoted prices from MCX are never modified in storage. All customer-facing prices are calculated dynamically using active business rules.
        </p>
      </div>

      {/* Add Rule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#131A29] border border-slate-800 rounded-lg p-6 max-w-md w-full font-mono text-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-2">
              ADD PRICING RULE
            </h3>
            <div>
              <label className="text-slate-400 block mb-1">Commodity Symbol</label>
              <input type="text" placeholder="e.g. GOLD" className="w-full bg-[#0D131F] border border-slate-800 rounded p-2 text-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">GST %</label>
                <input type="number" step="0.1" defaultValue={18.0} className="w-full bg-[#0D131F] border border-slate-800 rounded p-2 text-slate-200" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Custom Duty %</label>
                <input type="number" step="0.1" defaultValue={6.0} className="w-full bg-[#0D131F] border border-slate-800 rounded p-2 text-slate-200" />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setShowModal(false)} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded text-slate-300">CANCEL</button>
              <button onClick={() => setShowModal(false)} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded font-bold text-white">SAVE RULE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
