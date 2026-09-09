import { useMemo, useState } from 'react';
import type { BoardColumn, Card, Goal } from '../../../types/board';
import { buildSeedCards, buildSeedGoals, buildSeedHistory } from '../mockSeed';
import * as cardActions from './cardActions';
import * as goalActions from './goalActions';
import { useEditingState } from './useEditingState';
import { useFocusSession } from './useFocusSession';
import { useFocusTimer } from './useFocusTimer';
import { useXpDispatch } from './useXpDispatch';

/**
 * Card/goal title, tags, position and add/remove/edit stay local UI state
 * (cardActions.ts / goalActions.ts). Anything that awards or reverses XP —
 * move, toggle goal/subtask, finish focus — goes through useXpDispatch,
 * which runs the tested reducer from xp-rules.json (see boardXp.ts).
 */
export function useBoardState() {
  const [cards, setCards] = useState<Card[]>(() => buildSeedCards());
  const [goals, setGoals] = useState<Goal[]>(() => buildSeedGoals());
  const [history] = useState(() => buildSeedHistory());
  const xp = useXpDispatch();
  const editingState = useEditingState(setCards, setGoals);
  const focusSession = useFocusSession();

  useFocusTimer(focusSession.focus, focusSession.setFocus, (cardId, plannedMinutes) => {
    const { cards: nextCards } = xp.dispatch(cards, goals, {
      type: 'finish_focus',
      cardId,
      plannedMinutes,
      elapsedMinutes: plannedMinutes,
      outcome: 'completed',
    });
    setCards(nextCards);
    setCards((cs) => cardActions.incrementPoms(cs, cardId));
  });

  const openCount = useMemo(() => cards.filter((c) => c.columnKey !== 'done').length, [cards]);
  const doneCount = useMemo(() => cards.filter((c) => c.columnKey === 'done').length, [cards]);
  const goalsDoneCount = useMemo(() => goals.filter((g) => g.done).length, [goals]);

  function clearDone() {
    setCards((cs) => cs.filter((c) => c.columnKey !== 'done'));
    setGoals((gs) => gs.filter((g) => !g.done));
  }

  function moveCard(cardId: string, to: BoardColumn) {
    const { cards: nextCards, goals: nextGoals } = xp.dispatch(cards, goals, {
      type: 'move_card',
      cardId,
      to,
    });
    setCards(nextCards);
    setGoals(nextGoals);
  }

  function toggleGoal(goalId: string) {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    const { cards: nextCards, goals: nextGoals } = xp.dispatch(cards, goals, {
      type: 'toggle_goal',
      goalId,
      done: !goal.done,
    });
    setCards(nextCards);
    setGoals(nextGoals);
  }

  function toggleSubtask(cardId: string, subtaskId: string) {
    const subtask = cards.find((c) => c.id === cardId)?.subtasks.find((s) => s.id === subtaskId);
    if (!subtask) return;
    const { cards: nextCards, goals: nextGoals } = xp.dispatch(cards, goals, {
      type: 'toggle_subtask',
      subtaskId,
      done: !subtask.done,
    });
    setCards(nextCards);
    setGoals(nextGoals);
  }

  return {
    cards,
    goals,
    history,
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
  };
}

export type BoardState = ReturnType<typeof useBoardState>;
