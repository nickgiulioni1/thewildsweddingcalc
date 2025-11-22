/**
 * Input validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate a date string (ISO format YYYY-MM-DD)
 */
export function validateDate(dateString: string): ValidationResult {
  if (!dateString || dateString.trim() === '') {
    return { isValid: false, error: 'Date is required' };
  }

  // Check ISO format (YYYY-MM-DD)
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoDateRegex.test(dateString)) {
    return { isValid: false, error: 'Date must be in YYYY-MM-DD format' };
  }

  // Parse the date
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  // Check if date is valid
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return { isValid: false, error: 'Invalid date' };
  }

  // Check if date is in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inputDate = new Date(dateString);
  inputDate.setHours(0, 0, 0, 0);

  if (inputDate < today) {
    return { isValid: false, error: 'Date cannot be in the past' };
  }

  // Check if date is too far in the future (e.g., 10 years)
  const maxFutureDate = new Date();
  maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 10);
  if (inputDate > maxFutureDate) {
    return { isValid: false, error: 'Date cannot be more than 10 years in the future' };
  }

  return { isValid: true };
}

/**
 * Validate a percentage value (0-100, or optionally allow higher)
 */
export function validatePercentage(
  value: number,
  allowOver100 = false,
  allowNegative = false
): ValidationResult {
  if (isNaN(value)) {
    return { isValid: false, error: 'Percentage must be a number' };
  }

  if (!allowNegative && value < 0) {
    return { isValid: false, error: 'Percentage cannot be negative' };
  }

  if (!allowOver100 && value > 100) {
    return { isValid: false, error: 'Percentage cannot exceed 100%' };
  }

  return { isValid: true };
}

/**
 * Validate a guest count (must be within min-max range)
 */
export function validateGuestCount(
  guests: number,
  min: number,
  max: number
): ValidationResult {
  if (isNaN(guests)) {
    return { isValid: false, error: 'Guest count must be a number' };
  }

  if (guests < min) {
    return { isValid: false, error: `Guest count must be at least ${min}` };
  }

  if (guests > max) {
    return { isValid: false, error: `Guest count cannot exceed ${max}` };
  }

  return { isValid: true };
}

/**
 * Check if a number is valid (not NaN or Infinity)
 */
export function isValidNumber(value: number): boolean {
  return !isNaN(value) && isFinite(value);
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  if (isNaN(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

