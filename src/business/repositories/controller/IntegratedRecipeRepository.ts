import { 
  IRecipeRepository, 
  Recipe, 
  RecipeFilter, 
  PaginatedResult 
} from '../../../core/repositories';
import { IBaseRepository, RepositoryConfig } from '../interface/IBaseRepository';
import { CacheController } from '../../../core/repositories';
import { DataLoaderBridge } from '../../bridges/controller/DataLoaderBridge';
import { ValidationBridge } from '../../bridges/controller/ValidationBridge';
import { FilterController } from '../../../core/entities';

export class IntegratedRecipeRepository implements IRecipeRepository, IBaseRepository<Recipe> {
  private cache = new CacheController();
  private dataLoaderBridge = DataLoaderBridge.getInstance();
  private validationBridge = ValidationBridge.getInstance();
  
  private recipes: Recipe[] = [];
  private initialized = false;
  private lastSync: Date | null = null;
  
  // Configuração
  enableCache = true;
  cacheTimeout = 5 * 60 * 1000; // 5 minutos
  
  constructor(private config: RepositoryConfig) {}
  
  /**
   * 🚀 Inicialização integrada
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      console.log('🔄 Inicializando IntegratedRecipeRepository...');
      
      // Carrega receitas via Bridge
      const rawRecipes = await this.dataLoaderBridge.loadRecipes();
      
      // Valida usando ValidationBridge
      const validatedRecipes: Recipe[] = [];
      
      for (const recipe of rawRecipes) {
        const validation = this.validationBridge.validateRecipe(recipe);
        
        if (validation.isValid) {
          validatedRecipes.push(recipe);
        } else {
          console.warn(`❌ Receita inválida (${recipe.id}):`, validation.errors);
        }
      }
      
      this.recipes = validatedRecipes;
      this.lastSync = new Date();
      this.initialized = true;
      
      console.log(`✅ ${this.recipes.length} receitas carregadas e validadas`);
      
    } catch (error) {
      console.error('❌ Erro na inicialização integrada:', error);
      throw new Error(`Falha na inicialização: ${error}`);
    }
  }
  
  isInitialized(): boolean {
    return this.initialized;
  }
  
  async sync(): Promise<void> {
    console.log('🔄 Sincronizando dados...');
    this.cache.clear();
    this.initialized = false;
    await this.initialize();
  }
  
  getLastSyncTime(): Date | null {
    return this.lastSync;
  }
  
  /**
   * 📋 Implementação das operações básicas
   */
  async getAll(): Promise<Recipe[]> {
    await this.ensureInitialized();
    
    const cacheKey = 'recipes:all';
    
    if (this.enableCache) {
      const cached = this.cache.get<Recipe[]>(cacheKey);
      if (cached) {
        console.log('📦 Cache hit: recipes:all');
        return cached;
      }
    }
    
    // Ordena por rating e data
    const sortedRecipes = [...this.recipes].sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    if (this.enableCache) {
      this.cache.set(cacheKey, sortedRecipes, this.cacheTimeout);
    }
    
    return sortedRecipes;
  }
  
  async getById(id: string): Promise<Recipe | null> {
    await this.ensureInitialized();
    return this.recipes.find(r => r.id === id) || null;
  }
  
  async getByCategory(categoryId: string): Promise<Recipe[]> {
    await this.ensureInitialized();
    
    return this.recipes
      .filter(recipe => recipe.categoryId === categoryId)
      .sort((a, b) => b.rating - a.rating);
  }
  
  async getByIds(ids: string[]): Promise<Recipe[]> {
    await this.ensureInitialized();
    
    const recipes: Recipe[] = [];
    for (const id of ids) {
      const recipe = await this.getById(id);
      if (recipe) recipes.push(recipe);
    }
    return recipes;
  }
  
  /**
   * 🔍 Operações de busca integradas
   */
  async search(query: string): Promise<Recipe[]> {
    await this.ensureInitialized();
    
    const cacheKey = `search:${query.toLowerCase().trim()}`;
    
    if (this.enableCache) {
      const cached = this.cache.get<Recipe[]>(cacheKey);
      if (cached) return cached;
    }
    
    // Usa DataLoaderBridge para busca
    const results = await this.dataLoaderBridge.searchRecipes(query, this.recipes);
    
    if (this.enableCache) {
      this.cache.set(cacheKey, results, this.cacheTimeout);
    }
    
    return results;
  }
  
  async filter(filters: RecipeFilter): Promise<Recipe[]> {
    await this.ensureInitialized();
    
    const cacheKey = `filter:${JSON.stringify(filters)}`;
    
    if (this.enableCache) {
      const cached = this.cache.get<Recipe[]>(cacheKey);
      if (cached) return cached;
    }
    
    // Aplica filtros usando FilterController do Core
    const filtered = this.recipes.filter(recipe => 
      FilterController.applyFilters(recipe, filters)
    );
    
    if (this.enableCache) {
      this.cache.set(cacheKey, filtered, this.cacheTimeout);
    }
    
    return filtered;
  }
  
  /**
   * 📄 Operações com paginação
   */
  async getAllPaginated(page: number, pageSize: number): Promise<PaginatedResult<Recipe>> {
    const allRecipes = await this.getAll();
    return this.paginate(allRecipes, page, pageSize);
  }
  
  async searchPaginated(query: string, page: number, pageSize: number): Promise<PaginatedResult<Recipe>> {
    const searchResults = await this.search(query);
    return this.paginate(searchResults, page, pageSize);
  }
  
  /**
   * 💾 Operações de escrita (placeholder para futuro)
   */
  async save(recipe: Recipe): Promise<void> {
    const validation = this.validationBridge.validateRecipe(recipe);
    if (!validation.isValid) {
      throw new Error(`Receita inválida: ${validation.errors.join(', ')}`);
    }
    
    // Por enquanto apenas atualiza em memória
    const existingIndex = this.recipes.findIndex(r => r.id === recipe.id);
    
    if (existingIndex >= 0) {
      this.recipes[existingIndex] = {
        ...recipe,
        updatedAt: new Date().toISOString()
      };
    } else {
      this.recipes.push({
        ...recipe,
        createdAt: recipe.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    this.invalidateCache();
  }
  
  async delete(id: string): Promise<void> {
    const index = this.recipes.findIndex(r => r.id === id);
    if (index >= 0) {
      this.recipes.splice(index, 1);
      this.invalidateCache();
    }
  }
  
  /**
   * 🧹 Cache management
   */
  async invalidateCache(): Promise<void> {
    this.cache.clear();
  }
  
  async refreshCache(): Promise<void> {
    await this.invalidateCache();
    await this.getAll(); // Pré-carrega dados comuns
  }
  
  /**
   * 🔧 Métodos auxiliares
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
  
  private paginate<T>(items: T[], page: number, pageSize: number): PaginatedResult<T> {
    const total = items.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const data = items.slice(startIndex, endIndex);
    
    return {
      data,
      total,
      page,
      pageSize,
      hasNext: endIndex < total,
      hasPrevious: page > 1
    };
  }
}