import { DndContext, DragOverlay, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
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

  function handleDragEnd(event: DragEndEvent) {
    const columnKey = event.over?.id as BoardColumnKey | undefined;
    if (columnKey) state.moveCard(String(event.active.id), columnKey);
    setActiveId(null);
  }

  return (
    <section>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Fluxo diário</span>
        <div className={styles.rule} />
      </div>
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
