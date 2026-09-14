import { useMemo, useRef, useState } from 'react';
import { getLocalToday } from '../../../features/kanban/today';
import { projectDisplayStats } from '../../../features/kanban/reducer';
import type { BoardAction, DisplayStats, LedgerStats, XpEvent } from '../../../features/kanban/types';
import type { Card, Goal } from '../../../types/board';
import { applyBoardXpAction } from './boardXp';

export const initialStats: LedgerStats = {
  rawTotal: 0,
  streak: 0,
  lastXpDay: null,
  cleanDayPaid: null,
  dayXp: 0,
  dayDone: 0,
};

const GAIN_PILL_MS = 2200;

function gainText(before: DisplayStats, after: DisplayStats, events: XpEvent[]): string {
  if (after.level > before.level) return `Nível ${after.level}!`;
  const total = events.reduce((sum, e) => sum + e.delta, 0);
  return `${total > 0 ? '+' : ''}${total} XP`;
}

/**
 * Owns the XP ledger and its read-side projection. `dispatch` is the only
 * way card/goal mutations touch XP — see boardXp.ts for the UI-to-reducer
 * bridge, and PLAN.md decision #4 for why the total is never stored raw.
 * `stats`/`setStats` are exposed (not just `dispatch`) so useBoardState can
 * seed them from GET /stats on load and restore a snapshot when an
 * optimistic mutation's request to the server fails.
 */
export function useXpDispatch(seed: LedgerStats = initialStats) {
  const [stats, setStats] = useState<LedgerStats>(seed);
  const [gain, setGain] = useState<string | null>(null);
  const gainTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const today = getLocalToday();
  const display = useMemo(() => projectDisplayStats(stats, today), [stats, today]);

  function dispatch(cards: Card[], goals: Goal[], action: BoardAction) {
    const result = applyBoardXpAction(cards, goals, stats, action, today);
    if (result.events.length > 0) {
      const before = projectDisplayStats(stats, today);
      const after = projectDisplayStats(result.stats, today);
      setStats(result.stats);
      if (gainTimeoutRef.current) clearTimeout(gainTimeoutRef.current);
      setGain(gainText(before, after, result.events));
      gainTimeoutRef.current = setTimeout(() => setGain(null), GAIN_PILL_MS);
    }
    return { cards: result.cards, goals: result.goals };
  }

  return { display, gain, dispatch, stats, setStats };
}
