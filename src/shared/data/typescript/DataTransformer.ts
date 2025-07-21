/**
 * 🔄 Data Transformer
 * 
 * Transforms data between different formats and structures.
 * Handles data migration, format conversion, and structure adaptation.
 */

import { Recipe, Ingredient, Instruction, DifficultyLevel, MealType, DietaryType } from '../../types/recipe.types';
import { Category } from '../../types/category.types';
import { formatCookingTime, scaleRecipe } from '../../utils/numberUtils';
import { createSlug, normalizeString } from '../../utils/stringUtils';

/**
 * 🔄 Transform API recipe to internal format
 */
export const transformApiRecipeToInternal = (apiRecipe: any): Recipe => {
  return {
    id: apiRecipe.id || generateId(),
    title: apiRecipe.title || apiRecipe.name || '',
    description: apiRecipe.description || apiRecipe.summary || '',
    imageUrl: apiRecipe.image || apiRecipe.imageUrl || apiRecipe.photo,
    images: apiRecipe.images || [],
    
    ingredients: transformApiIngredients(apiRecipe.ingredients || []),
    instructions: transformApiInstructions(apiRecipe.instructions || apiRecipe.steps || []),
    
    servings: parseInt(apiRecipe.servings || apiRecipe.portions || '4', 10),
    difficulty: transformApiDifficulty(apiRecipe.difficulty),
    
    timing: {
      prepTime: parseInt(apiRecipe.prepTime || apiRecipe.preparationTime || '30', 10),
      cookTime: parseInt(apiRecipe.cookTime || apiRecipe.cookingTime || '30', 10),
      totalTime: 0, // Will be calculated
      restTime: parseInt(apiRecipe.restTime || '0', 10),
    },
    
    categoryId: apiRecipe.categoryId || apiRecipe.category?.id || 'uncategorized',
    mealTypes: transformApiMealTypes(apiRecipe.mealTypes || apiRecipe.categories || []),
    cookingMethods: apiRecipe.cookingMethods || [],
    dietaryTypes: transformApiDietaryTypes(apiRecipe.dietaryTypes || apiRecipe.diet || []),
    
    tags: transformApiTags(apiRecipe.tags || []),
    cuisine: apiRecipe.cuisine || apiRecipe.origin,
    
    nutrition: transformApiNutrition(apiRecipe.nutrition),
    
    author: {
      id: apiRecipe.author?.id || apiRecipe.authorId || 'unknown',
      name: apiRecipe.author?.name || apiRecipe.authorName || 'Desconhecido',
      avatar: apiRecipe.author?.avatar || apiRecipe.author?.photo,
      bio: apiRecipe.author?.bio,
      verified: apiRecipe.author?.verified || false,
    },
    
    stats: {
      views: apiRecipe.views || 0,
      favorites: apiRecipe.favorites || apiRecipe.likes || 0,
      timesCooked: apiRecipe.timesCooked || 0,
      averageRating: parseFloat(apiRecipe.rating || apiRecipe.averageRating || '0'),
      totalRatings: apiRecipe.totalRatings || apiRecipe.reviewCount || 0,
      shares: apiRecipe.shares || 0,
    },
    
    ratings: apiRecipe.ratings || [],
    
    source: {
      type: apiRecipe.source?.type || 'api',
      name: apiRecipe.source?.name || apiRecipe.sourceName,
      url: apiRecipe.source?.url || apiRecipe.sourceUrl,
      author: apiRecipe.source?.author,
    },
    
    isPublic: apiRecipe.isPublic !== false,
    isVerified: apiRecipe.isVerified || false,
    isFeatured: apiRecipe.isFeatured || false,
    status: apiRecipe.status || 'published',
    
    language: apiRecipe.language || 'pt-BR',
    searchKeywords: apiRecipe.searchKeywords || [],
    equipment: apiRecipe.equipment || [],
    
    createdAt: new Date(apiRecipe.createdAt || Date.now()),
    updatedAt: new Date(apiRecipe.updatedAt || Date.now()),
  };
};

/**
 * 🥕 Transform API ingredients
 */
const transformApiIngredients = (apiIngredients: any[]): Ingredient[] => {
  return apiIngredients.map((ing, index) => ({
    id: ing.id || `ingredient_${index}`,
    name: ing.name || ing.ingredient || '',
    amount: parseFloat(ing.amount || ing.quantity || '1'),
    unit: ing.unit || ing.measure || 'unidade',
    notes: ing.notes || ing.description,
    isOptional: ing.isOptional || ing.optional || false,
    category: ing.category,
    substitutes: ing.substitutes || [],
  }));
};

/**
 * 📋 Transform API instructions
 */
const transformApiInstructions = (apiInstructions: any[]): Instruction[] => {
  return apiInstructions.map((inst, index) => ({
    id: inst.id || `instruction_${index}`,
    stepNumber: inst.stepNumber || inst.step || index + 1,
    description: inst.description || inst.instruction || inst.text || '',
    imageUrl: inst.imageUrl || inst.image,
    timer: inst.timer ? parseInt(inst.timer, 10) : undefined,
    temperature: inst.temperature ? {
      value: parseFloat(inst.temperature.value || inst.temperature),
      unit: inst.temperature.unit || 'celsius',
      description: inst.temperature.description,
    } : undefined,
    notes: inst.notes,
    tips: inst.tips || [],
  }));
};

/**
 * 📊 Transform API difficulty
 */
const transformApiDifficulty = (apiDifficulty: any): DifficultyLevel => {
  if (typeof apiDifficulty === 'number') {
    return Math.max(1, Math.min(3, apiDifficulty)) as DifficultyLevel;
  }
  
  const difficultyMap: { [key: string]: DifficultyLevel } = {
    'easy': DifficultyLevel.EASY,
    'fácil': DifficultyLevel.EASY,
    'beginner': DifficultyLevel.EASY,
    'medium': DifficultyLevel.MEDIUM,
    'médio': DifficultyLevel.MEDIUM,
    'intermediate': DifficultyLevel.MEDIUM,
    'hard': DifficultyLevel.HARD,
    'difícil': DifficultyLevel.HARD,
    'advanced': DifficultyLevel.HARD,
  };
  
  const normalized = normalizeString(apiDifficulty || 'medium');
  return difficultyMap[normalized] || DifficultyLevel.MEDIUM;
};

/**
 * 🍽️ Transform API meal types
 */
const transformApiMealTypes = (apiMealTypes: any[]): MealType[] => {
  const mealTypeMap: { [key: string]: MealType } = {
    'breakfast': MealType.BREAKFAST,
    'café da manhã': MealType.BREAKFAST,
    'lunch': MealType.LUNCH,
    'almoço': MealType.LUNCH,
    'dinner': MealType.DINNER,
    'jantar': MealType.DINNER,
    'snack': MealType.SNACK,
    'lanche': MealType.SNACK,
    'dessert': MealType.DESSERT,
    'sobremesa': MealType.DESSERT,
    'drink': MealType.DRINK,
    'bebida': MealType.DRINK,
    'appetizer': MealType.APPETIZER,
    'entrada': MealType.APPETIZER,
  };
  
  return apiMealTypes
    .map(type => mealTypeMap[normalizeString(type)] || null)
    .filter(Boolean) as MealType[];
};

/**
 * 🥗 Transform API dietary types
 */
const transformApiDietaryTypes = (apiDietaryTypes: any[]): DietaryType[] => {
  const dietaryMap: { [key: string]: DietaryType } = {
    'vegetarian': DietaryType.VEGETARIAN,
    'vegetariano': DietaryType.VEGETARIAN,
    'vegan': DietaryType.VEGAN,
    'vegano': DietaryType.VEGAN,
    'gluten-free': DietaryType.GLUTEN_FREE,
    'sem glúten': DietaryType.GLUTEN_FREE,
    'dairy-free': DietaryType.DAIRY_FREE,
    'sem lactose': DietaryType.DAIRY_FREE,
    'keto': DietaryType.KETO,
    'cetogênico': DietaryType.KETO,
    'paleo': DietaryType.PALEO,
    'low-carb': DietaryType.LOW_CARB,
    'baixo carboidrato': DietaryType.LOW_CARB,
    'high-protein': DietaryType.HIGH_PROTEIN,
    'rico em proteína': DietaryType.HIGH_PROTEIN,
  };
  
  return apiDietaryTypes
    .map(type => dietaryMap[normalizeString(type)] || null)
    .filter(Boolean) as DietaryType[];
};

/**
 * 🏷️ Transform API tags
 */
const transformApiTags = (apiTags: any[]): any[] => {
  return apiTags.map((tag, index) => ({
    id: tag.id || `tag_${index}`,
    name: typeof tag === 'string' ? tag : tag.name || '',
    color: tag.color,
  }));
};

/**
 * 📊 Transform API nutrition
 */
const transformApiNutrition = (apiNutrition: any): any => {
  if (!apiNutrition) return undefined;
  
  return {
    servingSize: apiNutrition.servingSize,
    calories: parseFloat(apiNutrition.calories || '0'),
    protein: parseFloat(apiNutrition.protein || '0'),
    carbs: parseFloat(apiNutrition.carbs || apiNutrition.carbohydrates || '0'),
    fat: parseFloat(apiNutrition.fat || '0'),
    fiber: parseFloat(apiNutrition.fiber || '0'),
    sugar: parseFloat(apiNutrition.sugar || '0'),
    sodium: parseFloat(apiNutrition.sodium || '0'),
    cholesterol: parseFloat(apiNutrition.cholesterol || '0'),
    vitaminC: parseFloat(apiNutrition.vitaminC || '0'),
    calcium: parseFloat(apiNutrition.calcium || '0'),
    iron: parseFloat(apiNutrition.iron || '0'),
  };
};

/**
 * 📂 Transform API category to internal format
 */
export const transformApiCategoryToInternal = (apiCategory: any): Category => {
  return {
    id: apiCategory.id || generateId(),
    name: apiCategory.name || '',
    description: apiCategory.description,
    slug: apiCategory.slug || createSlug(apiCategory.name || ''),
    
    imageUrl: apiCategory.imageUrl || apiCategory.image,
    iconName: apiCategory.iconName || apiCategory.icon,
    color: apiCategory.color || '#FFC107',
    
    parentId: apiCategory.parentId || apiCategory.parent?.id,
    level: parseInt(apiCategory.level || '0', 10),
    path: apiCategory.path || '',
    
    isActive: apiCategory.isActive !== false,
    isVisible: apiCategory.isVisible !== false,
    isFeatured: apiCategory.isFeatured || false,
    
    sortOrder: parseInt(apiCategory.sortOrder || '0', 10),
    priority: parseInt(apiCategory.priority || '0', 10),
    
    recipeCount: parseInt(apiCategory.recipeCount || '0', 10),
    activeRecipeCount: parseInt(apiCategory.activeRecipeCount || apiCategory.recipeCount || '0', 10),
    
    tags: apiCategory.tags || [],
    keywords: apiCategory.keywords || [],
    
    mealTypes: transformApiMealTypes(apiCategory.mealTypes || []),
    dietaryTypes: transformApiDietaryTypes(apiCategory.dietaryTypes || []),
    cookingMethods: apiCategory.cookingMethods || [],
    
    translations: apiCategory.translations || [],
    
    createdAt: new Date(apiCategory.createdAt || Date.now()),
    updatedAt: new Date(apiCategory.updatedAt || Date.now()),
  };
};

/**
 * 🔄 Transform internal recipe for API
 */
export const transformInternalRecipeForApi = (recipe: Recipe): any => {
  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    image: recipe.imageUrl,
    images: recipe.images,
    
    ingredients: recipe.ingredients.map(ing => ({
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      notes: ing.notes,
      optional: ing.isOptional,
    })),
    
    instructions: recipe.instructions.map(inst => ({
      step: inst.stepNumber,
      description: inst.description,
      image: inst.imageUrl,
      timer: inst.timer,
      temperature: inst.temperature,
    })),
    
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    prepTime: recipe.timing.prepTime,
    cookTime: recipe.timing.cookTime,
    totalTime: recipe.timing.totalTime,
    
    categoryId: recipe.categoryId,
    mealTypes: recipe.mealTypes,
    dietaryTypes: recipe.dietaryTypes,
    
    tags: recipe.tags.map(tag => tag.name),
    cuisine: recipe.cuisine,
    
    nutrition: recipe.nutrition,
    
    author: {
      id: recipe.author.id,
      name: recipe.author.name,
      avatar: recipe.author.avatar,
    },
    
    rating: recipe.stats.averageRating,
    favorites: recipe.stats.favorites,
    views: recipe.stats.views,
    
    isPublic: recipe.isPublic,
    isFeatured: recipe.isFeatured,
    
    createdAt: recipe.createdAt.toISOString(),
    updatedAt: recipe.updatedAt.toISOString(),
  };
};

/**
 * 📏 Scale recipe for different servings
 */
export const scaleRecipeForServings = (recipe: Recipe, targetServings: number): Recipe => {
  if (targetServings === recipe.servings) return recipe;
  
  const scaledIngredients = recipe.ingredients.map(ingredient => ({
    ...ingredient,
    amount: scaleRecipe(ingredient.amount, recipe.servings, targetServings),
  }));
  
  return {
    ...recipe,
    ingredients: scaledIngredients,
    servings: targetServings,
  };
};

/**
 * 🌍 Localize recipe for different languages
 */
export const localizeRecipe = (recipe: Recipe, targetLanguage: string): Recipe => {
  // This would integrate with translation service
  // For now, return as-is
  return {
    ...recipe,
    language: targetLanguage,
  };
};

/**
 * 📊 Normalize recipe data
 */
export const normalizeRecipeData = (recipe: Recipe): Recipe => {
  // Calculate total time
  const totalTime = recipe.timing.prepTime + recipe.timing.cookTime + (recipe.timing.restTime || 0);
  
  // Ensure arrays are not undefined
  const normalizedRecipe: Recipe = {
    ...recipe,
    timing: {
      ...recipe.timing,
      totalTime,
    },
    mealTypes: recipe.mealTypes || [],
    dietaryTypes: recipe.dietaryTypes || [],
    cookingMethods: recipe.cookingMethods || [],
    tags: recipe.tags || [],
    equipment: recipe.equipment || [],
    searchKeywords: recipe.searchKeywords || [],
    images: recipe.images || [],
    ratings: recipe.ratings || [],
  };
  
  return normalizedRecipe;
};

/**
 * 📄 Convert recipe to export format
 */
export const convertRecipeToExportFormat = (
  recipe: Recipe,
  format: 'json' | 'yaml' | 'text' | 'pdf'
): string => {
  const exportData = {
    title: recipe.title,
    description: recipe.description,
    servings: recipe.servings,
    prepTime: formatCookingTime(recipe.timing.prepTime),
    cookTime: formatCookingTime(recipe.timing.cookTime),
    difficulty: getDifficultyText(recipe.difficulty),
    
    ingredients: recipe.ingredients.map(ing => 
      `${ing.amount} ${ing.unit} de ${ing.name}${ing.notes ? ` (${ing.notes})` : ''}`
    ),
    
    instructions: recipe.instructions.map(inst => 
      `${inst.stepNumber}. ${inst.description}`
    ),
    
    tags: recipe.tags.map(tag => tag.name),
    cuisine: recipe.cuisine,
    author: recipe.author.name,
  };
  
  switch (format) {
    case 'json':
      return JSON.stringify(exportData, null, 2);
    case 'text':
      return convertToTextFormat(exportData);
    default:
      return JSON.stringify(exportData, null, 2);
  }
};

/**
 * 📝 Convert to text format
 */
const convertToTextFormat = (data: any): string => {
  return `
${data.title}

${data.description}

Porções: ${data.servings}
Preparo: ${data.prepTime}
Cozimento: ${data.cookTime}
Dificuldade: ${data.difficulty}

INGREDIENTES:
${data.ingredients.map((ing: string) => `• ${ing}`).join('\n')}

MODO DE PREPARO:
${data.instructions.map((inst: string) => inst).join('\n')}

Tags: ${data.tags.join(', ')}
Cozinha: ${data.cuisine || 'Não especificada'}
Autor: ${data.author}
  `.trim();
};

/**
 * 📊 Get difficulty text
 */
const getDifficultyText = (difficulty: DifficultyLevel): string => {
  const map = {
    [DifficultyLevel.EASY]: 'Fácil',
    [DifficultyLevel.MEDIUM]: 'Médio',
    [DifficultyLevel.HARD]: 'Difícil',
  };
  return map[difficulty] || 'Médio';
};

/**
 * 🆔 Generate ID
 */
const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 📋 Data transformer object
 */
export const DataTransformer = {
  transformApiRecipeToInternal,
  transformApiCategoryToInternal,
  transformInternalRecipeForApi,
  scaleRecipeForServings,
  localizeRecipe,
  normalizeRecipeData,
  convertRecipeToExportFormat,
};

export default DataTransformer;