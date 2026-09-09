import { xpFocusMinimum } from '../xpRulesTable';
import type { BoardAction, BoardSimState, XpEvent } from '../types';
import { applyEvent } from './applyEvent';

export function applyFinishFocus(
  state: BoardSimState,
  action: Extract<BoardAction, { type: 'finish_focus' }>,
  today: string,
): { state: BoardSimState; events: XpEvent[] } {
  if (action.outcome !== 'completed') return { state, events: [] };

  const delta = Math.max(xpFocusMinimum, Math.min(action.elapsedMinutes, action.plannedMinutes));
  const event: XpEvent = { reason: 'focus_session', delta, refId: action.cardId };
  const stats = applyEvent(state.stats, event, today);
  return { state: { ...state, stats }, events: [event] };
}
