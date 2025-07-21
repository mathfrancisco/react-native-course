/**
 * 🧭 Navigation Constants
 * 
 * Constants related to navigation behavior, animations, and configurations.
 * Complements the main navigation config with reusable values.
 */

/**
 * ⏱️ Animation Timings
 */
export const NAVIGATION_TIMINGS = {
  // Transition durations (milliseconds)
  SCREEN_TRANSITION: 250,
  TAB_TRANSITION: 150,
  MODAL_TRANSITION: 300,
  DRAWER_TRANSITION: 200,
  
  // Gesture response
  GESTURE_RESPONSE_DISTANCE: 50,
  SWIPE_VELOCITY_THRESHOLD: 0.5,
  
  // Loading delays
  NAVIGATION_DELAY: 100,      // Delay before navigation
  BACK_HANDLER_DELAY: 300,    // Double-tap to exit delay
} as const;

/**
 * 📐 Navigation Dimensions
 */
export const NAVIGATION_DIMENSIONS = {
  // Header
  HEADER_HEIGHT: 56,
  HEADER_HEIGHT_LARGE: 96,    // For large titles
  HEADER_BUTTON_SIZE: 44,
  
  // Tab Bar
  TAB_BAR_HEIGHT: 60,
  TAB_BAR_ICON_SIZE: 24,
  TAB_BAR_PADDING: 8,
  
  // Drawer
  DRAWER_WIDTH: 280,
  DRAWER_OVERLAY_OPACITY: 0.5,
  
  // Modal
  MODAL_BORDER_RADIUS: 16,
  MODAL_HANDLE_WIDTH: 40,
  MODAL_HANDLE_HEIGHT: 4,
  
  // Safe areas
  STATUS_BAR_HEIGHT_IOS: 44,
  STATUS_BAR_HEIGHT_ANDROID: 24,
  BOTTOM_SAFE_AREA_IOS: 34,
} as const;

/**
 * 🎨 Navigation Colors
 */
export const NAVIGATION_COLORS = {
  // Light theme
  LIGHT: {
    BACKGROUND: '#FFFFFF',
    SURFACE: '#FFFFFF',
    PRIMARY: '#FFC107',
    TEXT: '#212121',
    TEXT_SECONDARY: '#757575',
    BORDER: '#E0E0E0',
    INACTIVE: '#9E9E9E',
    OVERLAY: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Dark theme
  DARK: {
    BACKGROUND: '#121212',
    SURFACE: '#1E1E1E',
    PRIMARY: '#FFC107',
    TEXT: '#FFFFFF',
    TEXT_SECONDARY: '#B3B3B3',
    BORDER: '#3C3C3C',
    INACTIVE: '#666666',
    OVERLAY: 'rgba(0, 0, 0, 0.7)',
  },
} as const;

/**
 * 📱 Platform-specific Navigation Constants
 */
export const PLATFORM_NAVIGATION = {
  IOS: {
    // iOS-specific configurations
    HEADER_TITLE_FONT_SIZE: 17,
    HEADER_LARGE_TITLE_FONT_SIZE: 34,
    TAB_BAR_LABEL_FONT_SIZE: 10,
    SWIPE_BACK_ENABLED: true,
    MODAL_PRESENTATION: 'pageSheet' as const,
    
    // iOS haptic feedback
    HAPTIC_FEEDBACK: {
      LIGHT: 'light' as const,
      MEDIUM: 'medium' as const,
      HEAVY: 'heavy' as const,
    },
  },
  
  ANDROID: {
    // Android-specific configurations
    HEADER_TITLE_FONT_SIZE: 20,
    TAB_BAR_LABEL_FONT_SIZE: 12,
    ELEVATION: 4,
    RIPPLE_COLOR: 'rgba(255, 193, 7, 0.2)',
    
    // Android vibration patterns
    VIBRATION: {
      SHORT: 50,
      MEDIUM: 100,
      LONG: 200,
    },
  },
} as const;

/**
 * 🔄 Navigation Transitions
 */
export const NAVIGATION_TRANSITIONS = {
  // Slide transitions
  SLIDE_FROM_RIGHT: 'slideFromRight',
  SLIDE_FROM_LEFT: 'slideFromLeft',
  SLIDE_FROM_BOTTOM: 'slideFromBottom',
  SLIDE_FROM_TOP: 'slideFromTop',
  
  // Fade transitions
  FADE: 'fade',
  FADE_FROM_BOTTOM: 'fadeFromBottom',
  
  // Scale transitions
  SCALE: 'scale',
  SCALE_FROM_CENTER: 'scaleFromCenter',
  
  // Custom transitions
  FLIP: 'flip',
  PUSH: 'push',
  COVER: 'cover',
} as const;

/**
 * 🎭 Navigation Gestures
 */
export const NAVIGATION_GESTURES = {
  // Gesture types
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
  
  // Gesture directions
  LEFT_TO_RIGHT: 'leftToRight',
  RIGHT_TO_LEFT: 'rightToLeft',
  TOP_TO_BOTTOM: 'topToBottom',
  BOTTOM_TO_TOP: 'bottomToTop',
  
  // Gesture configurations
  SWIPE_AREA_WIDTH: 20,       // Edge swipe area
  MINIMUM_VELOCITY: 150,      // Minimum velocity to trigger
  MAXIMUM_DURATION: 300,      // Maximum gesture duration
} as const;

/**
 * 📊 Navigation Analytics
 */
export const NAVIGATION_ANALYTICS = {
  // Event types
  EVENTS: {
    SCREEN_VIEW: 'navigation_screen_view',
    TAB_PRESS: 'navigation_tab_press',
    HEADER_BUTTON_PRESS: 'navigation_header_button_press',
    BACK_BUTTON_PRESS: 'navigation_back_button_press',
    DEEP_LINK_OPEN: 'navigation_deep_link_open',
    MODAL_OPEN: 'navigation_modal_open',
    MODAL_CLOSE: 'navigation_modal_close',
    DRAWER_OPEN: 'navigation_drawer_open',
    DRAWER_CLOSE: 'navigation_drawer_close',
  },
  
  // Properties to track
  PROPERTIES: {
    SCREEN_NAME: 'screen_name',
    PREVIOUS_SCREEN: 'previous_screen',
    TAB_NAME: 'tab_name',
    TRANSITION_TYPE: 'transition_type',
    GESTURE_USED: 'gesture_used',
    TIME_SPENT: 'time_spent_seconds',
  },
} as const;

/**
 * 🔗 Deep Link Patterns
 */
export const DEEP_LINK_PATTERNS = {
  // URL patterns
  RECIPE_DETAIL: '/recipe/:recipeId',
  CATEGORY_RECIPES: '/category/:categoryId/recipes',
  SEARCH_RESULTS: '/search?q=:query',
  USER_PROFILE: '/user/:userId',
  
  // Custom scheme patterns
  SHARE_RECIPE: 'recipeapp://share/recipe/:recipeId',
  OPEN_CATEGORY: 'recipeapp://category/:categoryId',
  SEARCH_QUERY: 'recipeapp://search?q=:query',
  
  // Universal link patterns
  UNIVERSAL_RECIPE: 'https://recipeapp.com/recipe/:recipeId',
  UNIVERSAL_CATEGORY: 'https://recipeapp.com/category/:categoryId',
} as const;

/**
 * 🎯 Navigation Priorities
 */
export const NAVIGATION_PRIORITIES = {
  // Screen priorities (for memory management)
  HIGH: ['Home', 'RecipeDetail', 'Search'],
  MEDIUM: ['Categories', 'Favorites', 'Profile'],
  LOW: ['Settings', 'About', 'Help'],
  
  // Preload priorities
  PRELOAD: ['Home', 'Search', 'Categories'],
  LAZY_LOAD: ['Settings', 'About', 'Help', 'EditProfile'],
} as const;

/**
 * ⚙️ Navigation State Management
 */
export const NAVIGATION_STATE = {
  // State keys
  NAVIGATION_STATE_KEY: '@navigation_state',
  TAB_STATE_KEY: '@tab_state',
  MODAL_STATE_KEY: '@modal_state',
  
  // State persistence
  PERSIST_NAVIGATION: true,
  MAX_STATE_SIZE: 50,         // Maximum navigation history size
  STATE_VERSION: 1,
  
  // Reset conditions
  RESET_ON_APP_UPDATE: true,
  RESET_ON_CRASH: true,
} as const;

/**
 * 🎪 Modal Configurations
 */
export const MODAL_CONFIGS = {
  // Modal types
  TYPES: {
    BOTTOM_SHEET: 'bottomSheet',
    FULL_SCREEN: 'fullScreen',
    CENTERED: 'centered',
    SIDE_PANEL: 'sidePanel',
  },
  
  // Modal sizes
  SIZES: {
    SMALL: 0.3,      // 30% of screen
    MEDIUM: 0.5,     // 50% of screen
    LARGE: 0.8,      // 80% of screen
    FULL: 1.0,       // 100% of screen
  },
  
  // Animation configs
  ANIMATIONS: {
    SLIDE_UP: {
      duration: 300,
      easing: 'ease-out',
    },
    FADE_IN: {
      duration: 250,
      easing: 'ease-in-out',
    },
    SCALE_IN: {
      duration: 200,
      easing: 'spring',
    },
  },
} as const;

/**
 * 🔧 Navigation Utilities Constants
 */
export const NAVIGATION_UTILS = {
  // Debounce timings
  NAVIGATION_DEBOUNCE: 300,   // Prevent rapid navigation
  TAB_PRESS_DEBOUNCE: 150,    // Prevent rapid tab switching
  
  // Error handling
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  
  // Performance
  LAZY_LOAD_DELAY: 100,       // Delay for lazy loading
  PRELOAD_DISTANCE: 1,        // Screens to preload ahead
  
  // Accessibility
  SCREEN_READER_DELAY: 500,   // Delay for screen reader
  FOCUS_DELAY: 200,          // Delay for focus management
} as const;

/**
 * 📋 Export All Navigation Constants
 */
export const NavigationConstants = {
  TIMINGS: NAVIGATION_TIMINGS,
  DIMENSIONS: NAVIGATION_DIMENSIONS,
  COLORS: NAVIGATION_COLORS,
  PLATFORM: PLATFORM_NAVIGATION,
  TRANSITIONS: NAVIGATION_TRANSITIONS,
  GESTURES: NAVIGATION_GESTURES,
  ANALYTICS: NAVIGATION_ANALYTICS,
  DEEP_LINKS: DEEP_LINK_PATTERNS,
  PRIORITIES: NAVIGATION_PRIORITIES,
  STATE: NAVIGATION_STATE,
  MODALS: MODAL_CONFIGS,
  UTILS: NAVIGATION_UTILS,
} as const;

export default NavigationConstants;
