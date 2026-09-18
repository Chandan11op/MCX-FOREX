import React, { useState } from 'react';
import { HistoricalDataPoint } from '../../types/market';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HistoricalTableProps {
  data: HistoricalDataPoint[];
}

export const HistoricalTable: React.FC<HistoricalTableProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;
  const totalPages = Math.ceil(data.length / pageSize) || 1;

  const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="bg-[#131A29] border border-slate-800 rounded-lg overflow-hidden font-mono text-xs">
      <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center bg-[#0D131F]">
        <h3 className="font-bold text-slate-200 tracking-wider">
          HISTORICAL OHLCV MARKET DATA
        </h3>
        <span className="text-[11px] text-slate-500">
          Showing {data.length} Records
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#090C12] text-slate-400 border-b border-slate-800 text-[11px]">
              <th className="py-2.5 px-4 font-semibold">DATE</th>
              <th className="py-2.5 px-4 font-semibold text-right">OPEN (₹)</th>
              <th className="py-2.5 px-4 font-semibold text-right">HIGH (₹)</th>
              <th className="py-2.5 px-4 font-semibold text-right">LOW (₹)</th>
              <th className="py-2.5 px-4 font-semibold text-right">CLOSE (₹)</th>
              <th className="py-2.5 px-4 font-semibold text-right">VOLUME</th>
              <th className="py-2.5 px-4 font-semibold text-right">OPEN INTEREST</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {paginatedData.map((row, idx) => (
              <tr key={idx} className="hover:bg-[#1A2336] transition-colors">
                <td className="py-2.5 px-4 text-slate-300 font-medium">{row.date}</td>
                <td className="py-2.5 px-4 text-right text-slate-300">{row.open.toLocaleString('en-IN')}</td>
                <td className="py-2.5 px-4 text-right text-emerald-400 font-semibold">{row.high.toLocaleString('en-IN')}</td>
                <td className="py-2.5 px-4 text-right text-red-400 font-semibold">{row.low.toLocaleString('en-IN')}</td>
                <td className="py-2.5 px-4 text-right font-bold text-slate-100">{row.close.toLocaleString('en-IN')}</td>
                <td className="py-2.5 px-4 text-right text-slate-300">{row.volume.toLocaleString('en-IN')}</td>
                <td className="py-2.5 px-4 text-right text-slate-300">{row.openInterest.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3 bg-[#0D131F] border-t border-slate-800 flex justify-between items-center text-slate-400 text-xs">
        <div>
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
