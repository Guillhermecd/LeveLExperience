import { createStyles } from 'antd-style';
import { useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { color, font, fontSize, radius, space } from '../../../theme/tokens';
import { tagLabel } from '../../../theme/labels';
import type { Card } from '../../../types/board';

const priorityColor = [color.neutral.priorityLow, color.amber.text, color.coral.text];

const tagTone: Record<number, { border: string; background: string; text: string }> = {
  [-1]: { border: color.border.dashed, background: 'transparent', text: color.text.faint },
  0: { border: color.blue.border, background: color.blue.surface, text: color.blue.text },
  1: { border: color.lime.personalBorder, background: color.lime.personalSurface, text: color.lime.text },
  2: { border: color.coral.borderTag, background: color.coral.surface, text: color.coral.textStrong },
  3: { border: color.violet.border, background: color.violet.surfaceTag, text: color.violet.text },
};

const useStyles = createStyles(() => ({
  card: {
    background: color.surface.card,
    border: `1px solid ${color.border.card}`,
    borderRadius: radius.md1,
    padding: `${space.sm2}px ${space.sm2}px ${space.eleven}px`,
    cursor: 'grab',
    display: 'flex',
    flexDirection: 'column',
    gap: space.xs4,
    '&:hover': {
      borderColor: color.border.cardHover,
      background: color.surface.cardHover,
    },
  },
  titleRow: {
    display: 'flex',
    gap: space.xs2,
    alignItems: 'flex-start',
  },
  priorityDot: {
    width: 9,
    height: 9,
    minWidth: 9,
    marginTop: 5,
    borderRadius: radius.circle,
    cursor: 'pointer',
    transition: 'transform 120ms ease',
    '&:hover': { transform: 'scale(1.35)' },
  },
  title: {
    flex: 1,
    fontSize: fontSize.md,
    lineHeight: 1.45,
    color: color.text.card,
    wordBreak: 'break-word',
  },
  removeButton: {
    background: 'none',
    border: 'none',
    fontSize: fontSize.md15,
    color: color.text.icon,
    cursor: 'pointer',
    lineHeight: 1,
    '&:hover': { color: color.coral.text },
  },
  editArea: {
    width: '100%',
    background: color.surface.field,
    border: `1px solid ${color.border.fieldFocus}`,
    borderRadius: radius.sm3,
    padding: space.xs3,
    fontSize: fontSize.md,
    color: color.text.card,
    fontFamily: font.body,
    resize: 'none',
  },
  chipRow: {
    display: 'flex',
    gap: space.xs2,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  chip: {
    borderRadius: radius.pill,
    padding: `${space.three}px ${space.xs4}px`,
    fontSize: fontSize.xs,
    border: '1px solid transparent',
    cursor: 'pointer',
    background: 'none',
  },
  subtaskChip: {
    borderRadius: radius.pill,
    padding: `${space.three}px ${space.xs4}px`,
    fontSize: fontSize.xs,
    border: `1px solid ${color.border.goalCard}`,
    color: color.text.muted,
    background: 'none',
    cursor: 'pointer',
    '&:hover': { color: color.lime.text },
  },
  focusChip: {
    marginLeft: 'auto',
    borderRadius: radius.pill,
    padding: `${space.three}px ${space.xs4}px`,
    fontSize: fontSize.xs,
    border: `1px solid ${color.border.goalCard}`,
    color: color.text.muted,
    background: 'none',
    cursor: 'pointer',
    '&:hover': { color: color.amber.text },
  },
  focusBadge: {
    marginLeft: 'auto',
    borderRadius: radius.pill,
    padding: `${space.three}px ${space.xs4}px`,
    fontSize: fontSize.xs,
    border: `1px solid ${color.amber.borderActive}`,
    background: color.amber.surface,
    color: color.amber.text,
  },
  subtaskList: {
    borderTop: `1px solid ${color.border.subtaskDivider}`,
    paddingTop: space.xs4,
    display: 'flex',
    flexDirection: 'column',
    gap: space.xs2,
  },
  subtaskRow: {
    display: 'flex',
    alignItems: 'center',
    gap: space.xs2,
  },
  subtaskBox: {
    width: 14,
    height: 14,
    minWidth: 14,
    borderRadius: radius.xs,
    border: `1px solid ${color.border.checkboxIdle}`,
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    '&:hover': { borderColor: color.lime.text },
  },
  subtaskBoxDone: {
    background: color.lime.text,
    borderColor: color.lime.text,
  },
  subtaskCheck: {
    fontSize: 10,
    fontWeight: 700,
    color: color.lime.onLime,
  },
  subtaskTitle: {
    flex: 1,
    fontSize: fontSize.sm13,
    lineHeight: 1.4,
    color: color.text.subtask,
  },
  subtaskTitleDone: {
    color: color.text.counter,
    textDecoration: 'line-through',
  },
  subtaskRemove: {
    background: 'none',
    border: 'none',
    fontSize: fontSize.sm13,
    color: color.text.iconMuted,
    cursor: 'pointer',
    '&:hover': { color: color.coral.text },
  },
  subtaskInput: {
    background: color.surface.field,
    border: `1px solid ${color.border.dashed}`,
    borderRadius: radius.sm3,
    padding: `${space.xs2}px ${space.xs4}px`,
    fontSize: fontSize.sm13,
    color: color.text.card,
    fontFamily: font.body,
    width: '100%',
    boxSizing: 'border-box',
  },
}));

type Props = {
  card: Card;
  isEditing: boolean;
  editDraft: string;
  onEditDraftChange: (value: string) => void;
  onStartEdit: () => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  subDraft: string;
  onSubDraftChange: (value: string) => void;
  onAddSubtask: () => void;
  onToggleSubtask: (subtaskId: string) => void;
  onRemoveSubtask: (subtaskId: string) => void;
  onCyclePriority: () => void;
  onCycleTag: () => void;
  onRemove: () => void;
  isFocusTarget: boolean;
  onOpenFocusPicker: () => void;
};

export function TaskCard({
  card,
  isEditing,
  editDraft,
  onEditDraftChange,
  onStartEdit,
  onCommitEdit,
  onCancelEdit,
  isExpanded,
  onToggleExpanded,
  subDraft,
  onSubDraftChange,
  onAddSubtask,
  onToggleSubtask,
  onRemoveSubtask,
  onCyclePriority,
  onCycleTag,
  onRemove,
  isFocusTarget,
  onOpenFocusPicker,
}: Props) {
  const { styles } = useStyles();
  const subInputRef = useRef<HTMLInputElement>(null);
  const tone = tagTone[card.tag];
  const doneSubtasks = card.subtasks.filter((s) => s.done).length;

  function handleTitleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onCommitEdit();
    } else if (event.key === 'Escape') {
      onCancelEdit();
    }
  }

  function handleSubKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      onAddSubtask();
    } else if (event.key === 'Escape') {
      onToggleExpanded();
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.titleRow}>
        <span
          className={styles.priorityDot}
          style={{ background: priorityColor[card.priority] }}
          onClick={onCyclePriority}
        />
        {isEditing ? (
          <textarea
            className={styles.editArea}
            rows={3}
            autoFocus
            value={editDraft}
            onChange={(e) => onEditDraftChange(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            onBlur={onCommitEdit}
          />
        ) : (
          <span className={styles.title} onDoubleClick={onStartEdit}>
            {card.title}
          </span>
        )}
        <button className={styles.removeButton} onClick={onRemove} aria-label="Remover tarefa">
          ×
        </button>
      </div>

      <div className={styles.chipRow}>
        <button
          className={styles.chip}
          style={{ border: `1px solid ${tone.border}`, background: tone.background, color: tone.text }}
          onClick={onCycleTag}
        >
          {tagLabel[card.tag]}
        </button>
        <button className={styles.subtaskChip} onClick={onToggleExpanded}>
          {card.subtasks.length > 0 ? `${doneSubtasks}/${card.subtasks.length} subtarefas` : '+ subtarefa'}
        </button>
        {isFocusTarget ? (
          <span className={styles.focusBadge}>em foco</span>
        ) : (
          <button className={styles.focusChip} onClick={onOpenFocusPicker}>
            ▶ foco
          </button>
        )}
      </div>

      {isExpanded && (
        <div className={styles.subtaskList}>
          {card.subtasks.map((subtask) => (
            <div className={styles.subtaskRow} key={subtask.id}>
              <button
                className={`${styles.subtaskBox} ${subtask.done ? styles.subtaskBoxDone : ''}`}
                onClick={() => onToggleSubtask(subtask.id)}
              >
                {subtask.done && <span className={styles.subtaskCheck}>✓</span>}
              </button>
              <span className={`${styles.subtaskTitle} ${subtask.done ? styles.subtaskTitleDone : ''}`}>
                {subtask.title}
              </span>
              <button className={styles.subtaskRemove} onClick={() => onRemoveSubtask(subtask.id)}>
                ×
              </button>
            </div>
          ))}
          <input
            ref={subInputRef}
            className={styles.subtaskInput}
            placeholder="Nova subtarefa… Enter"
            value={subDraft}
            onChange={(e) => onSubDraftChange(e.target.value)}
            onKeyDown={handleSubKeyDown}
          />
        </div>
      )}
    </div>
  );
}
