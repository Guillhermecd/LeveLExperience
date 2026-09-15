import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearBoardCache, readBoardCache, writeBoardCache, type BoardCache } from './boardCache';

// vitest's default "node" environment doesn't guarantee a global
// localStorage, so it's stubbed the same way api.spec.ts stubs fetch —
// this also lets the "quota exceeded" test throw on demand.
function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
    clear: () => data.clear(),
    key: () => null,
    get length() {
      return data.size;
    },
  } as Storage;
}

const sampleCache: BoardCache = {
  cards: [],
  goals: [],
  history: [],
  stats: { rawTotal: 10, streak: 1, lastXpDay: '2026-01-01', cleanDayPaid: null, dayXp: 0, dayDone: 0 },
};

describe('boardCache', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', memoryStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns null when nothing was cached for the user yet', () => {
    expect(readBoardCache('u1')).toBeNull();
  });

  it('round-trips what was written for that user', () => {
    writeBoardCache('u1', sampleCache);
    expect(readBoardCache('u1')).toEqual(sampleCache);
  });

  it('keeps caches for different users apart', () => {
    writeBoardCache('u1', sampleCache);
    expect(readBoardCache('u2')).toBeNull();
  });

  // Gate 5.1: corrupted localStorage must not break boot.
  it('reads a corrupted value as null instead of throwing', () => {
    localStorage.setItem('kanban.board.u1', '{not json');
    expect(readBoardCache('u1')).toBeNull();
  });

  it('clearBoardCache removes only that user\'s entry', () => {
    writeBoardCache('u1', sampleCache);
    writeBoardCache('u2', sampleCache);
    clearBoardCache('u1');
    expect(readBoardCache('u1')).toBeNull();
    expect(readBoardCache('u2')).toEqual(sampleCache);
  });

  it('a storage failure on write does not throw', () => {
    vi.stubGlobal('localStorage', {
      setItem: () => {
        throw new Error('quota exceeded');
      },
    } as unknown as Storage);
    expect(() => writeBoardCache('u1', sampleCache)).not.toThrow();
  });
});
