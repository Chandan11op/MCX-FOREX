import {
  CanonicalTick,
  InstrumentSubscription,
  MarketSnapshot,
  HistoricalCandle,
  HistoricalRequest,
  ProviderHealthStatus,
} from '@mcx/shared-types';

export type TickHandler = (tick: CanonicalTick) => void;
export type StatusHandler = (status: 'connected' | 'reconnecting' | 'disconnected' | 'error', error?: string) => void;

export interface MarketDataProvider {
  id: string;
  name: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  subscribe(instruments: InstrumentSubscription[]): Promise<void>;
  unsubscribe(instruments: InstrumentSubscription[]): Promise<void>;
  onTick(callback: TickHandler): void;
  onStatusChange?(callback: StatusHandler): void;
  getSnapshot(instruments: InstrumentSubscription[]): Promise<MarketSnapshot[]>;
  getHistorical(req: HistoricalRequest): Promise<HistoricalCandle[]>;
  getHealth(): ProviderHealthStatus;
}
