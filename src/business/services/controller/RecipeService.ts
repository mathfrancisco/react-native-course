import { IRecipeService, RecipeWithFavoriteStatus, RecipeStats } from '../interface/IRecipeService';
import { 
  Recipe, 
  RecipeFilter, 
  PaginatedResult, 
  SearchCriteria 
} from '../../../core/entities';
import { 
  GetRecipesUseCase, 
  SearchRecipesUseCase, 
  ToggleFavoriteUseCase 
} from '../../../core/usecases';
import { RepositoryManager } from '../../../core/repositories';

export class RecipeService implements IRecipeService {
  private getRecipesUseCase: GetRecipesUseCase;
  private searchRecipesUseCase: SearchRecipesUseCase;
  private favoriteUseCase: ToggleFavoriteUseCase;
  
  constructor() {
    const repositoryManager = RepositoryManager.getInstance();
    
    this.getRecipesUseCase = new GetRecipesUseCase(
      repositoryManager.getRecipeRepository()
    );
    
    this.searchRecipesUseCase = new SearchRecipesUseCase(
      repositoryManager.getRecipeRepository()
    );
    
    this.favoriteUseCase = new ToggleFavoriteUseCase(
      repositoryManager.getFavoriteRepository(),
      repositoryManager.getRecipeRepository()
    );
  }
  
  /**
   * 📋 Operações principais
   */
  async getAllRecipes(): Promise<Recipe[]> {
    try {
      return await this.getRecipesUseCase.execute();
    } catch (error) {
      console.error('❌ Erro ao buscar todas as receitas:', error);
      throw new Error('Não foi possível carregar as receitas');
    }
  }
  
  async getRecipeById(id: string): Promise<Recipe | null> {
    try {
      if (!id) return null;
      
      const repository = RepositoryManager.getInstance().getRecipeRepository();
      return await repository.getById(id);
    } catch (error) {
      console.error(`❌ Erro ao buscar receita ${id}:`, error);
      return null;
    }
  }
  
  async getRecipesByCategory(categoryId: string): Promise<Recipe[]> {
    try {
      if (!categoryId) return [];
      
      const filters: RecipeFilter = {
        categoryIds: [categoryId]
      };
      
      return await this.getRecipesUseCase.execute(filters);
    } catch (error) {
      console.error(`❌ Erro ao buscar receitas da categoria ${categoryId}:`, error);
      return [];
    }
  }
  
  /**
   * 🔍 Busca e filtros
   */
  async searchRecipes(criteria: SearchCriteria): Promise<PaginatedResult<Recipe>> {
    try {
      return await this.searchRecipesUseCase.execute(criteria);
    } catch (error) {
      console.error('❌ Erro na busca de receitas:', error);
      
      // Retorna resultado vazio em caso de erro
      return {
        data: [],
        total: 0,
        page: criteria.offset ? Math.floor(criteria.offset / (criteria.limit || 10)) + 1 : 1,
        pageSize: criteria.limit || 10,
        hasNext: false,
        hasPrevious: false
      };
    }
  }
  
  async filterRecipes(filters: RecipeFilter): Promise<Recipe[]> {
    try {
      return await this.getRecipesUseCase.execute(filters);
    } catch (error) {
      console.error('❌ Erro ao filtrar receitas:', error);
      return [];
    }
  }
  
  /**
   * 💡 Recomendações
   */
  async getRecommendedRecipes(userId?: string): Promise<Recipe[]> {
    try {
      // Algoritmo simples: receitas mais bem avaliadas
      const allRecipes = await this.getAllRecipes();
      
      if (userId) {
        // Se tem usuário, considera favoritos para personalização
        const favoriteIds = await this.favoriteUseCase.getFavorites(userId);
        const favoriteRecipes = favoriteIds.slice(0, 5); // Últimos 5 favoritos
        
        // Busca receitas similares (mesma categoria)
        const similarRecipes = new Set<Recipe>();
        
        for (const favoriteRecipe of favoriteRecipes) {
          const similar = await this.getSimilarRecipes(favoriteRecipe.id);
          similar.slice(0, 2).forEach(recipe => similarRecipes.add(recipe));
        }
        
        // Combina com receitas populares
        const popular = allRecipes
          .filter(recipe => !favoriteIds.some(fav => fav.id === recipe.id))
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 10);
        
        const recommendations = Array.from(similarRecipes).concat(popular);
        return recommendations.slice(0, 10);
      }
      
      // Sem usuário: apenas receitas populares
      return allRecipes
        .sort((a, b) => {
          // Combina rating com número de reviews
          const scoreA = a.rating * Math.log(a.reviewCount + 1);
          const scoreB = b.rating * Math.log(b.reviewCount + 1);
          return scoreB - scoreA;
        })
        .slice(0, 10);
        
    } catch (error) {
      console.error('❌ Erro ao buscar recomendações:', error);
      return [];
    }
  }
  
  async getSimilarRecipes(recipeId: string): Promise<Recipe[]> {
    try {
      const recipe = await this.getRecipeById(recipeId);
      if (!recipe) return [];
      
      const allRecipes = await this.getAllRecipes();
      
      // Busca receitas da mesma categoria
      const sameCategory = allRecipes.filter(r => 
        r.id !== recipeId && r.categoryId === recipe.categoryId
      );
      
      // Ordena por rating e pega as melhores
      return sameCategory
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6);
        
    } catch (error) {
      console.error(`❌ Erro ao buscar receitas similares a ${recipeId}:`, error);
      return [];
    }
  }
  
  /**
   * ❤️ Operações com favoritos
   */
  async getRecipesWithFavoriteStatus(
    recipes: Recipe[], 
    userId: string
  ): Promise<RecipeWithFavoriteStatus[]> {
    try {
      if (!userId) {
        return recipes.map(recipe => ({ ...recipe, isFavorite: false }));
      }
      
      const favoriteIds = await this.favoriteUseCase.getFavorites(userId);
      const favoriteIdSet = new Set(favoriteIds.map(fav => fav.id));
      
      return recipes.map(recipe => ({
        ...recipe,
        isFavorite: favoriteIdSet.has(recipe.id)
      }));
      
    } catch (error) {
      console.error('❌ Erro ao verificar status de favoritos:', error);
      return recipes.map(recipe => ({ ...recipe, isFavorite: false }));
    }
  }
  
  /**
   * 📊 Estatísticas
   */
  async getRecipeStats(): Promise<RecipeStats> {
    try {
      const allRecipes = await this.getAllRecipes();
      
      // Total de receitas
      const totalRecipes = allRecipes.length;
      
      // Rating médio
      const averageRating = totalRecipes > 0 
        ? allRecipes.reduce((sum, recipe) => sum + recipe.rating, 0) / totalRecipes
        : 0;
      
      // Top categorias
      const categoryCount = new Map<string, number>();
      allRecipes.forEach(recipe => {
        const count = categoryCount.get(recipe.categoryId) || 0;
        categoryCount.set(recipe.categoryId, count + 1);
      });
      
      const topCategories = Array.from(categoryCount.entries())
        .map(([categoryId, count]) => ({ categoryId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      // Tags populares
      const tagCount = new Map<string, number>();
      allRecipes.forEach(recipe => {
        recipe.tags.forEach(tag => {
          const count = tagCount.get(tag) || 0;
          tagCount.set(tag, count + 1);
        });
      });
      
      const popularTags = Array.from(tagCount.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      return {
        totalRecipes,
        averageRating: Math.round(averageRating * 100) / 100,
        topCategories,
        popularTags
      };
      
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas:', error);
      return {
        totalRecipes: 0,
        averageRating: 0,
        topCategories: [],
        popularTags: []
      };
    }
  }
}