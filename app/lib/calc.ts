import {
  Venue,
  MealStyle,
  BarService,
  PERCENTAGES,
  OTHER_VENUE_DEFAULTS,
  VENUE_FEES,
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

export interface LineItem {
  name: string;
  amount: number;
  perGuest?: number;
  isIncluded?: boolean; // True if included at our venue
}

export interface CalculationInputs {
  venue: Venue;
  date: string;
  guests: number;
  mealStyle: MealStyle;
  plannerUsed: boolean;
  barService: BarService;
  barDuration: number;
  overrides?: Partial<CategoryOverrides>;
  percentages?: Partial<typeof PERCENTAGES>;
}

export interface CategoryOverrides {
  food: number;
  bar: number;
  photography: number;
  videography: number;
  flowers: number;
  djMusic: number;
  invitations: number;
  transportation: number;
  hairMakeup: number;
  cakeDesserts: number;
  externalPlanner: number;
  tablesChairs: number;
  coreDecor: number;
  dayOfCoordination: number;
  cleaning: number;
}

export interface CalculationResult {
  lineItems: LineItem[];
  venueFee: number;
  subtotalExVenue: number;
  service: number;
  tax: number;
  gratuity: number;
  subtotalWithFees: number;
  contingency: number;
  total: number;
  perGuest: number;
}

export interface OtherVenueInputs {
  date: string;
  guests: number;
  mealStyle: MealStyle;
  barService: BarService;
  barDuration: number;
  overrides?: Partial<OtherVenueOverrides>;
  percentages?: Partial<typeof PERCENTAGES>;
  // Use same food/bar/category costs as our venue for fair comparison
  foodCost: number;
  photographyCost: number;
  videographyCost: number;
  flowersCost: number;
  djMusicCost: number;
  invitationsCost: number;
  transportationCost: number;
  hairMakeupCost: number;
  cakeDesertsCost: number;
}

export interface OtherVenueOverrides {
  venueFee: number;
  barSetupFee: number;
  bar: number;
  tablesChairs: number;
  coreDecor: number;
  dayOfCoordination: number;
  ceremonyAudio: number;
  setupTeardown: number;
  cleaning: number;
  externalPlanner: number;
}

/**
 * Calculate wedding costs for our venue (The Wilds or Laural Mill)
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
    name: 'Venue Fee',
    amount: venueFee,
  });

  // Bar Setup Fee (what we provide)
  const barSetupFee = getBarSetupFee(inputs.barDuration);
  lineItems.push({
    name: 'Bar Setup Fee',
    amount: barSetupFee,
  });

  // Bar Service (what we provide)
  const barCost = inputs.overrides?.bar ?? getDefaultBarCost(clampedGuests, inputs.barService, inputs.barDuration);
  lineItems.push({
    name: 'Bar Service',
    amount: barCost,
    perGuest: barCost / clampedGuests,
  });

  // Items included at our venue (always $0, ignore overrides) - show our value first
  lineItems.push({
    name: 'Tables & Chairs',
    amount: 0,
    isIncluded: true,
  });
  
  lineItems.push({
    name: 'Core Décor',
    amount: 0,
    isIncluded: true,
  });
  
  lineItems.push({
    name: 'Day-of Coordination',
    amount: 0,
    isIncluded: true,
  });
  
  lineItems.push({
    name: 'Cleaning',
    amount: 0,
    isIncluded: true,
  });

  // Food (external vendor)
  const foodCost = inputs.overrides?.food ?? getDefaultFoodCost(clampedGuests, inputs.mealStyle);
  lineItems.push({
    name: 'Food & Catering',
    amount: foodCost,
    perGuest: foodCost / clampedGuests,
  });

  // Additional categories
  const categories = getDefaultCategories();
  
  lineItems.push({
    name: 'Photography',
    amount: inputs.overrides?.photography ?? categories.photography.default,
  });
  
  lineItems.push({
    name: 'Videography',
    amount: inputs.overrides?.videography ?? categories.videography.default,
  });
  
  lineItems.push({
    name: 'Flowers & Décor',
    amount: inputs.overrides?.flowers ?? categories.flowers.default,
  });
  
  lineItems.push({
    name: 'DJ/Music',
    amount: inputs.overrides?.djMusic ?? categories.djMusic.default,
  });
  
  lineItems.push({
    name: 'Invitations',
    amount: inputs.overrides?.invitations ?? categories.invitations.default,
  });
  
  lineItems.push({
    name: 'Transportation',
    amount: inputs.overrides?.transportation ?? categories.transportation.default,
  });
  
  lineItems.push({
    name: 'Hair & Makeup',
    amount: inputs.overrides?.hairMakeup ?? categories.hairMakeup.default,
  });
  
  lineItems.push({
    name: 'Cake & Desserts',
    amount: inputs.overrides?.cakeDesserts ?? categories.cakeDesserts.default,
  });

  // External planner (if selected)
  if (inputs.plannerUsed) {
    lineItems.push({
      name: 'External Planner',
      amount: inputs.overrides?.externalPlanner ?? getExternalPlannerCost(),
    });
  }

  const subtotalExVenue = lineItems
    .filter(item => item.name !== 'Venue Fee')
    .reduce((sum, item) => sum + item.amount, 0);
  logger.debug(`Subtotal (excluding venue): $${subtotalExVenue}`);

  const serviceSubtotal = subtotalExVenue;
  logger.debug(`Our venue service subtotal (all non-venue items): $${serviceSubtotal}`);

  // Apply service % to specific categories only
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
 * Calculate wedding costs for a typical "Other Venue"
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
    name: 'Venue Fee',
    amount: venueFee,
  });

  // Food (same as our venue)
  lineItems.push({
    name: 'Food & Catering',
    amount: inputs.foodCost,
    perGuest: inputs.foodCost / clampedGuests,
  });

  // Bar Setup Fee (same as our venue)
  const barSetupFee = inputs.overrides?.barSetupFee ?? getBarSetupFee(inputs.barDuration);
  lineItems.push({
    name: 'Bar Setup Fee',
    amount: barSetupFee,
  });

  // Bar Service (same as our venue)
  const barCost = inputs.overrides?.bar ?? getDefaultBarCost(clampedGuests, inputs.barService, inputs.barDuration);
  lineItems.push({
    name: 'Bar Service',
    amount: barCost,
    perGuest: barCost / clampedGuests,
  });

  // Same additional categories as our venue
  lineItems.push({
    name: 'Photography',
    amount: inputs.photographyCost,
  });
  
  lineItems.push({
    name: 'Videography',
    amount: inputs.videographyCost,
  });
  
  lineItems.push({
    name: 'Flowers & Décor',
    amount: inputs.flowersCost,
  });
  
  lineItems.push({
    name: 'DJ/Music',
    amount: inputs.djMusicCost,
  });
  
  lineItems.push({
    name: 'Invitations',
    amount: inputs.invitationsCost,
  });
  
  lineItems.push({
    name: 'Transportation',
    amount: inputs.transportationCost,
  });
  
  lineItems.push({
    name: 'Hair & Makeup',
    amount: inputs.hairMakeupCost,
  });
  
  lineItems.push({
    name: 'Cake & Desserts',
    amount: inputs.cakeDesertsCost,
  });

  // Add items that are included at our venues but cost extra at other venues
  // These will show as $0 for our venues but with costs for other venues
  lineItems.push({
    name: 'Tables & Chairs Rental',
    amount: inputs.overrides?.tablesChairs ?? OTHER_VENUE_DEFAULTS.tablesChairs,
    isIncluded: false, // Not included at other venues
  });

  lineItems.push({
    name: 'Basic Décor Rentals',
    amount: inputs.overrides?.coreDecor ?? OTHER_VENUE_DEFAULTS.coreDecor,
    isIncluded: false, // Not included at other venues
  });

  lineItems.push({
    name: 'External Planner/DOC',
    amount: inputs.overrides?.externalPlanner ?? getExternalPlannerCost(),
    isIncluded: false, // Not included at other venues
  });

  lineItems.push({
    name: 'Ceremony Audio',
    amount: inputs.overrides?.ceremonyAudio ?? OTHER_VENUE_DEFAULTS.ceremonyAudio,
    isIncluded: false,
  });

  lineItems.push({
    name: 'Cleaning',
    amount: inputs.overrides?.cleaning ?? OTHER_VENUE_DEFAULTS.cleaning,
    isIncluded: false, // Not included at other venues
  });

  lineItems.push({
    name: 'Setup/Teardown',
    amount: inputs.overrides?.setupTeardown ?? OTHER_VENUE_DEFAULTS.setupTeardown,
    isIncluded: false,
  });

  // Calculate subtotal for service fee (other venue - includes bar costs)
  const otherVenueServiceFeeCategories = [
    'Food & Catering',
    'Bar Setup Fee',
    'Bar Service', 
    'Photography',
    'Videography',
    'Flowers & Décor',
    'DJ/Music',
    'Transportation',
    'Hair & Makeup',
    'Cake & Desserts'
  ];
  
  const serviceSubtotal = lineItems
    .filter(item => otherVenueServiceFeeCategories.includes(item.name))
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
    .filter(item => item.name !== 'Venue Fee')
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

