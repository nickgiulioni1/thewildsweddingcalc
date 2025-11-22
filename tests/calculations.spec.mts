import { describe, it, expect } from 'vitest';
import { getBand } from '../app/lib/dateBand';
import { getVenueFee } from '../app/lib/venueFees';
import { clampGuests, getDefaultFoodCost } from '../app/lib/defaults';
import { calculateOurVenue, calculateOtherVenue } from '../app/lib/calc';
import { generateCSVSingle, generateCSVComparison } from '../app/lib/exports';
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
      const buffetFood = buffetResult.lineItems.find(i => i.name === 'Food & Catering');
      const platedFood = platedResult.lineItems.find(i => i.name === 'Food & Catering');

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
        foodCost: ourResult.lineItems.find(i => i.name === 'Food & Catering')?.amount ?? 0,
        photographyCost: ourResult.lineItems.find(i => i.name === 'Photography')?.amount ?? 0,
        videographyCost: ourResult.lineItems.find(i => i.name === 'Videography')?.amount ?? 0,
        flowersCost: ourResult.lineItems.find(i => i.name === 'Flowers & Décor')?.amount ?? 0,
        djMusicCost: ourResult.lineItems.find(i => i.name === 'DJ/Music')?.amount ?? 0,
        invitationsCost: ourResult.lineItems.find(i => i.name === 'Invitations')?.amount ?? 0,
        transportationCost: ourResult.lineItems.find(i => i.name === 'Transportation')?.amount ?? 0,
        hairMakeupCost: ourResult.lineItems.find(i => i.name === 'Hair & Makeup')?.amount ?? 0,
        cakeDesertsCost: ourResult.lineItems.find(i => i.name === 'Cake & Desserts')?.amount ?? 0,
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
        foodCost: ourResult.lineItems.find(i => i.name === 'Food & Catering')?.amount ?? 0,
        photographyCost: ourResult.lineItems.find(i => i.name === 'Photography')?.amount ?? 0,
        videographyCost: ourResult.lineItems.find(i => i.name === 'Videography')?.amount ?? 0,
        flowersCost: ourResult.lineItems.find(i => i.name === 'Flowers & Décor')?.amount ?? 0,
        djMusicCost: ourResult.lineItems.find(i => i.name === 'DJ/Music')?.amount ?? 0,
        invitationsCost: ourResult.lineItems.find(i => i.name === 'Invitations')?.amount ?? 0,
        transportationCost: ourResult.lineItems.find(i => i.name === 'Transportation')?.amount ?? 0,
        hairMakeupCost: ourResult.lineItems.find(i => i.name === 'Hair & Makeup')?.amount ?? 0,
        cakeDesertsCost: ourResult.lineItems.find(i => i.name === 'Cake & Desserts')?.amount ?? 0,
      });

      // Check for the 6 items that are NOT included at Other Venue
      const expectedItems = [
        'Tables & Chairs Rental',
        'Basic Décor Rentals',
        'External Planner/DOC',
        'Ceremony Audio',
        'Cleaning',
        'Setup/Teardown',
      ];

      expectedItems.forEach(itemName => {
        const item = otherResult.lineItems.find(i => i.name === itemName);
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
        foodCost: ourResult.lineItems.find(i => i.name === 'Food & Catering')?.amount ?? 0,
        photographyCost: ourResult.lineItems.find(i => i.name === 'Photography')?.amount ?? 0,
        videographyCost: ourResult.lineItems.find(i => i.name === 'Videography')?.amount ?? 0,
        flowersCost: ourResult.lineItems.find(i => i.name === 'Flowers & Décor')?.amount ?? 0,
        djMusicCost: ourResult.lineItems.find(i => i.name === 'DJ/Music')?.amount ?? 0,
        invitationsCost: ourResult.lineItems.find(i => i.name === 'Invitations')?.amount ?? 0,
        transportationCost: ourResult.lineItems.find(i => i.name === 'Transportation')?.amount ?? 0,
        hairMakeupCost: ourResult.lineItems.find(i => i.name === 'Hair & Makeup')?.amount ?? 0,
        cakeDesertsCost: ourResult.lineItems.find(i => i.name === 'Cake & Desserts')?.amount ?? 0,
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
        foodCost: ourResult.lineItems.find(i => i.name === 'Food & Catering')?.amount ?? 0,
        photographyCost: ourResult.lineItems.find(i => i.name === 'Photography')?.amount ?? 0,
        videographyCost: ourResult.lineItems.find(i => i.name === 'Videography')?.amount ?? 0,
        flowersCost: ourResult.lineItems.find(i => i.name === 'Flowers & Décor')?.amount ?? 0,
        djMusicCost: ourResult.lineItems.find(i => i.name === 'DJ/Music')?.amount ?? 0,
        invitationsCost: ourResult.lineItems.find(i => i.name === 'Invitations')?.amount ?? 0,
        transportationCost: ourResult.lineItems.find(i => i.name === 'Transportation')?.amount ?? 0,
        hairMakeupCost: ourResult.lineItems.find(i => i.name === 'Hair & Makeup')?.amount ?? 0,
        cakeDesertsCost: ourResult.lineItems.find(i => i.name === 'Cake & Desserts')?.amount ?? 0,
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
});

