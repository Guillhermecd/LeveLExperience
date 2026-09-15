import { Calendar, Grid } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useMemo } from 'react';
import type { CalendarEvent } from '../../../types/calendar';
import { dayKeyOf } from '../calendarGrouping';
import { eventDotColor } from '../eventColors';
import { useMonthCalendarStyles } from './MonthCalendar.styles';

const MAX_DOTS = 3;

type Props = {
  month: Dayjs;
  events: CalendarEvent[];
  selectedDay: string;
  onSelectDay: (dayKey: string) => void;
  onMonthChange: (month: Dayjs) => void;
};

export function MonthCalendar({ month, events, selectedDay, onSelectDay, onMonthChange }: Props) {
  const { styles } = useMonthCalendarStyles();
  const screens = Grid.useBreakpoint();

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const key = dayKeyOf(event.startsAt);
      map.set(key, [...(map.get(key) ?? []), event]);
    }
    return map;
  }, [events]);

  return (
    <div className={styles.wrapper}>
      <Calendar
        // The compact calendar is the only one that fits a phone; the full one
        // would force a horizontal scroll.
        fullscreen={Boolean(screens.md)}
        value={dayjs(selectedDay).isValid() ? dayjs(selectedDay) : month}
        cellRender={(date, info) => {
          if (info.type !== 'date') return info.originNode;
          const dayEvents = eventsByDay.get(date.format('YYYY-MM-DD')) ?? [];
          if (dayEvents.length === 0) return null;
          return (
            <div className={styles.dots}>
              {dayEvents.slice(0, MAX_DOTS).map((event) => (
                <span
                  key={event.id}
                  className={styles.dot}
                  style={{ background: eventDotColor(event.color) }}
                />
              ))}
            </div>
          );
        }}
        // Selecting a day scrolls the schedule list to that group — it never
        // filters the list, which always shows the whole month.
        onSelect={(date, info) => {
          if (info.source === 'date') {
            onSelectDay(date.format('YYYY-MM-DD'));
          }
        }}
        onPanelChange={(date) => onMonthChange(date)}
      />
    </div>
  );
}
