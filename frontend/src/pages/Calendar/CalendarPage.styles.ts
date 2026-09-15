import { createStyles } from 'antd-style';
import { color, font, fontSize, space } from '../../theme/tokens';

export const useCalendarPageStyles = createStyles(() => ({
  page: {
    minHeight: '100vh',
    background: `${color.bg.glassBackdrop}, ${color.bg.headerGradient}`,
    backgroundColor: color.bg.base,
    color: color.text.body,
    fontFamily: font.body,
    padding: `${space.xl3}px ${space.lg1}px ${space.xxl}px`,
    display: 'flex',
    flexDirection: 'column',
    gap: space.lg1,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md1,
    flexWrap: 'wrap',
    // Leaves room for the shell's fixed hamburger, which overlaps the top-left.
    paddingLeft: space.xl5,
  },
  title: {
    fontFamily: font.heading,
    fontSize: fontSize.xxl,
    fontWeight: 600,
    letterSpacing: '-.01em',
    color: color.text.title,
  },
  subtitle: {
    fontSize: fontSize.sm13,
    color: color.text.muted,
    marginTop: space.xxs,
  },
  // Side by side once there is room; stacked on xs/sm, where a two-column
  // grid would squeeze the month cells into unreadable slivers.
  columns: {
    display: 'grid',
    gap: space.lg1,
    alignItems: 'start',
  },
  columnsWide: {
    gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
  },
  centered: {
    display: 'flex',
    justifyContent: 'center',
    padding: space.xl3,
  },
}));
