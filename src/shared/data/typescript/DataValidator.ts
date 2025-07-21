/**
 * ✅ Data Validator
 * 
 * Validates JSON data against TypeScript interfaces and business rules.
 * Ensures data integrity and consistency across the application.
 */

import { Recipe, Ingredient, Instruction, DifficultyLevel, MealType } from '../../types/recipe.types';
import { Category } from '../../types/category.types';
import { ValidationResult } from '../../types/common.types';

/**
 * 📊 Validation Schema Interface
 */
export interface ValidationSchema {
  required: string[];
  optional: string[];
  types: { [key: string]: string };
  rules: { [key: string]: (value: any, data: any) => boolean };
  transforms: { [key: string]: (value: any) => any };
}

/**
 * 🍳 Recipe validation schema
 */
const RECIPE_SCHEMA: ValidationSchema = {
  required: ['id', 'title', 'description', 'ingredients', 'instructions', 'servings', 'timing', 'difficulty', 'categoryId'],
  optional: ['imageUrl', 'images', 'tags', 'cuisine', 'nutrition', 'equipment', 'source', 'stats', 'ratings'],
  types: {
    id: 'string',
    title: 'string',
    description: 'string',
    ingredients: 'array',
    instructions: 'array',
    servings: 'number',
    difficulty: 'number',
    categoryId: 'string',
    timing: 'object',
  },
  rules: {
    title: (value: string) => value.length >= 3 && value.length <= 100,
    description: (value: string) => value.length >= 10 && value.length <= 500,
    servings: (value: number) => value >= 1 && value <= 100,
    difficulty: (value: number) => [1, 2, 3].includes(value),
    ingredients: (value: Ingredient[]) => Array.isArray(value) && value.length >= 1,
    instructions: (value: Instruction[]) => Array.isArray(value) && value.length >= 1,
  },
  transforms: {
    title: (value: string) => value.trim(),
    description: (value: string) => value.trim(),
    servings: (value: any) => parseInt(value, 10),
    difficulty: (value: any) => parseInt(value, 10),
  },
};

/**
 * 📂 Category validation schema
 */
const CATEGORY_SCHEMA: ValidationSchema = {
  required: ['id', 'name', 'slug', 'level', 'isActive', 'sortOrder'],
  optional: ['description', 'imageUrl', 'iconName', 'color', 'parentId', 'tags', 'keywords'],
  types: {
    id: 'string',
    name: 'string',
    slug: 'string',
    level: 'number',
    isActive: 'boolean',
    sortOrder: 'number',
  },
  rules: {
    name: (value: string) => value.length >= 2 && value.length <= 50,
    slug: (value: string) => /^[a-z0-9-]+$/.test(value),
    level: (value: number) => value >= 0 && value <= 3,
    sortOrder: (value: number) => value >= 0,
  },
  transforms: {
    name: (value: string) => value.trim(),
    slug: (value: string) => value.toLowerCase().trim(),
    level: (value: any) => parseInt(value, 10),
    sortOrder: (value: any) => parseInt(value, 10),
  },
};

/**
 * ✅ Validate recipe data
 */
export const validateRecipe = (data: any): ValidationResult => {
  return validateData(data, RECIPE_SCHEMA, 'Recipe');
};

/**
 * ✅ Validate category data
 */
export const validateCategory = (data: any): ValidationResult => {
  return validateData(data, CATEGORY_SCHEMA, 'Category');
};

/**
 * ✅ Generic data validation
 */
export const validateData = (
  data: any,
  schema: ValidationSchema,
  entityName: string = 'Entity'
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: [`${entityName} deve ser um objeto válido`],
    };
  }
  
  // Check required fields
  schema.required.forEach(field => {
    if (!(field in data) || data[field] === undefined || data[field] === null) {
      errors.push(`Campo obrigatório ausente: ${field}`);
    }
  });
  
  // Validate types and rules
  Object.entries(data).forEach(([field, value]) => {
    if (value === undefined || value === null) return;
    
    // Type validation
    if (schema.types[field]) {
      const expectedType = schema.types[field];
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      
      if (actualType !== expectedType) {
        errors.push(`Campo ${field} deve ser do tipo ${expectedType}, recebido ${actualType}`);
        return;
      }
    }
    
    // Rule validation
    if (schema.rules[field]) {
      try {
        if (!schema.rules[field](value, data)) {
          errors.push(`Campo ${field} não atende às regras de validação`);
        }
      } catch (error) {
        errors.push(`Erro na validação do campo ${field}: ${error}`);
      }
    }
  });
  
  // Additional recipe-specific validations
  if (entityName === 'Recipe') {
    const recipeErrors = validateRecipeSpecific(data);
    errors.push(...recipeErrors);
  }
  
  // Additional category-specific validations
  if (entityName === 'Category') {
    const categoryErrors = validateCategorySpecific(data);
    errors.push(...categoryErrors);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * 🍳 Recipe-specific validations
 */
const validateRecipeSpecific = (recipe: any): string[] => {
  const errors: string[] = [];
  
  // Validate ingredients
  if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
    recipe.ingredients.forEach((ingredient: any, index: number) => {
      if (!ingredient.name || typeof ingredient.name !== 'string') {
        errors.push(`Ingrediente ${index + 1}: nome é obrigatório`);
      }
      
      if (!ingredient.amount || typeof ingredient.amount !== 'number' || ingredient.amount <= 0) {
        errors.push(`Ingrediente ${index + 1}: quantidade deve ser um número positivo`);
      }
      
      if (!ingredient.unit || typeof ingredient.unit !== 'string') {
        errors.push(`Ingrediente ${index + 1}: unidade é obrigatória`);
      }
    });
  }
  
  // Validate instructions
  if (recipe.instructions && Array.isArray(recipe.instructions)) {
    recipe.instructions.forEach((instruction: any, index: number) => {
      if (!instruction.description || typeof instruction.description !== 'string') {
        errors.push(`Instrução ${index + 1}: descrição é obrigatória`);
      }
      
      if (instruction.stepNumber !== index + 1) {
        errors.push(`Instrução ${index + 1}: número do passo deve ser sequencial`);
      }
    });
  }
  
  // Validate timing
  if (recipe.timing) {
    if (!recipe.timing.prepTime || recipe.timing.prepTime < 1) {
      errors.push('Tempo de preparo deve ser pelo menos 1 minuto');
    }
    
    if (recipe.timing.cookTime < 0) {
      errors.push('Tempo de cozimento não pode ser negativo');
    }
  }
  
  // Validate meal types
  if (recipe.mealTypes && Array.isArray(recipe.mealTypes)) {
    const validMealTypes = Object.values(MealType);
    recipe.mealTypes.forEach((mealType: any) => {
      if (!validMealTypes.includes(mealType)) {
        errors.push(`Tipo de refeição inválido: ${mealType}`);
      }
    });
  }
  
  return errors;
};

/**
 * 📂 Category-specific validations
 */
const validateCategorySpecific = (category: any): string[] => {
  const errors: string[] = [];
  
  // Validate hierarchy rules
  if (category.parentId && category.level === 0) {
    errors.push('Categoria raiz não pode ter categoria pai');
  }
  
  if (!category.parentId && category.level > 0) {
    errors.push('Subcategoria deve ter categoria pai');
  }
  
  // Validate slug format
  if (category.slug) {
    if (!/^[a-z0-9-]+$/.test(category.slug)) {
      errors.push('Slug deve conter apenas letras minúsculas, números e hífens');
    }
    
    if (category.slug.startsWith('-') || category.slug.endsWith('-')) {
      errors.push('Slug não pode começar ou terminar com hífen');
    }
  }
  
  // Validate color format
  if (category.color && !/^#[0-9A-Fa-f]{6}$/.test(category.color)) {
    errors.push('Cor deve estar no formato hexadecimal (#RRGGBB)');
  }
  
  return errors;
};

/**
 * 🔄 Transform data according to schema
 */
export const transformData = (data: any, schema: ValidationSchema): any => {
  if (!data || typeof data !== 'object') return data;
  
  const transformed = { ...data };
  
  Object.entries(schema.transforms).forEach(([field, transform]) => {
    if (field in transformed && transformed[field] !== undefined && transformed[field] !== null) {
      try {
        transformed[field] = transform(transformed[field]);
      } catch (error) {
        console.warn(`Error transforming field ${field}:`, error);
      }
    }
  });
  
  return transformed;
};

/**
 * 🧹 Sanitize data
 */
export const sanitizeData = (data: any): any => {
  if (!data || typeof data !== 'object') return data;
  
  const sanitized = { ...data };
  
  // Remove potentially dangerous fields
  const dangerousFields = ['__proto__', 'constructor', 'prototype'];
  dangerousFields.forEach(field => {
    delete sanitized[field];
  });
  
  // Sanitize string fields
  Object.entries(sanitized).forEach(([key, value]) => {
    if (typeof value === 'string') {
      // Remove potential XSS
      sanitized[key] = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'object' ? sanitizeData(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    }
  });
  
  return sanitized;
};

/**
 * ✅ Batch validate multiple items
 */
export const batchValidate = <T>(
  items: T[],
  validator: (item: T) => ValidationResult
): {
  valid: T[];
  invalid: { item: T; errors: string[] }[];
  totalValid: number;
  totalInvalid: number;
} => {
  const valid: T[] = [];
  const invalid: { item: T; errors: string[] }[] = [];
  
  items.forEach(item => {
    const result = validator(item);
    if (result.isValid) {
      valid.push(item);
    } else {
      invalid.push({ item, errors: result.errors });
    }
  });
  
  return {
    valid,
    invalid,
    totalValid: valid.length,
    totalInvalid: invalid.length,
  };
};

/**
 * 🎯 Create custom validator
 */
export const createValidator = (schema: ValidationSchema) => {
  return (data: any): ValidationResult => {
    return validateData(data, schema);
  };
};

/**
 * 📋 Data validator object
 */
export const DataValidator = {
  validateRecipe,
  validateCategory,
  validateData,
  transformData,
  sanitizeData,
  batchValidate,
  createValidator,
  schemas: {
    RECIPE_SCHEMA,
    CATEGORY_SCHEMA,
  },
};

export default DataValidator;