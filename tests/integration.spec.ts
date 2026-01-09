/**
 * Integration Tests for Wedding Cost Calculator
 *
 * These tests verify end-to-end calculation workflows and ensure
 * all components work together correctly.
 */

import { describe, it, expect } from 'vitest';
import { calculateOurVenue, calculateOtherVenue, CalculationResult } from '../app/lib/calc';
import { getBand } from '../app/lib/dateBand';
import { VENUE_FEES, PERCENTAGES, MealStyle, BarService } from '../config/config';

/**
 * Helper to create standard test inputs
 */
function createTestInputs(overrides: Partial<{
  venue: 'wilds' | 'laural';
  date: string;
  guests: number;
  mealStyle: MealStyle;
  barService: BarService;
  barDuration: number;
  plannerUsed: boolean;
}> = {}) {
  return {
    venue: overrides.venue ?? 'wilds' as const,
    date: overrides.date ?? '2025-06-14', // Saturday
    guests: overrides.guests ?? 150,
    mealStyle: overrides.mealStyle ?? 'buffet' as const,
    barService: overrides.barService ?? 'openBeerWinePremium' as const,
    barDuration: overrides.barDuration ?? 4,
    plannerUsed: overrides.plannerUsed ?? false,
  };
}

/**
 * Helper to get category costs from our venue result
 */
function getCategoryCostsFromResult(result: CalculationResult) {
  const getAmount = (id: string) => result.lineItems.find(i => i.id === id)?.amount ?? 0;
  return {
    food: getAmount('food'),
    photography: getAmount('photography'),
    videography: getAmount('videography'),
    flowers: getAmount('flowers'),
    djMusic: getAmount('djMusic'),
    invitations: getAmount('invitations'),
    transportation: getAmount('transportation'),
    hairMakeup: getAmount('hairMakeup'),
    cakeDesserts: getAmount('cakeDesserts'),
  };
}

describe('Integration Tests - Full Calculation Workflows', () => {
  describe('Complete Wedding Calculation Flow', () => {
    it('should calculate consistent results for same inputs', () => {
      const inputs = createTestInputs();

      const result1 = calculateOurVenue(inputs);
      const result2 = calculateOurVenue(inputs);

      expect(result1.total).toBe(result2.total);
      expect(result1.perGuest).toBe(result2.perGuest);
      expect(result1.lineItems.length).toBe(result2.lineItems.length);
    });

    it('should maintain correct calculation order', () => {
      const inputs = createTestInputs();
      const result = calculateOurVenue(inputs);

      // Verify calculation order:
      // 1. Line items sum to subtotalExVenue (excluding venue fee)
      const lineItemsExVenue = result.lineItems
        .filter(i => i.id !== 'venueFee')
        .reduce((sum, i) => sum + i.amount, 0);
      expect(result.subtotalExVenue).toBeCloseTo(lineItemsExVenue, 2);

      // 2. Service % applied to subtotalExVenue
      const expectedService = result.subtotalExVenue * (PERCENTAGES.service / 100);
      expect(result.service).toBeCloseTo(expectedService, 2);

      // 3. Tax % applied to (subtotalExVenue + service)
      const taxBase = result.subtotalExVenue + result.service;
      const expectedTax = taxBase * (PERCENTAGES.tax / 100);
      expect(result.tax).toBeCloseTo(expectedTax, 2);

      // 4. Gratuity % applied to subtotalExVenue (same base as service)
      const expectedGratuity = result.subtotalExVenue * (PERCENTAGES.gratuity / 100);
      expect(result.gratuity).toBeCloseTo(expectedGratuity, 2);

      // 5. SubtotalWithFees includes all components
      const expectedSubtotalWithFees = result.subtotalExVenue + result.venueFee +
        result.service + result.tax + result.gratuity;
      expect(result.subtotalWithFees).toBeCloseTo(expectedSubtotalWithFees, 2);

      // 6. Contingency applied to subtotalWithFees
      const expectedContingency = result.subtotalWithFees * (PERCENTAGES.contingency / 100);
      expect(result.contingency).toBeCloseTo(expectedContingency, 2);

      // 7. Total = subtotalWithFees + contingency
      expect(result.total).toBeCloseTo(result.subtotalWithFees + result.contingency, 2);
    });

    it('should correctly calculate per-guest cost', () => {
      const inputs = createTestInputs({ guests: 100 });
      const result = calculateOurVenue(inputs);

      expect(result.perGuest).toBeCloseTo(result.total / 100, 2);
    });
  });

  describe('Venue Comparison Workflow', () => {
    it('should compare venues with same base costs', () => {
      const inputs = createTestInputs();
      const ourResult = calculateOurVenue(inputs);

      const otherResult = calculateOtherVenue({
        date: inputs.date,
        guests: inputs.guests,
        mealStyle: inputs.mealStyle,
        barService: inputs.barService,
        barDuration: inputs.barDuration,
        categoryCosts: getCategoryCostsFromResult(ourResult),
      });

      // Food costs should match
      const ourFood = ourResult.lineItems.find(i => i.id === 'food')?.amount ?? 0;
      const otherFood = otherResult.lineItems.find(i => i.id === 'food')?.amount ?? 0;
      expect(otherFood).toBe(ourFood);

      // Other venue should have additional costs
      expect(otherResult.total).toBeGreaterThan(ourResult.total);
    });

    it('should show included items as $0 at our venue', () => {
      const inputs = createTestInputs();
      const result = calculateOurVenue(inputs);

      const includedItems = ['tablesChairs', 'coreDecor', 'dayOfCoordination', 'cleaning'];

      includedItems.forEach(itemId => {
        const item = result.lineItems.find(i => i.id === itemId);
        expect(item).toBeDefined();
        expect(item?.amount).toBe(0);
        expect(item?.isIncluded).toBe(true);
      });
    });

    it('should add costs for non-included items at other venue', () => {
      const inputs = createTestInputs();
      const ourResult = calculateOurVenue(inputs);

      const otherResult = calculateOtherVenue({
        date: inputs.date,
        guests: inputs.guests,
        mealStyle: inputs.mealStyle,
        barService: inputs.barService,
        barDuration: inputs.barDuration,
        categoryCosts: getCategoryCostsFromResult(ourResult),
      });

      const nonIncludedItems = [
        'tablesChairs',
        'coreDecor',
        'externalPlanner',
        'ceremonyAudio',
        'cleaning',
        'setupTeardown',
      ];

      nonIncludedItems.forEach(itemId => {
        const item = otherResult.lineItems.find(i => i.id === itemId);
        expect(item).toBeDefined();
        expect(item?.amount).toBeGreaterThan(0);
      });
    });
  });

  describe('Date-Based Pricing', () => {
    it('should apply different venue fees for different day bands', () => {
      const saturdayInputs = createTestInputs({ date: '2025-06-14' }); // Saturday
      const fridayInputs = createTestInputs({ date: '2025-06-13' }); // Friday
      const tuesdayInputs = createTestInputs({ date: '2025-06-10' }); // Tuesday

      const saturdayResult = calculateOurVenue(saturdayInputs);
      const fridayResult = calculateOurVenue(fridayInputs);
      const tuesdayResult = calculateOurVenue(tuesdayInputs);

      expect(saturdayResult.venueFee).toBe(VENUE_FEES.wilds.saturday_holiday);
      expect(fridayResult.venueFee).toBe(VENUE_FEES.wilds.friday_sunday);
      expect(tuesdayResult.venueFee).toBe(VENUE_FEES.wilds.monday_thursday);

      // Saturday should be most expensive
      expect(saturdayResult.venueFee).toBeGreaterThan(fridayResult.venueFee);
      expect(fridayResult.venueFee).toBeGreaterThan(tuesdayResult.venueFee);
    });

    it('should apply holiday pricing for major holidays', () => {
      // July 4, 2025 is a Friday but should get saturday_holiday pricing
      const holidayInputs = createTestInputs({ date: '2025-07-04' });
      const band = getBand('2025-07-04');

      expect(band).toBe('saturday_holiday');

      const result = calculateOurVenue(holidayInputs);
      expect(result.venueFee).toBe(VENUE_FEES.wilds.saturday_holiday);
    });
  });

  describe('Override Handling', () => {
    it('should apply category overrides correctly', () => {
      const inputs = createTestInputs();
      const result = calculateOurVenue({
        ...inputs,
        overrides: {
          photography: 5000,
          flowers: 4000,
        },
      });

      const photography = result.lineItems.find(i => i.id === 'photography');
      const flowers = result.lineItems.find(i => i.id === 'flowers');

      expect(photography?.amount).toBe(5000);
      expect(flowers?.amount).toBe(4000);
    });

    it('should apply percentage overrides correctly', () => {
      const inputs = createTestInputs();
      const result = calculateOurVenue({
        ...inputs,
        percentages: {
          service: 25,
          tax: 10,
          gratuity: 5,
          contingency: 15,
        },
      });

      // Verify custom percentages are applied
      const expectedService = result.subtotalExVenue * 0.25;
      expect(result.service).toBeCloseTo(expectedService, 2);

      const expectedGratuity = result.subtotalExVenue * 0.05;
      expect(result.gratuity).toBeCloseTo(expectedGratuity, 2);
    });
  });

  describe('Guest Count Variations', () => {
    it('should scale food and bar costs with guest count', () => {
      const inputs100 = createTestInputs({ guests: 100 });
      const inputs200 = createTestInputs({ guests: 200 });

      const result100 = calculateOurVenue(inputs100);
      const result200 = calculateOurVenue(inputs200);

      const food100 = result100.lineItems.find(i => i.id === 'food')?.amount ?? 0;
      const food200 = result200.lineItems.find(i => i.id === 'food')?.amount ?? 0;

      // Food should roughly double with double guests
      expect(food200).toBeCloseTo(food100 * 2, -1);
    });

    it('should clamp out-of-range guest counts', () => {
      const inputsLow = createTestInputs({ guests: 10 });
      const inputsHigh = createTestInputs({ guests: 500 });

      const resultLow = calculateOurVenue(inputsLow);
      const resultHigh = calculateOurVenue(inputsHigh);

      // Results should be calculated with clamped values (25 and 200)
      expect(resultLow.perGuest).toBe(resultLow.total / 25);
      expect(resultHigh.perGuest).toBe(resultHigh.total / 200);
    });
  });

  describe('Meal Style Impact', () => {
    it('should correctly apply meal style pricing differences', () => {
      const buffetInputs = createTestInputs({ mealStyle: 'buffet' });
      const familyInputs = createTestInputs({ mealStyle: 'family' });
      const platedInputs = createTestInputs({ mealStyle: 'plated' });

      const buffetResult = calculateOurVenue(buffetInputs);
      const familyResult = calculateOurVenue(familyInputs);
      const platedResult = calculateOurVenue(platedInputs);

      const buffetFood = buffetResult.lineItems.find(i => i.id === 'food')?.amount ?? 0;
      const familyFood = familyResult.lineItems.find(i => i.id === 'food')?.amount ?? 0;
      const platedFood = platedResult.lineItems.find(i => i.id === 'food')?.amount ?? 0;

      // Family should be $6/guest more than buffet
      expect(familyFood - buffetFood).toBe(150 * 6);

      // Plated should be $12/guest more than buffet
      expect(platedFood - buffetFood).toBe(150 * 12);
    });
  });

  describe('Bar Service Impact', () => {
    it('should correctly apply bar service pricing', () => {
      const cashBarInputs = createTestInputs({ barService: 'cashBar' });
      const premiumInputs = createTestInputs({ barService: 'openBeerWinePremium' });

      const cashBarResult = calculateOurVenue(cashBarInputs);
      const premiumResult = calculateOurVenue(premiumInputs);

      const cashBarCost = cashBarResult.lineItems.find(i => i.id === 'barService')?.amount ?? 0;
      const premiumCost = premiumResult.lineItems.find(i => i.id === 'barService')?.amount ?? 0;

      // Cash bar should be $0
      expect(cashBarCost).toBe(0);

      // Premium should have cost
      expect(premiumCost).toBeGreaterThan(0);
    });
  });

  describe('External Planner', () => {
    it('should add external planner cost when selected', () => {
      const withoutPlanner = calculateOurVenue(createTestInputs({ plannerUsed: false }));
      const withPlanner = calculateOurVenue(createTestInputs({ plannerUsed: true }));

      const plannerItem = withPlanner.lineItems.find(i => i.id === 'externalPlanner');
      const noPlannerItem = withoutPlanner.lineItems.find(i => i.id === 'externalPlanner');

      expect(plannerItem).toBeDefined();
      expect(plannerItem?.amount).toBeGreaterThan(0);
      expect(noPlannerItem).toBeUndefined();

      expect(withPlanner.total).toBeGreaterThan(withoutPlanner.total);
    });
  });
});
