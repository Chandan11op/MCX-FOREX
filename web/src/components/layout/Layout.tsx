import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { MarketTicker } from './MarketTicker';
import { OfflineBanner } from '../status/OfflineBanner';
import { ProviderStatus } from '../../types/provider';
import { MarketSnapshot } from '../../types/market';
import { marketApi } from '../../services/marketApi';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [providerStatus, setProviderStatus] = useState<ProviderStatus>({
    source: 'MCX',
    provider: 'mcx-bhavcopy',
    dataMode: 'END_OF_DAY',
    status: 'AVAILABLE',
    lastUpdated: '18 Sep 2026, 14:25:32',
    notice: 'Current prototype uses MCX end-of-day/Bhavcopy data. It is not a real-time feed.',
  });

  const [snapshots, setSnapshots] = useState<Record<string, MarketSnapshot>>({});

  useEffect(() => {
    marketApi.getProviderStatus().then(setProviderStatus);
    marketApi.getSnapshots().then(setSnapshots);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans">
      <OfflineBanner />
      <Header providerStatus={providerStatus} />
      <Navigation />
      {Object.keys(snapshots).length > 0 && <MarketTicker snapshots={snapshots} />}

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {children}
      </main>

      <footer className="border-t border-slate-800/80 bg-[#090C12] py-4 px-6 text-center text-xs text-slate-500 font-mono">
        <div className="flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto gap-2">
          <div>MCX MARKET TERMINAL • Prototype Data Mode: END OF DAY / BHAVCOPY</div>
          <div className="text-amber-500/90 font-medium">
            Prototype data — MCX End-of-Day/Bhavcopy. Not real-time market data.
          </div>
        </div>
      </footer>
    </div>
  );
};
