import { createStyles } from 'antd-style';
import type { KeyboardEvent } from 'react';
import { color, font, fontSize, radius, space, transition } from '../../../theme/tokens';
import { goalScopeLabel } from '../../../theme/labels';
import type { Goal, GoalScope } from '../../../types/board';
import type { BoardState } from '../useBoardState';

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
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: space.md2,
  },
  column: {
    background: 'transparent',
    border: `1px solid ${color.border.goalColumn}`,
    borderRadius: radius.lg1,
    padding: `${space.md2}px ${space.md1}px ${space.sm3}px`,
    minHeight: 200,
    display: 'flex',
    flexDirection: 'column',
    gap: space.sm2,
  },
  columnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  columnTitle: {
    fontFamily: font.heading,
    fontSize: fontSize.md17,
    fontWeight: 600,
    color: color.text.title,
  },
  columnSummary: {
    fontSize: fontSize.sm,
    color: color.text.label,
  },
  track: {
    height: 4,
    borderRadius: radius.xs,
    background: color.neutral.barTrackAlt,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    background: color.lime.text,
    transition: transition.xpBar,
  },
  card: {
    background: color.surface.column,
    border: `1px solid ${color.border.goalCard}`,
    borderRadius: radius.md1,
    padding: `${space.thirteen}px ${space.thirteen}px ${space.sm2}px`,
    display: 'flex',
    gap: space.sm2,
    alignItems: 'flex-start',
    '&:hover': { borderColor: color.border.cardHover },
  },
  checkbox: {
    width: 18,
    height: 18,
    minWidth: 18,
    borderRadius: radius.sm1,
    border: `1px solid ${color.border.checkboxIdle}`,
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    marginTop: 1,
    '&:hover': { borderColor: color.lime.text, background: color.lime.surfaceGoalHover },
  },
  checkboxDone: {
    background: color.lime.text,
    borderColor: color.lime.text,
  },
  check: {
    fontSize: 12,
    fontWeight: 700,
    color: color.lime.onLime,
  },
  title: {
    flex: 1,
    fontSize: fontSize.md14_5,
    lineHeight: 1.45,
    color: color.text.card,
  },
  titleDone: {
    color: color.text.counter,
    textDecoration: 'line-through',
  },
  editArea: {
    flex: 1,
    background: color.surface.field,
    border: `1px solid ${color.border.fieldFocus}`,
    borderRadius: radius.sm3,
    padding: space.xs3,
    fontSize: fontSize.md14_5,
    color: color.text.card,
    fontFamily: font.body,
    resize: 'none',
  },
  removeButton: {
    background: 'none',
    border: 'none',
    fontSize: fontSize.md15,
    color: color.text.icon,
    cursor: 'pointer',
    '&:hover': { color: color.coral.text },
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
    '&:hover': { borderColor: color.lime.text, color: color.lime.text },
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

const scopes: GoalScope[] = ['week', 'month'];

export function GoalsSection({ state }: { state: BoardState }) {
  const { styles } = useStyles();

  return (
    <section>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Metas</span>
        <div className={styles.rule} />
      </div>
      <div className={styles.grid}>
        {scopes.map((scope) => (
          <GoalColumnView key={scope} scope={scope} state={state} />
        ))}
      </div>
    </section>
  );
}

function GoalColumnView({ scope, state }: { scope: GoalScope; state: BoardState }) {
  const { styles } = useStyles();
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
      <div className={styles.columnHeader}>
        <span className={styles.columnTitle}>{goalScopeLabel[scope]}</span>
        <span className={styles.columnSummary}>
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
        <div className={styles.card} key={goal.id}>
          <button
            className={`${styles.checkbox} ${goal.done ? styles.checkboxDone : ''}`}
            onClick={() => state.toggleGoal(goal.id)}
          >
            {goal.done && <span className={styles.check}>✓</span>}
          </button>
          {state.editing === goal.id ? (
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
