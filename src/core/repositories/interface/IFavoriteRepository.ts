export interface IFavoriteRepository {
  // Operações básicas
  add(recipeId: string, userId: string): Promise<boolean>;
  remove(recipeId: string, userId: string): Promise<boolean>;
  isFavorite(recipeId: string, userId: string): Promise<boolean>;
  
  // Operações de listagem
  getFavoriteIds(userId: string): Promise<string[]>;
  getUsersWhoFavorited(recipeId: string): Promise<string[]>;
  
  // Operações de limpeza
  clearUserFavorites(userId: string): Promise<void>;
  clearRecipeFavorites(recipeId: string): Promise<void>;
}