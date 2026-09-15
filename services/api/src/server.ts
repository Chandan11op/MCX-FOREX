import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import { MarketDataEngine } from '@mcx/service-market-data';
import { SocketGateway } from './realtime/SocketGateway.js';
import { createMarketRouter } from './routes/marketRoutes.js';
import { createAdminRouter } from './routes/adminRoutes.js';
import { createExportRouter } from './routes/exportRoutes.js';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
const HOST = process.env.HOST || '0.0.0.0';
const CORS_ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000').split(',');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps, curl, MCP)
    if (!origin || CORS_ORIGINS.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for local dev
  },
  credentials: true,
}));
app.use(express.json());

// Initialize Market Data Engine & Providers
const providerType = process.env.DATA_PROVIDER || 'mock';
const staleThresholdMs = process.env.STALE_TICK_THRESHOLD_MS ? parseInt(process.env.STALE_TICK_THRESHOLD_MS, 10) : 5000;
const marketEngine = new MarketDataEngine(providerType, staleThresholdMs);

// Initialize Socket.IO Gateway
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
const socketGateway = new SocketGateway(io, marketEngine);

// Mount API Routes
app.use('/api', createMarketRouter(marketEngine));
app.use('/api/admin', createAdminRouter(marketEngine));
app.use('/api/export', createExportRouter(marketEngine));

// Root info
app.get('/', (req, res) => {
  res.json({
    name: 'MCX Commodity Live Market Platform API',
    version: '1.0.0',
    mode: process.env.DATA_ACCESS_MODE || 'prototype',
    provider: providerType,
    endpoints: {
      health: '/api/health',
      commodities: '/api/commodities',
      marketStatus: '/api/market/status',
      pricingRules: '/api/admin/pricing-rules',
      export: '/api/export',
    },
  });
});

// Start Market Engine and HTTP Server
async function bootstrap() {
  try {
    console.log(`[Server] Starting Market Data Engine with provider: ${providerType}...`);
    await marketEngine.start();
    console.log(`[Server] Market Data Engine active.`);

    server.listen(PORT, HOST, () => {
      console.log(`[Server] MCX Live Market API running at http://${HOST}:${PORT}`);
      console.log(`[Server] WebSocket gateway listening for Socket.IO clients.`);
    });
  } catch (err) {
    console.error('[Server] Fatal bootstrap error:', err);
    process.exit(1);
  }
}

bootstrap();

export { app, server, marketEngine };
