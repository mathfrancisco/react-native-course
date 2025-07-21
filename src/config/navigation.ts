/**
 * 🧭 Navigation Configuration
 * 
 * Centralized configuration for all navigation-related settings.
 * Includes route names, navigation options, and deep linking configuration.
 */

/**
 * 🏠 Screen Names - Centralized route constants
 */
export const SCREEN_NAMES = {
  // Main Navigation
  HOME: 'Home' as const,
  SEARCH: 'Search' as const,
  CATEGORIES: 'Categories' as const,
  FAVORITES: 'Favorites' as const,
  PROFILE: 'Profile' as const,
  
  // Recipe Screens
  RECIPE_DETAIL: 'RecipeDetail' as const,
  RECIPE_CREATE: 'RecipeCreate' as const,
  RECIPE_EDIT: 'RecipeEdit' as const,
  
  // Category Screens
  CATEGORY_DETAIL: 'CategoryDetail' as const,
  CATEGORY_RECIPES: 'CategoryRecipes' as const,
  
  // Search & Filter
  SEARCH_RESULTS: 'SearchResults' as const,
  ADVANCED_FILTER: 'AdvancedFilter' as const,
  
  // User Screens
  USER_PROFILE: 'UserProfile' as const,
  EDIT_PROFILE: 'EditProfile' as const,
  SETTINGS: 'Settings' as const,
  
  // Authentication (if needed)
  LOGIN: 'Login' as const,
  REGISTER: 'Register' as const,
  FORGOT_PASSWORD: 'ForgotPassword' as const,
  
  // Utility Screens
  IMAGE_VIEWER: 'ImageViewer' as const,
  WEB_VIEW: 'WebView' as const,
  ABOUT: 'About' as const,
  HELP: 'Help' as const,
} as const;

/**
 * 📚 Stack Names - Navigation stack identifiers
 */
export const STACK_NAMES = {
  MAIN_TAB: 'MainTab' as const,
  HOME_STACK: 'HomeStack' as const,
  SEARCH_STACK: 'SearchStack' as const,
  CATEGORIES_STACK: 'CategoriesStack' as const,
  FAVORITES_STACK: 'FavoritesStack' as const,
  PROFILE_STACK: 'ProfileStack' as const,
  AUTH_STACK: 'AuthStack' as const,
  MODAL_STACK: 'ModalStack' as const,
} as const;

/**
 * 🏷️ Tab Names - Bottom tab identifiers
 */
export const TAB_NAMES = {
  HOME: 'HomeTab' as const,
  SEARCH: 'SearchTab' as const,
  CATEGORIES: 'CategoriesTab' as const,
  FAVORITES: 'FavoritesTab' as const,
  PROFILE: 'ProfileTab' as const,
} as const;

/**
 * 📱 Screen Options Configuration
 */
export const SCREEN_OPTIONS = {
  // Default options for all screens
  default: {
    headerShown: true,
    headerBackTitleVisible: false,
    headerTitleAlign: 'center' as const,
    headerStyle: {
      backgroundColor: '#FFFFFF',
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
    },
    headerTitleStyle: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: '#212121',
    },
    headerTintColor: '#FFC107', // Primary color for back button
  },
  
  // Tab navigator options
  tab: {
    tabBarActiveTintColor: '#FFC107',    // Primary color
    tabBarInactiveTintColor: '#9E9E9E',  // Gray
    tabBarStyle: {
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: '#E0E0E0',
      height: 60,
      paddingBottom: 8,
      paddingTop: 8,
    },
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '500' as const,
      marginTop: 4,
    },
    tabBarIconStyle: {
      marginBottom: 0,
    },
  },
  
  // Modal screens
  modal: {
    presentation: 'modal' as const,
    headerShown: true,
    headerLeft: () => null,
    gestureEnabled: true,
    cardOverlayEnabled: true,
    cardStyle: {
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
  },
  
  // Full screen options (like image viewer)
  fullScreen: {
    headerShown: false,
    statusBarHidden: true,
    orientation: 'default' as const,
  },
  
  // Authentication screens
  auth: {
    headerShown: false,
    gestureEnabled: false,
    cardStyle: {
      backgroundColor: '#FFC107', // Primary background
    },
  },
};

/**
 * 🔗 Deep Linking Configuration
 */
export const DEEP_LINKING_CONFIG = {
  prefixes: [
    'recipeapp://',
    'https://recipeapp.com',
    'https://www.recipeapp.com',
  ],
  
  config: {
    screens: {
      [STACK_NAMES.MAIN_TAB]: {
        screens: {
          [TAB_NAMES.HOME]: {
            screens: {
              [SCREEN_NAMES.HOME]: 'home',
              [SCREEN_NAMES.RECIPE_DETAIL]: 'recipe/:recipeId',
            },
          },
          [TAB_NAMES.SEARCH]: {
            screens: {
              [SCREEN_NAMES.SEARCH]: 'search',
              [SCREEN_NAMES.SEARCH_RESULTS]: 'search/results',
              [SCREEN_NAMES.ADVANCED_FILTER]: 'search/filter',
            },
          },
          [TAB_NAMES.CATEGORIES]: {
            screens: {
              [SCREEN_NAMES.CATEGORIES]: 'categories',
              [SCREEN_NAMES.CATEGORY_DETAIL]: 'category/:categoryId',
              [SCREEN_NAMES.CATEGORY_RECIPES]: 'category/:categoryId/recipes',
            },
          },
          [TAB_NAMES.FAVORITES]: {
            screens: {
              [SCREEN_NAMES.FAVORITES]: 'favorites',
            },
          },
          [TAB_NAMES.PROFILE]: {
            screens: {
              [SCREEN_NAMES.PROFILE]: 'profile',
              [SCREEN_NAMES.USER_PROFILE]: 'user/:userId',
              [SCREEN_NAMES.EDIT_PROFILE]: 'profile/edit',
              [SCREEN_NAMES.SETTINGS]: 'settings',
            },
          },
        },
      },
      [STACK_NAMES.AUTH_STACK]: {
        screens: {
          [SCREEN_NAMES.LOGIN]: 'login',
          [SCREEN_NAMES.REGISTER]: 'register',
          [SCREEN_NAMES.FORGOT_PASSWORD]: 'forgot-password',
        },
      },
      [STACK_NAMES.MODAL_STACK]: {
        screens: {
          [SCREEN_NAMES.IMAGE_VIEWER]: 'image/:imageUrl',
          [SCREEN_NAMES.WEB_VIEW]: 'web/:url',
          [SCREEN_NAMES.RECIPE_CREATE]: 'recipe/create',
          [SCREEN_NAMES.RECIPE_EDIT]: 'recipe/:recipeId/edit',
        },
      },
    },
  },
};

/**
 * 🎨 Tab Bar Icons Configuration
 */
export const TAB_ICONS = {
  [TAB_NAMES.HOME]: {
    focused: 'home',
    unfocused: 'home-outline',
  },
  [TAB_NAMES.SEARCH]: {
    focused: 'search',
    unfocused: 'search-outline',
  },
  [TAB_NAMES.CATEGORIES]: {
    focused: 'grid',
    unfocused: 'grid-outline',
  },
  [TAB_NAMES.FAVORITES]: {
    focused: 'heart',
    unfocused: 'heart-outline',
  },
  [TAB_NAMES.PROFILE]: {
    focused: 'person',
    unfocused: 'person-outline',
  },
} as const;

/**
 * 📖 Tab Labels Configuration
 */
export const TAB_LABELS = {
  [TAB_NAMES.HOME]: 'Início',
  [TAB_NAMES.SEARCH]: 'Buscar',
  [TAB_NAMES.CATEGORIES]: 'Categorias',
  [TAB_NAMES.FAVORITES]: 'Favoritos',
  [TAB_NAMES.PROFILE]: 'Perfil',
} as const;

/**
 * 🎭 Screen Titles Configuration
 */
export const SCREEN_TITLES = {
  [SCREEN_NAMES.HOME]: 'Receitas',
  [SCREEN_NAMES.SEARCH]: 'Buscar Receitas',
  [SCREEN_NAMES.CATEGORIES]: 'Categorias',
  [SCREEN_NAMES.FAVORITES]: 'Meus Favoritos',
  [SCREEN_NAMES.PROFILE]: 'Perfil',
  [SCREEN_NAMES.RECIPE_DETAIL]: 'Receita',
  [SCREEN_NAMES.RECIPE_CREATE]: 'Nova Receita',
  [SCREEN_NAMES.RECIPE_EDIT]: 'Editar Receita',
  [SCREEN_NAMES.CATEGORY_DETAIL]: 'Categoria',
  [SCREEN_NAMES.CATEGORY_RECIPES]: 'Receitas',
  [SCREEN_NAMES.SEARCH_RESULTS]: 'Resultados',
  [SCREEN_NAMES.ADVANCED_FILTER]: 'Filtros',
  [SCREEN_NAMES.USER_PROFILE]: 'Perfil do Usuário',
  [SCREEN_NAMES.EDIT_PROFILE]: 'Editar Perfil',
  [SCREEN_NAMES.SETTINGS]: 'Configurações',
  [SCREEN_NAMES.LOGIN]: 'Entrar',
  [SCREEN_NAMES.REGISTER]: 'Cadastrar',
  [SCREEN_NAMES.FORGOT_PASSWORD]: 'Recuperar Senha',
  [SCREEN_NAMES.ABOUT]: 'Sobre',
  [SCREEN_NAMES.HELP]: 'Ajuda',
} as const;

/**
 * ⚡ Navigation Transitions
 */
export const TRANSITIONS = {
  // Slide from right (default)
  slideFromRight: {
    cardStyleInterpolator: ({ current, layouts }: any) => {
      return {
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0],
              }),
            },
          ],
        },
      };
    },
  },
  
  // Slide from bottom
  slideFromBottom: {
    cardStyleInterpolator: ({ current, layouts }: any) => {
      return {
        cardStyle: {
          transform: [
            {
              translateY: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.height, 0],
              }),
            },
          ],
        },
      };
    },
  },
  
  // Fade transition
  fade: {
    cardStyleInterpolator: ({ current }: any) => {
      return {
        cardStyle: {
          opacity: current.progress,
        },
      };
    },
  },
  
  // Scale transition
  scale: {
    cardStyleInterpolator: ({ current }: any) => {
      return {
        cardStyle: {
          transform: [
            {
              scale: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
          opacity: current.progress,
        },
      };
    },
  },
};

/**
 * 🔧 Navigation Gestures Configuration
 */
export const GESTURE_CONFIG = {
  // Swipe back gesture
  swipeBack: {
    gestureEnabled: true,
    gestureDirection: 'horizontal' as const,
    gestureResponseDistance: 50,
  },
  
  // Swipe down to dismiss modal
  swipeDown: {
    gestureEnabled: true,
    gestureDirection: 'vertical' as const,
    gestureResponseDistance: 100,
  },
  
  // Disabled gestures
  disabled: {
    gestureEnabled: false,
  },
};

/**
 * 📊 Analytics Events for Navigation
 */
export const NAVIGATION_EVENTS = {
  SCREEN_VIEW: 'screen_view',
  TAB_SWITCH: 'tab_switch',
  DEEP_LINK_OPEN: 'deep_link_open',
  SEARCH_PERFORMED: 'search_performed',
  RECIPE_VIEWED: 'recipe_viewed',
  CATEGORY_VIEWED: 'category_viewed',
  FAVORITES_ACCESSED: 'favorites_accessed',
  PROFILE_ACCESSED: 'profile_accessed',
} as const;

/**
 * 🎯 Type Definitions for Navigation
 */
export type ScreenName = typeof SCREEN_NAMES[keyof typeof SCREEN_NAMES];
export type StackName = typeof STACK_NAMES[keyof typeof STACK_NAMES];
export type TabName = typeof TAB_NAMES[keyof typeof TAB_NAMES];

/**
 * 📋 Route Parameters Types
 */
export type RouteParams = {
  [SCREEN_NAMES.HOME]: undefined;
  [SCREEN_NAMES.SEARCH]: { initialQuery?: string };
  [SCREEN_NAMES.CATEGORIES]: undefined;
  [SCREEN_NAMES.FAVORITES]: undefined;
  [SCREEN_NAMES.PROFILE]: undefined;
  
  [SCREEN_NAMES.RECIPE_DETAIL]: { recipeId: string; recipe?: any };
  [SCREEN_NAMES.RECIPE_CREATE]: undefined;
  [SCREEN_NAMES.RECIPE_EDIT]: { recipeId: string };
  
  [SCREEN_NAMES.CATEGORY_DETAIL]: { categoryId: string; categoryName: string };
  [SCREEN_NAMES.CATEGORY_RECIPES]: { categoryId: string; categoryName: string };
  
  [SCREEN_NAMES.SEARCH_RESULTS]: { query: string; filters?: any };
  [SCREEN_NAMES.ADVANCED_FILTER]: { currentFilters?: any };
  
  [SCREEN_NAMES.USER_PROFILE]: { userId: string };
  [SCREEN_NAMES.EDIT_PROFILE]: undefined;
  [SCREEN_NAMES.SETTINGS]: undefined;
  
  [SCREEN_NAMES.LOGIN]: undefined;
  [SCREEN_NAMES.REGISTER]: undefined;
  [SCREEN_NAMES.FORGOT_PASSWORD]: undefined;
  
  [SCREEN_NAMES.IMAGE_VIEWER]: { 
    imageUrl: string; 
    images?: string[]; 
    initialIndex?: number 
  };
  [SCREEN_NAMES.WEB_VIEW]: { 
    url: string; 
    title?: string 
  };
  [SCREEN_NAMES.ABOUT]: undefined;
  [SCREEN_NAMES.HELP]: undefined;
};

/**
 * 🚀 Navigation Utilities
 */
export const NavigationUtils = {
  /**
   * Get screen title by screen name
   */
  getScreenTitle: (screenName: ScreenName): string => {
    return SCREEN_TITLES[screenName] || screenName;
  },
  
  /**
   * Get tab label by tab name
   */
  getTabLabel: (tabName: TabName): string => {
    return TAB_LABELS[tabName] || tabName;
  },
  
  /**
   * Get tab icons by tab name
   */
  getTabIcons: (tabName: TabName) => {
    return TAB_ICONS[tabName] || { focused: 'circle', unfocused: 'circle-outline' };
  },
  
  /**
   * Check if screen is a modal
   */
  isModal: (screenName: ScreenName): boolean => {
    const modalScreens = [
      SCREEN_NAMES.IMAGE_VIEWER,
      SCREEN_NAMES.WEB_VIEW,
      SCREEN_NAMES.RECIPE_CREATE,
      SCREEN_NAMES.RECIPE_EDIT,
      SCREEN_NAMES.ADVANCED_FILTER,
    ];
    return modalScreens.includes(screenName);
  },
  
  /**
   * Check if screen requires authentication
   */
  requiresAuth: (screenName: ScreenName): boolean => {
    const authRequiredScreens = [
      SCREEN_NAMES.FAVORITES,
      SCREEN_NAMES.PROFILE,
      SCREEN_NAMES.RECIPE_CREATE,
      SCREEN_NAMES.RECIPE_EDIT,
      SCREEN_NAMES.EDIT_PROFILE,
    ];
    return authRequiredScreens.includes(screenName);
  },
};

/**
 * 📱 Default Navigation Configuration
 */
export const DEFAULT_NAVIGATION_CONFIG = {
  initialRouteName: SCREEN_NAMES.HOME,
  screenOptions: SCREEN_OPTIONS.default,
  tabBarOptions: SCREEN_OPTIONS.tab,
  linking: DEEP_LINKING_CONFIG,
  theme: {
    dark: false,
    colors: {
      primary: '#FFC107',
      background: '#FFFFFF',
      card: '#FFFFFF',
      text: '#212121',
      border: '#E0E0E0',
      notification: '#F44336',
    },
  },
};

export default DEFAULT_NAVIGATION_CONFIG;