import { CoreRecipeValidator } from '../../../core/validators/controller/CoreRecipeValidator';
import { ValidationResult,  ValidationRule, ValidationContext 
} from '../../../core/validators/interface/IValidator';
import { Recipe } from '../../entities/interface/Recipe';
import { RepositoryManager } from '../../repositories/controller/RepositoryManager';
import { ICategoryRepository } from '../../repositories/interface/ICategoryRepository';

export class BusinessRecipeValidator extends CoreRecipeValidator {
  private categoryRepository: ICategoryRepository;

  constructor() {
    super();
    this.categoryRepository = RepositoryManager.getInstance().getCategoryRepository();
    this.initializeBusinessRules();
  }

  /**
   * 🏪 Validação com regras de negócio
   */
  async validate(recipe: Recipe, context?: ValidationContext): Promise<ValidationResult> {
    // Executa validações básicas primeiro
    const basicValidation = await super.validate(recipe, context);

    // Executa validações de negócio
    const businessValidation = await this.validateBusinessRules(recipe, context);

    // Combina resultados
    return this.combineValidationResults(basicValidation, businessValidation);
  }

  /**
   * 🏪 Validações específicas de negócio
   */
  private async validateBusinessRules(recipe: Recipe, context?: ValidationContext): Promise<ValidationResult> {
    const errors: any[] = [];
    const warnings: any[] = [];
    const info: any[] = [];

    try {
      // Valida se categoria existe
      if (recipe.categoryId) {
        const category = await this.categoryRepository.getById(recipe.categoryId);
        if (!category) {
          errors.push({
            field: 'categoryId',
            rule: 'category_not_found',
            message: 'Categoria selecionada não existe',
            severity: 'error',
            suggestion: 'Selecione uma categoria válida'
          });
        } else if (!category.isActive) {
          warnings.push({
            field: 'categoryId',
            rule: 'category_inactive',
            message: 'Categoria selecionada está inativa',
            severity: 'warning',
            suggestion: 'Considere selecionar uma categoria ativa'
          });
        }
      }

      // Valida ingredientes comuns vs. exóticos
      const exoticIngredients = this.findExoticIngredients(recipe.ingredients || []);
      if (exoticIngredients.length > 0) {
        info.push({
          field: 'ingredients',
          rule: 'exotic_ingredients',
          message: `Ingredientes exóticos encontrados: ${exoticIngredients.join(', ')}`,
          severity: 'info',
          improvement: 'Considere adicionar sugestões de substituição'
        });
      }

      // Valida balanceamento nutricional
      if (recipe.nutritional) {
        const nutritionWarnings = this.validateNutrition(recipe.nutritional);
        warnings.push(...nutritionWarnings);
      }

      // Valida tempo total vs dificuldade
      const totalTime = recipe.prepTime + recipe.cookTime;
      if (recipe.difficulty === 'easy' && totalTime > 60) {
        warnings.push({
          field: 'difficulty',
          rule: 'time_difficulty_mismatch',
          message: 'Receita "Fácil" com tempo longo pode confundir usuários',
          severity: 'warning',
          suggestion: 'Considere ajustar a dificuldade ou revisar os tempos'
        });
      }

      // Valida popularidade de tags
      if (recipe.tags && recipe.tags.length > 0) {
        const tagInfo = await this.analyzeTagPopularity(recipe.tags);
        if (tagInfo.suggestions.length > 0) {
          info.push({
            field: 'tags',
            rule: 'tag_optimization',
            message: 'Tags podem ser otimizadas para melhor descoberta',
            severity: 'info',
            improvement: `Considere adicionar: ${tagInfo.suggestions.join(', ')}`
          });
        }
      }

      // Valida sazonalidade de ingredientes
      const seasonalWarnings = this.checkSeasonality(recipe.ingredients || []);
      warnings.push(...seasonalWarnings);

    } catch (error) {
      errors.push({
        field: 'business_validation',
        rule: 'validation_error',
        message: `Erro na validação de negócio: ${error}`,
        severity: 'error'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      info
    };
  }

  /**
   * 🚀 Inicializa regras de negócio específicas
   */
  private initializeBusinessRules(): void {
    // Regra: Receitas com álcool devem ter aviso
    this.addRule({
      name: 'alcohol_warning',
      message: 'Receitas com álcool devem incluir aviso sobre consumo responsável',
      severity: 'info',
      validate: (recipe) => {
        const hasAlcohol = recipe.ingredients?.some(ing => 
          ing.name.toLowerCase().includes('vinho') ||
          ing.name.toLowerCase().includes('cerveja') ||
          ing.name.toLowerCase().includes('whisky') ||
          ing.name.toLowerCase().includes('rum') ||
          ing.name.toLowerCase().includes('vodka')
        );
        
        if (hasAlcohol) {
          return recipe.description?.includes('consumo responsável') || false;
        }
        return true;
      }
    });

    // Regra: Receitas vegetarianas não devem ter carne
    this.addRule({
      name: 'vegetarian_consistency',
      message: 'Receita marcada como vegetariana contém ingredientes de origem animal',
      severity: 'error',
      validate: (recipe) => {
        const isVegetarian = recipe.tags?.some(tag => 
          tag.toLowerCase().includes('vegetarian') || 
          tag.toLowerCase().includes('veggie')
        );
        
        if (isVegetarian) {
          const meatIngredients = recipe.ingredients?.some(ing => 
            this.isMeatIngredient(ing.name)
          );
          return !meatIngredients;
        }
        return true;
      }
    });

    // Regra: Receitas para crianças devem ser seguras
    this.addRule({
      name: 'child_safety',
      message: 'Receitas para crianças devem evitar ingredientes perigosos',
      severity: 'warning',
      validate: (recipe) => {
        const isForKids = recipe.tags?.some(tag => 
          tag.toLowerCase().includes('criança') || 
          tag.toLowerCase().includes('kids') ||
          tag.toLowerCase().includes('infantil')
        );
        
        if (isForKids) {
          const dangerousIngredients = recipe.ingredients?.some(ing => 
            ing.name.toLowerCase().includes('pimenta') ||
            ing.name.toLowerCase().includes('álcool') ||
            ing.name.toLowerCase().includes('café')
          );
          return !dangerousIngredients;
        }
        return true;
      }
    });

    // Regra: Receitas rápidas devem ter tempo adequado
    this.addRule({
      name: 'quick_recipe_time',
      message: 'Receitas marcadas como "rápidas" devem ter tempo total menor que 30 minutos',
      severity: 'warning',
      validate: (recipe) => {
        const isQuick = recipe.tags?.some(tag => 
          tag.toLowerCase().includes('rápid') || 
          tag.toLowerCase().includes('quick') ||
          tag.toLowerCase().includes('express')
        );
        
        if (isQuick) {
          const totalTime = recipe.prepTime + recipe.cookTime;
          return totalTime <= 30;
        }
        return true;
      }
    });
  }

  /**
   * 🌿 Analisa ingredientes exóticos
   */
  private findExoticIngredients(ingredients: any[]): string[] {
    const commonIngredients = [
      'sal', 'açúcar', 'farinha', 'ovos', 'leite', 'manteiga', 'óleo',
      'cebola', 'alho', 'tomate', 'batata', 'arroz', 'feijão', 'carne',
      'frango', 'peixe', 'queijo', 'iogurte', 'pimenta', 'salsa', 'cebolinha'
    ];

    const exoticIngredients: string[] = [];

    ingredients.forEach(ingredient => {
      const name = ingredient.name.toLowerCase();
      const isCommon = commonIngredients.some(common => 
        name.includes(common) || common.includes(name)
      );
      
      if (!isCommon && name.length > 3) {
        // Lista de ingredientes considerados exóticos
        const exoticKeywords = [
          'trufa', 'caviar', 'foie gras', 'quinoa', 'chia', 'goji',
          'açafrão', 'cardamomo', 'feno grego', 'sumac', 'yuzu'
        ];
        
        const isExotic = exoticKeywords.some(exotic => name.includes(exotic));
        if (isExotic) {
          exoticIngredients.push(ingredient.name);
        }
      }
    });

    return exoticIngredients;
  }

  /**
   * 🥩 Verifica se é ingrediente de carne
   */
  private isMeatIngredient(name: string): boolean {
    const meatKeywords = [
      'carne', 'boi', 'porco', 'frango', 'peixe', 'camarão',
      'bacon', 'presunto', 'salsicha', 'linguiça', 'cordeiro',
      'pato', 'peru', 'salmão', 'atum', 'sardinha'
    ];

    return meatKeywords.some(meat => 
      name.toLowerCase().includes(meat)
    );
  }

  /**
   * 🥗 Valida informações nutricionais
   */
  private validateNutrition(nutrition: any): any[] {
    const warnings: any[] = [];

    // Verifica calorias excessivas
    if (nutrition.calories > 800) {
      warnings.push({
        field: 'nutrition.calories',
        rule: 'high_calories',
        message: 'Alto teor calórico por porção',
        severity: 'warning',
        suggestion: 'Considere informar que é uma receita indulgente'
      });
    }

    // Verifica excesso de sódio
    if (nutrition.sodium > 2300) { // Limite diário recomendado
      warnings.push({
        field: 'nutrition.sodium',
        rule: 'high_sodium',
        message: 'Alto teor de sódio',
        severity: 'warning',
        suggestion: 'Considere reduzir sal ou informar sobre restrições'
      });
    }

    // Verifica balanceamento de macros
    const totalMacros = nutrition.protein + nutrition.carbs + nutrition.fat;
    if (totalMacros > 0) {
      const proteinPercent = (nutrition.protein / totalMacros) * 100;
      const carbPercent = (nutrition.carbs / totalMacros) * 100;
      const fatPercent = (nutrition.fat / totalMacros) * 100;

      if (fatPercent > 60) {
        warnings.push({
          field: 'nutrition.fat',
          rule: 'high_fat_content',
          message: 'Alto teor de gordura',
          severity: 'warning',
          suggestion: 'Considere informar sobre moderação no consumo'
        });
      }
    }

    return warnings;
  }

  /**
   * 🏷️ Analisa popularidade de tags
   */
  private async analyzeTagPopularity(tags: string[]): Promise<{
    popular: string[];
    suggestions: string[];
  }> {
    // Tags populares no RecipeApp
    const popularTags = [
      'fácil', 'rápido', 'vegetariano', 'vegano', 'sem glúten',
      'baixa caloria', 'fitness', 'comfort food', 'caseiro',
      'tradicional', 'gourmet', 'sobremesa', 'café da manhã'
    ];

    const currentPopular = tags.filter(tag => 
      popularTags.some(popular => 
        tag.toLowerCase().includes(popular) || 
        popular.includes(tag.toLowerCase())
      )
    );

    const suggestions: string[] = [];
    
    // Sugere tags baseado no conteúdo da receita
    // Esta lógica seria expandida com análise real do conteúdo
    if (currentPopular.length < 2) {
      suggestions.push('fácil', 'caseiro');
    }

    return {
      popular: currentPopular,
      suggestions: suggestions.slice(0, 3) // Máximo 3 sugestões
    };
  }

  /**
   * 🌱 Verifica sazonalidade de ingredientes
   */
  private checkSeasonality(ingredients: any[]): any[] {
    const warnings: any[] = [];
    const currentMonth = new Date().getMonth() + 1; // 1-12

    const seasonalIngredients = {
      verão: { months: [12, 1, 2], ingredients: ['manga', 'abacaxi', 'melancia'] },
      outono: { months: [3, 4, 5], ingredients: ['caqui', 'maçã', 'pêra'] },
      inverno: { months: [6, 7, 8], ingredients: ['laranja', 'tangerina', 'morango'] },
      primavera: { months: [9, 10, 11], ingredients: ['uva', 'figo', 'ameixa'] }
    };

    ingredients.forEach(ingredient => {
      const name = ingredient.name.toLowerCase();
      
      Object.entries(seasonalIngredients).forEach(([season, data]) => {
        const isIngredientSeasonal = data.ingredients.some(seasonal => 
          name.includes(seasonal)
        );
        
        if (isIngredientSeasonal && !data.months.includes(currentMonth)) {
          warnings.push({
            field: 'ingredients',
            rule: 'seasonal_ingredient',
            message: `${ingredient.name} pode estar fora de temporada`,
            severity: 'warning',
            suggestion: `Melhor época: ${season}`
          });
        }
      });
    });

    return warnings;
  }

  /**
   * 🔄 Combina resultados de validação
   */
  private combineValidationResults(
    basic: ValidationResult, 
    business: ValidationResult
  ): ValidationResult {
    return {
      isValid: basic.isValid && business.isValid,
      errors: [...basic.errors, ...business.errors],
      warnings: [...basic.warnings, ...business.warnings],
      info: [...basic.info, ...business.info],
      score: Math.min(basic.score || 0, business.score || 0)
    };
  }
}