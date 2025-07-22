
import { IBaseRepository, RepositoryConfig } from '../interface/IBaseRepository';
import { DataLoader } from '../../../shared/data/typescript/DataLoader';
import { validateCategory } from '../../../shared/data/typescript/DataValidator';
import { CacheController } from '../../../core/repositories/controller/CacheController';
import { ICategoryRepository } from '../../../core/repositories/interface/ICategoryRepository';
import { Category } from '../../../shared/types/category.types';

export class CategoryRepository implements ICategoryRepository, IBaseRepository<Category> {
  private cache = new CacheController();
  private categories: Category[] = [];
  private initialized = false;
  private lastSync: Date | null = null;
  
  enableCache = true;
  cacheTimeout = 10 * 60 * 1000; // 10 minutos (categorias mudam menos)
  
  constructor(private config: RepositoryConfig) {}
  
  /**
   * 🚀 Inicialização
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      console.log('🔄 Inicializando CategoryRepository...');
      
      const rawData = await DataLoader.loadCategories();
      const validatedCategories: Category[] = [];
      
      for (const rawCategory of rawData) {
        const validation = validateCategory(rawCategory);
        
        if (validation.isValid) {
          validatedCategories.push(rawCategory as Category);
        } else {
          console.warn(`❌ Categoria inválida (${rawCategory.id}):`, validation.errors);
        }
      }
      
      // Ordena por sortOrder
      this.categories = validatedCategories.sort((a, b) => a.sortOrder - b.sortOrder);
      this.lastSync = new Date();
      this.initialized = true;
      
      console.log(`✅ ${this.categories.length} categorias carregadas`);
    } catch (error) {
      console.error('❌ Erro ao inicializar CategoryRepository:', error);
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
  async getAll(): Promise<Category[]> {
    await this.ensureInitialized();
    
    const cacheKey = 'categories:all';
    
    if (this.enableCache) {
      const cached = this.cache.get<Category[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    if (this.enableCache) {
      this.cache.set(cacheKey, this.categories, this.cacheTimeout);
    }
    
    return [...this.categories];
  }
  
  async getById(id: string): Promise<Category | null> {
    await this.ensureInitialized();
    
    if (!id) return null;
    
    const cacheKey = `category:${id}`;
    
    if (this.enableCache) {
      const cached = this.cache.get<Category | null>(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }
    
    const category = this.categories.find(c => c.id === id) || null;
    
    if (this.enableCache) {
      this.cache.set(cacheKey, category, this.cacheTimeout);
    }
    
    return category;
  }
  
  async getBySlug(slug: string): Promise<Category | null> {
    await this.ensureInitialized();
    
    if (!slug) return null;
    
    const cacheKey = `category:slug:${slug}`;
    
    if (this.enableCache) {
      const cached = this.cache.get<Category | null>(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }
    
    const category = this.categories.find(c => c.slug === slug) || null;
    
    if (this.enableCache) {
      this.cache.set(cacheKey, category, this.cacheTimeout);
    }
    
    return category;
  }
  
  async getActive(): Promise<Category[]> {
    await this.ensureInitialized();
    
    const cacheKey = 'categories:active';
    
    if (this.enableCache) {
      const cached = this.cache.get<Category[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    const activeCategories = this.categories.filter(c => c.isActive);
    
    if (this.enableCache) {
      this.cache.set(cacheKey, activeCategories, this.cacheTimeout);
    }
    
    return activeCategories;
  }
  
  /**
   * 💾 Operações de escrita
   */
  async save(category: Category): Promise<void> {
    await this.ensureInitialized();
    
    const validation = validateCategory(category);
    if (!validation.isValid) {
      throw new Error(`Categoria inválida: ${validation.errors.join(', ')}`);
    }
    
    const existingIndex = this.categories.findIndex(c => c.id === category.id);
    
    if (existingIndex >= 0) {
      this.categories[existingIndex] = {
        ...category,
        updatedAt: new Date().toISOString()
      };
    } else {
      this.categories.push({
        ...category,
        createdAt: category.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    // Reordena e limpa cache
    this.categories.sort((a, b) => a.sortOrder - b.sortOrder);
    this.invalidateCache();
  }
  
  async delete(id: string): Promise<void> {
    await this.ensureInitialized();
    
    const index = this.categories.findIndex(c => c.id === id);
    if (index >= 0) {
      this.categories.splice(index, 1);
      this.invalidateCache();
    }
  }
  
  /**
   * 🔢 Operações específicas
   */
  async updateRecipeCount(categoryId: string, count: number): Promise<void> {
    await this.ensureInitialized();
    
    const category = this.categories.find(c => c.id === categoryId);
    if (category) {
      category.recipeCount = Math.max(0, count);
      category.updatedAt = new Date().toISOString();
      this.invalidateCache();
    }
  }
  
  /**
   * 🧹 Cache
   */
  async invalidateCache(): Promise<void> {
    this.cache.clear();
  }
  
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}