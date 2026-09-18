import React, { useState, useEffect } from 'react';
import { Instrument } from '../types/market';
import { marketApi } from '../services/marketApi';
import { FileText } from 'lucide-react';

export const ContractsPage: React.FC = () => {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedCommodity, setSelectedCommodity] = useState<string>('ALL');

  useEffect(() => {
    marketApi.getInstruments().then(setInstruments);
  }, []);

  const categories = ['ALL', 'GOLD', 'SILVER', 'COPPER', 'CRUDEOIL', 'NATURALGAS'];

  const filtered = selectedCommodity === 'ALL'
    ? instruments
    : instruments.filter(i => i.commoditySymbol === selectedCommodity);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800/80 pb-3">
        <h2 className="text-lg font-bold font-mono text-slate-100 tracking-tight">
          MCX INSTRUMENT CONTRACT MASTER
        </h2>
        <p className="text-xs text-slate-400">
          Inspection of active, upcoming, and expired commodity futures contracts on MCX
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-[#131A29] p-1.5 border border-slate-800 rounded-lg font-mono text-xs overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCommodity(cat)}
            className={`px-4 py-2 rounded font-medium transition-colors whitespace-nowrap ${
              selectedCommodity === cat
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Contracts Table */}
      <div className="bg-[#131A29] border border-slate-800 rounded-lg overflow-hidden font-mono text-xs">
        <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center bg-[#0D131F]">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-slate-200 tracking-wider">
              CONTRACT SPECIFICATIONS & PARAMETERS
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            {filtered.length} Instruments Found
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#090C12] text-slate-400 border-b border-slate-800 text-[11px]">
                <th className="py-2.5 px-4 font-semibold">INSTRUMENT ID</th>
                <th className="py-2.5 px-4 font-semibold">COMMODITY</th>
                <th className="py-2.5 px-4 font-semibold">CONTRACT NAME</th>
                <th className="py-2.5 px-4 font-semibold">EXPIRY DATE</th>
                <th className="py-2.5 px-4 font-semibold text-right">LOT SIZE</th>
                <th className="py-2.5 px-4 font-semibold text-right">TICK SIZE</th>
                <th className="py-2.5 px-4 font-semibold text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((inst) => (
                <tr key={inst.id} className="hover:bg-[#1A2336] transition-colors">
                  <td className="py-3 px-4 font-bold text-blue-400">{inst.id}</td>
                  <td className="py-3 px-4 text-slate-200">{inst.commoditySymbol}</td>
                  <td className="py-3 px-4 font-semibold text-slate-100">{inst.contractName}</td>
                  <td className="py-3 px-4 text-slate-300">{inst.expiryDate}</td>
                  <td className="py-3 px-4 text-right text-slate-300">{inst.lotSize.toLocaleString('en-IN')} {inst.unit}</td>
                  <td className="py-3 px-4 text-right text-slate-300">₹{inst.tickSize}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      inst.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      inst.status === 'UPCOMING' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                      'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}>
                      {inst.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
