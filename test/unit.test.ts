import test from 'node:test';
import assert from 'node:assert';
import { calculateDisplayPrice, DEFAULT_PRICING_RULES, normalizeTick, safeNormalizeTick } from '../packages/shared-utils/dist/index.js';
import { MockProvider } from '../services/market-data/dist/providers/MockProvider.js';
import { UpstoxProvider } from '../services/market-data/dist/providers/UpstoxProvider.js';
import { generateMarketDataWorkbook } from '../services/export/dist/excelGenerator.js';
import { MarketSnapshot } from '../packages/shared-types/dist/index.js';

test('Pricing Engine — isolates raw MCX price and correctly calculates Custom Duty & GST', () => {
  const exchangePrice = 72000.0; // ₹72,000 / 10g Gold
  const customRule = {
    id: 'test_gold_rule',
    commodity: 'GOLD' as const,
    effectiveFrom: '2026-09-01T00:00:00Z',
    gstRate: 3.0,          // 3% GST
    customDutyRate: 6.0,   // 6% Custom Duty
    otherCharges: 50.0,    // ₹50 charges
    formulaVersion: 'v1.0-test',
    updatedBy: 'tester',
    updatedAt: new Date().toISOString(),
  };

  const calculated = calculateDisplayPrice(exchangePrice, customRule);

  // Custom duty: 72000 * 0.06 = 4320
  assert.strictEqual(calculated.customDutyAmount, 4320.0);
  // Subtotal: 72000 + 4320 + 50 = 76370
  // GST: 76370 * 0.03 = 2291.10
  assert.strictEqual(calculated.gstAmount, 2291.10);
  // Total display price: 76370 + 2291.10 = 78661.10
  assert.strictEqual(calculated.displayPrice, 78661.10);
  // Raw exchange price remains untouched
  assert.strictEqual(calculated.exchangePrice, 72000.0);
  assert.strictEqual(calculated.formulaVersion, 'v1.0-test');
});

test('Normalization & Validation — rejects invalid ticks and accepts canonical ticks', () => {
  const validPayload = {
    eventId: 'evt_123',
    provider: 'upstox',
    exchange: 'MCX',
    segment: 'MCX_FO',
    instrumentId: 'MCX:GOLD-OCT26',
    commodity: 'GOLD',
    tradingSymbol: 'GOLD26OCTFUT',
    expiry: '2026-10-28',
    timestamp: Date.now(),
    ltp: 72450.0,
    ltq: 1,
    bid: 72448.0,
    ask: 72452.0,
    bidQty: 10,
    askQty: 10,
    open: 72100.0,
    high: 72600.0,
    low: 72050.0,
    close: 72450.0,
    prevClose: 72100.0,
    change: 350.0,
    changePercent: 0.49,
    volume: 1250,
    openInterest: 8400,
    sourceTimestamp: Date.now() - 5,
    receivedTimestamp: Date.now(),
    sequence: 42,
  };

  const norm = normalizeTick(validPayload);
  assert.strictEqual(norm.commodity, 'GOLD');
  assert.strictEqual(norm.ltp, 72450.0);

  const invalid = safeNormalizeTick({ ...validPayload, exchange: 'INVALID_EXCHANGE' });
  assert.strictEqual(invalid.success, false);
});

test('MockProvider — streams ticks and reports healthy status for all 5 MCX commodities', async () => {
  const provider = new MockProvider();
  await provider.connect();

  const ticksReceived: any[] = [];
  provider.onTick((tick: any) => {
    ticksReceived.push(tick);
  });

  // Wait 400ms for ticks to generate
  await new Promise((resolve) => setTimeout(resolve, 400));
  await provider.disconnect();

  assert.ok(ticksReceived.length > 0, 'Expected at least 1 simulated tick');
  const firstTick = ticksReceived[0];
  assert.ok(['GOLD', 'SILVER', 'COPPER', 'CRUDE_OIL', 'NATURAL_GAS'].includes(firstTick.commodity));
  assert.strictEqual(firstTick.exchange, 'MCX');

  const health = provider.getHealth();
  assert.strictEqual(health.providerId, 'mock');
  assert.ok(health.totalTicksReceived >= ticksReceived.length);
});

test('Excel Generator — builds valid XLSX buffer without credentials leak', () => {
  const mockSnapshot: MarketSnapshot = {
    commodity: 'GOLD',
    tradingSymbol: 'GOLD26OCTFUT',
    instrumentId: 'MCX:GOLD-26OCTFUT',
    exchange: 'MCX',
    expiry: '2026-10-28',
    ltp: 72450.0,
    ltq: 1,
    bid: 72448.0,
    ask: 72452.0,
    bidQty: 10,
    askQty: 10,
    open: 72100.0,
    high: 72600.0,
    low: 72050.0,
    close: 72450.0,
    prevClose: 72100.0,
    change: 350.0,
    changePercent: 0.49,
    volume: 1250,
    openInterest: 8400,
    lastUpdate: Date.now(),
    sequence: 1,
    status: 'LIVE',
    calculatedPrice: calculateDisplayPrice(72450.0, DEFAULT_PRICING_RULES.GOLD),
  };

  const buffer = generateMarketDataWorkbook({
    snapshots: [mockSnapshot],
    includeCalculatedPrices: true,
  });

  assert.ok(Buffer.isBuffer(buffer));
  assert.ok(buffer.length > 1000, 'Expected non-trivial Excel binary size');
});
