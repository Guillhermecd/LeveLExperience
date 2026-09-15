import { createStyles } from 'antd-style';
import { blur, color, font, fontSize, radius, space, transition } from '../../../theme/tokens';
import type { Card, FocusSession } from '../../../types/board';

const useStyles = createStyles(() => ({
  panel: {
    minWidth: 250,
    padding: `${space.sm3}px ${space.md2}px`,
    border: `1px solid ${color.amber.border}`,
    borderRadius: radius.md1,
    background: color.glass.focus,
    backdropFilter: blur.panelSaturate,
    WebkitBackdropFilter: blur.panelSaturate,
    boxShadow: `inset 0 1px 0 ${color.glass.borderStrong}`,
    display: 'flex',
    flexDirection: 'column',
    gap: space.xs2,
    '@supports not (backdrop-filter: blur(1px))': {
      // Opaque fallback so the panel stays legible without blur support.
      background: color.surface.panel,
    },
  },
  top: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: fontSize.xs,
    letterSpacing: '.12em',
    textTransform: 'uppercase',
    color: color.amber.label,
  },
  clock: {
    fontFamily: font.heading,
    fontSize: fontSize.xl,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: color.amber.text,
  },
  title: {
    fontSize: fontSize.sm12_5,
    color: color.text.card,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  track: {
    height: 4,
    borderRadius: radius.xs,
    background: color.amber.track,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    background: color.amber.text,
    transition: transition.xpBar,
  },
  buttons: {
    display: 'flex',
    gap: space.xs1,
  },
  pauseButton: {
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
  endButton: {
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

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

type Props = {
  focus: FocusSession | null;
  focusCard: Card | undefined;
  onToggleFocusRunning: () => void;
  onEndFocus: () => void;
};

export function FocusHeaderPanel({ focus, focusCard, onToggleFocusRunning, onEndFocus }: Props) {
  const { styles } = useStyles();
  if (!focus || !focusCard) return null;
  const progress = 1 - focus.leftSeconds / focus.totalSeconds;

  return (
    <div className={styles.panel}>
      <div className={styles.top}>
        <span className={styles.label}>Foco</span>
        <span className={styles.clock}>{formatClock(focus.leftSeconds)}</span>
      </div>
      <span className={styles.title}>{focusCard.title}</span>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${progress * 100}%` }} />
      </div>
      <div className={styles.buttons}>
        <button className={styles.pauseButton} onClick={onToggleFocusRunning}>
          {focus.running ? 'Pausar' : 'Retomar'}
        </button>
        <button className={styles.endButton} onClick={onEndFocus}>
          Encerrar
        </button>
      </div>
    </div>
  );
}
