import {
  CanonicalTick,
  CommodityCode,
  HistoricalCandle,
  HistoricalRequest,
  InstrumentSubscription,
  MarketConnectionStatus,
  MarketSnapshot,
  PricingRule,
  ProviderHealthStatus,
  CandleInterval,
} from '@mcx/shared-types';
import { calculateDisplayPrice, DEFAULT_PRICING_RULES } from '@mcx/shared-utils';
import { MarketDataProvider } from '../providers/MarketDataProvider.js';
import { MockProvider } from '../providers/MockProvider.js';
import { UpstoxProvider } from '../providers/UpstoxProvider.js';

export type EngineTickListener = (tick: CanonicalTick) => void;
export type EngineSnapshotListener = (snapshot: MarketSnapshot) => void;
export type EngineCandleListener = (candle: HistoricalCandle) => void;
export type EngineStatusListener = (status: { commodity: CommodityCode; status: MarketConnectionStatus }) => void;

interface CandleAccumulator {
  interval: CandleInterval;
  intervalMs: number;
  currentBucket: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class MarketDataEngine {
  private provider: MarketDataProvider;
  private snapshots: Map<CommodityCode, MarketSnapshot> = new Map();
  private candleHistory: Map<string, HistoricalCandle[]> = new Map(); // key: `${commodity}_${interval}`
  private candleAccumulators: Map<string, CandleAccumulator> = new Map();
  private pricingRules: Map<CommodityCode, PricingRule> = new Map();

  private tickListeners: EngineTickListener[] = [];
  private snapshotListeners: EngineSnapshotListener[] = [];
  private candleListeners: EngineCandleListener[] = [];
  private statusListeners: EngineStatusListener[] = [];

  private staleCheckTimer: NodeJS.Timeout | null = null;
  private staleThresholdMs: number;
  private sequenceCounter = 0;

  constructor(providerType?: string, staleThresholdMs: number = 5000) {
    this.staleThresholdMs = staleThresholdMs;

    const chosenProvider = providerType || process.env.DATA_PROVIDER || 'mock';
    if (chosenProvider === 'upstox') {
      this.provider = new UpstoxProvider();
    } else {
      this.provider = new MockProvider();
    }

    // Load initial default pricing rules
    for (const [code, rule] of Object.entries(DEFAULT_PRICING_RULES)) {
      this.pricingRules.set(code as CommodityCode, rule);
    }

    this.provider.onTick((tick) => this.handleIncomingTick(tick));
  }

  public async start(): Promise<void> {
    await this.provider.connect();

    // Default subscriptions for 5 MCX commodities
    const initialSubs: InstrumentSubscription[] = [
      { commodity: 'GOLD', underlying: 'GOLD', exchange: 'MCX', contractStrategy: 'nearest_active' },
      { commodity: 'SILVER', underlying: 'SILVER', exchange: 'MCX', contractStrategy: 'nearest_active' },
      { commodity: 'COPPER', underlying: 'COPPER', exchange: 'MCX', contractStrategy: 'nearest_active' },
      { commodity: 'CRUDE_OIL', underlying: 'CRUDEOIL', exchange: 'MCX', contractStrategy: 'nearest_active' },
      { commodity: 'NATURAL_GAS', underlying: 'NATURALGAS', exchange: 'MCX', contractStrategy: 'nearest_active' },
    ];
    await this.provider.subscribe(initialSubs);

    // Initial snapshots
    const initialSnapshots = await this.provider.getSnapshot(initialSubs);
    for (const snap of initialSnapshots) {
      this.enrichSnapshotWithPricing(snap);
      this.snapshots.set(snap.commodity, snap);
    }

    // Seed historical candles for all intervals
    await this.seedHistoricalCandles();

    // Start stale detection monitor
    this.startStaleMonitor();
  }

  public async stop(): Promise<void> {
    if (this.staleCheckTimer) {
      clearInterval(this.staleCheckTimer);
      this.staleCheckTimer = null;
    }
    await this.provider.disconnect();
  }

  private async seedHistoricalCandles(): Promise<void> {
    const commodities: CommodityCode[] = ['GOLD', 'SILVER', 'COPPER', 'CRUDE_OIL', 'NATURAL_GAS'];
    const intervals: CandleInterval[] = ['1m', '5m', '15m', '30m', '1h', '1d'];

    for (const comm of commodities) {
      for (const intv of intervals) {
        const candles = await this.provider.getHistorical({
          commodity: comm,
          interval: intv,
          from: Date.now() - 24 * 60 * 60 * 1000,
          to: Date.now(),
          limit: 60,
        });
        const key = `${comm}_${intv}`;
        this.candleHistory.set(key, candles);
      }
    }
  }

  private handleIncomingTick(tick: CanonicalTick): void {
    this.sequenceCounter++;
    tick.sequence = this.sequenceCounter;

    // Update Snapshot
    const activeRule = this.pricingRules.get(tick.commodity);
    const calculatedPrice = calculateDisplayPrice(tick.ltp, activeRule, tick.commodity);

    const snapshot: MarketSnapshot = {
      commodity: tick.commodity,
      tradingSymbol: tick.tradingSymbol,
      instrumentId: tick.instrumentId,
      exchange: tick.exchange,
      expiry: tick.expiry,
      ltp: tick.ltp,
      ltq: tick.ltq,
      bid: tick.bid,
      ask: tick.ask,
      bidQty: tick.bidQty,
      askQty: tick.askQty,
      open: tick.open,
      high: tick.high,
      low: tick.low,
      close: tick.close,
      prevClose: tick.prevClose,
      change: tick.change,
      changePercent: tick.changePercent,
      volume: tick.volume,
      openInterest: tick.openInterest,
      lastUpdate: tick.timestamp,
      sequence: tick.sequence,
      status: 'LIVE',
      calculatedPrice,
    };

    this.snapshots.set(tick.commodity, snapshot);

    // Aggregate into Candles
    this.updateCandles(tick);

    // Notify listeners
    for (const l of this.tickListeners) l(tick);
    for (const l of this.snapshotListeners) l(snapshot);
  }

  private enrichSnapshotWithPricing(snapshot: MarketSnapshot): void {
    const activeRule = this.pricingRules.get(snapshot.commodity);
    snapshot.calculatedPrice = calculateDisplayPrice(snapshot.ltp, activeRule, snapshot.commodity);
  }

  private updateCandles(tick: CanonicalTick): void {
    const intervals: { interval: CandleInterval; ms: number }[] = [
      { interval: '1m', ms: 60 * 1000 },
      { interval: '5m', ms: 5 * 60 * 1000 },
      { interval: '15m', ms: 15 * 60 * 1000 },
      { interval: '30m', ms: 30 * 60 * 1000 },
      { interval: '1h', ms: 60 * 60 * 1000 },
      { interval: '1d', ms: 24 * 60 * 60 * 1000 },
    ];

    for (const { interval, ms } of intervals) {
      const key = `${tick.commodity}_${interval}`;
      const bucket = Math.floor(tick.timestamp / ms) * ms;

      let acc = this.candleAccumulators.get(key);
      if (!acc || acc.currentBucket !== bucket) {
        // Close previous candle and store in history
        if (acc) {
          const closedCandle: HistoricalCandle = {
            commodity: tick.commodity,
            interval: acc.interval,
            timestamp: acc.currentBucket,
            open: acc.open,
            high: acc.high,
            low: acc.low,
            close: acc.close,
            volume: acc.volume,
          };
          this.pushCandleHistory(key, closedCandle);
          for (const l of this.candleListeners) l(closedCandle);
        }

        // Initialize new accumulator
        acc = {
          interval,
          intervalMs: ms,
          currentBucket: bucket,
          open: tick.ltp,
          high: tick.ltp,
          low: tick.ltp,
          close: tick.ltp,
          volume: tick.ltq,
        };
        this.candleAccumulators.set(key, acc);
      } else {
        // Update current candle
        if (tick.ltp > acc.high) acc.high = tick.ltp;
        if (tick.ltp < acc.low) acc.low = tick.ltp;
        acc.close = tick.ltp;
        acc.volume += tick.ltq;
      }
    }
  }

  private pushCandleHistory(key: string, candle: HistoricalCandle): void {
    let list = this.candleHistory.get(key);
    if (!list) {
      list = [];
      this.candleHistory.set(key, list);
    }
    list.push(candle);
    if (list.length > 500) {
      list.shift(); // Bound memory retention
    }
  }

  private startStaleMonitor(): void {
    this.staleCheckTimer = setInterval(() => {
      const now = Date.now();
      for (const [code, snap] of this.snapshots.entries()) {
        if (now - snap.lastUpdate > this.staleThresholdMs && snap.status === 'LIVE') {
          snap.status = 'STALE';
          for (const l of this.statusListeners) {
            l({ commodity: code, status: 'STALE' });
          }
          for (const l of this.snapshotListeners) {
            l(snap);
          }
        }
      }
    }, 1000);
  }

  // Public Accessors
  public getAllSnapshots(): MarketSnapshot[] {
    return Array.from(this.snapshots.values());
  }

  public getSnapshot(commodity: CommodityCode): MarketSnapshot | undefined {
    return this.snapshots.get(commodity);
  }

  public getCandles(commodity: CommodityCode, interval: CandleInterval = '1m', limit: number = 60): HistoricalCandle[] {
    const key = `${commodity}_${interval}`;
    const list = this.candleHistory.get(key) || [];
    const acc = this.candleAccumulators.get(key);

    const result = [...list];
    if (acc) {
      result.push({
        commodity,
        interval,
        timestamp: acc.currentBucket,
        open: acc.open,
        high: acc.high,
        low: acc.low,
        close: acc.close,
        volume: acc.volume,
      });
    }
    return result.slice(-limit);
  }

  public updatePricingRule(rule: PricingRule): void {
    this.pricingRules.set(rule.commodity, rule);
    const snap = this.snapshots.get(rule.commodity);
    if (snap) {
      this.enrichSnapshotWithPricing(snap);
      for (const l of this.snapshotListeners) l(snap);
    }
  }

  public getPricingRules(): PricingRule[] {
    return Array.from(this.pricingRules.values());
  }

  public getHealth(): ProviderHealthStatus {
    return this.provider.getHealth();
  }

  public onTick(l: EngineTickListener): void {
    this.tickListeners.push(l);
  }

  public onSnapshot(l: EngineSnapshotListener): void {
    this.snapshotListeners.push(l);
  }

  public onCandle(l: EngineCandleListener): void {
    this.candleListeners.push(l);
  }

  public onStatus(l: EngineStatusListener): void {
    this.statusListeners.push(l);
  }
}
