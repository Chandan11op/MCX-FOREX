# Provider Integration Guide

## 1. Supported Providers

### 1.1 Mock Simulator (`DATA_PROVIDER=mock`)
A high-fidelity market simulator used for local development, UI validation, and CI testing.
Features:
- Geometric Brownian motion with mean-reverting volatility.
- Authentic MCX commodity base prices:
  - `GOLD`: ~₹72,450 / 10g
  - `SILVER`: ~₹84,200 / 1kg
  - `COPPER`: ~₹812.50 / 1kg
  - `CRUDE_OIL`: ~₹6,150 / 1 bbl
  - `NATURAL_GAS`: ~₹245.80 / 1 mmBtu
- Realistic bid/ask spreads, order book depths, volume bursts, and open interest accumulation.
- Configurable failure modes (simulated network lag, packet drops).

### 1.2 Upstox Adapter (`DATA_PROVIDER=upstox`)
Used for developer prototyping and WebSocket feed validation.
- **Authentication**: OAuth 2.0 or developer access token.
- **Instrument Master**: Discovers active MCX contracts dynamically from Upstox instrument files.
- **WebSocket Protocol**: Protobuf binary feed or JSON market stream.
- **Normalization**: Translates Upstox LTPC / Full feed payloads into `CanonicalTick`.

### 1.3 TrueData / Production Provider (`DATA_PROVIDER=truedata`)
Used for production deployments with valid commercial redistribution licenses.

---

## 2. Dynamic Contract Selection Strategy

MCX commodity futures expire periodically (monthly / bi-monthly). The platform resolves active contracts using configurable selection rules:

```yaml
GOLD:
  exchange: MCX
  underlying: GOLD
  selection: nearest_active # Selects the closest future expiry with active liquidity
```

The resolution engine computes:
$$\text{Expiry} = \min \{ e \in \text{Expiries} \mid e \ge \text{Today} + \text{RolloverBufferDays} \}$$
This prevents hardcoded expired contract symbols.
