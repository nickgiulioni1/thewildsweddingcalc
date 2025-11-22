// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveState, loadState, clearState } from '../app/lib/storage';
import { logger } from '../app/lib/logger';

const STORAGE_KEY = 'wedding-cost-estimator-state';

describe('storage utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('saves state with defaults and reloads it', () => {
    saveState({ date: '2025-01-01', guests: 110, plannerUsed: true });

    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored ?? '{}');
    expect(parsed).toMatchObject({
      version: 1,
      date: '2025-01-01',
      guests: 110,
      mealStyle: 'buffet',
      barService: 'openBeerWinePremium',
      plannerUsed: true,
    });

    const loaded = loadState();
    expect(loaded?.date).toBe('2025-01-01');
    expect(loaded?.guests).toBe(110);
    expect(loaded?.barDuration).toBe(4);
  });

  it('returns null and clears storage on version mismatch', () => {
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});

    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 0,
      date: '2024-01-01',
      guests: 90,
    }));

    const loaded = loadState();
    expect(loaded).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('clears saved state safely', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1 }));
    clearState();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

