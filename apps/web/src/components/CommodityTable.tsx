import React, { useState } from 'react';
import { CommodityCode, MarketSnapshot } from '@mcx/shared-types';
import { COMMODITY_NAMES, formatINR, formatNumber, formatPercent, formatTime, formatVolume } from '@mcx/shared-utils';
import { LineChart, Info, ArrowUp, ArrowDown } from 'lucide-react';
import { STATUS_BADGES } from '@mcx/ui';

interface CommodityTableProps {
  snapshots: Record<CommodityCode, MarketSnapshot>;
  tickDirections: Record<CommodityCode, 'up' | 'down' | null>;
  showCalculatedPrice: boolean;
  onOpenChart: (c: CommodityCode) => void;
  activeFilter: CommodityCode | 'ALL';
  onFilterChange: (c: CommodityCode | 'ALL') => void;
}

const ALL_COMMODITIES: CommodityCode[] = ['GOLD', 'SILVER', 'COPPER', 'CRUDE_OIL', 'NATURAL_GAS'];

export const CommodityTable: React.FC<CommodityTableProps> = ({
  snapshots,
  tickDirections,
  showCalculatedPrice,
  onOpenChart,
  activeFilter,
  onFilterChange,
}) => {
  const [selectedCommodityDetail, setSelectedCommodityDetail] = useState<CommodityCode | null>(null);

  const filteredCommodities = activeFilter === 'ALL'
    ? ALL_COMMODITIES
    : ALL_COMMODITIES.filter((c) => c === activeFilter);

  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden shadow-lg">
      {/* Controls / Filter Bar */}
      <div className="px-4 py-3 border-b border-dark-700 flex flex-wrap items-center justify-between gap-3 bg-dark-900/90">
        <div className="flex items-center space-x-1.5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">Filter:</span>
          <button
            onClick={() => onFilterChange('ALL')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
              activeFilter === 'ALL'
                ? 'bg-amber-500 text-dark-950 font-bold'
                : 'bg-dark-800 text-slate-400 hover:bg-dark-700 hover:text-white'
            }`}
          >
            ALL (5)
          </button>
          {ALL_COMMODITIES.map((code) => (
            <button
              key={code}
              onClick={() => onFilterChange(code)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                activeFilter === code
                  ? 'bg-amber-500 text-dark-950 font-bold'
                  : 'bg-dark-800 text-slate-400 hover:bg-dark-700 hover:text-white'
              }`}
            >
              {COMMODITY_NAMES[code]?.name || code}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing <span className="text-amber-400 font-bold">{filteredCommodities.length}</span> Active MCX Contracts
        </div>
      </div>

      {/* Dense Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead>
            <tr className="bg-dark-950 text-slate-400 border-b border-dark-700 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-2.5 px-3">Commodity</th>
              <th className="py-2.5 px-3">Symbol</th>
              <th className="py-2.5 px-3">Expiry</th>
              <th className="py-2.5 px-3 text-right">
                {showCalculatedPrice ? 'Customer Price (₹)' : 'LTP / Raw MCX (₹)'}
              </th>
              {showCalculatedPrice && (
                <>
                  <th className="py-2.5 px-3 text-right text-amber-400">Custom Duty (₹)</th>
                  <th className="py-2.5 px-3 text-right text-amber-400">GST (₹)</th>
                </>
              )}
              <th className="py-2.5 px-3 text-right">Bid (₹)</th>
              <th className="py-2.5 px-3 text-right">Ask (₹)</th>
              <th className="py-2.5 px-3 text-right">Net Chg</th>
              <th className="py-2.5 px-3 text-right">% Chg</th>
              <th className="py-2.5 px-3 text-right">High (₹)</th>
              <th className="py-2.5 px-3 text-right">Low (₹)</th>
              <th className="py-2.5 px-3 text-right">Open (₹)</th>
              <th className="py-2.5 px-3 text-right">Volume</th>
              <th className="py-2.5 px-3 text-right">OI</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800">
            {filteredCommodities.map((code) => {
              const snap = snapshots[code];
              const meta = COMMODITY_NAMES[code];
              const tickDir = tickDirections[code];
              const isUp = snap ? snap.change >= 0 : true;
              const badge = snap ? (STATUS_BADGES[snap.status] || STATUS_BADGES.LIVE) : STATUS_BADGES.RECONNECTING;

              const displayPrice = snap
                ? (showCalculatedPrice && snap.calculatedPrice ? snap.calculatedPrice.displayPrice : snap.ltp)
                : 0;

              return (
                <tr
                  key={code}
                  className={`hover:bg-dark-800/80 transition-colors duration-150 ${
                    tickDir === 'up'
                      ? 'animate-flash-green'
                      : tickDir === 'down'
                      ? 'animate-flash-red'
                      : ''
                  }`}
                >
                  {/* Commodity Name & Unit */}
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-100 flex items-center gap-1.5">
                      {meta?.name || code}
                      <span className="text-[10px] font-normal text-slate-400 px-1 rounded bg-dark-800">
                        {meta?.unit}
                      </span>
                    </div>
                  </td>

                  {/* Trading Symbol */}
                  <td className="py-3 px-3 text-slate-300 font-medium">
                    {snap?.tradingSymbol || '--'}
                  </td>

                  {/* Expiry */}
                  <td className="py-3 px-3 text-slate-400">
                    {snap?.expiry || '--'}
                  </td>

                  {/* LTP / Price */}
                  <td
                    className={`py-3 px-3 text-right font-bold text-sm transition-colors ${
                      tickDir === 'up'
                        ? 'text-emerald-400'
                        : tickDir === 'down'
                        ? 'text-rose-400'
                        : isUp
                        ? 'text-emerald-300'
                        : 'text-rose-300'
                    }`}
                  >
                    {snap ? formatINR(displayPrice) : '₹--'}
                  </td>

                  {/* Customer Duty & GST Breakdown Columns */}
                  {showCalculatedPrice && (
                    <>
                      <td className="py-3 px-3 text-right text-amber-300">
                        {snap?.calculatedPrice ? `+${formatINR(snap.calculatedPrice.customDutyAmount)} (${snap.calculatedPrice.customDutyRate}%)` : '--'}
                      </td>
                      <td className="py-3 px-3 text-right text-amber-300">
                        {snap?.calculatedPrice ? `+${formatINR(snap.calculatedPrice.gstAmount)} (${snap.calculatedPrice.gstRate}%)` : '--'}
                      </td>
                    </>
                  )}

                  {/* Bid */}
                  <td className="py-3 px-3 text-right text-slate-200">
                    {snap ? formatINR(snap.bid) : '--'}
                    {snap && <div className="text-[9px] text-slate-400">{snap.bidQty} Qty</div>}
                  </td>

                  {/* Ask */}
                  <td className="py-3 px-3 text-right text-slate-200">
                    {snap ? formatINR(snap.ask) : '--'}
                    {snap && <div className="text-[9px] text-slate-400">{snap.askQty} Qty</div>}
                  </td>

                  {/* Net Change */}
                  <td className={`py-3 px-3 text-right font-semibold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {snap ? `${isUp ? '+' : ''}${formatNumber(snap.change)}` : '--'}
                  </td>

                  {/* % Change */}
                  <td className={`py-3 px-3 text-right font-semibold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {snap ? formatPercent(snap.changePercent) : '--'}
                  </td>

                  {/* High */}
                  <td className="py-3 px-3 text-right text-slate-300 font-medium">
                    {snap ? formatINR(snap.high) : '--'}
                  </td>

                  {/* Low */}
                  <td className="py-3 px-3 text-right text-slate-300 font-medium">
                    {snap ? formatINR(snap.low) : '--'}
                  </td>

                  {/* Open */}
                  <td className="py-3 px-3 text-right text-slate-400">
                    {snap ? formatINR(snap.open) : '--'}
                  </td>

                  {/* Volume */}
                  <td className="py-3 px-3 text-right text-slate-300 font-medium">
                    {snap ? formatVolume(snap.volume) : '--'}
                  </td>

                  {/* Open Interest */}
                  <td className="py-3 px-3 text-right text-slate-300 font-medium">
                    {snap ? formatVolume(snap.openInterest) : '--'}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 text-center">
                    <span
                      className="px-2 py-0.5 text-[10px] font-bold rounded-full"
                      style={{ backgroundColor: badge.bg, color: badge.color }}
                    >
                      {badge.label}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => onOpenChart(code)}
                      className="p-1.5 rounded bg-dark-800 hover:bg-dark-700 text-amber-400 hover:text-amber-300 border border-dark-700 transition"
                      title="Open Live OHLC Chart"
                    >
                      <LineChart className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
