import { closestCenter, DndContext, DragOverlay, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { createStyles } from 'antd-style';
import { useState } from 'react';
import { color, font, fontSize, space } from '../../../theme/tokens';
import type { BoardColumn as BoardColumnKey } from '../../../types/board';
import type { BoardState } from '../state/useBoardState';
import { BoardColumn } from './BoardColumn';
import { DragPreviewCard } from './DragPreviewCard';

const useStyles = createStyles(() => ({
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: space.md1,
    marginBottom: space.md2,
  },
  sectionTitle: {
    fontFamily: font.heading,
    fontSize: fontSize.md15,
    fontWeight: 600,
    letterSpacing: '.1em',
    textTransform: 'uppercase',
    color: color.text.sectionLabel,
    whiteSpace: 'nowrap',
  },
  rule: {
    flex: 1,
    height: 1,
    background: color.border.subtle,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: space.md2,
    alignItems: 'start',
  },
}));

const columns: BoardColumnKey[] = ['backlog', 'today', 'doing', 'done'];

export function BoardColumns({ state }: { state: BoardState }) {
  const { styles } = useStyles();
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeCard = state.cards.find((c) => c.id === activeId);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  // over.id is a card id when hovering a card (SortableContext), or the
  // column key itself when hovering the column's droppable background
  // (an empty column, or the gap below the last card). Dropping ON a card
  // inserts the dragged card right before it.
  function handleDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : undefined;
    setActiveId(null);
    if (!overId) return;

    const overCard = state.cards.find((c) => c.id === overId);
    const targetColumn = (overCard?.columnKey ?? overId) as BoardColumnKey;
    if (!columns.includes(targetColumn)) return;

    const siblings = state.cards
      .filter((c) => c.columnKey === targetColumn && c.id !== activeId)
      .sort((a, b) => a.position - b.position);

    let afterId: string | null;
    if (overCard && overCard.id !== activeId) {
      const overIndex = siblings.findIndex((c) => c.id === overCard.id);
      afterId = overIndex <= 0 ? null : siblings[overIndex - 1].id;
    } else {
      afterId = siblings.length > 0 ? siblings[siblings.length - 1].id : null;
    }

    state.moveCard(activeId, targetColumn, afterId);
  }

  return (
    <section>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Fluxo diário</span>
        <div className={styles.rule} />
      </div>
      <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className={styles.grid}>
          {columns.map((columnKey) => (
            <BoardColumn key={columnKey} columnKey={columnKey} state={state} />
          ))}
        </div>
        <DragOverlay>{activeCard && <DragPreviewCard card={activeCard} />}</DragOverlay>
      </DndContext>
    </section>
  );
}
