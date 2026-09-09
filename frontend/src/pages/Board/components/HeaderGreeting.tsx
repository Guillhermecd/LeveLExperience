import { createStyles } from 'antd-style';
import { useEffect, useState } from 'react';
import { color, font, fontSize, space } from '../../../theme/tokens';
import { formatHeaderDate, greeting } from '../../../theme/labels';

const useStyles = createStyles(() => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.xs3,
  },
  date: {
    fontSize: fontSize.sm,
    letterSpacing: '.16em',
    textTransform: 'uppercase',
    color: color.text.label,
  },
  greeting: {
    fontFamily: font.heading,
    fontSize: fontSize.xxxl,
    fontWeight: 600,
    letterSpacing: '-.02em',
    color: color.text.title,
  },
}));

export function HeaderGreeting({ name }: { name?: string }) {
  const { styles } = useStyles();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.wrapper}>
      <span className={styles.date}>{formatHeaderDate(now)}</span>
      <span className={styles.greeting}>{greeting(now, name)}</span>
    </div>
  );
}
