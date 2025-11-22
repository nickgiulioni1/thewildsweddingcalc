import { MAJOR_HOLIDAYS } from '../../config/config';
import { logger } from './logger';

/**
 * Check if a given date is a recognized holiday
 */
export function isHoliday(dateString: string): boolean {
  logger.debug(`Checking if ${dateString} is a holiday`);
  
  const date = new Date(dateString);
  const month = date.getMonth() + 1; // JS months are 0-indexed
  const day = date.getDate();
  const year = date.getFullYear();

  // Check fixed date holidays
  if (
    (month === MAJOR_HOLIDAYS.newYearsDay.month && day === MAJOR_HOLIDAYS.newYearsDay.day) ||
    (month === MAJOR_HOLIDAYS.independenceDay.month && day === MAJOR_HOLIDAYS.independenceDay.day) ||
    (month === MAJOR_HOLIDAYS.christmas.month && day === MAJOR_HOLIDAYS.christmas.day) ||
    (month === MAJOR_HOLIDAYS.newYearsEve.month && day === MAJOR_HOLIDAYS.newYearsEve.day)
  ) {
    logger.debug(`${dateString} is a fixed-date holiday`);
    return true;
  }

  // Check floating holidays
  // Memorial Day: Last Monday of May
  if (month === 5) {
    const lastMonday = getLastMondayOfMonth(year, 5);
    if (day === lastMonday) {
      logger.debug(`${dateString} is Memorial Day`);
      return true;
    }
  }

  // Labor Day: First Monday of September
  if (month === 9) {
    const firstMonday = getNthWeekdayOfMonth(year, 9, 1, 1); // 1 = Monday, 1st occurrence
    if (day === firstMonday) {
      logger.debug(`${dateString} is Labor Day`);
      return true;
    }
  }

  // Thanksgiving: Fourth Thursday of November
  if (month === 11) {
    const fourthThursday = getNthWeekdayOfMonth(year, 11, 4, 4); // 4 = Thursday, 4th occurrence
    if (day === fourthThursday) {
      logger.debug(`${dateString} is Thanksgiving`);
      return true;
    }
  }

  logger.debug(`${dateString} is not a holiday`);
  return false;
}

/**
 * Get the last Monday of a given month
 */
function getLastMondayOfMonth(year: number, month: number): number {
  const lastDay = new Date(year, month, 0); // Last day of the month
  const lastDayOfMonth = lastDay.getDate();
  const lastDayWeekday = lastDay.getDay();

  // Calculate days to subtract to get to Monday (1)
  const daysToSubtract = lastDayWeekday === 0 ? 6 : lastDayWeekday - 1;
  
  return lastDayOfMonth - daysToSubtract;
}

/**
 * Get the nth occurrence of a weekday in a month
 * @param year Year
 * @param month Month (1-12)
 * @param weekday Target weekday (0=Sunday, 1=Monday, ..., 6=Saturday)
 * @param occurrence Which occurrence (1st, 2nd, 3rd, 4th, etc.)
 */
function getNthWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number,
  occurrence: number
): number {
  const firstDay = new Date(year, month - 1, 1);
  const firstDayWeekday = firstDay.getDay();

  // Calculate the first occurrence of the target weekday
  let daysUntilTarget = (weekday - firstDayWeekday + 7) % 7;
  const firstOccurrence = 1 + daysUntilTarget;

  // Calculate the nth occurrence
  return firstOccurrence + (occurrence - 1) * 7;
}

