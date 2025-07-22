import { IRecipeRepository } from '../interface/IRecipeRepository';
import { ICategoryRepository } from '../interface/ICategoryRepository';
import { IFavoriteRepository } from '../interface/IFavoriteRepository';

export class RepositoryManager {
  private static instance: RepositoryManager;
  
  private recipeRepository?: IRecipeRepository;
  private categoryRepository?: ICategoryRepository;
  private favoriteRepository?: IFavoriteRepository;
  
  private constructor() {}
  
  static getInstance(): RepositoryManager {
    if (!RepositoryManager.instance) {
      RepositoryManager.instance = new RepositoryManager();
    }
    return RepositoryManager.instance;
  }
  
  // Setters para injeção de dependência
  setRecipeRepository(repository: IRecipeRepository): void {
    this.recipeRepository = repository;
  }
  
  setCategoryRepository(repository: ICategoryRepository): void {
    this.categoryRepository = repository;
  }
  
  setFavoriteRepository(repository: IFavoriteRepository): void {
    this.favoriteRepository = repository;
  }
  
  // Getters
  getRecipeRepository(): IRecipeRepository {
    if (!this.recipeRepository) {
      throw new Error('RecipeRepository não foi configurado');
    }
    return this.recipeRepository;
  }
  
  getCategoryRepository(): ICategoryRepository {
    if (!this.categoryRepository) {
      throw new Error('CategoryRepository não foi configurado');
    }
    return this.categoryRepository;
  }
  
  getFavoriteRepository(): IFavoriteRepository {
    if (!this.favoriteRepository) {
      throw new Error('FavoriteRepository não foi configurado');
    }
    return this.favoriteRepository;
  }
  
  // Operações de limpeza de cache
  async clearAllCaches(): Promise<void> {
    await Promise.all([
      this.recipeRepository?.invalidateCache(),
      this.categoryRepository?.invalidateCache(),
    ]);
  }
}