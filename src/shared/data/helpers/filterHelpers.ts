/**
 * 🎛️ Filter Helpers
 * 
 * Helper functions for filter management, filter combinations, and filter UI logic.
 * These functions handle complex filtering scenarios and filter state management.
 */

import { RecipeFilters, DifficultyLevel, MealType, DietaryType, CookingMethod } from '../../types/recipe.types';
import { CategoryFilters } from '../../types/category.types';
import { FilterOption } from '../../types/common.types';

/**
 * 🔧 Combined Filter Interface
 */
export interface CombinedFilters extends RecipeFilters {
  categoryFilters?: CategoryFilters;
}

/**
 * 🎯 Filter State Interface
 */
export interface FilterState {
  active: CombinedFilters;
  applied: CombinedFilters;
  hasChanges: boolean;
  count: number;
}

/**
 * 📊 Filter Statistics
 */
export interface FilterStats {
  totalFilters: number;
  activeFilters: number;
  filtersByType: {
    category: number;
    time: number;
    difficulty: number;
    dietary: number;
    meal: number;
    ingredients: number;
    rating: number;
  };
}

/**
 * 🆕 Create empty filter state
 */
export const createEmptyFilters = (): CombinedFilters => ({
  query: '',
  categoryIds: [],
  mealTypes: [],
  dietaryTypes: [],
  cookingMethods: [],
  difficulty: [],
  maxPrepTime: undefined,
  maxCookTime: undefined,
  maxTotalTime: undefined,
  servings: {},
  calories: {},
  rating: { min: 0, max: 5 },
  ingredients: { include: [], exclude: [] },
  equipment: [],
  cuisine: [],
  authorId: undefined,
  tags: [],
  isFeatured: undefined,
  hasNutrition: undefined,
  hasImages: undefined,
  createdAfter: undefined,
  createdBefore: undefined,
});

/**
 * 🔄 Merge filters
 */
export const mergeFilters = (
  baseFilters: CombinedFilters,
  newFilters: Partial<CombinedFilters>
): CombinedFilters => {
  return {
    ...baseFilters,
    ...newFilters,
    // Handle array merging
    categoryIds: newFilters.categoryIds ?? baseFilters.categoryIds,
    mealTypes: newFilters.mealTypes ?? baseFilters.mealTypes,
    dietaryTypes: newFilters.dietaryTypes ?? baseFilters.dietaryTypes,
    cookingMethods: newFilters.cookingMethods ?? baseFilters.cookingMethods,
    difficulty: newFilters.difficulty ?? baseFilters.difficulty,
    tags: newFilters.tags ?? baseFilters.tags,
    equipment: newFilters.equipment ?? baseFilters.equipment,
    cuisine: newFilters.cuisine ?? baseFilters.cuisine,
    // Handle object merging
    servings: { ...baseFilters.servings, ...newFilters.servings },
    calories: { ...baseFilters.calories, ...newFilters.calories },
    rating: { ...baseFilters.rating, ...newFilters.rating },
    ingredients: {
      include: newFilters.ingredients?.include ?? baseFilters.ingredients?.include ?? [],
      exclude: newFilters.ingredients?.exclude ?? baseFilters.ingredients?.exclude ?? [],
    },
  };
};

/**
 * 🧹 Clean empty filters
 */
export const cleanEmptyFilters = (filters: CombinedFilters): CombinedFilters => {
  const cleaned: any = {};
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    
    if (Array.isArray(value)) {
      if (value.length > 0) cleaned[key] = value;
    } else if (typeof value === 'object') {
      const cleanedObject = Object.fromEntries(
        Object.entries(value).filter(([, v]) => v !== undefined && v !== null)
      );
      if (Object.keys(cleanedObject).length > 0) {
        cleaned[key] = cleanedObject;
      }
    } else if (typeof value === 'string') {
      if (value.trim().length > 0) cleaned[key] = value;
    } else {
      cleaned[key] = value;
    }
  });
  
  return cleaned;
};

/**
 * 📊 Count active filters
 */
export const countActiveFilters = (filters: CombinedFilters): number => {
  let count = 0;
  
  // Query
  if (filters.query && filters.query.trim()) count++;
  
  // Arrays
  if (filters.categoryIds?.length) count++;
  if (filters.mealTypes?.length) count++;
  if (filters.dietaryTypes?.length) count++;
  if (filters.cookingMethods?.length) count++;
  if (filters.difficulty?.length) count++;
  if (filters.tags?.length) count++;
  if (filters.equipment?.length) count++;
  if (filters.cuisine?.length) count++;
  
  // Time filters
  if (filters.maxPrepTime) count++;
  if (filters.maxCookTime) count++;
  if (filters.maxTotalTime) count++;
  
  // Range filters
  if (filters.servings?.min || filters.servings?.max) count++;
  if (filters.calories?.min || filters.calories?.max) count++;
  if (filters.rating && (filters.rating.min > 0 || filters.rating.max < 5)) count++;
  
  // Ingredient filters
  if (filters.ingredients?.include?.length) count++;
  if (filters.ingredients?.exclude?.length) count++;
  
  // Boolean filters
  if (filters.isFeatured !== undefined) count++;
  if (filters.hasNutrition !== undefined) count++;
  if (filters.hasImages !== undefined) count++;
  
  // Date filters
  if (filters.createdAfter) count++;
  if (filters.createdBefore) count++;
  
  // Author filter
  if (filters.authorId) count++;
  
  return count;
};

/**
 * 📈 Get filter statistics
 */
export const getFilterStatistics = (filters: CombinedFilters): FilterStats => {
  return {
    totalFilters: Object.keys(createEmptyFilters()).length,
    activeFilters: countActiveFilters(filters),
    filtersByType: {
      category: filters.categoryIds?.length || 0,
      time: [filters.maxPrepTime, filters.maxCookTime, filters.maxTotalTime].filter(Boolean).length,
      difficulty: filters.difficulty?.length || 0,
      dietary: filters.dietaryTypes?.length || 0,
      meal: filters.mealTypes?.length || 0,
      ingredients: (filters.ingredients?.include?.length || 0) + (filters.ingredients?.exclude?.length || 0),
      rating: (filters.rating && (filters.rating.min > 0 || filters.rating.max < 5)) ? 1 : 0,
    },
  };
};

/**
 * 🏷️ Generate filter labels
 */
export const generateFilterLabels = (filters: CombinedFilters): string[] => {
  const labels: string[] = [];
  
  // Query
  if (filters.query?.trim()) {
    labels.push(`Busca: "${filters.query}"`);
  }
  
  // Categories (would need category names from data)
  if (filters.categoryIds?.length) {
    labels.push(`Categorias (${filters.categoryIds.length})`);
  }
  
  // Meal types
  if (filters.mealTypes?.length) {
    const mealTypeLabels = filters.mealTypes.map(formatMealTypeLabel);
    labels.push(...mealTypeLabels);
  }
  
  // Dietary types
  if (filters.dietaryTypes?.length) {
    const dietaryLabels = filters.dietaryTypes.map(formatDietaryTypeLabel);
    labels.push(...dietaryLabels);
  }
  
  // Difficulty
  if (filters.difficulty?.length) {
    const difficultyLabels = filters.difficulty.map(formatDifficultyLabel);
    labels.push(...difficultyLabels);
  }
  
  // Time filters
  if (filters.maxPrepTime) {
    labels.push(`Preparo: até ${filters.maxPrepTime}min`);
  }
  if (filters.maxCookTime) {
    labels.push(`Cozimento: até ${filters.maxCookTime}min`);
  }
  if (filters.maxTotalTime) {
    labels.push(`Tempo total: até ${filters.maxTotalTime}min`);
  }
  
  // Servings
  if (filters.servings?.min || filters.servings?.max) {
    if (filters.servings.min && filters.servings.max) {
      labels.push(`Porções: ${filters.servings.min}-${filters.servings.max}`);
    } else if (filters.servings.min) {
      labels.push(`Mín. ${filters.servings.min} porções`);
    } else if (filters.servings.max) {
      labels.push(`Máx. ${filters.servings.max} porções`);
    }
  }
  
  // Rating
  if (filters.rating && filters.rating.min > 0) {
    labels.push(`Nota: ${filters.rating.min}+ estrelas`);
  }
  
  // Ingredients
  if (filters.ingredients?.include?.length) {
    labels.push(`Com: ${filters.ingredients.include.join(', ')}`);
  }
  if (filters.ingredients?.exclude?.length) {
    labels.push(`Sem: ${filters.ingredients.exclude.join(', ')}`);
  }
  
  // Boolean filters
  if (filters.isFeatured) {
    labels.push('Em destaque');
  }
  if (filters.hasNutrition) {
    labels.push('Com informação nutricional');
  }
  if (filters.hasImages) {
    labels.push('Com imagens');
  }
  
  return labels;
};

/**
 * 🎨 Format meal type label
 */
const formatMealTypeLabel = (mealType: MealType): string => {
  const labels = {
    [MealType.BREAKFAST]: 'Café da Manhã',
    [MealType.LUNCH]: 'Almoço',
    [MealType.DINNER]: 'Jantar',
    [MealType.SNACK]: 'Lanche',
    [MealType.DESSERT]: 'Sobremesa',
    [MealType.DRINK]: 'Bebida',
    [MealType.APPETIZER]: 'Entrada',
  };
  return labels[mealType] || mealType;
};

/**
 * 🥗 Format dietary type label
 */
const formatDietaryTypeLabel = (dietaryType: DietaryType): string => {
  const labels = {
    [DietaryType.VEGETARIAN]: 'Vegetariano',
    [DietaryType.VEGAN]: 'Vegano',
    [DietaryType.GLUTEN_FREE]: 'Sem Glúten',
    [DietaryType.DAIRY_FREE]: 'Sem Lactose',
    [DietaryType.KETO]: 'Keto',
    [DietaryType.PALEO]: 'Paleo',
    [DietaryType.LOW_CARB]: 'Low Carb',
    [DietaryType.HIGH_PROTEIN]: 'Rico em Proteína',
    [DietaryType.SUGAR_FREE]: 'Sem Açúcar',
  };
  return labels[dietaryType] || dietaryType;
};

/**
 * 📊 Format difficulty label
 */
const formatDifficultyLabel = (difficulty: DifficultyLevel): string => {
  const labels = {
    [DifficultyLevel.EASY]: 'Fácil',
    [DifficultyLevel.MEDIUM]: 'Médio',
    [DifficultyLevel.HARD]: 'Difícil',
  };
  return labels[difficulty] || 'Médio';
};

/**
 * 🎯 Create filter options for UI
 */
export const createFilterOptions = (): {
  mealTypes: FilterOption[];
  dietaryTypes: FilterOption[];
  difficulty: FilterOption[];
  cookingMethods: FilterOption[];
} => {
  return {
    mealTypes: [
      { label: 'Café da Manhã', value: MealType.BREAKFAST },
      { label: 'Almoço', value: MealType.LUNCH },
      { label: 'Jantar', value: MealType.DINNER },
      { label: 'Lanche', value: MealType.SNACK },
      { label: 'Sobremesa', value: MealType.DESSERT },
      { label: 'Bebida', value: MealType.DRINK },
      { label: 'Entrada', value: MealType.APPETIZER },
    ],
    
    dietaryTypes: [
      { label: 'Vegetariano', value: DietaryType.VEGETARIAN },
      { label: 'Vegano', value: DietaryType.VEGAN },
      { label: 'Sem Glúten', value: DietaryType.GLUTEN_FREE },
      { label: 'Sem Lactose', value: DietaryType.DAIRY_FREE },
      { label: 'Keto', value: DietaryType.KETO },
      { label: 'Paleo', value: DietaryType.PALEO },
      { label: 'Low Carb', value: DietaryType.LOW_CARB },
      { label: 'Rico em Proteína', value: DietaryType.HIGH_PROTEIN },
      { label: 'Sem Açúcar', value: DietaryType.SUGAR_FREE },
    ],
    
    difficulty: [
      { label: 'Fácil', value: DifficultyLevel.EASY },
      { label: 'Médio', value: DifficultyLevel.MEDIUM },
      { label: 'Difícil', value: DifficultyLevel.HARD },
    ],
    
    cookingMethods: [
      { label: 'Assar', value: CookingMethod.BAKING },
      { label: 'Fritar', value: CookingMethod.FRYING },
      { label: 'Grelhar', value: CookingMethod.GRILLING },
      { label: 'Ferver', value: CookingMethod.BOILING },
      { label: 'Vapor', value: CookingMethod.STEAMING },
      { label: 'Assar (Forno)', value: CookingMethod.ROASTING },
      { label: 'Refogar', value: CookingMethod.SAUTEING },
      { label: 'Sem Cozimento', value: CookingMethod.NO_COOK },
    ],
  };
};

/**
 * 🔄 Toggle filter value in array
 */
export const toggleFilterValue = <T>(array: T[] = [], value: T): T[] => {
  const index = array.indexOf(value);
  if (index > -1) {
    return array.filter(item => item !== value);
  } else {
    return [...array, value];
  }
};

/**
 * 📋 Remove filter by type
 */
export const removeFilterByType = (
  filters: CombinedFilters,
  filterType: keyof CombinedFilters
): CombinedFilters => {
  const newFilters = { ...filters };
  
  switch (filterType) {
    case 'categoryIds':
    case 'mealTypes':
    case 'dietaryTypes':
    case 'cookingMethods':
    case 'difficulty':
    case 'tags':
    case 'equipment':
    case 'cuisine':
      newFilters[filterType] = [];
      break;
    case 'servings':
    case 'calories':
      newFilters[filterType] = {};
      break;
    case 'rating':
      newFilters[filterType] = { min: 0, max: 5 };
      break;
    case 'ingredients':
      newFilters[filterType] = { include: [], exclude: [] };
      break;
    default:
      delete newFilters[filterType];
  }
  
  return newFilters;
};

/**
 * 🎯 Apply quick filters (common filter combinations)
 */
export const applyQuickFilter = (
  filters: CombinedFilters,
  quickFilterType: 'popular' | 'quick' | 'healthy' | 'vegetarian' | 'featured'
): CombinedFilters => {
  const newFilters = { ...filters };
  
  switch (quickFilterType) {
    case 'popular':
      newFilters.rating = { min: 4, max: 5 };
      break;
      
    case 'quick':
      newFilters.maxTotalTime = 30;
      break;
      
    case 'healthy':
      newFilters.dietaryTypes = [DietaryType.LOW_CARB, DietaryType.HIGH_PROTEIN];
      break;
      
    case 'vegetarian':
      newFilters.dietaryTypes = [DietaryType.VEGETARIAN];
      break;
      
    case 'featured':
      newFilters.isFeatured = true;
      break;
  }
  
  return newFilters;
};

/**
 * 💾 Serialize filters for storage
 */
export const serializeFilters = (filters: CombinedFilters): string => {
  try {
    const cleaned = cleanEmptyFilters(filters);
    return JSON.stringify(cleaned);
  } catch (error) {
    console.warn('Error serializing filters:', error);
    return JSON.stringify({});
  }
};

/**
 * 📥 Deserialize filters from storage
 */
export const deserializeFilters = (serialized: string): CombinedFilters => {
  try {
    const parsed = JSON.parse(serialized);
    return mergeFilters(createEmptyFilters(), parsed);
  } catch (error) {
    console.warn('Error deserializing filters:', error);
    return createEmptyFilters();
  }
};

/**
 * ✅ Validate filter values
 */
export const validateFilters = (filters: CombinedFilters): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validate time filters
  if (filters.maxPrepTime && filters.maxPrepTime < 0) {
    errors.push('Tempo de preparo deve ser positivo');
  }
  
  if (filters.maxCookTime && filters.maxCookTime < 0) {
    errors.push('Tempo de cozimento deve ser positivo');
  }
  
  if (filters.maxTotalTime && filters.maxTotalTime < 0) {
    errors.push('Tempo total deve ser positivo');
  }
  
  // Validate servings
  if (filters.servings?.min && filters.servings?.max && 
      filters.servings.min > filters.servings.max) {
    errors.push('Porção mínima não pode ser maior que a máxima');
  }
  
  // Validate calories
  if (filters.calories?.min && filters.calories?.max && 
      filters.calories.min > filters.calories.max) {
    errors.push('Calorias mínimas não podem ser maiores que as máximas');
  }
  
  // Validate rating
  if (filters.rating) {
    if (filters.rating.min < 0 || filters.rating.min > 5) {
      errors.push('Nota mínima deve estar entre 0 e 5');
    }
    if (filters.rating.max < 0 || filters.rating.max > 5) {
      errors.push('Nota máxima deve estar entre 0 e 5');
    }
    if (filters.rating.min > filters.rating.max) {
      errors.push('Nota mínima não pode ser maior que a máxima');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 📋 Filter helpers object
 */
export const FilterHelpers = {
  createEmptyFilters,
  mergeFilters,
  cleanEmptyFilters,
  countActiveFilters,
  getFilterStatistics,
  generateFilterLabels,
  createFilterOptions,
  toggleFilterValue,
  removeFilterByType,
  applyQuickFilter,
  serializeFilters,
  deserializeFilters,
  validateFilters,
};

export default FilterHelpers;