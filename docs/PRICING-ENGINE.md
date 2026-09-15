# Pricing Engine & Custom Duty/GST Specification

## 1. Overview & Isolation Principle

Commodity bullion and physical trading desks in India calculate customer-facing landing prices by augmenting the raw MCX futures exchange price with:
1. **Custom Duty**: Revised periodically (typically on a 15-day cycle by the Central Board of Indirect Taxes and Customs / CBIC).
2. **GST**: Goods and Services Tax (e.g. 3% for Precious Metals like Gold & Silver, standard rates for Industrial metals).
3. **Other Charges / Premium / Discount**: Handling, refinery charges, transport, or local basis.

> [!IMPORTANT]
> The raw MCX Exchange Price is **NEVER** modified in-place. The application retains both prices cleanly separated across all database records, API payloads, and UI tables.

---

## 2. Pricing Formula

For a given commodity tick with raw exchange price $P_{\text{exchange}}$:

1. **Custom Duty Calculation**:
   $$\text{CustomDutyAmount} = P_{\text{exchange}} \times \left( \frac{\text{CustomDutyRate}\%}{100} \right)$$
   $$\text{Subtotal} = P_{\text{exchange}} + \text{CustomDutyAmount} + \text{OtherCharges}$$

2. **GST Calculation**:
   $$\text{GSTAmount} = \text{Subtotal} \times \left( \frac{\text{GSTRate}\%}{100} \right)$$

3. **Customer Display Price**:
   $$\text{DisplayPrice} = \text{Subtotal} + \text{GSTAmount}$$

---

## 3. Data Model

```typescript
export interface PricingRule {
  id: string;
  commodity: CommodityCode;
  effectiveFrom: string;  // ISO date
  effectiveTo?: string;   // Optional ISO date
  gstRate: number;        // e.g. 3.0 for 3%
  customDutyRate: number; // e.g. 6.0 for 6%
  otherCharges: number;   // e.g. ₹50 flat handling
  formulaVersion: string; // e.g. "v1.2"
  updatedBy: string;
  updatedAt: string;
}

export interface CalculatedPrice {
  commodity: CommodityCode;
  exchangePrice: number;
  customDutyRate: number;
  customDutyAmount: number;
  gstRate: number;
  gstAmount: number;
  otherCharges: number;
  displayPrice: number;
  formulaVersion: string;
  calculatedAt: number;
}
```

Admin users can update pricing rules through the `/api/admin/pricing-rules` endpoint or the built-in UI Admin modal without requiring application redeployment.
