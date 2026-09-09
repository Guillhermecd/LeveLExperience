import type { KeyboardEvent } from 'react';
import type { Subtask } from '../../../types/board';
import { useTaskCardStyles } from './TaskCard.styles';

type Props = {
  subtasks: Subtask[];
  subDraft: string;
  onSubDraftChange: (value: string) => void;
  onAddSubtask: () => void;
  onToggleSubtask: (subtaskId: string) => void;
  onRemoveSubtask: (subtaskId: string) => void;
  onClose: () => void;
};

export function TaskCardSubtasks({
  subtasks,
  subDraft,
  onSubDraftChange,
  onAddSubtask,
  onToggleSubtask,
  onRemoveSubtask,
  onClose,
}: Props) {
  const { styles } = useTaskCardStyles();

  function handleSubKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      onAddSubtask();
    } else if (event.key === 'Escape') {
      onClose();
    }
  }

  return (
    <div className={styles.subtaskList}>
      {subtasks.map((subtask) => (
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
        className={styles.subtaskInput}
        placeholder="Nova subtarefa… Enter"
        value={subDraft}
        onChange={(e) => onSubDraftChange(e.target.value)}
        onKeyDown={handleSubKeyDown}
      />
    </div>
  );
}
