import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { CommodityCode, CandleInterval } from '@mcx/shared-types';
import { COMMODITY_NAMES } from '@mcx/shared-utils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMODITIES: (CommodityCode | 'ALL')[] = ['ALL', 'GOLD', 'SILVER', 'COPPER', 'CRUDE_OIL', 'NATURAL_GAS'];
const INTERVALS: CandleInterval[] = ['1m', '5m', '15m', '30m', '1h', '1d'];

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [selectedCommodity, setSelectedCommodity] = useState<CommodityCode | 'ALL'>('ALL');
  const [selectedInterval, setSelectedInterval] = useState<CandleInterval>('1m');
  const [includeCalculatedPrices, setIncludeCalculatedPrices] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setDownloadUrl(null);

    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity: selectedCommodity,
          interval: selectedInterval,
          includeCalculatedPrices,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await res.json();
      setDownloadUrl(data.downloadUrl);

      // Trigger automatic download
      const a = document.createElement('a');
      a.href = data.downloadUrl;
      a.download = `MCX_Market_Data_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || 'Error generating export');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-dark-700 flex items-center justify-between bg-dark-950">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Export Market Data Report (Excel .xlsx)
              </h3>
              <p className="text-xs text-slate-400">
                Generate formatted Excel sheets for snapshots & historical candles
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

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {/* Commodity Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Commodity</label>
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value as any)}
              className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Commodities (Gold, Silver, Copper, Crude, Gas)</option>
              {COMMODITIES.filter((c) => c !== 'ALL').map((c) => (
                <option key={c} value={c}>
                  {COMMODITY_NAMES[c as CommodityCode]?.name} ({c})
                </option>
              ))}
            </select>
          </div>

          {/* Candle Interval */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Candle History Interval</label>
            <select
              value={selectedInterval}
              onChange={(e) => setSelectedInterval(e.target.value as any)}
              className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
            >
              {INTERVALS.map((intv) => (
                <option key={intv} value={intv}>
                  {intv} Interval Candles
                </option>
              ))}
            </select>
          </div>

          {/* Include Pricing Breakdown */}
          <label className="flex items-center space-x-2.5 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={includeCalculatedPrices}
              onChange={(e) => setIncludeCalculatedPrices(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 bg-dark-950 border-dark-700 focus:ring-amber-500 focus:ring-offset-0"
            />
            <span className="text-xs text-slate-300 font-medium">
              Include Customer Landing Price Sheet (GST & Custom Duty breakdown)
            </span>
          </label>

          {downloadUrl && (
            <div className="flex items-center text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded-lg p-2.5">
              <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0" />
              Excel file generated! Download started automatically.
            </div>
          )}

          {error && (
            <div className="flex items-center text-xs text-rose-400 bg-rose-950/60 border border-rose-800/60 rounded-lg p-2.5">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-dark-950 border-t border-dark-800 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-300 transition"
          >
            Close
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-bold transition flex items-center gap-1.5 shadow"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Generate Excel (.xlsx)
          </button>
        </div>
      </div>
    </div>
  );
};
