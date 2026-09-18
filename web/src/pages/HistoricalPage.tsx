import React, { useState, useEffect } from 'react';
import { HistoricalFilters } from '../components/historical/HistoricalFilters';
import { HistoricalTable } from '../components/historical/HistoricalTable';
import { PriceChart } from '../components/market/PriceChart';
import { HistoricalDataPoint } from '../types/market';
import { historicalApi } from '../services/historicalApi';
import { useCurrency } from '../context/CurrencyContext';

export interface FilterValues {
  commodity: string;
  contract: string;
  fromDate: string;
  toDate: string;
  interval: string;
}

export const HistoricalPage: React.FC = () => {
  const { selectedCountry } = useCurrency();
  const [filters, setFilters] = useState<FilterValues>({
    commodity: 'GOLD',
    contract: 'GOLD OCT 2026',
    fromDate: '2026-09-01',
    toDate: '2026-09-18',
    interval: 'Daily',
  });
  const [data, setData] = useState<HistoricalDataPoint[]>([]);
  const [activeInterval, setActiveInterval] = useState<string>('1M');

  const mapIntervalToTimeframe = (intervalStr: string): string => {
    switch (intervalStr) {
      case '1 Minute': return '1D';
      case '5 Minutes': return '1D';
      case '15 Minutes': return '1D';
      case '30 Minutes': return '1D';
      case '1 Hour': return '1W';
      case 'Daily': return '1M';
      default: return '1M';
    }
  };

  const loadData = (f: FilterValues) => {
    const tf = mapIntervalToTimeframe(f.interval);
    setActiveInterval(tf);
    historicalApi.getHistory(f.commodity, tf, selectedCountry.currency).then(setData);
  };

  useEffect(() => {
    loadData(filters);
  }, [filters.commodity, selectedCountry]);

  const handleApplyFilter = (newFilters: FilterValues) => {
    setFilters(newFilters);
    loadData(newFilters);
  };

  const handleReset = () => {
    const defaults: FilterValues = {
      commodity: 'GOLD',
      contract: 'GOLD OCT 2026',
      fromDate: '2026-09-01',
      toDate: '2026-09-18',
      interval: 'Daily',
    };
    setFilters(defaults);
    loadData(defaults);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800/80 pb-3">
        <h2 className="text-lg font-bold font-mono text-slate-100 tracking-tight">
          HISTORICAL MARKET DATA WORKSPACE
        </h2>
        <p className="text-xs text-slate-400">
          Query, analyze, and inspect historical MCX commodity OHLCV datasets across multiple time intervals
        </p>
      </div>

      <HistoricalFilters onApplyFilter={handleApplyFilter} onReset={handleReset} />

      <PriceChart
        data={data}
        commodityName={`${filters.commodity} (${filters.contract}) - ${filters.interval}`}
        activeTimeframe={activeInterval}
        onTimeframeChange={(tf) => {
          setActiveInterval(tf);
          historicalApi.getHistory(filters.commodity, tf, selectedCountry.currency).then(setData);
        }}
      />

      <HistoricalTable data={data} />
    </div>
  );
};
