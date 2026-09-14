import { apiRequest } from '../api';
import { clearTokens, getRefreshToken, setTokens } from '../tokenStore';

export type UserDto = {
  id: string;
  email: string;
  name: string | null;
  timezone: string;
  showGoals: boolean;
  emailVerified: boolean;
};

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  accessExpiresInSeconds: number;
  user: UserDto;
};

export async function register(input: {
  inviteCode: string;
  email: string;
  password: string;
  name?: string;
}): Promise<UserDto> {
  const response = await apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: input,
    skipAuthRetry: true,
  });
  setTokens(response.accessToken, response.refreshToken);
  return response.user;
}

export async function login(input: { email: string; password: string }): Promise<UserDto> {
  const response = await apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: input,
    skipAuthRetry: true,
  });
  setTokens(response.accessToken, response.refreshToken);
  return response.user;
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  clearTokens();
  if (!refreshToken) return;
  // Best-effort: the local session is already cleared either way.
  await apiRequest<void>('/api/auth/logout', {
    method: 'POST',
    body: { refreshToken },
    skipAuthRetry: true,
  }).catch(() => undefined);
}

export function isAuthenticated(): boolean {
  return getRefreshToken() !== null;
}
