import { Recipe } from '../../entities/interface/Recipe';
import { IFavoriteUseCase, FavoriteResult } from '../interface/IFavoriteUseCase';


export class ToggleFavoriteUseCase implements IFavoriteUseCase {
  constructor(
    private favoriteRepository: IFavoriteRepository,
    private recipeRepository: IRecipeRepository
  ) {}
  
  async toggleFavorite(recipeId: string, userId: string): Promise<FavoriteResult> {
    try {
      // Valida entrada
      if (!recipeId || !userId) {
        throw new Error('ID da receita e usuário são obrigatórios');
      }
      
      // Verifica se a receita existe
      const recipe = await this.recipeRepository.getById(recipeId);
      if (!recipe) {
        throw new Error('Receita não encontrada');
      }
      
      // Verifica estado atual
      const isCurrentlyFavorite = await this.isFavorite(recipeId, userId);
      
      let success: boolean;
      let action: 'added' | 'removed';
      
      if (isCurrentlyFavorite) {
        // Remove dos favoritos
        success = await this.favoriteRepository.remove(recipeId, userId);
        action = 'removed';
      } else {
        // Adiciona aos favoritos
        success = await this.favoriteRepository.add(recipeId, userId);
        action = 'added';
      }
      
      const message = action === 'added' 
        ? 'Receita adicionada aos favoritos'
        : 'Receita removida dos favoritos';
      
      return {
        success,
        action,
        message,
        recipeId
      };
    } catch (error) {
      throw new Error(`Erro ao alterar favorito: ${error}`);
    }
  }
  
  async getFavorites(userId: string): Promise<Recipe[]> {
    try {
      if (!userId) {
        throw new Error('ID do usuário é obrigatório');
      }
      
      const favoriteIds = await this.favoriteRepository.getFavoriteIds(userId);
      const recipes: Recipe[] = [];
      
      for (const recipeId of favoriteIds) {
        const recipe = await this.recipeRepository.getById(recipeId);
        if (recipe) {
          recipes.push(recipe);
        }
      }
      
      return recipes;
    } catch (error) {
      throw new Error(`Erro ao buscar favoritos: ${error}`);
    }
  }
  
  async isFavorite(recipeId: string, userId: string): Promise<boolean> {
    try {
      if (!recipeId || !userId) {
        return false;
      }
      
      return await this.favoriteRepository.isFavorite(recipeId, userId);
    } catch (error) {
      console.error('Erro ao verificar favorito:', error);
      return false;
    }
  }
  
  async addToFavorites(recipeId: string, userId: string): Promise<boolean> {
    const result = await this.toggleFavorite(recipeId, userId);
    return result.success && result.action === 'added';
  }
  
  async removeFromFavorites(recipeId: string, userId: string): Promise<boolean> {
    const result = await this.toggleFavorite(recipeId, userId);
    return result.success && result.action === 'removed';
  }
}