import React, { useEffect, useState } from 'react';
import { CommodityCard } from '../components/market/CommodityCard';
import { MarketTable } from '../components/market/MarketTable';
import { DataSourceStatus } from '../components/status/DataSourceStatus';
import { MarketSnapshot } from '../types/market';
import { ProviderStatus } from '../types/provider';
import { marketApi } from '../services/marketApi';
import { useCurrency } from '../context/CurrencyContext';

export const DashboardPage: React.FC = () => {
  const { selectedCountry, isLoadingCurrency } = useCurrency();
  const [snapshots, setSnapshots] = useState<MarketSnapshot[]>([]);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);

  useEffect(() => {
    marketApi.getSnapshots(selectedCountry.currency).then((res) => setSnapshots(Object.values(res)));
    marketApi.getProviderStatus().then(setProviderStatus);
  }, [selectedCountry]);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-lg font-bold font-mono text-slate-100 tracking-tight flex items-center space-x-2">
            <span>COMMODITY MARKET OVERVIEW</span>
            {isLoadingCurrency && <span className="text-xs text-blue-400 font-normal animate-pulse">(Updating Currency...)</span>}
          </h2>
          <p className="text-xs text-slate-400">
            Aggregated market prices via CommodityPriceAPI in {selectedCountry.country} ({selectedCountry.currency})
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono bg-blue-950/60 border border-blue-800/60 text-blue-400 px-3 py-1 rounded font-bold">
            CURRENCY: {selectedCountry.currency} ({selectedCountry.symbol})
          </span>
          <span className="text-[11px] font-mono bg-amber-950/60 border border-amber-800/60 text-amber-400 px-3 py-1 rounded font-bold">
            DEMO DATA
          </span>
        </div>
      </div>

      {/* 5 Commodity Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {snapshots.map((snapshot) => (
          <CommodityCard key={snapshot.commoditySymbol} snapshot={snapshot} />
        ))}
      </div>

      {/* Market Watch Table */}
      <MarketTable snapshots={snapshots} />

      {/* Data Source Status Panel */}
      {providerStatus && <DataSourceStatus status={providerStatus} />}
    </div>
  );
};
