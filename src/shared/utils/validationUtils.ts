/**
 * ✅ Validation Utilities
 * 
 * Utility functions for data validation, form validation, and input sanitization.
 * Covers common validation patterns for recipes, users, and app data.
 */

import { REGEX_PATTERNS, LIMITS } from '../constants/appConstants';

/**
 * 📋 Validation Result Interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * 📧 Validate email address
 */
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email || typeof email !== 'string') {
    errors.push('Email é obrigatório');
    return { isValid: false, errors };
  }
  
  const trimmedEmail = email.trim();
  
  if (trimmedEmail.length === 0) {
    errors.push('Email não pode estar vazio');
  }
  
  if (!REGEX_PATTERNS.EMAIL.test(trimmedEmail)) {
    errors.push('Email deve ter um formato válido');
  }
  
  if (trimmedEmail.length > 254) {
    errors.push('Email muito longo');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 📱 Validate phone number
 */
export const validatePhone = (phone: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!phone || typeof phone !== 'string') {
    errors.push('Telefone é obrigatório');
    return { isValid: false, errors };
  }
  
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length < 10) {
    errors.push('Telefone deve ter pelo menos 10 dígitos');
  }
  
  if (cleanPhone.length > 15) {
    errors.push('Telefone deve ter no máximo 15 dígitos');
  }
  
  // Brazilian phone validation
  if (cleanPhone.length === 11 && !cleanPhone.startsWith('1')) {
    if (parseInt(cleanPhone.charAt(2)) < 6) {
      errors.push('Número de celular inválido');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 🔒 Validate password
 */
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Senha é obrigatória');
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres');
  }
  
  if (password.length > 128) {
    errors.push('Senha muito longa');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    warnings.push('Senha seria mais segura com caracteres especiais');
  }
  
  // Check for common patterns
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /abc123/i,
  ];
  
  if (commonPatterns.some(pattern => pattern.test(password))) {
    warnings.push('Evite padrões comuns na senha');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * 👤 Validate user name
 */
export const validateName = (name: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!name || typeof name !== 'string') {
    errors.push('Nome é obrigatório');
    return { isValid: false, errors };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < LIMITS.USER.NAME_MIN_LENGTH) {
    errors.push(`Nome deve ter pelo menos ${LIMITS.USER.NAME_MIN_LENGTH} caracteres`);
  }
  
  if (trimmedName.length > LIMITS.USER.NAME_MAX_LENGTH) {
    errors.push(`Nome deve ter no máximo ${LIMITS.USER.NAME_MAX_LENGTH} caracteres`);
  }
  
  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(trimmedName)) {
    errors.push('Nome deve conter apenas letras, espaços, hífens e apostrofes');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 🍳 Validate recipe title
 */
export const validateRecipeTitle = (title: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!title || typeof title !== 'string') {
    errors.push('Título da receita é obrigatório');
    return { isValid: false, errors };
  }
  
  const trimmedTitle = title.trim();
  
  if (trimmedTitle.length < LIMITS.RECIPE.TITLE_MIN_LENGTH) {
    errors.push(`Título deve ter pelo menos ${LIMITS.RECIPE.TITLE_MIN_LENGTH} caracteres`);
  }
  
  if (trimmedTitle.length > LIMITS.RECIPE.TITLE_MAX_LENGTH) {
    errors.push(`Título deve ter no máximo ${LIMITS.RECIPE.TITLE_MAX_LENGTH} caracteres`);
  }
  
  if (!REGEX_PATTERNS.RECIPE_TITLE.test(trimmedTitle)) {
    errors.push('Título contém caracteres não permitidos');
  }
  
  // Check for SEO-friendly title
  if (trimmedTitle.length < 20) {
    warnings.push('Título mais longo é melhor para buscas');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * 📝 Validate recipe description
 */
export const validateRecipeDescription = (description: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!description || typeof description !== 'string') {
    errors.push('Descrição da receita é obrigatória');
    return { isValid: false, errors };
  }
  
  const trimmedDescription = description.trim();
  
  if (trimmedDescription.length < LIMITS.RECIPE.DESCRIPTION_MIN_LENGTH) {
    errors.push(`Descrição deve ter pelo menos ${LIMITS.RECIPE.DESCRIPTION_MIN_LENGTH} caracteres`);
  }
  
  if (trimmedDescription.length > LIMITS.RECIPE.DESCRIPTION_MAX_LENGTH) {
    errors.push(`Descrição deve ter no máximo ${LIMITS.RECIPE.DESCRIPTION_MAX_LENGTH} caracteres`);
  }
  
  // Check for meaningful content
  const words = trimmedDescription.split(/\s+/);
  if (words.length < 5) {
    warnings.push('Descrição muito curta. Adicione mais detalhes');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * 🥕 Validate ingredient
 */
export const validateIngredient = (ingredient: {
  name: string;
  amount: number;
  unit: string;
}): ValidationResult => {
  const errors: string[] = [];
  
  if (!ingredient.name || typeof ingredient.name !== 'string' || ingredient.name.trim().length === 0) {
    errors.push('Nome do ingrediente é obrigatório');
  }
  
  if (typeof ingredient.amount !== 'number' || ingredient.amount <= 0) {
    errors.push('Quantidade deve ser um número positivo');
  }
  
  if (ingredient.amount > 10000) {
    errors.push('Quantidade muito grande');
  }
  
  if (!ingredient.unit || typeof ingredient.unit !== 'string' || ingredient.unit.trim().length === 0) {
    errors.push('Unidade de medida é obrigatória');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * ⏰ Validate cooking time
 */
export const validateCookingTime = (minutes: number, type: 'prep' | 'cook'): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (typeof minutes !== 'number' || isNaN(minutes)) {
    errors.push('Tempo deve ser um número válido');
    return { isValid: false, errors };
  }
  
  if (type === 'prep') {
    if (minutes < LIMITS.RECIPE.PREP_TIME_MIN) {
      errors.push(`Tempo de preparo deve ser pelo menos ${LIMITS.RECIPE.PREP_TIME_MIN} minuto`);
    }
    
    if (minutes > LIMITS.RECIPE.PREP_TIME_MAX) {
      errors.push(`Tempo de preparo muito longo (máximo ${LIMITS.RECIPE.PREP_TIME_MAX} minutos)`);
    }
    
    if (minutes > 120) {
      warnings.push('Tempo de preparo muito longo. Verifique se está correto');
    }
  } else {
    if (minutes < LIMITS.RECIPE.COOK_TIME_MIN) {
      // Cook time can be 0 for no-cook recipes
    }
    
    if (minutes > LIMITS.RECIPE.COOK_TIME_MAX) {
      errors.push(`Tempo de cozimento muito longo (máximo ${LIMITS.RECIPE.COOK_TIME_MAX} minutos)`);
    }
    
    if (minutes > 240) {
      warnings.push('Tempo de cozimento muito longo. Verifique se está correto');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * 👥 Validate servings
 */
export const validateServings = (servings: number): ValidationResult => {
  const errors: string[] = [];
  
  if (typeof servings !== 'number' || isNaN(servings)) {
    errors.push('Número de porções deve ser um número válido');
    return { isValid: false, errors };
  }
  
  if (servings < LIMITS.RECIPE.SERVINGS_MIN) {
    errors.push(`Deve servir pelo menos ${LIMITS.RECIPE.SERVINGS_MIN} pessoa`);
  }
  
  if (servings > LIMITS.RECIPE.SERVINGS_MAX) {
    errors.push(`Número de porções muito alto (máximo ${LIMITS.RECIPE.SERVINGS_MAX})`);
  }
  
  if (!Number.isInteger(servings)) {
    errors.push('Número de porções deve ser um número inteiro');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * ⭐ Validate rating
 */
export const validateRating = (rating: number, maxRating: number = 5): ValidationResult => {
  const errors: string[] = [];
  
  if (typeof rating !== 'number' || isNaN(rating)) {
    errors.push('Avaliação deve ser um número válido');
    return { isValid: false, errors };
  }
  
  if (rating < 0) {
    errors.push('Avaliação não pode ser negativa');
  }
  
  if (rating > maxRating) {
    errors.push(`Avaliação não pode ser maior que ${maxRating}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 🔍 Validate search query
 */
export const validateSearchQuery = (query: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!query || typeof query !== 'string') {
    errors.push('Termo de busca é obrigatório');
    return { isValid: false, errors };
  }
  
  const trimmedQuery = query.trim();
  
  if (trimmedQuery.length < LIMITS.SEARCH.QUERY_MIN_LENGTH) {
    errors.push(`Busca deve ter pelo menos ${LIMITS.SEARCH.QUERY_MIN_LENGTH} caracteres`);
  }
  
  if (trimmedQuery.length > LIMITS.SEARCH.QUERY_MAX_LENGTH) {
    errors.push(`Busca muito longa (máximo ${LIMITS.SEARCH.QUERY_MAX_LENGTH} caracteres)`);
  }
  
  // Check for meaningful search
  if (/^\s*$/.test(trimmedQuery)) {
    errors.push('Busca não pode conter apenas espaços');
  }
  
  if (trimmedQuery.length < 3) {
    warnings.push('Buscas mais específicas retornam melhores resultados');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * 🌐 Validate URL
 */
export const validateUrl = (url: string, required: boolean = false): ValidationResult => {
  const errors: string[] = [];
  
  if (!url || typeof url !== 'string') {
    if (required) {
      errors.push('URL é obrigatória');
    }
    return { isValid: !required, errors };
  }
  
  const trimmedUrl = url.trim();
  
  if (trimmedUrl.length === 0) {
    if (required) {
      errors.push('URL não pode estar vazia');
    }
    return { isValid: !required, errors };
  }
  
  if (!REGEX_PATTERNS.URL.test(trimmedUrl)) {
    errors.push('URL deve ter um formato válido');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 🔢 Validate number in range
 */
export const validateNumberRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string = 'Valor'
): ValidationResult => {
  const errors: string[] = [];
  
  if (typeof value !== 'number' || isNaN(value)) {
    errors.push(`${fieldName} deve ser um número válido`);
    return { isValid: false, errors };
  }
  
  if (value < min) {
    errors.push(`${fieldName} deve ser pelo menos ${min}`);
  }
  
  if (value > max) {
    errors.push(`${fieldName} deve ser no máximo ${max}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 📋 Validate array length
 */
export const validateArrayLength = (
  array: any[],
  min: number,
  max: number,
  fieldName: string = 'Lista'
): ValidationResult => {
  const errors: string[] = [];
  
  if (!Array.isArray(array)) {
    errors.push(`${fieldName} deve ser uma lista válida`);
    return { isValid: false, errors };
  }
  
  if (array.length < min) {
    errors.push(`${fieldName} deve ter pelo menos ${min} ${min === 1 ? 'item' : 'itens'}`);
  }
  
  if (array.length > max) {
    errors.push(`${fieldName} deve ter no máximo ${max} ${max === 1 ? 'item' : 'itens'}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * ✅ Sanitize input string
 */
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[^\w\s\-.,!?():]/gi, '') // Keep only safe characters
    .substring(0, 1000); // Limit length
};

/**
 * 📋 Validation utilities object
 */
export const ValidationUtils = {
  validateEmail,
  validatePhone,
  validatePassword,
  validateName,
  validateRecipeTitle,
  validateRecipeDescription,
  validateIngredient,
  validateCookingTime,
  validateServings,
  validateRating,
  validateSearchQuery,
  validateUrl,
  validateNumberRange,
  validateArrayLength,
  sanitizeInput,
};

export default ValidationUtils;