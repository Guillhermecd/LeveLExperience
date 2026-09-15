import { PlusOutlined } from '@ant-design/icons';
import { Alert, Button, Grid, Spin } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { ApiError } from '../../api/api';
import type { CalendarEvent, CalendarEventInput } from '../../types/calendar';
import { useCalendarPageStyles } from './CalendarPage.styles';
import { EventFormModal } from './components/EventFormModal';
import { EventScheduleList } from './components/EventScheduleList';
import { MonthCalendar } from './components/MonthCalendar';
import { useCalendarEvents } from './state/useCalendarEvents';

type Editing = { event: CalendarEvent | null } | null;

export function CalendarPage() {
  const { styles, cx } = useCalendarPageStyles();
  const screens = Grid.useBreakpoint();
  const {
    month,
    setMonth,
    selectedDay,
    setSelectedDay,
    events,
    loading,
    error,
    create,
    update,
    remove,
  } = useCalendarEvents();
  const [editing, setEditing] = useState<Editing>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  function handleMonthChange(next: dayjs.Dayjs) {
    setMonth(next);
    // The antd Calendar is controlled by the selected day, so moving the panel
    // has to move the selection too or the grid snaps back to the old month.
    setSelectedDay(next.startOf('month').format('YYYY-MM-DD'));
  }

  async function handleSubmit(input: CalendarEventInput) {
    setActionError(null);
    try {
      if (editing?.event) {
        await update(editing.event.id, input);
      } else {
        await create(input);
      }
      setEditing(null);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Não foi possível salvar o compromisso.');
    }
  }

  async function handleDelete(eventId: string) {
    setActionError(null);
    try {
      await remove(eventId);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Não foi possível excluir o compromisso.');
    }
  }

  const wide = Boolean(screens.lg);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>Calendário</div>
          <div className={styles.subtitle}>{month.format('MMMM [de] YYYY')}</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing({ event: null })}>
          Novo compromisso
        </Button>
      </div>

      {error && <Alert type="error" message={error} showIcon />}
      {actionError && <Alert type="error" message={actionError} showIcon />}

      {loading ? (
        <div className={styles.centered}>
          <Spin />
        </div>
      ) : (
        <div className={cx(styles.columns, wide && styles.columnsWide)}>
          <MonthCalendar
            month={month}
            events={events}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            onMonthChange={handleMonthChange}
          />
          <EventScheduleList
            events={events}
            selectedDay={selectedDay}
            onEdit={(event) => setEditing({ event })}
            onDelete={handleDelete}
          />
        </div>
      )}

      {editing && (
        <EventFormModal
          event={editing.event}
          defaultDay={selectedDay}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}
