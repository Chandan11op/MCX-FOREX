# Architecture Blueprint: MCX-FOREX Terminal

## Overview

MCX-FOREX is a professional commodity market-data web platform built with a modular provider abstraction to support both End-Of-Day (Bhavcopy) prototype operation and future real-time market data ingestion from authorized MCX data vendors.

```
+-----------------------------------------------------------------------+
|                            Data Sources                               |
|   +--------------------------+    +-------------------------------+   |
|   |  MCX Bhavcopy EOD (CSV)  |    | MCX Authorized Realtime Vendor|   |
|   +------------+-------------+    +---------------+---------------+   |
+----------------|----------------------------------|-------------------+
                 |                                  |
                 v                                  v
+-----------------------------------------------------------------------+
|                    MarketDataProvider Abstraction                     |
|   +--------------------------+    +-------------------------------+   |
|   |   McxBhavcopyProvider    |    |  McxRealtimeProvider (Future) |   |
|   +------------+-------------+    +---------------+---------------+   |
+----------------|----------------------------------|-------------------+
                 |                                  |
                 +----------------+-----------------+
                                  |
                                  v
+-----------------------------------------------------------------------+
|                     Node.js Market Data Service                       |
|  - Data Ingestion & Validation                                        |
|  - Instrument Discovery & Normalization                               |
|  - Pricing Calculation Engine (Market Price + Custom Duty + GST)      |
+---------------------------------+-------------------------------------+
                                  |
                 +----------------+-----------------+
                 |                                  |
                 v                                  v
+----------------------------------+ +----------------------------------+
|           MongoDB Store          | |        Socket.IO Gateway         |
| - Commodities & Instruments      | | - Real-time client updates       |
| - Historical MarketData          | | - Provider status broadcasts     |
| - PricingRules Config            | | - Stale / Connection events     |
+----------------------------------+ +----------------------------------+
                                                    |
                                                    v
+-----------------------------------------------------------------------+
|                      React Web Client Application                     |
| - Professional Dark Terminal Dashboard                                |
| - Explicit Data Mode & Provider Banners ("MCX BHAVCOPY - EOD")        |
| - Derived Customer Price vs Exchange Quoted Price Display             |
| - Recharts Interactive Charts & XLSX Export                           |
+-----------------------------------------------------------------------+
```

## Key Principles

1. **Provider Isolation**: Exchange connectivity details are isolated behind the `MarketDataProvider` interface. Switching providers requires zero frontend code changes.
2. **Explicit Data Mode**: The system explicitly tags every tick/snapshot with its origin `source` and `dataMode` (`END_OF_DAY`, `DELAYED`, or `REALTIME`).
3. **Price Separation**: MCX Exchange Market Price is stored immutably. Derived Customer Price is calculated on demand via configurable `PricingRule` models.
4. **No Fake Data loops**: Live simulators are prohibited from masquerading as real-time exchange feeds.
