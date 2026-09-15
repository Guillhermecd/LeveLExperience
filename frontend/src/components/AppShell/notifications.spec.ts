import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CalendarEvent } from '../../types/calendar';
import type { Goal } from '../../types/board';
import {
  buildGoalDeadlineAlerts,
  buildMeetingAlerts,
  loadDismissedIds,
  saveDismissedIds,
} from './notifications';

function event(id: string, startsAt: string): CalendarEvent {
  return { id, title: id, description: null, startsAt, endsAt: null, color: 'lime' };
}

function goal(id: string, scope: Goal['scope'], done = false): Goal {
  return { id, scope, title: id, done, position: 0 };
}

const now = dayjs('2026-09-15T10:00:00Z');

describe('buildMeetingAlerts', () => {
  it('includes an event starting within the next 2 hours', () => {
    const soon = event('soon', now.add(30, 'minute').toISOString());
    expect(buildMeetingAlerts([soon], now).map((a) => a.id)).toEqual(['meeting:soon']);
  });

  it('excludes an event more than 2 hours away', () => {
    const later = event('later', now.add(3, 'hour').toISOString());
    expect(buildMeetingAlerts([later], now)).toEqual([]);
  });

  it('excludes an event that already started', () => {
    const past = event('past', now.subtract(1, 'minute').toISOString());
    expect(buildMeetingAlerts([past], now)).toEqual([]);
  });

  it('includes an event starting at exactly now', () => {
    const right = event('now', now.toISOString());
    expect(buildMeetingAlerts([right], now).map((a) => a.id)).toEqual(['meeting:now']);
  });

  it('excludes an event starting exactly at the end of the 2h window', () => {
    const edge = event('edge', now.add(2, 'hour').toISOString());
    expect(buildMeetingAlerts([edge], now)).toEqual([]);
  });

  it('includes an event one minute inside the window edge', () => {
    const inside = event('inside', now.add(2, 'hour').subtract(1, 'minute').toISOString());
    expect(buildMeetingAlerts([inside], now).map((a) => a.id)).toEqual(['meeting:inside']);
  });

  it('returns an empty list when there are no events at all', () => {
    expect(buildMeetingAlerts([], now)).toEqual([]);
  });

  it('excludes an event already in progress, even if it ends inside the window', () => {
    const running = event('running', now.subtract(30, 'minute').toISOString());
    running.endsAt = now.add(30, 'minute').toISOString();
    expect(buildMeetingAlerts([running], now)).toEqual([]);
  });

  it('keeps every event inside the window, in the order received', () => {
    const first = event('first', now.add(90, 'minute').toISOString());
    const second = event('second', now.add(10, 'minute').toISOString());
    expect(buildMeetingAlerts([first, second], now).map((a) => a.id)).toEqual([
      'meeting:first',
      'meeting:second',
    ]);
  });

  it('describes the alert with the local start time and keeps the raw instant in `when`', () => {
    const startsAt = now.add(45, 'minute').toISOString();
    const [alert] = buildMeetingAlerts([event('detail', startsAt)], now);

    expect(alert.kind).toBe('meeting');
    expect(alert.detail).toBe(`às ${dayjs(startsAt).format('HH:mm')}`);
    expect(alert.when).toBe(startsAt);
  });

  it('preserves a unicode title verbatim', () => {
    const unicode = event('unicode', now.add(30, 'minute').toISOString());
    unicode.title = 'Reunião com a Ação — 会議 🎯';

    expect(buildMeetingAlerts([unicode], now)[0].title).toBe('Reunião com a Ação — 会議 🎯');
  });
});

describe('buildGoalDeadlineAlerts', () => {
  it('includes an unfinished week goal within 2 days of the week ending', () => {
    const nearWeekEnd = now.endOf('week').subtract(1, 'hour');
    const g = goal('g1', 'week');
    expect(buildGoalDeadlineAlerts([g], nearWeekEnd).map((a) => a.id)).toEqual([
      `goal:g1:${nearWeekEnd.startOf('week').format('YYYY-MM-DD')}`,
    ]);
  });

  it('includes an unfinished month goal within 2 days of the month ending', () => {
    const nearMonthEnd = now.endOf('month').subtract(1, 'hour');
    const g = goal('g2', 'month');
    expect(buildGoalDeadlineAlerts([g], nearMonthEnd).map((a) => a.id)).toEqual([
      `goal:g2:${nearMonthEnd.format('YYYY-MM')}`,
    ]);
  });

  it('excludes a goal far from its deadline', () => {
    expect(buildGoalDeadlineAlerts([goal('g3', 'week')], now)).toEqual([]);
  });

  it('excludes a goal that is already done, even near the deadline', () => {
    const nearWeekEnd = now.endOf('week').subtract(1, 'hour');
    expect(buildGoalDeadlineAlerts([goal('g4', 'week', true)], nearWeekEnd)).toEqual([]);
  });

  it('changes the alert id across periods so a dismissed overdue goal alerts again next period', () => {
    const thisWeek = now.endOf('week').subtract(1, 'hour');
    const nextWeek = thisWeek.add(1, 'week');
    const g = goal('g5', 'week');
    const [thisAlert] = buildGoalDeadlineAlerts([g], thisWeek);
    const [nextAlert] = buildGoalDeadlineAlerts([g], nextWeek);
    expect(thisAlert.id).not.toBe(nextAlert.id);
  });

  // Symmetric to the week case above: a period key that is constant (the
  // `GGGG/WW` literal that dayjs leaves untouched without the isoWeek plugin)
  // would keep an overdue month goal dismissed forever.
  it('changes the alert id across months for a month goal', () => {
    const thisMonth = now.endOf('month').subtract(1, 'hour');
    const nextMonth = thisMonth.add(1, 'month').endOf('month').subtract(1, 'hour');
    const g = goal('g6', 'month');

    const [thisAlert] = buildGoalDeadlineAlerts([g], thisMonth);
    const [nextAlert] = buildGoalDeadlineAlerts([g], nextMonth);

    expect(thisAlert.id).toBe('goal:g6:2026-09');
    expect(nextAlert.id).toBe('goal:g6:2026-10');
  });

  it('keeps the same alert id on two different days of the same month', () => {
    const twoDaysOut = now.endOf('month').subtract(47, 'hour');
    const oneDayOut = now.endOf('month').subtract(23, 'hour');
    const g = goal('g7', 'month');

    expect(buildGoalDeadlineAlerts([g], twoDaysOut)[0].id).toBe(
      buildGoalDeadlineAlerts([g], oneDayOut)[0].id,
    );
  });

  it('includes a goal exactly 48 hours from its deadline', () => {
    const exactly = now.endOf('month').subtract(48, 'hour');
    expect(buildGoalDeadlineAlerts([goal('g8', 'month')], exactly)).toHaveLength(1);
  });

  it('includes a goal at the very last instant before its deadline', () => {
    const lastInstant = now.endOf('week');
    expect(buildGoalDeadlineAlerts([goal('g9', 'week')], lastInstant)).toHaveLength(1);
  });

  // `diff(now, 'hour')` truncates, so anything under 49h still reads as 48 and
  // stays inside the window. Pinned as intended fuzziness on a notification,
  // not as an exact 2-day cut.
  it('still includes a goal 48h59m out because the hour diff truncates', () => {
    const justOutside = now.endOf('month').subtract(48, 'hour').subtract(59, 'minute');
    expect(buildGoalDeadlineAlerts([goal('g10', 'month')], justOutside)).toHaveLength(1);
  });

  it('excludes a goal 49 hours out', () => {
    const outside = now.endOf('month').subtract(49, 'hour');
    expect(buildGoalDeadlineAlerts([goal('g11', 'month')], outside)).toEqual([]);
  });

  it('returns an empty list when there are no goals at all', () => {
    expect(buildGoalDeadlineAlerts([], now.endOf('week'))).toEqual([]);
  });

  it('alerts a week goal on its own week deadline even when the month ends later', () => {
    // Mid-month Saturday: the week is ending, the month is not.
    const nearWeekEnd = now.endOf('week').subtract(1, 'hour');
    const alerts = buildGoalDeadlineAlerts([goal('week', 'week'), goal('month', 'month')], nearWeekEnd);

    expect(alerts.map((a) => a.title)).toEqual(['week']);
  });

  it('points `when` at the deadline instant, not at now', () => {
    const nearWeekEnd = now.endOf('week').subtract(1, 'hour');
    const [alert] = buildGoalDeadlineAlerts([goal('g12', 'week')], nearWeekEnd);

    expect(alert.kind).toBe('goal-deadline');
    expect(alert.when).toBe(nearWeekEnd.endOf('week').toISOString());
  });
});

// The app sets the pt-br locale once in main.tsx; the detail copy is user-facing
// text (CLAUDE.md: interface em português), so it is asserted under that locale.
// Applied per instance so the dayjs singleton stays untouched for other specs.
describe('buildGoalDeadlineAlerts under the pt-br locale', () => {
  it('names the weekday in Portuguese for a week goal', () => {
    const nearWeekEnd = dayjs('2026-09-18T23:00:00').locale('pt-br');
    const [alert] = buildGoalDeadlineAlerts([goal('g', 'week')], nearWeekEnd);

    expect(alert.detail).toBe('meta da semana termina sábado');
  });

  it('names the month in Portuguese for a month goal', () => {
    const nearMonthEnd = dayjs('2026-09-29T23:00:00').locale('pt-br');
    const [alert] = buildGoalDeadlineAlerts([goal('g', 'month')], nearMonthEnd);

    expect(alert.detail).toBe('meta do mês termina 30 de setembro');
  });
});

// The test environment has no DOM, so localStorage doesn't exist globally —
// same stub convention as boardCache.spec.ts.
function fakeLocalStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
    key: () => null,
    get length() {
      return store.size;
    },
  };
}

describe('dismissed alert storage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', fakeLocalStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns an empty set when nothing was ever dismissed', () => {
    expect(loadDismissedIds()).toEqual(new Set());
  });

  it('round-trips a dismissed set', () => {
    saveDismissedIds(new Set(['meeting:a', 'goal:b:2026-09']));

    expect(loadDismissedIds()).toEqual(new Set(['meeting:a', 'goal:b:2026-09']));
  });

  it('round-trips an empty set as an empty set, never as null', () => {
    saveDismissedIds(new Set(['meeting:a']));
    saveDismissedIds(new Set());

    expect(loadDismissedIds()).toEqual(new Set());
  });

  it('returns an empty set for corrupt json instead of throwing', () => {
    localStorage.setItem('levelexperience:notifications:dismissed', '{not json');

    expect(loadDismissedIds()).toEqual(new Set());
  });

  it('returns an empty set when the stored value is valid json but not an array', () => {
    localStorage.setItem('levelexperience:notifications:dismissed', '{"a":1}');

    expect(loadDismissedIds()).toEqual(new Set());
  });

  it('drops non-string entries from a mixed array', () => {
    localStorage.setItem('levelexperience:notifications:dismissed', '["ok",1,null,{"id":"x"}]');

    expect(loadDismissedIds()).toEqual(new Set(['ok']));
  });

  it('returns an empty set when localStorage itself throws on read', () => {
    vi.stubGlobal('localStorage', {
      ...fakeLocalStorage(),
      getItem: () => {
        throw new Error('SecurityError');
      },
    });

    expect(loadDismissedIds()).toEqual(new Set());
  });

  it('swallows a write failure (quota) instead of breaking the dismiss', () => {
    vi.stubGlobal('localStorage', {
      ...fakeLocalStorage(),
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    });

    expect(() => saveDismissedIds(new Set(['meeting:a']))).not.toThrow();
  });

  it('overwrites the previous set rather than merging into it', () => {
    saveDismissedIds(new Set(['old']));
    saveDismissedIds(new Set(['new']));

    expect(loadDismissedIds()).toEqual(new Set(['new']));
  });
});
