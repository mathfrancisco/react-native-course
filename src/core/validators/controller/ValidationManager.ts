import { CoreRecipeValidator } from '../../../core/validators/controller/CoreRecipeValidator';
import { BusinessRecipeValidator } from './BusinessRecipeValidator';
import { 
  ValidationResult, 
  ValidationContext 
} from '../../../core/validators/interface/IValidator';
import { Recipe } from '../../entities/interface/Recipe';


export interface ValidationProfile {
  name: string;
  description: string;
  strictMode: boolean;
  enableBusinessRules: boolean;
  enableRealTimeValidation: boolean;
  customRules?: any[];
}

export class ValidationManager {
  private static instance: ValidationManager;
  private coreValidator: CoreRecipeValidator;
  private businessValidator: BusinessRecipeValidator;
  private currentProfile: ValidationProfile;
  
  private constructor() {
    this.coreValidator = new CoreRecipeValidator();
    this.businessValidator = new BusinessRecipeValidator();
    this.currentProfile = this.getDefaultProfile();
  }
  
  static getInstance(): ValidationManager {
    if (!ValidationManager.instance) {
      ValidationManager.instance = new ValidationManager();
    }
    return ValidationManager.instance;
  }
  
  /**
   * ✅ Validação principal com perfil aplicado
   */
  async validateRecipe(
    recipe: Recipe, 
    context?: ValidationContext
  ): Promise<ValidationResult> {
    const ctx: ValidationContext = {
      language: 'pt-BR',
      strictMode: this.currentProfile.strictMode,
      skipOptional: !this.currentProfile.strictMode,
      ...context
    };
    
    try {
      if (this.currentProfile.enableBusinessRules) {
        // Validação completa com regras de negócio
        return await this.businessValidator.validate(recipe, ctx);
      } else {
        // Apenas validações básicas
        return await this.coreValidator.validate(recipe, ctx);
      }
    } catch (error) {
      console.error('Erro no ValidationManager:', error);
      return {
        isValid: false,
        errors: [{
          field: 'validation',
          rule: 'system_error',
          message: 'Erro interno na validação',
          severity: 'error'
        }],
        warnings: [],
        info: []
      };
    }
  }
  
  /**
   * ⚡ Validação rápida (síncrona)
   */
  validateRecipeSync(
    recipe: Recipe, 
    context?: ValidationContext
  ): ValidationResult {
    const ctx: ValidationContext = {
      language: 'pt-BR',
      strictMode: this.currentProfile.strictMode,
      skipOptional: !this.currentProfile.strictMode,
      ...context
    };
    
    if (this.currentProfile.enableBusinessRules) {
      return this.businessValidator.validateSync(recipe, ctx);
    } else {
      return this.coreValidator.validateSync(recipe, ctx);
    }
  }
  
  /**
   * 🎯 Validação de campo específico
   */
  validateField(
    fieldName: keyof Recipe, 
    value: any, 
    context?: ValidationContext
  ): ValidationResult {
    if (this.currentProfile.enableBusinessRules) {
      return this.businessValidator.validateField(fieldName, value, context);
    } else {
      return this.coreValidator.validateField(fieldName, value, context);
    }
  }
  
  /**
   * 📊 Validação em lote
   */
  async validateBatch(
    recipes: Recipe[], 
    context?: ValidationContext
  ): Promise<{
    results: ValidationResult[];
    summary: {
      total: number;
      valid: number;
      invalid: number;
      averageScore: number;
    };
  }> {
    const results: ValidationResult[] = [];
    
    for (const recipe of recipes) {
      const result = await this.validateRecipe(recipe, context);
      results.push(result);
    }
    
    const valid = results.filter(r => r.isValid).length;
    const invalid = results.length - valid;
    const averageScore = results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length;
    
    return {
      results,
      summary: {
        total: results.length,
        valid,
        invalid,
        averageScore: Math.round(averageScore)
      }
    };
  }
  
  /**
   * 🔧 Gerenciamento de perfis
   */
  setValidationProfile(profile: ValidationProfile): void {
    this.currentProfile = profile;
    
    // Aplica configurações aos validators
    this.coreValidator.setStrictMode(profile.strictMode);
    this.businessValidator.setStrictMode(profile.strictMode);
    
    console.log(`✅ Perfil de validação aplicado: ${profile.name}`);
  }
  
  getCurrentProfile(): ValidationProfile {
    return this.currentProfile;
  }
  
  getAvailableProfiles(): ValidationProfile[] {
    return [
      this.getDefaultProfile(),
      this.getStrictProfile(),
      this.getRelaxedProfile(),
      this.getPublishingProfile()
    ];
  }
  
  /**
   * 📋 Perfis pré-definidos
   */
  private getDefaultProfile(): ValidationProfile {
    return {
      name: 'Padrão',
      description: 'Validação equilibrada para uso geral',
      strictMode: false,
      enableBusinessRules: true,
      enableRealTimeValidation: true
    };
  }
  
  private getStrictProfile(): ValidationProfile {
    return {
      name: 'Rigoroso',
      description: 'Validação rigorosa para receitas profissionais',
      strictMode: true,
      enableBusinessRules: true,
      enableRealTimeValidation: true
    };
  }
  
  private getRelaxedProfile(): ValidationProfile {
    return {
      name: 'Relaxado',
      description: 'Validação básica para rascunhos',
      strictMode: false,
      enableBusinessRules: false,
      enableRealTimeValidation: false
    };
  }
  
  private getPublishingProfile(): ValidationProfile {
    return {
      name: 'Publicação',
      description: 'Validação completa antes de publicar',
      strictMode: true,
      enableBusinessRules: true,
      enableRealTimeValidation: true
    };
  }
  
  /**
   * 📊 Estatísticas de validação
   */
  getValidationStats(): {
    profilesAvailable: number;
    currentProfile: string;
    rulesActive: number;
    lastValidation: Date | null;
  } {
    return {
      profilesAvailable: this.getAvailableProfiles().length,
      currentProfile: this.currentProfile.name,
      rulesActive: 0, // Implementar contador de regras ativas
      lastValidation: new Date()
    };
  }
}