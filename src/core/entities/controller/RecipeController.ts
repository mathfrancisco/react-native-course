import { ValidationResult } from "../interface/Common";
import { DifficultyLevel, Recipe } from "../interface/Recipe";


export class RecipeController {
  /**
   * Valida se uma receita está completa e válida
   */
  static validateRecipe(recipe: Recipe): ValidationResult {
    const errors: string[] = [];
    
    // Validações básicas
    if (!recipe.id || recipe.id.trim() === '') {
      errors.push('ID da receita é obrigatório');
    }
    
    if (!recipe.title || recipe.title.trim() === '') {
      errors.push('Título da receita é obrigatório');
    }
    
    if (!recipe.categoryId || recipe.categoryId.trim() === '') {
      errors.push('Categoria da receita é obrigatória');
    }
    
    // Validação de ingredientes
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      errors.push('Receita deve ter pelo menos um ingrediente');
    } else {
      recipe.ingredients.forEach((ingredient, index) => {
        if (!ingredient.name || ingredient.name.trim() === '') {
          errors.push(`Ingrediente ${index + 1}: nome é obrigatório`);
        }
        if (!ingredient.amount || ingredient.amount <= 0) {
          errors.push(`Ingrediente ${index + 1}: quantidade deve ser positiva`);
        }
      });
    }
    
    // Validação de instruções
    if (!recipe.instructions || recipe.instructions.length === 0) {
      errors.push('Receita deve ter pelo menos uma instrução');
    }
    
    // Validação de tempos
    if (recipe.prepTime < 0) {
      errors.push('Tempo de preparo não pode ser negativo');
    }
    
    if (recipe.cookTime < 0) {
      errors.push('Tempo de cozimento não pode ser negativo');
    }
    
    // Validação de porções
    if (recipe.servings <= 0) {
      errors.push('Número de porções deve ser positivo');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Calcula o tempo total de preparo
   */
  static calculateTotalTime(recipe: Recipe): number {
    return recipe.prepTime + recipe.cookTime;
  }
  
  /**
   * Verifica se a receita está completa
   */
  static isComplete(recipe: Recipe): boolean {
    return this.validateRecipe(recipe).isValid;
  }
  
  /**
   * Calcula a dificuldade baseada em critérios
   */
  static calculateDifficulty(recipe: Recipe): DifficultyLevel {
    let score = 0;
    
    // Baseado no número de ingredientes
    if (recipe.ingredients.length > 10) score += 2;
    else if (recipe.ingredients.length > 5) score += 1;
    
    // Baseado no tempo total
    const totalTime = this.calculateTotalTime(recipe);
    if (totalTime > 120) score += 2;
    else if (totalTime > 60) score += 1;
    
    // Baseado no número de passos
    if (recipe.instructions.length > 10) score += 2;
    else if (recipe.instructions.length > 5) score += 1;
    
    if (score >= 4) return 'hard';
    if (score >= 2) return 'medium';
    return 'easy';
  }
  
  /**
   * Verifica se a receita atende aos filtros
   */
  static matchesFilters(recipe: Recipe, filters: any): boolean {
    // Implementação dos filtros será feita na camada business
    return true;
  }
  
  /**
   * Calcula informações nutricionais por porção
   */
  static getNutritionPerServing(recipe: Recipe) {
    if (!recipe.nutritional) return null;
    
    return {
      calories: Math.round(recipe.nutritional.calories / recipe.servings),
      protein: Math.round(recipe.nutritional.protein / recipe.servings),
      carbs: Math.round(recipe.nutritional.carbs / recipe.servings),
      fat: Math.round(recipe.nutritional.fat / recipe.servings),
    };
  }
}