import { createStyles } from 'antd-style';
import { color, fontSize, radius, space } from '../../../theme/tokens';

const useStyles = createStyles(() => ({
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: space.md3,
    flexWrap: 'wrap',
    fontSize: fontSize.sm,
    color: color.text.faint,
    marginTop: space.xl3,
  },
  highlight: {
    color: color.lime.textMuted,
    fontWeight: 600,
  },
  clearButton: {
    border: `1px solid ${color.border.header}`,
    borderRadius: radius.sm3,
    padding: `${space.xs2}px ${space.sm2}px`,
    background: 'none',
    color: color.text.faint,
    cursor: 'pointer',
    '&:hover': { borderColor: color.coral.text, color: color.coral.text },
  },
}));

export function FooterBar({ onClearDone }: { onClearDone: () => void }) {
  const { styles } = useStyles();

  return (
    <div className={styles.footer}>
      <span>
        Arraste até <span className={styles.highlight}>Feito</span> para ganhar XP (10 / 20 / 30
        conforme a prioridade) · metas 60 e 120 · subtarefa +5 · foco 1 XP/min · zerar a coluna
        Hoje +50
      </span>
      <button className={styles.clearButton} onClick={onClearDone}>
        Limpar concluídos
      </button>
    </div>
  );
}
