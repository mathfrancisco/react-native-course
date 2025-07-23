/**
 * 🗃️ Recipe Repository Implementation - Implementação Concreta do Repository de Receitas
 * 
 * Implementa o contrato IRecipeRepository com cache inteligente, storage local
 * e integração com o DataLoaderBridge existente.
 * 
 * @author RecipeApp Team
 * @since Fase 3 - Implementation Layer
 */

import { IRecipeRepository } from '../../../core/repositories/interface/IRecipeRepository';
import { Recipe } from '../../../core/entities/interface/Recipe';
import { StorageManager } from '../../storage/controller/StorageManager';
import { DataLoaderBridge } from '../../../business/bridges/controller/DataLoaderBridge';
import { RecipeDataAdapter } from '../../../business/adapters/controller/RecipeDataAdapter';
import { LoadingManager, LoadingPriority } from '../../storage/controller/LoadingManager';
import { PaginatedResult } from '../../../core/entities/interface/Common';
import { RecipeFilter } from '../../../core/entities/interface/Filter';


/**
 * 📊 Opções para operações do repository
 */
export interface RepositoryOptions {
  useCache?: boolean;
  forceRefresh?: boolean;
  timeout?: number;
  priority?: LoadingPriority;
  includeInactive?: boolean;
}

/**
 * 📈 Resultado de operações do repository
 */
export interface RepositoryResult<T> {
  success: boolean;
  data: T;
  source: 'cache' | 'storage' | 'loader' | 'memory';
  timestamp: number;
  fromCache: boolean;
  metadata?: {
    loadTime?: number;
    cacheHit?: boolean;
    totalItems?: number;
    filteredItems?: number;
  };
  error?: Error;
}

/**
 * 🎯 Configurações do repository
 */
interface RepositoryConfig {
  cacheTimeout: number;
  maxCacheSize: number;
  enableMetrics: boolean;
  defaultOptions: RepositoryOptions;
}

/**
 * 📊 Métricas do repository
 */
interface RepositoryMetrics {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  averageLoadTime: number;
  errorCount: number;
  lastError: Date | null;
}

/**
 * 🗃️ Implementação do Recipe Repository
 */
export class RecipeRepositoryImpl implements IRecipeRepository {
  private static instance: RecipeRepositoryImpl;
  
  private storageManager: StorageManager;
  private dataLoader: DataLoaderBridge;
  private loadingManager: LoadingManager;
  
  private memoryCache: Map<string, { data: Recipe; timestamp: number }> = new Map();
  private listCache: { data: Recipe[]; timestamp: number } | null = null;
  
  private config: RepositoryConfig;
  private metrics: RepositoryMetrics;
  
  private constructor(config: Partial<RepositoryConfig> = {}) {
    this.config = {
      cacheTimeout: 5 * 60 * 1000, // 5 minutos
      maxCacheSize: 100, // 100 receitas em memória
      enableMetrics: true,
      defaultOptions: {
        useCache: true,
        forceRefresh: false,
        timeout: 10000,
        priority: LoadingPriority.MEDIUM,
        includeInactive: false,
      },
      ...config,
    };
    
    this.metrics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageLoadTime: 0,
      errorCount: 0,
      lastError: null,
    };
    
    this.storageManager = StorageManager.getInstance();
    this.dataLoader = DataLoaderBridge.getInstance();
    this.loadingManager = LoadingManager.getInstance();
  }
    getAll(): Promise<Recipe[]> {
        throw new Error('Method not implemented.');
    }
    getById(id: string): Promise<Recipe | null> {
        throw new Error('Method not implemented.');
    }
    save(recipe: Recipe): Promise<void> {
        throw new Error('Method not implemented.');
    }
    delete(id: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    getByCategory(categoryId: string): Promise<Recipe[]> {
        throw new Error('Method not implemented.');
    }
    getByIds(ids: string[]): Promise<Recipe[]> {
        throw new Error('Method not implemented.');
    }
    search(query: string): Promise<Recipe[]> {
        throw new Error('Method not implemented.');
    }
    filter(filters: RecipeFilter): Promise<Recipe[]> {
        throw new Error('Method not implemented.');
    }
    getAllPaginated(page: number, pageSize: number): Promise<PaginatedResult<Recipe>> {
        throw new Error('Method not implemented.');
    }
    searchPaginated(query: string, page: number, pageSize: number): Promise<PaginatedResult<Recipe>> {
        throw new Error('Method not implemented.');
    }
    invalidateCache(): Promise<void> {
        throw new Error('Method not implemented.');
    }

  /**
   * 🏭 Singleton Pattern
   */
  static getInstance(config?: Partial<RepositoryConfig>): RecipeRepositoryImpl {
    if (!RecipeRepositoryImpl.instance) {
      RecipeRepositoryImpl.instance = new RecipeRepositoryImpl(config);
    }
    return RecipeRepositoryImpl.instance;
  }

  /**
   * 📖 Busca receita por ID
   */
  async getRecipeById(id: string, options: RepositoryOptions = {}): Promise<RepositoryResult<Recipe | null>> {
    const startTime = Date.now();
    const finalOptions = { ...this.config.defaultOptions, ...options };
    
    try {
      this.incrementMetric('totalRequests');
      
      // 1. Verifica cache de memória primeiro
      if (finalOptions.useCache && !finalOptions.forceRefresh) {
        const cached = this.getFromMemoryCache(id);
        if (cached) {
          this.incrementMetric('cacheHits');
          return this.createSuccessResult(cached, 'memory', startTime, true);
        }
      }

      // 2. Busca na lista completa
      const allRecipes = await this.getAllRecipes(finalOptions);
      if (!allRecipes.success) {
        return this.createErrorResult(allRecipes.error || new Error('Failed to load recipes'), startTime);
      }

      const recipe = allRecipes.data.find(r => r.id === id) || null;
      
      // 3. Adiciona ao cache se encontrou
      if (recipe && finalOptions.useCache) {
        this.addToMemoryCache(recipe);
      }

      this.incrementMetric(recipe ? 'cacheHits' : 'cacheMisses');
      
      return this.createSuccessResult(recipe, allRecipes.source, startTime, false);

    } catch (error) {
      this.handleError(error);
      return this.createErrorResult(error as Error, startTime);
    }
  }

  /**
   * 📚 Busca todas as receitas
   */
  async getAllRecipes(options: RepositoryOptions = {}): Promise<RepositoryResult<Recipe[]>> {
    const startTime = Date.now();
    const finalOptions = { ...this.config.defaultOptions, ...options };
    
    try {
      this.incrementMetric('totalRequests');
      
      // 1. Verifica cache de lista primeiro
      if (finalOptions.useCache && !finalOptions.forceRefresh && this.listCache) {
        const isExpired = (Date.now() - this.listCache.timestamp) > this.config.cacheTimeout;
        
        if (!isExpired) {
          this.incrementMetric('cacheHits');
          return this.createSuccessResult(this.listCache.data, 'cache', startTime, true);
        }
      }

      // 2. Tenta carregar do storage
      if (!finalOptions.forceRefresh) {
        const storageResult = await this.loadFromStorage();
        if (storageResult.success) {
          this.updateListCache(storageResult.data);
          this.incrementMetric('cacheHits');
          return this.createSuccessResult(storageResult.data, 'storage', startTime, false);
        }
      }

      // 3. Carrega via DataLoader
      const operationId = `load_recipes_${Date.now()}`;
      
      const recipes = await this.loadingManager.startOperation(
        operationId,
        'Load All Recipes',
        () => this.dataLoader.loadRecipes(),
        {
          priority: finalOptions.priority,
          timeout: finalOptions.timeout,
        }
      );

      // 4. Atualiza caches
      if (finalOptions.useCache) {
        this.updateListCache(recipes);
        await this.saveToStorage(recipes);
        
        // Atualiza cache de memória individual
        recipes.forEach(recipe => this.addToMemoryCache(recipe));
      }

      this.incrementMetric('cacheMisses');
      
      return this.createSuccessResult(recipes, 'loader', startTime, false);

    } catch (error) {
      this.handleError(error);
      return this.createErrorResult(error as Error, startTime);
    }
  }

  /**
   * 🔍 Busca receitas por critérios
   */
  async getRecipesByCategory(categoryId: string, options: RepositoryOptions = {}): Promise<RepositoryResult<Recipe[]>> {
    const startTime = Date.now();
    
    try {
      const allRecipes = await this.getAllRecipes(options);
      if (!allRecipes.success) {
        return this.createErrorResult(allRecipes.error || new Error('Failed to load recipes'), startTime);
      }

      const filteredRecipes = allRecipes.data.filter(recipe => recipe.categoryId === categoryId);
      
      return this.createSuccessResult(filteredRecipes, allRecipes.source, startTime, allRecipes.fromCache, {
        totalItems: allRecipes.data.length,
        filteredItems: filteredRecipes.length,
      });

    } catch (error) {
      this.handleError(error);
      return this.createErrorResult(error as Error, startTime);
    }
  }

  /**
   * 🔍 Busca receitas por texto
   */
  async searchRecipes(query: string, options: RepositoryOptions = {}): Promise<RepositoryResult<Recipe[]>> {
    const startTime = Date.now();
    
    try {
      if (!query.trim()) {
        return this.createSuccessResult([], 'memory', startTime, true);
      }

      // Busca usando DataLoader que já tem lógica de search
      const operationId = `search_recipes_${Date.now()}`;
      
      const searchResults = await this.loadingManager.startOperation(
        operationId,
        `Search Recipes: "${query}"`,
        () => this.dataLoader.searchRecipes(query),
        {
          priority: LoadingPriority.HIGH, // Busca tem prioridade alta
          timeout: options.timeout || 5000,
        }
      );

      return this.createSuccessResult(searchResults, 'loader', startTime, false, {
        filteredItems: searchResults.length,
      });

    } catch (error) {
      this.handleError(error);
      return this.createErrorResult(error as Error, startTime);
    }
  }

  /**
   * 🎯 Filtra receitas
   */
  async getRecipesByFilter(filters: Record<string, any>, options: RepositoryOptions = {}): Promise<RepositoryResult<Recipe[]>> {
    const startTime = Date.now();
    
    try {
      const allRecipes = await this.getAllRecipes(options);
      if (!allRecipes.success) {
        return this.createErrorResult(allRecipes.error || new Error('Failed to load recipes'), startTime);
      }

      // Converte para formato Shared para usar helpers
      const sharedRecipes = allRecipes.data.map(recipe => RecipeDataAdapter.coreToShared(recipe));
      
      // Aplica filtros usando helpers existentes
      let filtered = sharedRecipes;
      
      if (filters.difficulty) {
        filtered = filtered.filter(recipe => recipe.difficulty === filters.difficulty);
      }
      
      if (filters.maxPrepTime) {
        filtered = filtered.filter(recipe => recipe.prepTime <= filters.maxPrepTime);
      }
      
      if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter(recipe => 
          filters.tags.some((tag: string) => recipe.tags.includes(tag))
        );
      }

      // Converte de volta para Core
      const coreRecipes = RecipeDataAdapter.adaptRecipeList(filtered);
      
      return this.createSuccessResult(coreRecipes, allRecipes.source, startTime, allRecipes.fromCache, {
        totalItems: allRecipes.data.length,
        filteredItems: coreRecipes.length,
      });

    } catch (error) {
      this.handleError(error);
      return this.createErrorResult(error as Error, startTime);
    }
  }

  /**
   * 💾 Salva receita (para implementação futura)
   */
  async saveRecipe(recipe: Recipe, options: RepositoryOptions = {}): Promise<RepositoryResult<Recipe>> {
    const startTime = Date.now();
    
    try {
      // TODO: Implementar lógica de salvamento quando tiver backend
      
      // Por agora, apenas atualiza cache
      if (options.useCache !== false) {
        this.addToMemoryCache(recipe);
        
        // Atualiza lista cache se existir
        if (this.listCache) {
          const existingIndex = this.listCache.data.findIndex(r => r.id === recipe.id);
          if (existingIndex >= 0) {
            this.listCache.data[existingIndex] = recipe;
          } else {
            this.listCache.data.push(recipe);
          }
          this.listCache.timestamp = Date.now();
        }
      }

      return this.createSuccessResult(recipe, 'memory', startTime, false);

    } catch (error) {
      this.handleError(error);
      return this.createErrorResult(error as Error, startTime);
    }
  }

  /**
   * 🗑️ Remove receita (para implementação futura)
   */
  async deleteRecipe(id: string, options: RepositoryOptions = {}): Promise<RepositoryResult<boolean>> {
    const startTime = Date.now();
    
    try {
      // TODO: Implementar lógica de remoção quando tiver backend
      
      // Por agora, apenas remove do cache
      this.memoryCache.delete(id);
      
      if (this.listCache) {
        this.listCache.data = this.listCache.data.filter(r => r.id !== id);
        this.listCache.timestamp = Date.now();
      }

      return this.createSuccessResult(true, 'memory', startTime, false);

    } catch (error) {
      this.handleError(error);
      return this.createErrorResult(error as Error, startTime);
    }
  }

  /**
   * 🔄 Atualiza cache
   */
  async refreshCache(): Promise<void> {
    try {
      console.log('🔄 Atualizando cache do RecipeRepository...');
      
      // Limpa caches
      this.memoryCache.clear();
      this.listCache = null;
      
      // Recarrega dados
      await this.getAllRecipes({ forceRefresh: true });
      
      console.log('✅ Cache do RecipeRepository atualizado');
      
    } catch (error) {
      console.error('❌ Erro ao atualizar cache:', error);
    }
  }

  /**
   * 📊 Obtém métricas
   */
  getMetrics(): RepositoryMetrics {
    return { ...this.metrics };
  }

  /**
   * 🧹 Limpa cache
   */
  clearCache(): void {
    this.memoryCache.clear();
    this.listCache = null;
    console.log('🧹 Cache do RecipeRepository limpo');
  }

  /**
   * 🔧 Métodos privados auxiliares
   */

  private getFromMemoryCache(id: string): Recipe | null {
    const cached = this.memoryCache.get(id);
    if (!cached) return null;
    
    // Verifica expiração
    const isExpired = (Date.now() - cached.timestamp) > this.config.cacheTimeout;
    if (isExpired) {
      this.memoryCache.delete(id);
      return null;
    }
    
    return cached.data;
  }

  private addToMemoryCache(recipe: Recipe): void {
    // Remove itens mais antigos se exceder o limite
    if (this.memoryCache.size >= this.config.maxCacheSize) {
      const oldestKey = this.memoryCache.keys().next().value;
      if (oldestKey) {
        this.memoryCache.delete(oldestKey);
      }
    }
    
    this.memoryCache.set(recipe.id, {
      data: recipe,
      timestamp: Date.now(),
    });
  }

  private updateListCache(recipes: Recipe[]): void {
    this.listCache = {
      data: recipes,
      timestamp: Date.now(),
    };
  }

  private async loadFromStorage(): Promise<RepositoryResult<Recipe[]>> {
    try {
      const result = await this.storageManager.load<Recipe[]>('recipes_cache');
      
      if (result.success) {
        return {
          success: true,
          data: result.data,
          source: 'storage',
          timestamp: result.timestamp,
          fromCache: true,
        };
      }
      
      return {
        success: false,
        data: [],
        source: 'storage',
        timestamp: Date.now(),
        fromCache: false,
        error: result.error,
      };
      
    } catch (error) {
      return {
        success: false,
        data: [],
        source: 'storage',
        timestamp: Date.now(),
        fromCache: false,
        error: error as Error,
      };
    }
  }

  private async saveToStorage(recipes: Recipe[]): Promise<void> {
    try {
      await this.storageManager.save('recipes_cache', recipes, {
        ttl: 24 * 60 * 60 * 1000, // 24 horas
      });
    } catch (error) {
      console.warn('⚠️ Falha ao salvar receitas no storage:', error);
    }
  }

  private createSuccessResult<T>(
    data: T,
    source: 'cache' | 'storage' | 'loader' | 'memory',
    startTime: number,
    fromCache: boolean,
    additionalMetadata?: Record<string, any>
  ): RepositoryResult<T> {
    const loadTime = Date.now() - startTime;
    this.updateAverageLoadTime(loadTime);
    
    return {
      success: true,
      data,
      source,
      timestamp: Date.now(),
      fromCache,
      metadata: {
        loadTime,
        cacheHit: fromCache,
        ...additionalMetadata,
      },
    };
  }

  private createErrorResult<T>(error: Error, startTime: number): RepositoryResult<T> {
    const loadTime = Date.now() - startTime;
    
    return {
      success: false,
      data: null as any,
      source: 'memory',
      timestamp: Date.now(),
      fromCache: false,
      metadata: {
        loadTime,
        cacheHit: false,
      },
      error,
    };
  }

  private incrementMetric(metric: keyof RepositoryMetrics): void {
    if (!this.config.enableMetrics) return;
    
    if (typeof this.metrics[metric] === 'number') {
      (this.metrics[metric] as number)++;
    }
  }

  private updateAverageLoadTime(loadTime: number): void {
    if (!this.config.enableMetrics) return;
    
    const totalRequests = this.metrics.totalRequests;
    const currentAverage = this.metrics.averageLoadTime;
    
    this.metrics.averageLoadTime = (currentAverage * (totalRequests - 1) + loadTime) / totalRequests;
  }

  private handleError(error: any): void {
    if (!this.config.enableMetrics) return;
    
    this.metrics.errorCount++;
    this.metrics.lastError = new Date();
    
    console.error('❌ RecipeRepository Error:', error);
  }
}