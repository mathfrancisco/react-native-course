import { DifficultyLevel, Recipe } from "../interface/Recipe";


export class RecipeFormatter {
  /**
   * Formata tempo em formato legível
   */
  static formatTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}min`;
  }
  
  /**
   * Formata dificuldade
   */
  static formatDifficulty(difficulty: DifficultyLevel): string {
    const difficultyMap = {
      easy: 'Fácil',
      medium: 'Médio',
      hard: 'Difícil'
    };
    
    return difficultyMap[difficulty];
  }
  
  /**
   * Formata número de porções
   */
  static formatServings(servings: number): string {
    return servings === 1 ? '1 porção' : `${servings} porções`;
  }
  
  /**
   * Formata avaliação
   */
  static formatRating(rating: number): string {
    return rating.toFixed(1);
  }
  
  /**
   * Formata contagem de reviews
   */
  static formatReviewCount(count: number): string {
    if (count === 0) return 'Sem avaliações';
    if (count === 1) return '1 avaliação';
    if (count < 1000) return `${count} avaliações`;
    
    const k = Math.floor(count / 1000);
    const remainder = count % 1000;
    
    if (remainder === 0) return `${k}k avaliações`;
    return `${k}.${Math.floor(remainder / 100)}k avaliações`;
  }
  
  /**
   * Formata lista de ingredientes
   */
  static formatIngredientsList(recipe: Recipe): string[] {
    return recipe.ingredients.map(ingredient => {
      const amount = ingredient.amount % 1 === 0 
        ? ingredient.amount.toString()
        : ingredient.amount.toFixed(1);
      
      return `${amount} ${ingredient.unit} de ${ingredient.name}`;
    });
  }
  
  /**
   * Formata resumo da receita
   */
  static formatSummary(recipe: Recipe): string {
    const totalTime = recipe.prepTime + recipe.cookTime;
    return `${this.formatDifficulty(recipe.difficulty)} • ${this.formatTime(totalTime)} • ${this.formatServings(recipe.servings)}`;
  }
  
  /**
   * Formata tags
   */
  static formatTags(tags: string[]): string {
    return tags.map(tag => `#${tag}`).join(' ');
  }
}