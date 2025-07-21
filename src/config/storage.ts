/**
 * 💾 Storage Configuration
 * 
 * Centralized configuration for all storage-related settings.
 * Includes AsyncStorage keys, cache configurations, and data persistence.
 */

import { CONFIG } from './environment';

/**
 * 🗝️ Storage Keys - Centralized key management
 */
export const STORAGE_KEYS = {
  // User data
  USER: {
    PROFILE: `${CONFIG.STORAGE_PREFIX}user_profile`,
    PREFERENCES: `${CONFIG.STORAGE_PREFIX}user_preferences`,
    FAVORITES: `${CONFIG.STORAGE_PREFIX}user_favorites`,
    RECENT_SEARCHES: `${CONFIG.STORAGE_PREFIX}user_recent_searches`,
    VIEWED_RECIPES: `${CONFIG.STORAGE_PREFIX}user_viewed_recipes`,
    SHOPPING_LIST: `${CONFIG.STORAGE_PREFIX}user_shopping_list`,
  },
  
  // Recipe data
  RECIPES: {
    CACHE: `${CONFIG.STORAGE_PREFIX}recipes_cache`,
    OFFLINE: `${CONFIG.STORAGE_PREFIX}recipes_offline`,
    CUSTOM: `${CONFIG.STORAGE_PREFIX}recipes_custom`,
    RATINGS: `${CONFIG.STORAGE_PREFIX}recipes_ratings`,
    NOTES: `${CONFIG.STORAGE_PREFIX}recipes_notes`,
  },
  
  // Category data
  CATEGORIES: {
    CACHE: `${CONFIG.STORAGE_PREFIX}categories_cache`,
    PREFERENCES: `${CONFIG.STORAGE_PREFIX}categories_preferences`,
  },
  
  // Search data
  SEARCH: {
    HISTORY: `${CONFIG.STORAGE_PREFIX}search_history`,
    FILTERS: `${CONFIG.STORAGE_PREFIX}search_filters`,
    SUGGESTIONS: `${CONFIG.STORAGE_PREFIX}search_suggestions`,
  },
  
  // App state
  APP: {
    FIRST_LAUNCH: `${CONFIG.STORAGE_PREFIX}app_first_launch`,
    VERSION: `${CONFIG.STORAGE_PREFIX}app_version`,
    THEME: `${CONFIG.STORAGE_PREFIX}app_theme`,
    LANGUAGE: `${CONFIG.STORAGE_PREFIX}app_language`,
    ONBOARDING_COMPLETE: `${CONFIG.STORAGE_PREFIX}app_onboarding_complete`,
    LAST_SYNC: `${CONFIG.STORAGE_PREFIX}app_last_sync`,
  },
  
  // Cache metadata
  CACHE: {
    METADATA: `${CONFIG.STORAGE_PREFIX}cache_metadata`,
    IMAGES: `${CONFIG.STORAGE_PREFIX}cache_images`,
    API_RESPONSES: `${CONFIG.STORAGE_PREFIX}cache_api_responses`,
  },
  
  // Authentication (if needed)
  AUTH: {
    TOKEN: `${CONFIG.STORAGE_PREFIX}auth_token`,
    REFRESH_TOKEN: `${CONFIG.STORAGE_PREFIX}auth_refresh_token`,
    USER_SESSION: `${CONFIG.STORAGE_PREFIX}auth_user_session`,
    BIOMETRIC_ENABLED: `${CONFIG.STORAGE_PREFIX}auth_biometric_enabled`,
  },
} as const;

/**
 * ⏰ Cache Configuration
 */
export const CACHE_CONFIG = {
  // Cache durations (in milliseconds)
  TTL: {
    RECIPES: 24 * 60 * 60 * 1000,        // 24 hours
    CATEGORIES: 7 * 24 * 60 * 60 * 1000, // 7 days
    SEARCH_RESULTS: 30 * 60 * 1000,      // 30 minutes
    USER_PROFILE: 60 * 60 * 1000,        // 1 hour
    IMAGES: 7 * 24 * 60 * 60 * 1000,     // 7 days
    API_RESPONSES: 15 * 60 * 1000,       // 15 minutes
  },
  
  // Cache size limits (in bytes)
  SIZE_LIMITS: {
    TOTAL_CACHE: 100 * 1024 * 1024,      // 100 MB
    IMAGES: 50 * 1024 * 1024,            // 50 MB
    RECIPES: 20 * 1024 * 1024,           // 20 MB
    API_RESPONSES: 10 * 1024 * 1024,     // 10 MB
    USER_DATA: 5 * 1024 * 1024,          // 5 MB
  },
  
  // Cache cleanup thresholds
  CLEANUP: {
    TRIGGER_PERCENTAGE: 80,               // Clean when 80% full
    TARGET_PERCENTAGE: 60,                // Clean down to 60%
    CHECK_INTERVAL: 60 * 60 * 1000,       // Check every hour
  },
};

/**
 * 🔄 Sync Configuration
 */
export const SYNC_CONFIG = {
  // Sync intervals (in milliseconds)
  INTERVALS: {
    RECIPES: 6 * 60 * 60 * 1000,         // 6 hours
    CATEGORIES: 24 * 60 * 60 * 1000,     // 24 hours
    USER_DATA: 30 * 60 * 1000,           // 30 minutes
    FAVORITES: 5 * 60 * 1000,            // 5 minutes
  },
  
  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    BACKOFF_MULTIPLIER: 2,
    INITIAL_DELAY: 1000,                  // 1 second
    MAX_DELAY: 30 * 1000,                // 30 seconds
  },
  
  // Batch sizes for sync operations
  BATCH_SIZES: {
    RECIPES: 50,
    FAVORITES: 100,
    SEARCH_HISTORY: 20,
    USER_ACTIONS: 10,
  },
};

/**
 * 📱 Storage Options Configuration
 */
export const STORAGE_OPTIONS = {
  // AsyncStorage options
  asyncStorage: {
    // Enable encryption for sensitive data
    enableEncryption: CONFIG.IS_PROD,
    
    // Compression for large data
    enableCompression: true,
    
    // JSON serialization options
    jsonOptions: {
      space: CONFIG.IS_DEV ? 2 : 0,       // Pretty print in dev
      replacer: null,
      reviver: null,
    },
  },
  
  // Keychain/Keystore options (for sensitive data)
  secureStorage: {
    service: CONFIG.BUNDLE_ID,
    accessGroup: undefined,
    touchID: true,
    showModal: true,
    kLocalizedFallbackTitle: 'Use seu código de acesso',
  },
  
  // File system storage options
  fileSystem: {
    directory: 'RecipeApp',
    enableBackup: false,                  // Exclude from iCloud backup
    createIntermediateDirectories: true,
  },
};

/**
 * 🎯 Data Schema Versions
 */
export const SCHEMA_VERSIONS = {
  CURRENT: '1.0.0',
  
  // Version migration map
  MIGRATIONS: {
    '0.9.0': '1.0.0',  // Example migration
  },
  
  // Schema definitions
  SCHEMAS: {
    '1.0.0': {
      user: {
        version: '1.0.0',
        properties: ['id', 'name', 'email', 'preferences', 'createdAt', 'updatedAt'],
      },
      recipe: {
        version: '1.0.0',
        properties: ['id', 'title', 'description', 'ingredients', 'instructions', 'metadata'],
      },
      category: {
        version: '1.0.0',
        properties: ['id', 'name', 'description', 'imageUrl', 'parentId'],
      },
    },
  },
};

/**
 * 🧹 Cleanup Strategies
 */
export const CLEANUP_STRATEGIES = {
  // Automatic cleanup triggers
  AUTO_CLEANUP: {
    ON_APP_START: true,
    ON_LOW_MEMORY: true,
    ON_CACHE_FULL: true,
    SCHEDULED: true,
  },
  
  // Cleanup priorities (higher number = higher priority to keep)
  PRIORITIES: {
    USER_FAVORITES: 10,
    RECENT_RECIPES: 8,
    USER_PROFILE: 9,
    SEARCH_HISTORY: 5,
    CACHED_IMAGES: 6,
    API_RESPONSES: 3,
    TEMPORARY_DATA: 1,
  },
  
  // Cleanup algorithms
  ALGORITHMS: {
    LRU: 'least_recently_used',    // Remove least recently used
    LFU: 'least_frequently_used',  // Remove least frequently used
    TTL: 'time_to_live',          // Remove expired items
    SIZE: 'largest_first',         // Remove largest items first
  },
};

/**
 * 📊 Storage Analytics Events
 */
export const STORAGE_EVENTS = {
  CACHE_HIT: 'storage_cache_hit',
  CACHE_MISS: 'storage_cache_miss',
  CACHE_CLEAR: 'storage_cache_clear',
  SYNC_START: 'storage_sync_start',
  SYNC_COMPLETE: 'storage_sync_complete',
  SYNC_ERROR: 'storage_sync_error',
  MIGRATION_START: 'storage_migration_start',
  MIGRATION_COMPLETE: 'storage_migration_complete',
  LOW_STORAGE: 'storage_low_space',
} as const;

/**
 * 🔐 Encryption Configuration
 */
export const ENCRYPTION_CONFIG = {
  // Algorithm settings
  algorithm: 'AES-256-GCM',
  keyLength: 256,
  ivLength: 12,
  tagLength: 16,
  
  // Keys to encrypt
  ENCRYPTED_KEYS: [
    STORAGE_KEYS.AUTH.TOKEN,
    STORAGE_KEYS.AUTH.REFRESH_TOKEN,
    STORAGE_KEYS.USER.PROFILE,
    STORAGE_KEYS.AUTH.USER_SESSION,
  ],
  
  // Encryption options
  options: {
    enableCompression: true,
    enableIntegrityCheck: true,
    rotateKeysOnUpgrade: true,
  },
};

/**
 * 🎭 Mock Data Configuration (for development)
 */
export const MOCK_DATA_CONFIG = {
  // Enable mock data in development
  enabled: CONFIG.IS_DEV,
  
  // Mock data sets
  datasets: {
    recipes: 'recipes_mock.json',
    categories: 'categories_mock.json',
    users: 'users_mock.json',
  },
  
  // Mock scenarios
  scenarios: {
    EMPTY_STATE: 'empty',           // No data
    LOADING_STATE: 'loading',       // Show loading
    ERROR_STATE: 'error',           // Show errors
    FULL_STATE: 'full',             // Complete data
  },
};

/**
 * 🎯 Storage Interface Types
 */
export interface StorageMetadata {
  key: string;
  size: number;
  createdAt: number;
  updatedAt: number;
  accessedAt: number;
  accessCount: number;
  ttl?: number;
  version: string;
}

export interface CacheEntry<T = any> {
  data: T;
  metadata: StorageMetadata;
}

export interface SyncStatus {
  lastSync: number;
  nextSync: number;
  inProgress: boolean;
  errors: string[];
}

/**
 * 🛠️ Storage Utilities
 */
export const StorageUtils = {
  /**
   * Check if a cache entry is expired
   */
  isCacheExpired: (metadata: StorageMetadata): boolean => {
    if (!metadata.ttl) return false;
    return Date.now() > metadata.createdAt + metadata.ttl;
  },
  
  /**
   * Calculate storage usage percentage
   */
  getStorageUsage: (currentSize: number, maxSize: number): number => {
    return Math.round((currentSize / maxSize) * 100);
  },
  
  /**
   * Generate cache key with prefix
   */
  generateCacheKey: (key: string, params?: Record<string, any>): string => {
    if (!params) return key;
    
    const paramString = Object.keys(params)
      .sort()
      .map(k => `${k}=${params[k]}`)
      .join('&');
      
    return `${key}?${paramString}`;
  },
  
  /**
   * Calculate data size in bytes
   */
  calculateSize: (data: any): number => {
    return new Blob([JSON.stringify(data)]).size;
  },
  
  /**
   * Check if storage key should be encrypted
   */
  shouldEncrypt: (key: string): boolean => {
    return ENCRYPTION_CONFIG.ENCRYPTED_KEYS.includes(key);
  },
  
  /**
   * Get TTL for storage key
   */
  getTTL: (key: string): number | undefined => {
    // Map storage keys to TTL values
    const ttlMap: Record<string, number> = {
      [STORAGE_KEYS.RECIPES.CACHE]: CACHE_CONFIG.TTL.RECIPES,
      [STORAGE_KEYS.CATEGORIES.CACHE]: CACHE_CONFIG.TTL.CATEGORIES,
      [STORAGE_KEYS.SEARCH.HISTORY]: CACHE_CONFIG.TTL.SEARCH_RESULTS,
      [STORAGE_KEYS.USER.PROFILE]: CACHE_CONFIG.TTL.USER_PROFILE,
      [STORAGE_KEYS.CACHE.IMAGES]: CACHE_CONFIG.TTL.IMAGES,
      [STORAGE_KEYS.CACHE.API_RESPONSES]: CACHE_CONFIG.TTL.API_RESPONSES,
    };
    
    return ttlMap[key];
  },
};

/**
 * 📋 Default Storage Configuration
 */
export const DEFAULT_STORAGE_CONFIG = {
  keys: STORAGE_KEYS,
  cache: CACHE_CONFIG,
  sync: SYNC_CONFIG,
  options: STORAGE_OPTIONS,
  cleanup: CLEANUP_STRATEGIES,
  encryption: ENCRYPTION_CONFIG,
  mock: MOCK_DATA_CONFIG,
  utils: StorageUtils,
};

export default DEFAULT_STORAGE_CONFIG;