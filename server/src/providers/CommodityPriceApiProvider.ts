import {
  MarketDataProvider,
  CommodityDefinition,
  MarketSnapshotNormalized,
  HistoricalPointNormalized,
  ProviderStatusNormalized,
} from './MarketDataProvider';

interface SymbolItem {
  symbol: string;
  name: string;
  unit?: string;
  currency?: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  GBP: '£',
  EUR: '€',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  SGD: 'S$',
  AED: 'AED ',
  SAR: 'SAR ',
};

export class CommodityPriceApiProvider implements MarketDataProvider {
  private baseUrl = 'https://api.commoditypriceapi.com/v3';
  private apiKey: string;
  private symbolMap: Record<string, CommodityDefinition> = {};
  private initialized = false;

  constructor() {
    this.apiKey = process.env.DATA_API_KEY || '';
  }

  private get headers() {
    return {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  public async initSymbols(): Promise<void> {
    if (this.initialized) return;

    try {
      if (!this.apiKey) {
        console.warn('[CommodityPriceApiProvider] DATA_API_KEY is missing in environment.');
        this.useFallbackSymbolMap();
        return;
      }

      const res = await fetch(`${this.baseUrl}/symbols`, { headers: this.headers });
      if (!res.ok) {
        console.warn(`[CommodityPriceApiProvider] /v3/symbols returned status ${res.status}. Using default mappings.`);
        this.useFallbackSymbolMap();
        return;
      }

      const json = await res.json() as { success?: boolean; data?: SymbolItem[] | Record<string, SymbolItem> };
      const rawData = json.data;

      let symbolList: SymbolItem[] = [];
      if (Array.isArray(rawData)) {
        symbolList = rawData;
      } else if (rawData && typeof rawData === 'object') {
        symbolList = Object.values(rawData);
      }

      this.mapSymbolsFromApi(symbolList);
      this.initialized = true;
    } catch (error) {
      console.warn('[CommodityPriceApiProvider] Failed to fetch symbols from CommodityPriceAPI. Using fallback map:', error);
      this.useFallbackSymbolMap();
    }
  }

  private mapSymbolsFromApi(symbols: SymbolItem[]): void {
    const targets: Array<{ key: 'GOLD' | 'SILVER' | 'COPPER' | 'CRUDEOIL' | 'NATURALGAS'; name: string; searchTerms: string[]; defaultUnit: string }> = [
      { key: 'GOLD', name: 'Gold', searchTerms: ['gold', 'xau'], defaultUnit: 'troy oz' },
      { key: 'SILVER', name: 'Silver', searchTerms: ['silver', 'xag'], defaultUnit: 'troy oz' },
      { key: 'COPPER', name: 'Copper', searchTerms: ['copper', 'copp'], defaultUnit: '1 LBS' },
      { key: 'CRUDEOIL', name: 'Crude Oil', searchTerms: ['crude', 'brent', 'wti', 'oil'], defaultUnit: '1 BBL' },
      { key: 'NATURALGAS', name: 'Natural Gas', searchTerms: ['natural gas', 'natgas', 'ng'], defaultUnit: '1 MMBTU' },
    ];

    for (const target of targets) {
      const match = symbols.find(s => {
        const nameLower = (s.name || '').toLowerCase();
        const symLower = (s.symbol || '').toLowerCase();
        return target.searchTerms.some(term => nameLower.includes(term) || symLower === term);
      });

      if (match) {
        this.symbolMap[target.key] = {
          symbol: match.symbol,
          name: target.name,
          commodityKey: target.key,
          category: target.key === 'GOLD' || target.key === 'SILVER' ? 'PRECIOUS_METALS' : target.key === 'COPPER' ? 'BASE_METALS' : 'ENERGY',
          unit: match.unit || target.defaultUnit,
        };
      } else {
        // Fallback default symbol if not directly found in API list
        this.symbolMap[target.key] = {
          symbol: target.key === 'GOLD' ? 'XAU' : target.key === 'SILVER' ? 'XAG' : target.key,
          name: target.name,
          commodityKey: target.key,
          category: target.key === 'GOLD' || target.key === 'SILVER' ? 'PRECIOUS_METALS' : target.key === 'COPPER' ? 'BASE_METALS' : 'ENERGY',
          unit: target.defaultUnit,
        };
      }
    }
  }

  private useFallbackSymbolMap(): void {
    this.symbolMap = {
      GOLD: { symbol: 'XAU', name: 'Gold', commodityKey: 'GOLD', category: 'PRECIOUS_METALS', unit: '10 GR' },
      SILVER: { symbol: 'XAG', name: 'Silver', commodityKey: 'SILVER', category: 'PRECIOUS_METALS', unit: '1 KG' },
      COPPER: { symbol: 'COPPER', name: 'Copper', commodityKey: 'COPPER', category: 'BASE_METALS', unit: '1 KG' },
      CRUDEOIL: { symbol: 'BRENT', name: 'Crude Oil', commodityKey: 'CRUDEOIL', category: 'ENERGY', unit: '1 BBL' },
      NATURALGAS: { symbol: 'NG', name: 'Natural Gas', commodityKey: 'NATURALGAS', category: 'ENERGY', unit: '1 MMBTU' },
    };
    this.initialized = true;
  }

  public async getProviderStatus(): Promise<ProviderStatusNormalized> {
    return {
      source: 'COMMODITYPRICEAPI',
      provider: 'commoditypriceapi',
      dataMode: 'DEMO / GLOBAL COMMODITY DATA',
      status: this.apiKey ? 'AVAILABLE' : 'UNAVAILABLE',
      lastUpdated: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      notice: 'Prototype data supplied by CommodityPriceAPI. Aggregated global commodity data, not an official MCX feed.',
      currency: 'INR',
    };
  }

  public async getSupportedCommodities(): Promise<CommodityDefinition[]> {
    await this.initSymbols();
    return Object.values(this.symbolMap);
  }

  public async getSnapshots(quoteCurrency = 'INR'): Promise<Record<string, MarketSnapshotNormalized>> {
    await this.initSymbols();

    const symbols = Object.values(this.symbolMap).map(s => s.symbol).join(',');
    const snapshots: Record<string, MarketSnapshotNormalized> = {};
    const effectiveCurrency = quoteCurrency.toUpperCase();
    const currSymbol = CURRENCY_SYMBOLS[effectiveCurrency] || '$';

    try {
      if (!this.apiKey) {
        return this.generateStaticFallbackSnapshots(effectiveCurrency, currSymbol);
      }

      const url = `${this.baseUrl}/rates/latest?symbols=${encodeURIComponent(symbols)}&quote=${encodeURIComponent(effectiveCurrency)}`;
      const res = await fetch(url, { headers: this.headers });

      if (!res.ok) {
        console.warn(`[CommodityPriceApiProvider] /v3/rates/latest status ${res.status}. Using fallback.`);
        return this.generateStaticFallbackSnapshots(effectiveCurrency, currSymbol);
      }

      const json = await res.json() as {
        success?: boolean;
        rates?: Record<string, number>;
        currency?: string;
        error?: { message?: string };
      };

      if (!json.rates) {
        console.warn('[CommodityPriceApiProvider] No rates returned. Response:', json);
        return this.generateStaticFallbackSnapshots(effectiveCurrency, currSymbol);
      }

      for (const [key, def] of Object.entries(this.symbolMap)) {
        const rate = json.rates[def.symbol] || json.rates[def.symbol.toUpperCase()] || 0;
        const changeVal = (rate * 0.005) * (key === 'SILVER' || key === 'NATURALGAS' ? -1 : 1);
        const changePct = key === 'SILVER' || key === 'NATURALGAS' ? -0.35 : 0.52;

        snapshots[key] = {
          commoditySymbol: key,
          commodityName: def.name,
          contractName: `${def.name.toUpperCase()} SPOT`,
          expiryDate: 'N/A',
          unit: def.unit,
          currency: effectiveCurrency,
          currencySymbol: currSymbol,
          lastPrice: Math.round(rate * 100) / 100,
          change: Math.round(changeVal * 100) / 100,
          changePercent: changePct,
          open: null,
          high: null,
          low: null,
          previousClose: Math.round((rate - changeVal) * 100) / 100,
          volume: null,
          openInterest: null,
          tradingDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          source: 'COMMODITYPRICEAPI',
          dataMode: 'DEMO',
          rawSymbol: def.symbol,
        };
      }

      return snapshots;
    } catch (error) {
      console.error('[CommodityPriceApiProvider] Snapshot fetch failed:', error);
      return this.generateStaticFallbackSnapshots(effectiveCurrency, currSymbol);
    }
  }

  public async getHistoricalData(commodityKey: string, timeframe: string, quoteCurrency = 'INR'): Promise<HistoricalPointNormalized[]> {
    await this.initSymbols();
    const def = this.symbolMap[commodityKey.toUpperCase()] || this.symbolMap.GOLD;
    const count = timeframe === '1D' ? 24 : timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : timeframe === '6M' ? 180 : 365;

    // Fetch snapshot price to base historical line
    const snapshots = await this.getSnapshots(quoteCurrency);
    const snapshot = snapshots[commodityKey.toUpperCase()] || snapshots.GOLD;
    const basePrice = snapshot.lastPrice;

    const points: HistoricalPointNormalized[] = [];
    for (let i = 0; i < count; i++) {
      const factor = 1 + (Math.sin(i / 4) * 0.012) + ((i / count) * 0.04);
      const close = Math.round(basePrice * factor * 100) / 100;
      const high = Math.round(close * 1.006 * 100) / 100;
      const low = Math.round(close * 0.994 * 100) / 100;
      const open = Math.round((high + low) / 2 * 100) / 100;

      const dateObj = new Date();
      dateObj.setDate(dateObj.getDate() - (count - i));

      points.push({
        timestamp: dateObj.toISOString(),
        date: timeframe === '1D' ? `${String(i).padStart(2, '0')}:00` : dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        open,
        high,
        low,
        close,
        volume: 0,
        openInterest: 0,
      });
    }

    return points;
  }

  private generateStaticFallbackSnapshots(currency: string, currencySymbol: string): Record<string, MarketSnapshotNormalized> {
    const multipliers: Record<string, number> = {
      INR: 1,
      USD: 0.012,
      GBP: 0.0094,
      EUR: 0.011,
      JPY: 1.76,
      AUD: 0.018,
      CAD: 0.016,
      SGD: 0.016,
      AED: 0.044,
      SAR: 0.045,
    };
    const mult = multipliers[currency] || 1;

    const baseValues = [
      { key: 'GOLD', name: 'Gold', unit: '10 GR', basePrice: 123450.00, change: 850.00, changePercent: 0.69 },
      { key: 'SILVER', name: 'Silver', unit: '1 KG', basePrice: 145220.00, change: -465.00, changePercent: -0.32 },
      { key: 'COPPER', name: 'Copper', unit: '1 KG', basePrice: 812.40, change: 9.00, changePercent: 1.12 },
      { key: 'CRUDEOIL', name: 'Crude Oil', unit: '1 BBL', basePrice: 6420.00, change: 28.70, changePercent: 0.45 },
      { key: 'NATURALGAS', name: 'Natural Gas', unit: '1 MMBTU', basePrice: 285.30, change: -2.20, changePercent: -0.76 },
    ];

    const result: Record<string, MarketSnapshotNormalized> = {};
    for (const item of baseValues) {
      const price = Math.round(item.basePrice * mult * 100) / 100;
      const change = Math.round(item.change * mult * 100) / 100;

      result[item.key] = {
        commoditySymbol: item.key,
        commodityName: item.name,
        contractName: `${item.name.toUpperCase()} SPOT`,
        expiryDate: 'N/A',
        unit: item.unit,
        currency,
        currencySymbol,
        lastPrice: price,
        change,
        changePercent: item.changePercent,
        open: null,
        high: null,
        low: null,
        previousClose: Math.round((price - change) * 100) / 100,
        volume: null,
        openInterest: null,
        tradingDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        source: 'COMMODITYPRICEAPI',
        dataMode: 'DEMO',
        rawSymbol: item.key === 'GOLD' ? 'XAU' : item.key === 'SILVER' ? 'XAG' : item.key,
      };
    }

    return result;
  }
}
