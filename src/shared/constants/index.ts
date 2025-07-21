/**
 * 📋 Constants Index
 * 
 * Central export point for all shared constants.
 * This file provides a single import point for all app constants.
 */

// App constants
export {
  APP_INFO,
  LIMITS,
  UI,
  API,
  ANALYTICS_EVENTS,
  REGEX_PATTERNS,
  I18N,
  DEFAULT_FEATURE_FLAGS,
  PLATFORM,
  RECIPE_CONSTANTS,
  AppConstants,
} from './appConstants';

// Storage keys
export {
  USER_KEYS,
  RECIPE_KEYS,
  CATEGORY_KEYS,
  SEARCH_KEYS,
  APP_KEYS,
  CACHE_KEYS,
  AUTH_KEYS,
  ANALYTICS_KEYS,
  NETWORK_KEYS,
  STORAGE_KEYS,
  StorageKeyUtils,
  KEY_CATEGORIES,
} from './storageKeys';

// Navigation constants
export {
  NAVIGATION_TIMINGS,
  NAVIGATION_DIMENSIONS,
  NAVIGATION_COLORS,
  PLATFORM_NAVIGATION,
  NAVIGATION_TRANSITIONS,
  NAVIGATION_GESTURES,
  NAVIGATION_ANALYTICS,
  DEEP_LINK_PATTERNS,
  NAVIGATION_PRIORITIES,
  NAVIGATION_STATE,
  MODAL_CONFIGS,
  NAVIGATION_UTILS,
  NavigationConstants,
} from './navigationConstants';

// Default values
export {
  USER_DEFAULTS,
  RECIPE_DEFAULTS,
  CATEGORY_DEFAULTS,
  SEARCH_DEFAULTS,
  APP_DEFAULTS,
  NETWORK_DEFAULTS,
  CACHE_DEFAULTS,
  ANALYTICS_DEFAULTS,
  UI_DEFAULTS,
  DEFAULT_VALUES,
} from './defaultValues';

/**
 * 🎯 Unified Constants Object
 * 
 * Single object containing all app constants.
 * Use this for easy access to all constant values.
 */
export const Constants = {
  APP: AppConstants,
  STORAGE: STORAGE_KEYS,
  NAVIGATION: NavigationConstants,
  DEFAULTS: DEFAULT_VALUES,
} as const;

export default Constants;