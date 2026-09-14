import type { Subtask } from '../../types/board';
import { apiRequest } from '../api';

export function createSubtask(cardId: string, input: { id: string; title: string }): Promise<Subtask> {
  return apiRequest(`/api/cards/${cardId}/subtasks`, { method: 'POST', body: input });
}

export function updateSubtask(subtaskId: string, input: { title: string }): Promise<Subtask> {
  return apiRequest(`/api/subtasks/${subtaskId}`, { method: 'PATCH', body: input });
}

export function toggleSubtask(subtaskId: string, done: boolean): Promise<Subtask> {
  return apiRequest(`/api/subtasks/${subtaskId}/toggle`, { method: 'POST', body: { done } });
}

export function deleteSubtask(subtaskId: string): Promise<void> {
  return apiRequest(`/api/subtasks/${subtaskId}`, { method: 'DELETE' });
}
