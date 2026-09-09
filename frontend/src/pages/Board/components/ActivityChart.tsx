import { createStyles } from 'antd-style';
import { color, font, fontSize, radius, space } from '../../../theme/tokens';
import { weekdayInitial } from '../../../theme/labels';
import type { DayHistoryEntry } from '../../../types/board';

const useStyles = createStyles(() => ({
  sectionHeader: {
    display: 'flex',
    alignItems: 'baseline',
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
  summary: {
    fontSize: fontSize.sm,
    color: color.text.label,
    whiteSpace: 'nowrap',
  },
  container: {
    background: color.surface.column,
    border: `1px solid ${color.border.column}`,
    borderRadius: radius.lg1,
    padding: `${space.md3}px ${space.md3}px ${space.sm3}px`,
    display: 'flex',
    alignItems: 'flex-end',
    gap: space.sm1,
  },
  day: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: space.xs3,
    alignItems: 'center',
  },
  value: {
    fontSize: fontSize.xs10_5,
    fontVariantNumeric: 'tabular-nums',
    color: color.text.counter,
    height: 14,
  },
  barArea: {
    width: '100%',
    height: 92,
    display: 'flex',
    alignItems: 'flex-end',
  },
  bar: {
    width: '100%',
    minHeight: 3,
    borderRadius: '6px 6px 3px 3px',
  },
  weekday: {
    fontSize: fontSize.xs,
    color: color.text.faint,
  },
}));

function formatTitle(entry: DayHistoryEntry): string {
  const date = new Date(entry.day);
  return `${date.getDate()}/${date.getMonth() + 1} · ${entry.xp} XP · ${entry.done} concluídas`;
}

export function ActivityChart({ history }: { history: DayHistoryEntry[] }) {
  const { styles } = useStyles();
  const max = Math.max(50, ...history.map((d) => d.xp));
  const totalXp = history.reduce((sum, d) => sum + d.xp, 0);
  const todayIndex = history.length - 1;

  return (
    <section>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Últimos 14 dias</span>
        <div className={styles.rule} />
        <span className={styles.summary}>{totalXp} XP nas duas últimas semanas</span>
      </div>
      <div className={styles.container}>
        {history.map((entry, index) => {
          const date = new Date(entry.day);
          const isToday = index === todayIndex;
          return (
            <div className={styles.day} key={entry.day} title={formatTitle(entry)}>
              <span className={styles.value}>{entry.xp > 0 ? entry.xp : ''}</span>
              <div className={styles.barArea}>
                <div
                  className={styles.bar}
                  style={{
                    height: `${(entry.xp / max) * 100}%`,
                    background: isToday ? color.lime.barToday : color.neutral.barTrack,
                  }}
                />
              </div>
              <span className={styles.weekday}>{weekdayInitial[date.getDay()]}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
