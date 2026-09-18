import React from 'react';
import { PricingCalculationResult } from '../../types/pricing';
import { Calculator, AlertCircle } from 'lucide-react';

interface PricingCalculationProps {
  calculation: PricingCalculationResult;
}

export const PricingCalculation: React.FC<PricingCalculationProps> = ({ calculation }) => {
  return (
    <div className="bg-[#131A29] border border-slate-800 rounded-lg p-5 font-mono">
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-4">
        <Calculator className="w-5 h-5 text-blue-400" />
        <h3 className="text-sm font-bold text-slate-200 tracking-wider">
          CUSTOMER PRICE CALCULATION
        </h3>
      </div>

      <div className="space-y-3 text-xs">
        <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
          <span className="text-slate-400">MCX Market Quoted Price:</span>
          <span className="font-bold text-slate-200 text-sm">
            ₹{calculation.marketPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
          <span className="text-slate-400">Custom Duty ({calculation.customDutyPercentage}%):</span>
          <span className="font-semibold text-slate-300">
            +₹{calculation.customDutyAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
          <span className="text-slate-400">GST ({calculation.gstPercentage}%):</span>
          <span className="font-semibold text-slate-300">
            +₹{calculation.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex justify-between items-center py-3 bg-[#0D131F] border border-blue-900/60 px-4 rounded-lg mt-2">
          <div>
            <span className="text-blue-400 font-bold block text-sm">DERIVED CUSTOMER PRICE</span>
            <span className="text-[10px] text-slate-500 font-sans">Business Rule Calculated Rate</span>
          </div>
          <span className="text-xl font-extrabold text-blue-400">
            ₹{calculation.derivedCustomerPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-start space-x-2 bg-slate-900/60 border border-slate-800 p-3 rounded text-[11px] text-slate-400 font-sans">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p>
          Derived customer price is calculated using configurable business rules (GST + Custom Duty + Surcharges) and is <strong>not</strong> the exchange quoted price.
        </p>
      </div>
    </div>
  );
};
