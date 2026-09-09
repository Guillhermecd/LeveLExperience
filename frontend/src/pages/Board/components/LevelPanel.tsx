import { createStyles } from 'antd-style';
import { color, font, fontSize, radius, space, transition } from '../../../theme/tokens';

const useStyles = createStyles(() => ({
  panel: {
    minWidth: 288,
    padding: `${space.sm3}px ${space.md2}px`,
    border: `1px solid ${color.lime.border}`,
    borderRadius: radius.md1,
    background: color.panelGradient.level,
    display: 'flex',
    flexDirection: 'column',
    gap: space.xs3,
  },
  top: {
    display: 'flex',
    alignItems: 'center',
    gap: space.sm2,
    position: 'relative',
  },
  levelBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md1,
    background: color.lime.text,
    color: color.lime.onLime,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1.1,
  },
  levelNumber: {
    fontFamily: font.heading,
    fontSize: fontSize.md17,
    fontWeight: 700,
  },
  levelWord: {
    fontSize: fontSize.xxs,
    letterSpacing: '.14em',
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  rankColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  rank: {
    fontFamily: font.heading,
    fontSize: fontSize.md16,
    fontWeight: 600,
    color: color.text.title,
  },
  xpText: {
    fontSize: fontSize.sm,
    color: color.lime.textMuted,
    fontVariantNumeric: 'tabular-nums',
  },
  pill: {
    marginLeft: 'auto',
    background: color.lime.text,
    color: color.lime.onLime,
    fontSize: fontSize.sm,
    fontWeight: 600,
    borderRadius: radius.pill,
    padding: `${space.xxs}px ${space.sm1}px`,
    whiteSpace: 'nowrap',
  },
  track: {
    height: 6,
    borderRadius: radius.sm2,
    background: color.lime.trackBg,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    background: color.lime.gradient,
    transition: transition.xpBar,
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: fontSize.xs,
    color: color.text.label,
  },
}));

type Props = {
  level: number;
  rank: string;
  xpInLevel: number;
  xpForLevel: number;
  xpTotal: number;
  streak: number;
  gainText: string | null;
};

export function LevelPanel({ level, rank, xpInLevel, xpForLevel, xpTotal, streak, gainText }: Props) {
  const { styles } = useStyles();
  const progress = Math.min(1, xpInLevel / xpForLevel);

  return (
    <div className={styles.panel}>
      <div className={styles.top}>
        <div className={styles.levelBadge}>
          <span className={styles.levelNumber}>{level}</span>
          <span className={styles.levelWord}>nível</span>
        </div>
        <div className={styles.rankColumn}>
          <span className={styles.rank}>{rank}</span>
          <span className={styles.xpText}>
            {xpInLevel} / {xpForLevel} XP
          </span>
        </div>
        {gainText && <span className={styles.pill}>{gainText}</span>}
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${progress * 100}%` }} />
      </div>
      <div className={styles.footer}>
        <span>{xpTotal} XP no total</span>
        <span>{streak > 0 ? `${streak} dias seguidos` : 'sem sequência'}</span>
      </div>
    </div>
  );
}
