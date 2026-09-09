import { createStyles } from 'antd-style';
import { useEffect, useState } from 'react';
import { color, font, fontSize, radius, space, transition } from '../../../theme/tokens';
import { formatHeaderDate, greeting } from '../../../theme/labels';
import type { Card, FocusSession } from '../../../types/board';

const useStyles = createStyles(() => ({
  header: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: space.xl1,
    flexWrap: 'wrap',
    paddingBottom: space.lg3,
    borderBottom: `1px solid ${color.border.header}`,
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.xs3,
  },
  date: {
    fontSize: fontSize.sm,
    letterSpacing: '.16em',
    textTransform: 'uppercase',
    color: color.text.label,
  },
  greeting: {
    fontFamily: font.heading,
    fontSize: fontSize.xxxl,
    fontWeight: 600,
    letterSpacing: '-.02em',
    color: color.text.title,
  },
  right: {
    display: 'flex',
    gap: space.sm3,
    flexWrap: 'wrap',
  },
  focusPanel: {
    minWidth: 250,
    padding: `${space.sm3}px ${space.md2}px`,
    border: `1px solid ${color.amber.border}`,
    borderRadius: radius.md1,
    background: color.panelGradient.focus,
    display: 'flex',
    flexDirection: 'column',
    gap: space.xs2,
  },
  focusTop: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  focusLabel: {
    fontSize: fontSize.xs,
    letterSpacing: '.12em',
    textTransform: 'uppercase',
    color: color.amber.label,
  },
  focusClock: {
    fontFamily: font.heading,
    fontSize: fontSize.xl,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: color.amber.text,
  },
  focusTitle: {
    fontSize: fontSize.sm12_5,
    color: color.text.card,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  focusTrack: {
    height: 4,
    borderRadius: radius.xs,
    background: color.amber.track,
    overflow: 'hidden',
  },
  focusFill: {
    height: '100%',
    background: color.amber.text,
    transition: transition.xpBar,
  },
  focusButtons: {
    display: 'flex',
    gap: space.xs1,
  },
  focusPauseButton: {
    flex: 1,
    background: color.surface.panel,
    border: `1px solid ${color.amber.buttonBorder}`,
    borderRadius: radius.sm5,
    padding: `${space.xs3}px 0`,
    color: color.text.body,
    cursor: 'pointer',
    fontSize: fontSize.sm13,
    '&:hover': {
      borderColor: color.amber.text,
      color: color.amber.text,
    },
  },
  focusEndButton: {
    background: 'transparent',
    border: `1px solid ${color.coral.border}`,
    borderRadius: radius.sm5,
    padding: `${space.xs3}px ${space.sm2}px`,
    color: color.text.body,
    cursor: 'pointer',
    fontSize: fontSize.sm13,
    '&:hover': {
      borderColor: color.coral.text,
      color: color.coral.text,
    },
  },
}));

type Props = {
  name?: string;
  focus: FocusSession | null;
  focusCard: Card | undefined;
  onToggleFocusRunning: () => void;
  onEndFocus: () => void;
};

export function HeaderGreeting({ name }: { name?: string }) {
  const { styles } = useStyles();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.left}>
      <span className={styles.date}>{formatHeaderDate(now)}</span>
      <span className={styles.greeting}>{greeting(now, name)}</span>
    </div>
  );
}

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

export function FocusHeaderPanel({ focus, focusCard, onToggleFocusRunning, onEndFocus }: Props) {
  const { styles } = useStyles();
  if (!focus || !focusCard) return null;
  const progress = 1 - focus.leftSeconds / focus.totalSeconds;

  return (
    <div className={styles.focusPanel}>
      <div className={styles.focusTop}>
        <span className={styles.focusLabel}>Foco</span>
        <span className={styles.focusClock}>{formatClock(focus.leftSeconds)}</span>
      </div>
      <span className={styles.focusTitle}>{focusCard.title}</span>
      <div className={styles.focusTrack}>
        <div className={styles.focusFill} style={{ width: `${progress * 100}%` }} />
      </div>
      <div className={styles.focusButtons}>
        <button className={styles.focusPauseButton} onClick={onToggleFocusRunning}>
          {focus.running ? 'Pausar' : 'Retomar'}
        </button>
        <button className={styles.focusEndButton} onClick={onEndFocus}>
          Encerrar
        </button>
      </div>
    </div>
  );
}
