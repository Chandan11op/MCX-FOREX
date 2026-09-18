export interface PricingRule {
  id: string;
  commoditySymbol: string;
  commodityName: string;
  gstPercentage: number;
  customDutyPercentage: number;
  effectiveFrom: string;
  effectiveTo: string;
  enabled: boolean;
}

export interface PricingCalculationResult {
  commoditySymbol: string;
  commodityName: string;
  marketPrice: number;
  gstPercentage: number;
  gstAmount: number;
  customDutyPercentage: number;
  customDutyAmount: number;
  derivedCustomerPrice: number;
  currency: string;
}
