export interface CommodityDefinition {
  symbol: string;
  name: string;
  commodityKey: 'GOLD' | 'SILVER' | 'COPPER' | 'CRUDEOIL' | 'NATURALGAS';
  category: string;
  unit: string;
}

export interface MarketSnapshotNormalized {
  commoditySymbol: string;
  commodityName: string;
  contractName: string;
  expiryDate: string;
  unit: string;
  currency: string;
  currencySymbol: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  open: number | null;
  high: number | null;
  low: number | null;
  previousClose: number | null;
  volume: number | null;
  openInterest: number | null;
  tradingDate: string;
  source: string;
  dataMode: 'DEMO' | 'END_OF_DAY' | 'REALTIME';
  rawSymbol: string;
}

export interface HistoricalPointNormalized {
  timestamp: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  openInterest: number;
}

export interface ProviderStatusNormalized {
  source: string;
  provider: string;
  dataMode: string;
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'MAINTENANCE';
  lastUpdated: string;
  notice?: string;
  currency: string;
}

export interface MarketDataProvider {
  getProviderStatus(): Promise<ProviderStatusNormalized>;
  getSupportedCommodities(): Promise<CommodityDefinition[]>;
  getSnapshots(quoteCurrency?: string): Promise<Record<string, MarketSnapshotNormalized>>;
  getHistoricalData(commodityKey: string, timeframe: string, quoteCurrency?: string): Promise<HistoricalPointNormalized[]>;
}
