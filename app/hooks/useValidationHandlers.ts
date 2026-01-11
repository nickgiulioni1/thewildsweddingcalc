import { useCallback } from 'preact/hooks';
import { GUESTS } from '../../config/config';
import { validateDate, validatePercentage, validateGuestCount, clamp } from '../lib/validation';

interface ValidationState {
  setDateError: (error: string | null) => void;
  setGuestsError: (error: string | null) => void;
  setGuestsClamped: (clamped: boolean) => void;
  setServiceError: (error: string | null) => void;
  setTaxError: (error: string | null) => void;
  setGratuityError: (error: string | null) => void;
  setContingencyError: (error: string | null) => void;
}

interface ValidationHandlers {
  onDateChange: (newDate: string) => void;
  onGuestsChange: (newGuests: number) => void;
  onServiceChange: (newService: number) => void;
  onTaxChange: (newTax: number) => void;
  onGratuityChange: (newGratuity: number) => void;
  onContingencyChange: (newContingency: number) => void;
}

export function useValidationHandlers(
  setters: {
    setDate: (date: string) => void;
    setGuests: (guests: number) => void;
    setService: (service: number) => void;
    setTax: (tax: number) => void;
    setGratuity: (gratuity: number) => void;
    setContingency: (contingency: number) => void;
  },
  validation: ValidationState
): ValidationHandlers {
  const onDateChange = useCallback((newDate: string) => {
    setters.setDate(newDate);
    const validationResult = validateDate(newDate);
    validation.setDateError(validationResult.isValid ? null : (validationResult.error || null));
  }, [setters.setDate, validation.setDateError]);

  const onGuestsChange = useCallback((newGuests: number) => {
    setters.setGuests(newGuests);
    const clamped = clamp(newGuests, GUESTS.min, GUESTS.max);
    validation.setGuestsClamped(clamped !== newGuests);
    const validationResult = validateGuestCount(clamped, GUESTS.min, GUESTS.max);
    validation.setGuestsError(validationResult.isValid ? null : (validationResult.error || null));
  }, [setters.setGuests, validation.setGuestsError, validation.setGuestsClamped]);

  const onServiceChange = useCallback((newService: number) => {
    setters.setService(newService);
    const validationResult = validatePercentage(newService);
    validation.setServiceError(validationResult.isValid ? null : (validationResult.error || null));
  }, [setters.setService, validation.setServiceError]);

  const onTaxChange = useCallback((newTax: number) => {
    setters.setTax(newTax);
    const validationResult = validatePercentage(newTax);
    validation.setTaxError(validationResult.isValid ? null : (validationResult.error || null));
  }, [setters.setTax, validation.setTaxError]);

  const onGratuityChange = useCallback((newGratuity: number) => {
    setters.setGratuity(newGratuity);
    const validationResult = validatePercentage(newGratuity);
    validation.setGratuityError(validationResult.isValid ? null : (validationResult.error || null));
  }, [setters.setGratuity, validation.setGratuityError]);

  const onContingencyChange = useCallback((newContingency: number) => {
    setters.setContingency(newContingency);
    const validationResult = validatePercentage(newContingency, true); // Allow >100%
    validation.setContingencyError(validationResult.isValid ? null : (validationResult.error || null));
  }, [setters.setContingency, validation.setContingencyError]);

  return {
    onDateChange,
    onGuestsChange,
    onServiceChange,
    onTaxChange,
    onGratuityChange,
    onContingencyChange,
  };
}

