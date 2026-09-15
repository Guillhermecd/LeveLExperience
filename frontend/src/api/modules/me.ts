import { apiRequest } from '../api';
import type { UserDto } from './auth';

export function getMe(): Promise<UserDto> {
  return apiRequest('/api/me');
}

export function exportMe(): Promise<unknown> {
  return apiRequest('/api/me/export');
}

export function deleteAccount(): Promise<void> {
  return apiRequest('/api/me', { method: 'DELETE' });
}
