# MCX Commodity Live Market Platform — API Research Notes

## Recommended starting approach

### POC
Use a provider adapter with a mock provider first. Then integrate Upstox for an MCX WebSocket proof of concept.

### Production
Before public/client-facing launch, obtain the correct MCX real-time display/redistribution rights and use an authorized data vendor or direct exchange feed appropriate to the intended distribution model.

Potential vendors to evaluate:
- MCX direct datafeed
- TrueData
- Global Datafeeds

Do not assume a normal broker API subscription gives permission to redistribute live exchange data to your application's users.

## Five commodities

- Gold
- Silver
- Copper
- Crude Oil
- Natural Gas

These should be represented as configurable underlying commodities. The application must dynamically resolve active MCX contracts and expiries rather than hard-coding an old contract.

## Realtime design

Provider WebSocket -> market-data worker -> normalization -> Redis -> Socket.IO -> clients

Use WebSocket streaming rather than polling every second.

Store:
- latest snapshot
- minute/selected interval candles
- required historical records

Do not persist unlimited raw ticks without a retention strategy.

## Offline design

Client stores last known state locally.

On reconnect:
1. send last sequence/timestamp
2. receive appropriate missed candles/updates
3. receive authoritative current snapshot
4. reconcile
5. mark LIVE

For long offline periods, send a compact catch-up rather than replaying every tick.

## Derived customer price

Keep exchange price separate from business pricing:

exchangePrice
+ GST
+ custom duty
+ other configured charges
= display/customer price

Custom duty must be versioned/effective-dated and editable through admin configuration.

## Free / low-cost development options

- Upstox currently advertises free access to trading and market-data APIs, but access still requires an Upstox developer app/authentication and the exact use/distribution terms must be checked.
- Twelve Data has a free Basic tier/trial, but its commodity coverage/real-time WebSocket limitations do not make it a drop-in replacement for an MCX-authorized live feed.
- Alpha Vantage provides free commodity-related APIs for spot/historical data, but those feeds are not an MCX live futures feed.

These are useful for development/comparison, not proof that you have rights to display live MCX prices to customers.

## Important compliance point

MCX states that non-members interested in displaying exchange data on websites/apps can subscribe to real-time or delayed feeds from MCX or authorized distributors, while public website display rules and redistribution agreements apply. Confirm the exact agreement before launch.

## API key rule

Never commit:
- client secrets
- access tokens
- API keys

Use `.env` locally and managed secrets in production.
