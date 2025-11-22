/**
 * LocalStorage utilities for persisting widget state
 */

import { logger } from './logger';

const STORAGE_KEY = 'wedding-cost-estimator-state';
const STORAGE_VERSION = 1;

interface StoredState {
  version: number;
  date: string;
  guests: number;
  mealStyle: string;
  barService: string;
  barDuration: number;
  compareMode: boolean;
  plannerUsed: boolean;
  service: number;
  tax: number;
  gratuity: number;
  contingency: number;
  overrides: Record<string, number>;
  otherVenueOverrides: Record<string, number>;
}

/**
 * Save widget state to localStorage
 */
export function saveState(state: Partial<StoredState>): void {
  try {
    const stateToSave: StoredState = {
      version: STORAGE_VERSION,
      date: state.date || '',
      guests: state.guests ?? 150,
      mealStyle: state.mealStyle || 'buffet',
      barService: state.barService || 'openBeerWinePremium',
      barDuration: state.barDuration ?? 4,
      compareMode: state.compareMode ?? false,
      plannerUsed: state.plannerUsed ?? false,
      service: state.service ?? 20,
      tax: state.tax ?? 7,
      gratuity: state.gratuity ?? 0,
      contingency: state.contingency ?? 10,
      overrides: state.overrides || {},
      otherVenueOverrides: state.otherVenueOverrides || {},
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    // localStorage might be unavailable (private browsing, quota exceeded, etc.)
    logger.warn('Failed to save state to localStorage:', error);
  }
}

/**
 * Load widget state from localStorage
 */
export function loadState(): Partial<StoredState> | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const state = JSON.parse(stored) as StoredState;
    
    // Check version compatibility
    if (state.version !== STORAGE_VERSION) {
      // Clear old version data
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    return state;
  } catch (error) {
    // localStorage might be unavailable or corrupted
    logger.warn('Failed to load state from localStorage:', error);
    return null;
  }
}

/**
 * Clear saved state from localStorage
 */
export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    logger.warn('Failed to clear state from localStorage:', error);
  }
}

