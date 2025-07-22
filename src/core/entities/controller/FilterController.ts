import { ValidationResult } from "../interface/Common";
import { RecipeFilter, SearchCriteria } from "../interface/Filter";
import { Recipe } from "../interface/Recipe";


export class FilterController {
  /**
   * Valida critérios de busca
   */
  static validateSearchCriteria(criteria: SearchCriteria): ValidationResult {
    const errors: string[] = [];
    
    if (criteria.query && criteria.query.length < 2) {
      errors.push('Consulta de busca deve ter pelo menos 2 caracteres');
    }
    
    if (criteria.limit && criteria.limit <= 0) {
      errors.push('Limite deve ser positivo');
    }
    
    if (criteria.offset && criteria.offset < 0) {
      errors.push('Offset não pode ser negativo');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Aplica filtros em uma receita
   */
  static applyFilters(recipe: Recipe, filters: RecipeFilter): boolean {
    // Filtro por categoria
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      if (!filters.categoryIds.includes(recipe.categoryId)) {
        return false;
      }
    }
    
    // Filtro por dificuldade
    if (filters.difficulty && filters.difficulty.length > 0) {
      if (!filters.difficulty.includes(recipe.difficulty)) {
        return false;
      }
    }
    
    // Filtro por tempo de preparo
    if (filters.maxPrepTime && recipe.prepTime > filters.maxPrepTime) {
      return false;
    }
    
    // Filtro por tempo de cozimento
    if (filters.maxCookTime && recipe.cookTime > filters.maxCookTime) {
      return false;
    }
    
    // Filtro por tempo total
    if (filters.maxTotalTime) {
      const totalTime = recipe.prepTime + recipe.cookTime;
      if (totalTime > filters.maxTotalTime) {
        return false;
      }
    }
    
    // Filtro por avaliação mínima
    if (filters.minRating && recipe.rating < filters.minRating) {
      return false;
    }
    
    // Filtro por tags
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => 
        recipe.tags.includes(tag)
      );
      if (!hasMatchingTag) {
        return false;
      }
    }
    
    // Filtro por número de porções
    if (filters.servings) {
      if (filters.servings.min && recipe.servings < filters.servings.min) {
        return false;
      }
      if (filters.servings.max && recipe.servings > filters.servings.max) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Combina múltiplos filtros
   */
  static combineFilters(...filters: RecipeFilter[]): RecipeFilter {
    return filters.reduce((combined, filter) => ({
      ...combined,
      ...filter,
      categoryIds: [
        ...(combined.categoryIds || []),
        ...(filter.categoryIds || [])
      ],
      difficulty: [
        ...(combined.difficulty || []),
        ...(filter.difficulty || [])
      ],
      tags: [
        ...(combined.tags || []),
        ...(filter.tags || [])
      ]
    }), {});
  }
}