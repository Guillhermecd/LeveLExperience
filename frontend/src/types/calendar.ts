/** Mirrors `calendar_events.color` in V3__add_calendar_events_table.sql. */
export type CalendarEventColor = 'lime' | 'amber' | 'violet' | 'coral' | 'blue';

export type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  /** ISO-8601 instant, rendered in the browser timezone — never a local date. */
  startsAt: string;
  /** ISO-8601 instant; null means an appointment with no declared end. */
  endsAt: string | null;
  color: CalendarEventColor;
};

/** Fields the client sends on create/update (the id travels separately). */
export type CalendarEventInput = {
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  color: CalendarEventColor;
};
