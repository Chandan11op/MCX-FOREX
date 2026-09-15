# MCX Commodity Live Market Platform

A production-grade, multi-platform financial market data platform streaming real-time MCX commodity prices for:
1. **Gold** (`GOLD`)
2. **Silver** (`SILVER`)
3. **Copper** (`COPPER`)
4. **Crude Oil** (`CRUDE_OIL`)
5. **Natural Gas** (`NATURAL_GAS`)

Built with React, Vite, TypeScript, Tailwind CSS, Node.js, Express, Socket.IO, Redis, and MongoDB.

---

## Key Features

- **Sub-Second Realtime Streaming**: Latency target $\le 1000\text{ms}$ with Socket.IO room segmentation.
- **Provider Abstraction**: Realistic `MockProvider` simulator + `UpstoxProvider` adapter + extensible `MarketDataProvider` interface for licensed feeds (TrueData, Global Datafeeds, MCX direct).
- **Arihant / MCX-Style Financial Terminal**: Compact dense data table, real-time green/red price flash animations, live indicators, dark/light themes, and interactive multi-timeframe charts (`1m`, `5m`, `15m`, `30m`, `1h`, `1d`).
- **Separated Pricing Engine**: Strict separation of Raw MCX Exchange Prices from Customer-Derived Prices (with dynamic 15-day Custom Duty revisions, GST, handling charges, and formula versioning).
- **Offline Synchronization**: Automatic disconnect detection, IndexedDB client caching, and sequence-based catch-up upon network restoration.
- **Excel Report Generator**: XLSX exports with configurable date ranges, intervals, and pricing fields.
- **Developer MCP Server**: Integrates with `.agents/mcp_config.json` exposing market data introspection tools.
- **Compliance & Licensing Safeguards**: Comprehensive `docs/MARKET-DATA-LICENSING.md` protecting against unauthorized redistribution of exchange data.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Run Development Servers
```bash
# Start backend API + Market Data Engine + WebSocket server (port 4000)
npm run dev:api

# Start Web Terminal Frontend (port 5173)
npm run dev:web

# Or run both concurrently
npm run dev:all
```

### 4. Run Tests
```bash
npm test
```

---

## Project Structure

```
.
├── apps/
│   ├── web/                     # React + Vite + Tailwind + Recharts Terminal
│   ├── desktop/                 # Tauri 2 Desktop configuration
│   └── mobile/                  # React Native / Expo Mobile scaffold
├── services/
│   ├── api/                     # Express REST, Socket.IO gateway, Admin, Storage
│   ├── market-data/             # Market data engine, Mock & Upstox adapters
│   └── export/                  # Fast Excel XLSX generator
├── packages/
│   ├── shared-types/            # Canonical tick, candle, pricing schemas
│   ├── shared-utils/            # Pricing engine, normalization, formatters
│   └── ui/                      # Shared UI tokens & constants
├── mcp/
│   └── market-data-mcp/         # Market Data Model Context Protocol Server
└── docs/                        # Complete technical & compliance specifications
```
