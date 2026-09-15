import { apiRequest } from '../api';
import type { UserDto } from './auth';

export function getProfile(): Promise<UserDto> {
  return apiRequest('/api/me');
}

export function updatePreferences(input: { name: string | null; showGoals: boolean }): Promise<UserDto> {
  return apiRequest('/api/me', { method: 'PATCH', body: input });
}

export function exportMe(): Promise<unknown> {
  return apiRequest('/api/me/export');
}

export function deleteAccount(): Promise<void> {
  return apiRequest('/api/me', { method: 'DELETE' });
}
