import { createStyles } from 'antd-style';
import { color, font, fontSize, radius, space } from '../../../theme/tokens';

export const useEventScheduleListStyles = createStyles(() => ({
  wrapper: {
    background: color.surface.panel,
    border: `1px solid ${color.border.column}`,
    borderRadius: radius.lg1,
    padding: space.md1,
    display: 'flex',
    flexDirection: 'column',
    gap: space.md3,
    maxHeight: '70vh',
    overflowY: 'auto',
  },
  group: {
    border: `1px solid ${color.border.subtle}`,
    borderRadius: radius.md1,
    padding: space.sm2,
    // scroll-margin so the anchored group does not land under the sticky
    // container edge when scrollIntoView jumps to it.
    scrollMarginTop: space.md3,
  },
  groupSelected: {
    borderColor: color.lime.border,
    background: color.lime.surfaceDone,
  },
  groupTitle: {
    fontFamily: font.heading,
    fontSize: fontSize.sm13,
    letterSpacing: '.04em',
    textTransform: 'uppercase',
    color: color.text.sectionLabel,
    marginBottom: space.xs3,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: space.sm1,
    padding: `${space.xs3}px 0`,
    borderTop: `1px solid ${color.border.subtaskDivider}`,
    '&:first-of-type': { borderTop: 'none' },
  },
  dot: {
    width: space.xs3,
    height: space.xs3,
    borderRadius: radius.circle,
    flexShrink: 0,
  },
  time: {
    fontFamily: font.heading,
    fontSize: fontSize.sm13,
    color: color.text.muted,
    minWidth: 84,
  },
  titleText: {
    flex: 1,
    fontSize: fontSize.md,
    color: color.text.card,
  },
  description: {
    fontSize: fontSize.xs11_5,
    color: color.text.faint,
    marginTop: space.three,
  },
  actions: {
    display: 'flex',
    gap: space.xxs,
    flexShrink: 0,
  },
  empty: {
    fontSize: fontSize.sm13,
    color: color.text.faint,
    textAlign: 'center',
    padding: `${space.md3}px 0`,
  },
}));
