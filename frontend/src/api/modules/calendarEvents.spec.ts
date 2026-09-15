import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CalendarEventInput } from '../../types/calendar';
import {
  createCalendarEvent,
  deleteCalendarEvent,
  listCalendarEvents,
  updateCalendarEvent,
} from './calendarEvents';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function stubFetch(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function callArgs(fetchMock: ReturnType<typeof vi.fn>) {
  const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
  return { url, init, headers: init.headers as Record<string, string> };
}

const input: CalendarEventInput = {
  title: 'Consulta',
  description: 'Levar exames',
  startsAt: '2026-09-15T13:00:00.000Z',
  endsAt: '2026-09-15T14:00:00.000Z',
  color: 'lime',
};

describe('calendarEvents api module', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lists a month with the range as query params and no Idempotency-Key', async () => {
    const fetchMock = stubFetch(jsonResponse(200, []));

    await listCalendarEvents('2026-09-01T03:00:00.000Z', '2026-10-01T02:59:59.999Z');

    const { url, init, headers } = callArgs(fetchMock);
    expect(url).toContain('/api/calendar-events?');
    expect(url).toContain('from=2026-09-01T03%3A00%3A00.000Z');
    expect(url).toContain('to=2026-10-01T02%3A59%3A59.999Z');
    expect(init.method).toBe('GET');
    expect(headers['Idempotency-Key']).toBeUndefined();
  });

  it('creates with POST, the client-generated id in the body and an Idempotency-Key', async () => {
    const fetchMock = stubFetch(jsonResponse(201, { id: 'e1', ...input }));

    await createCalendarEvent({ id: 'e1', ...input });

    const { url, init, headers } = callArgs(fetchMock);
    expect(url).toContain('/api/calendar-events');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ id: 'e1', ...input });
    expect(headers['Idempotency-Key']).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('updates with PATCH on the event path and an Idempotency-Key', async () => {
    const fetchMock = stubFetch(jsonResponse(200, { id: 'e1', ...input }));

    await updateCalendarEvent('e1', input);

    const { url, init, headers } = callArgs(fetchMock);
    expect(url).toContain('/api/calendar-events/e1');
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(init.body as string)).toEqual(input);
    expect(headers['Idempotency-Key']).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('deletes with DELETE and tolerates the empty 204 body', async () => {
    const fetchMock = stubFetch(new Response(null, { status: 204 }));

    await expect(deleteCalendarEvent('e1')).resolves.toBeUndefined();

    const { url, init, headers } = callArgs(fetchMock);
    expect(url).toContain('/api/calendar-events/e1');
    expect(init.method).toBe('DELETE');
    expect(headers['Idempotency-Key']).toMatch(/^[0-9a-f-]{36}$/);
  });
});
