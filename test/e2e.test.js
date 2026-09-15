import test from 'node:test';
import assert from 'node:assert';
import http from 'http';
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { io as ClientSocketIO } from 'socket.io-client';
import { MarketDataEngine } from '../services/market-data/dist/engine/MarketDataEngine.js';
import { SocketGateway } from '../services/api/dist/realtime/SocketGateway.js';
import { createMarketRouter } from '../services/api/dist/routes/marketRoutes.js';
import { createAdminRouter } from '../services/api/dist/routes/adminRoutes.js';
import { createExportRouter } from '../services/api/dist/routes/exportRoutes.js';
test('E2E — Full Lifecycle: Mock Stream -> Socket.IO -> Disconnect -> Offline Sync -> Export', async () => {
    const TEST_PORT = 4999;
    const app = express();
    app.use(express.json());
    const server = http.createServer(app);
    const engine = new MarketDataEngine('mock', 5000);
    await engine.start();
    const ioServer = new SocketIOServer(server, { cors: { origin: '*' } });
    const gateway = new SocketGateway(ioServer, engine);
    app.use('/api', createMarketRouter(engine));
    app.use('/api/admin', createAdminRouter(engine));
    app.use('/api/export', createExportRouter(engine));
    await new Promise((resolve) => {
        server.listen(TEST_PORT, () => resolve());
    });
    try {
        // 1. Connect Client via Socket.IO
        const client = ClientSocketIO(`http://localhost:${TEST_PORT}`, {
            transports: ['websocket'],
        });
        const ticksReceived = [];
        let initialInitReceived = false;
        client.on('market:init', (data) => {
            initialInitReceived = true;
            assert.ok(data.snapshots.length >= 5, 'Expected snapshots for 5 commodities');
        });
        client.on('market:tick', (tick) => {
            ticksReceived.push(tick);
        });
        // Wait for connection and initial stream
        await new Promise((resolve) => {
            client.on('connect', () => {
                resolve();
            });
        });
        // Collect ticks for 600ms
        await new Promise((resolve) => setTimeout(resolve, 600));
        assert.ok(initialInitReceived, 'Expected market:init event on socket connection');
        assert.ok(ticksReceived.length > 0, 'Expected live ticks received via Socket.IO');
        // 2. Simulate Client Disconnect (Network loss)
        client.disconnect();
        const tickCountAtDisconnect = ticksReceived.length;
        // Server continues streaming in background
        await new Promise((resolve) => setTimeout(resolve, 500));
        // 3. Client Reconnect & Offline Sync Catchup
        const syncRes = await fetch(`http://localhost:${TEST_PORT}/api/commodities/GOLD/sync?sinceSequence=1`);
        assert.strictEqual(syncRes.status, 200);
        const syncData = await syncRes.json();
        assert.strictEqual(syncData.commodity, 'GOLD');
        assert.ok(syncData.currentSequence >= 0);
        assert.ok(syncData.snapshot.ltp > 0);
        assert.ok(syncData.candles.length > 0);
        // 4. Admin Pricing Rule Update
        const ruleRes = await fetch(`http://localhost:${TEST_PORT}/api/admin/pricing-rules`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                commodity: 'GOLD',
                gstRate: 3.0,
                customDutyRate: 7.5, // revised 15-day custom duty
                otherCharges: 60.0,
                formulaVersion: 'v1.5-e2e',
            }),
        });
        assert.strictEqual(ruleRes.status, 201);
        const updatedRule = await ruleRes.json();
        assert.strictEqual(updatedRule.rule.customDutyRate, 7.5);
        // Verify snapshot reflects updated calculated price
        const snapRes = await fetch(`http://localhost:${TEST_PORT}/api/commodities/GOLD`);
        const snapData = await snapRes.json();
        assert.strictEqual(snapData.calculatedPrice.customDutyRate, 7.5);
        assert.strictEqual(snapData.calculatedPrice.formulaVersion, 'v1.5-e2e');
        // 5. Excel Export
        const exportRes = await fetch(`http://localhost:${TEST_PORT}/api/export`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                commodity: 'GOLD',
                interval: '1m',
                includeCalculatedPrices: true,
            }),
        });
        assert.strictEqual(exportRes.status, 201);
        const exportData = await exportRes.json();
        assert.ok(exportData.downloadUrl);
        const downloadRes = await fetch(`http://localhost:${TEST_PORT}${exportData.downloadUrl}`);
        assert.strictEqual(downloadRes.status, 200);
        const arrayBuf = await downloadRes.arrayBuffer();
        assert.ok(arrayBuf.byteLength > 1000, 'Exported Excel buffer size is valid');
    }
    finally {
        await engine.stop();
        ioServer.close();
        server.close();
    }
});
//# sourceMappingURL=e2e.test.js.map