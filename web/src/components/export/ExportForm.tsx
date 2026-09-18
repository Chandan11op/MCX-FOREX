import React, { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { ExportRequest } from '../../services/exportApi';

interface ExportFormProps {
  onGenerate: (req: ExportRequest) => void;
  status: 'READY' | 'GENERATING' | 'COMPLETED' | 'FAILED';
}

export const ExportForm: React.FC<ExportFormProps> = ({ onGenerate, status }) => {
  const [form, setForm] = useState<ExportRequest>({
    commodity: 'GOLD',
    contract: 'GOLD OCT 2026',
    fromDate: '2026-09-01',
    toDate: '2026-09-18',
    format: 'xlsx',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#131A29] border border-slate-800 rounded-lg p-5 font-mono text-xs">
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-4">
        <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
        <h3 className="text-sm font-bold text-slate-200 tracking-wider uppercase">
          MARKET DATA EXPORT GENERATOR
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="text-[10px] text-slate-400 block mb-1 uppercase">Commodity</label>
          <select
            value={form.commodity}
            onChange={(e) => setForm(prev => ({ ...prev, commodity: e.target.value }))}
            className="w-full bg-[#0D131F] border border-slate-800 rounded p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
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
            value={form.contract}
            onChange={(e) => setForm(prev => ({ ...prev, contract: e.target.value }))}
            className="w-full bg-[#0D131F] border border-slate-800 rounded p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="GOLD OCT 2026">OCT 2026 (Active)</option>
            <option value="GOLD NOV 2026">NOV 2026</option>
            <option value="GOLD DEC 2026">DEC 2026</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] text-slate-400 block mb-1 uppercase">From Date</label>
          <input
            type="date"
            value={form.fromDate}
            onChange={(e) => setForm(prev => ({ ...prev, fromDate: e.target.value }))}
            className="w-full bg-[#0D131F] border border-slate-800 rounded p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-[10px] text-slate-400 block mb-1 uppercase">To Date</label>
          <input
            type="date"
            value={form.toDate}
            onChange={(e) => setForm(prev => ({ ...prev, toDate: e.target.value }))}
            className="w-full bg-[#0D131F] border border-slate-800 rounded p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-slate-800/80 gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 text-[11px]">Format:</span>
          <span className="bg-emerald-950 border border-emerald-800 text-emerald-400 px-2 py-0.5 rounded text-[11px] font-bold">
            EXCEL (.XLSX)
          </span>
        </div>

        <button
          type="submit"
          disabled={status === 'GENERATING'}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded flex items-center justify-center space-x-2 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>{status === 'GENERATING' ? 'GENERATING...' : 'GENERATE EXCEL (.XLSX)'}</span>
        </button>
      </div>
    </form>
  );
};
