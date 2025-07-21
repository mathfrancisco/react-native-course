/**
 * 📂 Category Types
 * 
 * Type definitions for categories, subcategories, and category-related functionality.
 * These types organize recipes into logical groups.
 */

import { BaseEntity, ImageInfo } from './common.types';
import { MealType, DietaryType, CookingMethod } from './recipe.types';

/**
 * 🏷️ Category Interface
 */
export interface Category extends BaseEntity {
  // Basic Information
  name: string;
  description?: string;
  slug: string; // URL-friendly name
  
  // Visual
  imageUrl?: string;
  iconName?: string; // Icon identifier
  color?: string; // Hex color for UI theming
  
  // Hierarchy
  parentId?: string; // For subcategories
  level: number; // 0 = root, 1 = subcategory, etc.
  path: string; // Full path like "main-dishes/italian/pasta"
  
  // Status and Behavior
  isActive: boolean;
  isVisible: boolean;
  isFeatured?: boolean;
  
  // Organization
  sortOrder: number;
  priority?: number; // For featuring/promotion
  
  // Statistics
  recipeCount: number;
  activeRecipeCount: number; // Only published recipes
  
  // Metadata
  tags?: string[];
  keywords?: string[]; // For search optimization
  
  // Associations
  mealTypes?: MealType[]; // Common meal types in this category
  dietaryTypes?: DietaryType[]; // Common dietary restrictions
  cookingMethods?: CookingMethod[]; // Common cooking methods
  
  // Localization
  translations?: CategoryTranslation[];
}

/**
 * 🌍 Category Translation
 */
export interface CategoryTranslation {
  language: string;
  name: string;
  description?: string;
  keywords?: string[];
}

/**
 * 📊 Category Statistics
 */
export interface CategoryStats {
  categoryId: string;
  totalRecipes: number;
  publishedRecipes: number;
  averageRating: number;
  totalViews: number;
  totalFavorites: number;
  popularTags: string[];
  trendingRecipes: string[]; // Recipe IDs
  lastUpdated: Date;
}

/**
 * 🌳 Category Tree Node
 */
export interface CategoryTreeNode {
  category: Category;
  children: CategoryTreeNode[];
  parent?: CategoryTreeNode;
  depth: number;
  hasChildren: boolean;
  isExpanded?: boolean; // For UI state
}

/**
 * 📋 Category Hierarchy
 */
export interface CategoryHierarchy {
  root: CategoryTreeNode[];
  flat: Category[];
  byId: { [id: string]: Category };
  bySlug: { [slug: string]: Category };
  maxDepth: number;
}

/**
 * 🎨 Category Display Options
 */
export interface CategoryDisplayOptions {
  showImages: boolean;
  showRecipeCount: boolean;
  showDescription: boolean;
  showSubcategories: boolean;
  layout: 'grid' | 'list' | 'cards';
  itemsPerRow?: number;
  sortBy: 'name' | 'recipeCount' | 'popularity' | 'order';
  sortOrder: 'asc' | 'desc';
}

/**
 * 🔍 Category Filter Options
 */
export interface CategoryFilters {
  parentId?: string;
  level?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  hasRecipes?: boolean;
  minRecipeCount?: number;
  mealTypes?: MealType[];
  dietaryTypes?: DietaryType[];
  cookingMethods?: CookingMethod[];
  search?: string;
}

/**
 * 📊 Category Search Result
 */
export interface CategorySearchResult {
  category: Category;
  matchScore: number;
  matchedFields: string[];
  recipeCount: number;
  popularity: number;
}

/**
 * 🎯 Category Suggestion
 */
export interface CategorySuggestion {
  category: Category;
  reason: 'popular' | 'trending' | 'similar' | 'recent';
  confidence: number;
  metadata?: {
    basedOn?: string[]; // Recipe IDs or other categories
    popularity?: number;
    trendScore?: number;
  };
}

/**
 * 📱 Category Navigation
 */
export interface CategoryNavigation {
  current: Category;
  breadcrumb: Category[];
  siblings: Category[];
  children: Category[];
  parent?: Category;
  nextInOrder?: Category;
  previousInOrder?: Category;
}

/**
 * 👤 User Category Preferences
 */
export interface UserCategoryPreferences {
  userId: string;
  favoriteCategories: string[]; // Category IDs
  hiddenCategories: string[]; // Category IDs to hide
  customOrder?: string[]; // Custom category ordering
  recentlyViewed: string[]; // Recently viewed categories
  interests: {
    categoryId: string;
    score: number; // Interest level 0-1
    lastUpdated: Date;
  }[];
}

/**
 * 📊 Category Analytics
 */
export interface CategoryAnalytics {
  categoryId: string;
  period: 'day' | 'week' | 'month' | 'year';
  views: number;
  uniqueViews: number;
  recipeViews: number; // Views of recipes in this category
  favorites: number;
  searches: number; // Times this category was searched
  conversionRate: number; // Views to recipe views
  popularRecipes: {
    recipeId: string;
    views: number;
    favorites: number;
  }[];
  userEngagement: {
    avgTimeSpent: number;
    bounceRate: number;
    returnVisitors: number;
  };
  trends: {
    growthRate: number;
    seasonality?: number;
    peakTimes: string[]; // Hours of day
  };
}

/**
 * 🎨 Category Theme
 */
export interface CategoryTheme {
  categoryId: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  gradientColors?: string[];
  imageOverlay?: string;
  fontFamily?: string;
}

/**
 * 📋 Category Content
 */
export interface CategoryContent {
  categoryId: string;
  introduction?: string;
  tips?: string[];
  techniques?: string[];
  equipment?: string[];
  seasonality?: {
    season: 'spring' | 'summer' | 'fall' | 'winter';
    description: string;
  }[];
  history?: string;
  culturalContext?: string;
  relatedCategories?: string[]; // Category IDs
  expertTips?: {
    author: string;
    tip: string;
    expertise?: string;
  }[];
}

/**
 * 🏆 Category Badge
 */
export interface CategoryBadge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  color: string;
  requirements: {
    recipesInCategory?: number;
    ratingsReceived?: number;
    favoritesReceived?: number;
    timeSpentInCategory?: number; // minutes
  };
  isRare?: boolean;
  points?: number;
}

/**
 * 📅 Category Event
 */
export interface CategoryEvent {
  id: string;
  categoryId: string;
  type: 'seasonal' | 'holiday' | 'trending' | 'promotion';
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  imageUrl?: string;
  isActive: boolean;
  featuredRecipes?: string[]; // Recipe IDs
  specialOffers?: {
    type: 'discount' | 'featured' | 'bonus';
    value: number;
    description: string;
  }[];
}

/**
 * 🔄 Category Sync Data
 */
export interface CategorySyncData {
  categories: Category[];
  lastSyncAt: Date;
  version: string;
  checksum: string;
  deletedIds: string[];
  changes: {
    added: string[];
    updated: string[];
    deleted: string[];
  };
}

/**
 * 📊 Category Performance Metrics
 */
export interface CategoryPerformanceMetrics {
  categoryId: string;
  loadTime: number;
  renderTime: number;
  imageLoadTime: number;
  recipeLoadTime: number;
  cacheHitRate: number;
  errorRate: number;
  userSatisfaction: number; // 0-1 based on interactions
}

/**
 * 🎯 Category Recommendation Engine
 */
export interface CategoryRecommendationEngine {
  userId?: string;
  context: 'browsing' | 'searching' | 'cooking' | 'planning';
  preferences: {
    mealTypes: MealType[];
    dietaryRestrictions: DietaryType[];
    cookingMethods: CookingMethod[];
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
    timeAvailable: number; // minutes
    servingSize: number;
  };
  history: {
    viewedCategories: string[];
    favoriteRecipes: string[];
    cookedRecipes: string[];
    searchQueries: string[];
  };
  recommendations: CategorySuggestion[];
}
