import { Category } from '../../../core/entities/interface/Category';
import { ValidationResult } from '../../../core/entities/interface/Common';
import { Recipe } from '../../../core/entities/interface/Recipe';
import { validateRecipe, validateCategory } from '../../../shared/data/typescript/DataValidator';
import { ValidationUtils } from '../../../shared/utils/validationUtils';

export class ValidationBridge {
  private static instance: ValidationBridge;
  
  private constructor() {}
  
  static getInstance(): ValidationBridge {
    if (!ValidationBridge.instance) {
      ValidationBridge.instance = new ValidationBridge();
    }
    return ValidationBridge.instance;
  }
  
  /**
   * ✅ Valida receita usando validator existente
   */
  validateRecipe(recipe: Recipe): ValidationResult {
    try {
      // Usa o validator existente
      const sharedValidation = validateRecipe(recipe);
      
      // Adapta resultado para formato Core
      return {
        isValid: sharedValidation.isValid,
        errors: sharedValidation.errors || [],
        warnings: sharedValidation.warnings || []
      };
      
    } catch (error) {
      console.error('❌ Erro na validação de receita:', error);
      return {
        isValid: false,
        errors: [`Erro na validação: ${error}`]
      };
    }
  }
  
  /**
   * ✅ Valida categoria usando validator existente
   */
  validateCategory(category: Category): ValidationResult {
    try {
      const sharedValidation = validateCategory(category);
      
      return {
        isValid: sharedValidation.isValid,
        errors: sharedValidation.errors || [],
        warnings: sharedValidation.warnings || []
      };
      
    } catch (error) {
      console.error('❌ Erro na validação de categoria:', error);
      return {
        isValid: false,
        errors: [`Erro na validação: ${error}`]
      };
    }
  }
  
  /**
   * 📝 Valida campos específicos usando ValidationUtils
   */
  validateRecipeTitle(title: string): ValidationResult {
    try {
      const result = ValidationUtils.validateRecipeTitle(title);
      return {
        isValid: result.isValid,
        errors: result.errors
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Erro na validação do título: ${error}`]
      };
    }
  }
  
  validateIngredient(ingredient: any): ValidationResult {
    try {
      const result = ValidationUtils.validateIngredient(ingredient);
      return {
        isValid: result.isValid,
        errors: result.errors
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Erro na validação do ingrediente: ${error}`]
      };
    }
  }
  
  validateCookingTime(time: number): ValidationResult {
    try {
      const result = ValidationUtils.validateCookingTime(time);
      return {
        isValid: result.isValid,
        errors: result.errors
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Erro na validação do tempo: ${error}`]
      };
    }
  }
  
  /**
   * 📋 Valida lotes de dados
   */
  validateRecipeBatch(recipes: Recipe[]): {
    valid: Recipe[];
    invalid: { recipe: Recipe; errors: string[] }[];
    totalValid: number;
    totalInvalid: number;
  } {
    const valid: Recipe[] = [];
    const invalid: { recipe: Recipe; errors: string[] }[] = [];
    
    recipes.forEach(recipe => {
      const validation = this.validateRecipe(recipe);
      
      if (validation.isValid) {
        valid.push(recipe);
      } else {
        invalid.push({
          recipe,
          errors: validation.errors
        });
      }
    });
    
    return {
      valid,
      invalid,
      totalValid: valid.length,
      totalInvalid: invalid.length
    };
  }
  
  /**
   * 🔍 Verifica integridade dos dados
   */
  checkDataIntegrity(recipes: Recipe[], categories: Category[]): {
    missingCategories: string[];
    orphanedRecipes: Recipe[];
    duplicateIds: string[];
    validationErrors: string[];
  } {
    const categoryIds = new Set(categories.map(c => c.id));
    const recipeIds = new Set<string>();
    const duplicateIds: string[] = [];
    const missingCategories: string[] = [];
    const orphanedRecipes: Recipe[] = [];
    const validationErrors: string[] = [];
    
    // Verifica IDs duplicados
    recipes.forEach(recipe => {
      if (recipeIds.has(recipe.id)) {
        duplicateIds.push(recipe.id);
      } else {
        recipeIds.add(recipe.id);
      }
      
      // Verifica se categoria existe
      if (!categoryIds.has(recipe.categoryId)) {
        missingCategories.push(recipe.categoryId);
        orphanedRecipes.push(recipe);
      }
    });
    
    // Valida estrutura básica
    recipes.forEach(recipe => {
      const validation = this.validateRecipe(recipe);
      if (!validation.isValid) {
        validationErrors.push(`${recipe.id}: ${validation.errors.join(', ')}`);
      }
    });
    
    return {
      missingCategories: [...new Set(missingCategories)],
      orphanedRecipes,
      duplicateIds: [...new Set(duplicateIds)],
      validationErrors
    };
  }
}