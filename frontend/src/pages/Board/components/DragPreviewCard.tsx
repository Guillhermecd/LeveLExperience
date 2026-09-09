import { tagLabel } from '../../../theme/labels';
import { shadow } from '../../../theme/tokens';
import type { Card } from '../../../types/board';
import { priorityColor, tagTone, useTaskCardStyles } from './TaskCard.styles';

/** Static visual copy shown in the DragOverlay — no handlers, it just follows the cursor. */
export function DragPreviewCard({ card }: { card: Card }) {
  const { styles } = useTaskCardStyles();
  const tone = tagTone[card.tag];

  return (
    <div className={styles.card} style={{ boxShadow: shadow.drag, cursor: 'grabbing' }}>
      <div className={styles.titleRow}>
        <span className={styles.priorityDot} style={{ background: priorityColor[card.priority] }} />
        <span className={styles.title}>{card.title}</span>
      </div>
      <div className={styles.chipRow}>
        <span
          className={styles.chip}
          style={{ border: `1px solid ${tone.border}`, background: tone.background, color: tone.text }}
        >
          {tagLabel[card.tag]}
        </span>
      </div>
    </div>
  );
}
