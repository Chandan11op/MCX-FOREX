import { PricingRule, PricingCalculationResult } from '../types/pricing';
import { DEMO_PRICING_RULES, DEMO_SNAPSHOTS } from '../data/demoMarketData';
import { fetchApi } from './api';

export const pricingApi = {
  getPricingRules: async (): Promise<PricingRule[]> => {
    return fetchApi<PricingRule[]>('/pricing-rules', DEMO_PRICING_RULES);
  },

  calculatePrice: async (commoditySymbol: string, overrideMarketPrice?: number): Promise<PricingCalculationResult> => {
    const symbol = commoditySymbol.toUpperCase().replace('-', '');
    const snapshot = DEMO_SNAPSHOTS[symbol] || DEMO_SNAPSHOTS.GOLD;
    const rules = DEMO_PRICING_RULES.find(r => r.commoditySymbol === symbol) || DEMO_PRICING_RULES[0];

    const marketPrice = overrideMarketPrice ?? snapshot.lastPrice;
    const gstPercentage = rules.gstPercentage;
    const customDutyPercentage = rules.customDutyPercentage;

    const customDutyAmount = (marketPrice * customDutyPercentage) / 100;
    const priceWithDuty = marketPrice + customDutyAmount;
    const gstAmount = (priceWithDuty * gstPercentage) / 100;
    const derivedCustomerPrice = priceWithDuty + gstAmount;

    return {
      commoditySymbol: symbol,
      commodityName: snapshot.commodityName,
      marketPrice,
      gstPercentage,
      gstAmount,
      customDutyPercentage,
      customDutyAmount,
      derivedCustomerPrice,
      currency: 'INR',
    };
  },
};
