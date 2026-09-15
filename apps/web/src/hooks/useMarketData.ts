import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { CanonicalTick, CommodityCode, MarketConnectionStatus, MarketSnapshot, ProviderHealthStatus } from '@mcx/shared-types';

export interface UseMarketDataReturn {
  snapshots: Record<CommodityCode, MarketSnapshot>;
  connectionStatus: MarketConnectionStatus;
  latencyMs: number;
  lastTickCommodity: CommodityCode | null;
  tickDirections: Record<CommodityCode, 'up' | 'down' | null>;
  health: ProviderHealthStatus | null;
  isSimulated: boolean;
  activeFilter: CommodityCode | 'ALL';
  setActiveFilter: (c: CommodityCode | 'ALL') => void;
  showCalculatedPrice: boolean;
  setShowCalculatedPrice: (val: boolean) => void;
  refreshSnapshot: () => Promise<void>;
}

const DEFAULT_COMMODITIES: CommodityCode[] = ['GOLD', 'SILVER', 'COPPER', 'CRUDE_OIL', 'NATURAL_GAS'];

export function useMarketData(): UseMarketDataReturn {
  const [snapshots, setSnapshots] = useState<Record<CommodityCode, MarketSnapshot>>({} as any);
  const [connectionStatus, setConnectionStatus] = useState<MarketConnectionStatus>('RECONNECTING');
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const [lastTickCommodity, setLastTickCommodity] = useState<CommodityCode | null>(null);
  const [tickDirections, setTickDirections] = useState<Record<CommodityCode, 'up' | 'down' | null>>({
    GOLD: null,
    SILVER: null,
    COPPER: null,
    CRUDE_OIL: null,
    NATURAL_GAS: null,
  });
  const [health, setHealth] = useState<ProviderHealthStatus | null>(null);
  const [activeFilter, setActiveFilter] = useState<CommodityCode | 'ALL'>('ALL');
  const [showCalculatedPrice, setShowCalculatedPrice] = useState<boolean>(false);

  const socketRef = useRef<Socket | null>(null);
  const lastSequences = useRef<Record<CommodityCode, number>>({} as any);
  const prevLtpRef = useRef<Record<CommodityCode, number>>({} as any);

  // Initial Snapshot fetch via REST
  const refreshSnapshot = useCallback(async () => {
    try {
      const res = await fetch('/api/commodities');
      if (res.ok) {
        const data: MarketSnapshot[] = await res.json();
        const map: Record<CommodityCode, MarketSnapshot> = {} as any;
        for (const snap of data) {
          map[snap.commodity] = snap;
          lastSequences.current[snap.commodity] = snap.sequence;
          prevLtpRef.current[snap.commodity] = snap.ltp;
        }
        setSnapshots(map);
        setConnectionStatus('LIVE');
      }
    } catch (err) {
      console.warn('[useMarketData] Snapshot fetch fallback failed:', err);
    }
  }, []);

  // Sync catchup after offline period
  const runOfflineSync = useCallback(async () => {
    setConnectionStatus('RECONNECTING');
    try {
      for (const comm of DEFAULT_COMMODITIES) {
        const seq = lastSequences.current[comm] || 0;
        const res = await fetch(`/api/commodities/${comm}/sync?sinceSequence=${seq}`);
        if (res.ok) {
          const syncData = await res.json();
          setSnapshots((prev) => ({
            ...prev,
            [comm]: syncData.snapshot,
          }));
          lastSequences.current[comm] = syncData.currentSequence;
        }
      }
      setConnectionStatus('LIVE');
    } catch (err) {
      console.error('[useMarketData] Sync failed:', err);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    refreshSnapshot();

    // Socket.IO connection
    const socket = io({
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectionStatus('LIVE');
      socket.emit('subscribe', { rooms: ['market:all'] });
    });

    socket.on('disconnect', () => {
      setConnectionStatus('RECONNECTING');
    });

    socket.on('connect_error', () => {
      setConnectionStatus('RECONNECTING');
    });

    socket.on('market:init', (data: { snapshots: MarketSnapshot[]; health: ProviderHealthStatus }) => {
      if (data.snapshots) {
        const map: Record<CommodityCode, MarketSnapshot> = {} as any;
        for (const snap of data.snapshots) {
          map[snap.commodity] = snap;
          lastSequences.current[snap.commodity] = snap.sequence;
          prevLtpRef.current[snap.commodity] = snap.ltp;
        }
        setSnapshots(map);
      }
      if (data.health) setHealth(data.health);
      setConnectionStatus('LIVE');
    });

    socket.on('market:tick', (tick: CanonicalTick) => {
      const prevLtp = prevLtpRef.current[tick.commodity] || tick.ltp;
      const direction = tick.ltp > prevLtp ? 'up' : tick.ltp < prevLtp ? 'down' : null;

      prevLtpRef.current[tick.commodity] = tick.ltp;
      lastSequences.current[tick.commodity] = tick.sequence;
      setLastTickCommodity(tick.commodity);

      if (direction) {
        setTickDirections((prev) => ({ ...prev, [tick.commodity]: direction }));
        setTimeout(() => {
          setTickDirections((prev) => ({ ...prev, [tick.commodity]: null }));
        }, 600);
      }

      setSnapshots((prev) => {
        const existing = prev[tick.commodity];
        const updated: MarketSnapshot = {
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
          calculatedPrice: existing?.calculatedPrice,
        };
        return { ...prev, [tick.commodity]: updated };
      });
    });

    socket.on('market:snapshot', (snap: MarketSnapshot) => {
      lastSequences.current[snap.commodity] = snap.sequence;
      setSnapshots((prev) => ({ ...prev, [snap.commodity]: snap }));
    });

    socket.on('market:status', (statusData: { commodity: CommodityCode; status: MarketConnectionStatus }) => {
      setSnapshots((prev) => {
        const existing = prev[statusData.commodity];
        if (!existing) return prev;
        return {
          ...prev,
          [statusData.commodity]: { ...existing, status: statusData.status },
        };
      });
    });

    // Latency Ping Interval
    const pingInterval = setInterval(() => {
      if (socket.connected) {
        const start = Date.now();
        socket.emit('ping:check', start);
      }
    }, 3000);

    socket.on('pong:ack', (ack: { clientTimestamp: number }) => {
      const rtt = Date.now() - ack.clientTimestamp;
      setLatencyMs(rtt);
    });

    // Browser Online/Offline listeners
    const handleOnline = () => {
      runOfflineSync();
    };
    const handleOffline = () => {
      setConnectionStatus('RECONNECTING');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(pingInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      socket.disconnect();
    };
  }, [refreshSnapshot, runOfflineSync]);

  const isSimulated = health?.providerId === 'mock' || !health?.providerId;

  return {
    snapshots,
    connectionStatus,
    latencyMs,
    lastTickCommodity,
    tickDirections,
    health,
    isSimulated,
    activeFilter,
    setActiveFilter,
    showCalculatedPrice,
    setShowCalculatedPrice,
    refreshSnapshot,
  };
}
