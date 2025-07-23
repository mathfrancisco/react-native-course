/**
 * 🧠 Recipe Memoization - Sistema de Memoização de Receitas
 * 
 * Sistema avançado de memoização para otimizar performance das operações
 * com receitas, incluindo cache inteligente e invalidação automática.
 * 
 * @author RecipeApp Team
 * @since Fase 3 - Implementation Layer
 */

import { Recipe } from '../../../core/entities/interface/Recipe';
import { Category } from '../../../core/entities/interface/Category';
import React from 'react';

/**
 * 🎯 Configurações de memoização
 */
interface MemoConfig {
  maxCacheSize: number;
  ttl: number; // Time to live em ms
  enableDeepCompare: boolean;
  enableMetrics: boolean;
  autoCleanup: boolean;
  cleanupInterval: number; // Intervalo de limpeza em ms
}

/**
 * 📊 Entrada do cache
 */
interface CacheEntry<T> {
  value: T;
  timestamp: number;
  accessCount: number;
  lastAccess: number;
  size: number; // Tamanho estimado em bytes
  tags: string[]; // Tags para invalidação
}

/**
 * 🔑 Chave de cache
 */
interface CacheKey {
  operation: string;
  params: any[];
  hash: string;
}

/**
 * 📈 Métricas de performance
 */
interface MemoMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  totalOperations: number;
  averageExecutionTime: number;
  cacheSize: number;
  memoryUsage: number;
  invalidations: number;
  evictions: number;
}

/**
 * 🧠 Classe principal de memoização
 */
export class RecipeMemo {
  private static instance: RecipeMemo;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private metrics: MemoMetrics;
  private config: MemoConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;

  private constructor(config: Partial<MemoConfig> = {}) {
    this.config = {
      maxCacheSize: 200, // 200 entradas
      ttl: 30 * 60 * 1000, // 30 minutos
      enableDeepCompare: true,
      enableMetrics: true,
      autoCleanup: true,
      cleanupInterval: 5 * 60 * 1000, // 5 minutos
      ...config,
    };

    this.metrics = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalOperations: 0,
      averageExecutionTime: 0,
      cacheSize: 0,
      memoryUsage: 0,
      invalidations: 0,
      evictions: 0,
    };

    if (this.config.autoCleanup) {
      this.startCleanupTimer();
    }
  }

  /**
   * 🏭 Singleton Pattern
   */
  static getInstance(config?: Partial<MemoConfig>): RecipeMemo {
    if (!RecipeMemo.instance) {
      RecipeMemo.instance = new RecipeMemo(config);
    }
    return RecipeMemo.instance;
  }

  /**
   * 🔄 Memoiza uma função
   */
  memoize<T extends (...args: any[]) => any>(
    fn: T,
    options: {
      key?: string;
      ttl?: number;
      tags?: string[];
      serialize?: boolean;
    } = {}
  ): T {
    const {
      key = fn.name || 'anonymous',
      ttl = this.config.ttl,
      tags = [],
      serialize = true,
    } = options;

    const memoizedFn = ((...args: Parameters<T>): ReturnType<T> => {
      const startTime = Date.now();
      const cacheKey = this.generateCacheKey(key, args);
      
      // Verifica cache
      const cached = this.get<ReturnType<T>>(cacheKey.hash);
      if (cached !== null) {
        this.recordHit();
        return cached;
      }

      // Executa função original
      this.recordMiss();
      const result = fn(...args);
      
      // Armazena no cache
      this.set(cacheKey.hash, result, {
        ttl,
        tags,
        size: serialize ? this.estimateSize(result) : 0,
      });

      const executionTime = Date.now() - startTime;
      this.updateExecutionTime(executionTime);

      return result;
    }) as T;

    // Adiciona métodos de controle
    (memoizedFn as any).clearCache = () => this.clearByTag(key);
    (memoizedFn as any).invalidate = (...args: any[]) => {
      const cacheKey = this.generateCacheKey(key, args);
      this.delete(cacheKey.hash);
    };

    return memoizedFn;
  }

  /**
   * 📦 Memoização específica para receitas
   */
  static memoizeRecipeOperation = <T extends (...args: any[]) => any>(
    operation: T,
    operationName: string
  ): T => {
    const memo = RecipeMemo.getInstance();
    return memo.memoize(operation, {
      key: `recipe_${operationName}`,
      tags: ['recipes'],
      ttl: 15 * 60 * 1000, // 15 minutos para operações de receitas
    });
  };

  /**
   * 🔍 Operações de receitas memoizadas
   */

  // Busca de receita por ID
  static getRecipeById = RecipeMemo.memoizeRecipeOperation(
    (recipes: Recipe[], id: string): Recipe | undefined => {
      return recipes.find(recipe => recipe.id === id);
    },
    'getById'
  );

  // Filtro por categoria
  static getRecipesByCategory = RecipeMemo.memoizeRecipeOperation(
    (recipes: Recipe[], categoryId: string): Recipe[] => {
      return recipes.filter(recipe => recipe.categoryId === categoryId);
    },
    'getByCategory'
  );

  // Filtro por dificuldade
  static getRecipesByDifficulty = RecipeMemo.memoizeRecipeOperation(
    (recipes: Recipe[], difficulty: string): Recipe[] => {
      return recipes.filter(recipe => recipe.difficulty === difficulty);
    },
    'getByDifficulty'
  );

  // Filtro por tempo de preparo
  static getRecipesByPrepTime = RecipeMemo.memoizeRecipeOperation(
    (recipes: Recipe[], maxPrepTime: number): Recipe[] => {
      return recipes.filter(recipe => recipe.prepTime <= maxPrepTime);
    },
    'getByPrepTime'
  );

  // Busca por texto
  static searchRecipes = RecipeMemo.memoizeRecipeOperation(
    (recipes: Recipe[], query: string): Recipe[] => {
      const searchTerm = query.toLowerCase().trim();
      if (!searchTerm) return [];

      return recipes.filter(recipe => {
        const titleMatch = recipe.title.toLowerCase().includes(searchTerm);
        const descriptionMatch = recipe.description?.toLowerCase().includes(searchTerm);
        const tagsMatch = recipe.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm)
        );
        const ingredientsMatch = recipe.ingredients.some(ingredient => 
          ingredient.name.toLowerCase().includes(searchTerm)
        );

        return titleMatch || descriptionMatch || tagsMatch || ingredientsMatch;
      });
    },
    'search'
  );

  // Ordenação por rating
  static sortRecipesByRating = RecipeMemo.memoizeRecipeOperation(
    (recipes: Recipe[], ascending = false): Recipe[] => {
      return [...recipes].sort((a, b) => 
        ascending ? a.rating - b.rating : b.rating - a.rating
      );
    },
    'sortByRating'
  );

  // Filtragem complexa
  static filterRecipes = RecipeMemo.memoizeRecipeOperation(
    (
      recipes: Recipe[], 
      filters: {
        categoryId?: string;
        difficulty?: string;
        maxPrepTime?: number;
        maxCookTime?: number;
        minRating?: number;
        tags?: string[];
      }
    ): Recipe[] => {
      return recipes.filter(recipe => {
        if (filters.categoryId && recipe.categoryId !== filters.categoryId) {
          return false;
        }
        
        if (filters.difficulty && recipe.difficulty !== filters.difficulty) {
          return false;
        }
        
        if (filters.maxPrepTime && recipe.prepTime > filters.maxPrepTime) {
          return false;
        }
        
        if (filters.maxCookTime && recipe.cookTime > filters.maxCookTime) {
          return false;
        }
        
        if (filters.minRating && recipe.rating < filters.minRating) {
          return false;
        }
        
        if (filters.tags && filters.tags.length > 0) {
          const hasTag = filters.tags.some(tag => recipe.tags.includes(tag));
          if (!hasTag) return false;
        }
        
        return true;
      });
    },
    'filter'
  );

  // Estatísticas de receitas
  static getRecipeStats = RecipeMemo.memoizeRecipeOperation(
    (recipes: Recipe[]) => {
      const totalRecipes = recipes.length;
      const avgRating = recipes.reduce((sum, r) => sum + r.rating, 0) / totalRecipes;
      const avgPrepTime = recipes.reduce((sum, r) => sum + r.prepTime, 0) / totalRecipes;
      const avgCookTime = recipes.reduce((sum, r) => sum + r.cookTime, 0) / totalRecipes;
      
      const difficultyCount = recipes.reduce((acc, recipe) => {
        acc[recipe.difficulty] = (acc[recipe.difficulty] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const categoryCount = recipes.reduce((acc, recipe) => {
        acc[recipe.categoryId] = (acc[recipe.categoryId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalRecipes,
        avgRating: Math.round(avgRating * 100) / 100,
        avgPrepTime: Math.round(avgPrepTime),
        avgCookTime: Math.round(avgCookTime),
        difficultyDistribution: difficultyCount,
        categoryDistribution: categoryCount,
      };
    },
    'stats'
  );

  /**
   * 📂 Operações de categorias memoizadas
   */
  static getCategoryById = RecipeMemo.memoizeRecipeOperation(
    (categories: Category[], id: string): Category | undefined => {
      return categories.find(category => category.id === id);
    },
    'category_getById'
  );

  static getCategoriesByParent = RecipeMemo.memoizeRecipeOperation(
    (categories: Category[], parentId?: string): Category[] => {
      return categories.filter(category => category.parentId === parentId);
    },
    'category_getByParent'
  );

  /**
   * 🔧 Métodos privados de cache
   */

  private generateCacheKey(operation: string, args: any[]): CacheKey {
    const serializedArgs = this.config.enableDeepCompare 
      ? JSON.stringify(args)
      : args.map(arg => String(arg)).join('|');
    
    const hash = this.simpleHash(`${operation}:${serializedArgs}`);
    
    return {
      operation,
      params: args,
      hash,
    };
  }

  private get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Verifica expiração
    if (Date.now() - entry.timestamp > this.config.ttl) {
      this.delete(key);
      return null;
    }
    
    // Atualiza estatísticas de acesso
    entry.accessCount++;
    entry.lastAccess = Date.now();
    
    return entry.value;
  }

  private set<T>(
    key: string, 
    value: T, 
    options: { ttl?: number; tags?: string[]; size?: number } = {}
  ): void {
    const { ttl = this.config.ttl, tags = [], size = 0 } = options;
    
    // Remove entrada existente se houver
    if (this.cache.has(key)) {
      this.delete(key);
    }
    
    // Verifica limite de cache
    if (this.cache.size >= this.config.maxCacheSize) {
      this.evictLeastUsed();
    }
    
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccess: Date.now(),
      size,
      tags,
    };
    
    this.cache.set(key, entry);
    this.updateCacheMetrics();
  }

  private delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.updateCacheMetrics();
    }
    return deleted;
  }

  private evictLeastUsed(): void {
    let leastUsedKey = '';
    let leastUsedCount = Infinity;
    let oldestAccess = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessCount < leastUsedCount || 
          (entry.accessCount === leastUsedCount && entry.lastAccess < oldestAccess)) {
        leastUsedKey = key;
        leastUsedCount = entry.accessCount;
        oldestAccess = entry.lastAccess;
      }
    }
    
    if (leastUsedKey) {
      this.delete(leastUsedKey);
      this.metrics.evictions++;
    }
  }

  private clearByTag(tag: string): number {
    let deletedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.delete(key);
        deletedCount++;
      }
    }
    
    this.metrics.invalidations += deletedCount;
    return deletedCount;
  }

  private estimateSize(obj: any): number {
    try {
      return JSON.stringify(obj).length * 2; // Estimativa rough em bytes
    } catch {
      return 0;
    }
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private recordHit(): void {
    if (this.config.enableMetrics) {
      this.metrics.hits++;
      this.updateHitRate();
    }
  }

  private recordMiss(): void {
    if (this.config.enableMetrics) {
      this.metrics.misses++;
      this.updateHitRate();
    }
  }

  private updateHitRate(): void {
    this.metrics.totalOperations = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = this.metrics.totalOperations > 0 
      ? (this.metrics.hits / this.metrics.totalOperations) * 100 
      : 0;
  }

  private updateExecutionTime(time: number): void {
    const total = this.metrics.averageExecutionTime * (this.metrics.totalOperations - 1);
    this.metrics.averageExecutionTime = (total + time) / this.metrics.totalOperations;
  }

  private updateCacheMetrics(): void {
    this.metrics.cacheSize = this.cache.size;
    this.metrics.memoryUsage = Array.from(this.cache.values())
      .reduce((total, entry) => total + entry.size, 0);
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.config.ttl) {
        this.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 [RecipeMemo] Limpeza automática: ${cleanedCount} entradas removidas`);
    }
  }

  /**
   * 📊 Métodos públicos de controle
   */

  /**
   * 📈 Obtém métricas
   */
  getMetrics(): MemoMetrics {
    return { ...this.metrics };
  }

  /**
   * 🧹 Limpa cache por tag
   */
  invalidateByTag(tag: string): number {
    return this.clearByTag(tag);
  }

  /**
   * 🧹 Limpa todo o cache
   */
  clearAll(): void {
    this.cache.clear();
    this.metrics = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalOperations: 0,
      averageExecutionTime: 0,
      cacheSize: 0,
      memoryUsage: 0,
      invalidations: 0,
      evictions: 0,
    };
    console.log('🧹 [RecipeMemo] Cache completamente limpo');
  }

  /**
   * ⚙️ Atualiza configurações
   */
  updateConfig(newConfig: Partial<MemoConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Reinicia timer de limpeza se necessário
    if (newConfig.autoCleanup !== undefined || newConfig.cleanupInterval !== undefined) {
      if (this.cleanupTimer) {
        clearInterval(this.cleanupTimer);
        this.cleanupTimer = null;
      }
      
      if (this.config.autoCleanup) {
        this.startCleanupTimer();
      }
    }
  }

  /**
   * 🔍 Debug info
   */
  getDebugInfo(): any {
    return {
      config: this.config,
      metrics: this.metrics,
      cacheKeys: Array.from(this.cache.keys()),
      memoryBreakdown: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        size: entry.size,
        accessCount: entry.accessCount,
        age: Date.now() - entry.timestamp,
        tags: entry.tags,
      })),
    };
  }

  /**
   * 🔄 Cleanup no destroy
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clearAll();
  }
}

/**
 * 🎯 Instância global para uso conveniente
 */
export const recipeMemo = RecipeMemo.getInstance();

/**
 * 🪝 Hook React para usar memoização
 */
export const useMemoizedRecipeOperation = <T extends any[], R>(
  operation: (...args: T) => R,
  operationName: string,
  deps: React.DependencyList = []
): ((...args: T) => R) => {
  const memoizedOperation = React.useMemo(() => {
    return RecipeMemo.memoizeRecipeOperation(operation, operationName);
  }, deps);

  return memoizedOperation;
};

/**
 * 🧹 Hook para invalidação de cache
 */
export const useCacheInvalidation = () => {
  const invalidateRecipes = React.useCallback(() => {
    recipeMemo.invalidateByTag('recipes');
  }, []);

  const invalidateCategories = React.useCallback(() => {
    recipeMemo.invalidateByTag('categories');
  }, []);

  const invalidateAll = React.useCallback(() => {
    recipeMemo.clearAll();
  }, []);

  return {
    invalidateRecipes,
    invalidateCategories,
    invalidateAll,
    getMetrics: () => recipeMemo.getMetrics(),
  };
};