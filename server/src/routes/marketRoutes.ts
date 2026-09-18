import { Router, Request, Response } from 'express';
import { marketDataService } from '../services/marketDataService';
import * as XLSX from 'xlsx';

const router = Router();

router.get('/provider/status', async (req: Request, res: Response) => {
  try {
    const status = await marketDataService.getProviderStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch provider status' });
  }
});

router.get('/market/snapshot', async (req: Request, res: Response) => {
  try {
    const quote = (req.query.quote as string) || 'INR';
    const snapshots = await marketDataService.getSnapshots(quote);
    res.json(snapshots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch market snapshot' });
  }
});

router.get('/market/:commodity', async (req: Request, res: Response) => {
  try {
    const commodity = req.params.commodity.toUpperCase();
    const quote = (req.query.quote as string) || 'INR';
    const snapshots = await marketDataService.getSnapshots(quote);
    const item = snapshots[commodity] || snapshots.GOLD;
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch commodity detail' });
  }
});

router.get('/market/:commodity/history', async (req: Request, res: Response) => {
  try {
    const commodity = req.params.commodity.toUpperCase();
    const timeframe = (req.query.interval as string) || '1M';
    const quote = (req.query.quote as string) || 'INR';
    const history = await marketDataService.getHistoricalData(commodity, timeframe, quote);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch commodity history' });
  }
});

// Excel (.xlsx) Download Endpoint
router.get('/export', async (req: Request, res: Response) => {
  try {
    const commodity = ((req.query.commodity as string) || 'GOLD').toUpperCase();
    const contract = (req.query.contract as string) || `${commodity} OCT 2026`;
    const quote = (req.query.quote as string) || 'INR';
    const timeframe = (req.query.interval as string) || '1M';

    const history = await marketDataService.getHistoricalData(commodity, timeframe, quote);

    const isMetal = commodity === 'GOLD' || commodity === 'SILVER';
    const gstPct = isMetal ? 3 : 18;
    const dutyPct = isMetal ? 6 : 2.5;

    const rows = history.map(item => {
      const marketPrice = item.close;
      const dutyAmt = (marketPrice * dutyPct) / 100;
      const priceWithDuty = marketPrice + dutyAmt;
      const gstAmt = (priceWithDuty * gstPct) / 100;
      const derivedPrice = priceWithDuty + gstAmt;

      return {
        'Commodity': commodity,
        'Contract': contract,
        'Date': item.date,
        'Currency': quote,
        'Market Price': Math.round(marketPrice * 100) / 100,
        'Custom Duty (%)': `${dutyPct}%`,
        'Custom Duty Amount': Math.round(dutyAmt * 100) / 100,
        'GST (%)': `${gstPct}%`,
        'GST Amount': Math.round(gstAmt * 100) / 100,
        'Derived Customer Price': Math.round(derivedPrice * 100) / 100,
        'Open Price': item.open,
        'High Price': item.high,
        'Low Price': item.low,
        'Volume': item.volume,
        'Open Interest': item.openInterest,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Market Data');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const filename = `${commodity}_Market_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error('[Export Route] Excel generation error:', error);
    res.status(500).json({ error: 'Failed to generate Excel export file' });
  }
});

export default router;
