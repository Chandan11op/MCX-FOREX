import { Server as SocketIOServer, Socket } from 'socket.io';
import { MarketDataEngine } from '@mcx/service-market-data';
import { StorageEngine } from '../storage/Store.js';
import { CommodityCode } from '@mcx/shared-types';

export class SocketGateway {
  private io: SocketIOServer;
  private engine: MarketDataEngine;
  private storage: StorageEngine;
  private clientCount = 0;

  constructor(io: SocketIOServer, engine: MarketDataEngine) {
    this.io = io;
    this.engine = engine;
    this.storage = StorageEngine.getInstance();
    this.setupEngineListeners();
    this.setupSocketConnection();
  }

  private setupEngineListeners(): void {
    // Forward canonical ticks to specific commodity room + market:all
    this.engine.onTick((tick) => {
      this.storage.appendTick(tick);
      this.io.to(`commodity:${tick.commodity}`).emit('market:tick', tick);
      this.io.to('market:all').emit('market:tick', tick);
    });

    // Forward snapshot updates
    this.engine.onSnapshot((snapshot) => {
      this.storage.saveSnapshot(snapshot);
      this.io.to(`commodity:${snapshot.commodity}`).emit('market:snapshot', snapshot);
      this.io.to('market:all').emit('market:snapshot', snapshot);
    });

    // Forward candle closures
    this.engine.onCandle((candle) => {
      this.io.to(`commodity:${candle.commodity}`).emit('market:candle', candle);
    });

    // Forward stale/status updates
    this.engine.onStatus((status) => {
      this.io.to(`commodity:${status.commodity}`).emit('market:status', status);
      this.io.to('market:all').emit('market:status', status);
    });
  }

  private setupSocketConnection(): void {
    this.io.on('connection', (socket: Socket) => {
      this.clientCount++;
      const clientIp = socket.handshake.address;

      // Automatically join market:all by default
      socket.join('market:all');

      // Send initial full snapshots for all commodities immediately
      const snapshots = this.engine.getAllSnapshots();
      socket.emit('market:init', {
        serverTimestamp: Date.now(),
        snapshots,
        health: this.engine.getHealth(),
      });

      // Handle custom room subscriptions
      socket.on('subscribe', (data: { rooms?: string[]; commodities?: CommodityCode[] }) => {
        if (data.rooms && Array.isArray(data.rooms)) {
          for (const r of data.rooms) {
            socket.join(r);
          }
        }
        if (data.commodities && Array.isArray(data.commodities)) {
          for (const c of data.commodities) {
            const roomName = `commodity:${c}`;
            socket.join(roomName);
            const snap = this.engine.getSnapshot(c);
            if (snap) {
              socket.emit('market:snapshot', snap);
            }
          }
        }
      });

      socket.on('unsubscribe', (data: { rooms?: string[]; commodities?: CommodityCode[] }) => {
        if (data.rooms && Array.isArray(data.rooms)) {
          for (const r of data.rooms) {
            socket.leave(r);
          }
        }
        if (data.commodities && Array.isArray(data.commodities)) {
          for (const c of data.commodities) {
            socket.leave(`commodity:${c}`);
          }
        }
      });

      // Handle ping/heartbeat latency check
      socket.on('ping:check', (clientTimestamp: number) => {
        socket.emit('pong:ack', {
          clientTimestamp,
          serverTimestamp: Date.now(),
        });
      });

      socket.on('disconnect', () => {
        this.clientCount--;
      });
    });
  }

  public getConnectedClients(): number {
    return this.clientCount;
  }
}
