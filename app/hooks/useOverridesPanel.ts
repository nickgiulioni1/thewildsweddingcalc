/**
 * Custom hook for managing overrides panel state and handlers.
 *
 * Provides encapsulated logic for handling category cost overrides,
 * including input parsing, validation, and reset functionality.
 */

import { useState, useCallback } from 'preact/hooks';
import { WEDDING_CATEGORIES, OTHER_VENUE_DEFAULTS, EXTERNAL_PLANNER_COST } from '../../config/config';
import { CategoryOverrides } from '../lib/calc';

export interface UseOverridesPanelOptions {
  /** Initial override values */
  initialOverrides?: Partial<CategoryOverrides>;
  /** Callback when overrides change */
  onOverridesChange?: (overrides: Partial<CategoryOverrides>) => void;
}

export interface UseOverridesPanelReturn {
  /** Current override values */
  overrides: Partial<CategoryOverrides>;
  /** Whether the panel is expanded */
  isOpen: boolean;
  /** Toggle panel open/closed */
  toggleOpen: () => void;
  /** Set panel open state */
  setIsOpen: (open: boolean) => void;
  /** Handle input change for a category */
  handleInputChange: (category: string, value: string) => void;
  /** Reset all overrides to defaults */
  resetOverrides: () => void;
  /** Check if any overrides are active */
  hasOverrides: boolean;
  /** Get the display value for a category */
  getDisplayValue: (category: string, calculatedFoodCost?: number) => number;
  /** Get the default value for a category */
  getDefaultValue: (category: string) => number;
}

/**
 * Gets default override values based on wedding categories and other venue defaults.
 */
export function getDefaultOverrides(): Partial<CategoryOverrides> {
  const defaults: Partial<CategoryOverrides> = {};

  // Add wedding categories (except food which is calculated)
  Object.entries(WEDDING_CATEGORIES).forEach(([key, category]) => {
    if (key !== 'food') {
      (defaults as Record<string, number>)[key] = category.default;
    }
  });

  // Add other venue defaults
  Object.entries(OTHER_VENUE_DEFAULTS).forEach(([key, value]) => {
    (defaults as Record<string, number>)[key] = value;
  });

  // Add external planner cost
  defaults.externalPlanner = EXTERNAL_PLANNER_COST;

  return defaults;
}

/**
 * Hook for managing the overrides panel state and logic.
 *
 * @param options - Configuration options
 * @returns Panel state and handlers
 *
 * @example
 * ```tsx
 * const {
 *   overrides,
 *   isOpen,
 *   toggleOpen,
 *   handleInputChange,
 *   resetOverrides,
 *   hasOverrides,
 * } = useOverridesPanel({
 *   initialOverrides: savedOverrides,
 *   onOverridesChange: (newOverrides) => saveState(newOverrides),
 * });
 * ```
 */
export function useOverridesPanel(options: UseOverridesPanelOptions = {}): UseOverridesPanelReturn {
  const { initialOverrides, onOverridesChange } = options;

  const [overrides, setOverrides] = useState<Partial<CategoryOverrides>>(
    initialOverrides ?? getDefaultOverrides()
  );
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleInputChange = useCallback((category: string, value: string) => {
    setOverrides(prev => {
      const newOverrides = { ...prev };

      // Handle food category specially - empty value means use calculated
      if (category === 'food' && (value === '' || value.trim() === '')) {
        delete (newOverrides as Record<string, number>)[category];
      } else {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          (newOverrides as Record<string, number>)[category] = numValue;
        } else if (category !== 'food') {
          // For non-food categories, default to 0 if invalid
          (newOverrides as Record<string, number>)[category] = 0;
        }
      }

      onOverridesChange?.(newOverrides);
      return newOverrides;
    });
  }, [onOverridesChange]);

  const resetOverrides = useCallback(() => {
    const defaults = getDefaultOverrides();
    setOverrides(defaults);
    onOverridesChange?.(defaults);
  }, [onOverridesChange]);

  const hasOverrides = Object.values(overrides).some(value => typeof value === 'number' && value > 0);

  const getDisplayValue = useCallback((category: string, calculatedFoodCost?: number): number => {
    if (category === 'food') {
      return (overrides as Record<string, number>)[category] ?? calculatedFoodCost ?? 0;
    }

    const categoryConfig = (WEDDING_CATEGORIES as Record<string, { default: number }>)[category];
    const otherDefault = (OTHER_VENUE_DEFAULTS as Record<string, number>)[category];
    const defaultValue = categoryConfig?.default ?? otherDefault ?? (category === 'externalPlanner' ? EXTERNAL_PLANNER_COST : 0);

    return (overrides as Record<string, number>)[category] ?? defaultValue;
  }, [overrides]);

  const getDefaultValue = useCallback((category: string): number => {
    const categoryConfig = (WEDDING_CATEGORIES as Record<string, { default: number }>)[category];
    const otherDefault = (OTHER_VENUE_DEFAULTS as Record<string, number>)[category];
    return categoryConfig?.default ?? otherDefault ?? (category === 'externalPlanner' ? EXTERNAL_PLANNER_COST : 0);
  }, []);

  return {
    overrides,
    isOpen,
    toggleOpen,
    setIsOpen,
    handleInputChange,
    resetOverrides,
    hasOverrides,
    getDisplayValue,
    getDefaultValue,
  };
}
