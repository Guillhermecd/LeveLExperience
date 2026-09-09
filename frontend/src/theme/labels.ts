/**
 * Single place where pt-BR UI text maps to English identifiers. No component
 * or query compares against these strings — see PLAN.md "Idioma".
 */
import type { BoardColumn, GoalScope, Tag } from '../types/board';

export const columnLabel: Record<BoardColumn, string> = {
  backlog: 'Backlog / Ideias',
  today: 'Hoje',
  doing: 'Em andamento',
  done: 'Feito',
};

export const goalScopeLabel: Record<GoalScope, string> = {
  week: 'Esta semana',
  month: 'Este mês',
};

export const tagLabel: Record<Tag, string> = {
  [-1]: 'etiqueta',
  0: 'Trabalho',
  1: 'Pessoal',
  2: 'Saúde',
  3: 'Estudo',
};

/** Cycle order used when clicking a card's tag chip. */
export const tagCycle: Tag[] = [-1, 0, 1, 2, 3];

/** Cycle order used when clicking a card's priority dot. */
export const priorityCycle = [0, 1, 2] as const;

export const weekdayInitial = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function greeting(now: Date, name?: string): string {
  const hour = now.getHours();
  const base = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  return name ? `${base}, ${name}.` : `${base}.`;
}

export function formatHeaderDate(now: Date): string {
  const formatted = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const [weekday, rest] = formatted.split(', ');
  const capitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${capitalized}, ${rest}`;
}
