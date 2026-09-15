# Deployment & Infrastructure Guide

## 1. Hosting Architecture

| Component | Target Platform | Notes |
| :--- | :--- | :--- |
| **Web Frontend** | Vercel, Cloudflare Pages, Netlify, or AWS S3+CloudFront | Static React SPA with SPA routing rewrite rules |
| **API & Realtime Worker** | Railway, Render, Fly.io, AWS ECS / EC2 | Persistent Node.js container (do NOT use serverless functions for the WebSocket ingest worker) |
| **Transient Cache / PubSub** | Upstash Redis, AWS ElastiCache, or Redis Cloud | Low-latency state broker |
| **Time-Series Persistence** | MongoDB Atlas | MongoDB 6+ time-series collections for candle and tick storage |

---

## 2. Environment Variables Summary

```env
NODE_ENV=production
PORT=4000
HOST=0.0.0.0
CORS_ORIGIN=https://your-domain.com

DATA_PROVIDER=mock
DATA_ACCESS_MODE=prototype

MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/mcx_platform?retryWrites=true&w=majority
REDIS_URL=redis://default:<password>@redis-server:6379

JWT_SECRET=your-secure-production-jwt-key
ADMIN_API_KEY=your-secure-admin-api-key
```

---

## 3. Production Deployment Checklist

1. **Exchange Licensing**: Verify `DATA_ACCESS_MODE=licensed_production` is backed by valid vendor agreements (see `docs/MARKET-DATA-LICENSING.md`).
2. **Persistent Ingestion**: Ensure the Node.js process has health checks, auto-restart policies (PM2 / Kubernetes / Docker restart policies).
3. **CORS & Rate Limiting**: Restrict `CORS_ORIGIN` to production domains and enable Redis-backed rate limiting.
4. **SSL / TLS**: Enforce HTTPS and WSS for all WebSocket and REST connections.
