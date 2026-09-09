import { describe, expect, it } from 'vitest';
import { applyAction, applyActions, projectDisplayStats } from './reducer';
import { getLevelInfo } from './levels';
import type { BoardAction, BoardSimState } from './types';
import { levelTable, ranks, xpScenarios, type XpScenario } from './xpRulesTable';

function buildState(given: XpScenario['given']): BoardSimState {
  return {
    cards: given.cards.map((c) => ({ id: c.id, column: c.column, priority: c.priority }) as BoardSimState['cards'][number]),
    goals: given.goals.map((g) => ({ id: g.id, scope: g.scope, done: g.done }) as BoardSimState['goals'][number]),
    subtasks: given.subtasks.map((s) => ({ id: s.id, cardId: s.cardId, done: s.done })),
    stats: given.stats,
  };
}

function runScenario(scenario: XpScenario) {
  const initial = buildState(scenario.given);
  const actions = scenario.actions as unknown as BoardAction[];
  const { state, events } = applyActions(initial, actions, scenario.given.today);
  const display = projectDisplayStats(state.stats, scenario.given.today);
  return { events, display };
}

describe('XP rules (table shared with the backend)', () => {
  it('the table is not empty and has no duplicate ids', () => {
    expect(xpScenarios.length).toBeGreaterThan(0);
    expect(new Set(xpScenarios.map((s) => s.id)).size).toBe(xpScenarios.length);
  });

  for (const scenario of xpScenarios) {
    it(scenario.id, () => {
      const { events, display } = runScenario(scenario);
      expect(events).toEqual(scenario.expect.events);
      expect(display).toEqual({
        rawTotal: scenario.expect.rawTotal,
        xpTotal: scenario.expect.xpTotal,
        level: scenario.expect.level,
        rank: scenario.expect.rank,
        xpIntoLevel: scenario.expect.xpIntoLevel,
        xpForNextLevel: scenario.expect.xpForNextLevel,
        streak: scenario.expect.streak,
        dayXp: scenario.expect.dayXp,
        dayDone: scenario.expect.dayDone,
      });
    });
  }
});

describe('level table', () => {
  for (const row of levelTable) {
    it(`level ${row.level} requires ${row.threshold} cumulative XP and is called '${row.rank}'`, () => {
      const info = getLevelInfo(row.threshold);
      expect(info.level).toBe(row.level);
      expect(info.rank).toBe(row.rank);
      expect(info.xpForNextLevel).toBe(row.cost);
    });
  }

  it('level 9 and above stays Lenda', () => {
    const lastRank = ranks[ranks.length - 1];
    const farBeyondTable = levelTable[levelTable.length - 1].threshold + 10_000;
    expect(getLevelInfo(farBeyondTable).rank).toBe(lastRank);
  });
});

describe('invariants that hold for every scenario', () => {
  it('the displayed total is never negative', () => {
    for (const scenario of xpScenarios) {
      expect(runScenario(scenario).display.xpTotal).toBeGreaterThanOrEqual(0);
    }
  });

  it('no event has a zero delta', () => {
    for (const scenario of xpScenarios) {
      for (const event of runScenario(scenario).events) {
        expect(event.delta).not.toBe(0);
      }
    }
  });

  it('the raw total is always the ledger sum plus the opening balance', () => {
    for (const scenario of xpScenarios) {
      const { events, display } = runScenario(scenario);
      const sum = events.reduce((acc, e) => acc + e.delta, 0);
      expect(display.rawTotal).toBe(scenario.given.stats.rawTotal + sum);
    }
  });

  it('applying zero actions never emits an event', () => {
    for (const scenario of xpScenarios) {
      const initial = buildState(scenario.given);
      const { state, events } = applyActions(initial, [], scenario.given.today);
      expect(events).toEqual([]);
      expect(state).toBe(initial);
    }
  });

  it('the level is always derivable from the displayed total', () => {
    for (const scenario of xpScenarios) {
      const { display } = runScenario(scenario);
      expect(getLevelInfo(display.xpTotal).level).toBe(display.level);
    }
  });
});

describe('reducer is pure', () => {
  it('returns the same state reference for an action with no effect', () => {
    const state: BoardSimState = {
      cards: [{ id: 'c1', column: 'done', priority: 1 }],
      goals: [],
      subtasks: [],
      stats: { rawTotal: 20, streak: 0, lastXpDay: null, cleanDayPaid: null, dayXp: 0, dayDone: 0 },
    };
    const action: BoardAction = { type: 'move_card', cardId: 'c1', to: 'done' };
    const { state: next } = applyAction(state, action, '2026-09-02');
    expect(next).toBe(state);
  });
});
