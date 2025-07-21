/**
 * 📱 App Constants
 * 
 * General application constants used throughout the RecipeApp.
 * These values define core app behavior and limits.
 */

/**
 * 📊 App Metadata
 */
export const APP_INFO = {
  NAME: 'RecipeApp',
  DISPLAY_NAME: 'Recipe App',
  DESCRIPTION: 'Discover, save and share amazing recipes',
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  BUNDLE_ID: 'com.recipeapp.mobile',
  DEVELOPER: 'RecipeApp Team',
  WEBSITE: 'https://recipeapp.com',
  SUPPORT_EMAIL: 'support@recipeapp.com',
  PRIVACY_URL: 'https://recipeapp.com/privacy',
  TERMS_URL: 'https://recipeapp.com/terms',
} as const;

/**
 * 📏 App Limits & Constraints
 */
export const LIMITS = {
  // Recipe limits
  RECIPE: {
    TITLE_MIN_LENGTH: 3,
    TITLE_MAX_LENGTH: 100,
    DESCRIPTION_MIN_LENGTH: 10,
    DESCRIPTION_MAX_LENGTH: 500,
    INGREDIENTS_MIN: 1,
    INGREDIENTS_MAX: 50,
    INSTRUCTIONS_MIN: 1,
    INSTRUCTIONS_MAX: 30,
    PREP_TIME_MIN: 1,          // minutes
    PREP_TIME_MAX: 1440,       // 24 hours
    COOK_TIME_MIN: 0,          // can be 0 for no-cook recipes
    COOK_TIME_MAX: 2880,       // 48 hours (slow cooking)
    SERVINGS_MIN: 1,
    SERVINGS_MAX: 100,
    TAGS_MAX: 10,
  },
  
  // Search limits
  SEARCH: {
    QUERY_MIN_LENGTH: 2,
    QUERY_MAX_LENGTH: 100,
    RESULTS_PER_PAGE: 20,
    MAX_RECENT_SEARCHES: 10,
    MAX_SEARCH_FILTERS: 5,
  },
  
  // User limits
  USER: {
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
    BIO_MAX_LENGTH: 200,
    MAX_FAVORITES: 1000,
    MAX_CUSTOM_RECIPES: 100,
    MAX_SHOPPING_LIST_ITEMS: 100,
  },
  
  // Image limits
  IMAGE: {
    MAX_SIZE_MB: 10,
    MAX_SIZE_BYTES: 10 * 1024 * 1024,
    MIN_WIDTH: 200,
    MIN_HEIGHT: 200,
    MAX_WIDTH: 2048,
    MAX_HEIGHT: 2048,
    ALLOWED_FORMATS: ['jpg', 'jpeg', 'png', 'webp'] as const,
  },
  
  // Cache limits
  CACHE: {
    MAX_RECIPES_CACHED: 500,
    MAX_IMAGES_CACHED: 200,
    MAX_CACHE_SIZE_MB: 100,
  },
} as const;

/**
 * 🎨 UI Constants
 */
export const UI = {
  // Loading delays
  LOADING: {
    MIN_DISPLAY_TIME: 500,     // Minimum time to show loading
    TIMEOUT: 10000,            // 10 seconds timeout
    DEBOUNCE_SEARCH: 300,      // Search input debounce
    DEBOUNCE_SCROLL: 100,      // Scroll event debounce
  },
  
  // Animation durations
  ANIMATION: {
    FAST: 150,
    NORMAL: 250,
    SLOW: 400,
    SPRING: 300,
  },
  
  // List configurations
  LIST: {
    INITIAL_LOAD: 20,
    LOAD_MORE_THRESHOLD: 0.7,  // Load more when 70% scrolled
    REFRESH_THRESHOLD: 100,    // Pull to refresh threshold
  },
  
  // Image placeholders
  PLACEHOLDERS: {
    RECIPE_IMAGE: 'https://via.placeholder.com/400x300/FFC107/FFFFFF?text=Recipe',
    CATEGORY_IMAGE: 'https://via.placeholder.com/200x150/4CAF50/FFFFFF?text=Category',
    USER_AVATAR: 'https://via.placeholder.com/100x100/9E9E9E/FFFFFF?text=User',
  },
} as const;

/**
 * 🌐 API Constants
 */
export const API = {
  // Endpoints
  ENDPOINTS: {
    RECIPES: '/recipes',
    CATEGORIES: '/categories',
    SEARCH: '/search',
    FAVORITES: '/favorites',
    USER_PROFILE: '/user/profile',
    UPLOAD_IMAGE: '/upload/image',
  },
  
  // Request configurations
  TIMEOUTS: {
    DEFAULT: 10000,            // 10 seconds
    UPLOAD: 30000,            // 30 seconds for uploads
    DOWNLOAD: 60000,          // 1 minute for downloads
  },
  
  // Retry configurations
  RETRY: {
    MAX_ATTEMPTS: 3,
    BACKOFF_MULTIPLIER: 2,
    INITIAL_DELAY: 1000,
  },
  
  // Status codes
  STATUS_CODES: {
    SUCCESS: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500,
  },
} as const;

/**
 * 📊 Analytics Events
 */
export const ANALYTICS_EVENTS = {
  // App lifecycle
  APP_LAUNCHED: 'app_launched',
  APP_BACKGROUNDED: 'app_backgrounded',
  APP_FOREGROUNDED: 'app_foregrounded',
  
  // User actions
  RECIPE_VIEWED: 'recipe_viewed',
  RECIPE_FAVORITED: 'recipe_favorited',
  RECIPE_UNFAVORITED: 'recipe_unfavorited',
  RECIPE_SHARED: 'recipe_shared',
  RECIPE_RATED: 'recipe_rated',
  
  // Search actions
  SEARCH_PERFORMED: 'search_performed',
  SEARCH_FILTER_APPLIED: 'search_filter_applied',
  SEARCH_RESULT_CLICKED: 'search_result_clicked',
  
  // Navigation
  SCREEN_VIEWED: 'screen_viewed',
  TAB_SWITCHED: 'tab_switched',
  
  // Errors
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',
  CRASH_DETECTED: 'crash_detected',
} as const;

/**
 * 🔤 Regular Expressions
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s-()]+$/,
  URL: /^https?:\/\/.+/,
  NUMBERS_ONLY: /^\d+$/,
  LETTERS_ONLY: /^[a-zA-Z\s]+$/,
  ALPHANUMERIC: /^[a-zA-Z0-9\s]+$/,
  RECIPE_TITLE: /^[a-zA-Z0-9\s\-',().&]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
} as const;

/**
 * 🌍 Internationalization
 */
export const I18N = {
  DEFAULT_LANGUAGE: 'pt-BR',
  SUPPORTED_LANGUAGES: ['pt-BR', 'en-US', 'es-ES'] as const,
  DATE_FORMATS: {
    SHORT: 'dd/MM/yyyy',
    LONG: 'dd \'de\' MMMM \'de\' yyyy',
    TIME: 'HH:mm',
    FULL: 'dd/MM/yyyy HH:mm',
  },
  CURRENCY: {
    DEFAULT: 'BRL',
    SYMBOL: 'R$',
  },
} as const;

/**
 * 🎯 Feature Flags (Default Values)
 */
export const DEFAULT_FEATURE_FLAGS = {
  ENABLE_ANALYTICS: false,
  ENABLE_CRASH_REPORTING: false,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_SOCIAL_SHARING: true,
  ENABLE_RECIPE_RATING: true,
  ENABLE_AI_RECOMMENDATIONS: false,
  ENABLE_DARK_MODE: true,
  ENABLE_BIOMETRIC_AUTH: false,
} as const;

/**
 * 📱 Platform Constants
 */
export const PLATFORM = {
  IS_IOS: require('react-native').Platform.OS === 'ios',
  IS_ANDROID: require('react-native').Platform.OS === 'android',
  IS_WEB: require('react-native').Platform.OS === 'web',
  
  // Platform-specific configurations
  IOS: {
    MIN_VERSION: '12.0',
    HAPTIC_FEEDBACK: true,
  },
  ANDROID: {
    MIN_SDK: 21,
    VIBRATION: true,
  },
} as const;

/**
 * 🍳 Recipe-specific Constants
 */
export const RECIPE_CONSTANTS = {
  // Difficulty levels
  DIFFICULTY_LEVELS: {
    EASY: { value: 1, label: 'Fácil', color: '#4CAF50' },
    MEDIUM: { value: 2, label: 'Médio', color: '#FF9800' },
    HARD: { value: 3, label: 'Difícil', color: '#F44336' },
  } as const,
  
  // Dietary restrictions
  DIETARY_TYPES: {
    VEGETARIAN: 'vegetarian',
    VEGAN: 'vegan',
    GLUTEN_FREE: 'gluten_free',
    DAIRY_FREE: 'dairy_free',
    KETO: 'keto',
    PALEO: 'paleo',
    LOW_CARB: 'low_carb',
    HIGH_PROTEIN: 'high_protein',
  } as const,
  
  // Meal types
  MEAL_TYPES: {
    BREAKFAST: 'breakfast',
    LUNCH: 'lunch',
    DINNER: 'dinner',
    SNACK: 'snack',
    DESSERT: 'dessert',
    DRINK: 'drink',
  } as const,
  
  // Cooking methods
  COOKING_METHODS: {
    BAKING: 'baking',
    FRYING: 'frying',
    GRILLING: 'grilling',
    BOILING: 'boiling',
    STEAMING: 'steaming',
    ROASTING: 'roasting',
    NO_COOK: 'no_cook',
  } as const,
  
  // Measurement units
  UNITS: {
    // Volume
    ML: 'ml',
    L: 'l',
    CUP: 'xícara',
    TABLESPOON: 'colher de sopa',
    TEASPOON: 'colher de chá',
    
    // Weight
    G: 'g',
    KG: 'kg',
    
    // Quantity
    UNIT: 'unidade',
    SLICE: 'fatia',
    PIECE: 'pedaço',
    CLOVE: 'dente',
    BUNCH: 'maço',
  } as const,
} as const;

/**
 * 🎉 Export all constants
 */
export const AppConstants = {
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
} as const;

export default AppConstants;