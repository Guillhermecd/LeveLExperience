import { apiRequest } from '../api';

export type FocusSessionDto = {
  id: string;
  cardId: string;
  plannedMinutes: number;
  startedAt: string;
  endedAt: string | null;
  status: 'running' | 'paused' | 'completed' | 'abandoned';
};

export function startFocus(cardId: string, plannedMinutes: number): Promise<FocusSessionDto> {
  return apiRequest('/api/focus', { method: 'POST', body: { cardId, plannedMinutes } });
}

export function finishFocus(
  sessionId: string,
  outcome: 'completed' | 'abandoned',
): Promise<FocusSessionDto> {
  return apiRequest(`/api/focus/${sessionId}/finish`, { method: 'POST', body: { outcome } });
}
