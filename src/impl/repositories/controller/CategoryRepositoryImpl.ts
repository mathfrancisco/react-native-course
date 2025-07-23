/**
 * 📂 Category Repository Implementation - Repository de Categorias
 * 
 * Implementação concreta do repository de categorias com cache,
 * hierarquia e funcionalidades específicas de categorização.
 * 
 * @author RecipeApp Team
 * @since Fase 3 - Implementation Layer
 */

import { ICategoryRepository } from '../../../core/repositories/interface/ICategoryRepository';
import { Category } from '../../../core/entities/interface/Category';
import { StorageManager } from '../../storage/controller/StorageManager';
import { DataLoaderBridge } from '../../../business/bridges/controller/DataLoaderBridge';

import { STORAGE_KEYS } from '../../storage/interface/StorageTypes';
import { LoadingManager, LoadingPriority } from '../../storage/controller/LoadingManager';

/**
 * 🎯 Opções específicas para categorias
 */
interface CategoryOptions {
  includeInactive?: boolean;
  includeSubcategories?: boolean;
  maxDepth?: number;
  sortBy?: 'name' | 'order' | 'recipeCount';
  sortDirection?: 'asc' | 'desc';
}

/**
 * 📊 Resultado de operações de categoria
 */
interface CategoryResult<T> {
  success: boolean;
  data: T;
  source: 'cache' | 'storage' | 'loader' | 'memory';
  timestamp: number;
  fromCache: boolean;
  metadata?: {
    loadTime?: number;
    cacheHit?: boolean;
    totalCategories?: number;
    activeCategories?: number;
    hierarchyDepth?: number;
  };
  error?: Error;
}

/**
 * 🌳 Árvore de categorias para navegação hierárquica
 */
interface CategoryTree {
  category: Category;
  children: CategoryTree[];
  parent?: CategoryTree;
  depth: number;
  path: string[];
}

/**
 * 📈 Estatísticas de categorias
 */
interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  maxDepth: number;
  categoriesWithRecipes: number;
  avgRecipesPerCategory: number;
  topCategories: Array<{ category: Category; recipeCount: number }>;
  recentlyAdded: Category[];
}

/**
 * 📂 Category Repository Implementation
 */
export class CategoryRepositoryImpl implements ICategoryRepository {
  private static instance: CategoryRepositoryImpl;
  
  private storageManager: StorageManager;
  private dataLoader: DataLoaderBridge;
  private loadingManager: LoadingManager;
  
  // Cache em memória
  private categoriesCache: Map<string, Category> = new Map();
  private categoriesListCache: { categories: Category[]; timestamp: number } | null = null;
  private categoryTreeCache: CategoryTree[] | null = null;
  
  // Configurações
  private cacheTimeout: number = 60 * 60 * 1000; // 1 hora
  private maxCacheSize: number = 200;

  private constructor() {
    this.storageManager = StorageManager.getInstance();
    this.dataLoader = DataLoaderBridge.getInstance();
    this.loadingManager = LoadingManager.getInstance();
  }
    getAll(): Promise<Category[]> {
        throw new Error('Method not implemented.');
    }
    getById(id: string): Promise<Category | null> {
        throw new Error('Method not implemented.');
    }
    getBySlug(slug: string): Promise<Category | null> {
        throw new Error('Method not implemented.');
    }
    save(category: Category): Promise<void> {
        throw new Error('Method not implemented.');
    }
    delete(id: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    getActive(): Promise<Category[]> {
        throw new Error('Method not implemented.');
    }
    updateRecipeCount(categoryId: string, count: number): Promise<void> {
        throw new Error('Method not implemented.');
    }
    invalidateCache(): Promise<void> {
        throw new Error('Method not implemented.');
    }

  /**
   * 🏭 Singleton Pattern
   */
  static getInstance(): CategoryRepositoryImpl {
    if (!CategoryRepositoryImpl.instance) {
      CategoryRepositoryImpl.instance = new CategoryRepositoryImpl();
    }
    return CategoryRepositoryImpl.instance;
  }

  /**
   * 📖 Busca categoria por ID
   */
  async getCategoryById(id: string, options: CategoryOptions = {}): Promise<CategoryResult<Category | null>> {
    const startTime = Date.now();
    
    try {
      // 1. Verifica cache em memória
      const cached = this.categoriesCache.get(id);
      if (cached) {
        return this.createSuccessResult(cached, 'memory', startTime, true);
      }

      // 2. Busca na lista completa
      const allCategories = await this.getAllCategories(options);
      if (!allCategories.success) {
        return this.createErrorResult(allCategories.error || new Error('Failed to load categories'), startTime);
      }

      const category = allCategories.data.find(c => c.id === id) || null;
      
      // 3. Adiciona ao cache se encontrou
      if (category) {
        this.addToCache(category);
      }

      return this.createSuccessResult(category, allCategories.source, startTime, false);

    } catch (error) {
      return this.createErrorResult(error as Error, startTime);
    }
  }

  /**
   * 📚 Busca todas as categorias
   */
  async getAllCategories(options: CategoryOptions = {}): Promise<CategoryResult<Category[]>> {
    const startTime = Date.now();
    
    try {
      // 1. Verifica cache de lista
      if (this.categoriesListCache && !this.isCacheExpired(this.categoriesListCache.timestamp)) {
        let categories = [...this.categoriesListCache.categories];
        
        // Aplica filtros
        categories = this.applyFilters(categories, options);
        
        return this.createSuccessResult(categories, 'memory', startTime, true);
      }

      // 2. Tenta carregar do storage
      const storageResult = await this.loadFromStorage();
      if (storageResult.success) {
        this.updateListCache(storageResult.data);
        
        let categories = this.applyFilters(storageResult.data, options);
        return this.createSuccessResult(categories, 'storage', startTime, false);
      }

      // 3. Carrega via DataLoader
      const operationId = `load_categories_${Date.now()}`;
      
      const categories = await this.loadingManager.startOperation(
        operationId,
        'Load All Categories',
        () => this.dataLoader.loadCategories(),
        {
          priority: LoadingPriority.HIGH,
          timeout: 10000,
        }
      );

      // 4. Atualiza caches
      this.updateListCache(categories);
      await this.saveToStorage(categories);
      
      // Atualiza cache individual
      categories.forEach(category => this.addToCache(category));
      
      // Constrói árvore de categorias
      this.buildCategoryTree(categories);
      
      let filteredCategories = this.applyFilters(categories, options);
      
      return this.createSuccessResult(filteredCategories, 'loader', startTime, false);

    } catch (error) {
      return this.createErrorResult(error as Error, startTime);
    }
  }

  /**
   * 🌳 Obtém categorias em estrutura hierárquica
   */
  async getCategoryTree(options: CategoryOptions = {}): Promise<CategoryResult<CategoryTree[]>> {
    const startTime = Date.now();
    
    try {
      // Carrega todas as categorias primeiro
      const allCategoriesResult = await this.getAllCategories(options);
      if (!allCategoriesResult.success) {
        return this.createErrorResult(allCategoriesResult.error || new Error('Failed to load categories'), startTime);
      }

      // Usa cache da árvore se disponível
      if (this.categoryTreeCache) {
        const filteredTree = this.filterCategoryTree(this.categoryTreeCache, options);
        return this.createSuccessResult(filteredTree, 'memory', startTime, true);
      }

      // Constrói árvore
      const tree = this.buildCategoryTree(allCategoriesResult.data);
      const filteredTree = this.filterCategoryTree(tree, options);
      
      return this.createSuccessResult(filteredTree, allCategoriesResult.source, startTime, false);

    } catch (error) {
      return this.createErrorResult(error as Error, startTime);
    }
  }

  /**
   * 👨‍👩‍👧‍👦 Busca categorias filhas
   */
  async getChildCategories(parentId?: string, options: CategoryOptions = {}): Promise<CategoryResult<Category[]>> {
    const startTime = Date.now();
    
    try {
      const allCategoriesResult = await this.getAllCategories(options);
      if (!allCategoriesResult.success) {
        return this.createErrorResult(allCategoriesResult.error || new Error('Failed to load categories'), startTime);
      }

      const childCategories = allCategoriesResult.data.filter(category => 
        category.parentId === parentId
      );

      // Ordena por sortOrder se disponível
      childCategories.sort((a, b) => {
        if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
          return a.sortOrder - b.sortOrder;
        }
        return a.name.localeCompare(b.name);
      });

      return this.createSuccessResult(childCategories, allCategoriesResult.source, startTime, allCategoriesResult.fromCache);

    } catch (error) {
      return this.createErrorResult(error as Error, startTime);
    }
  }

  /**
   * 🔍 Busca categorias por critérios
   */
  async searchCategories(query: string, options: CategoryOptions = {}): Promise<CategoryResult<Category[]>> {
    const startTime = Date.now();
    
    try {
      if (!query.trim()) {
        return this.createSuccessResult([], 'memory', startTime, true);
      }

      const allCategoriesResult = await this.getAllCategories(options);
      if (!allCategoriesResult.success) {
        return this.createErrorResult(allCategoriesResult.error || new Error('Failed to load categories'), startTime);
      }

      const searchTerm = query.toLowerCase();
      const matchingCategories = allCategoriesResult.data.filter(category => {
        const nameMatch = category.name.toLowerCase().includes(searchTerm);
        const descriptionMatch = category.description?.toLowerCase().includes(searchTerm);
        const keywordsMatch = category.keywords?.some(keyword => 
          keyword.toLowerCase().includes(searchTerm)
        );
        
        return nameMatch || descriptionMatch || keywordsMatch;
      });

      return this.createSuccessResult(matchingCategories, allCategoriesResult.source, startTime, allCategoriesResult.fromCache);

    } catch (error) {
      return this.createErrorResult(error as Error, startTime);
    }
  }

  /**
   * 📊 Obtém estatísticas das categorias
   */
  async getCategoryStats(): Promise<CategoryStats> {
    try {
      const allCategoriesResult = await this.getAllCategories();
      
      if (!allCategoriesResult.success) {
        return this.getEmptyStats();
      }

      const categories = allCategoriesResult.data;
      const activeCategories = categories.filter(c => c.isActive);
      const maxDepth = Math.max(...categories.map(c => c.level || 0));
      const categoriesWithRecipes = categories.filter(c => (c.recipeCount || 0) > 0);
      
      const totalRecipes = categories.reduce((sum, c) => sum + (c.recipeCount || 0), 0);
      const avgRecipesPerCategory = categories.length > 0 ? totalRecipes / categories.length : 0;

      const topCategories = categories
        .filter(c => (c.recipeCount || 0) > 0)
        .sort((a, b) => (b.recipeCount || 0) - (a.recipeCount || 0))
        .slice(0, 5)
        .map(category => ({
          category,
          recipeCount: category.recipeCount || 0,
        }));

      const recentlyAdded = categories
        .filter(c => c.createdAt)
        .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
        .slice(0, 5);

      return {
        totalCategories: categories.length,
        activeCategories: activeCategories.length,
        maxDepth,
        categoriesWithRecipes: categoriesWithRecipes.length,
        avgRecipesPerCategory: Math.round(avgRecipesPerCategory * 100) / 100,
        topCategories,
        recentlyAdded,
      };

    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas:', error);
      return this.getEmptyStats();
    }
  }

  /**
   * 🔄 Atualiza cache
   */
  async refreshCache(): Promise<void> {
    try {
      console.log('🔄 Atualizando cache de categorias...');
      
      // Limpa caches
      this.categoriesCache.clear();
      this.categoriesListCache = null;
      this.categoryTreeCache = null;
      
      // Recarrega dados
      await this.getAllCategories({ includeInactive: false });
      
      console.log('✅ Cache de categorias atualizado');
      
    } catch (error) {
      console.error('❌ Erro ao atualizar cache:', error);
    }
  }

  /**
   * 🧹 Limpa cache
   */
  clearCache(): void {
    this.categoriesCache.clear();
    this.categoriesListCache = null;
    this.categoryTreeCache = null;
    console.log('🧹 Cache de categorias limpo');
  }

  /**
   * 🔧 Métodos privados
   */

  private addToCache(category: Category): void {
    // Remove itens mais antigos se exceder limite
    if (this.categoriesCache.size >= this.maxCacheSize) {
      const oldestKey = this.categoriesCache.keys().next().value;
      if (oldestKey) {
        this.categoriesCache.delete(oldestKey);
      }
    }
    
    this.categoriesCache.set(category.id, category);
  }

  private updateListCache(categories: Category[]): void {
    this.categoriesListCache = {
      categories: [...categories],
      timestamp: Date.now(),
    };
  }

  private isCacheExpired(timestamp: number): boolean {
    return (Date.now() - timestamp) > this.cacheTimeout;
  }

  private applyFilters(categories: Category[], options: CategoryOptions): Category[] {
    let filtered = [...categories];

    // Filtro de status ativo
    if (!options.includeInactive) {
      filtered = filtered.filter(c => c.isActive);
    }

    // Filtro de subcategorias
    if (!options.includeSubcategories) {
      filtered = filtered.filter(c => !c.parentId);
    }

    // Filtro de profundidade máxima
    if (options.maxDepth !== undefined) {
      filtered = filtered.filter(c => (c.level || 0) <= options.maxDepth!);
    }

    // Ordenação
    if (options.sortBy) {
      filtered.sort((a, b) => {
        let valueA: any, valueB: any;
        
        switch (options.sortBy) {
          case 'name':
            valueA = a.name;
            valueB = b.name;
            break;
          case 'order':
            valueA = a.sortOrder || 0;
            valueB = b.sortOrder || 0;
            break;
          case 'recipeCount':
            valueA = a.recipeCount || 0;
            valueB = b.recipeCount || 0;
            break;
          default:
            return 0;
        }
        
        const comparison = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        return options.sortDirection === 'desc' ? -comparison : comparison;
      });
    }

    return filtered;
  }

  private buildCategoryTree(categories: Category[]): CategoryTree[] {
    const categoryMap = new Map<string, CategoryTree>();
    const rootCategories: CategoryTree[] = [];

    // Cria nós da árvore
    categories.forEach(category => {
      const treeNode: CategoryTree = {
        category,
        children: [],
        depth: category.level || 0,
        path: category.path ? category.path.split('/') : [category.id],
      };
      categoryMap.set(category.id, treeNode);
    });

    // Constrói hierarquia
    categories.forEach(category => {
      const node = categoryMap.get(category.id)!;
      
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(node);
          node.parent = parent;
        }
      } else {
        rootCategories.push(node);
      }
    });

    // Ordena filhos por sortOrder
    const sortChildren = (nodes: CategoryTree[]) => {
      nodes.sort((a, b) => {
        const orderA = a.category.sortOrder || 0;
        const orderB = b.category.sortOrder || 0;
        return orderA - orderB;
      });
      
      nodes.forEach(node => sortChildren(node.children));
    };

    sortChildren(rootCategories);
    
    this.categoryTreeCache = rootCategories;
    return rootCategories;
  }

  private filterCategoryTree(tree: CategoryTree[], options: CategoryOptions): CategoryTree[] {
    return tree.filter(node => {
      // Aplica filtros
      if (!options.includeInactive && !node.category.isActive) {
        return false;
      }
      
      if (options.maxDepth !== undefined && node.depth > options.maxDepth) {
        return false;
      }
      
      // Filtra filhos recursivamente
      node.children = this.filterCategoryTree(node.children, options);
      
      return true;
    });
  }

  private async loadFromStorage(): Promise<CategoryResult<Category[]>> {
    try {
      const result = await this.storageManager.load<Category[]>(STORAGE_KEYS.CATEGORIES);
      
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

  private async saveToStorage(categories: Category[]): Promise<void> {
    try {
      await this.storageManager.save(STORAGE_KEYS.CATEGORIES, categories, {
        ttl: this.cacheTimeout,
      });
    } catch (error) {
      console.warn('⚠️ Falha ao salvar categorias no storage:', error);
    }
  }

  private createSuccessResult<T>(
    data: T,
    source: 'cache' | 'storage' | 'loader' | 'memory',
    startTime: number,
    fromCache: boolean,
    additionalMetadata?: Record<string, any>
  ): CategoryResult<T> {
    const loadTime = Date.now() - startTime;
    
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

  private createErrorResult<T>(error: Error, startTime: number): CategoryResult<T> {
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

  private getEmptyStats(): CategoryStats {
    return {
      totalCategories: 0,
      activeCategories: 0,
      maxDepth: 0,
      categoriesWithRecipes: 0,
      avgRecipesPerCategory: 0,
      topCategories: [],
      recentlyAdded: [],
    };
  }
}