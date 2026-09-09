/** All dates here are 'YYYY-MM-DD' strings — the user's local day, never UTC clock time. */
function toUtcDays(date: string): number {
  return Date.parse(`${date}T00:00:00Z`) / 86_400_000;
}

export function daysSince(day: string, today: string): number {
  return toUtcDays(today) - toUtcDays(day);
}

/** Streak is still "alive" if the last positive XP was today or yesterday. */
export function isStreakAlive(lastXpDay: string | null, today: string): boolean {
  return lastXpDay !== null && daysSince(lastXpDay, today) <= 1;
}

export function isYesterday(day: string | null, today: string): boolean {
  return day !== null && daysSince(day, today) === 1;
}
