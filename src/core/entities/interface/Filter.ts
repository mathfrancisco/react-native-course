import { DifficultyLevel } from "./Recipe";

export interface RecipeFilter {
  categoryIds?: string[];
  difficulty?: DifficultyLevel[];
  maxPrepTime?: number;
  maxCookTime?: number;
  maxTotalTime?: number;
  minRating?: number;
  tags?: string[];
  searchQuery?: string;
  dietary?: DietaryRestriction[];
  servings?: {
    min?: number;
    max?: number;
  };
}

export type DietaryRestriction = 
  | 'vegetarian' 
  | 'vegan' 
  | 'gluten_free' 
  | 'dairy_free' 
  | 'keto' 
  | 'paleo';

export interface SearchCriteria {
  query: string;
  filters: RecipeFilter;
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export type SortOption = 
  | 'rating' 
  | 'prepTime' 
  | 'totalTime' 
  | 'title' 
  | 'createdAt' 
  | 'reviewCount';