import xpRules from '../../../../xp-rules.json';

/**
 * Single import point for the spec at the repo root — never copy its values
 * elsewhere. Both this reducer and the JUnit suite run against this same
 * file; editing it to make a test pass means the code diverged, not the
 * table (see PLAN.md "Regras de XP").
 */
export const xpCardByPriority: Record<'0' | '1' | '2', number> = xpRules.constants.xpCardByPriority;
export const xpGoalByScope: Record<'week' | 'month', number> = xpRules.constants.xpGoal;
export const xpSubtask: number = xpRules.constants.xpSubtask;
export const xpCleanDay: number = xpRules.constants.xpCleanDay;
export const xpFocusMinimum: number = xpRules.constants.xpFocusMinimum;
export const ranks: string[] = xpRules.constants.ranks;
export const levelTable = xpRules.levels;

export type XpScenario = (typeof xpRules.scenarios)[number];
export const xpScenarios: XpScenario[] = xpRules.scenarios;
