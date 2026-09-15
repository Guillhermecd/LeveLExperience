import { createStyles } from 'antd-style';
import { Spin } from 'antd';
import { Link } from 'react-router-dom';
import { color, font, space } from '../../theme/tokens';
import { useAuth } from '../Auth/AuthContext';
import { useBoardState } from './state/useBoardState';
import { HeaderGreeting } from './components/HeaderGreeting';
import { FocusHeaderPanel } from './components/FocusHeaderPanel';
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
    position: 'relative',
    overflow: 'hidden',
    background: `${color.bg.glassBackdrop}, ${color.bg.headerGradient}`,
    backgroundColor: color.bg.base,
    color: color.text.body,
    fontFamily: font.body,
    padding: `${space.xl3}px ${space.xl4}px ${space.xxl}px`,
    display: 'flex',
    flexDirection: 'column',
    gap: space.xl3,
  },
  // Decorative, not interactive — give the header panels' backdrop-filter
  // something with color/contrast to actually blur.
  blobLime: {
    position: 'absolute',
    top: -60,
    right: -80,
    width: 680,
    height: 680,
    borderRadius: '50%',
    background: color.glass.blobLime,
    filter: 'blur(70px)',
    pointerEvents: 'none',
    // Negative so normal-flow content (unstyled, no z-index of its own)
    // always paints above these — no need to touch every other child's stacking.
    zIndex: -1,
  },
  blobAmber: {
    position: 'absolute',
    top: -20,
    left: -100,
    width: 560,
    height: 560,
    borderRadius: '50%',
    background: color.glass.blobAmber,
    filter: 'blur(70px)',
    pointerEvents: 'none',
    // Negative so normal-flow content (unstyled, no z-index of its own)
    // always paints above these — no need to touch every other child's stacking.
    zIndex: -1,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: space.sm3,
    flexWrap: 'wrap',
  },
  profileLink: {
    color: color.text.faint,
    fontSize: 13,
    textDecoration: 'none',
    '&:hover': { color: color.text.title },
  },
  headerRow: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: space.xl1,
    flexWrap: 'wrap',
    paddingBottom: space.lg3,
    borderBottom: `1px solid ${color.border.header}`,
    // Leaves room for the shell's fixed hamburger, which otherwise overlaps
    // the greeting text at the page's top-left (same fix as CalendarPage).
    paddingLeft: space.xl5,
  },
}));

/** UI wired to useBoardState, which routes XP-affecting actions through the Fase 2 reducer. */
export function BoardPage({ name, showGoals }: { name?: string; showGoals?: boolean }) {
  const { styles } = useStyles();
  const { user } = useAuth();
  const state = useBoardState();
  const focusCard = state.cards.find((c) => c.id === state.focus?.cardId);
  const pickedCard = state.cards.find((c) => c.id === state.pick);
  const displayName = name ?? user?.name ?? undefined;
  const shouldShowGoals = showGoals ?? user?.showGoals ?? true;

  if (state.loading) {
    return (
      <div className={styles.page} style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (state.loadError) {
    return (
      <div className={styles.page} style={{ alignItems: 'center', justifyContent: 'center' }}>
        <span>Não foi possível carregar o quadro: {state.loadError}</span>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.blobLime} />
      <div className={styles.blobAmber} />
      <div className={styles.headerRow}>
        <HeaderGreeting name={displayName} />
        <div className={styles.headerRight}>
          <FocusHeaderPanel
            focus={state.focus}
            focusCard={focusCard}
            onToggleFocusRunning={state.toggleFocusRunning}
            onEndFocus={state.endFocus}
          />
          <LevelPanel
            level={state.display.level}
            rank={state.display.rank}
            xpInLevel={state.display.xpIntoLevel}
            xpForLevel={state.display.xpForNextLevel}
            xpTotal={state.display.xpTotal}
            streak={state.display.streak}
            gainText={state.gain}
          />
          <StatPanel variant="open" label="Em aberto" value={state.openCount} />
          <StatPanel variant="done" label="Tarefas feitas" value={state.doneCount} />
          <StatPanel variant="goals" label="Metas batidas" value={state.goalsDoneCount} />
          <Link to="/perfil" className={styles.profileLink}>
            Perfil
          </Link>
        </div>
      </div>

      <BoardColumns state={state} />

      {shouldShowGoals && <GoalsSection state={state} />}

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
