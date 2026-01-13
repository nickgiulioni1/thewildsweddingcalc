import { describe, it, expect } from 'vitest';
import { getBand } from '../app/lib/dateBand';
import { getVenueFee } from '../app/lib/venueFees';
import { clampGuests, getDefaultFoodCost } from '../app/lib/defaults';
import { calculateOurVenue, calculateOtherVenue } from '../app/lib/calc';
import { generateCSVSingle, generateCSVComparison } from '../app/lib/exports';
import { isHoliday } from '../app/lib/holidays';
import { VENUE_FEES } from '../config/config';

describe('Wedding Cost Estimator - Calculations', () => {
  describe('Test 1: Venue fee mapping & guest bounds', () => {
    it('should return correct venue fees for saturday_holiday band', () => {
      expect(getVenueFee('wilds', 'saturday_holiday')).toBe(8000);
      expect(getVenueFee('laural', 'saturday_holiday')).toBe(5000);
    });

    it('should map Saturday to saturday_holiday band', () => {
      // May 24, 2025 is a Saturday
      expect(getBand('2025-05-24')).toBe('saturday_holiday');
    });

    it('should map Friday to friday_sunday band', () => {
      // May 23, 2025 is a Friday
      expect(getBand('2025-05-23')).toBe('friday_sunday');
    });

    it('should map Sunday to friday_sunday band', () => {
      // May 25, 2025 is a Sunday
      expect(getBand('2025-05-25')).toBe('friday_sunday');
    });

    it('should map weekday to monday_thursday band', () => {
      // May 20, 2025 is a Tuesday
      expect(getBand('2025-05-20')).toBe('monday_thursday');
    });

    it('should clamp guest count below minimum to 25', () => {
      expect(clampGuests(20)).toBe(25);
      expect(clampGuests(10)).toBe(25);
    });

    it('should clamp guest count above maximum to 200', () => {
      expect(clampGuests(250)).toBe(200);
      expect(clampGuests(300)).toBe(200);
    });

    it('should use default guest count of 150', () => {
      // This is validated through the calculation functions using defaults
      expect(clampGuests(150)).toBe(150);
    });
  });

  describe('Test 2: Service/Tax exclude venue fee', () => {
    it('should apply service and tax only to subtotal (not venue fee)', () => {
      const result = calculateOurVenue({
        venue: 'wilds',
        date: '2025-05-20', // Monday - $6,000 venue fee
        guests: 150,
        mealStyle: 'buffet',
        plannerUsed: false,
        barService: 'openBeerWinePremium',
        barDuration: 4,
        percentages: {
          service: 20,
          tax: 7,
          gratuity: 0,
          contingency: 10,
        },
      });

      // Verify venue fee is separate
      expect(result.venueFee).toBe(6000);

      // Service should be 20% of subtotalExVenue (NOT including venue fee)
      const expectedService = result.subtotalExVenue * 0.20;
      expect(result.service).toBeCloseTo(expectedService, 2);

      // Tax should be 7% of (subtotalExVenue + service), NOT including venue fee
      const taxBase = result.subtotalExVenue + result.service;
      const expectedTax = taxBase * 0.07;
      expect(result.tax).toBeCloseTo(expectedTax, 2);

      // Gratuity should apply to same base as service (0% in this test)
      expect(result.gratuity).toBe(0);

      // Contingency applied at end to everything (including venue fee)
      const subtotalWithFees = result.subtotalExVenue + result.service + result.tax + result.gratuity + result.venueFee;
      expect(result.subtotalWithFees).toBeCloseTo(subtotalWithFees, 2);
      
      const expectedContingency = subtotalWithFees * 0.10;
      expect(result.contingency).toBeCloseTo(expectedContingency, 2);

      const expectedTotal = subtotalWithFees + expectedContingency;
      expect(result.total).toBeCloseTo(expectedTotal, 2);
    });

    it('should apply gratuity to same base as service', () => {
      const result = calculateOurVenue({
        venue: 'laural',
        date: '2025-06-06', // Friday
        guests: 100,
        mealStyle: 'buffet',
        plannerUsed: false,
        barService: 'openBeerWine',
    barDuration: 4,
        percentages: {
          service: 20,
          tax: 7,
          gratuity: 5, // 5% gratuity
          contingency: 10,
        },
      });

      // Gratuity should be 5% of subtotalExVenue (same base as service)
      const expectedGratuity = result.subtotalExVenue * 0.05;
      expect(result.gratuity).toBeCloseTo(expectedGratuity, 2);
    });
  });

  describe('Test 3: Meal style deltas', () => {
    it('should add $6/guest when switching from buffet to family style', () => {
      const buffetCost = getDefaultFoodCost(150, 'buffet');
      const familyCost = getDefaultFoodCost(150, 'family');
      
      expect(familyCost - buffetCost).toBe(150 * 6);
    });

    it('should add $12/guest when switching from buffet to plated', () => {
      const buffetCost = getDefaultFoodCost(150, 'buffet');
      const platedCost = getDefaultFoodCost(150, 'plated');
      
      expect(platedCost - buffetCost).toBe(150 * 12);
    });

    it('should reflect meal style delta in full calculation', () => {
      const buffetResult = calculateOurVenue({
        venue: 'wilds',
        date: '2025-05-24',
        guests: 100,
        mealStyle: 'buffet',
        plannerUsed: false,
        barService: 'openBeerWine',
    barDuration: 4,
      });

      const platedResult = calculateOurVenue({
        venue: 'wilds',
        date: '2025-05-24',
        guests: 100,
        mealStyle: 'plated',
        plannerUsed: false,
        barService: 'openBeerWine',
    barDuration: 4,
      });

      // Find food line items
      const buffetFood = buffetResult.lineItems.find(i => i.id === 'food');
      const platedFood = platedResult.lineItems.find(i => i.id === 'food');

      expect(buffetFood).toBeDefined();
      expect(platedFood).toBeDefined();
      if (buffetFood && platedFood) {
        expect(platedFood.amount - buffetFood.amount).toBe(100 * 12);
      }
    });
  });

  describe('Test 4: Other Venue comparison', () => {
    it('should set Other venue fee to Wilds fee - $1,000 for same date', () => {
      const date = '2025-05-24'; // Saturday
      const band = getBand(date);
      const wildsFee = VENUE_FEES.wilds[band];
      
      const ourResult = calculateOurVenue({
        venue: 'wilds',
        date,
        guests: 150,
        mealStyle: 'buffet',
        plannerUsed: false,
        barService: 'openBeerWine',
    barDuration: 4,
      });

      const otherResult = calculateOtherVenue({
        date,
        guests: 150,
        mealStyle: 'buffet',
        barService: 'openBeerWine',
        barDuration: 4,
        categoryCosts: {
          food: ourResult.lineItems.find(i => i.id === 'food')?.amount ?? 0,
          photography: ourResult.lineItems.find(i => i.id === 'photography')?.amount ?? 0,
          videography: ourResult.lineItems.find(i => i.id === 'videography')?.amount ?? 0,
          flowers: ourResult.lineItems.find(i => i.id === 'flowers')?.amount ?? 0,
          djMusic: ourResult.lineItems.find(i => i.id === 'djMusic')?.amount ?? 0,
          invitations: ourResult.lineItems.find(i => i.id === 'invitations')?.amount ?? 0,
          transportation: ourResult.lineItems.find(i => i.id === 'transportation')?.amount ?? 0,
          hairMakeup: ourResult.lineItems.find(i => i.id === 'hairMakeup')?.amount ?? 0,
          cakeDesserts: ourResult.lineItems.find(i => i.id === 'cakeDesserts')?.amount ?? 0,
        },
      });

      expect(otherResult.venueFee).toBe(wildsFee - 1000);
    });

    it('should auto-add 6 rental/service items at Other Venue', () => {
      const ourResult = calculateOurVenue({
        venue: 'wilds',
        date: '2025-05-24',
        guests: 150,
        mealStyle: 'buffet',
        plannerUsed: false,
        barService: 'openBeerWine',
    barDuration: 4,
      });

      const otherResult = calculateOtherVenue({
        date: '2025-05-24',
        guests: 150,
        mealStyle: 'buffet',
        barService: 'openBeerWine',
        barDuration: 4,
        categoryCosts: {
          food: ourResult.lineItems.find(i => i.id === 'food')?.amount ?? 0,
          photography: ourResult.lineItems.find(i => i.id === 'photography')?.amount ?? 0,
          videography: ourResult.lineItems.find(i => i.id === 'videography')?.amount ?? 0,
          flowers: ourResult.lineItems.find(i => i.id === 'flowers')?.amount ?? 0,
          djMusic: ourResult.lineItems.find(i => i.id === 'djMusic')?.amount ?? 0,
          invitations: ourResult.lineItems.find(i => i.id === 'invitations')?.amount ?? 0,
          transportation: ourResult.lineItems.find(i => i.id === 'transportation')?.amount ?? 0,
          hairMakeup: ourResult.lineItems.find(i => i.id === 'hairMakeup')?.amount ?? 0,
          cakeDesserts: ourResult.lineItems.find(i => i.id === 'cakeDesserts')?.amount ?? 0,
        },
      });

      // Check for the 6 items that are NOT included at Other Venue
      const expectedItems = [
        'tablesChairs',
        'coreDecor',
        'externalPlanner',
        'ceremonyAudio',
        'cleaning',
        'setupTeardown',
      ];

      expectedItems.forEach(itemId => {
        const item = otherResult.lineItems.find(i => i.id === itemId);
        expect(item).toBeDefined();
        if (item) {
          expect(item.amount).toBeGreaterThan(0);
        }
      });
    });

    it('should result in Other total > Our total with defaults', () => {
      const ourResult = calculateOurVenue({
        venue: 'wilds',
        date: '2025-05-24',
        guests: 150,
        mealStyle: 'buffet',
        plannerUsed: false,
        barService: 'openBeerWine',
    barDuration: 4,
      });

      const otherResult = calculateOtherVenue({
        date: '2025-05-24',
        guests: 150,
        mealStyle: 'buffet',
        barService: 'openBeerWine',
        barDuration: 4,
        categoryCosts: {
          food: ourResult.lineItems.find(i => i.id === 'food')?.amount ?? 0,
          photography: ourResult.lineItems.find(i => i.id === 'photography')?.amount ?? 0,
          videography: ourResult.lineItems.find(i => i.id === 'videography')?.amount ?? 0,
          flowers: ourResult.lineItems.find(i => i.id === 'flowers')?.amount ?? 0,
          djMusic: ourResult.lineItems.find(i => i.id === 'djMusic')?.amount ?? 0,
          invitations: ourResult.lineItems.find(i => i.id === 'invitations')?.amount ?? 0,
          transportation: ourResult.lineItems.find(i => i.id === 'transportation')?.amount ?? 0,
          hairMakeup: ourResult.lineItems.find(i => i.id === 'hairMakeup')?.amount ?? 0,
          cakeDesserts: ourResult.lineItems.find(i => i.id === 'cakeDesserts')?.amount ?? 0,
        },
      });

      expect(otherResult.total).toBeGreaterThan(ourResult.total);
    });
  });

  describe('Test 5: Export format', () => {
    it('should generate proper CSV for single venue', () => {
      const result = calculateOurVenue({
        venue: 'wilds',
        date: '2025-05-24',
        guests: 150,
        mealStyle: 'buffet',
        plannerUsed: false,
        barService: 'openBeerWine',
    barDuration: 4,
      });

      const csv = generateCSVSingle('The Wilds', result, 150);

      // Check for required headers
      expect(csv).toContain('Wedding Cost Estimate');
      expect(csv).toContain('Venue: The Wilds');
      expect(csv).toContain('Guest Count: 150');
      expect(csv).toContain('Category,Amount,Per Guest');
      expect(csv).toContain('TOTAL');
    });

    it('should generate proper CSV for comparison mode', () => {
      const ourResult = calculateOurVenue({
        venue: 'wilds',
        date: '2025-05-24',
        guests: 150,
        mealStyle: 'buffet',
        plannerUsed: false,
        barService: 'openBeerWine',
    barDuration: 4,
      });

      const otherResult = calculateOtherVenue({
        date: '2025-05-24',
        guests: 150,
        mealStyle: 'buffet',
        barService: 'openBeerWine',
        barDuration: 4,
        categoryCosts: {
          food: ourResult.lineItems.find(i => i.id === 'food')?.amount ?? 0,
          photography: ourResult.lineItems.find(i => i.id === 'photography')?.amount ?? 0,
          videography: ourResult.lineItems.find(i => i.id === 'videography')?.amount ?? 0,
          flowers: ourResult.lineItems.find(i => i.id === 'flowers')?.amount ?? 0,
          djMusic: ourResult.lineItems.find(i => i.id === 'djMusic')?.amount ?? 0,
          invitations: ourResult.lineItems.find(i => i.id === 'invitations')?.amount ?? 0,
          transportation: ourResult.lineItems.find(i => i.id === 'transportation')?.amount ?? 0,
          hairMakeup: ourResult.lineItems.find(i => i.id === 'hairMakeup')?.amount ?? 0,
          cakeDesserts: ourResult.lineItems.find(i => i.id === 'cakeDesserts')?.amount ?? 0,
        },
      });

      const csv = generateCSVComparison('The Wilds', ourResult, otherResult, 150);

      // Check for required headers
      expect(csv).toContain('Wedding Cost Estimate - Comparison');
      expect(csv).toContain('Our Venue: The Wilds');
      expect(csv).toContain('Guest Count: 150');
      expect(csv).toContain('Difference (Other - Ours)');
      expect(csv).toContain('TOTAL');
    });
  });

  describe('Test 6: Holiday detection', () => {
    describe('Fixed date holidays', () => {
      it('should recognize New Year\'s Day', () => {
        expect(isHoliday('2025-01-01')).toBe(true);
        expect(isHoliday('2026-01-01')).toBe(true);
      });

      it('should recognize Independence Day', () => {
        expect(isHoliday('2025-07-04')).toBe(true);
        expect(isHoliday('2026-07-04')).toBe(true);
      });

      it('should recognize Christmas', () => {
        expect(isHoliday('2025-12-25')).toBe(true);
        expect(isHoliday('2026-12-25')).toBe(true);
      });

      it('should recognize New Year\'s Eve', () => {
        expect(isHoliday('2025-12-31')).toBe(true);
        expect(isHoliday('2026-12-31')).toBe(true);
      });
    });

    describe('Floating holidays', () => {
      it('should recognize Memorial Day (last Monday of May)', () => {
        // 2025: May 26 is Memorial Day
        expect(isHoliday('2025-05-26')).toBe(true);
        // 2026: May 25 is Memorial Day
        expect(isHoliday('2026-05-25')).toBe(true);
        // Non-Memorial Day dates in May
        expect(isHoliday('2025-05-25')).toBe(false);
        expect(isHoliday('2025-05-19')).toBe(false);
      });

      it('should recognize Labor Day (first Monday of September)', () => {
        // 2025: September 1 is Labor Day
        expect(isHoliday('2025-09-01')).toBe(true);
        // 2026: September 7 is Labor Day
        expect(isHoliday('2026-09-07')).toBe(true);
        // Non-Labor Day dates in September
        expect(isHoliday('2025-09-08')).toBe(false);
        expect(isHoliday('2026-09-01')).toBe(false);
      });

      it('should recognize Thanksgiving (fourth Thursday of November)', () => {
        // 2025: November 27 is Thanksgiving
        expect(isHoliday('2025-11-27')).toBe(true);
        // 2026: November 26 is Thanksgiving
        expect(isHoliday('2026-11-26')).toBe(true);
        // Non-Thanksgiving dates in November
        expect(isHoliday('2025-11-20')).toBe(false);
        expect(isHoliday('2025-11-28')).toBe(false);
      });
    });

    describe('Non-holiday dates', () => {
      it('should not recognize regular dates as holidays', () => {
        expect(isHoliday('2025-03-15')).toBe(false);
        expect(isHoliday('2025-06-20')).toBe(false);
        expect(isHoliday('2025-10-10')).toBe(false);
      });
    });

    describe('Holiday pricing band', () => {
      it('should return saturday_holiday band for holidays regardless of day of week', () => {
        // July 4, 2025 is a Friday - but should still be saturday_holiday band
        expect(getBand('2025-07-04')).toBe('saturday_holiday');
        // Christmas 2025 is a Thursday
        expect(getBand('2025-12-25')).toBe('saturday_holiday');
        // Memorial Day 2025 is a Monday
        expect(getBand('2025-05-26')).toBe('saturday_holiday');
        // Labor Day 2025 is a Monday
        expect(getBand('2025-09-01')).toBe('saturday_holiday');
        // Thanksgiving 2025 is a Thursday
        expect(getBand('2025-11-27')).toBe('saturday_holiday');
      });
    });
  });

  describe('Test 7: Edge cases', () => {
    it('should handle empty date string gracefully in getBand', () => {
      // Should not throw, should return a default band
      expect(() => getBand('')).not.toThrow();
    });

    it('should handle zero guests in clampGuests', () => {
      expect(clampGuests(0)).toBe(25); // Should clamp to minimum
    });

    it('should handle negative guests in clampGuests', () => {
      expect(clampGuests(-10)).toBe(25); // Should clamp to minimum
    });

    it('should handle NaN food cost calculation', () => {
      const cost = getDefaultFoodCost(NaN, 'buffet');
      expect(Number.isNaN(cost)).toBe(true);
    });
  });
});

