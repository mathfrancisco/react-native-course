/**
 * 📝 String Utilities
 * 
 * Utility functions for string manipulation, formatting, and validation.
 * Especially useful for recipe titles, ingredients, and search functionality.
 */

/**
 * 🧹 Clean and normalize string
 */
export const normalizeString = (str: string): string => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s]/gi, '') // Remove special characters
    .replace(/\s+/g, ' '); // Replace multiple spaces with single space
};

/**
 * 🔤 Capitalize first letter
 */
export const capitalize = (str: string): string => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * 🔤 Capitalize each word (Title Case)
 */
export const toTitleCase = (str: string): string => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * ✂️ Truncate string with ellipsis
 */
export const truncate = (
  str: string, 
  maxLength: number = 100, 
  suffix: string = '...'
): string => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  if (str.length <= maxLength) {
    return str;
  }
  
  return str.slice(0, maxLength - suffix.length).trim() + suffix;
};

/**
 * 🔍 Check if string contains search term (fuzzy search)
 */
export const fuzzyMatch = (text: string, searchTerm: string): boolean => {
  if (!text || !searchTerm) {
    return false;
  }
  
  const normalizedText = normalizeString(text);
  const normalizedSearch = normalizeString(searchTerm);
  
  return normalizedText.includes(normalizedSearch);
};

/**
 * 🎯 Calculate string similarity (0-1 score)
 */
export const stringSimilarity = (str1: string, str2: string): number => {
  if (!str1 || !str2) {
    return 0;
  }
  
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) {
    return 1.0;
  }
  
  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

/**
 * 📏 Calculate edit distance (Levenshtein distance)
 */
const getEditDistance = (str1: string, str2: string): number => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

/**
 * 🔤 Generate slug from string
 */
export const createSlug = (str: string): string => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  return normalizeString(str)
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * 🎲 Generate random string
 */
export const generateRandomString = (
  length: number = 8,
  includeNumbers: boolean = true,
  includeSymbols: boolean = false
): string => {
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  
  if (includeNumbers) {
    chars += '0123456789';
  }
  
  if (includeSymbols) {
    chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  }
  
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * 🔢 Extract numbers from string
 */
export const extractNumbers = (str: string): number[] => {
  if (!str || typeof str !== 'string') {
    return [];
  }
  
  const matches = str.match(/\d+(\.\d+)?/g);
  return matches ? matches.map(Number) : [];
};

/**
 * 🏷️ Extract hashtags from string
 */
export const extractHashtags = (str: string): string[] => {
  if (!str || typeof str !== 'string') {
    return [];
  }
  
  const matches = str.match(/#[\w\u00C0-\u024F\u1E00-\u1EFF]+/g);
  return matches ? matches.map(tag => tag.slice(1).toLowerCase()) : [];
};

/**
 * 🌟 Highlight search terms in text
 */
export const highlightText = (
  text: string,
  searchTerms: string | string[],
  highlightClass: string = 'highlight'
): string => {
  if (!text || !searchTerms) {
    return text;
  }
  
  const terms = Array.isArray(searchTerms) ? searchTerms : [searchTerms];
  let highlightedText = text;
  
  terms.forEach(term => {
    if (term.trim()) {
      const regex = new RegExp(`(${term.trim()})`, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        `<span class="${highlightClass}">$1</span>`
      );
    }
  });
  
  return highlightedText;
};

/**
 * 📊 Count words in string
 */
export const countWords = (str: string): number => {
  if (!str || typeof str !== 'string') {
    return 0;
  }
  
  return str.trim().split(/\s+/).filter(word => word.length > 0).length;
};

/**
 * ⏱️ Estimate reading time
 */
export const estimateReadingTime = (
  text: string,
  wordsPerMinute: number = 200
): number => {
  const wordCount = countWords(text);
  return Math.ceil(wordCount / wordsPerMinute);
};

/**
 * 🔍 Find common words between strings
 */
export const findCommonWords = (str1: string, str2: string): string[] => {
  if (!str1 || !str2) {
    return [];
  }
  
  const words1 = normalizeString(str1).split(' ').filter(w => w.length > 2);
  const words2 = normalizeString(str2).split(' ').filter(w => w.length > 2);
  
  return words1.filter(word => words2.includes(word));
};

/**
 * 🍳 Format ingredient list
 */
export const formatIngredientList = (ingredients: string[]): string => {
  if (!ingredients || !Array.isArray(ingredients)) {
    return '';
  }
  
  if (ingredients.length === 0) {
    return '';
  }
  
  if (ingredients.length === 1) {
    return ingredients[0];
  }
  
  if (ingredients.length === 2) {
    return `${ingredients[0]} e ${ingredients[1]}`;
  }
  
  const lastIngredient = ingredients[ingredients.length - 1];
  const otherIngredients = ingredients.slice(0, -1).join(', ');
  
  return `${otherIngredients} e ${lastIngredient}`;
};

/**
 * 📝 Clean recipe description
 */
export const cleanRecipeDescription = (description: string): string => {
  if (!description || typeof description !== 'string') {
    return '';
  }
  
  return description
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces
    .replace(/\n\s*\n/g, '\n') // Replace multiple line breaks
    .replace(/[^\w\s\-.,!?():]/gi, '') // Keep only safe characters
    .substring(0, 500); // Limit length
};

/**
 * 🔤 Convert to kebab-case
 */
export const toKebabCase = (str: string): string => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

/**
 * 🔤 Convert to camelCase
 */
export const toCamelCase = (str: string): string => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
    .replace(/^[A-Z]/, char => char.toLowerCase());
};

/**
 * ✅ Check if string is empty or only whitespace
 */
export const isEmpty = (str: string): boolean => {
  return !str || typeof str !== 'string' || str.trim().length === 0;
};

/**
 * 🔍 Check if string contains only letters
 */
export const isAlpha = (str: string): boolean => {
  if (!str || typeof str !== 'string') {
    return false;
  }
  
  return /^[a-zA-ZÀ-ÿ\s]+$/.test(str);
};

/**
 * 🔢 Check if string contains only numbers
 */
export const isNumeric = (str: string): boolean => {
  if (!str || typeof str !== 'string') {
    return false;
  }
  
  return /^\d+(\.\d+)?$/.test(str);
};

/**
 * 🔤 Check if string is alphanumeric
 */
export const isAlphanumeric = (str: string): boolean => {
  if (!str || typeof str !== 'string') {
    return false;
  }
  
  return /^[a-zA-Z0-9À-ÿ\s]+$/.test(str);
};

/**
 * 📧 Mask email address
 */
export const maskEmail = (email: string): string => {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return email;
  }
  
  const [name, domain] = email.split('@');
  const maskedName = name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1);
  
  return `${maskedName}@${domain}`;
};

/**
 * 📱 Format phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone || typeof phone !== 'string') {
    return '';
  }
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
};

/**
 * 📋 String utilities object
 */
export const StringUtils = {
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
};

export default StringUtils;