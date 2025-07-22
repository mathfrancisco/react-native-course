import { Category } from "../../src/core/entities/interface/Category";
import { PaginatedResult } from "../../src/core/entities/interface/Common";
import { RecipeFilter } from "../../src/core/entities/interface/Filter";
import { Recipe } from "../../src/core/entities/interface/Recipe";
import { ICategoryRepository } from "../../src/core/repositories/interface/ICategoryRepository";
import { IFavoriteRepository } from "../../src/core/repositories/interface/IFavoriteRepository";
import { IRecipeRepository } from "../../src/core/repositories/interface/IRecipeRepository";
import { CategoryFactory } from "../fixtures/category.fixtures";
import { RecipeFactory } from "../fixtures/recipe.fixtures";



export class MockRecipeRepository implements IRecipeRepository {
  private recipes: Recipe[] = [];
  private shouldFail = false;
  
  constructor(initialRecipes: Recipe[] = []) {
    this.recipes = [...initialRecipes];
  }
  
  // Métodos para controlar o mock
  setShouldFail(shouldFail: boolean): void {
    this.shouldFail = shouldFail;
  }
  
  addRecipe(recipe: Recipe): void {
    this.recipes.push(recipe);
  }
  
  clearRecipes(): void {
    this.recipes = [];
  }
  
  getRecipesCount(): number {
    return this.recipes.length;
  }
  
  // Implementação da interface
  async getAll(): Promise<Recipe[]> {
    if (this.shouldFail) {
      throw new Error('Mock repository failure');
    }
    return [...this.recipes];
  }
  
  async getById(id: string): Promise<Recipe | null> {
    if (this.shouldFail) {
      throw new Error('Mock repository failure');
    }
    return this.recipes.find(r => r.id === id) || null;
  }
  
  async getByCategory(categoryId: string): Promise<Recipe[]> {
    if (this.shouldFail) {
      throw new Error('Mock repository failure');
    }
    return this.recipes.filter(r => r.categoryId === categoryId);
  }
  
  async getByIds(ids: string[]): Promise<Recipe[]> {
    if (this.shouldFail) {
      throw new Error('Mock repository failure');
    }
    return this.recipes.filter(r => ids.includes(r.id));
  }
  
  async search(query: string): Promise<Recipe[]> {
    if (this.shouldFail) {
      throw new Error('Mock repository failure');
    }
    const lowerQuery = query.toLowerCase();
    return this.recipes.filter(r => 
      r.title.toLowerCase().includes(lowerQuery) ||
      r.description?.toLowerCase().includes(lowerQuery) ||
      r.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }
  
  async filter(filters: RecipeFilter): Promise<Recipe[]> {
    if (this.shouldFail) {
      throw new Error('Mock repository failure');
    }
    
    let filtered = [...this.recipes];
    
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      filtered = filtered.filter(r => filters.categoryIds!.includes(r.categoryId));
    }
    
    if (filters.difficulty && filters.difficulty.length > 0) {
      filtered = filtered.filter(r => filters.difficulty!.includes(r.difficulty));
    }
    
    if (filters.maxPrepTime) {
      filtered = filtered.filter(r => r.prepTime <= filters.maxPrepTime!);
    }
    
    if (filters.minRating) {
      filtered = filtered.filter(r => r.rating >= filters.minRating!);
    }
    
    return filtered;
  }
  
  async getAllPaginated(page: number, pageSize: number): Promise<PaginatedResult<Recipe>> {
    const allRecipes = await this.getAll();
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const data = allRecipes.slice(startIndex, endIndex);
    
    return {
      data,
      total: allRecipes.length,
      page,
      pageSize,
      hasNext: endIndex < allRecipes.length,
      hasPrevious: page > 1
    };
  }
  
  async searchPaginated(query: string, page: number, pageSize: number): Promise<PaginatedResult<Recipe>> {
    const searchResults = await this.search(query);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const data = searchResults.slice(startIndex, endIndex);
    
    return {
      data,
      total: searchResults.length,
      page,
      pageSize,
      hasNext: endIndex < searchResults.length,
      hasPrevious: page > 1
    };
  }
  
  async save(recipe: Recipe): Promise<void> {
    if (this.shouldFail) {
      throw new Error('Mock repository failure');
    }
    
    const existingIndex = this.recipes.findIndex(r => r.id === recipe.id);
    if (existingIndex >= 0) {
      this.recipes[existingIndex] = recipe;
    } else {
      this.recipes.push(recipe);
    }
  }
  
  async delete(id: string): Promise<void> {
    if (this.shouldFail) {
      throw new Error('Mock repository failure');
    }
    
    const index = this.recipes.findIndex(r => r.id === id);
    if (index >= 0) {
      this.recipes.splice(index, 1);
    }
  }
  
  async invalidateCache(): Promise<void> {
    // Mock implementation
  }
  
  async refreshCache(): Promise<void> {
    // Mock implementation
  }
}

export class MockCategoryRepository implements ICategoryRepository {
  private categories: Category[] = [];
  private shouldFail = false;
  
  constructor(initialCategories: Category[] = []) {
    this.categories = [...initialCategories];
  }
  
  setShouldFail(shouldFail: boolean): void {
    this.shouldFail = shouldFail;
  }
  
  async getAll(): Promise<Category[]> {
    if (this.shouldFail) {
      throw new Error('Mock category repository failure');
    }
    return [...this.categories];
  }
  
  async getById(id: string): Promise<Category | null> {
    if (this.shouldFail) {
      throw new Error('Mock category repository failure');
    }
    return this.categories.find(c => c.id === id) || null;
  }
  
  async getBySlug(slug: string): Promise<Category | null> {
    if (this.shouldFail) {
      throw new Error('Mock category repository failure');
    }
    return this.categories.find(c => c.slug === slug) || null;
  }
  
  async getActive(): Promise<Category[]> {
    if (this.shouldFail) {
      throw new Error('Mock category repository failure');
    }
    return this.categories.filter(c => c.isActive);
  }
  
  async save(category: Category): Promise<void> {
    if (this.shouldFail) {
      throw new Error('Mock category repository failure');
    }
    
    const existingIndex = this.categories.findIndex(c => c.id === category.id);
    if (existingIndex >= 0) {
      this.categories[existingIndex] = category;
    } else {
      this.categories.push(category);
    }
  }
  
  async delete(id: string): Promise<void> {
    if (this.shouldFail) {
      throw new Error('Mock category repository failure');
    }
    
    const index = this.categories.findIndex(c => c.id === id);
    if (index >= 0) {
      this.categories.splice(index, 1);
    }
  }
  
  async updateRecipeCount(categoryId: string, count: number): Promise<void> {
    if (this.shouldFail) {
      throw new Error('Mock category repository failure');
    }
    
    const category = this.categories.find(c => c.id === categoryId);
    if (category) {
      category.recipeCount = count;
    }
  }
  
  async invalidateCache(): Promise<void> {
    // Mock implementation
  }
}

export class MockFavoriteRepository implements IFavoriteRepository {
  private favorites: Map<string, Set<string>> = new Map(); // userId -> Set<recipeId>
  private shouldFail = false;
  
  setShouldFail(shouldFail: boolean): void {
    this.shouldFail = shouldFail;
  }
  
  async add(recipeId: string, userId: string): Promise<boolean> {
    if (this.shouldFail) {
      throw new Error('Mock favorite repository failure');
    }
    
    if (!this.favorites.has(userId)) {
      this.favorites.set(userId, new Set());
    }
    
    this.favorites.get(userId)!.add(recipeId);
    return true;
  }
  
  async remove(recipeId: string, userId: string): Promise<boolean> {
    if (this.shouldFail) {
      throw new Error('Mock favorite repository failure');
    }
    
    if (!this.favorites.has(userId)) {
      return false;
    }
    
    return this.favorites.get(userId)!.delete(recipeId);
  }
  
  async isFavorite(recipeId: string, userId: string): Promise<boolean> {
    if (this.shouldFail) {
      throw new Error('Mock favorite repository failure');
    }
    
    return this.favorites.get(userId)?.has(recipeId) || false;
  }
  
  async getFavoriteIds(userId: string): Promise<string[]> {
    if (this.shouldFail) {
      throw new Error('Mock favorite repository failure');
    }
    
    return Array.from(this.favorites.get(userId) || []);
  }
  
  async getUsersWhoFavorited(recipeId: string): Promise<string[]> {
    if (this.shouldFail) {
      throw new Error('Mock favorite repository failure');
    }
    
    const users: string[] = [];
    for (const [userId, favoriteIds] of this.favorites.entries()) {
      if (favoriteIds.has(recipeId)) {
        users.push(userId);
      }
    }
    return users;
  }
  
  async clearUserFavorites(userId: string): Promise<void> {
    if (this.shouldFail) {
      throw new Error('Mock favorite repository failure');
    }
    
    this.favorites.delete(userId);
  }
  
  async clearRecipeFavorites(recipeId: string): Promise<void> {
    if (this.shouldFail) {
      throw new Error('Mock favorite repository failure');
    }
    
    for (const favoriteIds of this.favorites.values()) {
      favoriteIds.delete(recipeId);
    }
  }
}

// Factory para criar mocks configurados
export const MockRepositoryFactory = {
  createRecipeRepository: (recipes?: Recipe[]): MockRecipeRepository => {
    return new MockRecipeRepository(recipes || RecipeFactory.createBatch(5));
  },
  
  createCategoryRepository: (categories?: Category[]): MockCategoryRepository => {
    return new MockCategoryRepository(categories || CategoryFactory.createBatch(3));
  },
  
  createFavoriteRepository: (): MockFavoriteRepository => {
    return new MockFavoriteRepository();
  },
  
  createFailingRepositories: () => ({
    recipeRepository: (() => {
      const repo = MockRepositoryFactory.createRecipeRepository();
      repo.setShouldFail(true);
      return repo;
    })(),
    categoryRepository: (() => {
      const repo = MockRepositoryFactory.createCategoryRepository();
      repo.setShouldFail(true);
      return repo;
    })(),
    favoriteRepository: (() => {
      const repo = MockRepositoryFactory.createFavoriteRepository();
      repo.setShouldFail(true);
      return repo;
    })()
  })
};