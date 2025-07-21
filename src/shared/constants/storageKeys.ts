/**
 * 🗝️ Storage Keys
 * 
 * Centralized storage key management for AsyncStorage and other storage mechanisms.
 * All keys are prefixed and organized by feature/module.
 */

/**
 * 🏗️ Storage Key Builder
 */
const PREFIX = 'recipeapp_';

const createKey = (module: string, key: string): string => {
  return `${PREFIX}${module}_${key}`;
};

/**
 * 👤 User-related Storage Keys
 */
export const USER_KEYS = {
  // User profile
  PROFILE: createKey('user', 'profile'),
  PREFERENCES: createKey('user', 'preferences'),
  SETTINGS: createKey('user', 'settings'),
  
  // User activity
  FAVORITES: createKey('user', 'favorites'),
  RECENT_RECIPES: createKey('user', 'recent_recipes'),
  VIEWED_RECIPES: createKey('user', 'viewed_recipes'),
  CUSTOM_RECIPES: createKey('user', 'custom_recipes'),
  
  // User lists
  SHOPPING_LIST: createKey('user', 'shopping_list'),
  MEAL_PLANS: createKey('user', 'meal_plans'),
  RECIPE_NOTES: createKey('user', 'recipe_notes'),
  
  // User stats
  COOKING_STATS: createKey('user', 'cooking_stats'),
  ACHIEVEMENT_PROGRESS: createKey('user', 'achievement_progress'),
} as const;

/**
 * 🍳 Recipe-related Storage Keys
 */
export const RECIPE_KEYS = {
  // Recipe cache
  CACHE: createKey('recipes', 'cache'),
  CACHE_METADATA: createKey('recipes', 'cache_metadata'),
  
  // Offline recipes
  OFFLINE_RECIPES: createKey('recipes', 'offline'),
  DOWNLOADED_RECIPES: createKey('recipes', 'downloaded'),
  
  // Recipe interactions
  RATINGS: createKey('recipes', 'ratings'),
  REVIEWS: createKey('recipes', 'reviews'),
  COOKING_HISTORY: createKey('recipes', 'cooking_history'),
  
  // Recipe organization
  COLLECTIONS: createKey('recipes', 'collections'),
  TAGS: createKey('recipes', 'tags'),
} as const;

/**
 * 📂 Category-related Storage Keys
 */
export const CATEGORY_KEYS = {
  // Category cache
  CACHE: createKey('categories', 'cache'),
  CACHE_METADATA: createKey('categories', 'cache_metadata'),
  
  // User category preferences
  PREFERENCES: createKey('categories', 'preferences'),
  HIDDEN_CATEGORIES: createKey('categories', 'hidden'),
  FAVORITE_CATEGORIES: createKey('categories', 'favorites'),
} as const;

/**
 * 🔍 Search-related Storage Keys
 */
export const SEARCH_KEYS = {
  // Search history
  HISTORY: createKey('search', 'history'),
  RECENT_QUERIES: createKey('search', 'recent_queries'),
  
  // Search preferences
  SAVED_FILTERS: createKey('search', 'saved_filters'),
  DEFAULT_FILTERS: createKey('search', 'default_filters'),
  
  // Search cache
  RESULTS_CACHE: createKey('search', 'results_cache'),
  SUGGESTIONS_CACHE: createKey('search', 'suggestions_cache'),
} as const;

/**
 * 📱 App-related Storage Keys
 */
export const APP_KEYS = {
  // App state
  FIRST_LAUNCH: createKey('app', 'first_launch'),
  APP_VERSION: createKey('app', 'version'),
  LAST_OPENED: createKey('app', 'last_opened'),
  
  // App settings
  THEME: createKey('app', 'theme'),
  LANGUAGE: createKey('app', 'language'),
  NOTIFICATIONS_ENABLED: createKey('app', 'notifications_enabled'),
  
  // Onboarding
  ONBOARDING_COMPLETED: createKey('app', 'onboarding_completed'),
  TUTORIAL_STEPS: createKey('app', 'tutorial_steps'),
  FEATURE_INTRODUCTIONS: createKey('app', 'feature_introductions'),
  
  // App behavior
  OFFLINE_MODE: createKey('app', 'offline_mode'),
  AUTO_SYNC: createKey('app', 'auto_sync'),
  CRASH_REPORTS: createKey('app', 'crash_reports'),
} as const;

/**
 * 💾 Cache-related Storage Keys
 */
export const CACHE_KEYS = {
  // General cache
  METADATA: createKey('cache', 'metadata'),
  SIZE_INFO: createKey('cache', 'size_info'),
  LAST_CLEANUP: createKey('cache', 'last_cleanup'),
  
  // Image cache
  IMAGES: createKey('cache', 'images'),
  IMAGE_METADATA: createKey('cache', 'image_metadata'),
  THUMBNAILS: createKey('cache', 'thumbnails'),
  
  // API cache
  API_RESPONSES: createKey('cache', 'api_responses'),
  API_METADATA: createKey('cache', 'api_metadata'),
  
  // Temporary cache
  TEMP_DATA: createKey('cache', 'temp_data'),
  SESSION_CACHE: createKey('cache', 'session'),
} as const;

/**
 * 🔐 Authentication Storage Keys (if needed)
 */
export const AUTH_KEYS = {
  // Authentication tokens
  ACCESS_TOKEN: createKey('auth', 'access_token'),
  REFRESH_TOKEN: createKey('auth', 'refresh_token'),
  TOKEN_EXPIRY: createKey('auth', 'token_expiry'),
  
  // User session
  USER_SESSION: createKey('auth', 'user_session'),
  LOGIN_STATE: createKey('auth', 'login_state'),
  
  // Security
  BIOMETRIC_ENABLED: createKey('auth', 'biometric_enabled'),
  PIN_ENABLED: createKey('auth', 'pin_enabled'),
  LAST_LOGIN: createKey('auth', 'last_login'),
} as const;

/**
 * 📊 Analytics Storage Keys
 */
export const ANALYTICS_KEYS = {
  // Event tracking
  PENDING_EVENTS: createKey('analytics', 'pending_events'),
  EVENT_QUEUE: createKey('analytics', 'event_queue'),
  
  // User tracking
  USER_ID: createKey('analytics', 'user_id'),
  SESSION_ID: createKey('analytics', 'session_id'),
  
  // App usage
  USAGE_STATS: createKey('analytics', 'usage_stats'),
  FEATURE_USAGE: createKey('analytics', 'feature_usage'),
} as const;

/**
 * 🌐 Network Storage Keys
 */
export const NETWORK_KEYS = {
  // Network state
  CONNECTION_STATE: createKey('network', 'connection_state'),
  OFFLINE_QUEUE: createKey('network', 'offline_queue'),
  
  // Sync state
  LAST_SYNC: createKey('network', 'last_sync'),
  SYNC_QUEUE: createKey('network', 'sync_queue'),
  FAILED_REQUESTS: createKey('network', 'failed_requests'),
} as const;

/**
 * 🎯 All Storage Keys Organized
 */
export const STORAGE_KEYS = {
  USER: USER_KEYS,
  RECIPE: RECIPE_KEYS,
  CATEGORY: CATEGORY_KEYS,
  SEARCH: SEARCH_KEYS,
  APP: APP_KEYS,
  CACHE: CACHE_KEYS,
  AUTH: AUTH_KEYS,
  ANALYTICS: ANALYTICS_KEYS,
  NETWORK: NETWORK_KEYS,
} as const;

/**
 * 🔧 Storage Key Utilities
 */
export const StorageKeyUtils = {
  /**
   * Get all keys for a specific module
   */
  getModuleKeys: (module: keyof typeof STORAGE_KEYS) => {
    return Object.values(STORAGE_KEYS[module]);
  },
  
  /**
   * Check if a key belongs to a specific module
   */
  isModuleKey: (key: string, module: keyof typeof STORAGE_KEYS): boolean => {
    return Object.values(STORAGE_KEYS[module]).includes(key as any);
  },
  
  /**
   * Get module name from a key
   */
  getModuleFromKey: (key: string): string | null => {
    const parts = key.replace(PREFIX, '').split('_');
    return parts.length > 0 ? parts[0] : null;
  },
  
  /**
   * Create a custom key with prefix
   */
  createCustomKey: (module: string, key: string): string => {
    return createKey(module, key);
  },
  
  /**
   * Remove prefix from key
   */
  removePrefix: (key: string): string => {
    return key.replace(PREFIX, '');
  },
  
  /**
   * Get all storage keys as flat array
   */
  getAllKeys: (): string[] => {
    return Object.values(STORAGE_KEYS)
      .flatMap(moduleKeys => Object.values(moduleKeys));
  },
  
  /**
   * Validate storage key format
   */
  isValidKey: (key: string): boolean => {
    return key.startsWith(PREFIX) && key.includes('_');
  },
};

/**
 * 📋 Key Categories for Management
 */
export const KEY_CATEGORIES = {
  // Critical data - never auto-delete
  CRITICAL: [
    USER_KEYS.PROFILE,
    USER_KEYS.FAVORITES,
    USER_KEYS.CUSTOM_RECIPES,
    AUTH_KEYS.ACCESS_TOKEN,
  ],
  
  // Important data - delete only when necessary
  IMPORTANT: [
    USER_KEYS.PREFERENCES,
    USER_KEYS.SETTINGS,
    RECIPE_KEYS.RATINGS,
    SEARCH_KEYS.SAVED_FILTERS,
  ],
  
  // Cache data - can be deleted anytime
  CACHE: [
    RECIPE_KEYS.CACHE,
    CATEGORY_KEYS.CACHE,
    CACHE_KEYS.IMAGES,
    CACHE_KEYS.API_RESPONSES,
  ],
  
  // Temporary data - delete frequently
  TEMPORARY: [
    CACHE_KEYS.TEMP_DATA,
    CACHE_KEYS.SESSION_CACHE,
    NETWORK_KEYS.OFFLINE_QUEUE,
    ANALYTICS_KEYS.PENDING_EVENTS,
  ],
} as const;

export default STORAGE_KEYS;