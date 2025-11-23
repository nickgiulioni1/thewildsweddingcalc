import { useState, useEffect, useCallback } from 'preact/hooks';
import { MealStyle, BarService, GUESTS, PERCENTAGES, WEDDING_CATEGORIES, OTHER_VENUE_DEFAULTS, EXTERNAL_PLANNER_COST } from '../../config/config';
import { calculateOurVenue, calculateOtherVenue, CalculationResult, CategoryOverrides, OtherVenueOverrides } from '../lib/calc';
import { validateDate, validatePercentage, validateGuestCount, clamp, isValidNumber } from '../lib/validation';
import { logger } from '../lib/logger';
import { loadState, saveState } from '../lib/storage';

export interface ValidationErrors {
  dateError: string | null;
  guestsError: string | null;
  guestsClamped: boolean;
  serviceError: string | null;
  taxError: string | null;
  gratuityError: string | null;
  contingencyError: string | null;
}

interface UseWeddingCalculatorReturn {
  // Input state
  date: string;
  guests: number;
  mealStyle: MealStyle;
  barService: BarService;
  barDuration: number;
  compareMode: boolean;
  plannerUsed: boolean;
  service: number;
  tax: number;
  gratuity: number;
  contingency: number;
  overrides: Partial<CategoryOverrides>;
  otherVenueOverrides: Partial<OtherVenueOverrides>;
  
  // Validation errors
  validation: ValidationErrors;
  setValidation: (value: ValidationErrors | ((prev: ValidationErrors) => ValidationErrors)) => void;
  
  // Results
  wildsResult: CalculationResult | null;
  lauralResult: CalculationResult | null;
  otherResult: CalculationResult | null;
  
  // Setters
  setDate: (date: string) => void;
  setGuests: (guests: number) => void;
  setMealStyle: (style: MealStyle) => void;
  setBarService: (service: BarService) => void;
  setBarDuration: (duration: number) => void;
  setCompareMode: (mode: boolean) => void;
  setPlannerUsed: (used: boolean) => void;
  setService: (service: number) => void;
  setTax: (tax: number) => void;
  setGratuity: (gratuity: number) => void;
  setContingency: (contingency: number) => void;
  setOverrides: (value: Partial<CategoryOverrides> | ((prev: Partial<CategoryOverrides>) => Partial<CategoryOverrides>)) => void;
  setOtherVenueOverrides: (value: Partial<OtherVenueOverrides> | ((prev: Partial<OtherVenueOverrides>) => Partial<OtherVenueOverrides>)) => void;
}

function getDefaultDate(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 6);
  return date.toISOString().split('T')[0];
}

function getDefaultOverrides(): Partial<CategoryOverrides> {
  const defaults: Partial<CategoryOverrides> = {};
  
  Object.entries(WEDDING_CATEGORIES).forEach(([key, category]) => {
    if (key !== 'food') {
      (defaults as Record<string, number>)[key] = category.default;
    }
  });
  
  Object.entries(OTHER_VENUE_DEFAULTS).forEach(([key, value]) => {
    (defaults as Record<string, number>)[key] = value;
  });
  
  defaults.externalPlanner = EXTERNAL_PLANNER_COST;
  
  return defaults;
}

export function useWeddingCalculator(): UseWeddingCalculatorReturn {
  const savedState = loadState();

  const initialGuests = clamp(savedState?.guests ?? GUESTS.default, GUESTS.min, GUESTS.max);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Input state
  const [date, setDate] = useState<string>(savedState?.date || getDefaultDate());
  const [guests, setGuestsState] = useState<number>(initialGuests);
  const [guestsWereClamped, setGuestsWereClamped] = useState<boolean>(false);
  const [mealStyle, setMealStyle] = useState<MealStyle>((savedState?.mealStyle as MealStyle) || 'buffet');
  const [barService, setBarService] = useState<BarService>((savedState?.barService as BarService) || 'openBeerWinePremium');
  const [barDuration, setBarDuration] = useState<number>(savedState?.barDuration ?? 4);
  const [compareMode, setCompareMode] = useState<boolean>(savedState?.compareMode ?? true);
  const [plannerUsed, setPlannerUsed] = useState<boolean>(savedState?.plannerUsed ?? false);
  const [service, setService] = useState<number>(savedState?.service ?? PERCENTAGES.service);
  const [tax, setTax] = useState<number>(savedState?.tax ?? PERCENTAGES.tax);
  const [gratuity, setGratuity] = useState<number>(savedState?.gratuity ?? PERCENTAGES.gratuity);
  const [contingency, setContingency] = useState<number>(savedState?.contingency ?? PERCENTAGES.contingency);
  
  // Validation errors - using object to allow direct updates
  const [validation, setValidation] = useState<ValidationErrors>({
    dateError: null,
    guestsError: null,
    guestsClamped: false,
    serviceError: null,
    taxError: null,
    gratuityError: null,
    contingencyError: null,
  });
  
  // Overrides
  const [overrides, setOverrides] = useState<Partial<CategoryOverrides>>(
    savedState?.overrides || getDefaultOverrides()
  );
  const [otherVenueOverrides, setOtherVenueOverrides] = useState<Partial<OtherVenueOverrides>>(
    savedState?.otherVenueOverrides || {}
  );
  
  // Results
  const [wildsResult, setWildsResult] = useState<CalculationResult | null>(null);
  const [lauralResult, setLauralResult] = useState<CalculationResult | null>(null);
  const [otherResult, setOtherResult] = useState<CalculationResult | null>(null);

  useEffect(() => {
    setHasHydrated(true);
  }, []);
  
  // Calculations
  useEffect(() => {
    logger.debug('Recalculating costs');
    
    try {
      // Validate inputs
      const dateValidation = validateDate(date);
      if (!dateValidation.isValid) {
        setValidation(prev => ({ ...prev, dateError: dateValidation.error || null }));
        setWildsResult(null);
        setLauralResult(null);
        setOtherResult(null);
        return;
      }

      // Validate percentages
      const serviceValidation = validatePercentage(service);
      const taxValidation = validatePercentage(tax);
      const gratuityValidation = validatePercentage(gratuity);
      const contingencyValidation = validatePercentage(contingency, true);
      
      setValidation(prev => ({
        ...prev,
        dateError: null,
        serviceError: serviceValidation.isValid ? null : (serviceValidation.error || null),
        taxError: taxValidation.isValid ? null : (taxValidation.error || null),
        gratuityError: gratuityValidation.isValid ? null : (gratuityValidation.error || null),
        contingencyError: contingencyValidation.isValid ? null : (contingencyValidation.error || null),
      }));

      if (!serviceValidation.isValid || !taxValidation.isValid || !gratuityValidation.isValid || !contingencyValidation.isValid) {
        setWildsResult(null);
        setLauralResult(null);
        setOtherResult(null);
        return;
      }

      // Validate guests
      const clampedGuests = clamp(guests, GUESTS.min, GUESTS.max);
      const guestsValidation = validateGuestCount(clampedGuests, GUESTS.min, GUESTS.max);
      setValidation(prev => ({
        ...prev,
        guestsClamped: guestsWereClamped || clampedGuests !== guests,
        guestsError: guestsValidation.isValid ? null : (guestsValidation.error || null),
      }));
      
      if (!guestsValidation.isValid || !isValidNumber(clampedGuests) || clampedGuests === 0) {
        setWildsResult(null);
        setLauralResult(null);
        setOtherResult(null);
        return;
      }

      const percentages = { service, tax, gratuity, contingency };
      
      // Calculate both venues
      const wildsCalc = calculateOurVenue({
        venue: 'wilds',
        date,
        guests: clampedGuests,
        mealStyle,
        plannerUsed,
        barService,
        barDuration,
        percentages,
        overrides,
      });
      setWildsResult(wildsCalc);

      const lauralCalc = calculateOurVenue({
        venue: 'laural',
        date,
        guests: clampedGuests,
        mealStyle,
        plannerUsed,
        barService,
        barDuration,
        percentages,
        overrides,
      });
      setLauralResult(lauralCalc);

      // Calculate other venue if compare mode is on
      if (compareMode) {
        const lineItemsMap = new Map<string, number>();
        wildsCalc.lineItems.forEach(item => {
          lineItemsMap.set(item.name, item.amount);
        });
        
        const otherCalc = calculateOtherVenue({
          date,
          guests: clampedGuests,
          mealStyle,
          barService,
          barDuration,
          percentages,
          overrides: { ...overrides, ...otherVenueOverrides },
          foodCost: lineItemsMap.get('Food & Catering') ?? 0,
          photographyCost: lineItemsMap.get('Photography') ?? 0,
          videographyCost: lineItemsMap.get('Videography') ?? 0,
          flowersCost: lineItemsMap.get('Flowers & Décor') ?? 0,
          djMusicCost: lineItemsMap.get('DJ/Music') ?? 0,
          invitationsCost: lineItemsMap.get('Invitations') ?? 0,
          transportationCost: lineItemsMap.get('Transportation') ?? 0,
          hairMakeupCost: lineItemsMap.get('Hair & Makeup') ?? 0,
          cakeDesertsCost: lineItemsMap.get('Cake & Desserts') ?? 0,
        });
        setOtherResult(otherCalc);
      } else {
        setOtherResult(null);
      }
    } catch (error) {
      logger.error('Error calculating costs:', error);
      setWildsResult(null);
      setLauralResult(null);
      setOtherResult(null);
    }
  }, [date, guests, guestsWereClamped, mealStyle, barService, barDuration, compareMode, plannerUsed, service, tax, gratuity, contingency, overrides, otherVenueOverrides]);

  // Save state to localStorage
  useEffect(() => {
    if (!hasHydrated) return;

    saveState({
      date,
      guests,
      mealStyle,
      barService,
      barDuration,
      compareMode,
      plannerUsed,
      service,
      tax,
      gratuity,
      contingency,
      overrides,
      otherVenueOverrides,
    });
  }, [barDuration, barService, compareMode, contingency, date, guests, gratuity, hasHydrated, mealStyle, otherVenueOverrides, overrides, plannerUsed, service, tax]);

  const setGuests = useCallback((value: number) => {
    const clamped = clamp(value, GUESTS.min, GUESTS.max);
    setGuestsState(clamped);
    setGuestsWereClamped(clamped !== value);

    saveState({
      date,
      guests: clamped,
      mealStyle,
      barService,
      barDuration,
      compareMode,
      plannerUsed,
      service,
      tax,
      gratuity,
      contingency,
      overrides,
      otherVenueOverrides,
    });
  }, [barDuration, barService, compareMode, contingency, date, gratuity, mealStyle, otherVenueOverrides, overrides, plannerUsed, service, tax]);

  return {
    date,
    guests,
    mealStyle,
    barService,
    barDuration,
    compareMode,
    plannerUsed,
    service,
    tax,
    gratuity,
    contingency,
    overrides,
    otherVenueOverrides,
    validation,
    setValidation,
    wildsResult,
    lauralResult,
    otherResult,
    setDate,
    setGuests,
    setMealStyle,
    setBarService,
    setBarDuration,
    setCompareMode,
    setPlannerUsed,
    setService,
    setTax,
    setGratuity,
    setContingency,
    setOverrides,
    setOtherVenueOverrides,
  };
}

