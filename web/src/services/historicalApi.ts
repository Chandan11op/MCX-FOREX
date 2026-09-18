import { HistoricalDataPoint } from '../types/market';
import { generateHistoricalData } from '../data/demoMarketData';
import { fetchApi } from './api';

export const historicalApi = {
  getHistory: async (commoditySymbol: string, timeframe: string, quoteCurrency = 'INR'): Promise<HistoricalDataPoint[]> => {
    const fallback = generateHistoricalData(commoditySymbol, timeframe);
    return fetchApi<HistoricalDataPoint[]>(
      `/market/${commoditySymbol}/history?interval=${encodeURIComponent(timeframe)}&quote=${encodeURIComponent(quoteCurrency)}`,
      fallback
    );
  },
};
