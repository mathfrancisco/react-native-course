/**
 * 🍳 Recipe Helpers
 * 
 * Helper functions for recipe data manipulation, formatting, and calculations.
 * These functions handle common recipe-related operations.
 */

import { Recipe, Ingredient, DifficultyLevel, MealType, CookingMethod, RecipeFilters } from '../../types/recipe.types';
import { formatQuantity, scaleRecipe } from '../../utils/numberUtils';
import { normalizeString, fuzzyMatch } from '../../utils/stringUtils';

/**
 * 🕒 Calculate total cooking time
 */
export const calculateTotalTime = (recipe: Recipe): number => {
  return recipe.timing.prepTime + recipe.timing.cookTime + (recipe.timing.restTime || 0);
};

/**
 * 📊 Format difficulty level
 */
export const formatDifficulty = (level: DifficultyLevel): string => {
  const difficultyMap = {
    [DifficultyLevel.EASY]: 'Fácil',
    [DifficultyLevel.MEDIUM]: 'Médio',
    [DifficultyLevel.HARD]: 'Difícil',
  };
  
  return difficultyMap[level] || 'Médio';
};

/**
 * 🎨 Get difficulty color
 */
export const getDifficultyColor = (level: DifficultyLevel): string => {
  const colorMap = {
    [DifficultyLevel.EASY]: '#4CAF50',
    [DifficultyLevel.MEDIUM]: '#FF9800',
    [DifficultyLevel.HARD]: '#F44336',
  };
  
  return colorMap[level] || '#FF9800';
};

/**
 * 🍽️ Format meal types
 */
export const formatMealTypes = (mealTypes: MealType[]): string => {
  const mealTypeMap = {
    [MealType.BREAKFAST]: 'Café da Manhã',
    [MealType.LUNCH]: 'Almoço',
    [MealType.DINNER]: 'Jantar',
    [MealType.SNACK]: 'Lanche',
    [MealType.DESSERT]: 'Sobremesa',
    [MealType.DRINK]: 'Bebida',
    [MealType.APPETIZER]: 'Entrada',
  };
  
  const formatted = mealTypes.map(type => mealTypeMap[type] || type);
  
  if (formatted.length === 0) return '';
  if (formatted.length === 1) return formatted[0];
  if (formatted.length === 2) return `${formatted[0]} e ${formatted[1]}`;
  
  return `${formatted.slice(0, -1).join(', ')} e ${formatted[formatted.length - 1]}`;
};

/**
 * 🔥 Format cooking methods
 */
export const formatCookingMethods = (methods: CookingMethod[]): string => {
  const methodMap = {
    [CookingMethod.BAKING]: 'Assar',
    [CookingMethod.FRYING]: 'Fritar',
    [CookingMethod.GRILLING]: 'Grelhar',
    [CookingMethod.BOILING]: 'Ferver',
    [CookingMethod.STEAMING]: 'Cozinhar no Vapor',
    [CookingMethod.ROASTING]: 'Assar',
    [CookingMethod.SAUTEING]: 'Refogar',
    [CookingMethod.NO_COOK]: 'Sem Cozimento',
  };
  
  return methods.map(method => methodMap[method] || method).join(', ');
};

/**
 * 📋 Format ingredients list
 */
export const formatIngredientsList = (
  ingredients: Ingredient[],
  servings?: number,
  originalServings?: number
): string[] => {
  return ingredients.map(ingredient => {
    let amount = ingredient.amount;
    
    // Scale ingredient if different servings
    if (servings && originalServings && servings !== originalServings) {
      amount = scaleRecipe(amount, originalServings, servings);
    }
    
    const formattedAmount = formatQuantity(amount, ingredient.unit);
    const optional = ingredient.isOptional ? ' (opcional)' : '';
    const notes = ingredient.notes ? ` - ${ingredient.notes}` : '';
    
    return `${formattedAmount} de ${ingredient.name}${optional}${notes}`;
  });
};

/**
 * 🛒 Extract shopping list from recipe
 */
export const extractShoppingList = (recipes: Recipe[]): Ingredient[] => {
  const ingredientMap = new Map<string, Ingredient>();
  
  recipes.forEach(recipe => {
    recipe.ingredients.forEach(ingredient => {
      const key = normalizeString(ingredient.name);
      
      if (ingredientMap.has(key)) {
        const existing = ingredientMap.get(key)!;
        // Try to combine if same unit
        if (existing.unit === ingredient.unit) {
          existing.amount += ingredient.amount;
        } else {
          // Keep separate if different units
          ingredientMap.set(`${key}_${ingredient.unit}`, ingredient);
        }
      } else {
        ingredientMap.set(key, { ...ingredient });
      }
    });
  });
  
  return Array.from(ingredientMap.values());
};

/**
 * 📊 Calculate recipe score
 */
export const calculateRecipeScore = (recipe: Recipe, userPreferences?: any): number => {
  let score = 0;
  
  // Base rating score (0-50 points)
  score += recipe.stats.averageRating * 10;
  
  // Popularity score (0-20 points)
  const popularityFactor = Math.min(recipe.stats.favorites / 100, 1);
  score += popularityFactor * 20;
  
  // Difficulty preference (0-10 points)
  if (userPreferences?.preferredDifficulty) {
    if (recipe.difficulty === userPreferences.preferredDifficulty) {
      score += 10;
    }
  }
  
  // Time preference (0-10 points)
  if (userPreferences?.maxTime) {
    const totalTime = calculateTotalTime(recipe);
    if (totalTime <= userPreferences.maxTime) {
      score += 10;
    }
  }
  
  // Dietary preferences (0-10 points)
  if (userPreferences?.dietaryTypes) {
    const matchingDiets = recipe.dietaryTypes.filter(diet => 
      userPreferences.dietaryTypes.includes(diet)
    );
    score += (matchingDiets.length / userPreferences.dietaryTypes.length) * 10;
  }
  
  return Math.min(score, 100);
};

/**
 * 🔍 Search recipes by query
 */
export const searchRecipes = (
  recipes: Recipe[],
  query: string,
  options?: {
    searchFields?: ('title' | 'description' | 'ingredients' | 'tags')[];
    fuzzy?: boolean;
  }
): Recipe[] => {
  if (!query.trim()) return recipes;
  
  const searchFields = options?.searchFields || ['title', 'description', 'ingredients', 'tags'];
  const normalizedQuery = normalizeString(query);
  
  return recipes.filter(recipe => {
    // Search in title
    if (searchFields.includes('title')) {
      if (fuzzyMatch(recipe.title, query)) return true;
    }
    
    // Search in description
    if (searchFields.includes('description')) {
      if (fuzzyMatch(recipe.description, query)) return true;
    }
    
    // Search in ingredients
    if (searchFields.includes('ingredients')) {
      const hasIngredient = recipe.ingredients.some(ingredient =>
        fuzzyMatch(ingredient.name, query)
      );
      if (hasIngredient) return true;
    }
    
    // Search in tags
    if (searchFields.includes('tags')) {
      const hasTag = recipe.tags.some(tag =>
        fuzzyMatch(tag.name, query)
      );
      if (hasTag) return true;
    }
    
    return false;
  });
};

/**
 * 🔧 Filter recipes
 */
export const filterRecipes = (recipes: Recipe[], filters: RecipeFilters): Recipe[] => {
  return recipes.filter(recipe => {
    // Category filter
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      if (!filters.categoryIds.includes(recipe.categoryId)) return false;
    }
    
    // Meal type filter
    if (filters.mealTypes && filters.mealTypes.length > 0) {
      const hasMatchingMealType = recipe.mealTypes.some(mealType =>
        filters.mealTypes!.includes(mealType)
      );
      if (!hasMatchingMealType) return false;
    }
    
    // Dietary type filter
    if (filters.dietaryTypes && filters.dietaryTypes.length > 0) {
      const hasMatchingDiet = recipe.dietaryTypes.some(diet =>
        filters.dietaryTypes!.includes(diet)
      );
      if (!hasMatchingDiet) return false;
    }
    
    // Difficulty filter
    if (filters.difficulty && filters.difficulty.length > 0) {
      if (!filters.difficulty.includes(recipe.difficulty)) return false;
    }
    
    // Time filters
    if (filters.maxPrepTime && recipe.timing.prepTime > filters.maxPrepTime) {
      return false;
    }
    
    if (filters.maxCookTime && recipe.timing.cookTime > filters.maxCookTime) {
      return false;
    }
    
    if (filters.maxTotalTime && calculateTotalTime(recipe) > filters.maxTotalTime) {
      return false;
    }
    
    // Servings filter
    if (filters.servings) {
      if (filters.servings.min && recipe.servings < filters.servings.min) return false;
      if (filters.servings.max && recipe.servings > filters.servings.max) return false;
    }
    
    // Rating filter
    if (filters.rating) {
      if (recipe.stats.averageRating < filters.rating.min) return false;
      if (recipe.stats.averageRating > filters.rating.max) return false;
    }
    
    // Ingredient filters
    if (filters.ingredients) {
      if (filters.ingredients.include && filters.ingredients.include.length > 0) {
        const hasRequiredIngredients = filters.ingredients.include.every(required =>
          recipe.ingredients.some(ingredient =>
            fuzzyMatch(ingredient.name, required)
          )
        );
        if (!hasRequiredIngredients) return false;
      }
      
      if (filters.ingredients.exclude && filters.ingredients.exclude.length > 0) {
        const hasExcludedIngredients = filters.ingredients.exclude.some(excluded =>
          recipe.ingredients.some(ingredient =>
            fuzzyMatch(ingredient.name, excluded)
          )
        );
        if (hasExcludedIngredients) return false;
      }
    }
    
    return true;
  });
};

/**
 * 📊 Sort recipes
 */
export const sortRecipes = (
  recipes: Recipe[],
  sortBy: 'rating' | 'prepTime' | 'cookTime' | 'totalTime' | 'popularity' | 'difficulty' | 'newest',
  order: 'asc' | 'desc' = 'desc'
): Recipe[] => {
  return [...recipes].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'rating':
        comparison = a.stats.averageRating - b.stats.averageRating;
        break;
      case 'prepTime':
        comparison = a.timing.prepTime - b.timing.prepTime;
        break;
      case 'cookTime':
        comparison = a.timing.cookTime - b.timing.cookTime;
        break;
      case 'totalTime':
        comparison = calculateTotalTime(a) - calculateTotalTime(b);
        break;
      case 'popularity':
        comparison = a.stats.favorites - b.stats.favorites;
        break;
      case 'difficulty':
        comparison = a.difficulty - b.difficulty;
        break;
      case 'newest':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
};

/**
 * 🎯 Get recipe recommendations
 */
export const getRecipeRecommendations = (
  allRecipes: Recipe[],
  baseRecipe: Recipe,
  userHistory?: Recipe[],
  limit: number = 5
): Recipe[] => {
  const recommendations = allRecipes
    .filter(recipe => recipe.id !== baseRecipe.id)
    .map(recipe => ({
      recipe,
      score: calculateSimilarityScore(baseRecipe, recipe, userHistory),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.recipe);
  
  return recommendations;
};

/**
 * 📊 Calculate similarity score between recipes
 */
const calculateSimilarityScore = (
  recipeA: Recipe,
  recipeB: Recipe,
  userHistory?: Recipe[]
): number => {
  let score = 0;
  
  // Same category
  if (recipeA.categoryId === recipeB.categoryId) score += 20;
  
  // Common meal types
  const commonMealTypes = recipeA.mealTypes.filter(type =>
    recipeB.mealTypes.includes(type)
  );
  score += commonMealTypes.length * 5;
  
  // Common dietary types
  const commonDietary = recipeA.dietaryTypes.filter(type =>
    recipeB.dietaryTypes.includes(type)
  );
  score += commonDietary.length * 3;
  
  // Similar difficulty
  const difficultyDiff = Math.abs(recipeA.difficulty - recipeB.difficulty);
  score += (3 - difficultyDiff) * 5;
  
  // Common ingredients
  const commonIngredients = recipeA.ingredients.filter(ingA =>
    recipeB.ingredients.some(ingB =>
      fuzzyMatch(ingA.name, ingB.name)
    )
  );
  score += commonIngredients.length * 2;
  
  // User history boost
  if (userHistory) {
    const userLikesCategory = userHistory.some(recipe =>
      recipe.categoryId === recipeB.categoryId
    );
    if (userLikesCategory) score += 10;
  }
  
  return score;
};

/**
 * ✅ Validate recipe data
 */
export const validateRecipeData = (recipe: Partial<Recipe>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!recipe.title || recipe.title.trim().length < 3) {
    errors.push('Título deve ter pelo menos 3 caracteres');
  }
  
  if (!recipe.description || recipe.description.trim().length < 10) {
    errors.push('Descrição deve ter pelo menos 10 caracteres');
  }
  
  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    errors.push('Receita deve ter pelo menos 1 ingrediente');
  }
  
  if (!recipe.instructions || recipe.instructions.length === 0) {
    errors.push('Receita deve ter pelo menos 1 instrução');
  }
  
  if (!recipe.servings || recipe.servings < 1) {
    errors.push('Receita deve servir pelo menos 1 pessoa');
  }
  
  if (!recipe.timing?.prepTime || recipe.timing.prepTime < 1) {
    errors.push('Tempo de preparo deve ser pelo menos 1 minuto');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 📋 Recipe helpers object
 */
export const RecipeHelpers = {
  calculateTotalTime,
  formatDifficulty,
  getDifficultyColor,
  formatMealTypes,
  formatCookingMethods,
  formatIngredientsList,
  extractShoppingList,
  calculateRecipeScore,
  searchRecipes,
  filterRecipes,
  sortRecipes,
  getRecipeRecommendations,
  validateRecipeData,
};

export default RecipeHelpers;