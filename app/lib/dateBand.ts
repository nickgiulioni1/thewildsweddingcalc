import { DayBand } from '../../config/config';
import { isHoliday } from './holidays';
import { logger } from './logger';

/**
 * Determine the day band for a given date
 * Returns: 'monday_thursday', 'friday_sunday', or 'saturday_holiday'
 */
export function getBand(dateString: string): DayBand {
  logger.debug(`Getting band for date: ${dateString}`);
  
  // Check if it's a holiday first
  if (isHoliday(dateString)) {
    logger.debug(`Date ${dateString} is a holiday, returning saturday_holiday band`);
    return 'saturday_holiday';
  }

  // Parse date string as YYYY-MM-DD in UTC to avoid timezone issues
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = date.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  logger.debug(`Parsed date ${dateString}: day of week = ${dayOfWeek}`);

  // Saturday
  if (dayOfWeek === 6) {
    logger.debug(`Date ${dateString} is Saturday, returning saturday_holiday band`);
    return 'saturday_holiday';
  }

  // Friday or Sunday
  if (dayOfWeek === 5 || dayOfWeek === 0) {
    logger.debug(`Date ${dateString} is Friday or Sunday, returning friday_sunday band`);
    return 'friday_sunday';
  }

  // Monday through Thursday
  logger.debug(`Date ${dateString} is Monday-Thursday, returning monday_thursday band`);
  return 'monday_thursday';
}

