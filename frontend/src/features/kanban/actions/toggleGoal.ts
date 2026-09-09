import { xpGoalByScope } from '../xpRulesTable';
import type { BoardAction, BoardSimState, XpEvent } from '../types';
import { applyEvent } from './applyEvent';

export function applyToggleGoal(
  state: BoardSimState,
  action: Extract<BoardAction, { type: 'toggle_goal' }>,
  today: string,
): { state: BoardSimState; events: XpEvent[] } {
  const goal = state.goals.find((g) => g.id === action.goalId);
  if (!goal || goal.done === action.done) return { state, events: [] };

  const newGoals = state.goals.map((g) => (g.id === action.goalId ? { ...g, done: action.done } : g));
  const magnitude = xpGoalByScope[goal.scope];
  const event: XpEvent = {
    reason: action.done ? 'goal_done' : 'goal_undone',
    delta: action.done ? magnitude : -magnitude,
    refId: goal.id,
  };
  const stats = applyEvent(state.stats, event, today);
  return { state: { ...state, goals: newGoals, stats }, events: [event] };
}
