import dayjs, { type Dayjs } from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { ApiError } from '../../../api/api';
import {
  createCalendarEvent,
  deleteCalendarEvent,
  listCalendarEvents,
  updateCalendarEvent,
} from '../../../api/modules/calendarEvents';
import type { CalendarEvent, CalendarEventInput } from '../../../types/calendar';
import { dayKeyOf, monthRange } from '../calendarGrouping';

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}

/**
 * Owns the visible month and the events inside it. Mutations refetch the month
 * instead of patching local state: the server is the only thing that knows
 * whether a create was actually a no-op (the same client id resent).
 */
export function useCalendarEvents() {
  const [month, setMonthState] = useState<Dayjs>(() => dayjs());
  const [selectedDay, setSelectedDay] = useState<string>(() => dayKeyOf(dayjs().toISOString()));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // The month is tracked as a string so the fetch effect re-runs when the
  // month actually changes, not on every new Dayjs instance.
  const monthKey = month.format('YYYY-MM');

  const fetchMonth = useCallback(async (key: string): Promise<CalendarEvent[]> => {
    const { fromIso, toIso } = monthRange(dayjs(`${key}-01`));
    return listCalendarEvents(fromIso, toIso);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const next = await fetchMonth(monthKey);
        if (cancelled) return;
        setEvents(next);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(errorMessage(err, 'Não foi possível carregar os compromissos.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchMonth, monthKey]);

  const setMonth = useCallback((next: Dayjs) => {
    setLoading(true);
    setMonthState(next);
  }, []);

  const refresh = useCallback(async () => {
    setEvents(await fetchMonth(month.format('YYYY-MM')));
  }, [fetchMonth, month]);

  const create = useCallback(
    async (input: CalendarEventInput) => {
      // Client-generated id (decision #2), so a retried POST is idempotent on
      // the server instead of creating a twin event.
      await createCalendarEvent({ id: uuid(), ...input });
      await refresh();
    },
    [refresh],
  );

  const update = useCallback(
    async (eventId: string, input: CalendarEventInput) => {
      await updateCalendarEvent(eventId, input);
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (eventId: string) => {
      await deleteCalendarEvent(eventId);
      await refresh();
    },
    [refresh],
  );

  return {
    month,
    setMonth,
    selectedDay,
    setSelectedDay,
    events,
    loading,
    error,
    refresh,
    create,
    update,
    remove,
  };
}
