# MCX-FOREX REST & Realtime API Specification

## REST API Endpoints

### 1. System & Status
- **`GET /api/health`**
  - Response: `{ status: "ok", timestamp: string, version: string }`
- **`GET /api/provider/status`**
  - Response: `{ source: "MCX", mode: "END OF DAY", status: "AVAILABLE", lastUpdated: string }`

### 2. Commodities & Instruments
- **`GET /api/commodities`**
  - Returns list of active commodity metadata (Gold, Silver, Copper, Crude Oil, Natural Gas).
- **`GET /api/instruments`**
  - Returns instrument contracts with expiries, lot sizes, tick sizes.

### 3. Market Data & History
- **`GET /api/market/snapshot`**
  - Returns latest market snapshot for all active instruments.
- **`GET /api/market/:commodity`**
  - Returns detailed market metrics for a specific commodity symbol.
- **`GET /api/market/:commodity/history?from=&to=&interval=`**
  - Returns historical OHLCV data.

### 4. Pricing Calculation & Export
- **`GET /api/pricing-rules`**
  - Returns active GST, Custom Duty, and surcharge rules.
- **`GET /api/export?commodity=&from=&to=`**
  - Generates downloadable formatted XLSX spreadsheet.

## Realtime Gateway (Socket.IO)

- **Event: `market:snapshot`**: Emitted when fresh snapshot data is available.
- **Event: `provider:status`**: Emitted on provider status change.
- **Event: `connection:stale`**: Emitted if data feed becomes delayed or unavailable.
