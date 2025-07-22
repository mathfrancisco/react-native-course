import { 
  Recipe, 
  RecipeFilter, 
  PaginatedResult, 
  SearchCriteria 
} from '../../../core/entities';

export interface IRecipeService {
  // Operações principais
  getAllRecipes(): Promise<Recipe[]>;
  getRecipeById(id: string): Promise<Recipe | null>;
  getRecipesByCategory(categoryId: string): Promise<Recipe[]>;
  
  // Busca e filtros
  searchRecipes(criteria: SearchCriteria): Promise<PaginatedResult<Recipe>>;
  filterRecipes(filters: RecipeFilter): Promise<Recipe[]>;
  
  // Recomendações
  getRecommendedRecipes(userId?: string): Promise<Recipe[]>;
  getSimilarRecipes(recipeId: string): Promise<Recipe[]>;
  
  // Operações com favoritos
  getRecipesWithFavoriteStatus(recipes: Recipe[], userId: string): Promise<RecipeWithFavoriteStatus[]>;
  
  // Estatísticas
  getRecipeStats(): Promise<RecipeStats>;
}

export interface RecipeWithFavoriteStatus extends Recipe {
  isFavorite: boolean;
}

export interface RecipeStats {
  totalRecipes: number;
  averageRating: number;
  topCategories: { categoryId: string; count: number }[];
  popularTags: { tag: string; count: number }[];
}