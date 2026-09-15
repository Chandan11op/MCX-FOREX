import React from 'react';
import { Activity, ShieldAlert, Wifi, Download, Sliders, Database, Clock } from 'lucide-react';
import { MarketConnectionStatus, ProviderHealthStatus } from '@mcx/shared-types';
import { STATUS_BADGES } from '@mcx/ui';
import { formatTime } from '@mcx/shared-utils';

interface HeaderProps {
  status: MarketConnectionStatus;
  latencyMs: number;
  isSimulated: boolean;
  health: ProviderHealthStatus | null;
  onOpenPricing: () => void;
  onOpenExport: () => void;
  onOpenHealth: () => void;
  showCalculatedPrice: boolean;
  onToggleCalculatedPrice: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  latencyMs,
  isSimulated,
  health,
  onOpenPricing,
  onOpenExport,
  onOpenHealth,
  showCalculatedPrice,
  onToggleCalculatedPrice,
}) => {
  const badge = STATUS_BADGES[status] || STATUS_BADGES.RECONNECTING;
  const currentTime = formatTime(Date.now());

  return (
    <header className="bg-dark-900 border-b border-dark-700 px-4 py-3 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Product Name & Branding */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-inner">
            <Activity className="w-5 h-5 text-dark-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                MCX LIVE <span className="text-amber-400 font-mono">TERMINAL</span>
              </h1>
              {isSimulated && (
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  SIMULATED DATA
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Gold • Silver • Copper • Crude Oil • Natural Gas
            </p>
          </div>
        </div>

        {/* Center: Live Status & Latency */}
        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-dark-800 border border-dark-700">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: badge.color }}
            />
            <span className="font-semibold text-slate-200">{badge.label}</span>
          </div>

          <div className="hidden sm:flex items-center space-x-1 text-slate-400 bg-dark-800 px-2.5 py-1 rounded-full border border-dark-700">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>{latencyMs > 0 ? `${latencyMs}ms` : '<10ms'}</span>
          </div>

          <div className="hidden md:flex items-center space-x-1 text-slate-400 bg-dark-800 px-2.5 py-1 rounded-full border border-dark-700">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{currentTime} IST</span>
          </div>
        </div>

        {/* Right: Actions & Pricing Toggle */}
        <div className="flex items-center space-x-2">
          {/* Price Mode Toggle */}
          <button
            onClick={onToggleCalculatedPrice}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 border ${
              showCalculatedPrice
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-dark-800 text-slate-300 border-dark-700 hover:bg-dark-700'
            }`}
            title="Toggle between Raw MCX Price and Customer Tax/Duty Landing Price"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showCalculatedPrice ? 'Customer Price (Tax/Duty)' : 'MCX Exchange Price'}</span>
          </button>

          {/* Pricing Rules Admin */}
          <button
            onClick={onOpenPricing}
            className="p-1.5 text-slate-300 bg-dark-800 hover:bg-dark-700 rounded-md border border-dark-700 transition"
            title="Configure GST & Custom Duty Rules"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Export Excel */}
          <button
            onClick={onOpenExport}
            className="p-1.5 text-slate-300 bg-dark-800 hover:bg-dark-700 rounded-md border border-dark-700 transition"
            title="Export Excel Report (.xlsx)"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Provider Health Drawer */}
          <button
            onClick={onOpenHealth}
            className="p-1.5 text-slate-300 bg-dark-800 hover:bg-dark-700 rounded-md border border-dark-700 transition"
            title="Provider Health & Telemetry Diagnostics"
          >
            <Database className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
