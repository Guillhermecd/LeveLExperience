import type { KeyboardEvent } from 'react';
import { tagLabel } from '../../../theme/labels';
import type { Card } from '../../../types/board';
import { priorityColor, tagTone, useTaskCardStyles } from './TaskCard.styles';
import { TaskCardSubtasks } from './TaskCardSubtasks';

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
  const { styles } = useTaskCardStyles();
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
        <TaskCardSubtasks
          subtasks={card.subtasks}
          subDraft={subDraft}
          onSubDraftChange={onSubDraftChange}
          onAddSubtask={onAddSubtask}
          onToggleSubtask={onToggleSubtask}
          onRemoveSubtask={onRemoveSubtask}
          onClose={onToggleExpanded}
        />
      )}
    </div>
  );
}
