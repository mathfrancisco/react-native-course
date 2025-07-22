import { Category } from "../interface/Category";


export class CategoryFormatter {
  /**
   * Formata nome da categoria
   */
  static formatName(category: Category): string {
    return category.name;
  }
  
  /**
   * Formata contagem de receitas
   */
  static formatRecipeCount(count: number): string {
    if (count === 0) return 'Nenhuma receita';
    if (count === 1) return '1 receita';
    return `${count} receitas`;
  }
  
  /**
   * Formata slug para URL
   */
  static formatSlugForUrl(slug: string): string {
    return encodeURIComponent(slug);
  }
  
  /**
   * Formata descrição
   */
  static formatDescription(category: Category): string {
    return category.description || `Receitas da categoria ${category.name}`;
  }
  
  /**
   * Formata card da categoria
   */
  static formatCard(category: Category): {
    title: string;
    subtitle: string;
    color: string;
  } {
    return {
      title: category.name,
      subtitle: this.formatRecipeCount(category.recipeCount),
      color: category.color || '#007AFF'
    };
  }
}