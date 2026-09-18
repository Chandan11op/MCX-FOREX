import React from 'react';
import { MarketSnapshot } from '../../types/market';
import { useCurrency } from '../../context/CurrencyContext';

interface MarketStatsProps {
  snapshot: MarketSnapshot;
}

export const MarketStats: React.FC<MarketStatsProps> = ({ snapshot }) => {
  const { selectedCountry } = useCurrency();
  const sym = snapshot.currencySymbol || selectedCountry.symbol;

  const fmtCurrency = (val: number | null) => (val != null ? `${sym}${val.toLocaleString('en-IN')}` : 'N/A');
  const fmtNum = (val: number | null) => (val != null ? val.toLocaleString('en-IN') : 'N/A');

  const stats = [
    { label: 'OPEN', value: fmtCurrency(snapshot.open) },
    { label: 'HIGH', value: fmtCurrency(snapshot.high) },
    { label: 'LOW', value: fmtCurrency(snapshot.low) },
    { label: 'PREVIOUS CLOSE', value: fmtCurrency(snapshot.previousClose) },
    { label: 'VOLUME', value: fmtNum(snapshot.volume) },
    { label: 'OPEN INTEREST', value: fmtNum(snapshot.openInterest) },
    { label: 'UNIT', value: snapshot.unit },
    { label: 'TRADING DATE', value: snapshot.tradingDate },
  ];

  return (
    <div className="bg-[#131A29] border border-slate-800 rounded-lg p-4">
      <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider mb-3">
        STATISTICS & MARKET METRICS
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-[#0D131F] border border-slate-800/80 p-3 rounded font-mono">
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider">{stat.label}</span>
            <span className="text-sm font-semibold text-slate-100 mt-1 block">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
