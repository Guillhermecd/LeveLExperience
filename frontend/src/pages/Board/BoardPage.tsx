import { createStyles } from 'antd-style';
import { color, font, space } from '../../theme/tokens';
import { useBoardState } from './useBoardState';
import { FocusHeaderPanel, HeaderGreeting } from './components/Header';
import { LevelPanel } from './components/LevelPanel';
import { StatPanel } from './components/StatPanel';
import { BoardColumns } from './components/BoardColumns';
import { GoalsSection } from './components/GoalsSection';
import { ActivityChart } from './components/ActivityChart';
import { FooterBar } from './components/FooterBar';
import { FocusModal } from './components/FocusModal';

const useStyles = createStyles(() => ({
  page: {
    minHeight: '100vh',
    background: color.bg.headerGradient,
    backgroundColor: color.bg.base,
    color: color.text.body,
    fontFamily: font.body,
    padding: `${space.xl3}px ${space.xl4}px ${space.xxl}px`,
    display: 'flex',
    flexDirection: 'column',
    gap: space.xl3,
  },
  headerRight: {
    display: 'flex',
    gap: space.sm3,
    flexWrap: 'wrap',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: space.xl1,
    flexWrap: 'wrap',
    paddingBottom: space.lg3,
    borderBottom: `1px solid ${color.border.header}`,
  },
}));

/** Fase 1: static UI wired to in-memory mock state — see useBoardState.ts. */
export function BoardPage({ name, showGoals = true }: { name?: string; showGoals?: boolean }) {
  const { styles } = useStyles();
  const state = useBoardState();
  const focusCard = state.cards.find((c) => c.id === state.focus?.cardId);
  const pickedCard = state.cards.find((c) => c.id === state.pick);

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <HeaderGreeting name={name} />
        <div className={styles.headerRight}>
          <FocusHeaderPanel
            focus={state.focus}
            focusCard={focusCard}
            onToggleFocusRunning={state.toggleFocusRunning}
            onEndFocus={state.endFocus}
          />
          <LevelPanel level={2} rank="Aprendiz" xpInLevel={40} xpForLevel={160} xpTotal={140} streak={3} gainText={null} />
          <StatPanel variant="open" label="Em aberto" value={state.openCount} />
          <StatPanel variant="done" label="Tarefas feitas" value={state.doneCount} />
          <StatPanel variant="goals" label="Metas batidas" value={state.goalsDoneCount} />
        </div>
      </div>

      <BoardColumns state={state} />

      {showGoals && <GoalsSection state={state} />}

      <ActivityChart history={state.history} />

      <FooterBar onClearDone={state.clearDone} />

      {pickedCard && (
        <FocusModal
          card={pickedCard}
          minutes={state.pickMinutes}
          onMinutesChange={state.setPickMinutes}
          onStart={(minutes) => state.startFocus(pickedCard.id, minutes)}
          onCancel={state.closeFocusPicker}
        />
      )}
    </div>
  );
}
