import { PaginatedResult } from "../../entities/interface/Common";
import { RecipeFilter, SearchCriteria } from "../../entities/interface/Filter";
import { Recipe } from "../../entities/interface/Recipe";


export interface ISearchUseCase {
  execute(criteria: SearchCriteria): Promise<PaginatedResult<Recipe>>;
  executeSimple(query: string): Promise<Recipe[]>;
}

export interface SearchRequest {
  query: string;
  filters?: RecipeFilter;
  page?: number;
  pageSize?: number;
}

export interface SearchResponse {
  results: Recipe[];
  total: number;
  query: string;
  suggestions?: string[];
}