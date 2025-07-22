import { PaginatedResult } from "../../entities/interface/Common";
import { RecipeFilter } from "../../entities/interface/Filter";
import { Recipe } from "../../entities/interface/Recipe";


export interface IGetRecipesUseCase {
  execute(filters?: RecipeFilter): Promise<Recipe[]>;
  executeWithPagination(
    filters?: RecipeFilter, 
    page?: number, 
    pageSize?: number
  ): Promise<PaginatedResult<Recipe>>;
}

export interface GetRecipesRequest {
  filters?: RecipeFilter;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetRecipesResponse {
  recipes: Recipe[];
  total: number;
  hasMore: boolean;
}