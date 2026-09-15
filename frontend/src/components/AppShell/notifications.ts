import dayjs, { type Dayjs } from 'dayjs';
import type { CalendarEvent } from '../../types/calendar';
import type { Goal } from '../../types/board';

export type NotificationAlert = {
  id: string;
  kind: 'meeting' | 'goal-deadline';
  title: string;
  detail: string;
  /** ISO instant used to sort alerts and to re-render "faltam Xh" copy. */
  when: string;
};

const MEETING_WINDOW_HOURS = 2;
const GOAL_DEADLINE_WINDOW_DAYS = 2;

/** Compromissos que começam dentro da janela de alerta e ainda não passaram. */
export function buildMeetingAlerts(events: CalendarEvent[], now: Dayjs): NotificationAlert[] {
  const windowEnd = now.add(MEETING_WINDOW_HOURS, 'hour');
  return events
    .filter((event) => {
      const startsAt = dayjs(event.startsAt);
      return !startsAt.isBefore(now) && startsAt.isBefore(windowEnd);
    })
    .map((event) => ({
      id: `meeting:${event.id}`,
      kind: 'meeting' as const,
      title: event.title,
      detail: `às ${dayjs(event.startsAt).format('HH:mm')}`,
      when: event.startsAt,
    }));
}

/**
 * Goals have no stored deadline (see PLAN.md — scope is a label, not a
 * date), so "prazo final" is inferred as the end of the current calendar
 * week/month. The period key in the alert id is what makes an overdue goal
 * alert again next period instead of staying dismissed forever.
 */
export function buildGoalDeadlineAlerts(goals: Goal[], now: Dayjs): NotificationAlert[] {
  return goals
    .filter((goal) => !goal.done)
    .map((goal) => {
      const deadline = goal.scope === 'week' ? now.endOf('week') : now.endOf('month');
      // Plain start-of-period date instead of a week-number token (GGGG/WW
      // need dayjs's isoWeek plugin, not loaded here) — same purpose: the
      // key changes every period, so a dismissed overdue goal alerts again
      // next week/month instead of staying hidden forever.
      const periodKey = goal.scope === 'week' ? now.startOf('week').format('YYYY-MM-DD') : now.format('YYYY-MM');
      const hoursLeft = deadline.diff(now, 'hour');
      return { goal, deadline, periodKey, hoursLeft };
    })
    .filter(({ hoursLeft }) => hoursLeft >= 0 && hoursLeft <= GOAL_DEADLINE_WINDOW_DAYS * 24)
    .map(({ goal, deadline, periodKey }) => ({
      id: `goal:${goal.id}:${periodKey}`,
      kind: 'goal-deadline' as const,
      title: goal.title,
      detail:
        goal.scope === 'week'
          ? `meta da semana termina ${deadline.format('dddd')}`
          : `meta do mês termina ${deadline.format('D [de] MMMM')}`,
      when: deadline.toISOString(),
    }));
}

const DISMISSED_STORAGE_KEY = 'levelexperience:notifications:dismissed';

/** Read-cache convention (boardCache.ts): never throw on corrupt/missing data. */
export function loadDismissedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === 'string'));
  } catch {
    return new Set();
  }
}

export function saveDismissedIds(ids: Set<string>): void {
  try {
    localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // Best-effort only — dismiss just stops persisting across reloads.
  }
}
