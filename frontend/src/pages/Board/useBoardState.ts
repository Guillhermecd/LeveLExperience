import { useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import type { BoardColumn, Card, FocusSession, Goal, GoalScope } from '../../types/board';
import { priorityCycle, tagCycle } from '../../theme/labels';
import { buildSeedCards, buildSeedGoals, buildSeedHistory } from './mockSeed';

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

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!focus?.running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setFocus((current) => {
        if (!current || !current.running) return current;
        if (current.leftSeconds <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setCards((cs) =>
            cs.map((c) => (c.id === current.cardId ? { ...c, poms: c.poms + 1 } : c)),
          );
          return null;
        }
        return { ...current, leftSeconds: current.leftSeconds - 1 };
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [focus?.running]);

  const openCount = useMemo(() => cards.filter((c) => c.columnKey !== 'done').length, [cards]);
  const doneCount = useMemo(() => cards.filter((c) => c.columnKey === 'done').length, [cards]);
  const goalsDoneCount = useMemo(() => goals.filter((g) => g.done).length, [goals]);

  function cyclePriority(cardId: string) {
    setCards((cs) =>
      cs.map((c) => {
        if (c.id !== cardId) return c;
        const next = priorityCycle[(priorityCycle.indexOf(c.priority) + 1) % priorityCycle.length];
        return { ...c, priority: next };
      }),
    );
  }

  function cycleTag(cardId: string) {
    setCards((cs) =>
      cs.map((c) => {
        if (c.id !== cardId) return c;
        const next = tagCycle[(tagCycle.indexOf(c.tag) + 1) % tagCycle.length];
        return { ...c, tag: next };
      }),
    );
  }

  function removeCard(cardId: string) {
    setCards((cs) => cs.filter((c) => c.id !== cardId));
  }

  function startEditingCard(card: Card) {
    setEditing(card.id);
    setEditDraft(card.title);
    setAdding(null);
  }

  function commitCardEdit() {
    const value = editDraft.trim();
    if (editing && value) {
      setCards((cs) => cs.map((c) => (c.id === editing ? { ...c, title: value } : c)));
    }
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
    if (value) {
      const nextPosition = Math.max(0, ...cards.filter((c) => c.columnKey === columnKey).map((c) => c.position)) + 1;
      setCards((cs) => [
        ...cs,
        {
          id: uuid(),
          columnKey,
          title: value,
          priority: 0,
          tag: -1,
          position: nextPosition,
          poms: 0,
          subtasks: [],
        },
      ]);
    }
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

  function toggleSubtask(cardId: string, subtaskId: string) {
    setCards((cs) =>
      cs.map((c) =>
        c.id !== cardId
          ? c
          : {
              ...c,
              subtasks: c.subtasks.map((s) => (s.id === subtaskId ? { ...s, done: !s.done } : s)),
            },
      ),
    );
  }

  function removeSubtask(cardId: string, subtaskId: string) {
    setCards((cs) =>
      cs.map((c) =>
        c.id !== cardId ? c : { ...c, subtasks: c.subtasks.filter((s) => s.id !== subtaskId) },
      ),
    );
  }

  function addSubtask(cardId: string) {
    const value = subDraft.trim();
    if (!value) return;
    setCards((cs) =>
      cs.map((c) => {
        if (c.id !== cardId) return c;
        const nextPosition = Math.max(0, ...c.subtasks.map((s) => s.position)) + 1;
        return {
          ...c,
          subtasks: [...c.subtasks, { id: uuid(), cardId, title: value, done: false, position: nextPosition }],
        };
      }),
    );
    setSubDraft('');
  }

  function startGoalEditing(goal: Goal) {
    setEditing(goal.id);
    setEditDraft(goal.title);
  }

  function commitGoalEdit() {
    const value = editDraft.trim();
    if (editing && value) {
      setGoals((gs) => gs.map((g) => (g.id === editing ? { ...g, title: value } : g)));
    }
    setEditing(null);
    setEditDraft('');
  }

  function toggleGoal(goalId: string) {
    setGoals((gs) => gs.map((g) => (g.id === goalId ? { ...g, done: !g.done } : g)));
  }

  function removeGoal(goalId: string) {
    setGoals((gs) => gs.filter((g) => g.id !== goalId));
  }

  function commitAddGoal(scope: GoalScope) {
    const value = draft.trim();
    if (value) {
      const nextPosition = Math.max(0, ...goals.filter((g) => g.scope === scope).map((g) => g.position)) + 1;
      setGoals((gs) => [...gs, { id: uuid(), scope, title: value, done: false, position: nextPosition }]);
    }
    setAdding(null);
    setDraft('');
  }

  function openFocusPicker(cardId: string) {
    setPick(cardId);
    setPickMinutes('25');
  }

  function closeFocusPicker() {
    setPick(null);
  }

  function startFocus(cardId: string, minutes: number) {
    const clamped = Math.min(180, Math.max(1, Math.round(minutes)));
    setFocus({ cardId, totalSeconds: clamped * 60, leftSeconds: clamped * 60, running: true });
    setPick(null);
  }

  function toggleFocusRunning() {
    setFocus((current) => (current ? { ...current, running: !current.running } : current));
  }

  function endFocus() {
    setFocus(null);
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
    cyclePriority,
    cycleTag,
    removeCard,
    startEditingCard,
    commitCardEdit,
    cancelCardEdit,
    startAdding,
    commitAddCard,
    cancelAdding,
    toggleExpanded,
    toggleSubtask,
    removeSubtask,
    addSubtask,
    startGoalEditing,
    commitGoalEdit,
    toggleGoal,
    removeGoal,
    commitAddGoal,
    openFocusPicker,
    closeFocusPicker,
    startFocus,
    toggleFocusRunning,
    endFocus,
    clearDone,
  };
}

export type BoardState = ReturnType<typeof useBoardState>;
