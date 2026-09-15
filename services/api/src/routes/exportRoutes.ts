import { Router, Request, Response } from 'express';
import { MarketDataEngine } from '@mcx/service-market-data';
import { generateMarketDataWorkbook } from '@mcx/service-export';
import { CommodityCode, CandleInterval } from '@mcx/shared-types';

interface ExportJob {
  id: string;
  buffer: Buffer;
  createdAt: number;
}

const exportJobs = new Map<string, ExportJob>();

export function createExportRouter(engine: MarketDataEngine): Router {
  const router = Router();

  // POST /api/export
  router.post('/', (req: Request, res: Response) => {
    try {
      const { commodity, interval, includeCalculatedPrices } = req.body;

      let snapshots = engine.getAllSnapshots();
      if (commodity && commodity !== 'ALL') {
        const single = engine.getSnapshot(commodity.toUpperCase() as CommodityCode);
        snapshots = single ? [single] : [];
      }

      let candles = undefined;
      if (commodity && commodity !== 'ALL') {
        candles = engine.getCandles(commodity.toUpperCase() as CommodityCode, (interval as CandleInterval) || '1m', 100);
      }

      const buffer = generateMarketDataWorkbook({
        snapshots,
        candles,
        includeCalculatedPrices: includeCalculatedPrices !== false,
      });

      const jobId = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      exportJobs.set(jobId, {
        id: jobId,
        buffer,
        createdAt: Date.now(),
      });

      // Bound memory for exported jobs
      if (exportJobs.size > 50) {
        const oldestKey = exportJobs.keys().next().value;
        if (oldestKey) exportJobs.delete(oldestKey);
      }

      res.status(201).json({
        jobId,
        status: 'completed',
        downloadUrl: `/api/export/download/${jobId}`,
        createdAt: Date.now(),
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to generate export', details: err.message });
    }
  });

  // GET /api/export/download/:jobId
  router.get('/download/:jobId', (req: Request, res: Response) => {
    const job = exportJobs.get(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Export file not found or expired' });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="MCX_Market_Data_${req.params.jobId}.xlsx"`);
    res.send(job.buffer);
  });

  return router;
}
