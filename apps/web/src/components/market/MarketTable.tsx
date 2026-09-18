import React from 'react';
import { MarketSnapshot } from '../../types/market';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

interface MarketTableProps {
  snapshots: MarketSnapshot[];
}

export const MarketTable: React.FC<MarketTableProps> = ({ snapshots }) => {
  const navigate = useNavigate();
  const { selectedCountry } = useCurrency();

  return (
    <div className="bg-[#131A29] border border-slate-800 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center bg-[#0D131F]">
        <div>
          <h2 className="text-sm font-bold font-mono text-slate-200 tracking-wider uppercase">
            COMMODITY MARKET WATCH
          </h2>
          <span className="text-[11px] font-sans text-slate-500">
            Display Currency: {selectedCountry.currency} ({selectedCountry.symbol})
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">
          {snapshots.length} ACTIVE SYMBOLS
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead>
            <tr className="bg-[#090C12] text-slate-400 border-b border-slate-800 text-[11px]">
              <th className="py-2.5 px-4 font-semibold">COMMODITY</th>
              <th className="py-2.5 px-4 font-semibold">SYMBOL</th>
              <th className="py-2.5 px-4 font-semibold text-right">PRICE ({selectedCountry.currency})</th>
              <th className="py-2.5 px-4 font-semibold text-right">CHANGE</th>
              <th className="py-2.5 px-4 font-semibold text-right">CHANGE %</th>
              <th className="py-2.5 px-4 font-semibold">UNIT</th>
              <th className="py-2.5 px-4 font-semibold text-right">PREV CLOSE</th>
              <th className="py-2.5 px-4 font-semibold text-right">LAST UPDATED</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {snapshots.map((item) => {
              const isPositive = item.change >= 0;
              const sym = item.currencySymbol || selectedCountry.symbol;
              return (
                <tr
                  key={item.commoditySymbol}
                  onClick={() => navigate(`/commodities/${item.commoditySymbol.toLowerCase()}`)}
                  className="hover:bg-[#1A2336] cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-bold text-slate-100 flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>{item.commodityName}</span>
                  </td>
                  <td className="py-3 px-4 text-blue-400 font-semibold">{item.commoditySymbol}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-100">
                    {sym}{item.lastPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className={`py-3 px-4 text-right font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{sym}{item.change.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className={`py-3 px-4 text-right font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    <div className="inline-flex items-center space-x-1">
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{item.unit}</td>
                  <td className="py-3 px-4 text-right text-slate-400">
                    {item.previousClose ? `${sym}${item.previousClose.toLocaleString('en-IN')}` : '--'}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400">{item.tradingDate}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
