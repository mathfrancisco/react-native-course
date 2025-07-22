
import { IBaseRepository, RepositoryConfig } from '../interface/IBaseRepository';
import { DataLoader } from '../../../shared/data/typescript/DataLoader';
import { validateRecipe } from '../../../shared/data/typescript/DataValidator';
import { RecipeHelpers } from '../../../shared/data/helpers/recipeHelpers';
import { CacheController } from '../../../core/repositories/controller/CacheController';
import { IRecipeRepository } from '../../../core/repositories/interface/IRecipeRepository';
import { Recipe } from '../../../core/entities/interface/Recipe';
import { RecipeFilter } from '../../../core/entities/interface/Filter';
import { PaginatedResult } from '../../../core/entities/interface/Common';

export class RecipeRepository implements IRecipeRepository, IBaseRepository<Recipe> {
  private cache = new CacheController();
  private recipes: Recipe[] = [];
  private initialized = false;
  private lastSync: Date | null = null;
  
  // Configuração
  enableCache = true;
  cacheTimeout = 5 * 60 * 1000; // 5 minutos
  
  constructor(private config: RepositoryConfig) {}
  
  /**
   * 🚀 Inicialização do repositório
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      console.log('🔄 Inicializando RecipeRepository...');
      
      // Carrega dados dos JSONs
      const rawData = await DataLoader.loadRecipes();
      
      // Valida cada receita
      const validatedRecipes: Recipe[] = [];
      
      for (const rawRecipe of rawData) {
        const validation = validateRecipe(rawRecipe);
        
        if (validation.isValid) {
          validatedRecipes.push(rawRecipe as Recipe);
        } else {
          console.warn(`❌ Receita inválida (${rawRecipe.id}):`, validation.errors);
        }
      }
      
      this.recipes = validatedRecipes;
      this.lastSync = new Date();
      this.initialized = true;
      
      console.log(`✅ ${this.recipes.length} receitas carregadas com sucesso`);
    } catch (error) {
      console.error('❌ Erro ao inicializar RecipeRepository:', error);
      throw new Error(`Falha na inicialização: ${error}`);
    }
  }
  
  isInitialized(): boolean {
    return this.initialized;
  }
  
  async sync(): Promise<void> {
    this.cache.clear();
    this.initialized = false;
    await this.initialize();
  }
  
  getLastSyncTime(): Date | null {
    return this.lastSync;
  }
  
  /**
   * 📋 Operações básicas
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
    
    // Ordena por rating e data de criação
    const sortedRecipes = [...this.recipes].sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating; // Maior rating primeiro
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
    
    if (!id) return null;
    
    const cacheKey = `recipe:${id}`;
    
    if (this.enableCache) {
      const cached = this.cache.get<Recipe | null>(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }
    
    const recipe = this.recipes.find(r => r.id === id) || null;
    
    if (this.enableCache) {
      this.cache.set(cacheKey, recipe, this.cacheTimeout);
    }
    
    return recipe;
  }
  
  async getByCategory(categoryId: string): Promise<Recipe[]> {
    await this.ensureInitialized();
    
    if (!categoryId) return [];
    
    const cacheKey = `recipes:category:${categoryId}`;
    
    if (this.enableCache) {
      const cached = this.cache.get<Recipe[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    const categoryRecipes = this.recipes
      .filter(recipe => recipe.categoryId === categoryId)
      .sort((a, b) => b.rating - a.rating);
    
    if (this.enableCache) {
      this.cache.set(cacheKey, categoryRecipes, this.cacheTimeout);
    }
    
    return categoryRecipes;
  }
  
  async getByIds(ids: string[]): Promise<Recipe[]> {
    await this.ensureInitialized();
    
    if (!ids || ids.length === 0) return [];
    
    const recipes: Recipe[] = [];
    
    for (const id of ids) {
      const recipe = await this.getById(id);
      if (recipe) {
        recipes.push(recipe);
      }
    }
    
    return recipes;
  }
  
  /**
   * 🔍 Operações de busca
   */
  async search(query: string): Promise<Recipe[]> {
    await this.ensureInitialized();
    
    if (!query || query.trim().length < 2) {
      return this.getAll();
    }
    
    const normalizedQuery = query.toLowerCase().trim();
    const cacheKey = `search:${normalizedQuery}`;
    
    if (this.enableCache) {
      const cached = this.cache.get<Recipe[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    // Usa helper de busca
    const searchResults = RecipeHelpers.searchRecipes(this.recipes, query);
    
    if (this.enableCache) {
      this.cache.set(cacheKey, searchResults, this.cacheTimeout);
    }
    
    return searchResults;
  }
  
  async filter(filters: RecipeFilter): Promise<Recipe[]> {
    await this.ensureInitialized();
    
    const cacheKey = `filter:${JSON.stringify(filters)}`;
    
    if (this.enableCache) {
      const cached = this.cache.get<Recipe[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    // Usa helper de filtros
    const filteredRecipes = RecipeHelpers.filterRecipes(this.recipes, filters);
    
    if (this.enableCache) {
      this.cache.set(cacheKey, filteredRecipes, this.cacheTimeout);
    }
    
    return filteredRecipes;
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
   * 💾 Operações de escrita (para futuro)
   */
  async save(recipe: Recipe): Promise<void> {
    await this.ensureInitialized();
    
    // Valida antes de salvar
    const validation = validateRecipe(recipe);
    if (!validation.isValid) {
      throw new Error(`Receita inválida: ${validation.errors.join(', ')}`);
    }
    
    const existingIndex = this.recipes.findIndex(r => r.id === recipe.id);
    
    if (existingIndex >= 0) {
      // Atualiza existente
      this.recipes[existingIndex] = {
        ...recipe,
        updatedAt: new Date().toISOString()
      };
    } else {
      // Adiciona nova
      this.recipes.push({
        ...recipe,
        createdAt: recipe.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    // Limpa cache relacionado
    this.invalidateCache();
  }
  
  async delete(id: string): Promise<void> {
    await this.ensureInitialized();
    
    const index = this.recipes.findIndex(r => r.id === id);
    if (index >= 0) {
      this.recipes.splice(index, 1);
      this.invalidateCache();
    }
  }
  
  /**
   * 🧹 Operações de cache
   */
  async invalidateCache(): Promise<void> {
    this.cache.clear();
    console.log('🧹 Cache do RecipeRepository limpo');
  }
  
  async refreshCache(): Promise<void> {
    await this.invalidateCache();
    // Pré-carrega dados mais comuns
    await this.getAll();
    console.log('🔄 Cache do RecipeRepository atualizado');
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