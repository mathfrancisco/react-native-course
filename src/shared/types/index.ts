/**
 * 🏷️ Types Index
 * 
 * Central export point for all TypeScript types and interfaces.
 * This file provides a single import point for all app types.
 */

// Common types
export type {
  BaseEntity,
  ApiResponse,
  Pagination,
  PaginatedResponse,
  ValidationResult,
  FilterOption,
  SortOption,
  SearchContext,
  AppState,
  NetworkState,
  ThemeMode,
  LanguageCode,
  CacheEntry,
  SyncStatus,
  AnalyticsEvent,
  UserPreferences,
  Tag,
  Rating,
  ImageInfo,
  DeviceInfo,
  AuthState,
  PerformanceMetrics,
  FeatureFlag,
  FormField,
  FormState,
  ModalState,
  AppConfig,
  RecipeId,
  CategoryId,
  UserId,
  TagId,
  LoadingState,
  SyncState,
} from './common.types';

// Recipe types
export type {
  Recipe,
  RecipeDraft,
  Ingredient,
  Instruction,
  Temperature,
  NutritionalInfo,
  RecipeTiming,
  RecipeAuthor,
  RecipeStats,
  RecipeSource,
  RecipeFilters,
  RecipeSortOptions,
  RecipeCollection,
  ShoppingList,
  ShoppingListItem,
  MealPlan,
  MealPlanEntry,
  RecipeRecommendation,
  RecipeAnalytics,
  RecipeSearchResult,
} from './recipe.types';

export {
  DifficultyLevel,
  MealType,
  CookingMethod,
  DietaryType,
  MeasurementUnit,
} from './recipe.types';

// Category types
export type {
  Category,
  CategoryTranslation,
  CategoryStats,
  CategoryTreeNode,
  CategoryHierarchy,
  CategoryDisplayOptions,
  CategoryFilters,
  CategorySearchResult,
  CategorySuggestion,
  CategoryNavigation,
  UserCategoryPreferences,
  CategoryAnalytics,
  CategoryTheme,
  CategoryContent,
  CategoryBadge,
  CategoryEvent,
  CategorySyncData,
  CategoryPerformanceMetrics,
  CategoryRecommendationEngine,
} from './category.types';

// Navigation types
export type {
  ScreenName,
  RootStackParamList,
  TabParamList,
  AuthStackParamList,
  ModalStackParamList,
  NavigationAction,
  NavigationState,
  NavigationContext,
  TabConfig,
  NavigationTheme,
  NavigationOptions,
  DeepLink,
  NavigationAnalytics,
  ModalConfig,
  NavigationGuard,
  NavigationHistoryEntry,
  NavigationCache,
  ScreenMetadata,
  NavigationMiddleware,
  ScreenProps,
} from './navigation.types';

// API types
export type {
  HttpMethod,
  ApiRequest,
  ApiResponseMeta,
  PaginatedApiResponse,
  ApiConfig,
  ApiError,
  ApiCacheConfig,
  ApiEndpoint,
  ApiMetrics,
  ApiRetryConfig,
} from './api.types';




