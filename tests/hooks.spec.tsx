// @vitest-environment jsdom
import { render } from 'preact';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { useValidationHandlers } from '../app/hooks/useValidationHandlers';
import { useOverrideHandlers } from '../app/hooks/useOverrideHandlers';
import { useWeddingCalculator } from '../app/hooks/useWeddingCalculator';
import { CategoryOverrides, OtherVenueOverrides } from '../app/lib/calc';
import * as storage from '../app/lib/storage';
import { GUESTS, WEDDING_CATEGORIES, OTHER_VENUE_DEFAULTS, EXTERNAL_PLANNER_COST } from '../config/config';

// Type for validation handlers returned by the hook
interface ValidationHandlers {
  onDateChange: (newDate: string) => void;
  onGuestsChange: (newGuests: number) => void;
  onServiceChange: (newService: number) => void;
  onTaxChange: (newTax: number) => void;
  onGratuityChange: (newGratuity: number) => void;
  onContingencyChange: (newContingency: number) => void;
}

// Type for override handlers returned by the hook
interface OverrideHandlers {
  onOverrideChange: (category: string, value: number) => void;
  onResetOverrides: () => void;
  onOtherVenueOverrideChange: (category: string, value: number) => void;
  onResetOtherVenueOverrides: () => void;
}

// Type for the calculator return
interface CalculatorReturn {
  guests: number;
  setGuests: (guests: number) => void;
}

// Wrapper to capture hook results
interface HookCapture<T> {
  current: T | null;
}

const flushEffects = () => new Promise(resolve => setTimeout(resolve, 0));

describe('Hook handlers', () => {
  describe('useValidationHandlers', () => {
    let container: HTMLDivElement;

    let setDate: Mock;
    let setGuests: Mock;
    let setService: Mock;
    let setTax: Mock;
    let setGratuity: Mock;
    let setContingency: Mock;

    let setDateError: Mock;
    let setGuestsError: Mock;
    let setGuestsClamped: Mock;
    let setServiceError: Mock;
    let setTaxError: Mock;
    let setGratuityError: Mock;
    let setContingencyError: Mock;

    beforeEach(() => {
      container = document.createElement('div');

      setDate = vi.fn();
      setGuests = vi.fn();
      setService = vi.fn();
      setTax = vi.fn();
      setGratuity = vi.fn();
      setContingency = vi.fn();

      setDateError = vi.fn();
      setGuestsError = vi.fn();
      setGuestsClamped = vi.fn();
      setServiceError = vi.fn();
      setTaxError = vi.fn();
      setGratuityError = vi.fn();
      setContingencyError = vi.fn();
    });

    it('validates dates and guests on change', async () => {
      const capture: HookCapture<ValidationHandlers> = { current: null };

      function Component() {
        const validationHandlers = useValidationHandlers(
          {
            setDate,
            setGuests,
            setService,
            setTax,
            setGratuity,
            setContingency,
          },
          {
            setDateError,
            setGuestsError,
            setGuestsClamped,
            setServiceError,
            setTaxError,
            setGratuityError,
            setContingencyError,
          }
        );

        capture.current = validationHandlers;
        return null;
      }

      render(<Component />, container);
      await flushEffects();

      capture.current!.onDateChange('2024-13-01');
      expect(setDate).toHaveBeenCalledWith('2024-13-01');
      expect(setDateError).toHaveBeenCalledWith('Invalid date');

      capture.current!.onDateChange('2099-12-01');
      expect(setDateError).toHaveBeenLastCalledWith('Date cannot be more than 10 years in the future');

      capture.current!.onGuestsChange(GUESTS.min - 5);
      expect(setGuests).toHaveBeenCalledWith(GUESTS.min - 5);
      expect(setGuestsClamped).toHaveBeenCalledWith(true);
      expect(setGuestsError).toHaveBeenCalledWith(null);

      capture.current!.onGuestsChange(GUESTS.max + 50);
      expect(setGuestsClamped).toHaveBeenLastCalledWith(true);
      expect(setGuestsError).toHaveBeenLastCalledWith(null);
    });

    it('applies percentage validation rules', async () => {
      const capture: HookCapture<ValidationHandlers> = { current: null };

      function Component() {
        const validationHandlers = useValidationHandlers(
          {
            setDate,
            setGuests,
            setService,
            setTax,
            setGratuity,
            setContingency,
          },
          {
            setDateError,
            setGuestsError,
            setGuestsClamped,
            setServiceError,
            setTaxError,
            setGratuityError,
            setContingencyError,
          }
        );

        capture.current = validationHandlers;
        return null;
      }

      render(<Component />, container);
      await flushEffects();

      capture.current!.onServiceChange(-5);
      expect(setService).toHaveBeenCalledWith(-5);
      expect(setServiceError).toHaveBeenCalledWith('Percentage cannot be negative');

      capture.current!.onTaxChange(150);
      expect(setTaxError).toHaveBeenCalledWith('Percentage cannot exceed 100%');

      capture.current!.onGratuityChange(15);
      expect(setGratuityError).toHaveBeenCalledWith(null);

      capture.current!.onContingencyChange(175);
      expect(setContingencyError).toHaveBeenCalledWith(null);
    });
  });

  describe('useOverrideHandlers', () => {
    let container: HTMLDivElement;
    let overrides: Record<string, number>;
    let otherOverrides: Record<string, number>;
    let setOverrides: Mock;
    let setOtherOverrides: Mock;

    beforeEach(() => {
      container = document.createElement('div');
      overrides = { photography: 1200, food: 5000 };
      otherOverrides = { tablesChairs: 1000 };

      setOverrides = vi.fn((update: Partial<CategoryOverrides> | ((prev: Partial<CategoryOverrides>) => Partial<CategoryOverrides>)) => {
        overrides = typeof update === 'function' ? update(overrides) as Record<string, number> : update as Record<string, number>;
      });

      setOtherOverrides = vi.fn((update: Partial<OtherVenueOverrides> | ((prev: Partial<OtherVenueOverrides>) => Partial<OtherVenueOverrides>)) => {
        otherOverrides = typeof update === 'function' ? update(otherOverrides) as Record<string, number> : update as Record<string, number>;
      });
    });

    it('updates overrides and removes NaN values', async () => {
      const capture: HookCapture<OverrideHandlers> = { current: null };

      function Component() {
        const overrideHandlers = useOverrideHandlers(setOverrides, setOtherOverrides);
        capture.current = overrideHandlers;
        return null;
      }

      render(<Component />, container);
      await flushEffects();

      capture.current!.onOverrideChange('photography', 2500);
      expect(overrides.photography).toBe(2500);

      capture.current!.onOverrideChange('food', Number.NaN);
      expect('food' in overrides).toBe(false);
    });

    it('resets overrides to defaults and clears other venue overrides', async () => {
      const capture: HookCapture<OverrideHandlers> = { current: null };

      function Component() {
        const overrideHandlers = useOverrideHandlers(setOverrides, setOtherOverrides);
        capture.current = overrideHandlers;
        return null;
      }

      render(<Component />, container);
      await flushEffects();

      capture.current!.onOtherVenueOverrideChange('tablesChairs', 1800);
      expect(otherOverrides.tablesChairs).toBe(1800);

      capture.current!.onResetOtherVenueOverrides();
      expect(otherOverrides).toEqual({});

      capture.current!.onResetOverrides();

      Object.entries(WEDDING_CATEGORIES).forEach(([key, category]) => {
        if (key !== 'food') {
          expect(overrides[key]).toBe(category.default);
        }
      });

      Object.entries(OTHER_VENUE_DEFAULTS).forEach(([key, value]) => {
        expect(overrides[key]).toBe(value);
      });

      expect(overrides.externalPlanner).toBe(EXTERNAL_PLANNER_COST);
      expect(overrides.food).toBeUndefined();
    });
  });

  describe('useWeddingCalculator integration', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
      container = document.createElement('div');
      localStorage.clear();
      vi.restoreAllMocks();
    });

    it('clamps guests and persists normalized values', async () => {
      const capture: HookCapture<CalculatorReturn> = { current: null };
      const saveSpy = vi.spyOn(storage, 'saveState');

      function Component() {
        const calc = useWeddingCalculator();
        capture.current = calc;
        return null;
      }

      render(<Component />, container);
      await flushEffects();

      capture.current!.setGuests(GUESTS.max + 25);
      await flushEffects();
      await flushEffects();
      await flushEffects();

      expect(capture.current!.guests).toBe(GUESTS.max);

      let storedGuests = JSON.parse(localStorage.getItem('wedding-cost-estimator-state') ?? '{}').guests;
      for (let i = 0; i < 5 && storedGuests !== GUESTS.max; i++) {
        await flushEffects();
        storedGuests = JSON.parse(localStorage.getItem('wedding-cost-estimator-state') ?? '{}').guests;
      }

      const savedGuestsCalls = saveSpy.mock.calls.map(call => (call[0] as { guests?: number })?.guests);
      expect(savedGuestsCalls).toContain(GUESTS.max);
      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({ guests: GUESTS.max }));
      expect(storedGuests).toBe(GUESTS.max);

      render(null, container);
      await flushEffects();

      capture.current = null;
      render(<Component />, container);
      await flushEffects();

      expect(capture.current!.guests).toBe(GUESTS.max);

      capture.current!.setGuests(GUESTS.min - 10);
      await flushEffects();
      await flushEffects();
      await flushEffects();

      expect(capture.current!.guests).toBe(GUESTS.min);

      let reloadedGuests = JSON.parse(localStorage.getItem('wedding-cost-estimator-state') ?? '{}').guests;
      for (let i = 0; i < 5 && reloadedGuests !== GUESTS.min; i++) {
        await flushEffects();
        reloadedGuests = JSON.parse(localStorage.getItem('wedding-cost-estimator-state') ?? '{}').guests;
      }

      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({ guests: GUESTS.min }));
      expect(reloadedGuests).toBe(GUESTS.min);
    });
  });
});
