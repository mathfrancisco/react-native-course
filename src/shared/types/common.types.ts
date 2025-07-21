/**
 * 🌐 Common Types
 * 
 * Common types and interfaces used throughout the RecipeApp.
 * These are foundational types that other modules depend on.
 */

/**
 * 🆔 Base Entity
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 📊 API Response Wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: number;
  timestamp: string;
}

/**
 * 📄 Pagination Interface
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * 📋 Paginated Response
 */
export interface PaginatedResponse<T = any> {
  items: T[];
  pagination: Pagination;
}

/**
 * ✅ Validation Result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
  field?: string;
}

/**
 * 🔍 Filter Options
 */
export interface FilterOption {
  label: string;
  value: string | number;
  count?: number;
  isSelected?: boolean;
}

/**
 * 📊 Sort Options
 */
export interface SortOption {
  field: string;
  order: 'asc' | 'desc';
  label: string;
}

/**
 * 🎯 Search Context
 */
export interface SearchContext {
  query: string;
  filters: Record<string, any>;
  sort: SortOption;
  pagination: Pagination;
}

/**
 * 📱 App State
 */
export type AppState = 'active' | 'background' | 'inactive';

/**
 * 🌐 Network State
 */
export interface NetworkState {
  isConnected: boolean;
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  isInternetReachable: boolean;
}

/**
 * 🎨 Theme Mode
 */
export type ThemeMode = 'light' | 'dark' | 'auto';

/**
 * 🌍 Language Code
 */
export type LanguageCode = 'pt-BR' | 'en-US' | 'es-ES';

/**
 * 💾 Cache Entry
 */
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

/**
 * 🔄 Sync Status
 */
export interface SyncStatus {
  lastSync: Date | null;
  inProgress: boolean;
  errors: string[];
  pendingChanges: number;
}

/**
 * 📊 Analytics Event
 */
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

/**
 * 🎭 User Preferences
 */
export interface UserPreferences {
  theme: ThemeMode;
  language: LanguageCode;
  notifications: {
    push: boolean;
    email: boolean;
    newRecipes: boolean;
    favorites: boolean;
  };
  units: {
    temperature: 'celsius' | 'fahrenheit';
    weight: 'metric' | 'imperial';
    volume: 'metric' | 'imperial';
  };
  privacy: {
    showProfile: boolean;
    allowRecommendations: boolean;
  };
}

/**
 * 🏷️ Tag Interface
 */
export interface Tag {
  id: string;
  name: string;
  color?: string;
  count?: number;
}

/**
 * 📊 Rating Interface
 */
export interface Rating {
  userId: string;
  recipeId: string;
  rating: number;
  review?: string;
  createdAt: Date;
}

/**
 * 📷 Image Interface
 */
export interface ImageInfo {
  id?: string;
  uri: string;
  width?: number;
  height?: number;
  size?: number;
  mimeType?: string;
  alt?: string;
}

/**
 * 📱 Device Info
 */
export interface DeviceInfo {
  platform: 'ios' | 'android' | 'web';
  version: string;
  model?: string;
  screenWidth: number;
  screenHeight: number;
  isTablet: boolean;
}

/**
 * 🔐 Authentication State
 */
export interface AuthState {
  isAuthenticated: boolean;
  token?: string;
  refreshToken?: string;
  expiresAt?: Date;
  user?: any;
}

/**
 * ⚡ Performance Metrics
 */
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  cacheHitRatio: number;
}

/**
 * 🎯 Feature Flag
 */
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  config?: Record<string, any>;
  rolloutPercentage?: number;
}

/**
 * 📋 Form Field
 */
export interface FormField<T = any> {
  value: T;
  error?: string;
  isValid: boolean;
  isTouched: boolean;
  isRequired: boolean;
}

/**
 * 📝 Form State
 */
export interface FormState {
  fields: Record<string, FormField>;
  isValid: boolean;
  isSubmitting: boolean;
  errors: string[];
}

/**
 * 🎪 Modal State
 */
export interface ModalState {
  isVisible: boolean;
  type?: string;
  data?: any;
  onClose?: () => void;
}

/**
 * 📱 App Configuration
 */
export interface AppConfig {
  apiBaseUrl: string;
  environment: 'development' | 'staging' | 'production';
  features: Record<string, boolean>;
  analytics: {
    enabled: boolean;
    trackingId?: string;
  };
  cache: {
    maxSize: number;
    defaultTTL: number;
  };
}

/**
 * 🎯 Generic ID Types
 */
export type RecipeId = string;
export type CategoryId = string;
export type UserId = string;
export type TagId = string;

/**
 * 📊 Status Types
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type SyncState = 'synced' | 'pending' | 'syncing' | 'error';