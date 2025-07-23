/**
 * 🍳 Recipe Storage - Storage Específico de Receitas
 * 
 * Implementação especializada para gerenciar receitas no storage,
 * com cache otimizado e operações específicas de receitas.
 * 
 * @author RecipeApp Team
 * @since Fase 3 - Implementation Layer
 */

import { Recipe } from '../../../core/entities/interface/Recipe';
import { StorageManager } from './StorageManager';
import { IRecipeStorage, StorageResult, StorageOptions } from '../interface/IStorage';
import { STORAGE_KEYS } from '../interface/StorageTypes';

/**
 * 🎯 Configurações específicas para receitas
 */
interface RecipeStorageConfig {
  cacheTimeout: number;
  maxRecipes: number;
  enableCompression: boolean;
  enableSearchIndex: boolean;
  batchSize: number;
}

/**
 * 📊 Estatísticas do storage de receitas
 */
interface RecipeStorageStats {
  totalRecipes: number;
  cacheHitRate: number;
  averageRecipeSize: number;
  storageUsage: number;
  lastIndexUpdate: Date | null;
  searchIndexSize: number;
}

/**
 * 🍳 Recipe Storage Implementation
 */
export class RecipeStorage implements IRecipeStorage {
  private static instance: RecipeStorage;
  private storageManager: StorageManager;
  private config: RecipeStorageConfig;
  
  // Cache em memória para acesso rápido
  private recipeCache: Map<string, { recipe: Recipe; timestamp: number }> = new Map();
  private listCache: { recipes: Recipe[]; timestamp: number } | null = null;
  
  // Índice de busca para performance
  private searchIndex: Map<string, Set<string>> = new Map();
  private isIndexBuilt: boolean = false;

  private constructor(config: Partial<RecipeStorageConfig> = {}) {
    this.config = {
      cacheTimeout: 30 * 60 * 1000, // 30 minutos
      maxRecipes: 1000,
      enableCompression: true,
      enableSearchIndex: true,
      batchSize: 50,
      ...config,
    };
    
    this.storageManager = StorageManager.getInstance();
  }

  /**
   * 🏭 Singleton Pattern
   */
  static getInstance(config?: Partial<RecipeStorageConfig>): RecipeStorage {
    if (!RecipeStorage.instance) {
      RecipeStorage.instance = new RecipeStorage(config);
    }
    return RecipeStorage.instance;
  }

  /**
   * 💾 Salva uma receita
   */
  async saveRecipe(recipe: Recipe, options: StorageOptions = {}): Promise<StorageResult<Recipe>> {
    try {
      const key = this.getRecipeKey(recipe.id);
      
      // Salva no storage principal
      const result = await this.storageManager.save(key, recipe, {
        ttl: this.config.cacheTimeout,
        compress: this.config.enableCompression,
        ...options,
      });
      
      if (result.success) {
        // Atualiza cache em memória
        this.updateRecipeCache(recipe);
        
        // Atualiza cache da lista se existir
        if (this.listCache) {
          const existingIndex = this.listCache.recipes.findIndex(r => r.id === recipe.id);
          if (existingIndex >= 0) {
            this.listCache.recipes[existingIndex] = recipe;
          } else {
            this.listCache.recipes.push(recipe);
          }
          this.listCache.timestamp = Date.now();
        }
        
        // Atualiza índice de busca
        if (this.config.enableSearchIndex) {
          this.updateSearchIndex(recipe);
        }
        
        console.log(`💾 Receita salva: ${recipe.title} (${recipe.id})`);
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Erro ao salvar receita:', error);
      return {
        success: false,
        data: recipe,
        source: 'storage',
        timestamp: Date.now(),
        fromCache: false,
        error: error as Error,
      };
    }
  }

  /**
   * 📖 Carrega uma receita por ID
   */
  async loadRecipe(id: string, options: StorageOptions = {}): Promise<StorageResult<Recipe | null>> {
    try {
      // 1. Verifica cache em memória primeiro
      if (options.useMemoryCache !== false) {
        const cached = this.getFromRecipeCache(id);
        if (cached) {
          return {
            success: true,
            data: cached,
            source: 'memory',
            timestamp: Date.now(),
            fromCache: true,
          };
        }
      }
      
      // 2. Carrega do storage
      const key = this.getRecipeKey(id);
      const result = await this.storageManager.load<Recipe>(key, options);
      
      if (result.success && result.data) {
        // Atualiza cache em memória
        this.updateRecipeCache(result.data);
        
        console.log(`📖 Receita carregada: ${result.data.title} (${id})`);
      }
      
      return result as StorageResult<Recipe | null>;
      
    } catch (error) {
      console.error('❌ Erro ao carregar receita:', error);
      return {
        success: false,
        data: null,
        source: 'storage',
        timestamp: Date.now(),
        fromCache: false,
        error: error as Error,
      };
    }
  }

  /**
   * 📚 Salva lista de receitas
   */
  async saveRecipeList(recipes: Recipe[], options: StorageOptions = {}): Promise<StorageResult<Recipe[]>> {
    try {
      console.log(`💾 Salvando ${recipes.length} receitas...`);
      
      // Salva lista completa
      const listResult = await this.storageManager.save(STORAGE_KEYS.RECIPES, recipes, {
        ttl: this.config.cacheTimeout,
        compress: this.config.enableCompression,
        ...options,
      });
      
      if (listResult.success) {
        // Atualiza cache da lista
        this.listCache = {
          recipes: [...recipes],
          timestamp: Date.now(),
        };
        
        // Atualiza cache individual para receitas mais acessadas
        const recentRecipes = recipes.slice(0, 20); // Primeiras 20
        recentRecipes.forEach(recipe => this.updateRecipeCache(recipe));
        
        // Reconstrói índice de busca
        if (this.config.enableSearchIndex) {
          await this.buildSearchIndex(recipes);
        }
        
        console.log(`✅ ${recipes.length} receitas salvas com sucesso`);
      }
      
      return listResult;
      
    } catch (error) {
      console.error('❌ Erro ao salvar lista de receitas:', error);
      return {
        success: false,
        data: recipes,
        source: 'storage',
        timestamp: Date.now(),
        fromCache: false,
        error: error as Error,
      };
    }
  }

  /**
   * 📖 Carrega lista de receitas
   */
  async loadRecipeList(options: StorageOptions = {}): Promise<StorageResult<Recipe[]>> {
    try {
      // 1. Verifica cache da lista primeiro
      if (options.useMemoryCache !== false && this.listCache && !options.forceRefresh) {
        const isExpired = (Date.now() - this.listCache.timestamp) > this.config.cacheTimeout;
        
        if (!isExpired) {
          console.log(`📖 Receitas carregadas do cache (${this.listCache.recipes.length})`);
          return {
            success: true,
            data: [...this.listCache.recipes],
            source: 'memory',
            timestamp: Date.now(),
            fromCache: true,
          };
        }
      }
      
      // 2. Carrega do storage
      const result = await this.storageManager.load<Recipe[]>(STORAGE_KEYS.RECIPES, options);
      
      if (result.success && result.data) {
        // Atualiza cache da lista
        this.listCache = {
          recipes: [...result.data],
          timestamp: Date.now(),
        };
        
        // Reconstrói índice se necessário
        if (this.config.enableSearchIndex && !this.isIndexBuilt) {
          await this.buildSearchIndex(result.data);
        }
        
        console.log(`📖 ${result.data.length} receitas carregadas do storage`);
      }
      
      return result as StorageResult<Recipe[]>;
      
    } catch (error) {
      console.error('❌ Erro ao carregar lista de receitas:', error);
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

  /**
   * 🗑️ Remove uma receita
   */
  async removeRecipe(id: string): Promise<StorageResult<boolean>> {
    try {
      const key = this.getRecipeKey(id);
      
      // Remove do storage
      const result = await this.storageManager.remove(key);
      
      if (result.success) {
        // Remove do cache em memória
        this.recipeCache.delete(id);
        
        // Remove do cache da lista
        if (this.listCache) {
          this.listCache.recipes = this.listCache.recipes.filter(r => r.id !== id);
          this.listCache.timestamp = Date.now();
        }
        
        // Remove do índice de busca
        this.removeFromSearchIndex(id);
        
        console.log(`🗑️ Receita removida: ${id}`);
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Erro ao remover receita:', error);
      return {
        success: false,
        data: false,
        source: 'storage',
        timestamp: Date.now(),
        fromCache: false,
        error: error as Error,
      };
    }
  }

  /**
   * 🔍 Busca receitas no índice local
   */
  async searchRecipes(query: string, options: StorageOptions = {}): Promise<StorageResult<Recipe[]>> {
    try {
      const searchTerm = query.toLowerCase().trim();
      
      if (!searchTerm) {
        return {
          success: true,
          data: [],
          source: 'memory',
          timestamp: Date.now(),
          fromCache: true,
        };
      }
      
      // Usa índice de busca se disponível
      if (this.config.enableSearchIndex && this.isIndexBuilt) {
        const matchingIds = this.searchInIndex(searchTerm);
        const recipes = await this.getRecipesByIds(Array.from(matchingIds));
        
        console.log(`🔍 Busca por "${query}": ${recipes.length} resultados (índice)`);
        
        return {
          success: true,
          data: recipes,
          source: 'memory',
          timestamp: Date.now(),
          fromCache: true,
          metadata: {
            searchMethod: 'index',
            totalTime: Date.now(),
          },
        };
      }
      
      // Busca na lista completa se índice não disponível
      const listResult = await this.loadRecipeList(options);
      
      if (!listResult.success) {
        throw new Error('Falha ao carregar receitas para busca');
      }
      
      const filteredRecipes = listResult.data.filter(recipe => {
        const titleMatch = recipe.title.toLowerCase().includes(searchTerm);
        const descriptionMatch = recipe.description?.toLowerCase().includes(searchTerm);
        const tagsMatch = recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        const ingredientsMatch = recipe.ingredients.some(ing => 
          ing.name.toLowerCase().includes(searchTerm)
        );
        
        return titleMatch || descriptionMatch || tagsMatch || ingredientsMatch;
      });
      
      console.log(`🔍 Busca por "${query}": ${filteredRecipes.length} resultados (lista)`);
      
      return {
        success: true,
        data: filteredRecipes,
        source: listResult.source,
        timestamp: Date.now(),
        fromCache: listResult.fromCache,
        metadata: {
          searchMethod: 'list',
          totalTime: Date.now(),
        },
      };
      
    } catch (error) {
      console.error('❌ Erro na busca de receitas:', error);
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

  /**
   * 📊 Obtém estatísticas do storage
   */
  async getStats(): Promise<RecipeStorageStats> {
    const recipes = this.listCache?.recipes || [];
    const totalSize = recipes.reduce((sum, recipe) => sum + JSON.stringify(recipe).length, 0);
    const averageSize = recipes.length > 0 ? totalSize / recipes.length : 0;
    
    return {
      totalRecipes: recipes.length,
      cacheHitRate: this.calculateCacheHitRate(),
      averageRecipeSize: Math.round(averageSize),
      storageUsage: totalSize,
      lastIndexUpdate: this.isIndexBuilt ? new Date() : null,
      searchIndexSize: this.searchIndex.size,
    };
  }

  /**
   * 🧹 Limpa cache
   */
  clearCache(): void {
    this.recipeCache.clear();
    this.listCache = null;
    this.searchIndex.clear();
    this.isIndexBuilt = false;
    console.log('🧹 Cache de receitas limpo');
  }

  /**
   * 🔧 Métodos privados
   */

  private getRecipeKey(id: string): string {
    return `${STORAGE_KEYS.APP_PREFIX}recipe_${id}`;
  }

  private updateRecipeCache(recipe: Recipe): void {
    // Remove itens mais antigos se necessário
    if (this.recipeCache.size >= 50) { // Limite de 50 receitas em cache
      const oldestKey = this.recipeCache.keys().next().value;
      if (oldestKey) {
        this.recipeCache.delete(oldestKey);
      }
    }
    
    this.recipeCache.set(recipe.id, {
      recipe,
      timestamp: Date.now(),
    });
  }

  private getFromRecipeCache(id: string): Recipe | null {
    const cached = this.recipeCache.get(id);
    
    if (!cached) return null;
    
    // Verifica expiração
    const isExpired = (Date.now() - cached.timestamp) > this.config.cacheTimeout;
    if (isExpired) {
      this.recipeCache.delete(id);
      return null;
    }
    
    return cached.recipe;
  }

  private async buildSearchIndex(recipes: Recipe[]): Promise<void> {
    console.log('🔍 Construindo índice de busca...');
    
    this.searchIndex.clear();
    
    recipes.forEach(recipe => {
      this.addToSearchIndex(recipe);
    });
    
    this.isIndexBuilt = true;
    console.log(`✅ Índice construído: ${this.searchIndex.size} termos únicos`);
  }

  private addToSearchIndex(recipe: Recipe): void {
    const terms = this.extractSearchTerms(recipe);
    
    terms.forEach(term => {
      if (!this.searchIndex.has(term)) {
        this.searchIndex.set(term, new Set());
      }
      this.searchIndex.get(term)!.add(recipe.id);
    });
  }

  private updateSearchIndex(recipe: Recipe): void {
    // Remove entrada antiga se existir
    this.removeFromSearchIndex(recipe.id);
    
    // Adiciona nova entrada
    this.addToSearchIndex(recipe);
  }

  private removeFromSearchIndex(recipeId: string): void {
    this.searchIndex.forEach((recipeIds, term) => {
      recipeIds.delete(recipeId);
      if (recipeIds.size === 0) {
        this.searchIndex.delete(term);
      }
    });
  }

  private extractSearchTerms(recipe: Recipe): string[] {
    const terms: string[] = [];
    
    // Título
    terms.push(...recipe.title.toLowerCase().split(/\s+/));
    
    // Descrição
    if (recipe.description) {
      terms.push(...recipe.description.toLowerCase().split(/\s+/));
    }
    
    // Tags
    terms.push(...recipe.tags.map(tag => tag.toLowerCase()));
    
    // Ingredientes
    recipe.ingredients.forEach(ingredient => {
      terms.push(...ingredient.name.toLowerCase().split(/\s+/));
    });
    
    // Remove termos muito curtos e duplicatas
    return [...new Set(terms.filter(term => term.length > 2))];
  }

  private searchInIndex(query: string): Set<string> {
    const matchingIds = new Set<string>();
    
    // Busca exata primeiro
    if (this.searchIndex.has(query)) {
      this.searchIndex.get(query)!.forEach(id => matchingIds.add(id));
    }
    
    // Busca parcial
    this.searchIndex.forEach((recipeIds, term) => {
      if (term.includes(query) || query.includes(term)) {
        recipeIds.forEach(id => matchingIds.add(id));
      }
    });
    
    return matchingIds;
  }

  private async getRecipesByIds(ids: string[]): Promise<Recipe[]> {
    const recipes: Recipe[] = [];
    
    for (const id of ids) {
      const cached = this.getFromRecipeCache(id);
      if (cached) {
        recipes.push(cached);
      } else if (this.listCache) {
        const recipe = this.listCache.recipes.find(r => r.id === id);
        if (recipe) {
          recipes.push(recipe);
          this.updateRecipeCache(recipe); // Adiciona ao cache
        }
      }
    }
    
    return recipes;
  }

  private calculateCacheHitRate(): number {
    // Implementação simples - em produção seria mais sofisticada
    return this.recipeCache.size > 0 ? 85 : 0; // Simula 85% de hit rate
  }
}