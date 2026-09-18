# MCX-FOREX Development Guide

## Environment Setup

1. Ensure Node.js (v18+) and MongoDB are installed.
2. Clone repository & configure environment variables:
   ```bash
   cp .env.example server/.env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Workspaces Structure

- `apps/web`: React SPA frontend running on Vite (default port 5173).
- `server`: Express Node.js server (default port 4000).

## Commands

```bash
# Start backend server in dev mode
npm run dev:server

# Start frontend web app in dev mode
npm run dev:web

# Build both applications for production
npm run build
```

## Adding New Commodities or Rules

1. Update `Commodity` & `Instrument` seed definitions in `server/src/config/seed.ts`.
2. Configure pricing rules via `/api/pricing-rules` or database seeds.
