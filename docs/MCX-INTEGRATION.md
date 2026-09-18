# MCX Integration Blueprint

This document details how MCX market data is processed and ingested into the MCX-FOREX system.

## Provider Interface

All MCX data sources implement the `MarketDataProvider` interface:

```typescript
export interface MarketDataProvider {
    getProviderStatus(): Promise<ProviderStatus>;
    getSupportedCommodities(): Promise<Commodity[]>;
    getInstrumentMetadata(): Promise<Instrument[]>;
    getCurrentSnapshot(): Promise<MarketSnapshot[]>;
    getHistoricalData(params: HistoricalParams): Promise<MarketData[]>;
}
```

## Initial Commodities Covered

1. **GOLD** (Unit: 10 GR / 1 KG depending on contract)
2. **SILVER** (Unit: 1 KG / 30 KG depending on contract)
3. **COPPER** (Unit: 1 KG / 2500 KG depending on contract)
4. **CRUDE OIL** (Unit: 1 BBL / 100 BBL depending on contract)
5. **NATURAL GAS** (Unit: 1 MMBTU / 1250 MMBTU depending on contract)

## Bhavcopy Ingestion Flow

1. MCX EOD Bhavcopy CSV files are stored in `./data/mcx/`.
2. `McxBhavcopyProvider` parses CSV entries.
3. Symbol and contract fields are mapped to `Instrument` records.
4. Prices, volume, open interest, and trading dates are normalized into `MarketData` records.
5. `MarketSnapshot` is updated with the latest trading day's metrics.
