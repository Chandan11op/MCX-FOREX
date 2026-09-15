import {
  CanonicalTick,
  CommodityCode,
  HistoricalCandle,
  HistoricalRequest,
  InstrumentSubscription,
  MarketSnapshot,
  ProviderHealthStatus,
} from '@mcx/shared-types';
import { MarketDataProvider, TickHandler, StatusHandler } from './MarketDataProvider.js';

interface CommoditySimState {
  code: CommodityCode;
  tradingSymbol: string;
  instrumentId: string;
  expiry: string;
  basePrice: number;
  currentPrice: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  volume: number;
  openInterest: number;
  spread: number;
  volatility: number;
  tickSize: number;
}

export class MockProvider implements MarketDataProvider {
  public id = 'mock';
  public name = 'Simulated MCX Market Feed';

  private isConnected = false;
  private timer: NodeJS.Timeout | null = null;
  private tickHandlers: TickHandler[] = [];
  private statusHandlers: StatusHandler[] = [];
  private subscriptions: Set<CommodityCode> = new Set();
  private sequence = 0;
  private totalTicksReceived = 0;
  private startTime = Date.now();
  private lastTickTime = 0;
  private reconnectCount = 0;

  private state: Map<CommodityCode, CommoditySimState> = new Map();

  constructor() {
    this.initializeState();
  }

  private initializeState(): void {
    const nextExpiry = this.getNextExpiry();
    const commodities: {
      code: CommodityCode;
      symbol: string;
      id: string;
      basePrice: number;
      volatility: number;
      tickSize: number;
      spread: number;
    }[] = [
      {
        code: 'GOLD',
        symbol: 'GOLD26OCTFUT',
        id: 'MCX:GOLD-26OCTFUT',
        basePrice: 72450.0,
        volatility: 12.0,
        tickSize: 1.0,
        spread: 4.0,
      },
      {
        code: 'SILVER',
        symbol: 'SILVER26DECFUT',
        id: 'MCX:SILVER-26DECFUT',
        basePrice: 84200.0,
        volatility: 25.0,
        tickSize: 1.0,
        spread: 8.0,
      },
      {
        code: 'COPPER',
        symbol: 'COPPER26NOVFUT',
        id: 'MCX:COPPER-26NOVFUT',
        basePrice: 812.5,
        volatility: 0.75,
        tickSize: 0.05,
        spread: 0.2,
      },
      {
        code: 'CRUDE_OIL',
        symbol: 'CRUDEOIL26OCTFUT',
        id: 'MCX:CRUDEOIL-26OCTFUT',
        basePrice: 6150.0,
        volatility: 4.5,
        tickSize: 1.0,
        spread: 2.0,
      },
      {
        code: 'NATURAL_GAS',
        symbol: 'NATURALGAS26OCTFUT',
        id: 'MCX:NATURALGAS-26OCTFUT',
        basePrice: 245.8,
        volatility: 0.6,
        tickSize: 0.1,
        spread: 0.2,
      },
    ];

    for (const c of commodities) {
      const open = c.basePrice;
      this.state.set(c.code, {
        code: c.code,
        tradingSymbol: c.symbol,
        instrumentId: c.id,
        expiry: nextExpiry,
        basePrice: c.basePrice,
        currentPrice: c.basePrice,
        open,
        high: open,
        low: open,
        prevClose: Number((open * (1 + (Math.random() * 0.01 - 0.005))).toFixed(2)),
        volume: Math.floor(Math.random() * 5000) + 1000,
        openInterest: Math.floor(Math.random() * 12000) + 5000,
        spread: c.spread,
        volatility: c.volatility,
        tickSize: c.tickSize,
      });
      // Default subscribe to all 5
      this.subscriptions.add(c.code);
    }
  }

  private getNextExpiry(): string {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(28);
    return d.toISOString().split('T')[0];
  }

  public async connect(): Promise<void> {
    if (this.isConnected) return;
    this.isConnected = true;
    this.startTime = Date.now();
    this.notifyStatus('connected');

    // Start emitting simulated ticks at random realistic frequencies (100ms - 400ms)
    this.scheduleNextTick();
  }

  public async disconnect(): Promise<void> {
    this.isConnected = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.notifyStatus('disconnected');
  }

  public async subscribe(instruments: InstrumentSubscription[]): Promise<void> {
    for (const inst of instruments) {
      this.subscriptions.add(inst.commodity);
    }
  }

  public async unsubscribe(instruments: InstrumentSubscription[]): Promise<void> {
    for (const inst of instruments) {
      this.subscriptions.delete(inst.commodity);
    }
  }

  public onTick(callback: TickHandler): void {
    this.tickHandlers.push(callback);
  }

  public onStatusChange(callback: StatusHandler): void {
    this.statusHandlers.push(callback);
  }

  private notifyStatus(status: 'connected' | 'reconnecting' | 'disconnected' | 'error', err?: string): void {
    for (const h of this.statusHandlers) {
      h(status, err);
    }
  }

  private scheduleNextTick(): void {
    if (!this.isConnected) return;
    const interval = Math.floor(Math.random() * 250) + 100; // 100-350ms
    this.timer = setTimeout(() => {
      this.generateSimulatedTick();
      this.scheduleNextTick();
    }, interval);
  }

  private generateSimulatedTick(): void {
    if (!this.isConnected || this.subscriptions.size === 0) return;

    // Pick 1 or 2 random commodities from active subscriptions
    const subList = Array.from(this.subscriptions);
    const chosenCode = subList[Math.floor(Math.random() * subList.length)];
    const sim = this.state.get(chosenCode);
    if (!sim) return;

    // Simulate price fluctuation with mean reversion to basePrice
    const meanReversion = (sim.basePrice - sim.currentPrice) * 0.05;
    const randomShock = (Math.random() - 0.49) * sim.volatility;
    let delta = meanReversion + randomShock;
    delta = Math.round(delta / sim.tickSize) * sim.tickSize;

    sim.currentPrice = Number(Math.max(sim.tickSize, sim.currentPrice + delta).toFixed(2));
    if (sim.currentPrice > sim.high) sim.high = sim.currentPrice;
    if (sim.currentPrice < sim.low) sim.low = sim.currentPrice;

    const tickQty = Math.floor(Math.random() * 5) + 1;
    sim.volume += tickQty;
    sim.openInterest += Math.floor((Math.random() - 0.48) * 3);

    const halfSpread = sim.spread / 2;
    const bid = Number((sim.currentPrice - halfSpread).toFixed(2));
    const ask = Number((sim.currentPrice + halfSpread).toFixed(2));
    const bidQty = Math.floor(Math.random() * 20) + 1;
    const askQty = Math.floor(Math.random() * 20) + 1;

    const change = Number((sim.currentPrice - sim.prevClose).toFixed(2));
    const changePercent = Number(((change / sim.prevClose) * 100).toFixed(2));

    this.sequence++;
    this.totalTicksReceived++;
    const now = Date.now();
    this.lastTickTime = now;

    const tick: CanonicalTick = {
      eventId: `mock_evt_${this.sequence}_${now}`,
      provider: 'mock',
      exchange: 'MCX',
      segment: 'MCX_FO',
      instrumentId: sim.instrumentId,
      commodity: sim.code,
      tradingSymbol: sim.tradingSymbol,
      expiry: sim.expiry,
      timestamp: now,
      ltp: sim.currentPrice,
      ltq: tickQty,
      bid,
      ask,
      bidQty,
      askQty,
      open: sim.open,
      high: sim.high,
      low: sim.low,
      close: sim.currentPrice,
      prevClose: sim.prevClose,
      change,
      changePercent,
      volume: sim.volume,
      openInterest: Math.max(0, sim.openInterest),
      sourceTimestamp: now - Math.floor(Math.random() * 15),
      receivedTimestamp: now,
      sequence: this.sequence,
    };

    for (const h of this.tickHandlers) {
      h(tick);
    }
  }

  public async getSnapshot(instruments: InstrumentSubscription[]): Promise<MarketSnapshot[]> {
    const snapshots: MarketSnapshot[] = [];
    const targetCodes = instruments.length > 0
      ? instruments.map(i => i.commodity)
      : Array.from(this.state.keys());

    for (const code of targetCodes) {
      const sim = this.state.get(code);
      if (!sim) continue;
      const halfSpread = sim.spread / 2;
      const change = Number((sim.currentPrice - sim.prevClose).toFixed(2));
      const changePercent = Number(((change / sim.prevClose) * 100).toFixed(2));

      snapshots.push({
        commodity: sim.code,
        tradingSymbol: sim.tradingSymbol,
        instrumentId: sim.instrumentId,
        exchange: 'MCX',
        expiry: sim.expiry,
        ltp: sim.currentPrice,
        ltq: 1,
        bid: Number((sim.currentPrice - halfSpread).toFixed(2)),
        ask: Number((sim.currentPrice + halfSpread).toFixed(2)),
        bidQty: 10,
        askQty: 10,
        open: sim.open,
        high: sim.high,
        low: sim.low,
        close: sim.currentPrice,
        prevClose: sim.prevClose,
        change,
        changePercent,
        volume: sim.volume,
        openInterest: sim.openInterest,
        lastUpdate: this.lastTickTime || Date.now(),
        sequence: this.sequence,
        status: this.isConnected ? 'LIVE' : 'RECONNECTING',
      });
    }

    return snapshots;
  }

  public async getHistorical(req: HistoricalRequest): Promise<HistoricalCandle[]> {
    const sim = this.state.get(req.commodity);
    const base = sim ? sim.basePrice : 1000;
    const candles: HistoricalCandle[] = [];
    const count = req.limit || 50;

    let intervalMs = 60 * 1000; // 1m default
    if (req.interval === '5m') intervalMs = 5 * 60 * 1000;
    else if (req.interval === '15m') intervalMs = 15 * 60 * 1000;
    else if (req.interval === '30m') intervalMs = 30 * 60 * 1000;
    else if (req.interval === '1h') intervalMs = 60 * 60 * 1000;
    else if (req.interval === '1d') intervalMs = 24 * 60 * 60 * 1000;

    const now = Date.now();
    let current = base * (1 + (Math.random() * 0.02 - 0.01));

    for (let i = count; i >= 0; i--) {
      const time = now - i * intervalMs;
      const step = (Math.random() - 0.49) * (sim ? sim.volatility * 2 : 5);
      const open = Number(current.toFixed(2));
      const close = Number(Math.max(1, current + step).toFixed(2));
      const high = Number(Math.max(open, close, open + Math.random() * 5).toFixed(2));
      const low = Number(Math.min(open, close, open - Math.random() * 5).toFixed(2));
      const volume = Math.floor(Math.random() * 500) + 50;
      candles.push({
        commodity: req.commodity,
        interval: req.interval,
        timestamp: time,
        open,
        high,
        low,
        close,
        volume,
      });
      current = close;
    }

    return candles;
  }

  public getHealth(): ProviderHealthStatus {
    const elapsedSec = Math.max(1, (Date.now() - this.startTime) / 1000);
    const msgsPerSec = Number((this.totalTicksReceived / elapsedSec).toFixed(1));
    return {
      providerId: this.id,
      providerName: this.name,
      status: this.isConnected ? 'connected' : 'disconnected',
      latencyMs: Math.floor(Math.random() * 15) + 5,
      messagesPerSec: msgsPerSec,
      subscribedCount: this.subscriptions.size,
      totalTicksReceived: this.totalTicksReceived,
      reconnectCount: this.reconnectCount,
      lastTickTimestamp: this.lastTickTime,
      dataAccessMode: 'prototype',
    };
  }
}
