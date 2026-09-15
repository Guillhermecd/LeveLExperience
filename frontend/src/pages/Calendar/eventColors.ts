import { color } from '../../theme/tokens';
import type { CalendarEventColor } from '../../types/calendar';

/**
 * The event palette is a closed set reusing the families already defined in
 * tokens.ts — no new hue enters the design system through the calendar.
 */
export const eventColorOptions: { value: CalendarEventColor; label: string; dot: string }[] = [
  { value: 'lime', label: 'Verde', dot: color.lime.text },
  { value: 'amber', label: 'Âmbar', dot: color.amber.text },
  { value: 'violet', label: 'Violeta', dot: color.violet.text },
  { value: 'coral', label: 'Coral', dot: color.coral.text },
  { value: 'blue', label: 'Azul', dot: color.blue.text },
];

const dots: Record<CalendarEventColor, string> = {
  lime: color.lime.text,
  amber: color.amber.text,
  violet: color.violet.text,
  coral: color.coral.text,
  blue: color.blue.text,
};

export function eventDotColor(value: CalendarEventColor): string {
  return dots[value];
}
