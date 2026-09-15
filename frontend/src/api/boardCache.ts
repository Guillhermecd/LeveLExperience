import type { LedgerStats } from '../features/kanban/types';
import type { Card, DayHistoryEntry, Goal } from '../types/board';

export type BoardCache = {
  cards: Card[];
  goals: Goal[];
  history: DayHistoryEntry[];
  stats: LedgerStats;
};

// Keyed by user id (PLAN.md Fase 5) so a logout/login pair on the same
// browser never paints one user's board for another.
function cacheKey(userId: string): string {
  return `kanban.board.${userId}`;
}

export function readBoardCache(userId: string): BoardCache | null {
  try {
    const raw = localStorage.getItem(cacheKey(userId));
    return raw ? (JSON.parse(raw) as BoardCache) : null;
  } catch {
    return null;
  }
}

export function writeBoardCache(userId: string, cache: BoardCache) {
  try {
    localStorage.setItem(cacheKey(userId), JSON.stringify(cache));
  } catch {
    // Best-effort: the in-memory state is still correct for this tab.
  }
}

export function clearBoardCache(userId: string) {
  try {
    localStorage.removeItem(cacheKey(userId));
  } catch {
    // Nothing to clean up if storage is unavailable.
  }
}
