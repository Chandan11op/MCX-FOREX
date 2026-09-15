# MCX Market Data Licensing & Compliance Guide

> [!WARNING]
> **CRITICAL LEGAL NOTICE**: Exchange market data is proprietary intellectual property subject to strict financial market regulations and redistribution contracts. Broker APIs (such as personal/developer keys provided by discount brokers) are licensed strictly for **personal trading execution and prototype testing**, NOT for commercial public redistribution or unauthorized client-facing real-time display platforms.

---

## 1. Broker API Access vs. Exchange Redistribution Rights

| Scope | Prototype / Personal Broker API | Production / Client-Facing Platform |
| :--- | :--- | :--- |
| **Typical Feed** | Upstox, Dhan, Zerodha Kite Connect, Angel One | MCX Direct Datafeed, TrueData, Global Datafeeds |
| **Permitted Use** | Personal algorithmic trading, individual account management, internal testing | Multi-user web dashboards, mobile apps, digital signage, financial portals |
| **Redistribution Rights** | ❌ None (Redistribution to third parties is strictly prohibited by broker terms) | ✅ Explicitly granted under signed Exchange Display & Redistribution Agreements |
| **Audit & Compliance** | User-level rate limits & token revocation | Exchange audit compliance, certified symbol master, SLA guarantees |

---

## 2. Environment Modes: `DATA_ACCESS_MODE`

The application enforces a binary configuration mode:

```env
# Mode 1: Development & Prototyping
DATA_ACCESS_MODE=prototype
DATA_PROVIDER=mock # or 'upstox' for internal developer testing only

# Mode 2: Licensed Production (Requires Commercial Vendor Agreement)
DATA_ACCESS_MODE=licensed_production
DATA_PROVIDER=truedata # or 'mcx_direct'
```

### Production Safeguard
When `DATA_ACCESS_MODE=licensed_production` is configured:
1. The server strictly forbids using unverified personal broker keys for multi-tenant redistribution.
2. The UI removes all `SIMULATED DATA` warning badges only when a certified exchange license certificate/configuration is verified.
3. If an unlicensed configuration is detected in production mode, the server will intentionally fail to start and log a critical compliance alert rather than silently redistributing unauthorized data.

---

## 3. Authorized Vendors for Production MCX Market Data

To launch this application to external end-users or clients, obtain an authorized real-time market data feed from one of the following providers:

1. **Multi Commodity Exchange of India Ltd. (MCX Direct)**
   - **Contact**: `datafeed@mcxindia.com` / Business Development (Market Data)
   - **Website**: [https://www.mcxindia.com](https://www.mcxindia.com)
   - **Offerings**: Level 1 (Snapshot / Best Bid-Offer), Level 2 (5-depth market book), Level 3 (Tick-by-tick order data).

2. **TrueData (Authorized MCX & NSE Data Vendor)**
   - **Contact**: `support@truedata.in` / Enterprise Sales
   - **Website**: [https://www.truedata.in](https://www.truedata.in)
   - **Offerings**: Realtime WebSocket feeds, historical REST APIs, display redistribution licenses for web & mobile apps.

3. **Global Datafeeds (Authorized Market Data Vendor)**
   - **Contact**: `sales@globaldatafeeds.in`
   - **Website**: [https://www.globaldatafeeds.in](https://www.globaldatafeeds.in)
   - **Offerings**: Low-latency binary/JSON streaming feeds for Indian financial exchanges.

---

## 4. Compliance Checklist Before Going Live

- [ ] Sign MCX Market Data Agreement or Authorized Distributor Redistribution Agreement.
- [ ] Determine distribution model: Real-time (0-second delay), Snapshot (e.g. 5-second interval), or Delayed (15-minute delay).
- [ ] Configure `DATA_ACCESS_MODE=licensed_production` with verified credentials.
- [ ] Ensure customer-facing disclaimer is visible in the UI footer: *"Market data displayed under license from [Authorized Provider / MCX]. All rights reserved."*
- [ ] Ensure separation between Raw Exchange Prices and Customer Derived Prices (GST, Custom Duty) as required by internal business logic.
