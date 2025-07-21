/**
 * 🍳 Recipe Types
 * 
 * Type definitions for recipes, ingredients, instructions, and related entities.
 * These types define the core data structures for the recipe domain.
 */

import { BaseEntity, ImageInfo, Tag, Rating } from './common.types';

/**
 * 📊 Difficulty Level
 */
export enum DifficultyLevel {
  EASY = 1,
  MEDIUM = 2,
  HARD = 3,
}

/**
 * 🍽️ Meal Type
 */
export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
  DESSERT = 'dessert',
  DRINK = 'drink',
  APPETIZER = 'appetizer',
}

/**
 * 🔥 Cooking Method
 */
export enum CookingMethod {
  BAKING = 'baking',
  FRYING = 'frying',
  GRILLING = 'grilling',
  BOILING = 'boiling',
  STEAMING = 'steaming',
  ROASTING = 'roasting',
  SAUTEING = 'sauteing',
  NO_COOK = 'no_cook',
}

/**
 * 🥗 Dietary Type
 */
export enum DietaryType {
  VEGETARIAN = 'vegetarian',
  VEGAN = 'vegan',
  GLUTEN_FREE = 'gluten_free',
  DAIRY_FREE = 'dairy_free',
  KETO = 'keto',
  PALEO = 'paleo',
  LOW_CARB = 'low_carb',
  HIGH_PROTEIN = 'high_protein',
  SUGAR_FREE = 'sugar_free',
}

/**
 * ⚖️ Measurement Unit
 */
export enum MeasurementUnit {
  // Volume - Metric
  ML = 'ml',
  L = 'l',
  
  // Volume - Brazilian
  XICARA = 'xícara',
  COLHER_SOPA = 'colher de sopa',
  COLHER_CHA = 'colher de chá',
  
  // Volume - Imperial
  CUP = 'cup',
  TABLESPOON = 'tablespoon',
  TEASPOON = 'teaspoon',
  FLUID_OZ = 'fluid_oz',
  
  // Weight - Metric
  G = 'g',
  KG = 'kg',
  
  // Weight - Imperial
  OZ = 'oz',
  LB = 'lb',
  
  // Quantity
  UNIT = 'unidade',
  SLICE = 'fatia',
  PIECE = 'pedaço',
  CLOVE = 'dente',
  BUNCH = 'maço',
  PACKAGE = 'pacote',
  CAN = 'lata',
  BOTTLE = 'garrafa',
}

/**
 * 🥕 Ingredient Interface
 */
export interface Ingredient {
  id?: string;
  name: string;
  amount: number;
  unit: MeasurementUnit;
  notes?: string;
  isOptional?: boolean;
  category?: string; // e.g., "vegetables", "spices", "dairy"
  substitutes?: string[]; // Alternative ingredients
}

/**
 * 📋 Instruction Interface
 */
export interface Instruction {
  id?: string;
  stepNumber: number;
  description: string;
  imageUrl?: string;
  timer?: number; // Duration in minutes for this step
  temperature?: Temperature;
  notes?: string;
  tips?: string[];
}

/**
 * 🌡️ Temperature Interface
 */
export interface Temperature {
  value: number;
  unit: 'celsius' | 'fahrenheit';
  description?: string; // e.g., "medium heat", "preheated oven"
}

/**
 * 📊 Nutritional Information
 */
export interface NutritionalInfo {
  servingSize?: string;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber?: number; // grams
  sugar?: number; // grams
  sodium?: number; // milligrams
  cholesterol?: number; // milligrams
  vitaminC?: number; // milligrams
  calcium?: number; // milligrams
  iron?: number; // milligrams
}

/**
 * 🕒 Recipe Timing
 */
export interface RecipeTiming {
  prepTime: number; // minutes
  cookTime: number; // minutes
  totalTime: number; // minutes (calculated)
  restTime?: number; // minutes for rising, chilling, etc.
}

/**
 * 👤 Recipe Author
 */
export interface RecipeAuthor {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  verified?: boolean;
}

/**
 * 📊 Recipe Statistics
 */
export interface RecipeStats {
  views: number;
  favorites: number;
  timesCooked: number;
  averageRating: number;
  totalRatings: number;
  shares: number;
}

/**
 * 🔖 Recipe Source
 */
export interface RecipeSource {
  type: 'user_created' | 'imported' | 'api' | 'book' | 'website';
  name?: string;
  url?: string;
  author?: string;
  isbn?: string;
}

/**
 * 🍳 Main Recipe Interface
 */
export interface Recipe extends BaseEntity {
  // Basic Information
  title: string;
  description: string;
  imageUrl?: string;
  images?: ImageInfo[];
  
  // Recipe Content
  ingredients: Ingredient[];
  instructions: Instruction[];
  
  // Metadata
  servings: number;
  difficulty: DifficultyLevel;
  timing: RecipeTiming;
  
  // Classification
  categoryId: string;
  mealTypes: MealType[];
  cookingMethods: CookingMethod[];
  dietaryTypes: DietaryType[];
  
  // Tags and Labels
  tags: Tag[];
  cuisine?: string; // e.g., "Italian", "Mexican", "Chinese"
  region?: string; // e.g., "Tuscany", "Sicilian"
  
  // Nutritional Information
  nutrition?: NutritionalInfo;
  
  // Social Features
  author: RecipeAuthor;
  stats: RecipeStats;
  ratings: Rating[];
  
  // Source and Attribution
  source: RecipeSource;
  
  // Status and Visibility
  isPublic: boolean;
  isVerified?: boolean;
  isFeatured?: boolean;
  status: 'draft' | 'published' | 'archived';
  
  // Localization
  language: string;
  
  // Search and Discovery
  searchKeywords?: string[];
  equipment?: string[]; // Required cooking equipment
  
  // User-specific data (not part of core recipe)
  isFavorite?: boolean;
  userRating?: number;
  userNotes?: string;
  timesCooked?: number;
  lastCooked?: Date;
}

/**
 * 📝 Recipe Draft (for creation/editing)
 */
export interface RecipeDraft {
  title: string;
  description: string;
  imageUrl?: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
  servings: number;
  difficulty: DifficultyLevel;
  prepTime: number;
  cookTime: number;
  categoryId: string;
  mealTypes: MealType[];
  cookingMethods: CookingMethod[];
  dietaryTypes: DietaryType[];
  tags: string[];
  cuisine?: string;
  nutrition?: Partial<NutritionalInfo>;
  isPublic: boolean;
  equipment?: string[];
}

/**
 * 🔍 Recipe Filters
 */
export interface RecipeFilters {
  query?: string;
  categoryIds?: string[];
  mealTypes?: MealType[];
  dietaryTypes?: DietaryType[];
  cookingMethods?: CookingMethod[];
  difficulty?: DifficultyLevel[];
  maxPrepTime?: number;
  maxCookTime?: number;
  maxTotalTime?: number;
  servings?: {
    min?: number;
    max?: number;
  };
  calories?: {
    min?: number;
    max?: number;
  };
  rating?: {
    min: number;
    max: number;
  };
  ingredients?: {
    include?: string[];
    exclude?: string[];
  };
  equipment?: string[];
  cuisine?: string[];
  authorId?: string;
  tags?: string[];
  isFeatured?: boolean;
  hasNutrition?: boolean;
  hasImages?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
}

/**
 * 📊 Recipe Sort Options
 */
export interface RecipeSortOptions {
  field: 'relevance' | 'rating' | 'prepTime' | 'cookTime' | 'totalTime' | 'createdAt' | 'popularity' | 'difficulty';
  order: 'asc' | 'desc';
}

/**
 * 🍽️ Recipe Collection
 */
export interface RecipeCollection extends BaseEntity {
  name: string;
  description?: string;
  imageUrl?: string;
  authorId: string;
  recipeIds: string[];
  isPublic: boolean;
  tags: string[];
  stats: {
    recipeCount: number;
    followers: number;
  };
}

/**
 * 📋 Shopping List Item
 */
export interface ShoppingListItem {
  id: string;
  ingredientName: string;
  amount: number;
  unit: MeasurementUnit;
  recipeId?: string;
  recipeTitle?: string;
  isCompleted: boolean;
  notes?: string;
  category?: string;
}

/**
 * 🛒 Shopping List
 */
export interface ShoppingList extends BaseEntity {
  name: string;
  items: ShoppingListItem[];
  userId: string;
  isShared: boolean;
  sharedWith?: string[];
}

/**
 * 📅 Meal Plan Entry
 */
export interface MealPlanEntry {
  id: string;
  date: Date;
  mealType: MealType;
  recipeId: string;
  servings: number;
  notes?: string;
}

/**
 * 📆 Meal Plan
 */
export interface MealPlan extends BaseEntity {
  name: string;
  startDate: Date;
  endDate: Date;
  userId: string;
  entries: MealPlanEntry[];
  isShared: boolean;
}

/**
 * 🎯 Recipe Recommendation
 */
export interface RecipeRecommendation {
  recipe: Recipe;
  score: number;
  reason: string;
  source: 'collaborative' | 'content_based' | 'popular' | 'trending';
}

/**
 * 📊 Recipe Analytics
 */
export interface RecipeAnalytics {
  recipeId: string;
  views: number;
  uniqueViews: number;
  favorites: number;
  shares: number;
  timesCooked: number;
  averageRating: number;
  conversionRate: number; // views to cooking
  popularIngredients: string[];
  popularSubstitutions: { [key: string]: string[] };
  timeSpentViewing: number; // seconds
  dropOffPoints: number[]; // instruction steps where users typically leave
}

/**
 * 🎯 Recipe Search Result
 */
export interface RecipeSearchResult {
  recipe: Recipe;
  relevanceScore: number;
  matchedFields: string[];
  highlightedSnippets?: { [field: string]: string };
}
