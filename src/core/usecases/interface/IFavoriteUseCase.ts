import { Recipe } from "../../entities/interface/Recipe";

export interface IFavoriteUseCase {
  toggleFavorite(recipeId: string, userId: string): Promise<FavoriteResult>;
  getFavorites(userId: string): Promise<Recipe[]>;
  isFavorite(recipeId: string, userId: string): Promise<boolean>;
  addToFavorites(recipeId: string, userId: string): Promise<boolean>;
  removeFromFavorites(recipeId: string, userId: string): Promise<boolean>;
}

export interface FavoriteResult {
  success: boolean;
  action: 'added' | 'removed';
  message: string;
  recipeId: string;
}

export interface FavoriteRequest {
  recipeId: string;
  userId: string;
}

export interface FavoriteResponse {
  isFavorite: boolean;
  favoritesCount: number;
}