export interface ValidationRule<T> {
  name: string;
  message: string;
  validate: (value: T, context?: any) => boolean | Promise<boolean>;
  severity: 'error' | 'warning' | 'info';
  async?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  info: ValidationInfo[];
  score?: number; // 0-100 qualidade score
}

export interface ValidationError {
  field: string;
  rule: string;
  message: string;
  severity: 'error';
  code?: string;
  suggestion?: string;
}

export interface ValidationWarning {
  field: string;
  rule: string;
  message: string;
  severity: 'warning';
  suggestion?: string;
}

export interface ValidationInfo {
  field: string;
  rule: string;
  message: string;
  severity: 'info';
  improvement?: string;
}

export interface IValidator<T> {
  // Validação principal
  validate(data: T, context?: ValidationContext): Promise<ValidationResult>;
  
  // Validação rápida (sem async)
  validateSync(data: T, context?: ValidationContext): ValidationResult;
  
  // Validação de campo específico
  validateField(fieldName: keyof T, value: any, context?: ValidationContext): ValidationResult;
  
  // Adicionar regras customizadas
  addRule(rule: ValidationRule<T>): void;
  removeRule(ruleName: string): void;
  
  // Configuração
  setStrictMode(strict: boolean): void;
  setContext(context: ValidationContext): void;
}

export interface ValidationContext {
  userId?: string;
  language: string;
  strictMode: boolean;
  skipOptional: boolean;
  existingData?: any;
  businessRules?: any;
}