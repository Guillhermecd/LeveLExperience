import { xpCardByPriority, xpCleanDay } from '../xpRulesTable';
import type { BoardAction, BoardSimState, XpEvent } from '../types';
import { applyEvent } from './applyEvent';

function cardXp(priority: 0 | 1 | 2): number {
  return xpCardByPriority[String(priority) as '0' | '1' | '2'];
}

export function applyMoveCard(
  state: BoardSimState,
  action: Extract<BoardAction, { type: 'move_card' }>,
  today: string,
): { state: BoardSimState; events: XpEvent[] } {
  const card = state.cards.find((c) => c.id === action.cardId);
  if (!card || card.column === action.to) return { state, events: [] };

  const previousColumn = card.column;
  const wasDone = previousColumn === 'done';
  const willBeDone = action.to === 'done';
  const newCards = state.cards.map((c) => (c.id === action.cardId ? { ...c, column: action.to } : c));

  const events: XpEvent[] = [];
  let stats = state.stats;

  if (!wasDone && willBeDone) {
    const event: XpEvent = { reason: 'card_done', delta: cardXp(card.priority), refId: card.id };
    events.push(event);
    stats = applyEvent(stats, event, today);

    // Clean-day bonus: this card was the last one in Today, and it just isn't anymore.
    const clearedToday = previousColumn === 'today' && newCards.every((c) => c.column !== 'today');
    if (clearedToday && stats.cleanDayPaid !== today) {
      const cleanEvent: XpEvent = { reason: 'clean_day', delta: xpCleanDay, refId: null };
      events.push(cleanEvent);
      stats = { ...applyEvent(stats, cleanEvent, today), cleanDayPaid: today };
    }
  } else if (wasDone && !willBeDone) {
    const event: XpEvent = { reason: 'card_undone', delta: -cardXp(card.priority), refId: card.id };
    events.push(event);
    stats = applyEvent(stats, event, today);
  }

  if (events.length === 0) return { state, events: [] };
  return { state: { ...state, cards: newCards, stats }, events };
}
