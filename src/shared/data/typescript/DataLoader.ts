/**
 * 📥 Data Loader
 * 
 * Manages data loading, caching, and synchronization across the application.
 * Handles loading from multiple sources: API, local storage, JSON files, and mock data.
 */

import { Recipe } from '../../types/recipe.types';
import { Category } from '../../types/category.types';
import { CacheEntry, NetworkState } from '../../types/common.types';
import { DataValidator } from './DataValidator';
import { DataTransformer } from './DataTransformer';
import { DataSeeder } from './DataSeeder';

// Import mock data
import { mockRecipes } from '../mock/mockRecipes';
import { mockCategories } from '../mock/mockCategories';
import { mockUsers } from '../mock/mockUsers';

// Import JSON data
import recipesJson from '../json/recipes.json';
import categoriesJson from '../json/categories.json';
import ingredientsJson from '../json/ingredients.json';
import nutritionalJson from '../json/nutritional.json';

/**
 * 📊 Data Source Types
 */
export type DataSource = 'api' | 'cache' | 'mock' | 'json' | 'local_storage';

/**
 * ⚙️ Loader Configuration
 */
export interface LoaderConfig {
  enableCache: boolean;
  cacheTimeout: number; // milliseconds
  maxCacheSize: number; // bytes
  preferredDataSource: DataSource;
  fallbackDataSource: DataSource;
  retryAttempts: number;
  retryDelay: number; // milliseconds
}

/**
 * 📊 Load Result
 */
export interface LoadResult<T> {
  data: T;
  source: DataSource;
  cached: boolean;
  timestamp: Date;
  loadTime: number; // milliseconds
}

/**
 * 🔄 Cache Manager
 */
class CacheManager {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;

  constructor(maxSize: number = 10 * 1024 * 1024) { // 10MB default
    this.maxSize = maxSize;
  }

  set<T>(key: string, data: T, ttl: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key,
    };

    // Check cache size and clear if needed
    this.ensureCacheSize();
    this.cache.set(key, entry);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    return this.cache.has(key) && this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private ensureCacheSize(): void {
    const currentSize = this.getCurrentCacheSize();
    if (currentSize > this.maxSize) {
      // Remove oldest entries
      const entries = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      const toRemove = Math.ceil(entries.length * 0.3); // Remove 30%
      entries.slice(0, toRemove).forEach(([key]) => {
        this.cache.delete(key);
      });
    }
  }

  private getCurrentCacheSize(): number {
    let size = 0;
    this.cache.forEach(entry => {
      size += JSON.stringify(entry).length * 2; // Rough estimate
    });
    return size;
  }

  getStats() {
    return {
      entryCount: this.cache.size,
      estimatedSize: this.getCurrentCacheSize(),
      maxSize: this.maxSize,
    };
  }
}

/**
 * 📥 Main Data Loader Class
 */
class DataLoader {
  private config: LoaderConfig;
  private cache: CacheManager;
  private networkState: NetworkState = {
    isConnected: true,
    connectionType: 'wifi',
    isInternetReachable: true,
  };

  constructor(config: Partial<LoaderConfig> = {}) {
    this.config = {
      enableCache: true,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
      maxCacheSize: 10 * 1024 * 1024, // 10MB
      preferredDataSource: 'api',
      fallbackDataSource: 'mock',
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    };

    this.cache = new CacheManager(this.config.maxCacheSize);
  }

  /**
   * 🍳 Load recipes
   */
  async loadRecipes(options?: {
    source?: DataSource;
    forceRefresh?: boolean;
    includeInactive?: boolean;
  }): Promise<LoadResult<Recipe[]>> {
    const startTime = Date.now();
    const cacheKey = `recipes_${JSON.stringify(options || {})}`;
    
    // Check cache first
    if (this.config.enableCache && !options?.forceRefresh) {
      const cached = this.cache.get<Recipe[]>(cacheKey);
      if (cached) {
        return {
          data: cached,
          source: 'cache',
          cached: true,
          timestamp: new Date(),
          loadTime: Date.now() - startTime,
        };
      }
    }

    // Determine data source
    const source = options?.source || this.determineDataSource();
    
    try {
      let recipes: Recipe[] = [];

      switch (source) {
        case 'api':
          recipes = await this.loadRecipesFromApi();
          break;
        case 'mock':
          recipes = await this.loadRecipesFromMock();
          break;
        case 'json':
          recipes = await this.loadRecipesFromJson();
          break;
        case 'local_storage':
          recipes = await this.loadRecipesFromLocalStorage();
          break;
        default:
          recipes = await this.loadRecipesFromMock();
      }

      // Validate data
      const validationResults = DataValidator.batchValidate(recipes, DataValidator.validateRecipe);
      if (validationResults.totalInvalid > 0) {
        console.warn(`${validationResults.totalInvalid} invalid recipes found and filtered out`);
      }
      
      const validRecipes = validationResults.valid;

      // Transform and normalize data
      const normalizedRecipes = validRecipes.map(DataTransformer.normalizeRecipeData);

      // Cache the result
      if (this.config.enableCache) {
        this.cache.set(cacheKey, normalizedRecipes, this.config.cacheTimeout);
      }

      return {
        data: normalizedRecipes,
        source,
        cached: false,
        timestamp: new Date(),
        loadTime: Date.now() - startTime,
      };

    } catch (error) {
      console.error('Error loading recipes:', error);
      
      // Try fallback source
      if (source !== this.config.fallbackDataSource) {
        return this.loadRecipes({ ...options, source: this.config.fallbackDataSource });
      }
      
      throw error;
    }
  }

  /**
   * 📂 Load categories
   */
  async loadCategories(options?: {
    source?: DataSource;
    forceRefresh?: boolean;
    includeInactive?: boolean;
  }): Promise<LoadResult<Category[]>> {
    const startTime = Date.now();
    const cacheKey = `categories_${JSON.stringify(options || {})}`;
    
    // Check cache first
    if (this.config.enableCache && !options?.forceRefresh) {
      const cached = this.cache.get<Category[]>(cacheKey);
      if (cached) {
        return {
          data: cached,
          source: 'cache',
          cached: true,
          timestamp: new Date(),
          loadTime: Date.now() - startTime,
        };
      }
    }

    const source = options?.source || this.determineDataSource();
    
    try {
      let categories: Category[] = [];

      switch (source) {
        case 'api':
          categories = await this.loadCategoriesFromApi();
          break;
        case 'mock':
          categories = await this.loadCategoriesFromMock();
          break;
        case 'json':
          categories = await this.loadCategoriesFromJson();
          break;
        case 'local_storage':
          categories = await this.loadCategoriesFromLocalStorage();
          break;
        default:
          categories = await this.loadCategoriesFromMock();
      }

      // Validate data
      const validationResults = DataValidator.batchValidate(categories, DataValidator.validateCategory);
      const validCategories = validationResults.valid;

      // Cache the result
      if (this.config.enableCache) {
        this.cache.set(cacheKey, validCategories, this.config.cacheTimeout);
      }

      return {
        data: validCategories,
        source,
        cached: false,
        timestamp: new Date(),
        loadTime: Date.now() - startTime,
      };

    } catch (error) {
      console.error('Error loading categories:', error);
      
      if (source !== this.config.fallbackDataSource) {
        return this.loadCategories({ ...options, source: this.config.fallbackDataSource });
      }
      
      throw error;
    }
  }

  /**
   * 👥 Load users
   */
  async loadUsers(options?: {
    source?: DataSource;
    forceRefresh?: boolean;
  }): Promise<LoadResult<any[]>> {
    const startTime = Date.now();
    const cacheKey = `users_${JSON.stringify(options || {})}`;
    
    if (this.config.enableCache && !options?.forceRefresh) {
      const cached = this.cache.get<any[]>(cacheKey);
      if (cached) {
        return {
          data: cached,
          source: 'cache',
          cached: true,
          timestamp: new Date(),
          loadTime: Date.now() - startTime,
        };
      }
    }

    const source = options?.source || this.determineDataSource();
    
    try {
      let users: any[] = [];

      switch (source) {
        case 'api':
          users = await this.loadUsersFromApi();
          break;
        case 'mock':
          users = mockUsers;
          break;
        default:
          users = mockUsers;
      }

      if (this.config.enableCache) {
        this.cache.set(cacheKey, users, this.config.cacheTimeout);
      }

      return {
        data: users,
        source,
        cached: false,
        timestamp: new Date(),
        loadTime: Date.now() - startTime,
      };

    } catch (error) {
      console.error('Error loading users:', error);
      
      if (source !== this.config.fallbackDataSource) {
        return this.loadUsers({ ...options, source: this.config.fallbackDataSource });
      }
      
      throw error;
    }
  }

  /**
   * 🥕 Load ingredients
   */
  async loadIngredients(): Promise<LoadResult<any[]>> {
    const startTime = Date.now();
    const cacheKey = 'ingredients';
    
    if (this.config.enableCache) {
      const cached = this.cache.get<any[]>(cacheKey);
      if (cached) {
        return {
          data: cached,
          source: 'cache',
          cached: true,
          timestamp: new Date(),
          loadTime: Date.now() - startTime,
        };
      }
    }

    try {
      const ingredients = ingredientsJson.ingredients;

      if (this.config.enableCache) {
        this.cache.set(cacheKey, ingredients, this.config.cacheTimeout);
      }

      return {
        data: ingredients,
        source: 'json',
        cached: false,
        timestamp: new Date(),
        loadTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('Error loading ingredients:', error);
      throw error;
    }
  }

  /**
   * 📊 Load nutritional data
   */
  async loadNutritionalData(): Promise<LoadResult<any>> {
    const startTime = Date.now();
    const cacheKey = 'nutritional_data';
    
    if (this.config.enableCache) {
      const cached = this.cache.get<any>(cacheKey);
      if (cached) {
        return {
          data: cached,
          source: 'cache',
          cached: true,
          timestamp: new Date(),
          loadTime: Date.now() - startTime,
        };
      }
    }

    try {
      const nutritionalData = nutritionalJson;

      if (this.config.enableCache) {
        this.cache.set(cacheKey, nutritionalData, this.config.cacheTimeout);
      }

      return {
        data: nutritionalData,
        source: 'json',
        cached: false,
        timestamp: new Date(),
        loadTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('Error loading nutritional data:', error);
      throw error;
    }
  }

  // Private methods for loading from different sources

  private async loadRecipesFromApi(): Promise<Recipe[]> {
    // Simulated API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!this.networkState.isConnected) {
      throw new Error('No network connection');
    }
    
    // In a real app, this would be an actual API call
    return mockRecipes;
  }

  private async loadRecipesFromMock(): Promise<Recipe[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockRecipes;
  }

  private async loadRecipesFromJson(): Promise<Recipe[]> {
    try {
      return recipesJson.recipes.map(DataTransformer.transformApiRecipeToInternal);
    } catch (error) {
      console.warn('Error loading from JSON, falling back to mock data');
      return mockRecipes;
    }
  }

  private async loadRecipesFromLocalStorage(): Promise<Recipe[]> {
    try {
      const stored = localStorage.getItem('recipes');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Error loading from localStorage:', error);
    }
    return [];
  }

  private async loadCategoriesFromApi(): Promise<Category[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!this.networkState.isConnected) {
      throw new Error('No network connection');
    }
    
    return mockCategories;
  }

  private async loadCategoriesFromMock(): Promise<Category[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockCategories;
  }

  private async loadCategoriesFromJson(): Promise<Category[]> {
    try {
      return categoriesJson.categories.map(DataTransformer.transformApiCategoryToInternal);
    } catch (error) {
      console.warn('Error loading categories from JSON, falling back to mock data');
      return mockCategories;
    }
  }

  private async loadCategoriesFromLocalStorage(): Promise<Category[]> {
    try {
      const stored = localStorage.getItem('categories');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Error loading categories from localStorage:', error);
    }
    return [];
  }

  private async loadUsersFromApi(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    if (!this.networkState.isConnected) {
      throw new Error('No network connection');
    }
    
    return mockUsers;
  }

  private determineDataSource(): DataSource {
    if (!this.networkState.isConnected) {
      return 'mock';
    }
    return this.config.preferredDataSource;
  }

  /**
   * 🔄 Update network state
   */
  updateNetworkState(state: Partial<NetworkState>): void {
    this.networkState = { ...this.networkState, ...state };
  }

  /**
   * 🧹 Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 📊 Get cache stats
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * ⚙️ Update configuration
   */
  updateConfig(config: Partial<LoaderConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 💾 Preload data
   */
  async preloadData(): Promise<{
    recipes: LoadResult<Recipe[]>;
    categories: LoadResult<Category[]>;
    users: LoadResult<any[]>;
  }> {
    try {
      const [recipes, categories, users] = await Promise.all([
        this.loadRecipes(),
        this.loadCategories(),
        this.loadUsers(),
      ]);

      return { recipes, categories, users };
    } catch (error) {
      console.error('Error preloading data:', error);
      throw error;
    }
  }

  /**
   * 🌱 Load sample data for development
   */
  async loadSampleData(): Promise<{
    recipes: Recipe[];
    categories: Category[];
  }> {
    const seededData = DataSeeder.seedAllData({
      recipes: { count: 20, withImages: true, withNutrition: true, withRatings: true },
      categories: { count: 15, maxDepth: 2, withImages: true },
    });

    // Cache the sample data
    if (this.config.enableCache) {
      this.cache.set('recipes_sample', seededData.recipes, this.config.cacheTimeout);
      this.cache.set('categories_sample', seededData.categories, this.config.cacheTimeout);
    }

    return seededData;
  }
}

// Export singleton instance
export const dataLoader = new DataLoader();

export { DataLoader, CacheManager };
export default dataLoader;