import { useCallback } from 'preact/hooks';
import { WEDDING_CATEGORIES, OTHER_VENUE_DEFAULTS, EXTERNAL_PLANNER_COST } from '../../config/config';
import { CategoryOverrides, OtherVenueOverrides } from '../lib/calc';

interface OverrideHandlers {
  onOverrideChange: (category: string, value: number) => void;
  onResetOverrides: () => void;
  onOtherVenueOverrideChange: (category: string, value: number) => void;
  onResetOtherVenueOverrides: () => void;
}

export function useOverrideHandlers(
  setOverrides: (value: Partial<CategoryOverrides> | ((prev: Partial<CategoryOverrides>) => Partial<CategoryOverrides>)) => void,
  setOtherVenueOverrides: (value: Partial<OtherVenueOverrides> | ((prev: Partial<OtherVenueOverrides>) => Partial<OtherVenueOverrides>)) => void
): OverrideHandlers {
  const onOverrideChange = useCallback((category: string, value: number) => {
    setOverrides(prev => {
      // If value is NaN, remove this category from overrides (for food, use calculated value)
      if (isNaN(value)) {
        const newOverrides = { ...prev };
        delete (newOverrides as Record<string, unknown>)[category];
        return newOverrides;
      }
      return { ...prev, [category]: value } as Partial<CategoryOverrides>;
    });
  }, [setOverrides]);

  const onResetOverrides = useCallback(() => {
    const defaults: Partial<CategoryOverrides> = {};
    
    // Add WEDDING_CATEGORIES defaults, but skip 'food' since it's calculated dynamically
    Object.entries(WEDDING_CATEGORIES).forEach(([key, category]) => {
      if (key !== 'food') {
        (defaults as Record<string, number>)[key] = category.default;
      }
    });
    
    // Add OTHER_VENUE_DEFAULTS
    Object.entries(OTHER_VENUE_DEFAULTS).forEach(([key, value]) => {
      (defaults as Record<string, number>)[key] = value;
    });
    
    // Add EXTERNAL_PLANNER_COST
    defaults.externalPlanner = EXTERNAL_PLANNER_COST;
    
    // Remove 'food' from current overrides if it exists, to use calculated value
    setOverrides(prev => {
      const newOverrides = { ...prev, ...defaults };
      delete (newOverrides as Record<string, unknown>).food;
      return newOverrides;
    });
  }, [setOverrides]);

  const onOtherVenueOverrideChange = useCallback((category: string, value: number) => {
    setOtherVenueOverrides(prev => ({ ...prev, [category]: value } as Partial<OtherVenueOverrides>));
  }, [setOtherVenueOverrides]);

  const onResetOtherVenueOverrides = useCallback(() => {
    setOtherVenueOverrides({});
  }, [setOtherVenueOverrides]);

  return {
    onOverrideChange,
    onResetOverrides,
    onOtherVenueOverrideChange,
    onResetOtherVenueOverrides,
  };
}

