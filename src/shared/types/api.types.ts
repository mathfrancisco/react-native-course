/**
 * 🌐 API Types
 * 
 * Type definitions for API requests, responses, and external integrations.
 * These types ensure type-safe communication with backend services.
 */

import { Recipe, RecipeFilters, RecipeSortOptions } from './recipe.types';
import { Category } from './category.types';
import { Pagination, ApiResponse } from './common.types';

/**
 * 🔧 HTTP Methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * 📊 API Status Codes
 */
export enum ApiStatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * 📝 API Request Base
 */
export interface ApiRequest {
  url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  body?: any;
  timeout?: number;
  retries?: number;
}

/**
 * 📄 API Response Base
 */
export interface ApiResponseMeta {
  success: boolean;
  status: number;
  message?: string;
  timestamp: string;
  requestId: string;
  version: string;
}

/**
 * 📋 Paginated API Response
 */
export interface PaginatedApiResponse<T> extends ApiResponseMeta {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/**
 * 🍳 Recipe API Types
 */
export namespace RecipeAPI {
  // Recipe List Request
  export interface ListRequest {
    page?: number;
    limit?: number;
    filters?: RecipeFilters;
    sort?: RecipeSortOptions;
    include?: ('author' | 'stats' | 'nutrition' | 'ratings')[];
  }

  // Recipe List Response
  export interface ListResponse extends PaginatedApiResponse<Recipe> {
    meta?: {
      totalRecipes: number;
      featuredRecipes: string[];
      popularTags: string[];
    };
  }

  // Recipe Detail Request
  export interface DetailRequest {
    recipeId: string;
    include?: ('author' | 'stats' | 'nutrition' | 'ratings' | 'related')[];
    userId?: string; // For personalized data
  }

  // Recipe Detail Response
  export interface DetailResponse extends ApiResponse<Recipe> {
    meta?: {
      relatedRecipes?: Recipe[];
      userInteraction?: {
        isFavorite: boolean;
        userRating?: number;
        hasCooked: boolean;
        notes?: string;
      };
    };
  }

  // Recipe Create Request
  export interface CreateRequest {
    title: string;
    description: string;
    ingredients: any[];
    instructions: any[];
    servings: number;
    prepTime: number;
    cookTime: number;
    difficulty: number;
    categoryId: string;
    imageUrl?: string;
    tags?: string[];
    nutrition?: any;
    isPublic: boolean;
  }

  // Recipe Create Response
  export interface CreateResponse extends ApiResponse<Recipe> {
    meta?: {
      slug: string;
      status: 'draft' | 'published';
    };
  }

  // Recipe Update Request
  export interface UpdateRequest extends Partial<CreateRequest> {
    recipeId: string;
  }

  // Recipe Update Response
  export interface UpdateResponse extends ApiResponse<Recipe> {}

  // Recipe Delete Response
  export interface DeleteResponse extends ApiResponseMeta {}

  // Recipe Search Request
  export interface SearchRequest {
    query: string;
    filters?: RecipeFilters;
    sort?: RecipeSortOptions;
    page?: number;
    limit?: number;
    highlightFields?: string[];
  }

  // Recipe Search Response
  export interface SearchResponse extends PaginatedApiResponse<Recipe> {
    meta?: {
      searchTime: number;
      suggestions: string[];
      facets: {
        categories: { id: string; name: string; count: number }[];
        tags: { name: string; count: number }[];
        difficulty: { level: number; count: number }[];
      };
    };
  }
}

/**
 * 📂 Category API Types
 */
export namespace CategoryAPI {
  // Category List Request
  export interface ListRequest {
    parentId?: string;
    level?: number;
    includeStats?: boolean;
    includeInactive?: boolean;
  }

  // Category List Response
  export interface ListResponse extends ApiResponse<Category[]> {
    meta?: {
      totalCategories: number;
      hierarchy: any;
    };
  }

  // Category Detail Request
  export interface DetailRequest {
    categoryId: string;
    includeRecipes?: boolean;
    recipeLimit?: number;
  }

  // Category Detail Response
  export interface DetailResponse extends ApiResponse<Category> {
    meta?: {
      recipes?: Recipe[];
      subcategories?: Category[];
      stats?: {
        totalRecipes: number;
        avgRating: number;
        popularTags: string[];
      };
    };
  }
}

/**
 * 👤 User API Types
 */
export namespace UserAPI {
  // User Profile Response
  export interface ProfileResponse extends ApiResponse<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
    stats: {
      recipesCreated: number;
      favorites: number;
      followers: number;
      following: number;
    };
    preferences: any;
  }> {}

  // User Favorites Request
  export interface FavoritesRequest {
    page?: number;
    limit?: number;
    categoryId?: string;
  }

  // User Favorites Response
  export interface FavoritesResponse extends PaginatedApiResponse<Recipe> {}

  // Toggle Favorite Request
  export interface ToggleFavoriteRequest {
    recipeId: string;
  }

  // Toggle Favorite Response
  export interface ToggleFavoriteResponse extends ApiResponse<{
    isFavorite: boolean;
    totalFavorites: number;
  }> {}
}

/**
 * 🔍 Search API Types
 */
export namespace SearchAPI {
  // Global Search Request
  export interface GlobalSearchRequest {
    query: string;
    type?: 'all' | 'recipes' | 'categories' | 'users';
    limit?: number;
  }

  // Global Search Response
  export interface GlobalSearchResponse extends ApiResponse<{
    recipes: Recipe[];
    categories: Category[];
    users: any[];
    suggestions: string[];
  }> {
    meta?: {
      searchTime: number;
      totalResults: number;
    };
  }

  // Search Suggestions Request
  export interface SuggestionsRequest {
    query: string;
    limit?: number;
    type?: 'recipes' | 'ingredients' | 'categories';
  }

  // Search Suggestions Response
  export interface SuggestionsResponse extends ApiResponse<string[]> {}
}

/**
 * 📷 Upload API Types
 */
export namespace UploadAPI {
  // Image Upload Request
  export interface ImageUploadRequest {
    file: File | Blob;
    type: 'recipe' | 'profile' | 'category';
    resize?: {
      width?: number;
      height?: number;
      quality?: number;
    };
  }

  // Image Upload Response
  export interface ImageUploadResponse extends ApiResponse<{
    url: string;
    thumbnailUrl?: string;
    originalSize: number;
    compressedSize: number;
    dimensions: {
      width: number;
      height: number;
    };
  }> {}
}

/**
 * 🔐 Auth API Types
 */
export namespace AuthAPI {
  // Login Request
  export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
  }

  // Login Response
  export interface LoginResponse extends ApiResponse<{
    token: string;
    refreshToken: string;
    expiresAt: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
  }> {}

  // Register Request
  export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    acceptTerms: boolean;
  }

  // Register Response
  export interface RegisterResponse extends ApiResponse<{
    message: string;
    requiresVerification: boolean;
  }> {}

  // Refresh Token Request
  export interface RefreshTokenRequest {
    refreshToken: string;
  }

  // Refresh Token Response
  export interface RefreshTokenResponse extends ApiResponse<{
    token: string;
    expiresAt: string;
  }> {}
}

/**
 * 📊 Analytics API Types
 */
export namespace AnalyticsAPI {
  // Event Tracking Request
  export interface TrackEventRequest {
    event: string;
    properties?: Record<string, any>;
    userId?: string;
    sessionId: string;
    timestamp?: string;
  }

  // Event Tracking Response
  export interface TrackEventResponse extends ApiResponseMeta {}

  // Batch Events Request
  export interface BatchEventsRequest {
    events: TrackEventRequest[];
  }

  // Batch Events Response
  export interface BatchEventsResponse extends ApiResponseMeta {
    data?: {
      processed: number;
      failed: number;
      errors?: string[];
    };
  }
}

/**
 * ⚙️ API Configuration
 */
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
  interceptors?: {
    request?: (config: ApiRequest) => ApiRequest;
    response?: <T>(response: ApiResponse<T>) => ApiResponse<T>;
    error?: (error: ApiError) => ApiError;
  };
}

/**
 * ❌ API Error
 */
export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  requestId: string;
  path: string;
  method: string;
}

/**
 * 🔄 API Cache Configuration
 */
export interface ApiCacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum cache size in bytes
  excludePatterns?: RegExp[];
  includePatterns?: RegExp[];
}

/**
 * 🎯 API Endpoint Configuration
 */
export interface ApiEndpoint {
  path: string;
  method: HttpMethod;
  cache?: ApiCacheConfig;
  auth?: boolean;
  rateLimit?: {
    requests: number;
    window: number; // milliseconds
  };
  validation?: {
    request?: any; // JSON Schema
    response?: any; // JSON Schema
  };
}

/**
 * 📊 API Metrics
 */
export interface ApiMetrics {
  endpoint: string;
  method: HttpMethod;
  responseTime: number;
  statusCode: number;
  requestSize: number;
  responseSize: number;
  cacheHit: boolean;
  timestamp: Date;
  userId?: string;
}

/**
 * 🔄 API Retry Configuration
 */
export interface ApiRetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryCondition: (error: ApiError) => boolean;
}
