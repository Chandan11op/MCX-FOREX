import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { marketApi } from '../services/marketApi';
import { historicalApi } from '../services/historicalApi';
import { pricingApi } from '../services/pricingApi';
import { MarketSnapshot, HistoricalDataPoint, Instrument } from '../types/market';
import { PricingCalculationResult } from '../types/pricing';
import { PriceChart } from '../components/market/PriceChart';
import { ContractInfo } from '../components/market/ContractInfo';
import { PricingCalculation } from '../components/pricing/PricingCalculation';
import { TrendingUp, TrendingDown, ChevronRight, Info } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

export const CommodityDetailPage: React.FC = () => {
  const { commoditySymbol } = useParams<{ commoditySymbol: string }>();
  const { selectedCountry } = useCurrency();
  const symbol = (commoditySymbol || 'gold').toUpperCase();

  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null);
  const [history, setHistory] = useState<HistoricalDataPoint[]>([]);
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [pricing, setPricing] = useState<PricingCalculationResult | null>(null);
  const [timeframe, setTimeframe] = useState<string>('1M');

  useEffect(() => {
    marketApi.getCommoditySnapshot(symbol, selectedCountry.currency).then(setSnapshot);
    historicalApi.getHistory(symbol, timeframe, selectedCountry.currency).then(setHistory);

    marketApi.getCommoditySnapshot(symbol, selectedCountry.currency).then(snap => {
      if (snap) {
        pricingApi.calculatePrice(symbol, snap.lastPrice).then(setPricing);
      }
    });

    marketApi.getInstruments().then(insts => {
      const found = insts.find(i => i.commoditySymbol === symbol) || insts[0];
      setInstrument(found);
    });
  }, [symbol, timeframe, selectedCountry]);

  if (!snapshot) {
    return (
      <div className="p-8 text-center font-mono text-slate-400">
        Loading commodity terminal data...
      </div>
    );
  }

  const isPositive = snapshot.change >= 0;
  const sym = snapshot.currencySymbol || selectedCountry.symbol;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
        <Link to="/" className="hover:text-blue-400">Dashboard</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <Link to="/markets" className="hover:text-blue-400">Commodities</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-slate-200 font-bold">{snapshot.commodityName}</span>
      </div>

      {/* Header Banner */}
      <div className="bg-[#131A29] border border-slate-800 p-6 rounded-lg font-mono flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              {snapshot.commodityName.toUpperCase()}
            </h1>
            <span className="bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-0.5 rounded text-xs">
              {snapshot.commoditySymbol} • {snapshot.unit}
            </span>
            <span className="bg-amber-950/60 border border-amber-800/60 text-amber-400 px-2.5 py-0.5 rounded text-xs font-bold">
              DEMO / GLOBAL DATA
            </span>
          </div>
          <p className="text-xs font-sans text-slate-400">
            Source: CommodityPriceAPI • Display Currency: {selectedCountry.country} ({selectedCountry.currency})
          </p>
        </div>

        <div className="text-left md:text-right">
          <div className="text-3xl font-bold text-slate-100 tracking-tight">
            {sym}{snapshot.lastPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className={`flex items-center md:justify-end space-x-1 text-sm font-bold mt-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{isPositive ? '+' : ''}{sym}{snapshot.change.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            <span>({isPositive ? '+' : ''}{snapshot.changePercent.toFixed(2)}%)</span>
          </div>
        </div>
      </div>

      {/* Historical Price Chart */}
      <PriceChart
        data={history}
        commodityName={`${snapshot.commodityName} (${selectedCountry.currency})`}
        activeTimeframe={timeframe}
        onTimeframeChange={setTimeframe}
      />

      {/* Contract Specification & Customer Pricing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {instrument && <ContractInfo instrument={instrument} />}
        {pricing && <PricingCalculation calculation={pricing} />}
      </div>

      {/* Data Disclaimer */}
      <div className="bg-[#090C12] border border-slate-800/80 p-4 rounded-lg flex items-center space-x-3 text-xs font-sans text-slate-400">
        <Info className="w-5 h-5 text-blue-400 shrink-0" />
        <p>
          Prototype data supplied by <strong>CommodityPriceAPI</strong>. Aggregated global commodity data, not an official MCX feed.
        </p>
      </div>
    </div>
  );
};
