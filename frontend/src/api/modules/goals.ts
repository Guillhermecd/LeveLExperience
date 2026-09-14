import type { Goal, GoalScope } from '../../types/board';
import { apiRequest } from '../api';

export function createGoal(input: { id: string; scope: GoalScope; title: string }): Promise<Goal> {
  return apiRequest('/api/goals', { method: 'POST', body: input });
}

export function updateGoal(goalId: string, input: { title: string }): Promise<Goal> {
  return apiRequest(`/api/goals/${goalId}`, { method: 'PATCH', body: input });
}

export function toggleGoal(goalId: string, done: boolean): Promise<Goal> {
  return apiRequest(`/api/goals/${goalId}/toggle`, { method: 'POST', body: { done } });
}

export function deleteGoal(goalId: string): Promise<void> {
  return apiRequest(`/api/goals/${goalId}`, { method: 'DELETE' });
}
