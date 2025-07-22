import { PaginatedResult } from '../../entities/interface/Common';
import { RecipeFilter } from '../../entities/interface/Filter';
import { Recipe } from '../../entities/interface/Recipe';
import { IGetRecipesUseCase, GetRecipesRequest } from '../interface/IGetRecipesUseCase';

export class GetRecipesUseCase implements IGetRecipesUseCase {
  constructor(private recipeRepository: IRecipeRepository) {}
  
  async execute(filters?: RecipeFilter): Promise<Recipe[]> {
    try {
      // Busca todas as receitas
      const allRecipes = await this.recipeRepository.getAll();
      
      // Aplica filtros se fornecidos
      if (filters) {
        return this.applyFilters(allRecipes, filters);
      }
      
      return allRecipes;
    } catch (error) {
      throw new Error(`Erro ao buscar receitas: ${error}`);
    }
  }
  
  async executeWithPagination(
    filters?: RecipeFilter,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResult<Recipe>> {
    try {
      // Busca receitas com filtros
      const filteredRecipes = await this.execute(filters);
      
      // Calcula paginação
      const total = filteredRecipes.length;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const data = filteredRecipes.slice(startIndex, endIndex);
      
      return {
        data,
        total,
        page,
        pageSize,
        hasNext: endIndex < total,
        hasPrevious: page > 1
      };
    } catch (error) {
      throw new Error(`Erro ao buscar receitas paginadas: ${error}`);
    }
  }
  
  private applyFilters(recipes: Recipe[], filters: RecipeFilter): Recipe[] {
    return recipes.filter(recipe => {
      // Implementação dos filtros
      if (filters.categoryIds && !filters.categoryIds.includes(recipe.categoryId)) {
        return false;
      }
      
      if (filters.difficulty && !filters.difficulty.includes(recipe.difficulty)) {
        return false;
      }
      
      if (filters.maxPrepTime && recipe.prepTime > filters.maxPrepTime) {
        return false;
      }
      
      if (filters.minRating && recipe.rating < filters.minRating) {
        return false;
      }
      
      return true;
    });
  }
}