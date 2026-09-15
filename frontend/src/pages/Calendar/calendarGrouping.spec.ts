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

  it('does not mutate the array it was given', () => {
    const late = event('late', dayjs('2026-09-10T18:00:00').toISOString());
    const early = event('early', dayjs('2026-09-10T08:00:00').toISOString());
    const input = [late, early];

    groupByDay(input);

    expect(input.map((e) => e.id)).toEqual(['late', 'early']);
  });

  it('keeps two events that start at the same instant, in the order received', () => {
    const sameInstant = dayjs('2026-09-10T09:00:00').toISOString();

    const [group] = groupByDay([event('a', sameInstant), event('b', sameInstant)]);

    expect(group.events.map((e) => e.id)).toEqual(['a', 'b']);
  });

  it('splits the first and the last instant of a day into their own days', () => {
    const endOfDay = event('end', dayjs('2026-09-10T23:59:59').toISOString());
    const startOfNext = event('start', dayjs('2026-09-11T00:00:00').toISOString());

    expect(groupByDay([startOfNext, endOfDay]).map((g) => g.dayIso)).toEqual(['2026-09-10', '2026-09-11']);
  });

  it('groups a whole busy month without losing an event', () => {
    const many = Array.from({ length: 300 }, (_, index) =>
      event(`e${index}`, dayjs('2026-09-01T08:00:00').add(index, 'hour').toISOString()),
    );

    const groups = groupByDay(many);

    expect(groups.reduce((total, group) => total + group.events.length, 0)).toBe(300);
    expect(groups.map((g) => g.dayIso)).toEqual([...groups.map((g) => g.dayIso)].sort());
  });
});

describe('dayKeyOf', () => {
  it('uses the local day of the instant, which is what the month grid renders', () => {
    const instant = dayjs('2026-09-10T13:00:00');

    expect(dayKeyOf(instant.toISOString())).toBe(instant.format('YYYY-MM-DD'));
  });

  it('rolls to the next local day right after local midnight', () => {
    const justAfterMidnight = dayjs('2026-09-11T00:00:01');

    expect(dayKeyOf(justAfterMidnight.toISOString())).toBe('2026-09-11');
  });
});
