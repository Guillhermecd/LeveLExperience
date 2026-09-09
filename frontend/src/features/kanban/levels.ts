import { levelTable, ranks } from './xpRulesTable';

const baseCost = levelTable[0].cost;
const costIncrement = levelTable[1].cost - levelTable[0].cost;

/** Extrapolates past the static table (10 rows) using the same arithmetic step. */
function costForLevel(level: number): number {
  const row = levelTable[level - 1];
  return row ? row.cost : baseCost + (level - 1) * costIncrement;
}

function rankForLevel(level: number): string {
  return ranks[Math.min(level - 1, ranks.length - 1)];
}

export type LevelInfo = {
  level: number;
  rank: string;
  xpIntoLevel: number;
  xpForNextLevel: number;
};

/** Level is always derived from a total, never stored — see PLAN.md decision #4. */
export function getLevelInfo(xpTotal: number): LevelInfo {
  let level = 1;
  let threshold = 0;
  let cost = costForLevel(level);

  while (xpTotal >= threshold + cost) {
    threshold += cost;
    level += 1;
    cost = costForLevel(level);
  }

  return {
    level,
    rank: rankForLevel(level),
    xpIntoLevel: xpTotal - threshold,
    xpForNextLevel: cost,
  };
}
