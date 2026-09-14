import { v4 as uuid } from 'uuid';
import { priorityCycle, tagCycle } from '../../../theme/labels';
import type { BoardColumn, Card } from '../../../types/board';

/**
 * Pure card-array transitions. Kept separate from useBoardState so the shape
 * survives the move to the Fase 2 reducer with minimal rewiring.
 */
export function cyclePriority(cards: Card[], cardId: string): Card[] {
  return cards.map((c) => {
    if (c.id !== cardId) return c;
    const next = priorityCycle[(priorityCycle.indexOf(c.priority) + 1) % priorityCycle.length];
    return { ...c, priority: next };
  });
}

export function cycleTag(cards: Card[], cardId: string): Card[] {
  return cards.map((c) => {
    if (c.id !== cardId) return c;
    const next = tagCycle[(tagCycle.indexOf(c.tag) + 1) % tagCycle.length];
    return { ...c, tag: next };
  });
}

export function removeCard(cards: Card[], cardId: string): Card[] {
  return cards.filter((c) => c.id !== cardId);
}

export function updateCardTitle(cards: Card[], cardId: string, title: string): Card[] {
  return cards.map((c) => (c.id === cardId ? { ...c, title } : c));
}

export function addCard(cards: Card[], columnKey: BoardColumn, title: string, id: string = uuid()): Card[] {
  const nextPosition =
    Math.max(0, ...cards.filter((c) => c.columnKey === columnKey).map((c) => c.position)) + 1;
  return [
    ...cards,
    {
      id,
      columnKey,
      title,
      priority: 0,
      tag: -1,
      position: nextPosition,
      poms: 0,
      subtasks: [],
    },
  ];
}

export function toggleSubtask(cards: Card[], cardId: string, subtaskId: string): Card[] {
  return cards.map((c) =>
    c.id !== cardId
      ? c
      : { ...c, subtasks: c.subtasks.map((s) => (s.id === subtaskId ? { ...s, done: !s.done } : s)) },
  );
}

export function removeSubtask(cards: Card[], cardId: string, subtaskId: string): Card[] {
  return cards.map((c) =>
    c.id !== cardId ? c : { ...c, subtasks: c.subtasks.filter((s) => s.id !== subtaskId) },
  );
}

export function addSubtask(cards: Card[], cardId: string, title: string, id: string = uuid()): Card[] {
  return cards.map((c) => {
    if (c.id !== cardId) return c;
    const nextPosition = Math.max(0, ...c.subtasks.map((s) => s.position)) + 1;
    return {
      ...c,
      subtasks: [...c.subtasks, { id, cardId, title, done: false, position: nextPosition }],
    };
  });
}

export function incrementPoms(cards: Card[], cardId: string): Card[] {
  return cards.map((c) => (c.id === cardId ? { ...c, poms: c.poms + 1 } : c));
}

/**
 * Repositions `cardId` within the array, right after `afterId` (or at the
 * start of `targetColumn`'s block when `afterId` is null) — array order is
 * what BoardColumn.tsx renders, so this is what makes a within-column drag
 * show up in the right place. Doesn't touch `columnKey`: the reducer
 * (boardXp.ts) is the one that flips it, since only it knows whether the
 * transition is real enough to settle XP.
 */
export function reorderWithinArray(
  cards: Card[],
  cardId: string,
  afterId: string | null,
  targetColumn: BoardColumn,
): Card[] {
  const moving = cards.find((c) => c.id === cardId);
  if (!moving) return cards;
  const rest = cards.filter((c) => c.id !== cardId);

  if (afterId === null) {
    const firstIndex = rest.findIndex((c) => c.columnKey === targetColumn);
    return firstIndex === -1
      ? [...rest, moving]
      : [...rest.slice(0, firstIndex), moving, ...rest.slice(firstIndex)];
  }

  const afterIndex = rest.findIndex((c) => c.id === afterId);
  return afterIndex === -1
    ? [...rest, moving]
    : [...rest.slice(0, afterIndex + 1), moving, ...rest.slice(afterIndex + 1)];
}
