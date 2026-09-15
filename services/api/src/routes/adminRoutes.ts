import { Router, Request, Response } from 'express';
import { MarketDataEngine } from '@mcx/service-market-data';
import { PricingRule, CommodityCode } from '@mcx/shared-types';

export function createAdminRouter(engine: MarketDataEngine): Router {
  const router = Router();

  // GET /api/admin/pricing-rules
  router.get('/pricing-rules', (req: Request, res: Response) => {
    const rules = engine.getPricingRules();
    res.json(rules);
  });

  // POST /api/admin/pricing-rules
  router.post('/pricing-rules', (req: Request, res: Response) => {
    const { commodity, gstRate, customDutyRate, otherCharges, formulaVersion } = req.body;

    if (!commodity || gstRate === undefined || customDutyRate === undefined) {
      return res.status(400).json({ error: 'Missing required pricing rule fields (commodity, gstRate, customDutyRate)' });
    }

    const rule: PricingRule = {
      id: `rule_${commodity.toLowerCase()}_${Date.now()}`,
      commodity: commodity.toUpperCase() as CommodityCode,
      effectiveFrom: new Date().toISOString(),
      gstRate: Number(gstRate),
      customDutyRate: Number(customDutyRate),
      otherCharges: Number(otherCharges || 0),
      formulaVersion: formulaVersion || 'v1.1-custom',
      updatedBy: 'admin',
      updatedAt: new Date().toISOString(),
    };

    engine.updatePricingRule(rule);
    res.status(201).json({ success: true, rule });
  });

  // GET /api/admin/data-health
  router.get('/data-health', (req: Request, res: Response) => {
    const health = engine.getHealth();
    res.json({
      health,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
    });
  });

  return router;
}
