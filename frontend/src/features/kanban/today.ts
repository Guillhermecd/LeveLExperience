/**
 * The user's LOCAL day as 'YYYY-MM-DD', never UTC — see
 * V1__initial_schema.sql's note on `users.timezone`: in UTC the day flips
 * hours before midnight for most of Brazil, breaking streak and clean-day.
 * The backend derives this from `users.timezone`; here there is no server,
 * so it's the browser's local clock.
 */
export function getLocalToday(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
