import { useState } from 'react';
import type { BoardColumn, Card, Goal, GoalScope } from '../../../types/board';

type Callbacks = {
  onCommitCardEdit: (cardId: string, title: string) => void;
  onCommitAddCard: (columnKey: BoardColumn, title: string) => void;
  onAddSubtask: (cardId: string, title: string) => void;
  onCommitGoalEdit: (goalId: string, title: string) => void;
  onCommitAddGoal: (scope: GoalScope, title: string) => void;
};

/**
 * Shared "one thing being added/edited at a time" state for both the flow
 * columns and the goal columns — the handoff enforces this as a single UI
 * rule, so it is one state pair, not two per section. Owns only the draft
 * text and which row is open; committing a draft delegates to useBoardState,
 * which applies it locally and fires the matching API call.
 */
export function useEditingState({
  onCommitCardEdit,
  onCommitAddCard,
  onAddSubtask,
  onCommitGoalEdit,
  onCommitAddGoal,
}: Callbacks) {
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
    if (editing && value) onCommitCardEdit(editing, value);
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
    if (value) onCommitAddCard(columnKey, value);
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
    onAddSubtask(cardId, value);
    setSubDraft('');
  }

  function startGoalEditing(goal: Goal) {
    setEditing(goal.id);
    setEditDraft(goal.title);
  }

  function commitGoalEdit() {
    const value = editDraft.trim();
    if (editing && value) onCommitGoalEdit(editing, value);
    setEditing(null);
    setEditDraft('');
  }

  function commitAddGoal(scope: GoalScope) {
    const value = draft.trim();
    if (value) onCommitAddGoal(scope, value);
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
