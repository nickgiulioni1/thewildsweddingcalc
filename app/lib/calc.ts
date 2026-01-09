/**
 * Wedding Cost Calculator - Core Calculation Module
 *
 * This module contains the main calculation logic for estimating wedding costs
 * at The Wilds and Laural Mill venues, as well as comparison with typical "other venues".
 *
 * ## Calculation Order
 * The calculations follow a specific order to ensure accurate totals:
 * 1. Line items calculated (food, bar, photography, etc.)
 * 2. Venue fee applied (separate from service percentage)
 * 3. Service % applied to line items ONLY (not venue fee)
 * 4. Tax % applied to (line items + service)
 * 5. Gratuity % applied to line items only
 * 6. Subtotal with fees = line items + venue fee + service + tax + gratuity
 * 7. Contingency % applied to subtotal
 * 8. Final total = subtotal with fees + contingency
 *
 * @module calc
 */

import {
  Venue,
  MealStyle,
  BarService,
  PERCENTAGES,
  OTHER_VENUE_DEFAULTS,
  VENUE_FEES,
  WEDDING_CATEGORIES,
  OTHER_VENUE_CATEGORIES,
} from '../../config/config';
import { getBand } from './dateBand';
import { getVenueFee } from './venueFees';
import {
  clampGuests,
  getDefaultFoodCost,
  getDefaultBarCost,
  getBarSetupFee,
  getDefaultCategories,
  getExternalPlannerCost,
} from './defaults';
import { logger } from './logger';

/** Wedding category identifier type */
export type WeddingCategoryId = keyof typeof WEDDING_CATEGORIES;

/**
 * All possible line item identifiers used in calculation results.
 * Includes venue fees, bar costs, standard wedding categories, and other venue extras.
 */
export type LineItemId =
  | 'venueFee'
  | 'barSetupFee'
  | 'barService'
  | WeddingCategoryId
  | 'tablesChairs'
  | 'coreDecor'
  | 'dayOfCoordination'
  | 'cleaning'
  | 'ceremonyAudio'
  | 'setupTeardown'
  | 'externalPlanner';

/**
 * Represents a single line item in the cost breakdown.
 * Line items are individual expenses that make up the wedding budget.
 */
export interface LineItem {
  /** Unique identifier for this line item */
  id: LineItemId;
  /** Human-readable display name */
  name: string;
  /** Total cost for this line item */
  amount: number;
  /** Per-guest cost (if applicable) */
  perGuest?: number;
  /** Whether this item is included at our venue (shows as $0) */
  isIncluded?: boolean;
}

/**
 * Input parameters for calculating costs at our venues (The Wilds or Laural Mill).
 */
export interface CalculationInputs {
  /** Which venue to calculate for */
  venue: Venue;
  /** Wedding date in ISO format (YYYY-MM-DD) */
  date: string;
  /** Expected number of guests (will be clamped to valid range) */
  guests: number;
  /** Selected meal service style */
  mealStyle: MealStyle;
  /** Whether an external planner is being used */
  plannerUsed: boolean;
  /** Selected bar service type */
  barService: BarService;
  /** Bar service duration in hours (1-6) */
  barDuration: number;
  /** User-specified cost overrides for categories */
  overrides?: Partial<CategoryOverrides>;
  /** User-specified percentage overrides */
  percentages?: Partial<typeof PERCENTAGES>;
}

/**
 * User-customizable cost overrides for wedding categories.
 * When provided, these values replace the calculated defaults.
 */
export interface CategoryOverrides {
  /** Food and catering total */
  food: number;
  /** Bar service total (excluding setup fee) */
  bar: number;
  /** Photography services */
  photography: number;
  /** Videography services */
  videography: number;
  /** Flowers and décor */
  flowers: number;
  /** DJ and music entertainment */
  djMusic: number;
  /** Invitations and stationery */
  invitations: number;
  /** Guest transportation */
  transportation: number;
  /** Hair and makeup services */
  hairMakeup: number;
  /** Cake and desserts */
  cakeDesserts: number;
  /** External wedding planner */
  externalPlanner: number;
  /** Tables and chairs rental */
  tablesChairs: number;
  /** Core venue décor */
  coreDecor: number;
  /** Day-of coordination services */
  dayOfCoordination: number;
  /** Post-event cleaning */
  cleaning: number;
}

/**
 * Complete calculation result with all cost components.
 */
export interface CalculationResult {
  /** All individual line items */
  lineItems: LineItem[];
  /** Venue rental fee */
  venueFee: number;
  /** Subtotal of all items excluding venue fee */
  subtotalExVenue: number;
  /** Calculated service fee */
  service: number;
  /** Calculated tax amount */
  tax: number;
  /** Calculated gratuity amount */
  gratuity: number;
  /** Subtotal including venue fee and all fees (before contingency) */
  subtotalWithFees: number;
  /** Contingency buffer amount */
  contingency: number;
  /** Final total estimate */
  total: number;
  /** Cost per guest */
  perGuest: number;
}

/**
 * Input parameters for calculating costs at a typical "other venue".
 * Used for side-by-side comparison to demonstrate value.
 */
export interface OtherVenueInputs {
  /** Wedding date in ISO format (YYYY-MM-DD) */
  date: string;
  /** Expected number of guests */
  guests: number;
  /** Selected meal service style */
  mealStyle: MealStyle;
  /** Selected bar service type */
  barService: BarService;
  /** Bar service duration in hours */
  barDuration: number;
  /** User-specified cost overrides */
  overrides?: Partial<OtherVenueOverrides>;
  /** User-specified percentage overrides */
  percentages?: Partial<typeof PERCENTAGES>;
  /**
   * Category costs to use from our venue calculation.
   * Ensures fair comparison by using same base costs.
   */
  categoryCosts: Record<WeddingCategoryId, number>;
}

/**
 * User-customizable cost overrides specific to other venues.
 * These represent items that are typically not included at other venues.
 */
export interface OtherVenueOverrides {
  /** Other venue rental fee */
  venueFee: number;
  /** Bar setup and breakdown fee */
  barSetupFee: number;
  /** Bar service total */
  bar: number;
  /** Tables and chairs rental */
  tablesChairs: number;
  /** Core venue décor */
  coreDecor: number;
  /** Day-of coordination (not included) */
  dayOfCoordination: number;
  /** Ceremony audio equipment */
  ceremonyAudio: number;
  /** Setup and teardown labor */
  setupTeardown: number;
  /** Post-event cleaning */
  cleaning: number;
  /** External planner (required at other venues) */
  externalPlanner: number;
}

/**
 * Calculates wedding costs for our venue (The Wilds or Laural Mill).
 *
 * This function computes a complete cost breakdown including:
 * - Venue fee based on date and day of week
 * - Food and catering costs based on guest count and meal style
 * - Bar service costs based on duration and service level
 * - Additional wedding categories (photography, flowers, etc.)
 * - Service fees, taxes, gratuity, and contingency buffer
 *
 * Items included at our venues (tables, chairs, décor, coordination, cleaning)
 * are shown as $0 to highlight the value proposition.
 *
 * @param inputs - Calculation parameters including venue, date, guests, and options
 * @returns Complete calculation result with line items and totals
 *
 * @example
 * ```typescript
 * const result = calculateOurVenue({
 *   venue: 'wilds',
 *   date: '2025-06-15',
 *   guests: 150,
 *   mealStyle: 'plated',
 *   plannerUsed: false,
 *   barService: 'openBeerWinePremium',
 *   barDuration: 4,
 * });
 * console.log(`Total: $${result.total}`);
 * ```
 */
export function calculateOurVenue(inputs: CalculationInputs): CalculationResult {
  logger.debug('Calculating costs for our venue:', inputs.venue);

  const clampedGuests = clampGuests(inputs.guests);
  const band = getBand(inputs.date);
  const venueFee = getVenueFee(inputs.venue, band);

  // Get percentages (use defaults if not provided)
  const percentages = { ...PERCENTAGES, ...inputs.percentages };

  // Build line items - start with venue fee
  const lineItems: LineItem[] = [];

  // Venue Fee (first item)
  lineItems.push({
    id: 'venueFee',
    name: 'Venue Fee',
    amount: venueFee,
  });

  // Bar Setup Fee (what we provide)
  const barSetupFee = getBarSetupFee(inputs.barDuration);
  lineItems.push({
    id: 'barSetupFee',
    name: OTHER_VENUE_CATEGORIES.barSetupFee.name,
    amount: barSetupFee,
  });

  // Bar Service (what we provide)
  const barCost = inputs.overrides?.bar ?? getDefaultBarCost(clampedGuests, inputs.barService, inputs.barDuration);
  lineItems.push({
    id: 'barService',
    name: OTHER_VENUE_CATEGORIES.barService.name,
    amount: barCost,
    perGuest: barCost / clampedGuests,
  });

  // Items included at our venue (always $0, ignore overrides) - show our value first
  lineItems.push({
    id: 'tablesChairs',
    name: OTHER_VENUE_CATEGORIES.tablesChairs.name,
    amount: 0,
    isIncluded: true,
  });

  lineItems.push({
    id: 'coreDecor',
    name: OTHER_VENUE_CATEGORIES.coreDecor.name,
    amount: 0,
    isIncluded: true,
  });

  lineItems.push({
    id: 'dayOfCoordination',
    name: OTHER_VENUE_CATEGORIES.dayOfCoordination.name,
    amount: 0,
    isIncluded: true,
  });

  lineItems.push({
    id: 'cleaning',
    name: OTHER_VENUE_CATEGORIES.cleaning.name,
    amount: 0,
    isIncluded: true,
  });

  // Food (external vendor)
  const foodCost = inputs.overrides?.food ?? getDefaultFoodCost(clampedGuests, inputs.mealStyle);
  lineItems.push({
    id: 'food',
    name: WEDDING_CATEGORIES.food.name,
    amount: foodCost,
    perGuest: foodCost / clampedGuests,
  });

  // Additional categories
  const categories = getDefaultCategories();

  lineItems.push({
    id: 'photography',
    name: categories.photography.name,
    amount: inputs.overrides?.photography ?? categories.photography.default,
  });

  lineItems.push({
    id: 'videography',
    name: categories.videography.name,
    amount: inputs.overrides?.videography ?? categories.videography.default,
  });

  lineItems.push({
    id: 'flowers',
    name: categories.flowers.name,
    amount: inputs.overrides?.flowers ?? categories.flowers.default,
  });

  lineItems.push({
    id: 'djMusic',
    name: categories.djMusic.name,
    amount: inputs.overrides?.djMusic ?? categories.djMusic.default,
  });

  lineItems.push({
    id: 'invitations',
    name: categories.invitations.name,
    amount: inputs.overrides?.invitations ?? categories.invitations.default,
  });

  lineItems.push({
    id: 'transportation',
    name: categories.transportation.name,
    amount: inputs.overrides?.transportation ?? categories.transportation.default,
  });

  lineItems.push({
    id: 'hairMakeup',
    name: categories.hairMakeup.name,
    amount: inputs.overrides?.hairMakeup ?? categories.hairMakeup.default,
  });

  lineItems.push({
    id: 'cakeDesserts',
    name: categories.cakeDesserts.name,
    amount: inputs.overrides?.cakeDesserts ?? categories.cakeDesserts.default,
  });

  // External planner (if selected)
  if (inputs.plannerUsed) {
    lineItems.push({
      id: 'externalPlanner',
      name: OTHER_VENUE_CATEGORIES.externalPlanner.name,
      amount: inputs.overrides?.externalPlanner ?? getExternalPlannerCost(),
    });
  }

  // Calculate subtotal excluding venue fee
  const subtotalExVenue = lineItems
    .filter(item => item.id !== 'venueFee')
    .reduce((sum, item) => sum + item.amount, 0);
  logger.debug(`Subtotal (excluding venue): $${subtotalExVenue}`);

  const serviceSubtotal = subtotalExVenue;
  logger.debug(`Our venue service subtotal (all non-venue items): $${serviceSubtotal}`);

  // Apply service % to specific categories only (not venue fee)
  const service = (serviceSubtotal * percentages.service) / 100;
  logger.debug(`Service (${percentages.service}% of $${serviceSubtotal}): $${service}`);

  // Apply tax % to (service subtotal + service), NOT to venue fee
  const taxBase = serviceSubtotal + service;
  const tax = (taxBase * percentages.tax) / 100;
  logger.debug(`Tax (${percentages.tax}% of $${taxBase}): $${tax}`);

  // Apply gratuity % to same base as service (service subtotal only)
  const gratuity = (serviceSubtotal * percentages.gratuity) / 100;
  logger.debug(`Gratuity (${percentages.gratuity}% of $${serviceSubtotal}): $${gratuity}`);

  // Subtotal with all fees (but before contingency)
  const subtotalWithFees = subtotalExVenue + venueFee + service + tax + gratuity;
  logger.debug(`Subtotal with fees: $${subtotalWithFees}`);

  // Apply contingency % to everything
  const contingency = (subtotalWithFees * percentages.contingency) / 100;
  logger.debug(`Contingency (${percentages.contingency}% of $${subtotalWithFees}): $${contingency}`);

  // Final total
  const total = subtotalWithFees + contingency;
  const perGuest = total / clampedGuests;

  logger.debug(`Total: $${total} ($${perGuest.toFixed(2)}/guest)`);

  return {
    lineItems,
    venueFee,
    subtotalExVenue,
    service,
    tax,
    gratuity,
    subtotalWithFees,
    contingency,
    total,
    perGuest,
  };
}

/**
 * Calculates wedding costs for a typical "other venue".
 *
 * This function estimates costs at a venue that doesn't include the amenities
 * provided by The Wilds and Laural Mill. It's used for side-by-side comparison
 * to demonstrate the value proposition of our venues.
 *
 * Key differences from our venue calculation:
 * - Venue fee defaults to Wilds fee minus $1,000
 * - Adds costs for items included at our venues:
 *   - Tables & Chairs ($1,500)
 *   - Core Décor ($1,200)
 *   - External Planner/DOC ($2,000)
 *   - Ceremony Audio ($500)
 *   - Cleaning ($350)
 *   - Setup/Teardown ($750)
 *
 * Food and bar costs are kept the same as our venue for fair comparison.
 *
 * @param inputs - Calculation parameters including date, guests, and category costs
 * @returns Complete calculation result with line items and totals
 *
 * @example
 * ```typescript
 * const otherResult = calculateOtherVenue({
 *   date: '2025-06-15',
 *   guests: 150,
 *   mealStyle: 'plated',
 *   barService: 'openBeerWinePremium',
 *   barDuration: 4,
 *   categoryCosts: {
 *     food: 7800,
 *     photography: 2000,
 *     // ... other categories from our venue calculation
 *   },
 * });
 * ```
 */
export function calculateOtherVenue(inputs: OtherVenueInputs): CalculationResult {
  logger.debug('Calculating costs for Other Venue');

  const clampedGuests = clampGuests(inputs.guests);
  const band = getBand(inputs.date);

  // Other venue fee = Wilds fee - $1,000 (for same date/band)
  const wildsFee = VENUE_FEES.wilds[band];
  const venueFee = inputs.overrides?.venueFee ?? (wildsFee - 1000);
  logger.debug(`Other venue fee: $${venueFee} (Wilds fee $${wildsFee} - $1,000)`);

  // Get percentages (use defaults if not provided)
  const percentages = { ...PERCENTAGES, ...inputs.percentages };

  // Build line items - start with venue fee
  const lineItems: LineItem[] = [];

  // Venue Fee (first item)
  lineItems.push({
    id: 'venueFee',
    name: 'Venue Fee',
    amount: venueFee,
  });

  // Food (same as our venue)
  lineItems.push({
    id: 'food',
    name: WEDDING_CATEGORIES.food.name,
    amount: inputs.categoryCosts.food,
    perGuest: inputs.categoryCosts.food / clampedGuests,
  });

  // Bar Setup Fee (same as our venue)
  const barSetupFee = inputs.overrides?.barSetupFee ?? getBarSetupFee(inputs.barDuration);
  lineItems.push({
    id: 'barSetupFee',
    name: OTHER_VENUE_CATEGORIES.barSetupFee.name,
    amount: barSetupFee,
  });

  // Bar Service (same as our venue)
  const barCost = inputs.overrides?.bar ?? getDefaultBarCost(clampedGuests, inputs.barService, inputs.barDuration);
  lineItems.push({
    id: 'barService',
    name: OTHER_VENUE_CATEGORIES.barService.name,
    amount: barCost,
    perGuest: barCost / clampedGuests,
  });

  // Same additional categories as our venue
  lineItems.push({
    id: 'photography',
    name: WEDDING_CATEGORIES.photography.name,
    amount: inputs.categoryCosts.photography,
  });

  lineItems.push({
    id: 'videography',
    name: WEDDING_CATEGORIES.videography.name,
    amount: inputs.categoryCosts.videography,
  });

  lineItems.push({
    id: 'flowers',
    name: WEDDING_CATEGORIES.flowers.name,
    amount: inputs.categoryCosts.flowers,
  });

  lineItems.push({
    id: 'djMusic',
    name: WEDDING_CATEGORIES.djMusic.name,
    amount: inputs.categoryCosts.djMusic,
  });

  lineItems.push({
    id: 'invitations',
    name: WEDDING_CATEGORIES.invitations.name,
    amount: inputs.categoryCosts.invitations,
  });

  lineItems.push({
    id: 'transportation',
    name: WEDDING_CATEGORIES.transportation.name,
    amount: inputs.categoryCosts.transportation,
  });

  lineItems.push({
    id: 'hairMakeup',
    name: WEDDING_CATEGORIES.hairMakeup.name,
    amount: inputs.categoryCosts.hairMakeup,
  });

  lineItems.push({
    id: 'cakeDesserts',
    name: WEDDING_CATEGORIES.cakeDesserts.name,
    amount: inputs.categoryCosts.cakeDesserts,
  });

  // Add items that are included at our venues but cost extra at other venues
  lineItems.push({
    id: 'tablesChairs',
    name: OTHER_VENUE_CATEGORIES.tablesChairs.name,
    amount: inputs.overrides?.tablesChairs ?? OTHER_VENUE_DEFAULTS.tablesChairs,
    isIncluded: false,
  });

  lineItems.push({
    id: 'coreDecor',
    name: OTHER_VENUE_CATEGORIES.coreDecor.name,
    amount: inputs.overrides?.coreDecor ?? OTHER_VENUE_DEFAULTS.coreDecor,
    isIncluded: false,
  });

  lineItems.push({
    id: 'externalPlanner',
    name: OTHER_VENUE_CATEGORIES.externalPlanner.name,
    amount: inputs.overrides?.externalPlanner ?? getExternalPlannerCost(),
    isIncluded: false,
  });

  lineItems.push({
    id: 'ceremonyAudio',
    name: OTHER_VENUE_CATEGORIES.ceremonyAudio.name,
    amount: inputs.overrides?.ceremonyAudio ?? OTHER_VENUE_DEFAULTS.ceremonyAudio,
    isIncluded: false,
  });

  lineItems.push({
    id: 'cleaning',
    name: OTHER_VENUE_CATEGORIES.cleaning.name,
    amount: inputs.overrides?.cleaning ?? OTHER_VENUE_DEFAULTS.cleaning,
    isIncluded: false,
  });

  lineItems.push({
    id: 'setupTeardown',
    name: OTHER_VENUE_CATEGORIES.setupTeardown.name,
    amount: inputs.overrides?.setupTeardown ?? OTHER_VENUE_DEFAULTS.setupTeardown,
    isIncluded: false,
  });

  // Calculate subtotal for service fee (other venue - includes bar costs)
  const otherVenueServiceFeeCategories: LineItemId[] = [
    'food',
    'barSetupFee',
    'barService',
    'photography',
    'videography',
    'flowers',
    'djMusic',
    'transportation',
    'hairMakeup',
    'cakeDesserts',
  ];

  const serviceSubtotal = lineItems
    .filter(item => otherVenueServiceFeeCategories.includes(item.id))
    .reduce((sum, item) => sum + item.amount, 0);
  logger.debug(`Other venue service subtotal (${otherVenueServiceFeeCategories.join(', ')}): $${serviceSubtotal}`);

  // Apply service % to specific categories only
  const service = (serviceSubtotal * percentages.service) / 100;
  logger.debug(`Service: $${service}`);

  // Apply tax % to (service subtotal + service), NOT to venue fee
  const taxBase = serviceSubtotal + service;
  const tax = (taxBase * percentages.tax) / 100;
  logger.debug(`Tax: $${tax}`);

  // Apply gratuity % to same base as service (service subtotal only)
  const gratuity = (serviceSubtotal * percentages.gratuity) / 100;
  logger.debug(`Gratuity: $${gratuity}`);

  // Calculate total of all non-venue line items
  const subtotalExVenue = lineItems
    .filter(item => item.id !== 'venueFee')
    .reduce((sum, item) => sum + item.amount, 0);
  logger.debug(`Other venue subtotal (excluding venue): $${subtotalExVenue}`);

  // Subtotal with all fees (but before contingency)
  const subtotalWithFees = subtotalExVenue + venueFee + service + tax + gratuity;
  logger.debug(`Subtotal with fees: $${subtotalWithFees}`);

  // Apply contingency % to everything
  const contingency = (subtotalWithFees * percentages.contingency) / 100;
  logger.debug(`Contingency: $${contingency}`);

  // Final total
  const total = subtotalWithFees + contingency;
  const perGuest = total / clampedGuests;

  logger.debug(`Other venue total: $${total} ($${perGuest.toFixed(2)}/guest)`);

  return {
    lineItems,
    venueFee,
    subtotalExVenue,
    service,
    tax,
    gratuity,
    subtotalWithFees,
    contingency,
    total,
    perGuest,
  };
}
