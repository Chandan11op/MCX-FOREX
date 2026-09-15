import React, { useState } from 'react';
import { useMarketData } from './hooks/useMarketData.js';
import { Header } from './components/Header.js';
import { CommodityCards } from './components/CommodityCards.js';
import { CommodityTable } from './components/CommodityTable.js';
import { ChartModal } from './components/ChartModal.js';
import { PricingAdminModal } from './components/PricingAdminModal.js';
import { ExportModal } from './components/ExportModal.js';
import { ProviderHealthDrawer } from './components/ProviderHealthDrawer.js';
import { CommodityCode } from '@mcx/shared-types';
import { ShieldCheck, Info } from 'lucide-react';

export const App: React.FC = () => {
  const {
    snapshots,
    connectionStatus,
    latencyMs,
    tickDirections,
    health,
    isSimulated,
    activeFilter,
    setActiveFilter,
    showCalculatedPrice,
    setShowCalculatedPrice,
    refreshSnapshot,
  } = useMarketData();

  // Modals & Drawers state
  const [selectedChartCommodity, setSelectedChartCommodity] = useState<CommodityCode | null>(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isHealthDrawerOpen, setIsHealthDrawerOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-dark-950">
      {/* Top Header */}
      <Header
        status={connectionStatus}
        latencyMs={latencyMs}
        isSimulated={isSimulated}
        health={health}
        onOpenPricing={() => setIsPricingModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenHealth={() => setIsHealthDrawerOpen(true)}
        showCalculatedPrice={showCalculatedPrice}
        onToggleCalculatedPrice={() => setShowCalculatedPrice(!showCalculatedPrice)}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Dynamic Price Mode Banner */}
        {showCalculatedPrice && (
          <div className="bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-dark-900 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200 flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>Customer Landing Price Mode Enabled</strong>: Displaying total derived price including custom duty (15-day rate), GST, and handling fees. Raw MCX exchange price remains isolated.
              </span>
            </div>
            <button
              onClick={() => setIsPricingModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-bold underline text-xs ml-4 whitespace-nowrap"
            >
              Edit Rates
            </button>
          </div>
        )}

        {/* Top 5 Commodity Metric Cards */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              MCX Major Commodities Overview
            </h2>
            <span className="text-[11px] font-mono text-slate-400">
              Sub-second Socket.IO Streaming Feed
            </span>
          </div>
          <CommodityCards
            snapshots={snapshots}
            tickDirections={tickDirections}
            showCalculatedPrice={showCalculatedPrice}
            onSelectCommodity={(c) => setSelectedChartCommodity(c)}
          />
        </section>

        {/* Dense Financial Table */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Live Commodity Order Book & Rates
            </h2>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" /> Uptick
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500 ml-2" /> Downtick
            </div>
          </div>
          <CommodityTable
            snapshots={snapshots}
            tickDirections={tickDirections}
            showCalculatedPrice={showCalculatedPrice}
            onOpenChart={(c) => setSelectedChartCommodity(c)}
            activeFilter={activeFilter}
            onFilterChange={(f) => setActiveFilter(f)}
          />
        </section>
      </main>

      {/* Footer Disclaimer & Regulatory Notice */}
      <footer className="bg-dark-900 border-t border-dark-800 py-4 px-6 mt-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              MCX Multi-Platform Terminal • High Performance Real-Time Streaming Gateway
            </span>
          </div>
          <div className="text-center md:text-right font-mono text-[11px]">
            <span>Exchange display compliance applies. Consult <code className="text-slate-300">docs/MARKET-DATA-LICENSING.md</code> for redistribution rights.</span>
          </div>
        </div>
      </footer>

      {/* Interactive Modals & Drawers */}
      <ChartModal
        commodity={selectedChartCommodity}
        snapshot={selectedChartCommodity ? snapshots[selectedChartCommodity] : undefined}
        onClose={() => setSelectedChartCommodity(null)}
      />

      <PricingAdminModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        onRuleUpdated={() => refreshSnapshot()}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      <ProviderHealthDrawer
        isOpen={isHealthDrawerOpen}
        onClose={() => setIsHealthDrawerOpen(false)}
        health={health}
        latencyMs={latencyMs}
      />
    </div>
  );
};
export default App;
