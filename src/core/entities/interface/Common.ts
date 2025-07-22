export interface NutritionalInfo {
  calories: number;
  protein: number; // em gramas
  carbs: number; // em gramas
  fat: number; // em gramas
  fiber?: number; // em gramas
  sugar?: number; // em gramas
  sodium?: number; // em mg
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}