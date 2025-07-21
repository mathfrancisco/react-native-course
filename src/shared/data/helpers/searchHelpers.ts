/**
 * 🔍 Search Helpers
 * 
 * Helper functions for search functionality, query processing, and result ranking.
 * These functions handle search-related operations and optimizations.
 */

import { Recipe } from '../../types/recipe.types';
import { Category } from '../../types/category.types';
import { normalizeString, fuzzyMatch, stringSimilarity, extractNumbers } from '../../utils/stringUtils';

/**
 * 🔤 Search Query Interface
 */
export interface SearchQuery {
  originalQuery: string;
  normalizedQuery: string;
  keywords: string[];
  numbers: number[];
  filters: SearchFilters;
  suggestions: string[];
}

/**
 * 🎯 Search Filters Interface
 */
export interface SearchFilters {
  categories?: string[];
  mealTypes?: string[];
  dietaryTypes?: string[];
  maxTime?: number;
  difficulty?: number[];
  ingredients?: {
    include?: string[];
    exclude?: string[];
  };
  minRating?: number;
}

/**
 * 📊 Search Result Interface
 */
export interface SearchResult<T = any> {
  item: T;
  score: number;
  matchedFields: string[];
  highlightedSnippets: { [field: string]: string };
  relevanceFactors: string[];
}

/**
 * 🔍 Process search query
 */
export const processSearchQuery = (query: string): SearchQuery => {
  const originalQuery = query.trim();
  const normalizedQuery = normalizeString(originalQuery);
  
  // Extract keywords (filter out common words)
  const commonWords = new Set(['de', 'da', 'do', 'com', 'para', 'em', 'na', 'no', 'e', 'ou', 'a', 'o']);
  const keywords = normalizedQuery
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word));
  
  // Extract numbers (for time, servings, etc.)
  const numbers = extractNumbers(originalQuery);
  
  // Extract implicit filters from query
  const filters = extractFiltersFromQuery(originalQuery);
  
  // Generate suggestions
  const suggestions = generateQuerySuggestions(normalizedQuery, keywords);
  
  return {
    originalQuery,
    normalizedQuery,
    keywords,
    numbers,
    filters,
    suggestions,
  };
};

/**
 * 🎯 Extract filters from natural language query
 */
export const extractFiltersFromQuery = (query: string): SearchFilters => {
  const filters: SearchFilters = {};
  const lowerQuery = query.toLowerCase();
  
  // Time-related filters
  const timePatterns = [
    { pattern: /(\d+)\s*min(?:utos?)?/g, type: 'minutes' },
    { pattern: /(\d+)\s*h(?:oras?)?/g, type: 'hours' },
    { pattern: /rápid[oa]|rápid[oa]s/g, max: 30 },
    { pattern: /demorad[oa]|lent[oa]/g, min: 60 },
  ];
  
  timePatterns.forEach(({ pattern, type, max, min }) => {
    const matches = lowerQuery.match(pattern);
    if (matches) {
      if (type === 'minutes') {
        const minutes = parseInt(matches[0]);
        filters.maxTime = minutes;
      } else if (type === 'hours') {
        const hours = parseInt(matches[0]);
        filters.maxTime = hours * 60;
      } else if (max) {
        filters.maxTime = max;
      } else if (min) {
        filters.maxTime = min;
      }
    }
  });
  
  // Difficulty filters
  const difficultyPatterns = [
    { pattern: /fácil|simples|básic[oa]/g, level: [1] },
    { pattern: /médio|intermediário/g, level: [2] },
    { pattern: /difícil|avançad[oa]|complicad[oa]/g, level: [3] },
  ];
  
  difficultyPatterns.forEach(({ pattern, level }) => {
    if (pattern.test(lowerQuery)) {
      filters.difficulty = level;
    }
  });
  
  // Dietary filters
  const dietaryPatterns = [
    { pattern: /vegan[oa]?/g, type: 'vegan' },
    { pattern: /vegetarian[oa]?/g, type: 'vegetarian' },
    { pattern: /sem glúten|gluten.free/g, type: 'gluten_free' },
    { pattern: /sem lactose|dairy.free/g, type: 'dairy_free' },
    { pattern: /keto|cetogênic[oa]/g, type: 'keto' },
    { pattern: /paleo/g, type: 'paleo' },
    { pattern: /low.carb|baixo carboidrato/g, type: 'low_carb' },
  ];
  
  const dietaryTypes: string[] = [];
  dietaryPatterns.forEach(({ pattern, type }) => {
    if (pattern.test(lowerQuery)) {
      dietaryTypes.push(type);
    }
  });
  
  if (dietaryTypes.length > 0) {
    filters.dietaryTypes = dietaryTypes;
  }
  
  // Meal type filters
  const mealPatterns = [
    { pattern: /café da manhã|breakfast/g, type: 'breakfast' },
    { pattern: /almoço|lunch/g, type: 'lunch' },
    { pattern: /jantar|dinner/g, type: 'dinner' },
    { pattern: /lanche|snack/g, type: 'snack' },
    { pattern: /sobremesa|dessert/g, type: 'dessert' },
    { pattern: /bebida|drink/g, type: 'drink' },
  ];
  
  const mealTypes: string[] = [];
  mealPatterns.forEach(({ pattern, type }) => {
    if (pattern.test(lowerQuery)) {
      mealTypes.push(type);
    }
  });
  
  if (mealTypes.length > 0) {
    filters.mealTypes = mealTypes;
  }
  
  return filters;
};

/**
 * 💡 Generate query suggestions
 */
export const generateQuerySuggestions = (query: string, keywords: string[]): string[] => {
  const suggestions: string[] = [];
  
  // Common recipe terms
  const commonTerms = [
    'receita de', 'como fazer', 'fácil', 'rápido', 'caseiro',
    'tradicional', 'gourmet', 'diet', 'fitness', 'vegano',
  ];
  
  // Suggest adding common terms
  commonTerms.forEach(term => {
    if (!query.includes(term)) {
      suggestions.push(`${term} ${query}`);
    }
  });
  
  // Suggest variations of keywords
  keywords.forEach(keyword => {
    if (keyword.length > 3) {
      // Plural/singular variations
      if (keyword.endsWith('s')) {
        suggestions.push(query.replace(keyword, keyword.slice(0, -1)));
      } else {
        suggestions.push(query.replace(keyword, keyword + 's'));
      }
    }
  });
  
  return suggestions.slice(0, 5); // Limit suggestions
};

/**
 * 🍳 Search recipes with advanced scoring
 */
export const searchRecipes = (
  recipes: Recipe[],
  searchQuery: SearchQuery,
  options?: {
    maxResults?: number;
    minScore?: number;
    boostFields?: { [field: string]: number };
  }
): SearchResult<Recipe>[] => {
  const maxResults = options?.maxResults || 50;
  const minScore = options?.minScore || 0.1;
  const boostFields = options?.boostFields || {
    title: 3,
    description: 1,
    ingredients: 2,
    tags: 1.5,
  };
  
  const results: SearchResult<Recipe>[] = [];
  
  recipes.forEach(recipe => {
    const score = calculateRecipeSearchScore(recipe, searchQuery, boostFields);
    
    if (score >= minScore) {
      const matchedFields = getMatchedFields(recipe, searchQuery);
      const highlightedSnippets = generateHighlightedSnippets(recipe, searchQuery);
      const relevanceFactors = getRelevanceFactors(recipe, searchQuery);
      
      results.push({
        item: recipe,
        score,
        matchedFields,
        highlightedSnippets,
        relevanceFactors,
      });
    }
  });
  
  // Sort by score and limit results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
};

/**
 * 📊 Calculate recipe search score
 */
export const calculateRecipeSearchScore = (
  recipe: Recipe,
  searchQuery: SearchQuery,
  boostFields: { [field: string]: number }
): number => {
  let score = 0;
  
  // Title matching
  const titleScore = calculateFieldScore(recipe.title, searchQuery.keywords);
  score += titleScore * (boostFields.title || 1);
  
  // Description matching
  const descriptionScore = calculateFieldScore(recipe.description, searchQuery.keywords);
  score += descriptionScore * (boostFields.description || 1);
  
  // Ingredients matching
  const ingredientsText = recipe.ingredients.map(ing => ing.name).join(' ');
  const ingredientsScore = calculateFieldScore(ingredientsText, searchQuery.keywords);
  score += ingredientsScore * (boostFields.ingredients || 1);
  
  // Tags matching
  const tagsText = recipe.tags.map(tag => tag.name).join(' ');
  const tagsScore = calculateFieldScore(tagsText, searchQuery.keywords);
  score += tagsScore * (boostFields.tags || 1);
  
  // Exact phrase bonus
  if (fuzzyMatch(recipe.title, searchQuery.originalQuery)) {
    score += 2;
  }
  
  // Popularity boost
  const popularityBoost = Math.min(recipe.stats.averageRating / 5, 1) * 0.5;
  score += popularityBoost;
  
  // Recency boost (newer recipes get slight boost)
  const daysSinceCreated = (Date.now() - new Date(recipe.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const recencyBoost = Math.max(0, (30 - daysSinceCreated) / 30) * 0.3;
  score += recencyBoost;
  
  return score;
};

/**
 * 📝 Calculate field-specific score
 */
const calculateFieldScore = (fieldText: string, keywords: string[]): number => {
  if (!fieldText || keywords.length === 0) return 0;
  
  const normalizedText = normalizeString(fieldText);
  let score = 0;
  
  keywords.forEach(keyword => {
    // Exact match bonus
    if (normalizedText.includes(keyword)) {
      score += 1;
    }
    
    // Fuzzy match
    const words = normalizedText.split(/\s+/);
    words.forEach(word => {
      const similarity = stringSimilarity(word, keyword);
      if (similarity > 0.7) {
        score += similarity * 0.5;
      }
    });
  });
  
  // Boost for multiple keyword matches
  const uniqueMatches = keywords.filter(keyword => 
    normalizedText.includes(keyword)
  );
  
  if (uniqueMatches.length > 1) {
    score += uniqueMatches.length * 0.3;
  }
  
  return score;
};

/**
 * 🎯 Get matched fields for a recipe
 */
const getMatchedFields = (recipe: Recipe, searchQuery: SearchQuery): string[] => {
  const matched: string[] = [];
  
  if (searchQuery.keywords.some(keyword => fuzzyMatch(recipe.title, keyword))) {
    matched.push('title');
  }
  
  if (searchQuery.keywords.some(keyword => fuzzyMatch(recipe.description, keyword))) {
    matched.push('description');
  }
  
  const hasIngredientMatch = recipe.ingredients.some(ingredient =>
    searchQuery.keywords.some(keyword => fuzzyMatch(ingredient.name, keyword))
  );
  if (hasIngredientMatch) {
    matched.push('ingredients');
  }
  
  const hasTagMatch = recipe.tags.some(tag =>
    searchQuery.keywords.some(keyword => fuzzyMatch(tag.name, keyword))
  );
  if (hasTagMatch) {
    matched.push('tags');
  }
  
  return matched;
};

/**
 * ✨ Generate highlighted snippets
 */
const generateHighlightedSnippets = (
  recipe: Recipe,
  searchQuery: SearchQuery
): { [field: string]: string } => {
  const snippets: { [field: string]: string } = {};
  
  // Title snippet
  snippets.title = highlightKeywords(recipe.title, searchQuery.keywords);
  
  // Description snippet (first 150 chars)
  const description = recipe.description.length > 150 
    ? recipe.description.substring(0, 150) + '...'
    : recipe.description;
  snippets.description = highlightKeywords(description, searchQuery.keywords);
  
  // Matching ingredients
  const matchingIngredients = recipe.ingredients.filter(ingredient =>
    searchQuery.keywords.some(keyword => fuzzyMatch(ingredient.name, keyword))
  );
  
  if (matchingIngredients.length > 0) {
    const ingredientNames = matchingIngredients.slice(0, 3).map(ing => ing.name);
    snippets.ingredients = highlightKeywords(ingredientNames.join(', '), searchQuery.keywords);
  }
  
  return snippets;
};

/**
 * 🎨 Highlight keywords in text
 */
const highlightKeywords = (text: string, keywords: string[]): string => {
  let highlighted = text;
  
  keywords.forEach(keyword => {
    const regex = new RegExp(`(${keyword})`, 'gi');
    highlighted = highlighted.replace(regex, '<mark>$1</mark>');
  });
  
  return highlighted;
};

/**
 * 💡 Get relevance factors
 */
const getRelevanceFactors = (recipe: Recipe, searchQuery: SearchQuery): string[] => {
  const factors: string[] = [];
  
  if (fuzzyMatch(recipe.title, searchQuery.originalQuery)) {
    factors.push('Título corresponde exatamente');
  }
  
  if (recipe.stats.averageRating >= 4.5) {
    factors.push('Receita muito bem avaliada');
  }
  
  if (recipe.stats.favorites > 100) {
    factors.push('Popular entre usuários');
  }
  
  const matchingIngredients = recipe.ingredients.filter(ingredient =>
    searchQuery.keywords.some(keyword => fuzzyMatch(ingredient.name, keyword))
  );
  
  if (matchingIngredients.length > 1) {
    factors.push(`${matchingIngredients.length} ingredientes correspondentes`);
  }
  
  return factors;
};

/**
 * 📂 Search categories
 */
export const searchCategories = (
  categories: Category[],
  searchQuery: SearchQuery
): SearchResult<Category>[] => {
  const results: SearchResult<Category>[] = [];
  
  categories.forEach(category => {
    let score = 0;
    const matchedFields: string[] = [];
    
    // Name matching
    if (searchQuery.keywords.some(keyword => fuzzyMatch(category.name, keyword))) {
      score += 3;
      matchedFields.push('name');
    }
    
    // Description matching
    if (category.description && 
        searchQuery.keywords.some(keyword => fuzzyMatch(category.description!, keyword))) {
      score += 1;
      matchedFields.push('description');
    }
    
    // Keywords matching
    if (category.keywords) {
      const keywordMatches = category.keywords.filter(catKeyword =>
        searchQuery.keywords.some(searchKeyword => fuzzyMatch(catKeyword, searchKeyword))
      );
      
      if (keywordMatches.length > 0) {
        score += keywordMatches.length * 0.5;
        matchedFields.push('keywords');
      }
    }
    
    if (score > 0) {
      results.push({
        item: category,
        score,
        matchedFields,
        highlightedSnippets: {
          name: highlightKeywords(category.name, searchQuery.keywords),
        },
        relevanceFactors: [],
      });
    }
  });
  
  return results.sort((a, b) => b.score - a.score);
};

/**
 * 📈 Track search analytics
 */
export const trackSearchAnalytics = (
  query: string,
  results: SearchResult<any>[],
  userId?: string
): void => {
  const analytics = {
    query,
    resultCount: results.length,
    avgScore: results.length > 0 
      ? results.reduce((sum, r) => sum + r.score, 0) / results.length 
      : 0,
    timestamp: new Date(),
    userId,
  };
  
  // In a real app, this would send to analytics service
  console.log('Search Analytics:', analytics);
};

/**
 * 📋 Search helpers object
 */
export const SearchHelpers = {
  processSearchQuery,
  extractFiltersFromQuery,
  generateQuerySuggestions,
  searchRecipes,
  searchCategories,
  calculateRecipeSearchScore,
  trackSearchAnalytics,
};

export default SearchHelpers;