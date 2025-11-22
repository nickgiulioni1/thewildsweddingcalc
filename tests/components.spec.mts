import { describe, it, expect } from 'vitest';
import { validateDate, validatePercentage, validateGuestCount, clamp } from '../app/lib/validation';
import { GUESTS } from '../config/config';

describe('Wedding Cost Estimator - Component Tests', () => {
  describe('Validation Utilities', () => {
    describe('Date Validation', () => {
      it('should reject empty dates', () => {
        const result = validateDate('');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('required');
      });

      it('should reject invalid date formats', () => {
        const result = validateDate('2025-13-45');
        expect(result.isValid).toBe(false);
      });

      it('should reject past dates', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const pastDate = yesterday.toISOString().split('T')[0];
        
        const result = validateDate(pastDate);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('past');
      });

      it('should accept valid future dates', () => {
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + 6);
        const dateString = futureDate.toISOString().split('T')[0];
        
        const result = validateDate(dateString);
        expect(result.isValid).toBe(true);
      });

      it('should reject dates too far in the future', () => {
        const farFuture = new Date();
        farFuture.setFullYear(farFuture.getFullYear() + 11);
        const dateString = farFuture.toISOString().split('T')[0];
        
        const result = validateDate(dateString);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('10 years');
      });
    });

    describe('Percentage Validation', () => {
      it('should reject NaN values', () => {
        const result = validatePercentage(NaN);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('number');
      });

      it('should reject negative values by default', () => {
        const result = validatePercentage(-5);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('negative');
      });

      it('should accept negative values when allowed', () => {
        const result = validatePercentage(-5, false, true);
        expect(result.isValid).toBe(true);
      });

      it('should reject values over 100% by default', () => {
        const result = validatePercentage(150);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('100%');
      });

      it('should accept values over 100% when allowed', () => {
        const result = validatePercentage(150, true);
        expect(result.isValid).toBe(true);
      });

      it('should accept valid percentages', () => {
        const result = validatePercentage(20);
        expect(result.isValid).toBe(true);
      });
    });

    describe('Guest Count Validation', () => {
      it('should reject NaN values', () => {
        const result = validateGuestCount(NaN, GUESTS.min, GUESTS.max);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('number');
      });

      it('should reject values below minimum', () => {
        const result = validateGuestCount(20, GUESTS.min, GUESTS.max);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('at least');
      });

      it('should reject values above maximum', () => {
        const result = validateGuestCount(250, GUESTS.min, GUESTS.max);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('exceed');
      });

      it('should accept valid guest counts', () => {
        const result = validateGuestCount(150, GUESTS.min, GUESTS.max);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle division by zero for guest count', () => {
      // This should be prevented by validation, but test the clamp function
      const clamped = clamp(0, GUESTS.min, GUESTS.max);
      expect(clamped).toBe(GUESTS.min);
    });

    it('should handle very large percentage values', () => {
      const result = validatePercentage(1000, true);
      expect(result.isValid).toBe(true);
    });

    it('should handle invalid date strings gracefully', () => {
      const result = validateDate('not-a-date');
      expect(result.isValid).toBe(false);
    });
  });
});

