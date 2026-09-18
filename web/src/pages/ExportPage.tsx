import React, { useState, useEffect } from 'react';
import { ExportForm } from '../components/export/ExportForm';
import { ExportPreview } from '../components/export/ExportPreview';
import { exportApi, ExportRequest } from '../services/exportApi';
import { historicalApi } from '../services/historicalApi';
import { pricingApi } from '../services/pricingApi';
import { HistoricalDataPoint } from '../types/market';
import { PricingCalculationResult } from '../types/pricing';
import { useCurrency } from '../context/CurrencyContext';

export const ExportPage: React.FC = () => {
  const { selectedCountry } = useCurrency();
  const [status, setStatus] = useState<'READY' | 'GENERATING' | 'COMPLETED' | 'FAILED'>('READY');
  const [commodity, setCommodity] = useState<string>('GOLD');
  const [data, setData] = useState<HistoricalDataPoint[]>([]);
  const [pricing, setPricing] = useState<PricingCalculationResult | null>(null);

  useEffect(() => {
    historicalApi.getHistory(commodity, '1M', selectedCountry.currency).then(setData);
    pricingApi.calculatePrice(commodity).then(setPricing);
  }, [commodity, selectedCountry]);

  const handleGenerate = async (req: ExportRequest) => {
    setCommodity(req.commodity);
    setStatus('GENERATING');
    try {
      await exportApi.triggerExport({
        ...req,
        quote: selectedCountry.currency,
      });
      setStatus('COMPLETED');
    } catch {
      setStatus('FAILED');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800/80 pb-3">
        <h2 className="text-lg font-bold font-mono text-slate-100 tracking-tight">
          MARKET DATA REPORT & XLSX EXPORT
        </h2>
        <p className="text-xs text-slate-400">
          Generate structured Excel (.xlsx) reports containing historical OHLCV data, volume, open interest, and derived customer prices
        </p>
      </div>

      <ExportForm onGenerate={handleGenerate} status={status} />

      {pricing && (
        <ExportPreview
          data={data}
          pricing={pricing}
          status={status}
          commoditySymbol={commodity}
        />
      )}
    </div>
  );
};
