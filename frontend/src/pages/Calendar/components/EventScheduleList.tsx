import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, List, Popconfirm } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef } from 'react';
import type { CalendarEvent } from '../../../types/calendar';
import { groupByDay } from '../calendarGrouping';
import { eventDotColor } from '../eventColors';
import { useEventScheduleListStyles } from './EventScheduleList.styles';

type Props = {
  events: CalendarEvent[];
  selectedDay: string;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
};

function formatDayHeading(dayIso: string): string {
  return dayjs(dayIso).format('dddd, D [de] MMMM');
}

function formatTimeRange(event: CalendarEvent): string {
  const start = dayjs(event.startsAt).format('HH:mm');
  return event.endsAt ? `${start} – ${dayjs(event.endsAt).format('HH:mm')}` : start;
}

export function EventScheduleList({ events, selectedDay, onEdit, onDelete }: Props) {
  const { styles, cx } = useEventScheduleListStyles();
  const groups = useMemo(() => groupByDay(events), [events]);
  const containerRef = useRef<HTMLDivElement>(null);

  // The list always shows the whole month; picking a day scrolls to its group
  // rather than filtering, so the surrounding days stay in view.
  useEffect(() => {
    const target = containerRef.current?.querySelector(`[data-day="${selectedDay}"]`);
    target?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedDay, groups]);

  return (
    <div className={styles.wrapper} ref={containerRef}>
      {groups.length === 0 && <div className={styles.empty}>Nenhum compromisso neste mês.</div>}

      {groups.map((group) => (
        <div
          key={group.dayIso}
          data-day={group.dayIso}
          className={cx(styles.group, group.dayIso === selectedDay && styles.groupSelected)}
        >
          <div className={styles.groupTitle}>{formatDayHeading(group.dayIso)}</div>
          <List
            dataSource={group.events}
            split={false}
            renderItem={(event) => (
              <div className={styles.item} key={event.id}>
                <span className={styles.dot} style={{ background: eventDotColor(event.color) }} />
                <span className={styles.time}>{formatTimeRange(event)}</span>
                <span className={styles.titleText}>
                  {event.title}
                  {event.description && <div className={styles.description}>{event.description}</div>}
                </span>
                <span className={styles.actions}>
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    aria-label={`Editar ${event.title}`}
                    onClick={() => onEdit(event)}
                  />
                  <Popconfirm
                    title="Excluir compromisso?"
                    description="Essa ação não pode ser desfeita."
                    okText="Excluir"
                    okButtonProps={{ danger: true }}
                    cancelText="Cancelar"
                    onConfirm={() => onDelete(event.id)}
                  >
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      aria-label={`Excluir ${event.title}`}
                    />
                  </Popconfirm>
                </span>
              </div>
            )}
          />
        </div>
      ))}
    </div>
  );
}
