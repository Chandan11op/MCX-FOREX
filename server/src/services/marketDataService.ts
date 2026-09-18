import { CommodityPriceApiProvider } from '../providers/CommodityPriceApiProvider';
import { MarketDataProvider, MarketSnapshotNormalized, ProviderStatusNormalized, HistoricalPointNormalized } from '../providers/MarketDataProvider';

class MarketDataService {
  private provider: MarketDataProvider;
  private snapshotCache: Map<string, { timestamp: number; data: Record<string, MarketSnapshotNormalized> }> = new Map();
  private cacheTtlMs = 60000; // 60 seconds cache TTL

  constructor() {
    this.provider = new CommodityPriceApiProvider();
  }

  public async getProviderStatus(): Promise<ProviderStatusNormalized> {
    return this.provider.getProviderStatus();
  }

  public async getSnapshots(quoteCurrency = 'INR'): Promise<Record<string, MarketSnapshotNormalized>> {
    const key = quoteCurrency.toUpperCase();
    const now = Date.now();
    const cached = this.snapshotCache.get(key);

    if (cached && (now - cached.timestamp < this.cacheTtlMs)) {
      return cached.data;
    }

    const freshData = await this.provider.getSnapshots(key);
    this.snapshotCache.set(key, { timestamp: now, data: freshData });
    return freshData;
  }

  public async getHistoricalData(commodityKey: string, timeframe: string, quoteCurrency = 'INR'): Promise<HistoricalPointNormalized[]> {
    return this.provider.getHistoricalData(commodityKey, timeframe, quoteCurrency);
  }
}

export const marketDataService = new MarketDataService();
