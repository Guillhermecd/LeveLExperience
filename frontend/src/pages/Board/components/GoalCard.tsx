import type { Goal } from '../../../types/board';
import type { BoardState } from '../state/useBoardState';
import { useGoalCardStyles } from './GoalColumn.styles';

export function GoalCard({ goal, state }: { goal: Goal; state: BoardState }) {
  const { styles } = useGoalCardStyles();
  const isEditing = state.editing === goal.id;

  return (
    <div className={styles.card}>
      <button
        className={`${styles.checkbox} ${goal.done ? styles.checkboxDone : ''}`}
        onClick={() => state.toggleGoal(goal.id)}
      >
        {goal.done && <span className={styles.check}>✓</span>}
      </button>
      {isEditing ? (
        <textarea
          className={styles.editArea}
          rows={2}
          autoFocus
          value={state.editDraft}
          onChange={(e) => state.setEditDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              state.commitGoalEdit();
            } else if (e.key === 'Escape') {
              state.cancelCardEdit();
            }
          }}
          onBlur={state.commitGoalEdit}
        />
      ) : (
        <span
          className={`${styles.title} ${goal.done ? styles.titleDone : ''}`}
          onDoubleClick={() => state.startGoalEditing(goal)}
        >
          {goal.title}
        </span>
      )}
      <button className={styles.removeButton} onClick={() => state.removeGoal(goal.id)}>
        ×
      </button>
    </div>
  );
}
