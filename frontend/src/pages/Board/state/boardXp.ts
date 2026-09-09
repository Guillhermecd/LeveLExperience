import { applyAction } from '../../../features/kanban/reducer';
import type { BoardAction, BoardSimState, LedgerStats, XpEvent } from '../../../features/kanban/types';
import type { Card, Goal } from '../../../types/board';

/**
 * Bridges the UI's `Card`/`Goal` shape (title, tags, nested subtasks) and
 * the reducer's minimal `SimState` (only the fields XP math needs). The
 * translation is one-way and lives only here — nothing else imports both
 * shapes together.
 */
function toSimState(cards: Card[], goals: Goal[], stats: LedgerStats): BoardSimState {
  return {
    cards: cards.map((c) => ({ id: c.id, column: c.columnKey, priority: c.priority })),
    goals: goals.map((g) => ({ id: g.id, scope: g.scope, done: g.done })),
    subtasks: cards.flatMap((c) => c.subtasks.map((s) => ({ id: s.id, cardId: c.id, done: s.done }))),
    stats,
  };
}

export type BoardXpResult = {
  cards: Card[];
  goals: Goal[];
  stats: LedgerStats;
  events: XpEvent[];
};

/** Runs one reducer action and folds the result back onto the UI arrays. */
export function applyBoardXpAction(
  cards: Card[],
  goals: Goal[],
  stats: LedgerStats,
  action: BoardAction,
  today: string,
): BoardXpResult {
  const sim = toSimState(cards, goals, stats);
  const { state, events } = applyAction(sim, action, today);
  if (events.length === 0) return { cards, goals, stats, events };

  const newCards = cards.map((card) => {
    const simCard = state.cards.find((sc) => sc.id === card.id);
    const subtasks = card.subtasks.map((subtask) => {
      const simSubtask = state.subtasks.find((ss) => ss.id === subtask.id);
      return simSubtask ? { ...subtask, done: simSubtask.done } : subtask;
    });
    return simCard ? { ...card, columnKey: simCard.column, subtasks } : { ...card, subtasks };
  });

  const newGoals = goals.map((goal) => {
    const simGoal = state.goals.find((sg) => sg.id === goal.id);
    return simGoal ? { ...goal, done: simGoal.done } : goal;
  });

  return { cards: newCards, goals: newGoals, stats: state.stats, events };
}
