import { useState, useEffect, useCallback, useMemo } from 'react';
import { BusinessRecipeValidator } from '../controller/BusinessRecipeValidator';
import { 
  ValidationResult, 
  ValidationContext 
} from '../../../core/validators/interface/IValidator';
import { debounce } from 'lodash';
import { Recipe } from '../../entities/interface/Recipe';

interface UseRealTimeValidationProps {
  recipe: Partial<Recipe>;
  context?: ValidationContext;
  debounceMs?: number;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface UseRealTimeValidationReturn {
  // Estado de validação
  validation: ValidationResult | null;
  isValidating: boolean;
  isValid: boolean;
  
  // Validações por campo
  fieldValidations: Record<string, ValidationResult>;
  
  // Métodos
  validateField: (fieldName: keyof Recipe, value: any) => ValidationResult;
  validateAll: () => Promise<ValidationResult>;
  clearValidation: () => void;
  
  // Helpers
  getFieldError: (fieldName: string) => string | null;
  getFieldWarning: (fieldName: string) => string | null;
  hasFieldError: (fieldName: string) => boolean;
  hasFieldWarning: (fieldName: string) => boolean;
  
  // Estatísticas
  qualityScore: number;
  completionPercent: number;
}

export const useRealTimeValidation = ({
  recipe,
  context,
  debounceMs = 300,
  validateOnChange = true,
  validateOnBlur = true
}: UseRealTimeValidationProps): UseRealTimeValidationReturn => {
  
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [fieldValidations, setFieldValidations] = useState<Record<string, ValidationResult>>({});
  const [isValidating, setIsValidating] = useState(false);
  
  // Instância do validator
  const validator = useMemo(() => new BusinessRecipeValidator(), []);
  
  /**
   * ⚡ Validação completa com debounce
   */
  const debouncedValidateAll = useCallback(
    debounce(async (recipeData: Partial<Recipe>) => {
      if (!recipeData.title && !recipeData.ingredients && !recipeData.instructions) {
        setValidation(null);
        return;
      }
      
      setIsValidating(true);
      
      try {
        // Cria receita completa com defaults
        const fullRecipe: Recipe = {
          id: recipeData.id || 'temp',
          title: recipeData.title || '',
          description: recipeData.description || '',
          categoryId: recipeData.categoryId || '',
          difficulty: recipeData.difficulty || 'medium',
          prepTime: recipeData.prepTime || 0,
          cookTime: recipeData.cookTime || 0,
          servings: recipeData.servings || 1,
          ingredients: recipeData.ingredients || [],
          instructions: recipeData.instructions || [],
          nutritional: recipeData.nutritional,
          tags: recipeData.tags || [],
          rating: recipeData.rating || 0,
          reviewCount: recipeData.reviewCount || 0,
          imageUrl: recipeData.imageUrl,
          author: recipeData.author,
          createdAt: recipeData.createdAt || new Date().toISOString(),
          updatedAt: recipeData.updatedAt || new Date().toISOString()
        };
        
        const result = await validator.validate(fullRecipe, context);
        setValidation(result);
        
      } catch (error) {
        console.error('Erro na validação em tempo real:', error);
        setValidation({
          isValid: false,
          errors: [{
            field: 'validation',
            rule: 'validation_error',
            message: 'Erro na validação',
            severity: 'error'
          }],
          warnings: [],
          info: []
        });
      } finally {
        setIsValidating(false);
      }
    }, debounceMs),
    [validator, context, debounceMs]
  );
  
  /**
   * 🎯 Validação de campo específico
   */
  const validateField = useCallback((fieldName: keyof Recipe, value: any): ValidationResult => {
    const result = validator.validateField(fieldName, value, context);
    
    setFieldValidations(prev => ({
      ...prev,
      [fieldName as string]: result
    }));
    
    return result;
  }, [validator, context]);
  
  /**
   * ✅ Validação completa manual
   */
  const validateAll = useCallback(async (): Promise<ValidationResult> => {
    await debouncedValidateAll(recipe);
    return validation || { isValid: false, errors: [], warnings: [], info: [] };
  }, [debouncedValidateAll, recipe, validation]);
  
  /**
   * 🧹 Limpa validações
   */
  const clearValidation = useCallback(() => {
    setValidation(null);
    setFieldValidations({});
    setIsValidating(false);
  }, []);
  
  /**
   * 🔍 Helpers para acessar erros/warnings
   */
  const getFieldError = useCallback((fieldName: string): string | null => {
    const fieldValidation = fieldValidations[fieldName];
    if (fieldValidation && fieldValidation.errors.length > 0) {
      return fieldValidation.errors[0].message;
    }
    
    // Busca na validação geral
    if (validation && validation.errors.length > 0) {
      const error = validation.errors.find(e => e.field === fieldName);
      return error ? error.message : null;
    }
    
    return null;
  }, [fieldValidations, validation]);
  
  const getFieldWarning = useCallback((fieldName: string): string | null => {
    const fieldValidation = fieldValidations[fieldName];
    if (fieldValidation && fieldValidation.warnings.length > 0) {
      return fieldValidation.warnings[0].message;
    }
    
    if (validation && validation.warnings.length > 0) {
      const warning = validation.warnings.find(w => w.field === fieldName);
      return warning ? warning.message : null;
    }
    
    return null;
  }, [fieldValidations, validation]);
  
  const hasFieldError = useCallback((fieldName: string): boolean => {
    return getFieldError(fieldName) !== null;
  }, [getFieldError]);
  
  const hasFieldWarning = useCallback((fieldName: string): boolean => {
    return getFieldWarning(fieldName) !== null;
  }, [getFieldWarning]);
  
  // Executa validação quando recipe muda
  useEffect(() => {
    if (validateOnChange && recipe) {
      debouncedValidateAll(recipe);
    }
  }, [recipe, validateOnChange, debouncedValidateAll]);
  
  // Calcula estatísticas
  const qualityScore = useMemo(() => {
    return validation?.score || 0;
  }, [validation]);
  
  const completionPercent = useMemo(() => {
    let completed = 0;
    let total = 5; // Campos básicos: título, ingredientes, instruções, tempo, porções
    
    if (recipe.title && recipe.title.trim().length > 0) completed++;
    if (recipe.ingredients && recipe.ingredients.length > 0) completed++;
    if (recipe.instructions && recipe.instructions.length > 0) completed++;
    if (recipe.prepTime && recipe.prepTime > 0) completed++;
    if (recipe.servings && recipe.servings > 0) completed++;
    
    // Campos opcionais que melhoram a completude
    if (recipe.description && recipe.description.trim().length > 10) {
      completed += 0.5;
      total += 0.5;
    }
    if (recipe.nutritional) {
      completed += 0.5;
      total += 0.5;
    }
    if (recipe.imageUrl) {
      completed += 0.5;
      total += 0.5;
    }
    if (recipe.tags && recipe.tags.length > 0) {
      completed += 0.5;
      total += 0.5;
    }
    
    return Math.round((completed / total) * 100);
  }, [recipe]);
  
  const isValid = useMemo(() => {
    return validation ? validation.isValid : false;
  }, [validation]);
  
  return {
    validation,
    isValidating,
    isValid,
    fieldValidations,
    validateField,
    validateAll,
    clearValidation,
    getFieldError,
    getFieldWarning,
    hasFieldError,
    hasFieldWarning,
    qualityScore,
    completionPercent
  };
};