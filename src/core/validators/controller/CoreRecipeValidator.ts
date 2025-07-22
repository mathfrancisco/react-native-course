import { Ingredient } from '../../entities/interface/Ingredient';
import { Instruction } from '../../entities/interface/Instruction';
import { Recipe } from '../../entities/interface/Recipe';
import { 
  IValidator, 
  ValidationResult, 
  ValidationRule, 
  ValidationContext,
  ValidationError,
  ValidationWarning,
  ValidationInfo
} from '../interface/IValidator';


export class CoreRecipeValidator implements IValidator<Recipe> {
  private rules: ValidationRule<Recipe>[] = [];
  private context: ValidationContext = {
    language: 'pt-BR',
    strictMode: false,
    skipOptional: false
  };

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * ✅ Validação principal (async)
   */
  async validate(recipe: Recipe, context?: ValidationContext): Promise<ValidationResult> {
    const ctx = { ...this.context, ...context };
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const info: ValidationInfo[] = [];

    console.log(`🔍 Validando receita: ${recipe.title || 'Sem título'}`);

    // Executa todas as regras
    for (const rule of this.rules) {
      try {
        let isValid: boolean;
        
        if (rule.async) {
          isValid = await rule.validate(recipe, ctx);
        } else {
          isValid = rule.validate(recipe, ctx) as boolean;
        }

        if (!isValid) {
          const issue = {
            field: 'recipe',
            rule: rule.name,
            message: rule.message,
            severity: rule.severity
          };

          switch (rule.severity) {
            case 'error':
              errors.push(issue as ValidationError);
              break;
            case 'warning':
              warnings.push(issue as ValidationWarning);
              break;
            case 'info':
              info.push(issue as ValidationInfo);
              break;
          }
        }
      } catch (error) {
        errors.push({
          field: 'recipe',
          rule: rule.name,
          message: `Erro na validação: ${error}`,
          severity: 'error'
        });
      }
    }

    // Calcula score de qualidade
    const score = this.calculateQualityScore(recipe, errors, warnings, info);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      info,
      score
    };
  }

  /**
   * ⚡ Validação síncrona (rápida)
   */
  validateSync(recipe: Recipe, context?: ValidationContext): ValidationResult {
    const ctx = { ...this.context, ...context };
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const info: ValidationInfo[] = [];

    // Executa apenas regras síncronas
    const syncRules = this.rules.filter(rule => !rule.async);

    for (const rule of syncRules) {
      try {
        const isValid = rule.validate(recipe, ctx) as boolean;

        if (!isValid) {
          const issue = {
            field: 'recipe',
            rule: rule.name,
            message: rule.message,
            severity: rule.severity
          };

          switch (rule.severity) {
            case 'error':
              errors.push(issue as ValidationError);
              break;
            case 'warning':
              warnings.push(issue as ValidationWarning);
              break;
            case 'info':
              info.push(issue as ValidationInfo);
              break;
          }
        }
      } catch (error) {
        errors.push({
          field: 'recipe',
          rule: rule.name,
          message: `Erro na validação: ${error}`,
          severity: 'error'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      info,
      score: this.calculateQualityScore(recipe, errors, warnings, info)
    };
  }

  /**
   * 🎯 Validação de campo específico
   */
  validateField(fieldName: keyof Recipe, value: any, context?: ValidationContext): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    switch (fieldName) {
      case 'title':
        return this.validateTitle(value);
      case 'ingredients':
        return this.validateIngredients(value);
      case 'instructions':
        return this.validateInstructions(value);
      case 'prepTime':
      case 'cookTime':
        return this.validateTime(fieldName, value);
      case 'servings':
        return this.validateServings(value);
      default:
        return { isValid: true, errors: [], warnings: [], info: [] };
    }
  }

  /**
   * 🔧 Gerenciamento de regras
   */
  addRule(rule: ValidationRule<Recipe>): void {
    // Remove regra existente com mesmo nome
    this.removeRule(rule.name);
    this.rules.push(rule);
  }

  removeRule(ruleName: string): void {
    this.rules = this.rules.filter(rule => rule.name !== ruleName);
  }

  setStrictMode(strict: boolean): void {
    this.context.strictMode = strict;
  }

  setContext(context: ValidationContext): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * 🚀 Inicializa regras padrão
   */
  private initializeDefaultRules(): void {
    // Regra: Título obrigatório
    this.addRule({
      name: 'title_required',
      message: 'Título da receita é obrigatório',
      severity: 'error',
      validate: (recipe) => {
        return !!(recipe.title && recipe.title.trim().length > 0);
      }
    });

    // Regra: Título com tamanho adequado
    this.addRule({
      name: 'title_length',
      message: 'Título deve ter entre 3 e 100 caracteres',
      severity: 'error',
      validate: (recipe) => {
        if (!recipe.title) return false;
        return recipe.title.trim().length >= 3 && recipe.title.trim().length <= 100;
      }
    });

    // Regra: Ingredientes obrigatórios
    this.addRule({
      name: 'ingredients_required',
      message: 'Receita deve ter pelo menos um ingrediente',
      severity: 'error',
      validate: (recipe) => {
        return recipe.ingredients && recipe.ingredients.length > 0;
      }
    });

    // Regra: Instruções obrigatórias
    this.addRule({
      name: 'instructions_required',
      message: 'Receita deve ter pelo menos uma instrução',
      severity: 'error',
      validate: (recipe) => {
        return recipe.instructions && recipe.instructions.length > 0;
      }
    });

    // Regra: Tempos válidos
    this.addRule({
      name: 'valid_times',
      message: 'Tempos de preparo e cozimento devem ser positivos',
      severity: 'error',
      validate: (recipe) => {
        return recipe.prepTime >= 0 && recipe.cookTime >= 0;
      }
    });

    // Regra: Porções válidas
    this.addRule({
      name: 'valid_servings',
      message: 'Número de porções deve ser positivo',
      severity: 'error',
      validate: (recipe) => {
        return recipe.servings > 0;
      }
    });

    // Warning: Receita muito simples
    this.addRule({
      name: 'recipe_complexity',
      message: 'Receita parece muito simples. Considere adicionar mais detalhes.',
      severity: 'warning',
      validate: (recipe) => {
        const complexity = (recipe.ingredients?.length || 0) + (recipe.instructions?.length || 0);
        return complexity >= 4; // Pelo menos 2 ingredientes + 2 instruções
      }
    });

    // Info: Qualidade da descrição
    this.addRule({
      name: 'description_quality',
      message: 'Adicionar uma descrição atrativa melhora o engajamento',
      severity: 'info',
      validate: (recipe) => {
        if (!recipe.description) return false;
        return recipe.description.trim().length >= 20;
      }
    });

    // Warning: Tempo total muito longo
    this.addRule({
      name: 'total_time_warning',
      message: 'Receita com tempo total muito longo pode desencorajar usuários',
      severity: 'warning',
      validate: (recipe) => {
        const totalTime = recipe.prepTime + recipe.cookTime;
        return totalTime <= 180; // 3 horas
      }
    });

    // Info: Informações nutricionais
    this.addRule({
      name: 'nutrition_info',
      message: 'Adicionar informações nutricionais aumenta o valor da receita',
      severity: 'info',
      validate: (recipe) => {
        return !!(recipe.nutritional && recipe.nutritional.calories > 0);
      }
    });
  }

  /**
   * 📝 Validações específicas por campo
   */
  private validateTitle(title: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const info: ValidationInfo[] = [];

    if (!title || title.trim().length === 0) {
      errors.push({
        field: 'title',
        rule: 'required',
        message: 'Título é obrigatório',
        severity: 'error',
        suggestion: 'Digite um título atrativo para sua receita'
      });
    } else {
      const trimmed = title.trim();
      
      if (trimmed.length < 3) {
        errors.push({
          field: 'title',
          rule: 'min_length',
          message: 'Título muito curto',
          severity: 'error',
          suggestion: 'Use pelo menos 3 caracteres'
        });
      }
      
      if (trimmed.length > 100) {
        errors.push({
          field: 'title',
          rule: 'max_length',
          message: 'Título muito longo',
          severity: 'error',
          suggestion: 'Use no máximo 100 caracteres'
        });
      }

      // Verifica se tem palavras-chave atrativas
      const attractiveWords = ['delicioso', 'cremoso', 'crocante', 'caseiro', 'tradicional', 'especial'];
      const hasAttractiveWords = attractiveWords.some(word => 
        trimmed.toLowerCase().includes(word)
      );

      if (!hasAttractiveWords && trimmed.length > 10) {
        info.push({
          field: 'title',
          rule: 'attractiveness',
          message: 'Título pode ser mais atrativo',
          severity: 'info',
          improvement: 'Considere adicionar palavras como "delicioso", "caseiro", "especial"'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      info
    };
  }

  private validateIngredients(ingredients: Ingredient[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const info: ValidationInfo[] = [];

    if (!ingredients || ingredients.length === 0) {
      errors.push({
        field: 'ingredients',
        rule: 'required',
        message: 'Pelo menos um ingrediente é obrigatório',
        severity: 'error',
        suggestion: 'Adicione os ingredientes necessários'
      });
    } else {
      // Valida cada ingrediente
      ingredients.forEach((ingredient, index) => {
        if (!ingredient.name || ingredient.name.trim().length === 0) {
          errors.push({
            field: `ingredients[${index}].name`,
            rule: 'ingredient_name_required',
            message: `Nome do ingrediente ${index + 1} é obrigatório`,
            severity: 'error'
          });
        }

        if (!ingredient.amount || ingredient.amount <= 0) {
          errors.push({
            field: `ingredients[${index}].amount`,
            rule: 'ingredient_amount_invalid',
            message: `Quantidade do ingrediente ${index + 1} deve ser positiva`,
            severity: 'error'
          });
        }

        if (!ingredient.unit || ingredient.unit.trim().length === 0) {
          warnings.push({
            field: `ingredients[${index}].unit`,
            rule: 'ingredient_unit_missing',
            message: `Unidade de medida do ingrediente ${index + 1} não especificada`,
            severity: 'warning',
            suggestion: 'Especifique a unidade (g, ml, xícara, etc.)'
          });
        }
      });

      // Info sobre quantidade de ingredientes
      if (ingredients.length === 1) {
        info.push({
          field: 'ingredients',
          rule: 'ingredient_count',
          message: 'Receita com apenas 1 ingrediente',
          severity: 'info',
          improvement: 'Considere adicionar temperos ou acompanhamentos'
        });
      } else if (ingredients.length > 15) {
        warnings.push({
          field: 'ingredients',
          rule: 'too_many_ingredients',
          message: 'Muitos ingredientes podem tornar a receita complexa',
          severity: 'warning',
          suggestion: 'Considere simplificar ou dividir em subgrupos'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      info
    };
  }

  private validateInstructions(instructions: Instruction[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const info: ValidationInfo[] = [];

    if (!instructions || instructions.length === 0) {
      errors.push({
        field: 'instructions',
        rule: 'required',
        message: 'Pelo menos uma instrução é obrigatória',
        severity: 'error',
        suggestion: 'Adicione o modo de preparo'
      });
    } else {
      // Valida cada instrução
      instructions.forEach((instruction, index) => {
        if (!instruction.description || instruction.description.trim().length === 0) {
          errors.push({
            field: `instructions[${index}].description`,
            rule: 'instruction_description_required',
            message: `Descrição do passo ${index + 1} é obrigatória`,
            severity: 'error'
          });
        } else {
          const description = instruction.description.trim();
          
          if (description.length < 10) {
            warnings.push({
              field: `instructions[${index}].description`,
              rule: 'instruction_too_short',
              message: `Passo ${index + 1} muito breve`,
              severity: 'warning',
              suggestion: 'Adicione mais detalhes para facilitar o entendimento'
            });
          }

          // Verifica se tem verbos de ação
          const actionVerbs = ['misture', 'adicione', 'cozinhe', 'asse', 'tempere', 'corte', 'pique'];
          const hasActionVerb = actionVerbs.some(verb => 
            description.toLowerCase().includes(verb)
          );

          if (!hasActionVerb && description.length > 10) {
            info.push({
              field: `instructions[${index}].description`,
              rule: 'action_clarity',
              message: `Passo ${index + 1} pode ser mais claro`,
              severity: 'info',
              improvement: 'Use verbos de ação como "misture", "adicione", "cozinhe"'
            });
          }
        }
      });

      // Verifica ordem dos passos
      const steps = instructions.map(inst => inst.step).sort((a, b) => a - b);
      for (let i = 0; i < steps.length; i++) {
        if (steps[i] !== i + 1) {
          warnings.push({
            field: 'instructions',
            rule: 'step_order',
            message: 'Numeração dos passos não está sequencial',
            severity: 'warning',
            suggestion: 'Verifique a ordem dos passos'
          });
          break;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      info
    };
  }

  private validateTime(field: 'prepTime' | 'cookTime', time: number): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (time < 0) {
      errors.push({
        field,
        rule: 'negative_time',
        message: 'Tempo não pode ser negativo',
        severity: 'error',
        suggestion: 'Digite um tempo válido em minutos'
      });
    } else if (time === 0) {
      warnings.push({
        field,
        rule: 'zero_time',
        message: `${field === 'prepTime' ? 'Tempo de preparo' : 'Tempo de cozimento'} zero`,
        severity: 'warning',
        suggestion: 'Confirme se realmente não há tempo necessário'
      });
    } else if (time > 480) { // 8 horas
      warnings.push({
        field,
        rule: 'excessive_time',
        message: 'Tempo muito longo',
        severity: 'warning',
        suggestion: 'Verifique se o tempo está correto'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      info: []
    };
  }

  private validateServings(servings: number): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (servings <= 0) {
      errors.push({
        field: 'servings',
        rule: 'invalid_servings',
        message: 'Número de porções deve ser positivo',
        severity: 'error',
        suggestion: 'Digite quantas pessoas a receita serve'
      });
    } else if (servings > 50) {
      warnings.push({
        field: 'servings',
        rule: 'excessive_servings',
        message: 'Número de porções muito alto',
        severity: 'warning',
        suggestion: 'Verifique se está correto'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      info: []
    };
  }

  /**
   * 📊 Calcula score de qualidade (0-100)
   */
  private calculateQualityScore(
    recipe: Recipe, 
    errors: ValidationError[], 
    warnings: ValidationWarning[], 
    info: ValidationInfo[]
  ): number {
    let score = 100;

    // Penaliza erros severamente
    score -= errors.length * 20;

    // Penaliza warnings moderadamente
    score -= warnings.length * 5;

    // Bonifica por completude
    if (recipe.description && recipe.description.length > 50) score += 5;
    if (recipe.nutritional) score += 5;
    if (recipe.imageUrl) score += 5;
    if (recipe.tags && recipe.tags.length > 0) score += 3;

    // Bonifica por complexidade adequada
    const ingredientCount = recipe.ingredients?.length || 0;
    const instructionCount = recipe.instructions?.length || 0;
    
    if (ingredientCount >= 3 && ingredientCount <= 12) score += 3;
    if (instructionCount >= 3 && instructionCount <= 10) score += 3;

    // Garante que o score esteja entre 0 e 100
    return Math.max(0, Math.min(100, score));
  }
}