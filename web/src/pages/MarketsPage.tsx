import React, { useEffect, useState } from 'react';
import { MarketTable } from '../components/market/MarketTable';
import { MarketSnapshot } from '../types/market';
import { marketApi } from '../services/marketApi';
import { useCurrency } from '../context/CurrencyContext';

export const MarketsPage: React.FC = () => {
  const { selectedCountry } = useCurrency();
  const [snapshots, setSnapshots] = useState<MarketSnapshot[]>([]);

  useEffect(() => {
    marketApi.getSnapshots(selectedCountry.currency).then((res) => setSnapshots(Object.values(res)));
  }, [selectedCountry]);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800/80 pb-3">
        <h2 className="text-lg font-bold font-mono text-slate-100 tracking-tight">
          COMMODITY MARKET WATCH & GLOBAL TERMINAL DATA
        </h2>
        <p className="text-xs text-slate-400">
          Spot prices and daily percentage changes quoted in {selectedCountry.country} ({selectedCountry.currency})
        </p>
      </div>

      <MarketTable snapshots={snapshots} />
    </div>
  );
};
