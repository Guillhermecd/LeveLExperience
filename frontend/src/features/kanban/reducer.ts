import { applyFinishFocus } from './actions/finishFocus';
import { applyMoveCard } from './actions/moveCard';
import { applyToggleGoal } from './actions/toggleGoal';
import { applyToggleSubtask } from './actions/toggleSubtask';
import { isStreakAlive } from './dateUtils';
import { getLevelInfo } from './levels';
import type { BoardAction, BoardSimState, DisplayStats, LedgerStats, XpEvent } from './types';

type ActionResult = { state: BoardSimState; events: XpEvent[] };

/** Applies one action. Returns the same `state` reference when nothing changes. */
export function applyAction(state: BoardSimState, action: BoardAction, today: string): ActionResult {
  switch (action.type) {
    case 'move_card':
      return applyMoveCard(state, action, today);
    case 'toggle_goal':
      return applyToggleGoal(state, action, today);
    case 'toggle_subtask':
      return applyToggleSubtask(state, action, today);
    case 'finish_focus':
      return applyFinishFocus(state, action, today);
  }
}

/** Folds a batch of actions, collecting every emitted event in order. */
export function applyActions(
  state: BoardSimState,
  actions: BoardAction[],
  today: string,
): ActionResult {
  let events: XpEvent[] = [];
  let current = state;
  for (const action of actions) {
    const result = applyAction(current, action, today);
    current = result.state;
    events = events.concat(result.events);
  }
  return { state: current, events };
}

/**
 * Read-side projection of LedgerStats — always recomputed, never stored.
 * Level/rank/xp-into-level derive from the clamped total (decision #4);
 * the displayed streak can read as zero even when the stored counter is
 * higher, once too many days have passed without positive XP.
 */
export function projectDisplayStats(stats: LedgerStats, today: string): DisplayStats {
  const xpTotal = Math.max(0, stats.rawTotal);
  const levelInfo = getLevelInfo(xpTotal);

  return {
    rawTotal: stats.rawTotal,
    xpTotal,
    level: levelInfo.level,
    rank: levelInfo.rank,
    xpIntoLevel: levelInfo.xpIntoLevel,
    xpForNextLevel: levelInfo.xpForNextLevel,
    streak: isStreakAlive(stats.lastXpDay, today) ? stats.streak : 0,
    dayXp: stats.dayXp,
    dayDone: stats.dayDone,
  };
}
