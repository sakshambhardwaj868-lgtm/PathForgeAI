import { describe, it, expect, vi, beforeEach } from 'vitest';
import { safeFetchJson } from '../services/apiClient';

describe('Safe Browser API Client (apiClient.ts)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('safely handles empty response body without throwing "Unexpected end of JSON input"', async () => {
    // Simulate empty response body from broken proxy or gateway
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: {
        get: () => 'text/plain',
      },
      text: async () => '',
    } as any);

    const result = await safeFetchJson('/api/v1/roadmap/generate');

    expect(result.ok).toBe(false);
    expect(result.status).toBe(500);
    expect(result.data).toBeNull();
    expect(result.error).toContain('empty response body');
    expect(result.error).not.toContain('Unexpected end of JSON input');
  });

  it('safely handles non-JSON / HTML error responses from Vite proxy or reverse proxies', async () => {
    // Simulate Vite proxy HTML error response
    const htmlResponse = '<html><body><h1>504 Gateway Timeout</h1><p>Connection timed out</p></body></html>';
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 504,
      headers: {
        get: () => 'text/html',
      },
      text: async () => htmlResponse,
    } as any);

    const result = await safeFetchJson('/api/v1/roadmap/generate');

    expect(result.ok).toBe(false);
    expect(result.status).toBe(504);
    expect(result.error).toContain('non-JSON response (HTTP 504)');
    expect(result.error).toContain('504 Gateway Timeout');
    expect(result.error).not.toContain('Unexpected end of JSON input');
  });

  it('safely handles malformed truncated JSON output without crashing', async () => {
    const malformedJson = '{"success": true, "data": {"targetRole": "Cloud Eng';
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      text: async () => malformedJson,
    } as any);

    const result = await safeFetchJson('/api/v1/roadmap/generate');

    expect(result.ok).toBe(false);
    expect(result.error).toContain('non-JSON response');
  });

  it('successfully returns parsed data for valid JSON response', async () => {
    const validPayload = { success: true, data: { id: 'rm-1', targetRole: 'DevOps' } };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      text: async () => JSON.stringify(validPayload),
    } as any);

    const result = await safeFetchJson('/api/v1/roadmap/generate');

    expect(result.ok).toBe(true);
    expect(result.status).toBe(200);
    expect(result.data).toEqual(validPayload);
    expect(result.error).toBeNull();
  });

  it('safely handles network disconnection or socket errors', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    const result = await safeFetchJson('/api/v1/roadmap/generate');

    expect(result.ok).toBe(false);
    expect(result.status).toBe(0);
    expect(result.error).toContain('Unable to connect to PathForge AI backend server');
    expect(result.error).not.toContain('Unexpected end of JSON input');
  });
});
