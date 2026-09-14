import { apiRequest } from '../api';

export function exportMe(): Promise<unknown> {
  return apiRequest('/api/me/export');
}

export function deleteAccount(): Promise<void> {
  return apiRequest('/api/me', { method: 'DELETE' });
}
