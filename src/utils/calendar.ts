import { StoryDate, CalendarConfig } from '../types';

export const GREGORIAN_CONFIG: CalendarConfig = {
  months: [
    { name: 'January', days: 31 },
    { name: 'February', days: 28 },
    { name: 'March', days: 31 },
    { name: 'April', days: 30 },
    { name: 'May', days: 31 },
    { name: 'June', days: 30 },
    { name: 'July', days: 31 },
    { name: 'August', days: 31 },
    { name: 'September', days: 30 },
    { name: 'October', days: 31 },
    { name: 'November', days: 30 },
    { name: 'December', days: 31 }
  ],
  useCustomCalendar: true,
  daysPerWeek: 7,
  eraName: 'A.D.',
  epochAnchor: 'The start of the Gregorian era.'
};

/**
 * Calculates the absolute day from a given StoryDate and CalendarConfig.
 * This is the "Source of Truth" integer.
 */
export const dateToAbsoluteDay = (date: StoryDate | undefined, config: CalendarConfig | undefined): number => {
  if (!date) return 0;
  
  // Default to Gregorian if no config or custom calendar disabled
  const activeConfig = (config && config.useCustomCalendar) ? config : GREGORIAN_CONFIG;

  let totalDays = 0;
  
  // Add days for full years
  const daysInYear = activeConfig.months.reduce((sum, m) => sum + m.days, 0);
  totalDays += (date.year || 0) * daysInYear;

  // Add days for full months in the current year
  const monthIndex = Math.min(date.month || 0, activeConfig.months.length - 1);
  for (let i = 0; i < monthIndex; i++) {
    totalDays += activeConfig.months[i].days;
  }

  // Add days in the current month
  totalDays += (date.day || 0);

  return totalDays;
};

/**
 * Calculates the StoryDate from an absolute day and CalendarConfig.
 * This is the "Projection Layer".
 */
export const absoluteDayToDate = (absoluteDay: number, config: CalendarConfig | undefined): StoryDate => {
  const activeConfig = (config && config.useCustomCalendar) ? config : GREGORIAN_CONFIG;

  const daysInYear = activeConfig.months.reduce((sum, m) => sum + m.days, 0);
  if (daysInYear === 0) return { year: 0, month: 0, day: absoluteDay };

  let remainingDays = absoluteDay;
  const year = Math.floor(remainingDays / daysInYear);
  remainingDays %= daysInYear;

  let month = 0;
  for (let i = 0; i < activeConfig.months.length; i++) {
    if (remainingDays < activeConfig.months[i].days) {
      month = i;
      break;
    }
    remainingDays -= activeConfig.months[i].days;
    month = i;
  }

  return {
    year,
    month,
    day: Math.max(0, remainingDays)
  };
};

/**
 * Formats an absolute day into a human-readable string based on the active calendar.
 */
export const formatAbsoluteDay = (absoluteDay: number, config: CalendarConfig | undefined): string => {
  const activeConfig = (config && config.useCustomCalendar) ? config : GREGORIAN_CONFIG;

  const date = absoluteDayToDate(absoluteDay, activeConfig);
  const monthName = activeConfig.months[date.month]?.name || `Month ${date.month + 1}`;
  
  let formatted = `${monthName} ${date.day}`;
  if (activeConfig.eraName) {
    formatted += `, ${activeConfig.eraName} ${date.year}`;
  } else {
    formatted += `, Year ${date.year}`;
  }

  return formatted;
};

// Keep for backward compatibility but redirect to new logic
export const calculateAbsoluteDay = dateToAbsoluteDay;

export const formatStoryDate = (date: StoryDate | undefined, config: CalendarConfig | undefined): string => {
  if (!date) return 'Unknown Date';
  const absDay = dateToAbsoluteDay(date, config);
  return formatAbsoluteDay(absDay, config);
};
