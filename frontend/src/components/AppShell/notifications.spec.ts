import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import type { CalendarEvent } from '../../types/calendar';
import type { Goal } from '../../types/board';
import { buildGoalDeadlineAlerts, buildMeetingAlerts } from './notifications';

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
});
