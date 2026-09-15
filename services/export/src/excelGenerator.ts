import * as XLSX from 'xlsx';
import { HistoricalCandle, MarketSnapshot } from '@mcx/shared-types';
import { formatDateTime } from '@mcx/shared-utils';

export interface GenerateExportOptions {
  snapshots: MarketSnapshot[];
  candles?: HistoricalCandle[];
  includeCalculatedPrices?: boolean;
}

export function generateMarketDataWorkbook(options: GenerateExportOptions): Buffer {
  const wb = XLSX.utils.book_new();

  // 1. Current Market Snapshots Sheet
  const snapshotRows = options.snapshots.map((snap) => ({
    'Commodity': snap.commodity,
    'Trading Symbol': snap.tradingSymbol,
    'Exchange': snap.exchange,
    'Expiry': snap.expiry,
    'LTP (₹)': snap.ltp,
    'Bid (₹)': snap.bid,
    'Ask (₹)': snap.ask,
    'Bid Qty': snap.bidQty,
    'Ask Qty': snap.askQty,
    'Open (₹)': snap.open,
    'High (₹)': snap.high,
    'Low (₹)': snap.low,
    'Prev Close (₹)': snap.prevClose,
    'Net Change': snap.change,
    'Change %': `${snap.changePercent}%`,
    'Volume': snap.volume,
    'Open Interest': snap.openInterest,
    'Status': snap.status,
    'Last Updated': formatDateTime(snap.lastUpdate),
  }));

  const wsSnapshots = XLSX.utils.json_to_sheet(snapshotRows);
  XLSX.utils.book_append_sheet(wb, wsSnapshots, 'MCX Market Snapshots');

  // 2. Customer Derived Pricing Sheet
  if (options.includeCalculatedPrices !== false) {
    const pricingRows = options.snapshots.map((snap) => {
      const calc = snap.calculatedPrice;
      return {
        'Commodity': snap.commodity,
        'Trading Symbol': snap.tradingSymbol,
        'Raw MCX Price (₹)': calc ? calc.exchangePrice : snap.ltp,
        'Custom Duty Rate (%)': calc ? `${calc.customDutyRate}%` : 'N/A',
        'Custom Duty Amount (₹)': calc ? calc.customDutyAmount : 0,
        'GST Rate (%)': calc ? `${calc.gstRate}%` : 'N/A',
        'GST Amount (₹)': calc ? calc.gstAmount : 0,
        'Other Charges (₹)': calc ? calc.otherCharges : 0,
        'Final Customer Display Price (₹)': calc ? calc.displayPrice : snap.ltp,
        'Formula Version': calc ? calc.formulaVersion : 'v1.0',
        'Calculated At': calc ? formatDateTime(calc.calculatedAt) : formatDateTime(snap.lastUpdate),
      };
    });

    const wsPricing = XLSX.utils.json_to_sheet(pricingRows);
    XLSX.utils.book_append_sheet(wb, wsPricing, 'Customer Pricing Breakdown');
  }

  // 3. Historical Candles Sheet (if provided)
  if (options.candles && options.candles.length > 0) {
    const candleRows = options.candles.map((c) => ({
      'Commodity': c.commodity,
      'Interval': c.interval,
      'Timestamp': formatDateTime(c.timestamp),
      'Open (₹)': c.open,
      'High (₹)': c.high,
      'Low (₹)': c.low,
      'Close (₹)': c.close,
      'Volume': c.volume,
    }));

    const wsCandles = XLSX.utils.json_to_sheet(candleRows);
    XLSX.utils.book_append_sheet(wb, wsCandles, 'Historical Candles');
  }

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
