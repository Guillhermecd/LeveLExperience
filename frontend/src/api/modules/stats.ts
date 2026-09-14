import { apiRequest } from '../api';

export type DayHistoryEntryDto = { day: string; xp: number; done: number };

// Mirrors backend StatsResponse — including rawTotal and cleanDayPaid,
// which the optimistic reducer needs to reproduce the server's rules
// (xp-rules.json "ledger-keeps-real-delta" and "clean-day-once-per-day").
export type StatsDto = {
  rawTotal: number;
  xpTotal: number;
  level: number;
  rank: string;
  xpIntoLevel: number;
  xpForNextLevel: number;
  streak: number;
  lastXpDay: string | null;
  cleanDayPaid: string | null;
  dayXp: number;
  dayDone: number;
  history: DayHistoryEntryDto[];
};

export function getStats(): Promise<StatsDto> {
  return apiRequest('/api/stats');
}
