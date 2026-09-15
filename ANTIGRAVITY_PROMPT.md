# Antigravity Build Prompt — MCX Commodity Live Market Platform

You are the lead architect + full-stack engineer for this project.

## 1. Product Goal

Build a production-oriented multi-platform market-data application that displays live MCX commodity prices for:

1. Gold
2. Silver
3. Copper
4. Crude Oil
5. Natural Gas

The product should eventually exist as:

- Web application
- Windows/macOS/Linux desktop application
- Android application
- iOS application

The first implementation must be the WEB application + backend/data layer. Do not try to build every client at once.

The product is conceptually similar to the live commodity/forex price displays shown in the supplied meeting screenshots and to commercial market-data applications such as Arihant-style commodity terminals.

IMPORTANT:
- Do NOT scrape MCX/Arihant/AIB websites.
- Do NOT expose provider API keys in frontend code.
- Do NOT assume a broker API is legally licensed for public redistribution.
- Separate "prototype/personal API access" from "production/client-facing exchange data licensing".
- Do not claim data is real-time unless the configured provider actually supplies real-time data.

## 2. Supplied Reference Screenshots

Use the uploaded screenshots as UX references.

The screenshots show:
- commodity price tables
- Gold/Silver/Copper/Crude Oil/Natural Gas sections
- Last/LTP, Bid, Ask, High, Low, Net/Change, expiry and related values
- compact dense market-terminal tables
- dark/light financial-terminal styling
- Excel-based market data layouts
- market dashboards similar to Arihant/MCX displays

Do not clone any company's branding or copyrighted UI. Extract the information architecture and build an original modern design.

## 3. Required Technology

### Web
- React
- Vite
- TypeScript
- Tailwind CSS
- Recharts or another lightweight chart library
- Socket.IO client

### Backend
- Node.js
- Express
- TypeScript
- Socket.IO
- MongoDB
- Redis

### Architecture
Use a monorepo:

apps/
  web/
  desktop/
  mobile/

services/
  api/
  market-data/
  export/

packages/
  shared-types/
  shared-utils/
  ui/

mcp/
  market-data-mcp/

.agents/
  mcp_config.json

Do not duplicate business logic between clients.

## 4. Platform Strategy

Use this strategy:

### Web
React + Vite.

### Desktop
Use Tauri 2 with the React web frontend where practical.

### Mobile
For the first mobile implementation, prefer React Native + Expo if native mobile UX is required.

Share:
- TypeScript types
- validation schemas
- market calculations
- API client logic
- WebSocket event definitions
- formatting utilities
- authentication/business rules

Do not force identical UI code between React DOM and React Native when it harms maintainability.

For iOS builds, remember that final native iOS compilation/signing requires Apple's tooling/macOS. Do not pretend Windows can produce a signed iOS release.

Antigravity can help create and test application code, but it does not replace Apple/Google signing, developer accounts, store submission, exchange licensing, or external infrastructure.

## 5. Data Provider Architecture

Create a provider abstraction.

Example:

interface MarketDataProvider {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  subscribe(instruments: InstrumentSubscription[]): Promise<void>;
  unsubscribe(instruments: InstrumentSubscription[]): Promise<void>;
  onTick(callback: TickHandler): void;
  getSnapshot(instruments: InstrumentSubscription[]): Promise<MarketSnapshot[]>;
  getHistorical(...): Promise<HistoricalCandle[]>;
}

Create adapters:

providers/
  upstox/
  dhan/
  truedata/
  mock/

The application must not directly depend on one provider.

### Initial POC provider

Use Upstox as the first POC provider because its current developer API documentation exposes MCX instruments and WebSocket market data.

Implement:
- OAuth/API authentication on backend
- instrument discovery
- MCX instrument filtering
- WebSocket connection
- automatic reconnect
- heartbeat handling
- subscription management
- normalized tick output

Do not hard-code expired contract identifiers.

At startup, discover the current contracts and select the desired active contract according to a configurable contract-selection strategy.

Example configuration:

GOLD:
  exchange: MCX
  underlying: GOLD
  contract: nearest_active

SILVER:
  exchange: MCX
  underlying: SILVER
  contract: nearest_active

COPPER:
  exchange: MCX
  underlying: COPPER
  contract: nearest_active

CRUDE_OIL:
  exchange: MCX
  underlying: CRUDEOIL
  contract: nearest_active

NATURAL_GAS:
  exchange: MCX
  underlying: NATURALGAS
  contract: nearest_active

Do not assume the exact trading symbol or expiry remains constant.

## 6. Production Licensing Warning

Build a prominent internal documentation file:

docs/MARKET-DATA-LICENSING.md

Explain:

- Exchange market data is licensed.
- Broker API access and exchange redistribution rights are not necessarily the same thing.
- A private/personal API proof of concept is different from a client-facing public application.
- For production, verify MCX redistribution/display rights.
- Evaluate authorized vendors such as TrueData and Global Datafeeds.
- Contact MCX/datafeed@mcxindia.com or an authorized vendor for the exact commercial terms.
- Do not launch public real-time MCX display until the applicable licensing/redistribution permissions are confirmed.

The system should support a provider mode:

DATA_ACCESS_MODE=prototype
DATA_ACCESS_MODE=licensed_production

The production mode should require explicit configuration and must not silently fall back to an unlicensed source.

## 7. Live Data Flow

Use this architecture:

MCX/Authorized Provider
        |
        | WebSocket / streaming feed
        v
Market Data Service
        |
        +--> normalize + validate
        |
        +--> Redis Pub/Sub / Streams
        |
        +--> MongoDB time-series storage
        |
        v
Node/Express API + Socket.IO
        |
        +--> Web browser
        +--> Desktop
        +--> Mobile

IMPORTANT:
Do NOT poll the provider every second if a WebSocket stream is available.

The "within 1 second" requirement should mean:
- receive provider tick
- normalize it
- publish it
- deliver it to clients
- update UI

Target application-side latency <= 1000 ms under normal conditions.

## 8. Normalized Tick Model

Create a canonical event:

{
  "eventId": "...",
  "provider": "upstox",
  "exchange": "MCX",
  "segment": "MCX_FO",
  "instrumentId": "...",
  "commodity": "GOLD",
  "tradingSymbol": "...",
  "expiry": "...",
  "timestamp": "...",
  "ltp": 0,
  "ltq": 0,
  "bid": 0,
  "ask": 0,
  "bidQty": 0,
  "askQty": 0,
  "open": 0,
  "high": 0,
  "low": 0,
  "close": 0,
  "volume": 0,
  "openInterest": 0,
  "sourceTimestamp": "...",
  "receivedTimestamp": "...",
  "sequence": 0
}

Provider-specific fields may be added, but the frontend should only depend on the canonical model.

## 9. Realtime Reliability

Implement:

- WebSocket reconnect with exponential backoff
- heartbeat monitoring
- connection state
- provider outage detection
- stale-data detection
- last-known-value display
- server timestamp
- provider timestamp
- sequence numbers
- duplicate-event protection
- out-of-order event protection
- idempotent persistence
- graceful degradation

Show UI states:

LIVE
STALE
RECONNECTING
MARKET CLOSED
DATA UNAVAILABLE

Never show stale data as LIVE.

## 10. Offline Requirement

Critical requirement:

If a user suddenly loses internet and reconnects later, the application must become current automatically.

Implement:

### Server
Store:
- latest snapshot
- minute candles
- historical requested data
- event timestamps
- sequence/checkpoint metadata

Use MongoDB time-series collections where appropriate.

Use Redis for fast transient state and pub/sub.

Do not blindly store every tick forever in MongoDB. Make retention configurable.

### Client
Web:
- IndexedDB for local cache

Mobile:
- SQLite/local persistent storage

Desktop:
- local persistent storage/cache

On reconnect:

1. client sends last known timestamp/sequence
2. server determines whether missing data is available
3. server sends missed updates/candles if appropriate
4. server sends a fresh authoritative snapshot
5. client reconciles state
6. UI marks LIVE only after successful synchronization

For long offline periods, do not replay millions of ticks to the client. Send:
- relevant historical candles
- latest snapshot
- current state

## 11. Socket.IO Event Design

Use events such as:

market:tick
market:snapshot
market:candle
market:status
market:sync:start
market:sync:complete
market:stale
market:error

Use rooms:

commodity:GOLD
commodity:SILVER
commodity:COPPER
commodity:CRUDE_OIL
commodity:NATURAL_GAS

Allow users to subscribe only to commodities they are viewing.

## 12. Dashboard UX

Create an original premium financial-terminal dashboard.

Main page:

Header:
- product name
- market status
- last synchronization time
- connection status
- user/account menu

Commodity cards/table:
- Gold
- Silver
- Copper
- Crude Oil
- Natural Gas

For each:

LTP
Bid
Ask
Change
Change %
Open
High
Low
Previous Close
Volume
Open Interest
Expiry
Last Update

Use compact dense tables inspired by the supplied Excel screenshots, but create a modern responsive UI.

Include:
- green/red positive/negative movement
- live pulse indicator
- sortable columns
- search/filter
- commodity selector
- expiry selector
- compact/comfortable display modes

## 13. Charts

For every commodity provide:

- 1 minute
- 5 minute
- 15 minute
- 30 minute
- 1 hour
- 1 day

Charts should use stored candles rather than rendering every raw tick.

Show:
- OHLC
- volume where available
- live price marker
- last update timestamp

## 14. User-Calculated Display Price

The meeting notes mention a second Excel sheet where:
- GST is applied
- custom duty is applied
- final customer-facing price is calculated
- custom duty changes approximately every 15 days

Do NOT mix this derived price with the raw MCX exchange price.

Create separate fields:

exchangePrice
gstAmount
customDutyRate
customDutyAmount
otherCharges
displayPrice

Create a configuration-driven pricing engine:

PricingRule {
  commodity,
  effectiveFrom,
  effectiveTo,
  gstRate,
  customDutyRate,
  otherCharges,
  formulaVersion
}

The admin must be able to change these rates without redeploying the app.

Every calculated price must retain the rule/version used to calculate it.

Never hard-code a tax/custom-duty rate unless explicitly supplied by the authorized business/admin configuration.

Clearly label:

MCX Market Price
Customer/Derived Price

## 15. Excel Export

Users must be able to request an Excel report.

UI:

From:
To:
Commodity:
Contract:
Interval:
Fields:
[Generate Excel]

Export:
- timestamp
- commodity
- contract
- expiry
- LTP
- bid
- ask
- open
- high
- low
- close
- volume
- open interest
- calculated display price if enabled

Use XLSX generation on the backend.

Do not export secret API credentials.

For very large ranges, generate the file asynchronously and provide job status.

## 16. API Endpoints

Create:

GET /api/health
GET /api/market/status
GET /api/commodities
GET /api/commodities/:commodity
GET /api/commodities/:commodity/history
GET /api/commodities/:commodity/candles
GET /api/instruments
GET /api/export
POST /api/export
GET /api/export/:jobId

Admin-only:

GET /api/admin/providers
POST /api/admin/pricing-rules
PUT /api/admin/pricing-rules/:id
GET /api/admin/data-health

## 17. Security

Implement:

- API keys only on backend
- .env support
- .env.example
- JWT/session authentication
- role-based admin permissions
- rate limiting
- Helmet
- CORS allowlist
- input validation using Zod
- structured logging
- no sensitive information in logs
- no credentials committed to Git
- secure WebSocket authentication
- provider secrets never sent to clients

Add:

.env
.env.example
.gitignore

The .env file must never be committed.

## 18. Mock Mode

Before any real API key is available, the application must work using:

DATA_PROVIDER=mock

Create a realistic simulator that generates five commodity streams with:
- price movement
- bid/ask spread
- high/low
- volume
- timestamps
- connection behavior

This allows complete frontend/backend development without a paid market feed.

Add a visible development-only label:

SIMULATED DATA

Never make mock data look like licensed real market data in production.

## 19. Provider Health

Build a provider health panel:

Provider
Connection
Last Tick
Latency
Messages/sec
Subscribed Instruments
Errors
Reconnect Count

This will help diagnose low-internet and provider failures.

## 20. Testing

Write tests for:

- price normalization
- provider adapter
- contract selection
- stale detection
- reconnect
- duplicate ticks
- out-of-order ticks
- offline synchronization
- pricing calculations
- GST
- custom duty
- Excel generation
- Socket.IO events
- API authentication
- RBAC

Also add an end-to-end test that:
1. starts mock provider
2. streams five commodities
3. opens dashboard
4. disconnects client
5. continues server stream
6. reconnects client
7. verifies synchronization
8. verifies latest prices are shown

## 21. Development Order

Do NOT attempt the whole product in one uncontrolled generation.

Work in phases.

PHASE 1
- repository
- monorepo
- web
- backend
- MongoDB
- Redis
- mock provider
- Socket.IO
- dashboard

PHASE 2
- Upstox adapter
- MCX instrument discovery
- real WebSocket
- live data normalization

PHASE 3
- historical storage
- charts
- offline synchronization
- IndexedDB

PHASE 4
- GST/custom-duty pricing engine
- admin pricing rules
- Excel export

PHASE 5
- authentication
- admin panel
- provider health
- observability
- security hardening

PHASE 6
- Tauri desktop
- React Native/Expo mobile
- shared package integration

PHASE 7
- production deployment
- licensed market-data provider integration
- compliance review

## 22. Deployment Target

Design for:

Frontend:
Vercel/Cloudflare Pages

Backend:
A long-running Node.js service such as Render/Railway/Fly.io/AWS/GCP/Cloud Run, depending on WebSocket and persistence requirements.

Redis:
Managed Redis

MongoDB:
MongoDB Atlas

IMPORTANT:
Do not use a serverless function as the primary live WebSocket market-data ingestion service.

The market-data worker needs a persistent connection.

## 23. Observability

Add structured logs:

provider_connected
provider_disconnected
provider_reconnected
tick_received
tick_dropped
tick_duplicate
tick_out_of_order
client_connected
client_disconnected
sync_started
sync_completed
export_started
export_completed
provider_error

Add metrics where practical.

## 24. MCP Server

The workspace contains:

.agents/mcp_config.json

It references:

mcp/market-data-mcp/index.js

Create this MCP server during the implementation.

The MCP should expose safe developer tools such as:

- get_market_provider_status
- get_supported_commodities
- get_current_market_snapshot
- get_instrument_metadata
- get_data_health
- validate_provider_configuration

Do NOT expose raw provider secrets through MCP responses.

MCP is a developer/agent integration layer; it is NOT the client application's market-data transport.

## 25. Documentation

Create:

README.md
docs/ARCHITECTURE.md
docs/MARKET-DATA-LICENSING.md
docs/API.md
docs/OFFLINE-SYNC.md
docs/PROVIDER-INTEGRATION.md
docs/PRICING-ENGINE.md
docs/DEPLOYMENT.md

Include setup instructions.

## 26. Environment Variables

Create:

.env.example

Suggested variables:

NODE_ENV=development

MONGO_URI=
REDIS_URL=

DATA_PROVIDER=mock
DATA_ACCESS_MODE=prototype

UPSTOX_CLIENT_ID=
UPSTOX_CLIENT_SECRET=
UPSTOX_ACCESS_TOKEN=

MARKET_DATA_RECONNECT_MS=1000
LIVE_LATENCY_TARGET_MS=1000

JWT_SECRET=

Do not put actual secrets in source code.

## 27. First Task

Before writing the complete application:

1. Inspect the workspace.
2. Create a detailed implementation plan.
3. Create the monorepo structure.
4. Create the documentation.
5. Create the mock market-data provider.
6. Create the backend.
7. Create the web dashboard.
8. Connect Socket.IO.
9. Verify the five commodity streams.
10. Only then start the real provider adapter.

Do not skip verification.

At the end of every phase, provide:
- files changed
- architecture changes
- tests run
- test results
- known limitations
- next recommended step

## 28. Acceptance Criteria

The Phase 1 application is successful when:

- five commodities appear on the dashboard
- mock data changes continuously
- UI updates without page refresh
- Socket.IO is used for realtime client updates
- backend remains the single source of truth
- Redis is used for transient realtime distribution
- MongoDB stores historical/candle data
- client disconnect/reconnect is handled
- stale state is visible
- Excel export works
- GST/custom-duty calculation is isolated from exchange price
- no secret is exposed in frontend
- tests pass
- the application has a clean path to replace mock provider with MCX-authorized live data

Start with planning and Phase 1. Do not invent market-data API keys or claim access to MCX live data without credentials.
