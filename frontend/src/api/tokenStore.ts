const ACCESS_KEY = 'kanban.accessToken';
const REFRESH_KEY = 'kanban.refreshToken';

let accessToken: string | null = readStorage(ACCESS_KEY);
let refreshToken: string | null = readStorage(REFRESH_KEY);

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    // Private browsing / storage disabled: fall back to in-memory only.
    return null;
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Same fallback as readStorage — the in-memory copy still works for
    // the lifetime of the tab.
  }
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

export function setTokens(nextAccessToken: string, nextRefreshToken: string) {
  accessToken = nextAccessToken;
  refreshToken = nextRefreshToken;
  writeStorage(ACCESS_KEY, nextAccessToken);
  writeStorage(REFRESH_KEY, nextRefreshToken);
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  writeStorage(ACCESS_KEY, null);
  writeStorage(REFRESH_KEY, null);
}
