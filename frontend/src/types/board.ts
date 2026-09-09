/** Mirrors `cards.column_key` in V1__initial_schema.sql — never the pt-BR prototype names. */
export type BoardColumn = 'backlog' | 'today' | 'doing' | 'done';

/** Mirrors `cards.priority`. */
export type Priority = 0 | 1 | 2;

/** Mirrors `cards.tag`. -1 means no tag. */
export type Tag = -1 | 0 | 1 | 2 | 3;

/** Mirrors `goals.scope`. */
export type GoalScope = 'week' | 'month';

export type Subtask = {
  id: string;
  cardId: string;
  title: string;
  done: boolean;
  position: number;
};

export type Card = {
  id: string;
  columnKey: BoardColumn;
  title: string;
  priority: Priority;
  tag: Tag;
  position: number;
  poms: number;
  subtasks: Subtask[];
};

export type Goal = {
  id: string;
  scope: GoalScope;
  title: string;
  done: boolean;
  position: number;
};

export type FocusSession = {
  cardId: string;
  totalSeconds: number;
  leftSeconds: number;
  running: boolean;
};

export type DayHistoryEntry = {
  day: string;
  xp: number;
  done: number;
};

export type UserStats = {
  xpTotal: number;
  streak: number;
  lastXpDay: string | null;
  cleanDayPaidOn: string | null;
  history: Record<string, DayHistoryEntry>;
};
