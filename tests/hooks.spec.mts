// @vitest-environment jsdom
import { render } from 'preact';
import { useEffect } from 'preact/hooks';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useValidationHandlers } from '../app/hooks/useValidationHandlers';
import { useOverrideHandlers } from '../app/hooks/useOverrideHandlers';
import { GUESTS, WEDDING_CATEGORIES, OTHER_VENUE_DEFAULTS, EXTERNAL_PLANNER_COST } from '../config/config';

const flushEffects = () => new Promise(resolve => setTimeout(resolve, 0));

describe('Hook handlers', () => {
  describe('useValidationHandlers', () => {
    let container;

    let setDate = vi.fn();
    let setGuests = vi.fn();
    let setService = vi.fn();
    let setTax = vi.fn();
    let setGratuity = vi.fn();
    let setContingency = vi.fn();

    let setDateError = vi.fn();
    let setGuestsError = vi.fn();
    let setGuestsClamped = vi.fn();
    let setServiceError = vi.fn();
    let setTaxError = vi.fn();
    let setGratuityError = vi.fn();
    let setContingencyError = vi.fn();

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
      let handlers = null;

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

        handlers = validationHandlers;
        return null;
      }

      render(<Component />, container);
      await flushEffects();

      handlers?.onDateChange('2024-13-01');
      expect(setDate).toHaveBeenCalledWith('2024-13-01');
      expect(setDateError).toHaveBeenCalledWith('Invalid date');

      handlers?.onDateChange('2099-12-01');
      expect(setDateError).toHaveBeenLastCalledWith('Date cannot be more than 10 years in the future');

      handlers?.onGuestsChange(GUESTS.min - 5);
      expect(setGuests).toHaveBeenCalledWith(GUESTS.min - 5);
      expect(setGuestsClamped).toHaveBeenCalledWith(true);
      expect(setGuestsError).toHaveBeenCalledWith(null);

      handlers?.onGuestsChange(GUESTS.max + 50);
      expect(setGuestsClamped).toHaveBeenLastCalledWith(true);
      expect(setGuestsError).toHaveBeenLastCalledWith(null);
    });

    it('applies percentage validation rules', async () => {
      let handlers = null;

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

        handlers = validationHandlers;
        return null;
      }

      render(<Component />, container);
      await flushEffects();

      handlers?.onServiceChange(-5);
      expect(setService).toHaveBeenCalledWith(-5);
      expect(setServiceError).toHaveBeenCalledWith('Percentage cannot be negative');

      handlers?.onTaxChange(150);
      expect(setTaxError).toHaveBeenCalledWith('Percentage cannot exceed 100%');

      handlers?.onGratuityChange(15);
      expect(setGratuityError).toHaveBeenCalledWith(null);

      handlers?.onContingencyChange(175);
      expect(setContingencyError).toHaveBeenCalledWith(null);
    });
  });

  describe('useOverrideHandlers', () => {
    let container;
    let overrides;
    let otherOverrides;
    let setOverrides;
    let setOtherOverrides;

    beforeEach(() => {
      container = document.createElement('div');
      overrides = { photography: 1200, food: 5000 };
      otherOverrides = { tablesChairs: 1000 };

      setOverrides = vi.fn(update => {
        overrides = typeof update === 'function' ? update(overrides) : update;
      });

      setOtherOverrides = vi.fn(update => {
        otherOverrides = typeof update === 'function' ? update(otherOverrides) : update;
      });
    });

    it('updates overrides and removes NaN values', async () => {
      let handlers = null;

      function Component() {
        const overrideHandlers = useOverrideHandlers(setOverrides, setOtherOverrides);
        handlers = overrideHandlers;
        return null;
      }

      render(<Component />, container);
      await flushEffects();

      handlers?.onOverrideChange('photography', 2500);
      expect(overrides.photography).toBe(2500);

      handlers?.onOverrideChange('food', Number.NaN);
      expect('food' in overrides).toBe(false);
    });

    it('resets overrides to defaults and clears other venue overrides', async () => {
      let handlers = null;

      function Component() {
        const overrideHandlers = useOverrideHandlers(setOverrides, setOtherOverrides);
        handlers = overrideHandlers;
        return null;
      }

      render(<Component />, container);
      await flushEffects();

      handlers?.onOtherVenueOverrideChange('tablesChairs', 1800);
      expect(otherOverrides.tablesChairs).toBe(1800);

      handlers?.onResetOtherVenueOverrides();
      expect(otherOverrides).toEqual({});

      handlers?.onResetOverrides();

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
});

