
import { IBaseRepository, RepositoryConfig } from '../interface/IBaseRepository';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IFavoriteRepository } from '../../../core/repositories/interface/IFavoriteRepository';
import { CacheController } from '../../../core/repositories/controller/CacheController';

interface FavoriteEntry {
  recipeId: string;
  userId: string;
  addedAt: string;
}

export class FavoriteRepository implements IFavoriteRepository, IBaseRepository<FavoriteEntry> {
  private cache = new CacheController();
  private favorites: FavoriteEntry[] = [];
  private initialized = false;
  private lastSync: Date | null = null;
  
  enableCache = true;
  cacheTimeout = 2 * 60 * 1000; // 2 minutos
  
  private readonly STORAGE_KEY = '@RecipeApp:favorites';
  
  constructor(private config: RepositoryConfig) {}
  
  /**
   * 🚀 Inicialização
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      console.log('🔄 Inicializando FavoriteRepository...');
      
      // Carrega favoritos do AsyncStorage
      const storedData = await AsyncStorage.getItem(this.STORAGE_KEY);
      
      if (storedData) {
        this.favorites = JSON.parse(storedData);
      } else {
        this.favorites = [];
      }
      
      this.lastSync = new Date();
      this.initialized = true;
      
      console.log(`✅ ${this.favorites.length} favoritos carregados`);
    } catch (error) {
      console.error('❌ Erro ao inicializar FavoriteRepository:', error);
      this.favorites = [];
      this.initialized = true;
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
   * ❤️ Operações básicas
   */
  async add(recipeId: string, userId: string): Promise<boolean> {
    await this.ensureInitialized();
    
    if (!recipeId || !userId) {
      return false;
    }
    
    // Verifica se já existe
    const exists = this.favorites.some(f => 
      f.recipeId === recipeId && f.userId === userId
    );
    
    if (exists) {
      return true; // Já é favorito
    }
    
    // Adiciona novo favorito
    const newFavorite: FavoriteEntry = {
      recipeId,
      userId,
      addedAt: new Date().toISOString()
    };
    
    this.favorites.push(newFavorite);
    
    // Salva no storage
    await this.saveToStorage();
    
    // Limpa cache do usuário
    this.cache.delete(`favorites:${userId}`);
    
    return true;
  }
  
  async remove(recipeId: string, userId: string): Promise<boolean> {
    await this.ensureInitialized();
    
    if (!recipeId || !userId) {
      return false;
    }
    
    const initialLength = this.favorites.length;
    
    // Remove o favorito
    this.favorites = this.favorites.filter(f => 
      !(f.recipeId === recipeId && f.userId === userId)
    );
    
    if (this.favorites.length < initialLength) {
      // Salva mudanças
      await this.saveToStorage();
      
      // Limpa cache do usuário
      this.cache.delete(`favorites:${userId}`);
      
      return true;
    }
    
    return false;
  }
  
  async isFavorite(recipeId: string, userId: string): Promise<boolean> {
    await this.ensureInitialized();
    
    if (!recipeId || !userId) {
      return false;
    }
    
    return this.favorites.some(f => 
      f.recipeId === recipeId && f.userId === userId
    );
  }
  
  /**
   * 📋 Operações de listagem
   */
  async getFavoriteIds(userId: string): Promise<string[]> {
    await this.ensureInitialized();
    
    if (!userId) {
      return [];
    }
    
    const cacheKey = `favorites:${userId}`;
    
    if (this.enableCache) {
      const cached = this.cache.get<string[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    const userFavorites = this.favorites
      .filter(f => f.userId === userId)
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
      .map(f => f.recipeId);
    
    if (this.enableCache) {
      this.cache.set(cacheKey, userFavorites, this.cacheTimeout);
    }
    
    return userFavorites;
  }
  
  async getUsersWhoFavorited(recipeId: string): Promise<string[]> {
    await this.ensureInitialized();
    
    if (!recipeId) {
      return [];
    }
    
    const cacheKey = `recipe-fans:${recipeId}`;
    
    if (this.enableCache) {
      const cached = this.cache.get<string[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    const users = this.favorites
      .filter(f => f.recipeId === recipeId)
      .map(f => f.userId);
    
    if (this.enableCache) {
      this.cache.set(cacheKey, users, this.cacheTimeout);
    }
    
    return users;
  }
  
  /**
   * 🧹 Operações de limpeza
   */
  async clearUserFavorites(userId: string): Promise<void> {
    await this.ensureInitialized();
    
    if (!userId) return;
    
    this.favorites = this.favorites.filter(f => f.userId !== userId);
    await this.saveToStorage();
    this.cache.delete(`favorites:${userId}`);
  }
  
  async clearRecipeFavorites(recipeId: string): Promise<void> {
    await this.ensureInitialized();
    
    if (!recipeId) return;
    
    this.favorites = this.favorites.filter(f => f.recipeId !== recipeId);
    await this.saveToStorage();
    this.cache.delete(`recipe-fans:${recipeId}`);
  }
  
  /**
   * 💾 Persistência
   */
  private async saveToStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.favorites));
    } catch (error) {
      console.error('❌ Erro ao salvar favoritos:', error);
    }
  }
  
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}