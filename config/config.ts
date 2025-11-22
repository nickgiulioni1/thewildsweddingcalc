// All configurable constants and defaults for the wedding cost estimator

export const GUESTS = {
  min: 25,
  max: 200,
  default: 150,
};

export type MealStyle = 'buffet' | 'family' | 'plated';

// Base food cost per guest and deltas for different meal styles
export const FOOD = {
  basePerGuest: 40, // Buffet base cost
  deltasPerGuest: {
    buffet: 0,
    family: 6,
    plated: 12,
  } as Record<MealStyle, number>,
};

export type BarService = 'cashBar' | 'openBeerWine' | 'openBeerWinePremium' | 'openBeerWineElite';

export const BAR = {
  setupFee: {
    1: 200,
    2: 200, 
    3: 300,
    4: 400,
    5: 500,
    6: 600,
  },
  services: [
    { 
      id: 'cashBar' as BarService, 
      label: 'Cash Bar', 
      description: 'Guests pay for their own drinks',
      perGuest: 0 // No per-person cost for cash bar
    },
    { 
      id: 'openBeerWine' as BarService, 
      label: 'Open Beer & Wine', 
      description: 'Choose up to 6 selections from beer, wine, seltzer, cider',
      perGuestByHour: {
        1: 12.50,
        2: 15,
        3: 17.50,
        4: 20,
        5: 22.50,
        6: 25,
      }
    },
    { 
      id: 'openBeerWinePremium' as BarService, 
      label: 'Open Beer, Wine & Premium Spirits', 
      description: 'Beer, wine, seltzer, cider + Premium Spirits included',
      perGuestByHour: {
        1: 16,
        2: 19.50,
        3: 23,
        4: 26,
        5: 29,
        6: 32,
      }
    },
    { 
      id: 'openBeerWineElite' as BarService, 
      label: 'Open Beer, Wine & Elite Spirits', 
      description: 'Beer, wine, seltzer, cider + Elite Spirits included',
      perGuestByHour: {
        1: 20,
        2: 23.50,
        3: 27,
        4: 30,
        5: 33,
        6: 36,
      }
    },
  ],
  otherVenuePerGuestDefault: 35, // Default per-guest cost for other venues
};

export type Venue = 'wilds' | 'laural';
export type DayBand = 'monday_thursday' | 'friday_sunday' | 'saturday_holiday';

// Venue fees by venue and day band
export const VENUE_FEES: Record<Venue, Record<DayBand, number>> = {
  wilds: {
    monday_thursday: 6000,
    friday_sunday: 7000,
    saturday_holiday: 8000,
  },
  laural: {
    monday_thursday: 3500,
    friday_sunday: 4200,
    saturday_holiday: 5000,
  },
};

// Additional wedding categories with Indianapolis-based defaults
export const WEDDING_CATEGORIES = {
  food: { name: 'Food & Catering', default: 0 }, // Will be calculated based on guests and meal style
  photography: { name: 'Photography', default: 2000 },
  videography: { name: 'Videography', default: 1800 },
  flowers: { name: 'Flowers & Décor', default: 3500 },
  djMusic: { name: 'DJ/Music', default: 1500 },
  invitations: { name: 'Invitations', default: 550 },
  transportation: { name: 'Transportation', default: 400 },
  hairMakeup: { name: 'Hair & Makeup', default: 600 },
  cakeDesserts: { name: 'Cake & Desserts', default: 800 },
};

// External planner cost (our venues include planning/DOC at $0)
export const EXTERNAL_PLANNER_COST = 2000;

// Items included at our venues (always $0 unless user overrides)
export const INCLUDED_OUR_VENUE = [
  'Tables & Chairs',
  'Core Décor',
  'Day-of Coordination',
  'Cleaning',
];

// Typical non-included costs at Other Venue (editable defaults)
export const OTHER_VENUE_DEFAULTS = {
  tablesChairs: 1500,
  coreDecor: 1200,
  dayOfCoordination: 2000,
  ceremonyAudio: 500,
  setupTeardown: 750,
  cleaning: 350,
};

// Other Venue specific categories (user can override these when comparing)
export const OTHER_VENUE_CATEGORIES = {
  venueFee: { name: 'Venue Fee', tooltip: 'Typical venue rental fee (defaults to $1,000 less than The Wilds for same date)' },
  barSetupFee: { name: 'Bar Setup Fee', tooltip: 'One-time bar setup and breakdown fee' },
  barService: { name: 'Bar Service', tooltip: 'Per-guest bar service cost based on duration and service level' },
  tablesChairs: { name: 'Tables & Chairs', tooltip: 'Rental cost for tables, chairs, and linens (included at our venues)' },
  coreDecor: { name: 'Core Décor', tooltip: 'Basic venue décor and setup (included at our venues)' },
  dayOfCoordination: { name: 'Day-of Coordination', tooltip: 'Professional coordination on wedding day (included at our venues)' },
  ceremonyAudio: { name: 'Ceremony Audio', tooltip: 'Audio support for ceremony at other venues' },
  setupTeardown: { name: 'Setup/Teardown', tooltip: 'Labor for event setup and teardown at other venues' },
  cleaning: { name: 'Cleaning', tooltip: 'Post-event cleaning and restoration (included at our venues)' },
};

// Default percentages for service, tax, gratuity, contingency
export const PERCENTAGES = {
  service: 20, // %
  tax: 7, // %
  gratuity: 0, // %
  contingency: 10, // %
};

// Major US holidays that map to saturday_holiday pricing
export const MAJOR_HOLIDAYS = {
  // Fixed date holidays
  newYearsDay: { month: 1, day: 1 },
  independenceDay: { month: 7, day: 4 },
  christmas: { month: 12, day: 25 },
  newYearsEve: { month: 12, day: 31 },
  // Floating holidays (calculated based on year)
  memorialDay: 'lastMondayOfMay',
  laborDay: 'firstMondayOfSeptember',
  thanksgiving: 'fourthThursdayOfNovember',
} as const;

