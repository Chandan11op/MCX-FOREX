import { Commodity, Instrument, MarketSnapshot, HistoricalDataPoint } from '../types/market';
import { PricingRule } from '../types/pricing';
import { ProviderStatus } from '../types/provider';

export const DEMO_COMMODITIES: Commodity[] = [
  { id: '1', name: 'Gold', symbol: 'GOLD', category: 'PRECIOUS_METALS', unit: '10 GR', currency: 'INR', active: true },
  { id: '2', name: 'Silver', symbol: 'SILVER', category: 'PRECIOUS_METALS', unit: '1 KG', currency: 'INR', active: true },
  { id: '3', name: 'Copper', symbol: 'COPPER', category: 'BASE_METALS', unit: '1 KG', currency: 'INR', active: true },
  { id: '4', name: 'Crude Oil', symbol: 'CRUDEOIL', category: 'ENERGY', unit: '1 BBL', currency: 'INR', active: true },
  { id: '5', name: 'Natural Gas', symbol: 'NATURALGAS', category: 'ENERGY', unit: '1 MMBTU', currency: 'INR', active: true },
];

export const DEMO_INSTRUMENTS: Instrument[] = [
  { id: 'INST-GOLD-OCT26', symbol: 'GOLD', commoditySymbol: 'GOLD', exchange: 'MCX', contractName: 'GOLD OCT 2026', expiryDate: '05 Oct 2026', unit: '10 GR', tickSize: 1, lotSize: 1, status: 'ACTIVE' },
  { id: 'INST-GOLD-DEC26', symbol: 'GOLD', commoditySymbol: 'GOLD', exchange: 'MCX', contractName: 'GOLD DEC 2026', expiryDate: '04 Dec 2026', unit: '10 GR', tickSize: 1, lotSize: 1, status: 'UPCOMING' },
  { id: 'INST-SILVER-NOV26', symbol: 'SILVER', commoditySymbol: 'SILVER', exchange: 'MCX', contractName: 'SILVER NOV 2026', expiryDate: '30 Nov 2026', unit: '1 KG', tickSize: 1, lotSize: 30, status: 'ACTIVE' },
  { id: 'INST-COPPER-OCT26', symbol: 'COPPER', commoditySymbol: 'COPPER', exchange: 'MCX', contractName: 'COPPER OCT 2026', expiryDate: '31 Oct 2026', unit: '1 KG', tickSize: 0.05, lotSize: 2500, status: 'ACTIVE' },
  { id: 'INST-CRUDE-OCT26', symbol: 'CRUDEOIL', commoditySymbol: 'CRUDEOIL', exchange: 'MCX', contractName: 'CRUDE OIL OCT 2026', expiryDate: '19 Oct 2026', unit: '1 BBL', tickSize: 1, lotSize: 100, status: 'ACTIVE' },
  { id: 'INST-NATGAS-OCT26', symbol: 'NATURALGAS', commoditySymbol: 'NATURALGAS', exchange: 'MCX', contractName: 'NATURAL GAS OCT 2026', expiryDate: '27 Oct 2026', unit: '1 MMBTU', tickSize: 0.1, lotSize: 1250, status: 'ACTIVE' },
];

export const DEMO_SNAPSHOTS: Record<string, MarketSnapshot> = {
  GOLD: {
    commoditySymbol: 'GOLD',
    commodityName: 'Gold',
    contractName: 'GOLD OCT 2026',
    expiryDate: '05 Oct 2026',
    unit: '10 GR',
    lastPrice: 123450.00,
    change: 850.00,
    changePercent: 0.69,
    open: 122900.00,
    high: 123700.00,
    low: 122500.00,
    previousClose: 122600.00,
    volume: 18452,
    openInterest: 12842,
    tradingDate: '18 Sep 2026',
    source: 'MCX',
    dataMode: 'END_OF_DAY',
  },
  SILVER: {
    commoditySymbol: 'SILVER',
    commodityName: 'Silver',
    contractName: 'SILVER NOV 2026',
    expiryDate: '30 Nov 2026',
    unit: '1 KG',
    lastPrice: 145220.00,
    change: -465.00,
    changePercent: -0.32,
    open: 145800.00,
    high: 146100.00,
    low: 144900.00,
    previousClose: 145685.00,
    volume: 24190,
    openInterest: 19820,
    tradingDate: '18 Sep 2026',
    source: 'MCX',
    dataMode: 'END_OF_DAY',
  },
  COPPER: {
    commoditySymbol: 'COPPER',
    commodityName: 'Copper',
    contractName: 'COPPER OCT 2026',
    expiryDate: '31 Oct 2026',
    unit: '1 KG',
    lastPrice: 812.40,
    change: 9.00,
    changePercent: 1.12,
    open: 804.20,
    high: 815.00,
    low: 802.10,
    previousClose: 803.40,
    volume: 8750,
    openInterest: 6420,
    tradingDate: '18 Sep 2026',
    source: 'MCX',
    dataMode: 'END_OF_DAY',
  },
  CRUDEOIL: {
    commoditySymbol: 'CRUDEOIL',
    commodityName: 'Crude Oil',
    contractName: 'CRUDE OIL OCT 2026',
    expiryDate: '19 Oct 2026',
    unit: '1 BBL',
    lastPrice: 6420.00,
    change: 28.70,
    changePercent: 0.45,
    open: 6390.00,
    high: 6450.00,
    low: 6375.00,
    previousClose: 6391.30,
    volume: 45890,
    openInterest: 31200,
    tradingDate: '18 Sep 2026',
    source: 'MCX',
    dataMode: 'END_OF_DAY',
  },
  NATURALGAS: {
    commoditySymbol: 'NATURALGAS',
    commodityName: 'Natural Gas',
    contractName: 'NATURAL GAS OCT 2026',
    expiryDate: '27 Oct 2026',
    unit: '1 MMBTU',
    lastPrice: 285.30,
    change: -2.20,
    changePercent: -0.76,
    open: 288.00,
    high: 289.50,
    low: 283.80,
    previousClose: 287.50,
    volume: 68420,
    openInterest: 42150,
    tradingDate: '18 Sep 2026',
    source: 'MCX',
    dataMode: 'END_OF_DAY',
  },
};

export const DEMO_PRICING_RULES: PricingRule[] = [
  { id: 'RULE-GOLD', commoditySymbol: 'GOLD', commodityName: 'Gold', gstPercentage: 3.0, customDutyPercentage: 6.0, effectiveFrom: '2026-01-01', effectiveTo: '2026-12-31', enabled: true },
  { id: 'RULE-SILVER', commoditySymbol: 'SILVER', commodityName: 'Silver', gstPercentage: 3.0, customDutyPercentage: 6.0, effectiveFrom: '2026-01-01', effectiveTo: '2026-12-31', enabled: true },
  { id: 'RULE-COPPER', commoditySymbol: 'COPPER', commodityName: 'Copper', gstPercentage: 18.0, customDutyPercentage: 5.0, effectiveFrom: '2026-01-01', effectiveTo: '2026-12-31', enabled: true },
  { id: 'RULE-CRUDE', commoditySymbol: 'CRUDEOIL', commodityName: 'Crude Oil', gstPercentage: 18.0, customDutyPercentage: 2.5, effectiveFrom: '2026-01-01', effectiveTo: '2026-12-31', enabled: true },
  { id: 'RULE-NATGAS', commoditySymbol: 'NATURALGAS', commodityName: 'Natural Gas', gstPercentage: 18.0, customDutyPercentage: 2.5, effectiveFrom: '2026-01-01', effectiveTo: '2026-12-31', enabled: true },
];

export const DEMO_PROVIDER_STATUS: ProviderStatus = {
  source: 'MCX',
  provider: 'mcx-bhavcopy',
  dataMode: 'END_OF_DAY',
  status: 'AVAILABLE',
  lastUpdated: '18 Sep 2026, 14:25:32',
  notice: 'Current prototype uses MCX end-of-day/Bhavcopy data. It is not a real-time feed.',
};

export const generateHistoricalData = (commoditySymbol: string, timeframe: string): HistoricalDataPoint[] => {
  const baseSnapshot = DEMO_SNAPSHOTS[commoditySymbol] || DEMO_SNAPSHOTS.GOLD;
  const basePrice = baseSnapshot.lastPrice;
  const count = timeframe === '1D' ? 24 : timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : timeframe === '6M' ? 180 : 365;

  const points: HistoricalDataPoint[] = [];
  let current = basePrice * 0.92;

  for (let i = 0; i < count; i++) {
    const factor = 1 + (Math.sin(i / 5) * 0.015) + ((i / count) * 0.08);
    const close = Math.round(current * factor * 100) / 100;
    const high = Math.round(close * 1.008 * 100) / 100;
    const low = Math.round(close * 0.992 * 100) / 100;
    const open = Math.round((high + low) / 2 * 100) / 100;
    const volume = Math.floor((baseSnapshot.volume || 15000) * (0.8 + Math.random() * 0.4));
    const openInterest = Math.floor((baseSnapshot.openInterest || 10000) * (0.9 + Math.random() * 0.2));

    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - (count - i));

    points.push({
      timestamp: dateObj.toISOString(),
      date: timeframe === '1D' ? `${String(i).padStart(2, '0')}:00` : dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      open,
      high,
      low,
      close,
      volume,
      openInterest,
    });
  }

  return points;
};
