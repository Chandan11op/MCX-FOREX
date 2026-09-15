import React from 'react';
import { CommodityCode, MarketSnapshot } from '@mcx/shared-types';
import { COMMODITY_NAMES, formatINR, formatPercent } from '@mcx/shared-utils';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface CommodityCardsProps {
  snapshots: Record<CommodityCode, MarketSnapshot>;
  tickDirections: Record<CommodityCode, 'up' | 'down' | null>;
  showCalculatedPrice: boolean;
  onSelectCommodity: (c: CommodityCode) => void;
}

const ORDERED_COMMODITIES: CommodityCode[] = ['GOLD', 'SILVER', 'COPPER', 'CRUDE_OIL', 'NATURAL_GAS'];

export const CommodityCards: React.FC<CommodityCardsProps> = ({
  snapshots,
  tickDirections,
  showCalculatedPrice,
  onSelectCommodity,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {ORDERED_COMMODITIES.map((code) => {
        const snap = snapshots[code];
        const meta = COMMODITY_NAMES[code];
        const tickDir = tickDirections[code];
        const isUp = snap ? snap.change >= 0 : true;

        const displayPrice = snap
          ? (showCalculatedPrice && snap.calculatedPrice ? snap.calculatedPrice.displayPrice : snap.ltp)
          : 0;

        return (
          <div
            key={code}
            onClick={() => onSelectCommodity(code)}
            className={`cursor-pointer rounded-xl p-3.5 border transition-all duration-300 relative overflow-hidden bg-dark-900/90 hover:bg-dark-800/90 shadow-sm ${
              tickDir === 'up'
                ? 'border-emerald-500 shadow-emerald-950/40'
                : tickDir === 'down'
                ? 'border-rose-500 shadow-rose-950/40'
                : 'border-dark-700 hover:border-dark-600'
            }`}
          >
            {/* Top Row: Symbol & Unit */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm text-white tracking-wide">{meta?.name || code}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-dark-800 text-slate-400 border border-dark-700">
                  {meta?.unit}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {snap?.expiry ? snap.expiry.split('-').slice(1).join('/') : '--'}
              </span>
            </div>

            {/* Price & Direction Flash */}
            <div className="flex items-baseline justify-between mt-1">
              <div
                className={`text-xl font-bold font-mono transition-colors duration-200 ${
                  tickDir === 'up'
                    ? 'text-emerald-400'
                    : tickDir === 'down'
                    ? 'text-rose-400'
                    : 'text-slate-100'
                }`}
              >
                {snap ? formatINR(displayPrice) : '₹--'}
              </div>

              {/* Change Indicator */}
              {snap && (
                <div
                  className={`flex items-center text-xs font-mono font-semibold px-1.5 py-0.5 rounded ${
                    isUp
                      ? 'text-emerald-400 bg-emerald-950/50 border border-emerald-800/40'
                      : 'text-rose-400 bg-rose-950/50 border border-rose-800/40'
                  }`}
                >
                  {isUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                  {formatPercent(snap.changePercent)}
                </div>
              )}
            </div>

            {/* Sub-label for Price mode */}
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 pt-2 border-t border-dark-800 font-mono">
              <span>H: {snap ? formatINR(snap.high) : '--'}</span>
              <span>L: {snap ? formatINR(snap.low) : '--'}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
