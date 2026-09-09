import { useMemo, useState } from 'react';
import type { BoardColumn, Card, FocusSession, Goal, GoalScope } from '../../../types/board';
import { buildSeedCards, buildSeedGoals, buildSeedHistory } from '../mockSeed';
import * as cardActions from './cardActions';
import * as goalActions from './goalActions';
import { useFocusTimer } from './useFocusTimer';

/**
 * Fase 1 scope: in-memory mock state that mirrors the handoff's behavior so
 * the UI can be reviewed side by side with `Kanban.dc.html`. This is
 * intentionally not the XP reducer — Fase 2 replaces card/goal mutations
 * here with the tested reducer from `xp-rules.json`. Nothing below computes
 * or displays derived XP; the level panel is static mock data.
 */
export function useBoardState() {
  const [cards, setCards] = useState<Card[]>(() => buildSeedCards());
  const [goals, setGoals] = useState<Goal[]>(() => buildSeedGoals());
  const [history] = useState(() => buildSeedHistory());

  const [adding, setAdding] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [subDraft, setSubDraft] = useState('');

  const [focus, setFocus] = useState<FocusSession | null>(null);
  const [pick, setPick] = useState<string | null>(null);
  const [pickMinutes, setPickMinutes] = useState('25');

  useFocusTimer(focus, setFocus, (cardId) => setCards((cs) => cardActions.incrementPoms(cs, cardId)));

  const openCount = useMemo(() => cards.filter((c) => c.columnKey !== 'done').length, [cards]);
  const doneCount = useMemo(() => cards.filter((c) => c.columnKey === 'done').length, [cards]);
  const goalsDoneCount = useMemo(() => goals.filter((g) => g.done).length, [goals]);

  function startEditingCard(card: Card) {
    setEditing(card.id);
    setEditDraft(card.title);
    setAdding(null);
  }

  function commitCardEdit() {
    const value = editDraft.trim();
    if (editing && value) setCards((cs) => cardActions.updateCardTitle(cs, editing, value));
    setEditing(null);
    setEditDraft('');
  }

  function cancelCardEdit() {
    setEditing(null);
    setEditDraft('');
  }

  function startAdding(columnId: string) {
    setAdding(columnId);
    setDraft('');
    setEditing(null);
  }

  function commitAddCard(columnKey: BoardColumn) {
    const value = draft.trim();
    if (value) setCards((cs) => cardActions.addCard(cs, columnKey, value));
    setAdding(null);
    setDraft('');
  }

  function cancelAdding() {
    setAdding(null);
    setDraft('');
  }

  function toggleExpanded(cardId: string) {
    setExpanded((current) => (current === cardId ? null : cardId));
    setSubDraft('');
  }

  function addSubtask(cardId: string) {
    const value = subDraft.trim();
    if (!value) return;
    setCards((cs) => cardActions.addSubtask(cs, cardId, value));
    setSubDraft('');
  }

  function startGoalEditing(goal: Goal) {
    setEditing(goal.id);
    setEditDraft(goal.title);
  }

  function commitGoalEdit() {
    const value = editDraft.trim();
    if (editing && value) setGoals((gs) => goalActions.updateGoalTitle(gs, editing, value));
    setEditing(null);
    setEditDraft('');
  }

  function commitAddGoal(scope: GoalScope) {
    const value = draft.trim();
    if (value) setGoals((gs) => goalActions.addGoal(gs, scope, value));
    setAdding(null);
    setDraft('');
  }

  function openFocusPicker(cardId: string) {
    setPick(cardId);
    setPickMinutes('25');
  }

  function startFocus(cardId: string, minutes: number) {
    const clamped = Math.min(180, Math.max(1, Math.round(minutes)));
    setFocus({ cardId, totalSeconds: clamped * 60, leftSeconds: clamped * 60, running: true });
    setPick(null);
  }

  function clearDone() {
    setCards((cs) => cs.filter((c) => c.columnKey !== 'done'));
    setGoals((gs) => gs.filter((g) => !g.done));
  }

  return {
    cards,
    goals,
    history,
    openCount,
    doneCount,
    goalsDoneCount,
    adding,
    draft,
    setDraft,
    editing,
    editDraft,
    setEditDraft,
    expanded,
    subDraft,
    setSubDraft,
    focus,
    pick,
    pickMinutes,
    setPickMinutes,
    cyclePriority: (cardId: string) => setCards((cs) => cardActions.cyclePriority(cs, cardId)),
    cycleTag: (cardId: string) => setCards((cs) => cardActions.cycleTag(cs, cardId)),
    removeCard: (cardId: string) => setCards((cs) => cardActions.removeCard(cs, cardId)),
    startEditingCard,
    commitCardEdit,
    cancelCardEdit,
    startAdding,
    commitAddCard,
    cancelAdding,
    toggleExpanded,
    toggleSubtask: (cardId: string, subtaskId: string) =>
      setCards((cs) => cardActions.toggleSubtask(cs, cardId, subtaskId)),
    removeSubtask: (cardId: string, subtaskId: string) =>
      setCards((cs) => cardActions.removeSubtask(cs, cardId, subtaskId)),
    addSubtask,
    startGoalEditing,
    commitGoalEdit,
    toggleGoal: (goalId: string) => setGoals((gs) => goalActions.toggleGoal(gs, goalId)),
    removeGoal: (goalId: string) => setGoals((gs) => goalActions.removeGoal(gs, goalId)),
    commitAddGoal,
    openFocusPicker,
    closeFocusPicker: () => setPick(null),
    startFocus,
    toggleFocusRunning: () =>
      setFocus((current) => (current ? { ...current, running: !current.running } : current)),
    endFocus: () => setFocus(null),
    clearDone,
  };
}

export type BoardState = ReturnType<typeof useBoardState>;
