export interface Commodity {
  id: string;
  name: string;
  symbol: string;
  category: string;
  unit: string;
  currency: string;
  active: boolean;
}

export interface Instrument {
  id: string;
  symbol: string;
  commoditySymbol: string;
  exchange: string;
  contractName: string;
  expiryDate: string;
  unit: string;
  tickSize: number;
  lotSize: number;
  status: 'ACTIVE' | 'EXPIRED' | 'UPCOMING';
}

export interface MarketSnapshot {
  commoditySymbol: string;
  commodityName: string;
  contractName: string;
  expiryDate: string;
  unit: string;
  currency?: string;
  currencySymbol?: string;
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
  dataMode: string;
}

export interface HistoricalDataPoint {
  timestamp: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  openInterest: number;
}
