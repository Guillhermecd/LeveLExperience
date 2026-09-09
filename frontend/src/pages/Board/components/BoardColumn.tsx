import { useDroppable } from '@dnd-kit/core';
import { createStyles } from 'antd-style';
import type { KeyboardEvent } from 'react';
import { color, font, fontSize, radius, space } from '../../../theme/tokens';
import { columnLabel } from '../../../theme/labels';
import type { BoardColumn as BoardColumnKey, Card } from '../../../types/board';
import type { BoardState } from '../state/useBoardState';
import { DraggableTaskCard } from './DraggableTaskCard';

const useStyles = createStyles(() => ({
  column: {
    background: color.surface.column,
    border: `1px solid ${color.border.column}`,
    borderRadius: radius.lg1,
    padding: `${space.md1}px ${space.sm3}px ${space.sm3}px`,
    minHeight: 260,
    display: 'flex',
    flexDirection: 'column',
    gap: space.sm2,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontFamily: font.heading,
    fontSize: fontSize.md,
    fontWeight: 600,
    color: color.text.body,
  },
  count: {
    fontSize: fontSize.sm,
    fontVariantNumeric: 'tabular-nums',
    color: color.text.counter,
    background: color.surface.chipDefault,
    borderRadius: radius.pill,
    padding: `3px ${space.xs4}px`,
  },
  addButton: {
    marginTop: 'auto',
    border: `1px dashed ${color.border.dashed}`,
    borderRadius: radius.sm5,
    padding: `${space.xs4}px ${space.sm1}px`,
    fontSize: fontSize.sm13,
    color: color.text.label,
    background: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    '&:hover': {
      borderColor: color.lime.text,
      color: color.lime.text,
    },
  },
  addArea: {
    width: '100%',
    background: color.surface.field,
    border: `1px solid ${color.border.fieldFocus}`,
    borderRadius: radius.sm3,
    padding: space.xs3,
    fontSize: fontSize.md,
    color: color.text.card,
    fontFamily: font.body,
    resize: 'none',
    boxSizing: 'border-box',
  },
}));

export function BoardColumn({ columnKey, state }: { columnKey: BoardColumnKey; state: BoardState }) {
  const { styles } = useStyles();
  const { setNodeRef, isOver } = useDroppable({ id: columnKey });
  const cards = state.cards.filter((c: Card) => c.columnKey === columnKey);
  const isAdding = state.adding === `column:${columnKey}`;

  function handleAddKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      state.commitAddCard(columnKey);
    } else if (event.key === 'Escape') {
      state.cancelAdding();
    }
  }

  return (
    <div ref={setNodeRef} className={styles.column} style={isOver ? { borderColor: color.border.cardHover } : undefined}>
      <div className={styles.header}>
        <span className={styles.name}>{columnLabel[columnKey]}</span>
        <span className={styles.count}>{cards.length}</span>
      </div>

      {cards.map((card) => (
        <DraggableTaskCard
          key={card.id}
          card={card}
          isEditing={state.editing === card.id}
          editDraft={state.editDraft}
          onEditDraftChange={state.setEditDraft}
          onStartEdit={() => state.startEditingCard(card)}
          onCommitEdit={state.commitCardEdit}
          onCancelEdit={state.cancelCardEdit}
          isExpanded={state.expanded === card.id}
          onToggleExpanded={() => state.toggleExpanded(card.id)}
          subDraft={state.subDraft}
          onSubDraftChange={state.setSubDraft}
          onAddSubtask={() => state.addSubtask(card.id)}
          onToggleSubtask={(subtaskId) => state.toggleSubtask(card.id, subtaskId)}
          onRemoveSubtask={(subtaskId) => state.removeSubtask(card.id, subtaskId)}
          onCyclePriority={() => state.cyclePriority(card.id)}
          onCycleTag={() => state.cycleTag(card.id)}
          onRemove={() => state.removeCard(card.id)}
          isFocusTarget={state.focus?.cardId === card.id}
          onOpenFocusPicker={() => state.openFocusPicker(card.id)}
        />
      ))}

      {isAdding ? (
        <textarea
          className={styles.addArea}
          rows={2}
          autoFocus
          placeholder="Nova tarefa… Enter para salvar"
          value={state.draft}
          onChange={(e) => state.setDraft(e.target.value)}
          onKeyDown={handleAddKeyDown}
          onBlur={() => state.commitAddCard(columnKey)}
        />
      ) : (
        <button className={styles.addButton} onClick={() => state.startAdding(`column:${columnKey}`)}>
          + Adicionar
        </button>
      )}
    </div>
  );
}
