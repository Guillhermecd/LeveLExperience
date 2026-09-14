import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest, ApiError } from './api';
import { clearTokens, setTokens } from './tokenStore';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('apiRequest', () => {
  beforeEach(() => {
    clearTokens();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('never sends an Idempotency-Key on a GET request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    await apiRequest('/api/board');

    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
    expect(headers['Idempotency-Key']).toBeUndefined();
  });

  it('sends a freshly generated Idempotency-Key on a mutating request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    await apiRequest('/api/cards/c1/move', { method: 'POST', body: { to: 'done' } });

    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
    expect(headers['Idempotency-Key']).toMatch(/^[0-9a-f-]{36}$/);
  });

  // Gate 4.3: a retry (here, the 401->refresh->retry path) reuses the same
  // key instead of generating a new one — otherwise the server sees it as
  // two distinct actions and settles XP twice.
  it('retries after a 401 with the SAME Idempotency-Key it used on the first attempt', async () => {
    setTokens('expired-access-token', 'valid-refresh-token');

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, { timestamp: '2026-01-01T00:00:00Z', status: 401, error: 'Unauthorized', message: 'expired' }))
      .mockResolvedValueOnce(
        jsonResponse(200, {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          accessExpiresInSeconds: 900,
          user: { id: 'u1' },
        }),
      )
      .mockResolvedValueOnce(jsonResponse(200, { moved: true }));
    vi.stubGlobal('fetch', fetchMock);

    await apiRequest('/api/cards/c1/move', { method: 'POST', body: { to: 'done' } });

    expect(fetchMock).toHaveBeenCalledTimes(3); // original attempt, refresh, retry
    const firstAttemptHeaders = fetchMock.mock.calls[0][1].headers as Record<string, string>;
    const retryHeaders = fetchMock.mock.calls[2][1].headers as Record<string, string>;
    expect(retryHeaders['Idempotency-Key']).toBe(firstAttemptHeaders['Idempotency-Key']);
    expect(retryHeaders.Authorization).toBe('Bearer new-access-token');
  });

  it('does not retry a 401 on auth endpoints (skipAuthRetry)', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse(401, { timestamp: '2026-01-01T00:00:00Z', status: 401, error: 'Unauthorized', message: 'bad credentials' }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      apiRequest('/api/auth/login', { method: 'POST', body: { email: 'a@b.com', password: 'x' }, skipAuthRetry: true }),
    ).rejects.toBeInstanceOf(ApiError);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws ApiError with the parsed message on a non-2xx response', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        jsonResponse(404, { timestamp: '2026-01-01T00:00:00Z', status: 404, error: 'Not Found', message: 'Card não encontrado.' }),
      );
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiRequest('/api/cards/missing')).rejects.toMatchObject({
      status: 404,
      message: 'Card não encontrado.',
    });
  });

  it('tolerates a non-JSON error body (e.g. a missing-header 400 from Spring defaults)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('Bad Request', { status: 400 }));
    vi.stubGlobal('fetch', fetchMock);

    const error = await apiRequest('/api/cards/c1/move', { method: 'POST', body: { to: 'done' } }).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(400);
    expect((error as ApiError).body).toBeNull();
  });
});
