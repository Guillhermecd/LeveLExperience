import { v4 as uuid } from 'uuid';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './tokenStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:1337';

export type ErrorResponse = {
  timestamp: string;
  status: number;
  error: string;
  message: string;
};

export class ApiError extends Error {
  readonly status: number;
  readonly body: ErrorResponse | null;

  constructor(status: number, body: ErrorResponse | null) {
    super(body?.message ?? `Falha na requisição (HTTP ${status}).`);
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Auth endpoints (register/login/refresh/logout) never trigger the 401->refresh->retry loop. */
  skipAuthRetry?: boolean;
};

// One promise shared by every request that races into a 401 at the same
// time — without this, three concurrent requests failing together would
// each rotate the refresh token and only one retry would survive.
let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  if (!refreshInFlight) {
    refreshInFlight = rawRequest('/api/auth/refresh', { method: 'POST', body: { refreshToken } })
      .then((response) => {
        const { accessToken, refreshToken: nextRefreshToken } = response as {
          accessToken: string;
          refreshToken: string;
        };
        setTokens(accessToken, nextRefreshToken);
        return true;
      })
      .catch(() => {
        clearTokens();
        return false;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

async function parseErrorBody(response: Response): Promise<ErrorResponse | null> {
  try {
    return (await response.json()) as ErrorResponse;
  } catch {
    // Spring's default error body (e.g. a missing required header) isn't
    // shaped like ErrorResponse, or there's no body at all — the status
    // code alone still carries enough for the caller to react correctly.
    return null;
  }
}

async function rawRequest(path: string, options: RequestOptions, idempotencyKey?: string): Promise<unknown> {
  const { method = 'GET', body } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }

  const accessToken = getAccessToken();
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.ok) {
    if (response.status === 204) return undefined;
    return response.json();
  }

  throw new ApiError(response.status, await parseErrorBody(response));
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  // Generated once per call and reused across the 401->refresh->retry below
  // — a resent request with a fresh key would defeat the idempotency
  // protection entirely (PLAN.md "Fase 4 — Integração").
  const idempotencyKey = options.method && options.method !== 'GET' ? uuid() : undefined;

  try {
    return (await rawRequest(path, options, idempotencyKey)) as T;
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 401 &&
      !options.skipAuthRetry &&
      (await refreshSession())
    ) {
      return (await rawRequest(path, options, idempotencyKey)) as T;
    }
    throw error;
  }
}
