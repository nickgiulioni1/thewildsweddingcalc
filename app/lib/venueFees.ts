import { Venue, DayBand, VENUE_FEES } from '../../config/config';
import { logger } from './logger';

/**
 * Get the venue fee for a given venue and day band
 */
export function getVenueFee(venue: Venue, band: DayBand): number {
  logger.debug(`Getting venue fee for ${venue} on ${band} band`);
  const fee = VENUE_FEES[venue][band];
  logger.debug(`Venue fee: $${fee}`);
  return fee;
}

