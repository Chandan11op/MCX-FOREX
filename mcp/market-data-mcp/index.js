#!/usr/bin/env node

/**
 * Market Data MCP Server
 * Exposes developer introspection and health diagnostics tools.
 * Safe: Secrets and raw API keys are strictly redacted.
 */

import http from 'http';

const API_BASE = process.env.API_BASE || 'http://localhost:4000/api';

async function fetchFromApi(endpoint) {
  return new Promise((resolve) => {
    http.get(`${API_BASE}${endpoint}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve({ error: 'Failed to parse API response' });
        }
      });
    }).on('error', (err) => {
      resolve({ error: `API request failed: ${err.message}` });
    });
  });
}

// Tool Handlers
const tools = {
  get_market_provider_status: async () => {
    const health = await fetchFromApi('/health');
    return {
      provider: health?.provider?.providerName || process.env.DATA_PROVIDER || 'mock',
      status: health?.provider?.status || 'connected',
      latencyMs: health?.provider?.latencyMs || 10,
      messagesPerSec: health?.provider?.messagesPerSec || 0,
      accessMode: process.env.DATA_ACCESS_MODE || 'prototype',
    };
  },

  get_supported_commodities: async () => {
    return [
      { code: 'GOLD', name: 'Gold', unit: '10g', exchange: 'MCX' },
      { code: 'SILVER', name: 'Silver', unit: '1 Kg', exchange: 'MCX' },
      { code: 'COPPER', name: 'Copper', unit: '1 Kg', exchange: 'MCX' },
      { code: 'CRUDE_OIL', name: 'Crude Oil', unit: '1 BBL', exchange: 'MCX' },
      { code: 'NATURAL_GAS', name: 'Natural Gas', unit: '1 mmBtu', exchange: 'MCX' },
    ];
  },

  get_current_market_snapshot: async (args) => {
    if (args && args.commodity) {
      return await fetchFromApi(`/commodities/${args.commodity}`);
    }
    return await fetchFromApi('/commodities');
  },

  get_instrument_metadata: async (args) => {
    const commodity = args?.commodity?.toUpperCase() || 'GOLD';
    return {
      commodity,
      exchange: 'MCX',
      segment: 'MCX_FO',
      tickSize: commodity === 'COPPER' ? 0.05 : (commodity === 'NATURAL_GAS' ? 0.1 : 1.0),
      tradingHours: '09:00 - 23:30 / 23:55 IST',
      contractStrategy: 'nearest_active',
      underlying: commodity.replace('_', ''),
    };
  },

  get_data_health: async () => {
    return await fetchFromApi('/admin/data-health');
  },

  validate_provider_configuration: async () => {
    const provider = process.env.DATA_PROVIDER || 'mock';
    const mode = process.env.DATA_ACCESS_MODE || 'prototype';

    const hasUpstoxToken = Boolean(process.env.UPSTOX_ACCESS_TOKEN);
    const hasUpstoxKey = Boolean(process.env.UPSTOX_CLIENT_ID);

    return {
      configuredProvider: provider,
      accessMode: mode,
      isLicensedProduction: mode === 'licensed_production',
      providerCredentialsConfigured: provider === 'upstox' ? (hasUpstoxToken || hasUpstoxKey) : true,
      complianceNotice: mode === 'prototype'
        ? 'PROTOTYPE MODE: Data cannot be redistributed to public customers without MCX data license agreement.'
        : 'PRODUCTION MODE: Certified exchange feed required.',
    };
  },
};

// Handle Standard Input / Output JSON-RPC / MCP Protocol
process.stdin.setEncoding('utf8');
let buffer = '';

process.stdin.on('data', async (chunk) => {
  buffer += chunk;
  const lines = buffer.split('\n');
  buffer = lines.pop(); // keep last incomplete chunk

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const request = JSON.parse(line);
      await handleRpcRequest(request);
    } catch (e) {
      console.error('Invalid JSON line:', line, e);
    }
  }
});

async function handleRpcRequest(req) {
  const { id, method, params } = req;

  if (method === 'initialize') {
    sendResponse({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'market-data-mcp', version: '1.0.0' },
      },
    });
    return;
  }

  if (method === 'tools/list') {
    sendResponse({
      jsonrpc: '2.0',
      id,
      result: {
        tools: [
          {
            name: 'get_market_provider_status',
            description: 'Get connection and health status of the active market data provider',
            inputSchema: { type: 'object', properties: {} },
          },
          {
            name: 'get_supported_commodities',
            description: 'List all supported MCX commodities and exchange metadata',
            inputSchema: { type: 'object', properties: {} },
          },
          {
            name: 'get_current_market_snapshot',
            description: 'Get current real-time market snapshots and prices',
            inputSchema: {
              type: 'object',
              properties: {
                commodity: { type: 'string', description: 'Optional commodity filter (GOLD, SILVER, COPPER, CRUDE_OIL, NATURAL_GAS)' },
              },
            },
          },
          {
            name: 'get_instrument_metadata',
            description: 'Get instrument contract specifications, tick sizes, and trading rules',
            inputSchema: {
              type: 'object',
              properties: {
                commodity: { type: 'string', description: 'Commodity code' },
              },
              required: ['commodity'],
            },
          },
          {
            name: 'get_data_health',
            description: 'Get deep diagnostic metrics, memory, uptime, latency, and error counts',
            inputSchema: { type: 'object', properties: {} },
          },
          {
            name: 'validate_provider_configuration',
            description: 'Validate data provider compliance and environment configuration without leaking secrets',
            inputSchema: { type: 'object', properties: {} },
          },
        ],
      },
    });
    return;
  }

  if (method === 'tools/call') {
    const toolName = params?.name;
    const toolArgs = params?.arguments || {};
    const handler = tools[toolName];

    if (!handler) {
      sendResponse({
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Tool not found: ${toolName}` },
      });
      return;
    }

    try {
      const data = await handler(toolArgs);
      sendResponse({
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        },
      });
    } catch (err) {
      sendResponse({
        jsonrpc: '2.0',
        id,
        error: { code: -32000, message: err.message },
      });
    }
    return;
  }

  // Generic method acknowledgment
  sendResponse({
    jsonrpc: '2.0',
    id,
    result: {},
  });
}

function sendResponse(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n');
}
