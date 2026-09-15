import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readBoardCache, writeBoardCache, type BoardCache } from './boardCache';

const validCache: BoardCache = {
  cards: [],
  goals: [],
  history: [],
  stats: { rawTotal: 0, streak: 0, lastXpDay: null, cleanDayPaid: null, dayXp: 0, dayDone: 0 },
};

// The test environment has no DOM, so localStorage doesn't exist globally —
// stub the minimal surface boardCache.ts relies on.
function fakeLocalStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
    key: () => null,
    get length() {
      return store.size;
    },
  };
}

describe('boardCache', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', fakeLocalStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns null when nothing was ever cached', () => {
    expect(readBoardCache()).toBeNull();
  });

  it('round-trips a written cache', () => {
    writeBoardCache(validCache);
    expect(readBoardCache()).toEqual(validCache);
  });

  // Gate 5.1: corrupt localStorage must not throw during boot.
  it('returns null instead of throwing on invalid JSON', () => {
    localStorage.setItem('kanban.boardCache', '{not json');
    expect(readBoardCache()).toBeNull();
  });

  it('returns null on a well-formed but incomplete shape', () => {
    localStorage.setItem('kanban.boardCache', JSON.stringify({ cards: [] }));
    expect(readBoardCache()).toBeNull();
  });
});
