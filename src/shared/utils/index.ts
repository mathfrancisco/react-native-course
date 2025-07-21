/**
 * 🔧 Utils Index
 * 
 * Central export point for all utility functions.
 * This file provides a single import point for all app utilities.
 */

// Date utilities
export {
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
  TIME_CONSTANTS,
  DateUtils,
} from './dateUtils';

// String utilities
export {
  normalizeString,
  capitalize,
  toTitleCase,
  truncate,
  fuzzyMatch,
  stringSimilarity,
  createSlug,
  generateRandomString,
  extractNumbers,
  extractHashtags,
  highlightText,
  countWords,
  estimateReadingTime,
  findCommonWords,
  formatIngredientList,
  cleanRecipeDescription,
  toKebabCase,
  toCamelCase,
  isEmpty,
  isAlpha,
  isNumeric,
  isAlphanumeric,
  maskEmail,
  formatPhoneNumber,
  StringUtils,
} from './stringUtils';

// Number utilities
export {
  formatNumber,
  formatCurrency,
  formatPercentage,
  roundTo,
  convertUnit,
  formatQuantity,
  formatRating,
  generateStarRating,
  scaleRecipe,
  calculateNutritionPerServing,
  calculateDailyValuePercentage,
  clamp,
  average,
  median,
  range,
  randomInRange,
  isValidNumber,
  NumberUtils,
} from './numberUtils';

// Image utilities
export {
  validateImage,
  calculateAspectRatio,
  calculateDimensions,
  generatePlaceholder,
  getImageDimensions,
  buildImageUrl,
  generateResponsiveImages,
  getOptimalImageSize,
  extractDominantColor,
  getCompressedImageUrl,
  convertImageFormat,
  createThumbnail,
  cropToAspectRatio,
  applyImageFilter,
  estimateFileSize,
  isImageUrl,
  generateAvatarFromInitials,
  ImageUtils,
} from './imageUtils';

export type {
  ImageDimensions,
  ImageInfo,
  ResizeOptions,
} from './imageUtils';

// Validation utilities
export {
  validateEmail,
  validatePhone,
  validatePassword,
  validateName,
  validateRecipeTitle,
  validateRecipeDescription,
  validateIngredient,
  validateCookingTime,
  validateServings,
  validateRating,
  validateSearchQuery,
  validateUrl,
  validateNumberRange,
  validateArrayLength,
  sanitizeInput,
  ValidationUtils,
} from './validationUtils';

export type {
  ValidationResult,
} from './validationUtils';

/**
 * 🎯 All Utils Combined
 * 
 * Single object containing all utility functions.
 * Use this for easy access to all utils.
 */
export const Utils = {
  Date: DateUtils,
  String: StringUtils,
  Number: NumberUtils,
  Image: ImageUtils,
  Validation: ValidationUtils,
};

export default Utils;