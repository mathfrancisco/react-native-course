/**
 * 🧭 Navigation Types
 * 
 * Type definitions for navigation, routing, and screen management.
 * These types ensure type-safe navigation throughout the app.
 */

import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RouteProp } from '@react-navigation/native';

/**
 * 📱 Screen Names (matching navigation config)
 */
export type ScreenName = 
  // Main Screens
  | 'Home'
  | 'Search'
  | 'Categories'
  | 'Favorites'
  | 'Profile'
  
  // Recipe Screens
  | 'RecipeDetail'
  | 'RecipeCreate'
  | 'RecipeEdit'
  
  // Category Screens
  | 'CategoryDetail'
  | 'CategoryRecipes'
  
  // Search Screens
  | 'SearchResults'
  | 'AdvancedFilter'
  
  // User Screens
  | 'UserProfile'
  | 'EditProfile'
  | 'Settings'
  
  // Auth Screens
  | 'Login'
  | 'Register'
  | 'ForgotPassword'
  
  // Utility Screens
  | 'ImageViewer'
  | 'WebView'
  | 'About'
  | 'Help';

/**
 * 📋 Route Parameter Lists
 */
export type RootStackParamList = {
  // Main Tab Navigator
  MainTab: undefined;
  
  // Auth Stack
  AuthStack: undefined;
  
  // Modal Stack
  ModalStack: undefined;
  
  // Individual Screens with Params
  Home: undefined;
  Search: {
    initialQuery?: string;
    initialFilters?: any;
  };
  Categories: {
    selectedCategoryId?: string;
  };
  Favorites: undefined;
  Profile: undefined;
  
  RecipeDetail: {
    recipeId: string;
    recipe?: any; // Pre-loaded recipe data
    source?: 'search' | 'category' | 'favorites' | 'home';
  };
  RecipeCreate: {
    template?: any; // Recipe template to start with
    duplicateFrom?: string; // Recipe ID to duplicate
  };
  RecipeEdit: {
    recipeId: string;
    recipe?: any;
  };
  
  CategoryDetail: {
    categoryId: string;
    categoryName?: string;
    category?: any;
  };
  CategoryRecipes: {
    categoryId: string;
    categoryName: string;
    filters?: any;
  };
  
  SearchResults: {
    query: string;
    filters?: any;
    source?: 'search_bar' | 'category' | 'voice' | 'suggestion';
  };
  AdvancedFilter: {
    currentFilters?: any;
    onApplyFilters: (filters: any) => void;
  };
  
  UserProfile: {
    userId: string;
    username?: string;
  };
  EditProfile: undefined;
  Settings: {
    section?: 'account' | 'notifications' | 'privacy' | 'appearance';
  };
  
  Login: {
    redirectTo?: string;
    message?: string;
  };
  Register: {
    email?: string;
  };
  ForgotPassword: {
    email?: string;
  };
  
  ImageViewer: {
    imageUrl: string;
    images?: string[];
    initialIndex?: number;
    title?: string;
  };
  WebView: {
    url: string;
    title?: string;
    showHeader?: boolean;
  };
  About: undefined;
  Help: {
    section?: string;
    searchQuery?: string;
  };
};

/**
 * 📱 Tab Navigator Param List
 */
export type TabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  CategoriesTab: undefined;
  FavoritesTab: undefined;
  ProfileTab: undefined;
};

/**
 * 🔐 Auth Stack Param List
 */
export type AuthStackParamList = {
  Login: RootStackParamList['Login'];
  Register: RootStackParamList['Register'];
  ForgotPassword: RootStackParamList['ForgotPassword'];
};

/**
 * 🎭 Modal Stack Param List
 */
export type ModalStackParamList = {
  RecipeCreate: RootStackParamList['RecipeCreate'];
  RecipeEdit: RootStackParamList['RecipeEdit'];
  AdvancedFilter: RootStackParamList['AdvancedFilter'];
  ImageViewer: RootStackParamList['ImageViewer'];
  WebView: RootStackParamList['WebView'];
};

/**
 * 🧭 Navigation Prop Types
 */
export type RootStackNavigationProp<T extends keyof RootStackParamList> = 
  StackNavigationProp<RootStackParamList, T>;

export type TabNavigationProp<T extends keyof TabParamList> = 
  BottomTabNavigationProp<TabParamList, T>;

export type AuthStackNavigationProp<T extends keyof AuthStackParamList> = 
  StackNavigationProp<AuthStackParamList, T>;

export type ModalStackNavigationProp<T extends keyof ModalStackParamList> = 
  StackNavigationProp<ModalStackParamList, T>;

/**
 * 📍 Route Prop Types
 */
export type RootStackRouteProp<T extends keyof RootStackParamList> = 
  RouteProp<RootStackParamList, T>;

export type TabRouteProp<T extends keyof TabParamList> = 
  RouteProp<TabParamList, T>;

export type AuthStackRouteProp<T extends keyof AuthStackParamList> = 
  RouteProp<AuthStackParamList, T>;

export type ModalStackRouteProp<T extends keyof ModalStackParamList> = 
  RouteProp<ModalStackParamList, T>;

/**
 * 📱 Screen Component Props
 */
export interface ScreenProps<
  TNavigation = any,
  TRoute = any
> {
  navigation: TNavigation;
  route: TRoute;
}

/**
 * 🎯 Navigation Action Types
 */
export type NavigationAction = 
  | { type: 'NAVIGATE'; payload: { screen: ScreenName; params?: any } }
  | { type: 'GO_BACK' }
  | { type: 'RESET'; payload: { routes: { name: ScreenName; params?: any }[] } }
  | { type: 'REPLACE'; payload: { screen: ScreenName; params?: any } }
  | { type: 'PUSH'; payload: { screen: ScreenName; params?: any } }
  | { type: 'POP'; payload?: { count?: number } }
  | { type: 'POP_TO_TOP' };

/**
 * 📊 Navigation State
 */
export interface NavigationState {
  index: number;
  routes: {
    key: string;
    name: ScreenName;
    params?: any;
    state?: NavigationState;
  }[];
  stale?: boolean;
  type?: string;
}

/**
 * 🔄 Navigation Context
 */
export interface NavigationContext {
  currentScreen: ScreenName;
  previousScreen?: ScreenName;
  navigationStack: ScreenName[];
  canGoBack: boolean;
  isModal: boolean;
  tabIndex?: number;
}

/**
 * 📱 Tab Configuration
 */
export interface TabConfig {
  name: keyof TabParamList;
  label: string;
  icon: string;
  focusedIcon?: string;
  badge?: number | string;
  testID?: string;
}

/**
 * 🎨 Navigation Theme
 */
export interface NavigationTheme {
  dark: boolean;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
  };
}

/**
 * ⚙️ Navigation Options
 */
export interface NavigationOptions {
  title?: string;
  headerShown?: boolean;
  headerTitle?: string;
  headerBackTitle?: string;
  headerTintColor?: string;
  headerStyle?: {
    backgroundColor?: string;
    elevation?: number;
    shadowOpacity?: number;
  };
  headerTitleStyle?: {
    fontSize?: number;
    fontWeight?: string;
    color?: string;
  };
  gestureEnabled?: boolean;
  cardOverlayEnabled?: boolean;
  presentation?: 'card' | 'modal' | 'transparentModal';
  animationTypeForReplace?: 'push' | 'pop';
}

/**
 * 🔗 Deep Link
 */
export interface DeepLink {
  url: string;
  scheme: string;
  host?: string;
  path: string;
  params: { [key: string]: string };
  screen: ScreenName;
  screenParams?: any;
}

/**
 * 📊 Navigation Analytics
 */
export interface NavigationAnalytics {
  screenName: ScreenName;
  timeSpent: number;
  source: 'tab' | 'navigation' | 'deeplink' | 'back';
  timestamp: Date;
  sessionId: string;
  userId?: string;
  previousScreen?: ScreenName;
  params?: any;
}

/**
 * 🎭 Modal Configuration
 */
export interface ModalConfig {
  type: 'bottom_sheet' | 'full_screen' | 'centered' | 'side_panel';
  size?: 'small' | 'medium' | 'large' | 'full';
  backdrop?: boolean;
  backdropOpacity?: number;
  swipeDirection?: 'up' | 'down' | 'left' | 'right';
  animationType?: 'slide' | 'fade' | 'scale';
  onDismiss?: () => void;
}

/**
 * 🎯 Navigation Guard
 */
export interface NavigationGuard {
  screen: ScreenName;
  condition: (params?: any) => boolean | Promise<boolean>;
  redirectTo?: ScreenName;
  message?: string;
  onBlock?: (screen: ScreenName, params?: any) => void;
}

/**
 * 📋 Navigation History Entry
 */
export interface NavigationHistoryEntry {
  screen: ScreenName;
  params?: any;
  timestamp: Date;
  source: 'user' | 'system' | 'deeplink';
}

/**
 * 🔄 Navigation Cache
 */
export interface NavigationCache {
  screen: ScreenName;
  data: any;
  timestamp: Date;
  ttl: number;
  dependencies?: string[];
}

/**
 * 📱 Screen Metadata
 */
export interface ScreenMetadata {
  name: ScreenName;
  title: string;
  description?: string;
  category: 'main' | 'recipe' | 'user' | 'auth' | 'utility';
  requiresAuth?: boolean;
  showInHistory?: boolean;
  cacheable?: boolean;
  preloadData?: boolean;
  analyticsEnabled?: boolean;
  deepLinkable?: boolean;
}

/**
 * 🎯 Navigation Middleware
 */
export interface NavigationMiddleware {
  name: string;
  execute: (
    action: NavigationAction,
    state: NavigationState,
    next: (action: NavigationAction) => void
  ) => void;
  priority?: number;
}
