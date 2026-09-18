import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import marketRoutes from './routes/marketRoutes';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

// Mount Market API Routes
app.use('/api', marketRoutes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'MCX-FOREX Server',
    dataProvider: process.env.DATA_PROVIDER || 'commoditypriceapi',
    version: '1.0.0',
  });
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`[MCX-FOREX Server] Running on port ${PORT}`);
    console.log(`[MCX-FOREX Server] DATA_PROVIDER=${process.env.DATA_PROVIDER || 'commoditypriceapi'}`);
  });
}

export default app;
