/**
 * Shared type definitions for the wedding cost calculator.
 * This module provides strict type definitions to improve type safety
 * throughout the application.
 */

import { WEDDING_CATEGORIES, OTHER_VENUE_DEFAULTS, PERCENTAGES } from '../../config/config';

/**
 * All possible wedding category IDs from the configuration.
 * These represent the standard wedding expense categories.
 */
export type WeddingCategoryId = keyof typeof WEDDING_CATEGORIES;

/**
 * All possible other venue category IDs.
 * These represent additional costs typically incurred at non-inclusive venues.
 */
export type OtherVenueCategoryId = keyof typeof OTHER_VENUE_DEFAULTS;

/**
 * All possible line item IDs in calculation results.
 * Combines venue fees, bar costs, wedding categories, and other venue categories.
 */
export type LineItemId =
  | 'venueFee'
  | 'barSetupFee'
  | 'barService'
  | WeddingCategoryId
  | 'tablesChairs'
  | 'coreDecor'
  | 'dayOfCoordination'
  | 'cleaning'
  | 'ceremonyAudio'
  | 'setupTeardown'
  | 'externalPlanner';

/**
 * Percentage configuration for calculations.
 * All values are expressed as percentages (0-100 for most, unbounded for contingency).
 */
export interface PercentageConfig {
  /** Service fee percentage (typically 15-25%) */
  service: number;
  /** Sales tax percentage (varies by location) */
  tax: number;
  /** Optional gratuity percentage */
  gratuity: number;
  /** Contingency buffer percentage (can exceed 100%) */
  contingency: number;
}

/**
 * Type guard to check if a value is a valid PercentageConfig.
 */
export function isValidPercentageConfig(value: unknown): value is PercentageConfig {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.service === 'number' &&
    typeof obj.tax === 'number' &&
    typeof obj.gratuity === 'number' &&
    typeof obj.contingency === 'number'
  );
}

/**
 * Default percentage configuration from config.
 */
export const DEFAULT_PERCENTAGES: PercentageConfig = { ...PERCENTAGES };

/**
 * Validation result returned by validation functions.
 */
export interface ValidationResult {
  /** Whether the validation passed */
  isValid: boolean;
  /** Error message if validation failed */
  error?: string;
  /** Warning message (validation passed but with caveats) */
  warning?: string;
}

/**
 * State for percentage input with clamping feedback.
 */
export interface PercentageInputState {
  /** The current value */
  value: number;
  /** Whether the value was clamped to a valid range */
  wasClamped: boolean;
  /** The original value before clamping (if clamped) */
  originalValue?: number;
}
