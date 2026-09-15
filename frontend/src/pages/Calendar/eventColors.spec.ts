import { describe, expect, it } from 'vitest';
import { color } from '../../theme/tokens';
import type { CalendarEventColor } from '../../types/calendar';
import { eventColorOptions, eventDotColor } from './eventColors';

// `dots` is a Record<CalendarEventColor, string>, so the compiler already
// guards its exhaustiveness. `eventColorOptions` is a plain array: a new color
// added to the union compiles fine while silently missing from the picker.
// This literal is the compile-checked source of truth the array is measured
// against — adding a color to the union breaks typecheck here first.
const everyColor: Record<CalendarEventColor, true> = {
  lime: true,
  amber: true,
  violet: true,
  coral: true,
  blue: true,
};

describe('eventColorOptions', () => {
  it('offers exactly one option per color in the union', () => {
    const offered = eventColorOptions.map((option) => option.value);

    expect([...offered].sort()).toEqual(Object.keys(everyColor).sort());
  });

  it('labels every option in Portuguese and non-empty', () => {
    for (const option of eventColorOptions) {
      expect(option.label.length).toBeGreaterThan(0);
    }
    expect(eventColorOptions.map((option) => option.label)).toEqual([
      'Verde',
      'Âmbar',
      'Violeta',
      'Coral',
      'Azul',
    ]);
  });

  it('takes every dot straight from the design tokens, never a literal hue', () => {
    const tokenHues = [color.lime.text, color.amber.text, color.violet.text, color.coral.text, color.blue.text];

    for (const option of eventColorOptions) {
      expect(tokenHues).toContain(option.dot);
    }
  });
});

describe('eventDotColor', () => {
  it('resolves every color to the token hue used by the picker option', () => {
    for (const option of eventColorOptions) {
      expect(eventDotColor(option.value)).toBe(option.dot);
    }
  });

  it('resolves the default color used by new events', () => {
    expect(eventDotColor('lime')).toBe(color.lime.text);
  });
});
