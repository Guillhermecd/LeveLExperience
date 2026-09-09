import type { KeyboardEvent } from 'react';
import { space } from '../../../theme/tokens';
import type { Card } from '../../../types/board';
import { useFocusModalStyles } from './FocusModal.styles';

const shortcuts = [15, 25, 45, 60];

type Props = {
  card: Card;
  minutes: string;
  onMinutesChange: (value: string) => void;
  onStart: (minutes: number) => void;
  onCancel: () => void;
};

export function FocusModal({ card, minutes, onMinutesChange, onStart, onCancel }: Props) {
  const { styles } = useFocusModalStyles();

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
