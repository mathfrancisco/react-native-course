import { Category } from "../interface/Category";
import { ValidationResult } from "../interface/Common";


export class CategoryController {
  /**
   * Valida uma categoria
   */
  static validateCategory(category: Category): ValidationResult {
    const errors: string[] = [];
    
    if (!category.id || category.id.trim() === '') {
      errors.push('ID da categoria é obrigatório');
    }
    
    if (!category.name || category.name.trim() === '') {
      errors.push('Nome da categoria é obrigatório');
    }
    
    if (!category.slug || category.slug.trim() === '') {
      errors.push('Slug da categoria é obrigatório');
    }
    
    if (category.sortOrder < 0) {
      errors.push('Ordem de classificação deve ser positiva');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Gera slug a partir do nome
   */
  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[áàâãä]/g, 'a')
      .replace(/[éèêë]/g, 'e')
      .replace(/[íìîï]/g, 'i')
      .replace(/[óòôõö]/g, 'o')
      .replace(/[úùûü]/g, 'u')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  
  /**
   * Verifica se a categoria está ativa
   */
  static isActive(category: Category): boolean {
    return category.isActive;
  }
  
  /**
   * Compara categorias para ordenação
   */
  static compareByOrder(a: Category, b: Category): number {
    return a.sortOrder - b.sortOrder;
  }
}