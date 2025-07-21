/**
 * 🔢 Number Utilities
 * 
 * Utility functions for number formatting, calculations, and conversions.
 * Especially useful for recipe quantities, ratings, and measurements.
 */

/**
 * 📊 Format number with locale
 */
export const formatNumber = (
  num: number,
  locale: string = 'pt-BR',
  options?: Intl.NumberFormatOptions
): string => {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0';
  }
  
  try {
    return new Intl.NumberFormat(locale, options).format(num);
  } catch (error) {
    console.warn('Error formatting number:', error);
    return num.toString();
  }
};

/**
 * 💰 Format currency
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'BRL',
  locale: string = 'pt-BR'
): string => {
  return formatNumber(amount, locale, {
    style: 'currency',
    currency: currency,
  });
};

/**
 * 📊 Format percentage
 */
export const formatPercentage = (
  value: number,
  decimals: number = 1,
  locale: string = 'pt-BR'
): string => {
  return formatNumber(value / 100, locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * 🔢 Round to specific decimal places
 */
export const roundTo = (num: number, decimals: number = 2): number => {
  if (typeof num !== 'number' || isNaN(num)) {
    return 0;
  }
  
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
};

/**
 * ⚖️ Convert between measurement units
 */
export const convertUnit = (
  value: number,
  fromUnit: string,
  toUnit: string
): number => {
  if (typeof value !== 'number' || isNaN(value)) {
    return 0;
  }
  
  // Volume conversions (all to ml first)
  const volumeToMl: Record<string, number> = {
    'ml': 1,
    'l': 1000,
    'xícara': 240,
    'colher de sopa': 15,
    'colher de chá': 5,
    'cup': 240,
    'tablespoon': 15,
    'teaspoon': 5,
    'fluid_oz': 29.5735,
  };
  
  // Weight conversions (all to grams first)
  const weightToGrams: Record<string, number> = {
    'g': 1,
    'kg': 1000,
    'oz': 28.3495,
    'lb': 453.592,
  };
  
  // Temperature conversions
  if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
    return (value * 9/5) + 32;
  }
  
  if (fromUnit === 'fahrenheit' && toUnit === 'celsius') {
    return (value - 32) * 5/9;
  }
  
  // Volume conversions
  if (volumeToMl[fromUnit] && volumeToMl[toUnit]) {
    const mlValue = value * volumeToMl[fromUnit];
    return mlValue / volumeToMl[toUnit];
  }
  
  // Weight conversions
  if (weightToGrams[fromUnit] && weightToGrams[toUnit]) {
    const gramValue = value * weightToGrams[fromUnit];
    return gramValue / weightToGrams[toUnit];
  }
  
  // If no conversion found, return original value
  return value;
};

/**
 * 🥄 Format recipe quantity
 */
export const formatQuantity = (
  amount: number,
  unit: string,
  decimals: number = 1
): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return `0 ${unit}`;
  }
  
  // For whole numbers, don't show decimals
  if (amount % 1 === 0) {
    return `${amount} ${unit}`;
  }
  
  // For common fractions, show as fractions
  const fractions: Record<string, string> = {
    '0.25': '¼',
    '0.33': '⅓',
    '0.5': '½',
    '0.67': '⅔',
    '0.75': '¾',
  };
  
  const roundedAmount = roundTo(amount, 2);
  const fractionKey = roundedAmount.toString();
  
  if (fractions[fractionKey]) {
    return `${fractions[fractionKey]} ${unit}`;
  }
  
  // For mixed numbers (like 1.5), show as "1½"
  const whole = Math.floor(amount);
  const decimal = roundTo(amount - whole, 2);
  const decimalKey = decimal.toString();
  
  if (whole > 0 && fractions[decimalKey]) {
    return `${whole}${fractions[decimalKey]} ${unit}`;
  }
  
  // Default to decimal format
  return `${roundTo(amount, decimals)} ${unit}`;
};

/**
 * ⭐ Format rating
 */
export const formatRating = (rating: number, maxRating: number = 5): string => {
  if (typeof rating !== 'number' || isNaN(rating)) {
    return '0.0';
  }
  
  const clampedRating = Math.max(0, Math.min(rating, maxRating));
  return clampedRating.toFixed(1);
};

/**
 * ⭐ Generate star rating display
 */
export const generateStarRating = (
  rating: number,
  maxRating: number = 5
): { full: number; half: boolean; empty: number } => {
  if (typeof rating !== 'number' || isNaN(rating)) {
    return { full: 0, half: false, empty: maxRating };
  }
  
  const clampedRating = Math.max(0, Math.min(rating, maxRating));
  const full = Math.floor(clampedRating);
  const half = clampedRating % 1 >= 0.5;
  const empty = maxRating - full - (half ? 1 : 0);
  
  return { full, half, empty };
};

/**
 * 📏 Calculate recipe scaling
 */
export const scaleRecipe = (
  originalAmount: number,
  originalServings: number,
  newServings: number
): number => {
  if (typeof originalAmount !== 'number' || 
      typeof originalServings !== 'number' || 
      typeof newServings !== 'number' ||
      originalServings <= 0) {
    return originalAmount;
  }
  
  const scaleFactor = newServings / originalServings;
  return roundTo(originalAmount * scaleFactor, 2);
};

/**
 * 🔢 Calculate nutritional values per serving
 */
export const calculateNutritionPerServing = (
  totalNutrition: Record<string, number>,
  servings: number
): Record<string, number> => {
  if (typeof servings !== 'number' || servings <= 0) {
    return totalNutrition;
  }
  
  const nutritionPerServing: Record<string, number> = {};
  
  Object.entries(totalNutrition).forEach(([key, value]) => {
    if (typeof value === 'number' && !isNaN(value)) {
      nutritionPerServing[key] = roundTo(value / servings, 1);
    } else {
      nutritionPerServing[key] = 0;
    }
  });
  
  return nutritionPerServing;
};

/**
 * 📊 Calculate percentage of daily value
 */
export const calculateDailyValuePercentage = (
  amount: number,
  dailyValue: number
): number => {
  if (typeof amount !== 'number' || typeof dailyValue !== 'number' || 
      isNaN(amount) || isNaN(dailyValue) || dailyValue <= 0) {
    return 0;
  }
  
  return roundTo((amount / dailyValue) * 100, 1);
};

/**
 * 🎯 Clamp number between min and max
 */
export const clamp = (num: number, min: number, max: number): number => {
  if (typeof num !== 'number' || isNaN(num)) {
    return min;
  }
  
  return Math.max(min, Math.min(num, max));
};

/**
 * 📈 Calculate average
 */
export const average = (numbers: number[]): number => {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    return 0;
  }
  
  const validNumbers = numbers.filter(n => typeof n === 'number' && !isNaN(n));
  
  if (validNumbers.length === 0) {
    return 0;
  }
  
  const sum = validNumbers.reduce((acc, num) => acc + num, 0);
  return roundTo(sum / validNumbers.length, 2);
};

/**
 * 📊 Find median
 */
export const median = (numbers: number[]): number => {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    return 0;
  }
  
  const validNumbers = numbers
    .filter(n => typeof n === 'number' && !isNaN(n))
    .sort((a, b) => a - b);
  
  if (validNumbers.length === 0) {
    return 0;
  }
  
  const middle = Math.floor(validNumbers.length / 2);
  
  if (validNumbers.length % 2 === 0) {
    return roundTo((validNumbers[middle - 1] + validNumbers[middle]) / 2, 2);
  }
  
  return validNumbers[middle];
};

/**
 * 🔢 Generate range of numbers
 */
export const range = (start: number, end: number, step: number = 1): number[] => {
  if (typeof start !== 'number' || typeof end !== 'number' || typeof step !== 'number') {
    return [];
  }
  
  if (step === 0) {
    return [];
  }
  
  const result: number[] = [];
  
  if (step > 0) {
    for (let i = start; i <= end; i += step) {
      result.push(i);
    }
  } else {
    for (let i = start; i >= end; i += step) {
      result.push(i);
    }
  }
  
  return result;
};

/**
 * 🎲 Generate random number in range
 */
export const randomInRange = (min: number, max: number, decimals: number = 0): number => {
  if (typeof min !== 'number' || typeof max !== 'number') {
    return 0;
  }
  
  const random = Math.random() * (max - min) + min;
  return roundTo(random, decimals);
};

/**
 * ✅ Check if number is valid
 */
export const isValidNumber = (value: any): boolean => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

/**
 * 📋 Number utilities object
 */
export const NumberUtils = {
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
};

export default NumberUtils;