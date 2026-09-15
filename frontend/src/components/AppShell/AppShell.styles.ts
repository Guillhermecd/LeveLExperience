import { createStyles } from 'antd-style';
import { color, radius, space, zIndex } from '../../theme/tokens';

export const useAppShellStyles = createStyles(() => ({
  // Fixed rather than part of each page header: the shell is additive, so it
  // must not require BoardPage/ProfilePage to reserve a slot for it.
  trigger: {
    position: 'fixed',
    top: space.md1,
    left: space.md1,
    zIndex: zIndex.navTrigger,
    background: color.surface.panel,
    border: `1px solid ${color.border.header}`,
    borderRadius: radius.sm5,
    color: color.text.body,
    '&:hover': {
      borderColor: color.lime.text,
      color: color.lime.text,
    },
  },
  menu: {
    background: 'transparent',
    borderInlineEnd: 'none',
  },
}));
