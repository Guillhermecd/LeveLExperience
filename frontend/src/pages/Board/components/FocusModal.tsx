import { createStyles } from 'antd-style';
import type { KeyboardEvent } from 'react';
import { color, font, fontSize, radius, shadow, space } from '../../../theme/tokens';
import type { Card } from '../../../types/board';

const useStyles = createStyles(() => ({
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(8,9,13,.74)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.lg1,
    zIndex: 1000,
  },
  box: {
    maxWidth: 420,
    width: '100%',
    background: color.surface.modal,
    border: `1px solid ${color.border.goalColumn}`,
    borderRadius: radius.lg2,
    padding: `${space.lg2}px ${space.lg2}px ${space.twentyTwo}px`,
    boxShadow: shadow.modal,
    display: 'flex',
    flexDirection: 'column',
    gap: space.md3,
  },
  label: {
    fontSize: fontSize.xs,
    letterSpacing: '.14em',
    textTransform: 'uppercase',
    color: color.amber.label,
  },
  title: {
    fontFamily: font.heading,
    fontSize: fontSize.lg,
    fontWeight: 600,
    letterSpacing: '-.01em',
    color: color.text.title,
    marginTop: space.xxs,
  },
  shortcutGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: space.xs3,
  },
  shortcut: {
    background: color.surface.chipDefault,
    border: `1px solid ${color.border.field}`,
    borderRadius: radius.sm5,
    padding: `${space.sm2}px 0`,
    fontFamily: font.heading,
    fontSize: fontSize.md15,
    fontWeight: 600,
    color: color.text.card,
    cursor: 'pointer',
    '&:hover': { borderColor: color.amber.text, color: color.amber.text },
  },
  fieldRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: space.xs3,
  },
  field: {
    background: color.surface.field,
    border: `1px solid ${color.border.field}`,
    borderRadius: radius.sm5,
    padding: `${space.sm1}px ${space.sm2}px`,
    fontSize: fontSize.lg,
    color: color.text.card,
    fontFamily: font.body,
    width: 90,
    boxSizing: 'border-box',
  },
  fieldLabel: {
    fontSize: fontSize.md,
    color: color.text.muted,
  },
  note: {
    fontSize: fontSize.xs11_5,
    color: color.text.faint,
  },
  footerRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: space.xs3,
  },
  cancelButton: {
    background: 'transparent',
    border: `1px solid ${color.border.goalColumn}`,
    color: color.text.muted,
    borderRadius: radius.sm5,
    padding: `${space.xs4}px ${space.md2}px`,
    cursor: 'pointer',
    '&:hover': { borderColor: color.coral.text, color: color.coral.text },
  },
  startButton: {
    background: color.amber.text,
    border: `1px solid ${color.amber.text}`,
    color: color.amber.surface,
    fontWeight: 600,
    fontSize: fontSize.sm13,
    borderRadius: radius.sm5,
    padding: `${space.xs4}px ${space.md2}px`,
    cursor: 'pointer',
    '&:hover': { background: color.amber.textHover, borderColor: color.amber.textHover },
  },
}));

const shortcuts = [15, 25, 45, 60];

type Props = {
  card: Card;
  minutes: string;
  onMinutesChange: (value: string) => void;
  onStart: (minutes: number) => void;
  onCancel: () => void;
};

export function FocusModal({ card, minutes, onMinutesChange, onStart, onCancel }: Props) {
  const { styles } = useStyles();

  function handleFieldKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      onStart(Number(minutes) || 25);
    } else if (event.key === 'Escape') {
      onCancel();
    }
  }

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.box} onClick={(e) => e.stopPropagation()}>
        <div>
          <div className={styles.label}>Sessão de foco</div>
          <div className={styles.title}>{card.title}</div>
        </div>

        <div className={styles.shortcutGrid}>
          {shortcuts.map((value) => (
            <button key={value} className={styles.shortcut} onClick={() => onStart(value)}>
              {value}
            </button>
          ))}
        </div>

        <div className={styles.fieldRow}>
          <input
            className={styles.field}
            type="number"
            min={1}
            max={180}
            autoFocus
            value={minutes}
            onChange={(e) => onMinutesChange(e.target.value)}
            onKeyDown={handleFieldKeyDown}
          />
          <span className={styles.fieldLabel}>minutos</span>
        </div>

        <div>
          <div className={styles.note}>1 XP por minuto, mínimo 10</div>
          <div className={styles.footerRow} style={{ marginTop: space.sm2 }}>
            <button className={styles.cancelButton} onClick={onCancel}>
              Cancelar
            </button>
            <button className={styles.startButton} onClick={() => onStart(Number(minutes) || 25)}>
              Iniciar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
