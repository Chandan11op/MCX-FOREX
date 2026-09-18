import React, { useState } from 'react';
import { Filter, RotateCcw } from 'lucide-react';

interface FilterValues {
  commodity: string;
  contract: string;
  fromDate: string;
  toDate: string;
  interval: string;
}

interface HistoricalFiltersProps {
  onApplyFilter: (filters: FilterValues) => void;
  onReset: () => void;
}

export const HistoricalFilters: React.FC<HistoricalFiltersProps> = ({ onApplyFilter, onReset }) => {
  const [filters, setFilters] = useState<FilterValues>({
    commodity: 'GOLD',
    contract: 'GOLD OCT 2026',
    fromDate: '2026-09-01',
    toDate: '2026-09-18',
    interval: 'Daily',
  });

  const handleChange = (field: keyof FilterValues, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilter(filters);
  };

  const handleResetClick = () => {
    const defaults: FilterValues = {
      commodity: 'GOLD',
      contract: 'GOLD OCT 2026',
      fromDate: '2026-09-01',
      toDate: '2026-09-18',
      interval: 'Daily',
    };
    setFilters(defaults);
    onReset();
  };

  return (
    <form onSubmit={handleApply} className="bg-[#131A29] border border-slate-800 rounded-lg p-4 font-mono text-xs">
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-4">
        <Filter className="w-4 h-4 text-blue-400" />
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          HISTORICAL DATA FILTERS
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        <div>
          <label className="text-[10px] text-slate-400 block mb-1 uppercase">Commodity</label>
          <select
            value={filters.commodity}
            onChange={(e) => handleChange('commodity', e.target.value)}
            className="w-full bg-[#0D131F] border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="GOLD">Gold (GOLD)</option>
            <option value="SILVER">Silver (SILVER)</option>
            <option value="COPPER">Copper (COPPER)</option>
            <option value="CRUDEOIL">Crude Oil (CRUDEOIL)</option>
            <option value="NATURALGAS">Natural Gas (NATURALGAS)</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] text-slate-400 block mb-1 uppercase">Contract</label>
          <select
            value={filters.contract}
            onChange={(e) => handleChange('contract', e.target.value)}
            className="w-full bg-[#0D131F] border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="OCT 2026">OCT 2026 (Active)</option>
            <option value="NOV 2026">NOV 2026</option>
            <option value="DEC 2026">DEC 2026</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] text-slate-400 block mb-1 uppercase">From Date</label>
          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) => handleChange('fromDate', e.target.value)}
            className="w-full bg-[#0D131F] border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-[10px] text-slate-400 block mb-1 uppercase">To Date</label>
          <input
            type="date"
            value={filters.toDate}
            onChange={(e) => handleChange('toDate', e.target.value)}
            className="w-full bg-[#0D131F] border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-[10px] text-slate-400 block mb-1 uppercase">Interval</label>
          <select
            value={filters.interval}
            onChange={(e) => handleChange('interval', e.target.value)}
            className="w-full bg-[#0D131F] border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="1 Minute">1 Minute</option>
            <option value="5 Minutes">5 Minutes</option>
            <option value="15 Minutes">15 Minutes</option>
            <option value="30 Minutes">30 Minutes</option>
            <option value="1 Hour">1 Hour</option>
            <option value="Daily">Daily</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-slate-800/80">
        <button
          type="button"
          onClick={handleResetClick}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded flex items-center space-x-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET</span>
        </button>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded font-bold transition-colors"
        >
          APPLY FILTER
        </button>
      </div>
    </form>
  );
};
