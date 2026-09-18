import React from 'react';
import { Instrument } from '../../types/market';

interface ContractInfoProps {
  instrument: Instrument;
}

export const ContractInfo: React.FC<ContractInfoProps> = ({ instrument }) => {
  const specs = [
    { label: 'Exchange', value: instrument.exchange },
    { label: 'Commodity', value: instrument.commoditySymbol },
    { label: 'Contract Name', value: instrument.contractName },
    { label: 'Expiry Date', value: instrument.expiryDate },
    { label: 'Lot Size', value: `${instrument.lotSize.toLocaleString('en-IN')} ${instrument.unit}` },
    { label: 'Tick Size', value: `₹${instrument.tickSize}` },
    { label: 'Trading Unit', value: instrument.unit },
    { label: 'Instrument ID', value: instrument.id },
  ];

  return (
    <div className="bg-[#131A29] border border-slate-800 rounded-lg p-4 font-mono">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          CONTRACT SPECIFICATIONS
        </h3>
        <span className="text-[10px] bg-blue-950 border border-blue-800 text-blue-400 px-2 py-0.5 rounded font-bold">
          {instrument.status}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {specs.map((item, idx) => (
          <div key={idx} className="bg-[#0D131F] border border-slate-800/80 p-2.5 rounded">
            <span className="text-[10px] text-slate-500 block uppercase">{item.label}</span>
            <span className="text-slate-200 font-medium block mt-0.5">{item.value}</span>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-slate-500 mt-3 font-sans">
        * Contract parameters are defined by MCX specifications. Lot size and tick size determine order constraints.
      </p>
    </div>
  );
};
