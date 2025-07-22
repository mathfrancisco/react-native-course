import { PaginatedResult } from '../../entities/interface/Common';
import { SearchCriteria } from '../../entities/interface/Filter';
import { Recipe } from '../../entities/interface/Recipe';
import { ISearchUseCase } from '../interface/ISearchUseCase';

export class SearchRecipesUseCase implements ISearchUseCase {
  constructor(private recipeRepository: IRecipeRepository) {}
  
  async execute(criteria: SearchCriteria): Promise<PaginatedResult<Recipe>> {
    try {
      // Busca todas as receitas
      const allRecipes = await this.recipeRepository.getAll();
      
      // Aplica busca textual
      let results = this.searchByText(allRecipes, criteria.query);
      
      // Aplica filtros adicionais
      if (criteria.filters) {
        results = this.applyFilters(results, criteria.filters);
      }
      
      // Aplica ordenação
      results = this.sortResults(results, criteria.sortBy, criteria.sortOrder);
      
      // Aplica paginação
      return this.paginate(results, criteria.limit, criteria.offset);
    } catch (error) {
      throw new Error(`Erro na busca: ${error}`);
    }
  }
  
  async executeSimple(query: string): Promise<Recipe[]> {
    const allRecipes = await this.recipeRepository.getAll();
    return this.searchByText(allRecipes, query);
  }
  
  private searchByText(recipes: Recipe[], query: string): Recipe[] {
    if (!query || query.trim() === '') {
      return recipes;
    }
    
    const searchTerm = query.toLowerCase().trim();
    
    return recipes.filter(recipe => {
      // Busca no título
      if (recipe.title.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Busca na descrição
      if (recipe.description?.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Busca nos ingredientes
      const hasMatchingIngredient = recipe.ingredients.some(ingredient =>
        ingredient.name.toLowerCase().includes(searchTerm)
      );
      if (hasMatchingIngredient) {
        return true;
      }
      
      // Busca nas tags
      const hasMatchingTag = recipe.tags.some(tag =>
        tag.toLowerCase().includes(searchTerm)
      );
      if (hasMatchingTag) {
        return true;
      }
      
      return false;
    });
  }
  
  private applyFilters(recipes: Recipe[], filters: any): Recipe[] {
    // Reutiliza lógica do GetRecipesUseCase
    return recipes; // Implementação simplificada
  }
  
  private sortResults(recipes: Recipe[], sortBy?: string, sortOrder?: 'asc' | 'desc'): Recipe[] {
    if (!sortBy) return recipes;
    
    const sorted = [...recipes].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'prepTime':
          aValue = a.prepTime;
          bValue = b.prepTime;
          break;
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'desc' ? 1 : -1;
      if (aValue > bValue) return sortOrder === 'desc' ? -1 : 1;
      return 0;
    });
    
    return sorted;
  }
  
  private paginate(
    recipes: Recipe[], 
    limit?: number, 
    offset?: number
  ): PaginatedResult<Recipe> {
    const total = recipes.length;
    const pageSize = limit || 10;
    const page = Math.floor((offset || 0) / pageSize) + 1;
    const startIndex = offset || 0;
    const endIndex = startIndex + pageSize;
    
    return {
      data: recipes.slice(startIndex, endIndex),
      total,
      page,
      pageSize,
      hasNext: endIndex < total,
      hasPrevious: startIndex > 0
    };
  }
}