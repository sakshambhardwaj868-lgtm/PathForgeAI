import { describe, it, expect, vi, beforeEach } from 'vitest';
import { safeFetchJson, resolveApiUrl } from '../services/apiClient';

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

  it('correctly resolves API URLs and preserves request method, headers, and body', async () => {
    let capturedUrl = '';
    let capturedInit: RequestInit | undefined;

    globalThis.fetch = vi.fn().mockImplementation((url, init) => {
      capturedUrl = String(url);
      capturedInit = init;
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        text: async () => JSON.stringify({ success: true }),
      });
    });

    const requestBody = JSON.stringify({ targetRole: 'DevOps Lead', experienceLevel: 'Intermediate' });
    const result = await safeFetchJson('/api/v1/roadmap/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token-123',
      },
      body: requestBody,
    });

    expect(result.ok).toBe(true);
    expect(capturedUrl).toContain('/api/v1/roadmap/generate');
    expect(capturedInit?.method).toBe('POST');
    expect((capturedInit?.headers as any)['Content-Type']).toBe('application/json');
    expect((capturedInit?.headers as any)['Authorization']).toBe('Bearer test-token-123');
    expect(capturedInit?.body).toBe(requestBody);
  });

  it('resolves production live Render URL when running on deployed domain', () => {
    const originalLocation = window.location;
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = { hostname: 'path-forge-ai-rho.vercel.app' };

    const resolved = resolveApiUrl('/api/v1/roadmap/generate');
    expect(resolved).toBe('https://pathforgeai-fgjf.onrender.com/api/v1/roadmap/generate');

    // @ts-ignore
    window.location = originalLocation;
  });

  it('preserves relative /api URL on localhost for Vite proxy in local development', () => {
    const originalLocation = window.location;
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = { hostname: 'localhost' };

    const resolved = resolveApiUrl('/api/v1/roadmap/generate');
    expect(resolved).toBe('/api/v1/roadmap/generate');

    // @ts-ignore
    window.location = originalLocation;
  });

  it('preserves external absolute URLs without modification', () => {
    const external = 'https://api.github.com/repos/pathforge/roadmap';
    const resolved = resolveApiUrl(external);
    expect(resolved).toBe(external);
  });
});
