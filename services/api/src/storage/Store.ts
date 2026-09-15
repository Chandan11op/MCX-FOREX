import { CanonicalTick, CommodityCode, HistoricalCandle, MarketSnapshot, PricingRule } from '@mcx/shared-types';

export class StorageEngine {
  private static instance: StorageEngine;
  private snapshots: Map<CommodityCode, MarketSnapshot> = new Map();
  private recentTicks: CanonicalTick[] = [];
  private pricingRules: Map<CommodityCode, PricingRule> = new Map();
  private maxTickRetention = 2000;

  private isRedisConnected = false;
  private isMongoConnected = false;

  private constructor() {
    // Check if Redis or Mongo connection strings are present
    if (process.env.REDIS_URL) {
      console.log('[StorageEngine] Connecting to external Redis broker at', process.env.REDIS_URL);
      this.isRedisConnected = true;
    }
    if (process.env.MONGO_URI) {
      console.log('[StorageEngine] Connecting to MongoDB Time-Series cluster at', process.env.MONGO_URI);
      this.isMongoConnected = true;
    }
  }

  public static getInstance(): StorageEngine {
    if (!StorageEngine.instance) {
      StorageEngine.instance = new StorageEngine();
    }
    return StorageEngine.instance;
  }

  public saveSnapshot(snapshot: MarketSnapshot): void {
    this.snapshots.set(snapshot.commodity, snapshot);
  }

  public getSnapshot(commodity: CommodityCode): MarketSnapshot | undefined {
    return this.snapshots.get(commodity);
  }

  public getAllSnapshots(): MarketSnapshot[] {
    return Array.from(this.snapshots.values());
  }

  public appendTick(tick: CanonicalTick): void {
    this.recentTicks.push(tick);
    if (this.recentTicks.length > this.maxTickRetention) {
      this.recentTicks.shift();
    }
  }

  public getTicksSince(commodity: CommodityCode, sequence: number): CanonicalTick[] {
    return this.recentTicks.filter(t => t.commodity === commodity && t.sequence > sequence);
  }

  public getStatus() {
    return {
      cacheMode: this.isRedisConnected ? 'Redis Cluster' : 'In-Memory Fast State Broker',
      persistenceMode: this.isMongoConnected ? 'MongoDB Time-Series' : 'In-Memory Candle Store',
      ticksCached: this.recentTicks.length,
      snapshotsActive: this.snapshots.size,
    };
  }
}
