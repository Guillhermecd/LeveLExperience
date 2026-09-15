import { createStyles } from 'antd-style';
import { space } from '../../../theme/tokens';

export const useDateTimeFieldStyles = createStyles(() => ({
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.xs3,
  },
}));
