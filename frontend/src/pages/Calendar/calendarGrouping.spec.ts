import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import type { CalendarEvent } from '../../types/calendar';
import { dayKeyOf, groupByDay, monthRange } from './calendarGrouping';

function event(id: string, startsAt: string, endsAt: string | null = null): CalendarEvent {
  return { id, title: id, description: null, startsAt, endsAt, color: 'lime' };
}

// Every expectation is built from the same local formatting the implementation
// uses — hardcoded `Z` strings would flake on a machine in another timezone.
describe('monthRange', () => {
  it('spans the first to the last instant of the local month', () => {
    const { fromIso, toIso } = monthRange(dayjs('2026-09-15T10:00:00'));

    expect(dayjs(fromIso).format('YYYY-MM-DD HH:mm:ss')).toBe('2026-09-01 00:00:00');
    expect(dayjs(toIso).format('YYYY-MM-DD HH:mm:ss')).toBe('2026-09-30 23:59:59');
  });

  it('rolls over the year boundary (December to January)', () => {
    const december = monthRange(dayjs('2026-12-20T10:00:00'));
    expect(dayjs(december.fromIso).format('YYYY-MM-DD')).toBe('2026-12-01');
    expect(dayjs(december.toIso).format('YYYY-MM-DD')).toBe('2026-12-31');

    const january = monthRange(dayjs(december.toIso).add(1, 'millisecond'));
    expect(dayjs(january.fromIso).format('YYYY-MM-DD')).toBe('2027-01-01');
    expect(dayjs(january.toIso).format('YYYY-MM-DD')).toBe('2027-01-31');
  });

  it('accepts a native Date as well as a Dayjs', () => {
    const fromDate = monthRange(new Date(2026, 1, 10));
    expect(dayjs(fromDate.fromIso).format('YYYY-MM-DD')).toBe('2026-02-01');
    expect(dayjs(fromDate.toIso).format('YYYY-MM-DD')).toBe('2026-02-28');
  });
});

describe('groupByDay', () => {
  it('returns days ascending and events sorted by time inside a day', () => {
    const late = event('late', dayjs('2026-09-10T18:00:00').toISOString());
    const early = event('early', dayjs('2026-09-10T08:00:00').toISOString());
    const nextDay = event('next', dayjs('2026-09-11T09:00:00').toISOString());
    const previousDay = event('previous', dayjs('2026-09-02T09:00:00').toISOString());

    const groups = groupByDay([nextDay, late, previousDay, early]);

    expect(groups.map((group) => group.dayIso)).toEqual(['2026-09-02', '2026-09-10', '2026-09-11']);
    expect(groups[1].events.map((e) => e.id)).toEqual(['early', 'late']);
  });

  it('keeps an event that crosses midnight in the day it starts', () => {
    const crossing = event(
      'crossing',
      dayjs('2026-09-10T23:30:00').toISOString(),
      dayjs('2026-09-11T00:30:00').toISOString(),
    );

    const groups = groupByDay([crossing]);

    expect(groups).toHaveLength(1);
    expect(groups[0].dayIso).toBe('2026-09-10');
    expect(groups[0].dayIso).toBe(dayKeyOf(crossing.startsAt));
  });

  it('returns an empty list for an empty month', () => {
    expect(groupByDay([])).toEqual([]);
  });
});
