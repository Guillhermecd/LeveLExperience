import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Card, Goal, GoalScope } from '../../../types/board';
import * as cardActions from './cardActions';
import * as goalActions from './goalActions';

/**
 * Shared "one thing being added/edited at a time" state for both the flow
 * columns and the goal columns — the handoff enforces this as a single UI
 * rule, so it is one state pair, not two per section.
 */
export function useEditingState(setCards: Dispatch<SetStateAction<Card[]>>, setGoals: Dispatch<SetStateAction<Goal[]>>) {
  const [adding, setAdding] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [subDraft, setSubDraft] = useState('');

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

  function commitAddCard(columnKey: Card['columnKey']) {
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

  return {
    adding,
    draft,
    setDraft,
    editing,
    editDraft,
    setEditDraft,
    expanded,
    subDraft,
    setSubDraft,
    startEditingCard,
    commitCardEdit,
    cancelCardEdit,
    startAdding,
    commitAddCard,
    cancelAdding,
    toggleExpanded,
    addSubtask,
    startGoalEditing,
    commitGoalEdit,
    commitAddGoal,
  };
}
