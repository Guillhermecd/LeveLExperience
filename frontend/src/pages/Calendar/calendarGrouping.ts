import dayjs, { type Dayjs } from 'dayjs';
import type { CalendarEvent } from '../../types/calendar';

/** Local day key (`YYYY-MM-DD`) — also the anchor id used to scroll the list. */
export type DayKey = string;

export type DayGroup = {
  dayIso: DayKey;
  events: CalendarEvent[];
};

export function dayKeyOf(iso: string): DayKey {
  return dayjs(iso).format('YYYY-MM-DD');
}

/**
 * Boundaries of the visible month as instants. The month is a *local* notion
 * and the API stores instants, so the conversion happens exactly here: the
 * browser's own offset is what decides which events belong to September.
 */
export function monthRange(date: Date | Dayjs): { fromIso: string; toIso: string } {
  const month = dayjs(date);
  return {
    fromIso: month.startOf('month').toISOString(),
    toIso: month.endOf('month').toISOString(),
  };
}

/**
 * Groups events by the local day of `startsAt`, days ascending and, inside a
 * day, by time. An event crossing midnight stays in the day it starts: the
 * agenda answers "what begins today", not "what is in progress".
 */
export function groupByDay(events: CalendarEvent[]): DayGroup[] {
  const byDay = new Map<DayKey, CalendarEvent[]>();

  for (const event of events) {
    const key = dayKeyOf(event.startsAt);
    const bucket = byDay.get(key);
    if (bucket) {
      bucket.push(event);
    } else {
      byDay.set(key, [event]);
    }
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([dayIso, dayEvents]) => ({
      dayIso,
      events: [...dayEvents].sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    }));
}
