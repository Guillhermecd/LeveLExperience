import type { LedgerStats } from '../features/kanban/types';
import type { Card, DayHistoryEntry, Goal } from '../types/board';

/**
 * Read-only paint cache for the board (PLAN.md Fase 5): lets the UI render
 * instantly on boot while GET /board and GET /stats are in flight. The
 * server response is always the source of truth — this is only ever written
 * from the load/reload response handlers in useBoardState, never from an
 * optimistic mutation (GATES.md 5.2), and a corrupt or missing entry simply
 * yields no cache instead of failing the boot (GATES.md 5.1).
 */
const CACHE_KEY = 'kanban.boardCache';

export type BoardCache = {
  cards: Card[];
  goals: Goal[];
  history: DayHistoryEntry[];
  stats: LedgerStats;
};

export function readBoardCache(): BoardCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BoardCache>;
    if (!Array.isArray(parsed.cards) || !Array.isArray(parsed.goals) || !Array.isArray(parsed.history) || !parsed.stats) {
      return null;
    }
    return parsed as BoardCache;
  } catch {
    return null;
  }
}

export function writeBoardCache(cache: BoardCache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Cache is a best-effort paint hint; losing it only costs the instant boot.
  }
}
