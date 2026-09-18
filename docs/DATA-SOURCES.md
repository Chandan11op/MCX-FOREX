# MCX Data Sources & Data Modes

This document details the data modes supported by MCX-FOREX and the technical requirements for each.

## Supported MCX Data Modes

| Mode | Provider Tag | Data Mode Label | Real-time? | Primary Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **MCX Bhavcopy (EOD)** | `mcx-bhavcopy` | `END OF DAY` | ❌ No | Prototype & historical reporting |
| **MCX Delayed** | `mcx-delayed` | `DELAYED` | ⚠️ 15-min delay | Development & compliance testing |
| **MCX Real-Time** | `mcx-realtime` | `REAL TIME` | ✅ Yes | Production trading terminal |
| **Mock / Demo** | `mock` | `DEMO DATA` | ⚠️ Simulated | Isolated dev/testing |

## Important Notice on Bhavcopy Data

Bhavcopy is the official End-of-Day summary published by Multi Commodity Exchange of India (MCX).
- Contains settlement prices, open, high, low, close, volume, open interest, and contract details.
- Does **NOT** provide live streaming ticks.
- The UI MUST display `DATA SOURCE: MCX BHAVCOPY` and `DATA MODE: END OF DAY` when `DATA_PROVIDER=mcx-bhavcopy`.

## Provider Configuration Switch

To switch between data providers on the backend:
```bash
# In server/.env
DATA_PROVIDER=mcx-bhavcopy # or mock / mcx-realtime
```
The client UI will automatically adjust its status badges based on `/api/provider/status`.
