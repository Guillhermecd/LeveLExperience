import { createStyles } from 'antd-style';
import { color, font, fontSize, space } from '../../../theme/tokens';
import type { BoardColumn as BoardColumnKey } from '../../../types/board';
import type { BoardState } from '../state/useBoardState';
import { BoardColumn } from './BoardColumn';

const useStyles = createStyles(() => ({
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: space.md2,
    alignItems: 'start',
  },
}));

const columns: BoardColumnKey[] = ['backlog', 'today', 'doing', 'done'];

export function BoardColumns({ state }: { state: BoardState }) {
  const { styles } = useStyles();

  return (
    <section>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Fluxo diário</span>
        <div className={styles.rule} />
      </div>
      <div className={styles.grid}>
        {columns.map((columnKey) => (
          <BoardColumn key={columnKey} columnKey={columnKey} state={state} />
        ))}
      </div>
    </section>
  );
}
