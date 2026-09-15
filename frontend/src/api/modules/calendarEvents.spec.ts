import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../api';
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

  it('returns the parsed events on a successful list', async () => {
    const stored = { id: 'e1', ...input };
    stubFetch(jsonResponse(200, [stored]));

    await expect(listCalendarEvents('2026-09-01T00:00:00.000Z', '2026-09-30T23:59:59.999Z')).resolves.toEqual([
      stored,
    ]);
  });

  it('resolves to an empty list when the month has no events', async () => {
    stubFetch(jsonResponse(200, []));

    await expect(listCalendarEvents('2026-09-01T00:00:00.000Z', '2026-09-30T23:59:59.999Z')).resolves.toEqual(
      [],
    );
  });

  // 404, never 403, is what another user's event returns (CLAUDE.md decision).
  it('rejects with the server message when the event belongs to someone else (404)', async () => {
    stubFetch(
      jsonResponse(404, {
        timestamp: '2026-09-15T10:00:00Z',
        status: 404,
        error: 'Not Found',
        message: 'Compromisso não encontrado.',
      }),
    );

    await expect(updateCalendarEvent('other-user-event', input)).rejects.toMatchObject({
      status: 404,
      message: 'Compromisso não encontrado.',
    });
  });

  it('rejects with an ApiError on a delete that hits 404', async () => {
    stubFetch(jsonResponse(404, { timestamp: '', status: 404, error: 'Not Found', message: 'Não encontrado.' }));

    await expect(deleteCalendarEvent('gone')).rejects.toBeInstanceOf(ApiError);
  });

  it('rejects with a fallback message when the error body is not the ErrorResponse shape', async () => {
    stubFetch(new Response('<html>502</html>', { status: 502 }));

    await expect(listCalendarEvents('a', 'b')).rejects.toMatchObject({
      status: 502,
      body: null,
      message: 'Falha na requisição (HTTP 502).',
    });
  });

  it('rejects with a validation message when the server refuses the payload (400)', async () => {
    stubFetch(
      jsonResponse(400, {
        timestamp: '2026-09-15T10:00:00Z',
        status: 400,
        error: 'Bad Request',
        message: 'O término deve ser depois do início.',
      }),
    );

    await expect(createCalendarEvent({ id: 'e1', ...input })).rejects.toMatchObject({
      status: 400,
      message: 'O término deve ser depois do início.',
    });
  });

  it('propagates a network failure instead of swallowing it', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(listCalendarEvents('a', 'b')).rejects.toThrow('Failed to fetch');
  });

  it('sends nulls for an event with no description and no declared end', async () => {
    const open: CalendarEventInput = { ...input, description: null, endsAt: null };
    const fetchMock = stubFetch(jsonResponse(201, { id: 'e2', ...open }));

    await createCalendarEvent({ id: 'e2', ...open });

    const { init } = callArgs(fetchMock);
    expect(JSON.parse(init.body as string)).toEqual({ id: 'e2', ...open });
  });

  it('keeps unicode in the title and description intact through the json body', async () => {
    const unicode: CalendarEventInput = { ...input, title: 'Reunião 会議 🎯', description: 'Ação — ótimo' };
    const fetchMock = stubFetch(jsonResponse(200, { id: 'e3', ...unicode }));

    await updateCalendarEvent('e3', unicode);

    const { init } = callArgs(fetchMock);
    const sent = JSON.parse(init.body as string) as CalendarEventInput;
    expect(sent.title).toBe('Reunião 会議 🎯');
    expect(sent.description).toBe('Ação — ótimo');
  });

  it('gives each mutation its own Idempotency-Key so a real retry is the caller decision', async () => {
    const first = stubFetch(jsonResponse(201, { id: 'e1', ...input }));
    await createCalendarEvent({ id: 'e1', ...input });
    const firstKey = callArgs(first).headers['Idempotency-Key'];

    const second = stubFetch(jsonResponse(201, { id: 'e1', ...input }));
    await createCalendarEvent({ id: 'e1', ...input });
    const secondKey = callArgs(second).headers['Idempotency-Key'];

    expect(firstKey).not.toBe(secondKey);
  });
});
