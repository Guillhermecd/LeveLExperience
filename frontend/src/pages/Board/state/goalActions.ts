import { v4 as uuid } from 'uuid';
import type { Goal, GoalScope } from '../../../types/board';

/** Pure goal-array transitions. See cardActions.ts for why these are separate. */
export function toggleGoal(goals: Goal[], goalId: string): Goal[] {
  return goals.map((g) => (g.id === goalId ? { ...g, done: !g.done } : g));
}

export function removeGoal(goals: Goal[], goalId: string): Goal[] {
  return goals.filter((g) => g.id !== goalId);
}

export function updateGoalTitle(goals: Goal[], goalId: string, title: string): Goal[] {
  return goals.map((g) => (g.id === goalId ? { ...g, title } : g));
}

export function addGoal(goals: Goal[], scope: GoalScope, title: string, id: string = uuid()): Goal[] {
  const nextPosition =
    Math.max(0, ...goals.filter((g) => g.scope === scope).map((g) => g.position)) + 1;
  return [...goals, { id, scope, title, done: false, position: nextPosition }];
}
