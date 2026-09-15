import type { CalendarEvent, CalendarEventInput } from '../../types/calendar';
import { apiRequest } from '../api';

export function listCalendarEvents(fromIso: string, toIso: string): Promise<CalendarEvent[]> {
  const query = new URLSearchParams({ from: fromIso, to: toIso });
  return apiRequest(`/api/calendar-events?${query.toString()}`);
}

export function createCalendarEvent(input: CalendarEventInput & { id: string }): Promise<CalendarEvent> {
  return apiRequest('/api/calendar-events', { method: 'POST', body: input });
}

export function updateCalendarEvent(eventId: string, input: CalendarEventInput): Promise<CalendarEvent> {
  return apiRequest(`/api/calendar-events/${eventId}`, { method: 'PATCH', body: input });
}

export function deleteCalendarEvent(eventId: string): Promise<void> {
  return apiRequest(`/api/calendar-events/${eventId}`, { method: 'DELETE' });
}
