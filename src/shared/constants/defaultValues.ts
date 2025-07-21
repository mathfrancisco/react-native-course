/**
 * 🎯 Default Values
 * 
 * Default values used throughout the RecipeApp.
 * These provide sensible fallbacks and initial states.
 */

import { RECIPE_CONSTANTS } from './appConstants';

/**
 * 👤 User Default Values
 */
export const USER_DEFAULTS = {
  // Profile defaults
  PROFILE: {
    name: '',
    email: '',
    bio: '',
    avatar: null,
    location: '',
    dateJoined: null,
    isEmailVerified: false,
    isPremium: false,
  },
  
  // User preferences
  PREFERENCES: {
    language: 'pt-BR',
    theme: 'light' as 'light' | 'dark' | 'auto',
    notifications: {
      push: true,
      email: false,
      newRecipes: true,
      recommendations: true,
      favorites: false,
    },
    privacy: {
      showProfile: true,
      showFavorites: false,
      allowRecommendations: true,
    },
    units: {
      temperature: 'celsius' as 'celsius' | 'fahrenheit',
      weight: 'metric' as 'metric' | 'imperial',
      volume: 'metric' as 'metric' | 'imperial',
    },
  },
  
  // User activity
  ACTIVITY: {
    favorites: [],
    recentRecipes: [],
    viewedRecipes: [],
    customRecipes: [],
    shoppingList: [],
    cookingHistory: [],
  },
  
  // User stats
  STATS: {
    recipesCooked: 0,
    favoriteRecipes: 0,
    recipesCreated: 0,
    totalCookingTime: 0,
    averageRating: 0,
    achievements: [],
  },
} as const;

/**
 * 🍳 Recipe Default Values
 */
export const RECIPE_DEFAULTS = {
  // New recipe defaults
  NEW_RECIPE: {
    title: '',
    description: '',
    ingredients: [
      {
        name: '',
        amount: 1,
        unit: RECIPE_CONSTANTS.UNITS.UNIT,
        notes: '',
        isOptional: false,
      }
    ],
    instructions: [
      {
        stepNumber: 1,
        description: '',
        imageUrl: null,
        timer: null,
        temperature: null,
        notes: '',
      }
    ],
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    difficulty: RECIPE_CONSTANTS.DIFFICULTY_LEVELS.MEDIUM.value,
    category: '',
    imageUrl: null,
    tags: [],
    nutrition: null,
    isPublic: true,
    source: 'user_created',
  },
  
  // Recipe filters
  FILTERS: {
    query: '',
    categories: [],
    difficulty: [],
    maxPrepTime: null,
    maxCookTime: null,
    servings: { min: null, max: null },
    dietary: [],
    mealType: [],
    cookingMethod: [],
    ingredients: { include: [], exclude: [] },
    rating: { min: 0, max: 5 },
    sortBy: 'relevance' as 'relevance' | 'rating' | 'prepTime' | 'cookTime' | 'newest',
    sortOrder: 'desc' as 'asc' | 'desc',
  },
  
  // Recipe display options
  DISPLAY: {
    viewType: 'grid' as 'grid' | 'list',
    showNutrition: true,
    showDifficulty: true,
    showTime: true,
    showServings: true,
    showRating: true,
    showImage: true,
  },
  
  // Recipe interaction
  INTERACTION: {
    rating: 0,
    review: '',
    isFavorite: false,
    isBookmarked: false,
    cookingNotes: '',
    personalRating: 0,
    timesCooked: 0,
    lastCooked: null,
  },
} as const;

/**
 * 📂 Category Default Values
 */
export const CATEGORY_DEFAULTS = {
  // Category structure
  CATEGORY: {
    id: '',
    name: '',
    description: '',
    imageUrl: null,
    parentId: null,
    isActive: true,
    sortOrder: 0,
    recipeCount: 0,
    color: '#FFC107',
    icon: 'restaurant',
  },
  
  // Category preferences
  PREFERENCES: {
    favoriteCategories: [],
    hiddenCategories: [],
    customOrder: [],
    showSubcategories: true,
    groupByMealType: false,
  },
} as const;

/**
 * 🔍 Search Default Values
 */
export const SEARCH_DEFAULTS = {
  // Search state
  STATE: {
    query: '',
    isLoading: false,
    hasSearched: false,
    results: [],
    suggestions: [],
    filters: RECIPE_DEFAULTS.FILTERS,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      hasMore: true,
    },
  },
  
  // Search history
  HISTORY: {
    recentQueries: [],
    savedFilters: [],
    popularSearches: [],
    maxHistoryItems: 10,
  },
  
  // Search configuration
  CONFIG: {
    enableAutocomplete: true,
    enableSuggestions: true,
    enableFilters: true,
    debounceDelay: 300,
    minQueryLength: 2,
    maxQueryLength: 100,
  },
} as const;

/**
 * 📱 App Default Values
 */
export const APP_DEFAULTS = {
  // App state
  STATE: {
    isFirstLaunch: true,
    hasCompletedOnboarding: false,
    currentVersion: '1.0.0',
    lastOpenedDate: null,
    sessionCount: 0,
    totalUsageTime: 0,
  },
  
  // App settings
  SETTINGS: {
    theme: 'light' as 'light' | 'dark' | 'auto',
    language: 'pt-BR',
    region: 'BR',
    currency: 'BRL',
    units: 'metric' as 'metric' | 'imperial',
    accessibility: {
      fontSize: 'medium' as 'small' | 'medium' | 'large',
      highContrast: false,
      reduceMotion: false,
      screenReader: false,
    },
  },
  
  // Feature flags
  FEATURES: {
    enableAnalytics: false,
    enableCrashReporting: false,
    enableOfflineMode: true,
    enablePushNotifications: true,
    enableSocialSharing: true,
    enableRecipeRating: true,
    enableAIRecommendations: false,
  },
  
  // Performance settings
  PERFORMANCE: {
    enableImageCaching: true,
    enableDataCaching: true,
    maxCacheSize: 100, // MB
    autoCleanup: true,
    lazyLoading: true,
  },
} as const;

/**
 * 🌐 Network Default Values
 */
export const NETWORK_DEFAULTS = {
  // Connection state
  CONNECTION: {
    isConnected: true,
    connectionType: 'unknown' as 'wifi' | 'cellular' | 'ethernet' | 'unknown',
    isInternetReachable: true,
    isOfflineMode: false,
  },
  
  // API configuration
  API: {
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
    maxConcurrentRequests: 5,
    enableCache: true,
    cacheTimeout: 300000, // 5 minutes
  },
  
  // Offline configuration
  OFFLINE: {
    enableOfflineMode: true,
    maxOfflineStorage: 50, // MB
    syncOnReconnect: true,
    notifyWhenOffline: true,
    fallbackToCache: true,
  },
} as const;

/**
 * 💾 Cache Default Values
 */
export const CACHE_DEFAULTS = {
  // Cache settings
  SETTINGS: {
    maxSize: 100 * 1024 * 1024, // 100 MB
    defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
    cleanupThreshold: 0.8, // Clean when 80% full
    enableCompression: true,
    enableEncryption: false,
  },
  
  // Cache priorities
  PRIORITIES: {
    user: 10,
    recipes: 8,
    images: 6,
    categories: 7,
    search: 4,
    temporary: 1,
  },
  
  // Cache strategies
  STRATEGIES: {
    user: 'persist', // Never auto-delete
    recipes: 'lru',   // Least recently used
    images: 'lfu',    // Least frequently used
    search: 'ttl',    // Time to live
    temporary: 'fifo', // First in, first out
  },
} as const;

/**
 * 📊 Analytics Default Values
 */
export const ANALYTICS_DEFAULTS = {
  // User tracking
  USER: {
    userId: null,
    sessionId: null,
    isOptedIn: false,
    trackingEnabled: false,
    personalizationEnabled: false,
  },
  
  // Event configuration
  EVENTS: {
    batchSize: 10,
    flushInterval: 30000, // 30 seconds
    maxRetries: 3,
    enableDebug: false,
    trackScreenViews: true,
    trackUserActions: true,
    trackErrors: true,
  },
  
  // Privacy settings
  PRIVACY: {
    anonymizeData: true,
    respectDoNotTrack: true,
    dataRetentionDays: 90,
    shareWithThirdParties: false,
  },
} as const;

/**
 * 🎨 UI Default Values
 */
export const UI_DEFAULTS = {
  // Loading states
  LOADING: {
    showSkeleton: true,
    showSpinner: false,
    showProgress: false,
    minimumDisplayTime: 500,
    timeout: 10000,
  },
  
  // Animation preferences
  ANIMATIONS: {
    enableAnimations: true,
    animationSpeed: 'normal' as 'slow' | 'normal' | 'fast',
    enableGestures: true,
    enableHaptics: true,
    reduceMotion: false,
  },
  
  // Layout preferences
  LAYOUT: {
    compactMode: false,
    showGrid: true,
    itemsPerRow: 2,
    enableInfiniteScroll: true,
    enablePullToRefresh: true,
  },
} as const;

/**
 * 📋 All Default Values
 */
export const DEFAULT_VALUES = {
  USER: USER_DEFAULTS,
  RECIPE: RECIPE_DEFAULTS,
  CATEGORY: CATEGORY_DEFAULTS,
  SEARCH: SEARCH_DEFAULTS,
  APP: APP_DEFAULTS,
  NETWORK: NETWORK_DEFAULTS,
  CACHE: CACHE_DEFAULTS,
  ANALYTICS: ANALYTICS_DEFAULTS,
  UI: UI_DEFAULTS,
} as const;

export default DEFAULT_VALUES;