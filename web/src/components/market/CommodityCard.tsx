import React from 'react';
import { MarketSnapshot } from '../../types/market';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../../context/CurrencyContext';

interface CommodityCardProps {
  snapshot: MarketSnapshot;
}

export const CommodityCard: React.FC<CommodityCardProps> = ({ snapshot }) => {
  const navigate = useNavigate();
  const { selectedCountry } = useCurrency();
  const isPositive = snapshot.change >= 0;
  const sym = snapshot.currencySymbol || selectedCountry.symbol;

  return (
    <div
      onClick={() => navigate(`/commodities/${snapshot.commoditySymbol.toLowerCase()}`)}
      className="bg-[#131A29] border border-slate-800 hover:border-blue-500/50 p-4 rounded-lg cursor-pointer transition-all duration-200 hover:bg-[#162033] group flex flex-col justify-between"
    >
      <div>
        {/* Top Header */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-base font-bold font-mono text-slate-100 group-hover:text-blue-400 transition-colors">
              {snapshot.commodityName.toUpperCase()}
            </h3>
            <div className="text-[11px] font-mono text-slate-400">
              {snapshot.commoditySymbol} • {snapshot.unit}
            </div>
          </div>
          <span className="text-[10px] font-mono bg-blue-950/60 border border-blue-800/60 text-blue-400 px-2 py-0.5 rounded">
            {snapshot.currency || selectedCountry.currency}
          </span>
        </div>

        {/* Main Price */}
        <div className="my-3">
          <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
            {sym}{snapshot.lastPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className={`flex items-center space-x-1 font-mono text-xs font-bold mt-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{isPositive ? '+' : ''}{sym}{snapshot.change.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            <span>({isPositive ? '+' : ''}{snapshot.changePercent.toFixed(2)}%)</span>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-[#0D131F] p-2.5 rounded border border-slate-800/80 my-3 text-xs font-mono">
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>PREV CLOSE</span>
            <span className="text-slate-200 font-medium">
              {snapshot.previousClose ? `${sym}${snapshot.previousClose.toLocaleString('en-IN')}` : '--'}
            </span>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>UPDATED</span>
            <span className="text-slate-300">{snapshot.tradingDate}</span>
          </div>
        </div>
      </div>

      {/* Footer Data Source Indicator */}
      <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center text-[10px] font-mono text-slate-500">
        <span>SRC: CommodityPriceAPI</span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
      </div>
    </div>
  );
};
