import { Router, Request, Response } from 'express';
import { MarketDataEngine } from '@mcx/service-market-data';
import { CommodityCode, CandleInterval } from '@mcx/shared-types';
import { StorageEngine } from '../storage/Store.js';

export function createMarketRouter(engine: MarketDataEngine): Router {
  const router = Router();
  const storage = StorageEngine.getInstance();

  // GET /api/health
  router.get('/health', (req: Request, res: Response) => {
    const health = engine.getHealth();
    res.json({
      status: health.status === 'connected' ? 'healthy' : 'degraded',
      version: '1.0.0',
      timestamp: Date.now(),
      provider: health,
      storage: storage.getStatus(),
    });
  });

  // GET /api/market/status
  router.get('/market/status', (req: Request, res: Response) => {
    res.json({
      exchange: 'MCX',
      status: 'OPEN',
      tradingHours: '09:00 - 23:30 / 23:55 IST',
      serverTime: new Date().toISOString(),
      timestamp: Date.now(),
    });
  });

  // GET /api/commodities
  router.get('/commodities', (req: Request, res: Response) => {
    const snapshots = engine.getAllSnapshots();
    res.json(snapshots);
  });

  // GET /api/commodities/:commodity
  router.get('/commodities/:commodity', (req: Request, res: Response) => {
    const comm = req.params.commodity.toUpperCase() as CommodityCode;
    const snap = engine.getSnapshot(comm);
    if (!snap) {
      return res.status(404).json({ error: `Commodity ${req.params.commodity} not found` });
    }
    res.json(snap);
  });

  // GET /api/commodities/:commodity/candles
  router.get('/commodities/:commodity/candles', (req: Request, res: Response) => {
    const comm = req.params.commodity.toUpperCase() as CommodityCode;
    const interval = (req.query.interval as CandleInterval) || '1m';
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 60;

    const candles = engine.getCandles(comm, interval, limit);
    res.json(candles);
  });

  // GET /api/commodities/:commodity/sync (Offline Reconnect Reconciliation)
  router.get('/commodities/:commodity/sync', (req: Request, res: Response) => {
    const comm = req.params.commodity.toUpperCase() as CommodityCode;
    const sinceSeq = req.query.sinceSequence ? parseInt(req.query.sinceSequence as string, 10) : 0;
    const sinceTime = req.query.sinceTimestamp ? parseInt(req.query.sinceTimestamp as string, 10) : 0;
    const interval = (req.query.interval as CandleInterval) || '1m';

    const snap = engine.getSnapshot(comm);
    if (!snap) {
      return res.status(404).json({ error: `Commodity ${comm} not found` });
    }

    const candles = engine.getCandles(comm, interval, 60);

    res.json({
      commodity: comm,
      snapshot: snap,
      candles,
      currentSequence: snap.sequence,
      serverTimestamp: Date.now(),
      isStale: snap.status === 'STALE',
    });
  });

  return router;
}
