import { PaginatedResult } from "../../entities/interface/Common";
import { RecipeFilter } from "../../entities/interface/Filter";
import { Recipe } from "../../entities/interface/Recipe";

export interface IRecipeRepository {
  // Operações básicas
  getAll(): Promise<Recipe[]>;
  getById(id: string): Promise<Recipe | null>;
  save(recipe: Recipe): Promise<void>;
  delete(id: string): Promise<void>;
  
  // Operações de busca
  getByCategory(categoryId: string): Promise<Recipe[]>;
  getByIds(ids: string[]): Promise<Recipe[]>;
  search(query: string): Promise<Recipe[]>;
  filter(filters: RecipeFilter): Promise<Recipe[]>;
  
  // Operações com paginação
  getAllPaginated(page: number, pageSize: number): Promise<PaginatedResult<Recipe>>;
  searchPaginated(query: string, page: number, pageSize: number): Promise<PaginatedResult<Recipe>>;
  
  // Operações de cache
  invalidateCache(): Promise<void>;
  refreshCache(): Promise<void>;
}