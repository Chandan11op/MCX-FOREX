# API Reference — MCX Commodity Live Market Platform

## Base URLs
- **REST API**: `http://localhost:4000/api`
- **Socket.IO Gateway**: `ws://localhost:4000` (path: `/socket.io`)

---

## 1. REST Endpoints

### 1.1 System & Health
#### `GET /api/health`
Returns system status, provider health, memory usage, and storage connectivity.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": 1757941200000,
  "provider": {
    "name": "mock",
    "status": "connected",
    "latencyMs": 12,
    "messagesPerSecond": 15.4
  },
  "storage": {
    "cache": "in-memory (redis-ready)",
    "database": "in-memory (mongo-ready)"
  }
}
```

#### `GET /api/market/status`
Returns active market sessions, trading hours, and exchange status for MCX.

---

### 1.2 Market Data
#### `GET /api/commodities`
Returns the latest market snapshots for all five supported MCX commodities: `GOLD`, `SILVER`, `COPPER`, `CRUDE_OIL`, `NATURAL_GAS`.

#### `GET /api/commodities/:commodity`
Returns the snapshot for a specific commodity along with customer-calculated price breakdown.

#### `GET /api/commodities/:commodity/candles?interval=1m&limit=100`
Returns historical OHLCV candles. Supported intervals: `1m`, `5m`, `15m`, `30m`, `1h`, `1d`.

#### `GET /api/commodities/:commodity/sync?sinceSequence=100&sinceTimestamp=1757940000000`
Reconciliation endpoint for disconnected clients. Returns missing candle ranges and the latest authoritative state snapshot.

---

### 1.3 Export
#### `POST /api/export`
Generates an XLSX workbook for specified commodities, contracts, and date ranges.

**Request Body:**
```json
{
  "commodity": "GOLD",
  "interval": "1m",
  "startDate": "2026-09-01T00:00:00.000Z",
  "endDate": "2026-09-15T23:59:59.000Z",
  "includeCalculatedPrices": true
}
```

**Response:**
```json
{
  "jobId": "exp_91823798",
  "status": "completed",
  "downloadUrl": "/api/export/download/exp_91823798"
}
```

---

### 1.4 Admin & Pricing
#### `GET /api/admin/pricing-rules`
Returns all active and scheduled pricing rules (GST, 15-day custom duty, other charges).

#### `POST /api/admin/pricing-rules`
Creates or updates pricing rules for a commodity.

#### `GET /api/admin/data-health`
Returns detailed diagnostic metrics: reconnect counts, tick drops, sequence skips, provider error history.

---

## 2. Socket.IO Events & Protocol

### 2.1 Subscribing to Rooms
Clients emit `subscribe` with target rooms:
```javascript
socket.emit("subscribe", { rooms: ["commodity:GOLD", "commodity:SILVER"] });
```

### 2.2 Server-to-Client Events

| Event | Payload | Description |
| :--- | :--- | :--- |
| `market:tick` | `CanonicalTick` | Real-time price, bid, ask, volume update |
| `market:snapshot` | `MarketSnapshot` | Full snapshot upon joining room |
| `market:candle` | `HistoricalCandle` | Closed/updated interval candle |
| `market:status` | `{ status: "LIVE" \| "STALE" \| "CLOSED" }` | Feed status transition |
| `market:sync:complete`| `{ commodity: string, sequence: number }` | Confirmation of sync catchup |
