export type ProviderStatusType = 'AVAILABLE' | 'UNAVAILABLE' | 'MAINTENANCE';

export interface ProviderStatus {
  source: string; // e.g. "COMMODITYPRICEAPI", "MCX"
  provider: string; // e.g. "commoditypriceapi", "mcx-bhavcopy"
  dataMode: string; // e.g. "DEMO / GLOBAL COMMODITY DATA", "END OF DAY"
  status: ProviderStatusType;
  lastUpdated: string;
  notice?: string;
  currency?: string;
}

export type ConnectionState = 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED' | 'STALE';
