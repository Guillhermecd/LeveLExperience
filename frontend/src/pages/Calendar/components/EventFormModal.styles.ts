import { createStyles } from 'antd-style';
import { color, font, fontSize, radius, shadow, space, zIndex } from '../../../theme/tokens';

// Same overlay/box chrome as the board's FocusModal — the app has exactly one
// modal look, and it lives in CSS-in-JS, not in an antd Modal skin.
export const useEventFormModalStyles = createStyles(() => ({
  overlay: {
    position: 'fixed',
    inset: 0,
    background: color.glass.overlay,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.lg1,
    zIndex: zIndex.modal,
    overflowY: 'auto',
  },
  box: {
    maxWidth: 460,
    width: '100%',
    background: color.surface.modal,
    border: `1px solid ${color.border.goalColumn}`,
    borderRadius: radius.lg2,
    padding: `${space.lg2}px ${space.lg2}px ${space.twentyTwo}px`,
    boxShadow: shadow.modal,
    display: 'flex',
    flexDirection: 'column',
    gap: space.md1,
  },
  label: {
    fontSize: fontSize.xs,
    letterSpacing: '.14em',
    textTransform: 'uppercase',
    color: color.lime.textMuted,
  },
  title: {
    fontFamily: font.heading,
    fontSize: fontSize.lg,
    fontWeight: 600,
    letterSpacing: '-.01em',
    color: color.text.title,
    marginTop: space.xxs,
  },
  colorRow: {
    display: 'flex',
    gap: space.xs3,
  },
  colorDot: {
    width: space.sm2,
    height: space.sm2,
    borderRadius: radius.circle,
    display: 'inline-block',
  },
  footerRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: space.xs3,
  },
}));
