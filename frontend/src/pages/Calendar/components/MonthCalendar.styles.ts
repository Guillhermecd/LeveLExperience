import { createStyles } from 'antd-style';
import { color, radius, space } from '../../../theme/tokens';

export const useMonthCalendarStyles = createStyles(() => ({
  wrapper: {
    background: color.surface.panel,
    border: `1px solid ${color.border.column}`,
    borderRadius: radius.lg1,
    padding: space.md1,
  },
  dots: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: space.three,
    marginTop: space.xxs,
  },
  dot: {
    width: space.xs1,
    height: space.xs1,
    borderRadius: radius.circle,
  },
}));
