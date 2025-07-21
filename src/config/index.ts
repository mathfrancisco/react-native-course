/**
 * 📋 Configuration Index
 * 
 * Central export point for all configuration modules.
 * This file provides a single import point for all app configurations.
 */

// Environment Configuration
export {
  CONFIG,
  ENV,
  isDevelopment,
  isProduction,
  isStaging,
  isFeatureEnabled,
  isDevToolEnabled,
  getAppInfo,
  getApiConfig,
} from './environment';

export type {
  Environment,
  EnvironmentConfig,
} from './environment';

// Theme Configuration
export {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  Layout,
  Animation,
  ComponentThemes,
  LightTheme,
  DefaultDarkTheme,
  DarkTheme,
} from './theme';

export type {
  ThemeInterface,
} from './theme';

// Navigation Configuration
export {
  SCREEN_NAMES,
  STACK_NAMES,
  TAB_NAMES,
  SCREEN_OPTIONS,
  DEEP_LINKING_CONFIG,
  TAB_ICONS,
  TAB_LABELS,
  SCREEN_TITLES,
  TRANSITIONS,
  GESTURE_CONFIG,
  NAVIGATION_EVENTS,
  NavigationUtils,
  DEFAULT_NAVIGATION_CONFIG,
} from './navigation';

export type {
  ScreenName,
  StackName,
  TabName,
  RouteParams,
} from './navigation';

// Storage Configuration
export {
  STORAGE_KEYS,
  CACHE_CONFIG,
  SYNC_CONFIG,
  STORAGE_OPTIONS,
  SCHEMA_VERSIONS,
  CLEANUP_STRATEGIES,
  STORAGE_EVENTS,
  ENCRYPTION_CONFIG,
  MOCK_DATA_CONFIG,
  StorageUtils,
  DEFAULT_STORAGE_CONFIG,
} from './storage';

export type {
  StorageMetadata,
  CacheEntry,
  SyncStatus,
} from './storage';

/**
 * 🎯 Unified Configuration Object
 * 
 * Single object containing all app configurations.
 * Use this for easy access to all config values.
 */
export const AppConfig = {
  // Environment settings
  environment: CONFIG,
  
  // Visual design system
  theme: LightTheme,
  
  // Navigation setup
  navigation: DEFAULT_NAVIGATION_CONFIG,
  
  // Storage configuration
  storage: DEFAULT_STORAGE_CONFIG,
  
  // App metadata
  app: {
    name: CONFIG.APP_NAME,
    version: CONFIG.APP_VERSION,
    bundleId: CONFIG.BUNDLE_ID,
    environment: CONFIG.NODE_ENV,
  },
} as const;

/**
 * 🔧 Configuration Utilities
 */
export const ConfigUtils = {
  /**
   * Get configuration for current environment
   */
  getCurrentConfig: () => CONFIG,
  
  /**
   * Check if feature is enabled
   */
  isFeatureEnabled: (feature: keyof typeof CONFIG.FEATURES) => {
    return CONFIG.FEATURES[feature];
  },
  
  /**
   * Get theme for current mode
   */
  getTheme: (isDark: boolean = false) => {
    return isDark ? DefaultDarkTheme : LightTheme;
  },
  
  /**
   * Get storage key with environment prefix
   */
  getStorageKey: (key: string) => {
    return `${CONFIG.STORAGE_PREFIX}${key}`;
  },
  
  /**
   * Log current configuration (development only)
   */
  logConfig: () => {
    if (CONFIG.IS_DEV) {
      console.group('🔧 App Configuration');
      console.log('Environment:', CONFIG.NODE_ENV);
      console.log('API URL:', CONFIG.API_BASE_URL);
      console.log('Features:', CONFIG.FEATURES);
      console.log('Dev Tools:', CONFIG.DEV_TOOLS);
      console.groupEnd();
    }
  },
};

// Initialize configuration logging in development
if (CONFIG.IS_DEV) {
  ConfigUtils.logConfig();
}

export default AppConfig;