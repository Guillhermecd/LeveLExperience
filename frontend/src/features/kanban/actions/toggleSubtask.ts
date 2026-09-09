import { xpSubtask } from '../xpRulesTable';
import type { BoardAction, BoardSimState, XpEvent } from '../types';
import { applyEvent } from './applyEvent';

export function applyToggleSubtask(
  state: BoardSimState,
  action: Extract<BoardAction, { type: 'toggle_subtask' }>,
  today: string,
): { state: BoardSimState; events: XpEvent[] } {
  const subtask = state.subtasks.find((s) => s.id === action.subtaskId);
  if (!subtask || subtask.done === action.done) return { state, events: [] };

  const newSubtasks = state.subtasks.map((s) =>
    s.id === action.subtaskId ? { ...s, done: action.done } : s,
  );

  if (!action.done) {
    // Unchecking never reverses XP (PLAN.md decision — subtask +5, no reversal).
    return { state: { ...state, subtasks: newSubtasks }, events: [] };
  }

  const event: XpEvent = { reason: 'subtask_done', delta: xpSubtask, refId: subtask.id };
  const stats = applyEvent(state.stats, event, today);
  return { state: { ...state, subtasks: newSubtasks, stats }, events: [event] };
}
