import { CommodityCode, PricingRule, CalculatedPrice } from '@mcx/shared-types';

/**
 * Default standard pricing rules for precious & industrial commodities.
 * In a production desk, custom duty updates periodically (approx. every 15 days).
 */
export const DEFAULT_PRICING_RULES: Record<CommodityCode, PricingRule> = {
  GOLD: {
    id: 'rule_gold_default',
    commodity: 'GOLD',
    effectiveFrom: new Date().toISOString(),
    gstRate: 3.0,          // 3% GST on Bullion
    customDutyRate: 6.0,   // 6% Custom Duty
    otherCharges: 50.0,    // ₹50/10g handling & refining
    formulaVersion: 'v1.0-standard',
    updatedBy: 'system',
    updatedAt: new Date().toISOString(),
  },
  SILVER: {
    id: 'rule_silver_default',
    commodity: 'SILVER',
    effectiveFrom: new Date().toISOString(),
    gstRate: 3.0,          // 3% GST
    customDutyRate: 6.0,   // 6% Custom Duty
    otherCharges: 100.0,   // ₹100/kg handling
    formulaVersion: 'v1.0-standard',
    updatedBy: 'system',
    updatedAt: new Date().toISOString(),
  },
  COPPER: {
    id: 'rule_copper_default',
    commodity: 'COPPER',
    effectiveFrom: new Date().toISOString(),
    gstRate: 18.0,         // 18% GST on Base Metals
    customDutyRate: 5.0,   // 5% Basic Custom Duty
    otherCharges: 5.0,     // ₹5/kg port & logistics
    formulaVersion: 'v1.0-standard',
    updatedBy: 'system',
    updatedAt: new Date().toISOString(),
  },
  CRUDE_OIL: {
    id: 'rule_crude_default',
    commodity: 'CRUDE_OIL',
    effectiveFrom: new Date().toISOString(),
    gstRate: 0.0,          // Excise / Special duty structure
    customDutyRate: 2.5,   // 2.5% Custom Duty
    otherCharges: 25.0,    // Refinery terminal charges
    formulaVersion: 'v1.0-standard',
    updatedBy: 'system',
    updatedAt: new Date().toISOString(),
  },
  NATURAL_GAS: {
    id: 'rule_ng_default',
    commodity: 'NATURAL_GAS',
    effectiveFrom: new Date().toISOString(),
    gstRate: 0.0,          // VAT/Excise
    customDutyRate: 2.5,   // 2.5% Custom Duty
    otherCharges: 10.0,    // Pipeline transportation
    formulaVersion: 'v1.0-standard',
    updatedBy: 'system',
    updatedAt: new Date().toISOString(),
  },
};

/**
 * Calculates customer-facing display price strictly isolated from the raw exchange price.
 * Formula:
 * 1. customDutyAmount = exchangePrice * (customDutyRate / 100)
 * 2. subtotal = exchangePrice + customDutyAmount + otherCharges
 * 3. gstAmount = subtotal * (gstRate / 100)
 * 4. displayPrice = subtotal + gstAmount
 */
export function calculateDisplayPrice(
  exchangePrice: number,
  rule?: PricingRule,
  commodity?: CommodityCode
): CalculatedPrice {
  const activeRule: PricingRule = rule || (commodity ? DEFAULT_PRICING_RULES[commodity] : {
    id: 'fallback',
    commodity: 'GOLD',
    effectiveFrom: new Date().toISOString(),
    gstRate: 3.0,
    customDutyRate: 6.0,
    otherCharges: 0,
    formulaVersion: 'v1.0-fallback',
    updatedBy: 'system',
    updatedAt: new Date().toISOString(),
  });

  const customDutyAmount = round2(exchangePrice * (activeRule.customDutyRate / 100));
  const subtotal = exchangePrice + customDutyAmount + activeRule.otherCharges;
  const gstAmount = round2(subtotal * (activeRule.gstRate / 100));
  const displayPrice = round2(subtotal + gstAmount);

  return {
    commodity: activeRule.commodity,
    exchangePrice: round2(exchangePrice),
    customDutyRate: activeRule.customDutyRate,
    customDutyAmount,
    gstRate: activeRule.gstRate,
    gstAmount,
    otherCharges: activeRule.otherCharges,
    displayPrice,
    formulaVersion: activeRule.formulaVersion,
    ruleId: activeRule.id,
    calculatedAt: Date.now(),
  };
}

function round2(val: number): number {
  return Math.round(val * 100) / 100;
}
