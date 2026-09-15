export type CommodityCode =
  | 'GOLD'
  | 'SILVER'
  | 'COPPER'
  | 'CRUDE_OIL'
  | 'NATURAL_GAS';

export type ExchangeCode = 'MCX';

export type MarketConnectionStatus =
  | 'LIVE'
  | 'STALE'
  | 'RECONNECTING'
  | 'MARKET_CLOSED'
  | 'DATA_UNAVAILABLE';

export type DataAccessMode = 'prototype' | 'licensed_production';

export type CandleInterval = '1m' | '5m' | '15m' | '30m' | '1h' | '1d';

export interface CanonicalTick {
  eventId: string;
  provider: string;
  exchange: ExchangeCode;
  segment: string;
  instrumentId: string;
  commodity: CommodityCode;
  tradingSymbol: string;
  expiry: string;
  timestamp: number;
  ltp: number;
  ltq: number;
  bid: number;
  ask: number;
  bidQty: number;
  askQty: number;
  open: number;
  high: number;
  low: number;
  close: number;
  prevClose: number;
  change: number;
  changePercent: number;
  volume: number;
  openInterest: number;
  sourceTimestamp: number;
  receivedTimestamp: number;
  sequence: number;
}

export interface MarketSnapshot {
  commodity: CommodityCode;
  tradingSymbol: string;
  instrumentId: string;
  exchange: ExchangeCode;
  expiry: string;
  ltp: number;
  ltq: number;
  bid: number;
  ask: number;
  bidQty: number;
  askQty: number;
  open: number;
  high: number;
  low: number;
  close: number;
  prevClose: number;
  change: number;
  changePercent: number;
  volume: number;
  openInterest: number;
  lastUpdate: number;
  sequence: number;
  status: MarketConnectionStatus;
  calculatedPrice?: CalculatedPrice;
}

export interface HistoricalCandle {
  commodity: CommodityCode;
  interval: CandleInterval;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  openInterest?: number;
}

export interface InstrumentSubscription {
  commodity: CommodityCode;
  underlying: string;
  exchange: ExchangeCode;
  contractStrategy: 'nearest_active' | 'next_active' | 'specific';
  specificTradingSymbol?: string;
  instrumentId?: string;
}

export interface PricingRule {
  id: string;
  commodity: CommodityCode;
  effectiveFrom: string;
  effectiveTo?: string;
  gstRate: number;        // in % (e.g. 3.0)
  customDutyRate: number; // in % (e.g. 6.0)
  otherCharges: number;   // in currency units (e.g. ₹50)
  formulaVersion: string; // e.g. "v1.0"
  updatedBy: string;
  updatedAt: string;
}

export interface CalculatedPrice {
  commodity: CommodityCode;
  exchangePrice: number;
  customDutyRate: number;
  customDutyAmount: number;
  gstRate: number;
  gstAmount: number;
  otherCharges: number;
  displayPrice: number;
  formulaVersion: string;
  ruleId: string;
  calculatedAt: number;
}

export interface ProviderHealthStatus {
  providerId: string;
  providerName: string;
  status: 'connected' | 'reconnecting' | 'disconnected' | 'error';
  latencyMs: number;
  messagesPerSec: number;
  subscribedCount: number;
  totalTicksReceived: number;
  reconnectCount: number;
  lastTickTimestamp: number;
  lastError?: string;
  dataAccessMode: DataAccessMode;
}

export interface SyncRequest {
  commodity: CommodityCode;
  sinceSequence?: number;
  sinceTimestamp?: number;
  interval?: CandleInterval;
}

export interface SyncResponse {
  commodity: CommodityCode;
  snapshot: MarketSnapshot;
  candles: HistoricalCandle[];
  currentSequence: number;
  serverTimestamp: number;
  isStale: boolean;
}

export interface ExportRequest {
  commodity?: CommodityCode | 'ALL';
  interval?: CandleInterval;
  startDate?: string;
  endDate?: string;
  includeCalculatedPrices?: boolean;
}

export interface ExportJobStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  rowCount?: number;
  createdAt: number;
  error?: string;
}

export interface HistoricalRequest {
  commodity: CommodityCode;
  interval: CandleInterval;
  from: number;
  to: number;
  limit?: number;
}
