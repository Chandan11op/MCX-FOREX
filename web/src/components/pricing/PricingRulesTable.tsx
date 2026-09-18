import React from 'react';
import { PricingRule } from '../../types/pricing';
import { Plus, Edit2, Power } from 'lucide-react';

interface PricingRulesTableProps {
  rules: PricingRule[];
  onAddRule?: () => void;
}

export const PricingRulesTable: React.FC<PricingRulesTableProps> = ({ rules, onAddRule }) => {
  return (
    <div className="bg-[#131A29] border border-slate-800 rounded-lg overflow-hidden font-mono">
      <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center bg-[#0D131F]">
        <div>
          <h2 className="text-sm font-bold text-slate-200 tracking-wider">
            PRICING RULES & TAX CONFIGURATIONS
          </h2>
          <span className="text-[11px] text-slate-500 font-sans">
            Configure GST and Custom Duty multipliers per commodity
          </span>
        </div>
        <button
          onClick={onAddRule}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded flex items-center space-x-1.5 transition-colors font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>ADD PRICING RULE</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#090C12] text-slate-400 border-b border-slate-800 text-[11px]">
              <th className="py-2.5 px-4 font-semibold">COMMODITY</th>
              <th className="py-2.5 px-4 font-semibold text-right">GST %</th>
              <th className="py-2.5 px-4 font-semibold text-right">CUSTOM DUTY %</th>
              <th className="py-2.5 px-4 font-semibold">EFFECTIVE FROM</th>
              <th className="py-2.5 px-4 font-semibold">EFFECTIVE TO</th>
              <th className="py-2.5 px-4 font-semibold text-center">STATUS</th>
              <th className="py-2.5 px-4 font-semibold text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {rules.map((rule) => (
              <tr key={rule.id} className="hover:bg-[#1A2336] transition-colors">
                <td className="py-3 px-4 font-bold text-slate-100">{rule.commodityName} ({rule.commoditySymbol})</td>
                <td className="py-3 px-4 text-right font-semibold text-slate-200">{rule.gstPercentage}%</td>
                <td className="py-3 px-4 text-right font-semibold text-slate-200">{rule.customDutyPercentage}%</td>
                <td className="py-3 px-4 text-slate-400">{rule.effectiveFrom}</td>
                <td className="py-3 px-4 text-slate-400">{rule.effectiveTo}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    rule.enabled ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}>
                    {rule.enabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end items-center space-x-2">
                    <button className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-blue-400" title="Edit Rule">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-amber-400" title="Toggle Status">
                      <Power className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
