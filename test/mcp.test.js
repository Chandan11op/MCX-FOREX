import test from 'node:test';
import assert from 'node:assert';
import { spawn } from 'child_process';

test('MCP Server — lists tools and executes introspection methods', async () => {
  const mcp = spawn('node', ['mcp/market-data-mcp/index.js']);
  let responses = [];

  mcp.stdout.on('data', (chunk) => {
    const lines = chunk.toString().split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        responses.push(JSON.parse(line));
      } catch (e) {
        // ignore
      }
    }
  });

  // 1. Initialize
  mcp.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize' }) + '\n');
  await new Promise((r) => setTimeout(r, 200));

  // 2. tools/list
  mcp.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' }) + '\n');
  await new Promise((r) => setTimeout(r, 200));

  // 3. tools/call get_supported_commodities
  mcp.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: { name: 'get_supported_commodities', arguments: {} }
  }) + '\n');
  await new Promise((r) => setTimeout(r, 200));

  // 4. tools/call validate_provider_configuration
  mcp.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: { name: 'validate_provider_configuration', arguments: {} }
  }) + '\n');
  await new Promise((r) => setTimeout(r, 300));

  mcp.kill();

  const initRes = responses.find((r) => r.id === 1);
  assert.strictEqual(initRes.result.serverInfo.name, 'market-data-mcp');

  const listRes = responses.find((r) => r.id === 2);
  assert.ok(listRes.result.tools.length >= 6, 'Expected at least 6 MCP tools');

  const commRes = responses.find((r) => r.id === 3);
  const commData = JSON.parse(commRes.result.content[0].text);
  assert.strictEqual(commData.length, 5);
  assert.strictEqual(commData[0].code, 'GOLD');

  const valRes = responses.find((r) => r.id === 4);
  const valData = JSON.parse(valRes.result.content[0].text);
  assert.strictEqual(valData.isLicensedProduction, false);
  assert.ok(valData.complianceNotice.includes('PROTOTYPE MODE'));
});
