import {
  GUESTS,
  FOOD,
  BAR,
  WEDDING_CATEGORIES,
  EXTERNAL_PLANNER_COST,
  INCLUDED_OUR_VENUE,
  MealStyle,
  BarService,
} from '../../config/config';
import { logger } from './logger';

/**
 * Clamp guest count to valid range
 */
export function clampGuests(guests: number): number {
  if (guests < GUESTS.min) return GUESTS.min;
  if (guests > GUESTS.max) return GUESTS.max;
  return guests;
}

/**
 * Get default food cost based on guests and meal style
 */
export function getDefaultFoodCost(guests: number, mealStyle: MealStyle): number {
  const clampedGuests = clampGuests(guests);
  const baseCost = FOOD.basePerGuest;
  const delta = FOOD.deltasPerGuest[mealStyle];
  const totalPerGuest = baseCost + delta;
  
  logger.debug(`Food cost: ${clampedGuests} guests × $${totalPerGuest}/guest = $${clampedGuests * totalPerGuest}`);
  return clampedGuests * totalPerGuest;
}

/**
 * Get default bar cost for our venues based on selected service and duration
 */
export function getDefaultBarCost(guests: number, barService: BarService, barDuration: number): number {
  const clampedGuests = clampGuests(guests);
  const service = BAR.services.find(s => s.id === barService);
  
  if (!service) {
    logger.warn(`Unknown bar service: ${barService}, using open beer & wine`);
    const defaultService = BAR.services[1];
    const defaultCost = defaultService.perGuestByHour?.[barDuration as keyof typeof defaultService.perGuestByHour] || defaultService.perGuestByHour?.[4] || 0;
    return clampedGuests * defaultCost;
  }
  
  // Cash bar has no per-person cost
  if (service.id === 'cashBar') {
    return 0;
  }
  
  // Get per-guest cost based on duration
  const perGuestCost = service.perGuestByHour?.[barDuration as keyof typeof service.perGuestByHour];
  if (!perGuestCost) {
    logger.warn(`Invalid bar duration: ${barDuration}, using 4 hours`);
    const fallbackCost = service.perGuestByHour?.[4] || 0;
    return clampedGuests * fallbackCost;
  }
  
  logger.debug(`Bar cost: ${clampedGuests} guests × $${perGuestCost}/guest = $${clampedGuests * perGuestCost}`);
  return clampedGuests * perGuestCost;
}

/**
 * Get bar setup fee based on duration
 */
export function getBarSetupFee(barDuration: number): number {
  return BAR.setupFee[barDuration as keyof typeof BAR.setupFee] || BAR.setupFee[4];
}

/**
 * Get default bar cost for other venue (per-guest basis)
 */
export function getDefaultOtherVenueBarCost(guests: number, perGuest: number): number {
  const clampedGuests = clampGuests(guests);
  logger.debug(`Other venue bar cost: ${clampedGuests} guests × $${perGuest}/guest = $${clampedGuests * perGuest}`);
  return clampedGuests * perGuest;
}

/**
 * Get list of items included at our venues
 */
export function getIncludedItems(): string[] {
  return [...INCLUDED_OUR_VENUE];
}

/**
 * Get all default category costs
 */
export function getDefaultCategories() {
  return {
    photography: WEDDING_CATEGORIES.photography,
    videography: WEDDING_CATEGORIES.videography,
    flowers: WEDDING_CATEGORIES.flowers,
    djMusic: WEDDING_CATEGORIES.djMusic,
    invitations: WEDDING_CATEGORIES.invitations,
    transportation: WEDDING_CATEGORIES.transportation,
    hairMakeup: WEDDING_CATEGORIES.hairMakeup,
    cakeDesserts: WEDDING_CATEGORIES.cakeDesserts,
  };
}

/**
 * Get external planner cost
 */
export function getExternalPlannerCost(): number {
  return EXTERNAL_PLANNER_COST;
}

