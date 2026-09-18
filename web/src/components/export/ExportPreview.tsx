import React from 'react';
import { HistoricalDataPoint } from '../../types/market';
import { PricingCalculationResult } from '../../types/pricing';

interface ExportPreviewProps {
  data: HistoricalDataPoint[];
  pricing: PricingCalculationResult;
  status: 'READY' | 'GENERATING' | 'COMPLETED' | 'FAILED';
  commoditySymbol: string;
}

export const ExportPreview: React.FC<ExportPreviewProps> = ({ data, pricing, status, commoditySymbol }) => {
  return (
    <div className="bg-[#131A29] border border-slate-800 rounded-lg overflow-hidden font-mono text-xs">
      <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center bg-[#0D131F]">
        <div>
          <h3 className="font-bold text-slate-200 tracking-wider uppercase">
            EXPORT DATA PREVIEW • {commoditySymbol}
          </h3>
          <span className="text-[11px] text-slate-500 font-sans">
            Includes raw MCX market data & derived customer pricing calculations
          </span>
        </div>
        <span className={`text-[10px] px-2.5 py-1 rounded font-bold border ${
          status === 'COMPLETED' ? 'bg-emerald-950 border-emerald-800 text-emerald-400' :
          status === 'GENERATING' ? 'bg-amber-950 border-amber-800 text-amber-400 animate-pulse' :
          status === 'FAILED' ? 'bg-red-950 border-red-800 text-red-400' :
          'bg-slate-900 border-slate-700 text-slate-400'
        }`}>
          STATUS: {status}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#090C12] text-slate-400 border-b border-slate-800 text-[11px]">
              <th className="py-2.5 px-4 font-semibold">DATE</th>
              <th className="py-2.5 px-4 font-semibold text-right">MARKET PRICE (₹)</th>
              <th className="py-2.5 px-4 font-semibold text-right">CUSTOM DUTY ({pricing.customDutyPercentage}%)</th>
              <th className="py-2.5 px-4 font-semibold text-right">GST ({pricing.gstPercentage}%)</th>
              <th className="py-2.5 px-4 font-semibold text-right text-blue-400">DERIVED PRICE (₹)</th>
              <th className="py-2.5 px-4 font-semibold text-right">VOLUME</th>
              <th className="py-2.5 px-4 font-semibold text-right">OPEN INTEREST</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {data.slice(0, 5).map((row, idx) => {
              const duty = (row.close * pricing.customDutyPercentage) / 100;
              const gst = ((row.close + duty) * pricing.gstPercentage) / 100;
              const derived = row.close + duty + gst;

              return (
                <tr key={idx} className="hover:bg-[#1A2336] transition-colors">
                  <td className="py-2.5 px-4 text-slate-300">{row.date}</td>
                  <td className="py-2.5 px-4 text-right font-medium text-slate-200">₹{row.close.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-4 text-right text-slate-400">₹{duty.toFixed(2)}</td>
                  <td className="py-2.5 px-4 text-right text-slate-400">₹{gst.toFixed(2)}</td>
                  <td className="py-2.5 px-4 text-right font-bold text-blue-400">₹{derived.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-4 text-right text-slate-300">{row.volume.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-4 text-right text-slate-300">{row.openInterest.toLocaleString('en-IN')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="p-3 bg-[#0D131F] text-slate-500 text-[11px] text-center border-t border-slate-800">
        Preview showing first 5 records of dataset. Full XLSX report contains complete OHLCV & calculated fields.
      </div>
    </div>
  );
};
