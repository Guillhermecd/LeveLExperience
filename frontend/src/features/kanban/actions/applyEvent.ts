import { isYesterday } from '../dateUtils';
import type { LedgerStats, XpEvent } from '../types';

/**
 * Applies one ledger event to stats. Streak/lastXpDay only move on the
 * first positive event of the day (PLAN.md "Sequência (streak)"); a
 * reversal never starts or extends a streak.
 */
export function applyEvent(stats: LedgerStats, event: XpEvent, today: string): LedgerStats {
  const dayDoneDelta =
    event.reason === 'card_done' || event.reason === 'goal_done'
      ? 1
      : event.reason === 'card_undone' || event.reason === 'goal_undone'
        ? -1
        : 0;

  let streak = stats.streak;
  let lastXpDay = stats.lastXpDay;
  if (event.delta > 0 && lastXpDay !== today) {
    streak = isYesterday(lastXpDay, today) ? streak + 1 : 1;
    lastXpDay = today;
  }

  return {
    rawTotal: stats.rawTotal + event.delta,
    streak,
    lastXpDay,
    cleanDayPaid: stats.cleanDayPaid,
    dayXp: stats.dayXp + event.delta,
    dayDone: stats.dayDone + dayDoneDelta,
  };
}
