import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { listCalendarEvents } from '../../api/modules/calendarEvents';
import { getBoard } from '../../api/modules/board';
import {
  buildGoalDeadlineAlerts,
  buildMeetingAlerts,
  loadDismissedIds,
  saveDismissedIds,
  type NotificationAlert,
} from './notifications';

const POLL_INTERVAL_MS = 60_000;

export function useNotifications() {
  const [alerts, setAlerts] = useState<NotificationAlert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(() => loadDismissedIds());

  const refresh = useCallback(async () => {
    const now = dayjs();
    // Wide enough to cover both alert windows (meetings: 2h, goal deadlines:
    // 2 days) in one fetch instead of two differently-ranged calls.
    const from = now.toISOString();
    const to = now.add(2, 'day').toISOString();
    try {
      const [events, board] = await Promise.all([listCalendarEvents(from, to), getBoard()]);
      const next = [...buildMeetingAlerts(events, now), ...buildGoalDeadlineAlerts(board.goals, now)];
      next.sort((a, b) => a.when.localeCompare(b.when));
      setAlerts(next);

      // Dismissed ids for alerts that are no longer active are dropped right
      // after a real fetch resolves — never from a bare effect reacting to
      // the initial empty `alerts` state, which would wipe a just-loaded
      // dismissed set before the first fetch even completes.
      const activeIds = new Set(next.map((alert) => alert.id));
      setDismissed((current) => {
        const pruned = new Set([...current].filter((id) => activeIds.has(id)));
        if (pruned.size === current.size) return current;
        saveDismissedIds(pruned);
        return pruned;
      });
    } catch {
      // Notifications are best-effort chrome, not board data — a failed
      // refresh just keeps the previous alert list until the next tick.
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await refresh();
    })();
    const interval = setInterval(() => void refresh(), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  const visibleAlerts = alerts.filter((alert) => !dismissed.has(alert.id));

  function dismiss(id: string) {
    setDismissed((current) => {
      const next = new Set(current).add(id);
      saveDismissedIds(next);
      return next;
    });
  }

  return { alerts: visibleAlerts, dismiss };
}
