import { createStyles } from 'antd-style';
import { color, font, fontSize, radius, space, zIndex } from '../../theme/tokens';

export const useNotificationBellStyles = createStyles(() => ({
  // Fixed like the hamburger trigger, mirrored to the right edge — same
  // reasoning: additive chrome, no page has to reserve a header slot for it.
  // The fixed positioning lives on this wrapper, not on the button itself:
  // Badge positions its count `<sup>` from the child's normal-flow size, and
  // a `position: fixed` button reports zero size to its Badge parent.
  triggerWrapper: {
    position: 'fixed',
    top: space.md1,
    right: space.md1,
    zIndex: zIndex.navTrigger,
  },
  trigger: {
    background: color.surface.panel,
    border: `1px solid ${color.border.header}`,
    borderRadius: radius.sm5,
    color: color.text.body,
    '&:hover': {
      borderColor: color.amber.text,
      color: color.amber.text,
    },
  },
  panel: {
    width: 320,
    maxHeight: 400,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: space.xs3,
    fontFamily: font.body,
  },
  panelTitle: {
    fontFamily: font.heading,
    fontSize: fontSize.md15,
    fontWeight: 600,
    color: color.text.title,
    marginBottom: space.xxs,
  },
  empty: {
    fontSize: fontSize.sm13,
    color: color.text.muted,
    padding: `${space.sm1}px 0`,
  },
  item: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: space.xs3,
    padding: `${space.xs3}px ${space.xxs}px`,
    borderRadius: radius.sm3,
    '&:hover': {
      background: color.surface.cardHover,
    },
  },
  itemIcon: {
    color: color.amber.text,
    marginTop: space.three,
  },
  itemBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  itemTitle: {
    fontSize: fontSize.sm13,
    color: color.text.card,
  },
  itemDetail: {
    fontSize: fontSize.xs11_5,
    color: color.text.muted,
  },
}));
