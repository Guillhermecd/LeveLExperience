import type { KeyboardEvent } from 'react';
import { goalScopeLabel } from '../../../theme/labels';
import type { Goal, GoalScope } from '../../../types/board';
import type { BoardState } from '../state/useBoardState';
import { GoalCard } from './GoalCard';
import { useGoalColumnStyles } from './GoalColumn.styles';

export function GoalColumn({ scope, state }: { scope: GoalScope; state: BoardState }) {
  const { styles } = useGoalColumnStyles();
  const goals = state.goals.filter((g: Goal) => g.scope === scope);
  const doneCount = goals.filter((g) => g.done).length;
  const isAdding = state.adding === `goal:${scope}`;

  function handleAddKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      state.commitAddGoal(scope);
    } else if (event.key === 'Escape') {
      state.cancelAdding();
    }
  }

  return (
    <div className={styles.column}>
      <div className={styles.header}>
        <span className={styles.title}>{goalScopeLabel[scope]}</span>
        <span className={styles.summary}>
          {goals.length > 0 ? `${doneCount}/${goals.length} concluídas` : 'sem metas'}
        </span>
      </div>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: goals.length > 0 ? `${(doneCount / goals.length) * 100}%` : '0%' }}
        />
      </div>

      {goals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} state={state} />
      ))}

      {isAdding ? (
        <textarea
          className={styles.addArea}
          rows={2}
          autoFocus
          placeholder="Nova meta… Enter para salvar"
          value={state.draft}
          onChange={(e) => state.setDraft(e.target.value)}
          onKeyDown={handleAddKeyDown}
          onBlur={() => state.commitAddGoal(scope)}
        />
      ) : (
        <button className={styles.addButton} onClick={() => state.startAdding(`goal:${scope}`)}>
          + Adicionar meta
        </button>
      )}
    </div>
  );
}
