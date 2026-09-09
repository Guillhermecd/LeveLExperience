import type { BoardColumn, GoalScope, Priority } from '../../types/board';

/**
 * Minimal state the XP engine cares about — mirrors the `given`/`expect`
 * shape in xp-rules.json, not the full UI card model in types/board.ts.
 * Card title, tags, and positions never affect XP, so they live outside this.
 */
export type SimCard = {
  id: string;
  column: BoardColumn;
  priority: Priority;
};

export type SimGoal = {
  id: string;
  scope: GoalScope;
  done: boolean;
};

export type SimSubtask = {
  id: string;
  cardId: string;
  done: boolean;
};

export type LedgerStats = {
  rawTotal: number;
  streak: number;
  lastXpDay: string | null;
  cleanDayPaid: string | null;
  dayXp: number;
  dayDone: number;
};

export type BoardSimState = {
  cards: SimCard[];
  goals: SimGoal[];
  subtasks: SimSubtask[];
  stats: LedgerStats;
};

export type XpReason =
  | 'card_done'
  | 'card_undone'
  | 'goal_done'
  | 'goal_undone'
  | 'subtask_done'
  | 'focus_session'
  | 'clean_day';

export type XpEvent = {
  reason: XpReason;
  delta: number;
  refId: string | null;
};

export type FocusOutcome = 'completed' | 'abandoned';

export type BoardAction =
  | { type: 'move_card'; cardId: string; to: BoardColumn }
  | { type: 'toggle_goal'; goalId: string; done: boolean }
  | { type: 'toggle_subtask'; subtaskId: string; done: boolean }
  | {
      type: 'finish_focus';
      cardId: string;
      plannedMinutes: number;
      elapsedMinutes: number;
      outcome: FocusOutcome;
    };

/** The fields xp-rules.json scenarios assert on — a projection of LedgerStats. */
export type DisplayStats = {
  rawTotal: number;
  xpTotal: number;
  level: number;
  rank: string;
  xpIntoLevel: number;
  xpForNextLevel: number;
  streak: number;
  dayXp: number;
  dayDone: number;
};
