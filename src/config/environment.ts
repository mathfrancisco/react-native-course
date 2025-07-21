/**
 * 🌍 Environment Configuration
 * 
 * Centralized configuration for all environment-specific settings.
 * Supports development, staging, and production environments.
 */

export type Environment = 'development' | 'staging' | 'production';

export interface EnvironmentConfig {
  // App identification
  APP_NAME: string;
  APP_VERSION: string;
  BUNDLE_ID: string;
  
  // Environment info
  NODE_ENV: Environment;
  IS_DEV: boolean;
  IS_PROD: boolean;
  
  // API configuration
  API_BASE_URL: string;
  API_TIMEOUT: number;
  API_RETRY_ATTEMPTS: number;
  
  // Storage configuration
  STORAGE_ENCRYPTION_KEY?: string;
  STORAGE_PREFIX: string;
  
  // Feature flags
  FEATURES: {
    ENABLE_ANALYTICS: boolean;
    ENABLE_CRASH_REPORTING: boolean;
    ENABLE_OFFLINE_MODE: boolean;
    ENABLE_PUSH_NOTIFICATIONS: boolean;
    ENABLE_SOCIAL_SHARING: boolean;
    ENABLE_RECIPE_RATING: boolean;
    ENABLE_AI_RECOMMENDATIONS: boolean;
  };
  
  // Development tools
  DEV_TOOLS: {
    ENABLE_FLIPPER: boolean;
    ENABLE_REACTOTRON: boolean;
    ENABLE_DEV_MENU: boolean;
    SHOW_PERFORMANCE_MONITOR: boolean;
  };
  
  // Logging configuration
  LOGGING: {
    LEVEL: 'debug' | 'info' | 'warn' | 'error';
    ENABLE_CONSOLE: boolean;
    ENABLE_FILE_LOGGING: boolean;
    MAX_LOG_FILES: number;
  };
}

/**
 * 🔧 Base configuration shared across all environments
 */
const baseConfig = {
  APP_NAME: 'RecipeApp',
  APP_VERSION: '1.0.0',
  BUNDLE_ID: 'com.recipeapp.mobile',
  API_TIMEOUT: 10000, // 10 seconds
  API_RETRY_ATTEMPTS: 3,
  STORAGE_PREFIX: 'recipeapp_',
};

/**
 * 🛠️ Development Environment Configuration
 */
const developmentConfig: EnvironmentConfig = {
  ...baseConfig,
  NODE_ENV: 'development',
  IS_DEV: true,
  IS_PROD: false,
  
  // Local development API
  API_BASE_URL: 'http://localhost:3000/api',
  
  // Enable all features for testing
  FEATURES: {
    ENABLE_ANALYTICS: false, // Disabled in dev
    ENABLE_CRASH_REPORTING: false, // Disabled in dev
    ENABLE_OFFLINE_MODE: true,
    ENABLE_PUSH_NOTIFICATIONS: true,
    ENABLE_SOCIAL_SHARING: true,
    ENABLE_RECIPE_RATING: true,
    ENABLE_AI_RECOMMENDATIONS: true,
  },
  
  // Enable all dev tools
  DEV_TOOLS: {
    ENABLE_FLIPPER: true,
    ENABLE_REACTOTRON: true,
    ENABLE_DEV_MENU: true,
    SHOW_PERFORMANCE_MONITOR: true,
  },
  
  // Verbose logging for development
  LOGGING: {
    LEVEL: 'debug',
    ENABLE_CONSOLE: true,
    ENABLE_FILE_LOGGING: true,
    MAX_LOG_FILES: 5,
  },
};

/**
 * 🧪 Staging Environment Configuration
 */
const stagingConfig: EnvironmentConfig = {
  ...baseConfig,
  NODE_ENV: 'staging',
  IS_DEV: false,
  IS_PROD: false,
  
  // Staging API
  API_BASE_URL: 'https://api-staging.recipeapp.com',
  
  // Most features enabled for testing
  FEATURES: {
    ENABLE_ANALYTICS: true,
    ENABLE_CRASH_REPORTING: true,
    ENABLE_OFFLINE_MODE: true,
    ENABLE_PUSH_NOTIFICATIONS: true,
    ENABLE_SOCIAL_SHARING: true,
    ENABLE_RECIPE_RATING: true,
    ENABLE_AI_RECOMMENDATIONS: false, // Still testing
  },
  
  // Limited dev tools
  DEV_TOOLS: {
    ENABLE_FLIPPER: false,
    ENABLE_REACTOTRON: false,
    ENABLE_DEV_MENU: false,
    SHOW_PERFORMANCE_MONITOR: false,
  },
  
  // Info level logging
  LOGGING: {
    LEVEL: 'info',
    ENABLE_CONSOLE: false,
    ENABLE_FILE_LOGGING: true,
    MAX_LOG_FILES: 3,
  },
};

/**
 * 🚀 Production Environment Configuration
 */
const productionConfig: EnvironmentConfig = {
  ...baseConfig,
  NODE_ENV: 'production',
  IS_DEV: false,
  IS_PROD: true,
  
  // Production API
  API_BASE_URL: 'https://api.recipeapp.com',
  
  // Stable features only
  FEATURES: {
    ENABLE_ANALYTICS: true,
    ENABLE_CRASH_REPORTING: true,
    ENABLE_OFFLINE_MODE: true,
    ENABLE_PUSH_NOTIFICATIONS: true,
    ENABLE_SOCIAL_SHARING: true,
    ENABLE_RECIPE_RATING: true,
    ENABLE_AI_RECOMMENDATIONS: true,
  },
  
  // No dev tools in production
  DEV_TOOLS: {
    ENABLE_FLIPPER: false,
    ENABLE_REACTOTRON: false,
    ENABLE_DEV_MENU: false,
    SHOW_PERFORMANCE_MONITOR: false,
  },
  
  // Error level logging only
  LOGGING: {
    LEVEL: 'error',
    ENABLE_CONSOLE: false,
    ENABLE_FILE_LOGGING: true,
    MAX_LOG_FILES: 1,
  },
};

/**
 * 🎯 Get current environment configuration
 */
function getCurrentEnvironment(): Environment {
  // Read from environment variable or default to development
  const env = process.env.NODE_ENV as Environment;
  
  if (env === 'production' || env === 'staging') {
    return env;
  }
  
  return 'development';
}

/**
 * 📋 Configuration mapping
 */
const configs: Record<Environment, EnvironmentConfig> = {
  development: developmentConfig,
  staging: stagingConfig,
  production: productionConfig,
};

/**
 * 🌍 Current active configuration
 */
export const ENV = getCurrentEnvironment();
export const CONFIG = configs[ENV];

/**
 * 🔍 Utility functions for environment checking
 */
export const isDevelopment = () => CONFIG.IS_DEV;
export const isProduction = () => CONFIG.IS_PROD;
export const isStaging = () => CONFIG.NODE_ENV === 'staging';

/**
 * 🎛️ Feature flag helpers
 */
export const isFeatureEnabled = (feature: keyof EnvironmentConfig['FEATURES']): boolean => {
  return CONFIG.FEATURES[feature];
};

/**
 * 🛠️ Dev tool helpers
 */
export const isDevToolEnabled = (tool: keyof EnvironmentConfig['DEV_TOOLS']): boolean => {
  return CONFIG.DEV_TOOLS[tool];
};

/**
 * 📱 App information helpers
 */
export const getAppInfo = () => ({
  name: CONFIG.APP_NAME,
  version: CONFIG.APP_VERSION,
  bundleId: CONFIG.BUNDLE_ID,
  environment: CONFIG.NODE_ENV,
});

/**
 * 🔐 Security helpers
 */
export const getApiConfig = () => ({
  baseURL: CONFIG.API_BASE_URL,
  timeout: CONFIG.API_TIMEOUT,
  retryAttempts: CONFIG.API_RETRY_ATTEMPTS,
});

// Log current configuration in development
if (isDevelopment()) {
  console.log('🌍 Environment Configuration:', {
    environment: ENV,
    apiBaseUrl: CONFIG.API_BASE_URL,
    features: Object.entries(CONFIG.FEATURES)
      .filter(([, enabled]) => enabled)
      .map(([feature]) => feature),
  });
}

export default CONFIG;