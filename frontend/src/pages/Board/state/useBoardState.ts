import { message } from 'antd';
import { useEffect, useState } from 'react';
import { ApiError } from '../../../api/api';
import * as boardApi from '../../../api/modules/board';
import * as cardsApi from '../../../api/modules/cards';
import * as focusApi from '../../../api/modules/focus';
import * as goalsApi from '../../../api/modules/goals';
import type { StatsDto } from '../../../api/modules/stats';
import * as statsApi from '../../../api/modules/stats';
import * as subtasksApi from '../../../api/modules/subtasks';
import type { LedgerStats } from '../../../features/kanban/types';
import type { BoardColumn, Card, DayHistoryEntry, Goal } from '../../../types/board';
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
 * Card/goal title, tags, position and add/remove/edit stay local UI state
 * for now (cardActions.ts / goalActions.ts) — CRUD wiring to the API is a
 * follow-up etapa. Anything that awards or reverses XP — move, toggle
 * goal/subtask, finish focus — applies through the reducer immediately
 * (PLAN.md "UI otimista"), fires the matching request, and rolls the
 * snapshot back if that request fails (GATES.md 4.4). A 409 on /move
 * reloads the board instead of rolling back (GATES.md 4.5).
 */
export function useBoardState() {
  const [cards, setCards] = useState<Card[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [history, setHistory] = useState<DayHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const xp = useXpDispatch(initialStats);
  const editingState = useEditingState(setCards, setGoals);
  const focusSession = useFocusSession();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [board, stats] = await Promise.all([boardApi.getBoard(), statsApi.getStats()]);
        if (cancelled) return;
        setCards(board.cards);
        setGoals(board.goals);
        xp.setStats(toLedgerStats(stats));
        setHistory(toDayHistory(stats));
      } catch (error) {
        if (!cancelled) setLoadError(errorMessage(error));
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
    setCards(board.cards);
    setGoals(board.goals);
    xp.setStats(toLedgerStats(stats));
    setHistory(toDayHistory(stats));
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

  async function moveCard(cardId: string, to: BoardColumn) {
    await withRollback(
      () => {
        const { cards: nextCards, goals: nextGoals } = xp.dispatch(cards, goals, {
          type: 'move_card',
          cardId,
          to,
        });
        setCards(nextCards);
        setGoals(nextGoals);
      },
      async () => {
        try {
          await cardsApi.moveCard(cardId, to);
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
    cyclePriority: (cardId: string) => setCards((cs) => cardActions.cyclePriority(cs, cardId)),
    cycleTag: (cardId: string) => setCards((cs) => cardActions.cycleTag(cs, cardId)),
    removeCard: (cardId: string) => setCards((cs) => cardActions.removeCard(cs, cardId)),
    toggleSubtask,
    removeSubtask: (cardId: string, subtaskId: string) =>
      setCards((cs) => cardActions.removeSubtask(cs, cardId, subtaskId)),
    toggleGoal,
    removeGoal: (goalId: string) => setGoals((gs) => goalActions.removeGoal(gs, goalId)),
    moveCard,
    clearDone,
    startFocus,
    endFocus: () => void finishActiveFocus('abandoned'),
  };
}

export type BoardState = ReturnType<typeof useBoardState>;
