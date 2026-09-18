import { fetchApi } from './api';
import { Commodity, Instrument, MarketSnapshot } from '../types/market';
import { ProviderStatus } from '../types/provider';
import { DEMO_COMMODITIES, DEMO_INSTRUMENTS, DEMO_SNAPSHOTS } from '../data/demoMarketData';

export const marketApi = {
  getProviderStatus: async (): Promise<ProviderStatus> => {
    return fetchApi<ProviderStatus>('/provider/status', {
      source: 'COMMODITYPRICEAPI',
      provider: 'commoditypriceapi',
      dataMode: 'DEMO / GLOBAL COMMODITY DATA',
      status: 'AVAILABLE',
      lastUpdated: new Date().toLocaleString(),
      notice: 'Prototype data supplied by CommodityPriceAPI. Aggregated global commodity data, not an official MCX feed.',
    });
  },

  getCommodities: async (): Promise<Commodity[]> => {
    return fetchApi<Commodity[]>('/commodities', DEMO_COMMODITIES);
  },

  getInstruments: async (): Promise<Instrument[]> => {
    return fetchApi<Instrument[]>('/instruments', DEMO_INSTRUMENTS);
  },

  getSnapshots: async (quoteCurrency = 'INR'): Promise<Record<string, MarketSnapshot>> => {
    return fetchApi<Record<string, MarketSnapshot>>(`/market/snapshot?quote=${encodeURIComponent(quoteCurrency)}`, DEMO_SNAPSHOTS);
  },

  getCommoditySnapshot: async (symbol: string, quoteCurrency = 'INR'): Promise<MarketSnapshot | null> => {
    const formattedSymbol = symbol.toUpperCase().replace('-', '');
    return fetchApi<MarketSnapshot>(`/market/${formattedSymbol}?quote=${encodeURIComponent(quoteCurrency)}`, DEMO_SNAPSHOTS[formattedSymbol] || DEMO_SNAPSHOTS.GOLD);
  },
};
