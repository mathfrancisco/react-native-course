/**
 * 📅 Date Utilities
 * 
 * Utility functions for date formatting, manipulation, and validation.
 * All functions are pure and handle edge cases gracefully.
 */

/**
 * 🌍 Locale Configuration
 */
const DEFAULT_LOCALE = 'pt-BR';
const DEFAULT_TIMEZONE = 'America/Sao_Paulo';

/**
 * ⏰ Time Constants
 */
export const TIME_CONSTANTS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,
} as const;

/**
 * 📝 Format date to readable string
 */
export const formatDate = (
  date: Date | string | number,
  format: 'short' | 'long' | 'relative' | 'time' | 'custom' = 'short',
  locale: string = DEFAULT_LOCALE,
  customFormat?: Intl.DateTimeFormatOptions
): string => {
  try {
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return 'Data inválida';
    }

    switch (format) {
      case 'short':
        return dateObj.toLocaleDateString(locale, {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
        
      case 'long':
        return dateObj.toLocaleDateString(locale, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        
      case 'relative':
        return formatRelativeTime(dateObj, locale);
        
      case 'time':
        return dateObj.toLocaleTimeString(locale, {
          hour: '2-digit',
          minute: '2-digit',
        });
        
      case 'custom':
        return dateObj.toLocaleDateString(locale, customFormat);
        
      default:
        return dateObj.toLocaleDateString(locale);
    }
  } catch (error) {
    console.warn('Error formatting date:', error);
    return 'Data inválida';
  }
};

/**
 * ⏱️ Format relative time (e.g., "há 2 horas")
 */
export const formatRelativeTime = (
  date: Date | string | number,
  locale: string = DEFAULT_LOCALE
): string => {
  try {
    const dateObj = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    
    if (diffMs < 0) {
      return 'no futuro';
    }
    
    if (diffMs < TIME_CONSTANTS.MINUTE) {
      return 'agora mesmo';
    }
    
    if (diffMs < TIME_CONSTANTS.HOUR) {
      const minutes = Math.floor(diffMs / TIME_CONSTANTS.MINUTE);
      return `há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    }
    
    if (diffMs < TIME_CONSTANTS.DAY) {
      const hours = Math.floor(diffMs / TIME_CONSTANTS.HOUR);
      return `há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }
    
    if (diffMs < TIME_CONSTANTS.WEEK) {
      const days = Math.floor(diffMs / TIME_CONSTANTS.DAY);
      return `há ${days} ${days === 1 ? 'dia' : 'dias'}`;
    }
    
    if (diffMs < TIME_CONSTANTS.MONTH) {
      const weeks = Math.floor(diffMs / TIME_CONSTANTS.WEEK);
      return `há ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
    }
    
    if (diffMs < TIME_CONSTANTS.YEAR) {
      const months = Math.floor(diffMs / TIME_CONSTANTS.MONTH);
      return `há ${months} ${months === 1 ? 'mês' : 'meses'}`;
    }
    
    const years = Math.floor(diffMs / TIME_CONSTANTS.YEAR);
    return `há ${years} ${years === 1 ? 'ano' : 'anos'}`;
    
  } catch (error) {
    console.warn('Error formatting relative time:', error);
    return 'data inválida';
  }
};

/**
 * ⏲️ Format cooking time (minutes to readable format)
 */
export const formatCookingTime = (minutes: number): string => {
  if (!minutes || minutes <= 0) {
    return '0min';
  }
  
  if (minutes < 60) {
    return `${minutes}min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
};

/**
 * 🔄 Parse cooking time string to minutes
 */
export const parseCookingTime = (timeString: string): number => {
  try {
    const cleanTime = timeString.toLowerCase().trim();
    
    // Extract hours and minutes
    const hourMatch = cleanTime.match(/(\d+)h/);
    const minuteMatch = cleanTime.match(/(\d+)min/);
    
    const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
    const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;
    
    return hours * 60 + minutes;
  } catch (error) {
    console.warn('Error parsing cooking time:', error);
    return 0;
  }
};

/**
 * 📅 Check if date is today
 */
export const isToday = (date: Date | string | number): boolean => {
  try {
    const dateObj = new Date(date);
    const today = new Date();
    
    return (
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    );
  } catch (error) {
    return false;
  }
};

/**
 * 📅 Check if date is yesterday
 */
export const isYesterday = (date: Date | string | number): boolean => {
  try {
    const dateObj = new Date(date);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return (
      dateObj.getDate() === yesterday.getDate() &&
      dateObj.getMonth() === yesterday.getMonth() &&
      dateObj.getFullYear() === yesterday.getFullYear()
    );
  } catch (error) {
    return false;
  }
};

/**
 * 📅 Check if date is this week
 */
export const isThisWeek = (date: Date | string | number): boolean => {
  try {
    const dateObj = new Date(date);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    
    return dateObj >= weekStart && dateObj < weekEnd;
  } catch (error) {
    return false;
  }
};

/**
 * 🔢 Get time difference in specific unit
 */
export const getTimeDifference = (
  date1: Date | string | number,
  date2: Date | string | number,
  unit: 'seconds' | 'minutes' | 'hours' | 'days' = 'minutes'
): number => {
  try {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffMs = Math.abs(d2.getTime() - d1.getTime());
    
    switch (unit) {
      case 'seconds':
        return Math.floor(diffMs / TIME_CONSTANTS.SECOND);
      case 'minutes':
        return Math.floor(diffMs / TIME_CONSTANTS.MINUTE);
      case 'hours':
        return Math.floor(diffMs / TIME_CONSTANTS.HOUR);
      case 'days':
        return Math.floor(diffMs / TIME_CONSTANTS.DAY);
      default:
        return diffMs;
    }
  } catch (error) {
    console.warn('Error calculating time difference:', error);
    return 0;
  }
};

/**
 * 📅 Add time to date
 */
export const addTime = (
  date: Date | string | number,
  amount: number,
  unit: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'
): Date => {
  try {
    const dateObj = new Date(date);
    
    switch (unit) {
      case 'seconds':
        dateObj.setSeconds(dateObj.getSeconds() + amount);
        break;
      case 'minutes':
        dateObj.setMinutes(dateObj.getMinutes() + amount);
        break;
      case 'hours':
        dateObj.setHours(dateObj.getHours() + amount);
        break;
      case 'days':
        dateObj.setDate(dateObj.getDate() + amount);
        break;
      case 'weeks':
        dateObj.setDate(dateObj.getDate() + (amount * 7));
        break;
      case 'months':
        dateObj.setMonth(dateObj.getMonth() + amount);
        break;
      case 'years':
        dateObj.setFullYear(dateObj.getFullYear() + amount);
        break;
    }
    
    return dateObj;
  } catch (error) {
    console.warn('Error adding time to date:', error);
    return new Date(date);
  }
};

/**
 * 📅 Get start and end of day
 */
export const getStartOfDay = (date: Date | string | number): Date => {
  const dateObj = new Date(date);
  dateObj.setHours(0, 0, 0, 0);
  return dateObj;
};

export const getEndOfDay = (date: Date | string | number): Date => {
  const dateObj = new Date(date);
  dateObj.setHours(23, 59, 59, 999);
  return dateObj;
};

/**
 * ✅ Validate date
 */
export const isValidDate = (date: any): boolean => {
  try {
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
  } catch (error) {
    return false;
  }
};

/**
 * 🌍 Convert timezone
 */
export const convertTimezone = (
  date: Date | string | number,
  targetTimezone: string = DEFAULT_TIMEZONE
): Date => {
  try {
    const dateObj = new Date(date);
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: targetTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    
    const parts = formatter.formatToParts(dateObj);
    const formatted = `${parts[4].value}-${parts[0].value}-${parts[2].value}T${parts[6].value}:${parts[8].value}:${parts[10].value}`;
    
    return new Date(formatted);
  } catch (error) {
    console.warn('Error converting timezone:', error);
    return new Date(date);
  }
};

/**
 * 📋 Date utilities object
 */
export const DateUtils = {
  formatDate,
  formatRelativeTime,
  formatCookingTime,
  parseCookingTime,
  isToday,
  isYesterday,
  isThisWeek,
  getTimeDifference,
  addTime,
  getStartOfDay,
  getEndOfDay,
  isValidDate,
  convertTimezone,
  constants: TIME_CONSTANTS,
};

export default DateUtils;