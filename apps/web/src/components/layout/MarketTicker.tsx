import React from 'react';
import { MarketSnapshot } from '../../types/market';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MarketTickerProps {
  snapshots: Record<string, MarketSnapshot>;
}

export const MarketTicker: React.FC<MarketTickerProps> = ({ snapshots }) => {
  const items = Object.values(snapshots);

  return (
    <div className="bg-[#090C12] border-b border-slate-800/80 px-4 py-1.5 overflow-hidden text-xs font-mono">
      <div className="flex items-center space-x-6 overflow-x-auto scrollbar-none whitespace-nowrap">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-800 pr-4">
          MCX TICKER
        </span>
        {items.map((snapshot) => {
          const isPositive = snapshot.change >= 0;
          return (
            <Link
              key={snapshot.commoditySymbol}
              to={`/commodities/${snapshot.commoditySymbol.toLowerCase()}`}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <span className="font-semibold text-slate-200">{snapshot.commodityName}</span>
              <span className="text-slate-400">₹{snapshot.lastPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              <span className={`flex items-center space-x-0.5 font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{isPositive ? '+' : ''}{snapshot.changePercent.toFixed(2)}%</span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
