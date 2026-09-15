import { z } from 'zod';
import { CanonicalTick, CommodityCode } from '@mcx/shared-types';

export const CommodityCodeSchema = z.enum([
  'GOLD',
  'SILVER',
  'COPPER',
  'CRUDE_OIL',
  'NATURAL_GAS',
]);

export const CanonicalTickSchema = z.object({
  eventId: z.string().min(1),
  provider: z.string().min(1),
  exchange: z.literal('MCX'),
  segment: z.string().default('MCX_FO'),
  instrumentId: z.string().min(1),
  commodity: CommodityCodeSchema,
  tradingSymbol: z.string().min(1),
  expiry: z.string().min(1),
  timestamp: z.number().positive(),
  ltp: z.number().nonnegative(),
  ltq: z.number().nonnegative().default(1),
  bid: z.number().nonnegative(),
  ask: z.number().nonnegative(),
  bidQty: z.number().nonnegative().default(0),
  askQty: z.number().nonnegative().default(0),
  open: z.number().nonnegative(),
  high: z.number().nonnegative(),
  low: z.number().nonnegative(),
  close: z.number().nonnegative(),
  prevClose: z.number().nonnegative(),
  change: z.number(),
  changePercent: z.number(),
  volume: z.number().nonnegative(),
  openInterest: z.number().nonnegative().default(0),
  sourceTimestamp: z.number().positive(),
  receivedTimestamp: z.number().positive(),
  sequence: z.number().nonnegative(),
});

export function normalizeTick(input: unknown): CanonicalTick {
  return CanonicalTickSchema.parse(input) as CanonicalTick;
}

export function safeNormalizeTick(input: unknown): { success: true; data: CanonicalTick } | { success: false; error: z.ZodError } {
  const result = CanonicalTickSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data as CanonicalTick };
  }
  return { success: false, error: result.error };
}
