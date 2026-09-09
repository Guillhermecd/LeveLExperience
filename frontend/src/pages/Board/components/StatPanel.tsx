import { createStyles } from 'antd-style';
import { color, font, fontSize, radius, space } from '../../../theme/tokens';

const useStyles = createStyles(() => ({
  panel: {
    minWidth: 124,
    padding: `${space.sm3}px ${space.md2}px`,
    borderRadius: radius.md1,
    display: 'flex',
    flexDirection: 'column',
    gap: space.xs3,
  },
  label: {
    fontSize: fontSize.xs,
    letterSpacing: '.12em',
    textTransform: 'uppercase',
  },
  value: {
    fontFamily: font.heading,
    fontSize: fontSize.xxl,
    fontWeight: 600,
    color: color.text.title,
  },
}));

type Variant = 'open' | 'done' | 'goals';

const variantStyle: Record<Variant, { border: string; background: string; label: string; value?: string }> = {
  open: { border: color.border.column, background: color.surface.panel, label: color.text.label },
  done: { border: color.lime.border, background: color.lime.surfaceDone, label: color.lime.textMuted, value: color.lime.text },
  goals: { border: color.violet.border, background: color.violet.surface, label: color.violet.label, value: color.violet.text },
};

export function StatPanel({ variant, label, value }: { variant: Variant; label: string; value: number }) {
  const { styles } = useStyles();
  const tone = variantStyle[variant];

  return (
    <div className={styles.panel} style={{ border: `1px solid ${tone.border}`, background: tone.background }}>
      <span className={styles.label} style={{ color: tone.label }}>
        {label}
      </span>
      <span className={styles.value} style={tone.value ? { color: tone.value } : undefined}>
        {value}
      </span>
    </div>
  );
}
