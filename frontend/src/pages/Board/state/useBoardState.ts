import { message } from 'antd';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { ApiError } from '../../../api/api';
import { readBoardCache, writeBoardCache } from '../../../api/boardCache';
import * as boardApi from '../../../api/modules/board';
import * as cardsApi from '../../../api/modules/cards';
import * as focusApi from '../../../api/modules/focus';
import * as goalsApi from '../../../api/modules/goals';
import type { StatsDto } from '../../../api/modules/stats';
import * as statsApi from '../../../api/modules/stats';
import * as subtasksApi from '../../../api/modules/subtasks';
import type { LedgerStats } from '../../../features/kanban/types';
import type { BoardColumn, Card, DayHistoryEntry, Goal, GoalScope } from '../../../types/board';
import * as cardActions from './cardActions';
import * as goalActions from './goalActions';
import { useEditingState } from './useEditingState';
import { useFocusSession } from './useFocusSession';
import { useFocusTimer } from './useFocusTimer';
import { initialStats, useXpDispatch } from './useXpDispatch';

function toLedgerStats(dto: StatsDto): LedgerStats {
  return {
    rawTotal: dto.rawTotal,
    streak: dto.streak,
    lastXpDay: dto.lastXpDay,
    cleanDayPaid: dto.cleanDayPaid,
    dayXp: dto.dayXp,
    dayDone: dto.dayDone,
  };
}

function toDayHistory(dto: StatsDto): DayHistoryEntry[] {
  return dto.history.map((entry) => ({ day: entry.day, xp: entry.xp, done: entry.done }));
}

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Falha de rede. A alteração foi desfeita.';
}

/**
 * Every mutation applies to local state immediately (PLAN.md "UI otimista"),
 * then fires the matching request; a failure reverts the cards/goals/stats
 * snapshot and shows an error (GATES.md 4.4). A 409 on /move reloads the
 * board instead of reverting (GATES.md 4.5). Card/goal ids are generated
 * client-side (PLAN.md decision #2) so the optimistic row and the request
 * body always agree on identity.
 */
export function useBoardState() {
  const cache = readBoardCache();
  const [cards, setCards] = useState<Card[]>(cache?.cards ?? []);
  const [goals, setGoals] = useState<Goal[]>(cache?.goals ?? []);
  const [history, setHistory] = useState<DayHistoryEntry[]>(cache?.history ?? []);
  // A cache hit paints instantly and skips the spinner; GET /board still
  // runs underneath and reconciles the state below once it lands.
  const [loading, setLoading] = useState(cache === null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const xp = useXpDispatch(cache?.stats ?? initialStats);
  const focusSession = useFocusSession();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [board, stats] = await Promise.all([boardApi.getBoard(), statsApi.getStats()]);
        if (cancelled) return;
        const ledgerStats = toLedgerStats(stats);
        const dayHistory = toDayHistory(stats);
        setCards(board.cards);
        setGoals(board.goals);
        xp.setStats(ledgerStats);
        setHistory(dayHistory);
        writeBoardCache({ cards: board.cards, goals: board.goals, history: dayHistory, stats: ledgerStats });
      } catch (error) {
        // A stale cache is still a better boot than an error screen.
        if (!cancelled && cache === null) setLoadError(errorMessage(error));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once on mount
  }, []);

  async function reloadBoard() {
    const [board, stats] = await Promise.all([boardApi.getBoard(), statsApi.getStats()]);
    const ledgerStats = toLedgerStats(stats);
    const dayHistory = toDayHistory(stats);
    setCards(board.cards);
    setGoals(board.goals);
    xp.setStats(ledgerStats);
    setHistory(dayHistory);
    writeBoardCache({ cards: board.cards, goals: board.goals, history: dayHistory, stats: ledgerStats });
  }

  /** Applies `apply` immediately, then runs `request` — reverting the snapshot on failure. */
  async function withRollback(apply: () => void, request: () => Promise<unknown>) {
    const cardsSnapshot = cards;
    const goalsSnapshot = goals;
    const statsSnapshot = xp.stats;
    apply();
    try {
      await request();
    } catch (error) {
      setCards(cardsSnapshot);
      setGoals(goalsSnapshot);
      xp.setStats(statsSnapshot);
      message.error(errorMessage(error));
    }
  }

  function clearDone() {
    setCards((cs) => cs.filter((c) => c.columnKey !== 'done'));
    setGoals((gs) => gs.filter((g) => !g.done));
  }

  async function moveCard(cardId: string, to: BoardColumn, afterId: string | null = null) {
    await withRollback(
      () => {
        const { cards: dispatched, goals: nextGoals } = xp.dispatch(cards, goals, {
          type: 'move_card',
          cardId,
          to,
        });
        // xp.dispatch flips columnKey (and settles XP if the transition is
        // real); reordering the array is a separate concern — see
        // cardActions.reorderWithinArray.
        setCards(cardActions.reorderWithinArray(dispatched, cardId, afterId, to));
        setGoals(nextGoals);
      },
      async () => {
        try {
          await cardsApi.moveCard(cardId, to, afterId);
        } catch (error) {
          if (error instanceof ApiError && error.status === 409) {
            await reloadBoard();
            return;
          }
          throw error;
        }
      },
    );
  }

  async function toggleGoal(goalId: string) {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    const done = !goal.done;
    await withRollback(
      () => {
        const { cards: nextCards, goals: nextGoals } = xp.dispatch(cards, goals, {
          type: 'toggle_goal',
          goalId,
          done,
        });
        setCards(nextCards);
        setGoals(nextGoals);
      },
      () => goalsApi.toggleGoal(goalId, done),
    );
  }

  async function toggleSubtask(cardId: string, subtaskId: string) {
    const subtask = cards.find((c) => c.id === cardId)?.subtasks.find((s) => s.id === subtaskId);
    if (!subtask) return;
    const done = !subtask.done;
    await withRollback(
      () => {
        const { cards: nextCards, goals: nextGoals } = xp.dispatch(cards, goals, {
          type: 'toggle_subtask',
          subtaskId,
          done,
        });
        setCards(nextCards);
        setGoals(nextGoals);
      },
      () => subtasksApi.toggleSubtask(subtaskId, done),
    );
  }

  async function createCard(columnKey: BoardColumn, title: string) {
    const id = uuid();
    await withRollback(
      () => setCards((cs) => cardActions.addCard(cs, columnKey, title, id)),
      () => cardsApi.createCard({ id, columnKey, title, priority: 0, tag: -1 }),
    );
  }

  async function updateCardTitle(cardId: string, title: string) {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;
    await withRollback(
      () => setCards((cs) => cardActions.updateCardTitle(cs, cardId, title)),
      () => cardsApi.updateCard(cardId, { title, priority: card.priority, tag: card.tag }),
    );
  }

  async function cyclePriority(cardId: string) {
    const nextCards = cardActions.cyclePriority(cards, cardId);
    const nextCard = nextCards.find((c) => c.id === cardId);
    if (!nextCard) return;
    await withRollback(
      () => setCards(nextCards),
      () => cardsApi.updateCard(cardId, { title: nextCard.title, priority: nextCard.priority, tag: nextCard.tag }),
    );
  }

  async function cycleTag(cardId: string) {
    const nextCards = cardActions.cycleTag(cards, cardId);
    const nextCard = nextCards.find((c) => c.id === cardId);
    if (!nextCard) return;
    await withRollback(
      () => setCards(nextCards),
      () => cardsApi.updateCard(cardId, { title: nextCard.title, priority: nextCard.priority, tag: nextCard.tag }),
    );
  }

  async function removeCard(cardId: string) {
    await withRollback(
      () => setCards((cs) => cardActions.removeCard(cs, cardId)),
      () => cardsApi.deleteCard(cardId),
    );
  }

  async function addSubtask(cardId: string, title: string) {
    const id = uuid();
    await withRollback(
      () => setCards((cs) => cardActions.addSubtask(cs, cardId, title, id)),
      () => subtasksApi.createSubtask(cardId, { id, title }),
    );
  }

  async function removeSubtask(cardId: string, subtaskId: string) {
    await withRollback(
      () => setCards((cs) => cardActions.removeSubtask(cs, cardId, subtaskId)),
      () => subtasksApi.deleteSubtask(subtaskId),
    );
  }

  async function createGoal(scope: GoalScope, title: string) {
    const id = uuid();
    await withRollback(
      () => setGoals((gs) => goalActions.addGoal(gs, scope, title, id)),
      () => goalsApi.createGoal({ id, scope, title }),
    );
  }

  async function updateGoalTitle(goalId: string, title: string) {
    await withRollback(
      () => setGoals((gs) => goalActions.updateGoalTitle(gs, goalId, title)),
      () => goalsApi.updateGoal(goalId, { title }),
    );
  }

  async function removeGoal(goalId: string) {
    await withRollback(
      () => setGoals((gs) => goalActions.removeGoal(gs, goalId)),
      () => goalsApi.deleteGoal(goalId),
    );
  }

  const editingState = useEditingState({
    onCommitCardEdit: updateCardTitle,
    onCommitAddCard: createCard,
    onAddSubtask: addSubtask,
    onCommitGoalEdit: updateGoalTitle,
    onCommitAddGoal: createGoal,
  });

  async function startFocus(cardId: string, minutes: number) {
    try {
      const session = await focusApi.startFocus(cardId, Math.min(180, Math.max(1, Math.round(minutes))));
      focusSession.startFocus(cardId, session.id, minutes);
    } catch (error) {
      message.error(errorMessage(error));
    }
  }

  async function finishActiveFocus(outcome: 'completed' | 'abandoned', plannedMinutes?: number) {
    const active = focusSession.focus;
    if (!active) return;
    focusSession.setFocus(null);
    try {
      await focusApi.finishFocus(active.sessionId, outcome);
      // The request above already succeeded — apply the local XP dispatch
      // after the fact, not through withRollback (there's nothing left to
      // roll back to if this part fails; it can't).
      if (outcome === 'completed' && plannedMinutes !== undefined) {
        const { cards: nextCards } = xp.dispatch(cards, goals, {
          type: 'finish_focus',
          cardId: active.cardId,
          plannedMinutes,
          elapsedMinutes: plannedMinutes,
          outcome: 'completed',
        });
        setCards(nextCards);
        setCards((cs) => cardActions.incrementPoms(cs, active.cardId));
      }
    } catch (error) {
      message.error(errorMessage(error));
    }
  }

  useFocusTimer(focusSession.focus, focusSession.setFocus, (_cardId, plannedMinutes) => {
    void finishActiveFocus('completed', plannedMinutes);
  });

  const openCount = cards.filter((c) => c.columnKey !== 'done').length;
  const doneCount = cards.filter((c) => c.columnKey === 'done').length;
  const goalsDoneCount = goals.filter((g) => g.done).length;

  return {
    cards,
    goals,
    history,
    loading,
    loadError,
    display: xp.display,
    gain: xp.gain,
    openCount,
    doneCount,
    goalsDoneCount,
    ...editingState,
    ...focusSession,
    cyclePriority,
    cycleTag,
    removeCard,
    toggleSubtask,
    removeSubtask,
    toggleGoal,
    removeGoal,
    moveCard,
    clearDone,
    startFocus,
    endFocus: () => void finishActiveFocus('abandoned'),
  };
}

export type BoardState = ReturnType<typeof useBoardState>;
