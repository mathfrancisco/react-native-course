/**
 * ❤️ Favorite Storage - Storage Específico de Favoritos
 * 
 * Gerencia a persistência e sincronização de receitas favoritas,
 * com suporte a múltiplos usuários e backup automático.
 * 
 * @author RecipeApp Team
 * @since Fase 3 - Implementation Layer
 */

import { StorageManager } from './StorageManager';
import { IFavoriteStorage, StorageResult, StorageOptions } from '../interface/IStorage';
import { STORAGE_KEYS } from '../interface/StorageTypes';

/**
 * 🎯 Estrutura de dados de favoritos
 */
interface FavoriteData {
  userId: string;
  recipeId: string;
  addedAt: Date;
  tags?: string[]; // Tags personalizadas do usuário
  notes?: string; // Notas pessoais sobre a receita
  rating?: number; // Avaliação pessoal (1-5)
  cookCount?: number; // Quantas vezes foi feita
  lastCooked?: Date; // Última vez que foi feita
}

/**
 * 📊 Estrutura de favoritos por usuário
 */
interface UserFavorites {
  userId: string;
  favorites: FavoriteData[];
  totalCount: number;
  lastUpdated: Date;
  syncVersion: number;
}

/**
 * 📈 Estatísticas de favoritos
 */
interface FavoriteStats {
  totalUsers: number;
  totalFavorites: number;
  averageFavoritesPerUser: number;
  mostFavoritedRecipe: string | null;
  recentlyAdded: FavoriteData[];
  topCategories: Record<string, number>;
}

/**
 * ⚙️ Configurações do storage de favoritos
 */
interface FavoriteStorageConfig {
  maxFavoritesPerUser: number;
  enableBackup: boolean;
  backupInterval: number;
  enableSync: boolean;
  cacheTimeout: number;
  enableAnalytics: boolean;
}

/**
 * ❤️ Favorite Storage Implementation
 */
export class FavoriteStorage implements IFavoriteStorage {
  private static instance: FavoriteStorage;
  private storageManager: StorageManager;
  private config: FavoriteStorageConfig;
  
  // Cache em memória para acesso rápido
  private userFavoritesCache: Map<string, UserFavorites> = new Map();
  private lastCacheUpdate: number = 0;
  
  // Operações pendentes para sincronização
  private pendingOperations: Array<{
    type: 'add' | 'remove' | 'update';
    data: FavoriteData;
    timestamp: number;
  }> = [];

  private constructor(config: Partial<FavoriteStorageConfig> = {}) {
    this.config = {
      maxFavoritesPerUser: 500,
      enableBackup: true,
      backupInterval: 24 * 60 * 60 * 1000, // 24 horas
      enableSync: true,
      cacheTimeout: 60 * 60 * 1000, // 1 hora
      enableAnalytics: true,
      ...config,
    };
    
    this.storageManager = StorageManager.getInstance();
    
    if (this.config.enableBackup) {
      this.startBackupTimer();
    }
  }

  /**
   * 🏭 Singleton Pattern
   */
  static getInstance(config?: Partial<FavoriteStorageConfig>): FavoriteStorage {
    if (!FavoriteStorage.instance) {
      FavoriteStorage.instance = new FavoriteStorage(config);
    }
    return FavoriteStorage.instance;
  }

  /**
   * ❤️ Adiciona receita aos favoritos
   */
  async addFavorite(userId: string, recipeId: string): Promise<StorageResult<boolean>> {
    try {
      console.log(`❤️ Adicionando aos favoritos: ${recipeId} (usuário: ${userId})`);
      
      // Carrega favoritos do usuário
      const userFavorites = await this.loadUserFavorites(userId);
      
      // Verifica se já está nos favoritos
      const existing = userFavorites.favorites.find(fav => fav.recipeId === recipeId);
      if (existing) {
        return {
          success: true,
          data: true,
          source: 'memory',
          timestamp: Date.now(),
          fromCache: true,
        };
      }
      
      // Verifica limite
      if (userFavorites.favorites.length >= this.config.maxFavoritesPerUser) {
        throw new Error(`Limite de ${this.config.maxFavoritesPerUser} favoritos atingido`);
      }
      
      // Cria nova entrada de favorito
      const favoriteData: FavoriteData = {
        userId,
        recipeId,
        addedAt: new Date(),
        cookCount: 0,
      };
      
      // Adiciona à lista
      userFavorites.favorites.push(favoriteData);
      userFavorites.totalCount = userFavorites.favorites.length;
      userFavorites.lastUpdated = new Date();
      userFavorites.syncVersion++;
      
      // Salva no storage
      const result = await this.saveUserFavorites(userFavorites);
      
      if (result.success) {
        // Adiciona à fila de sincronização
        if (this.config.enableSync) {
          this.pendingOperations.push({
            type: 'add',
            data: favoriteData,
            timestamp: Date.now(),
          });
        }
        
        console.log(`✅ Favorito adicionado: ${recipeId}`);
      }
      
      return {
        success: result.success,
        data: result.success,
        source: 'storage',
        timestamp: Date.now(),
        fromCache: false,
      };
      
    } catch (error) {
      console.error('❌ Erro ao adicionar favorito:', error);
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
   * 💔 Remove receita dos favoritos
   */
  async removeFavorite(userId: string, recipeId: string): Promise<StorageResult<boolean>> {
    try {
      console.log(`💔 Removendo dos favoritos: ${recipeId} (usuário: ${userId})`);
      
      // Carrega favoritos do usuário
      const userFavorites = await this.loadUserFavorites(userId);
      
      // Encontra o favorito
      const favoriteIndex = userFavorites.favorites.findIndex(fav => fav.recipeId === recipeId);
      
      if (favoriteIndex === -1) {
        // Não está nos favoritos, retorna sucesso mesmo assim
        return {
          success: true,
          data: true,
          source: 'memory',
          timestamp: Date.now(),
          fromCache: true,
        };
      }
      
      // Remove da lista
      const removedFavorite = userFavorites.favorites.splice(favoriteIndex, 1)[0];
      userFavorites.totalCount = userFavorites.favorites.length;
      userFavorites.lastUpdated = new Date();
      userFavorites.syncVersion++;
      
      // Salva no storage
      const result = await this.saveUserFavorites(userFavorites);
      
      if (result.success) {
        // Adiciona à fila de sincronização
        if (this.config.enableSync) {
          this.pendingOperations.push({
            type: 'remove',
            data: removedFavorite,
            timestamp: Date.now(),
          });
        }
        
        console.log(`✅ Favorito removido: ${recipeId}`);
      }
      
      return {
        success: result.success,
        data: result.success,
        source: 'storage',
        timestamp: Date.now(),
        fromCache: false,
      };
      
    } catch (error) {
      console.error('❌ Erro ao remover favorito:', error);
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
   * 📖 Obtém lista de favoritos
   */
  async getFavorites(userId: string, options: StorageOptions = {}): Promise<StorageResult<string[]>> {
    try {
      const userFavorites = await this.loadUserFavorites(userId, options);
      
      const recipeIds = userFavorites.favorites
        .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
        .map(fav => fav.recipeId);
      
      console.log(`📖 Favoritos carregados: ${recipeIds.length} receitas (usuário: ${userId})`);
      
      return {
        success: true,
        data: recipeIds,
        source: 'storage',
        timestamp: Date.now(),
        fromCache: false,
        metadata: {
          totalFavorites: userFavorites.totalCount,
          lastUpdated: userFavorites.lastUpdated,
        },
      };
      
    } catch (error) {
      console.error('❌ Erro ao carregar favoritos:', error);
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
   * ✅ Verifica se receita está nos favoritos
   */
  async isFavorite(userId: string, recipeId: string): Promise<StorageResult<boolean>> {
    try {
      // Verifica cache primeiro
      const cached = this.userFavoritesCache.get(userId);
      if (cached && this.isCacheValid()) {
        const isFav = cached.favorites.some(fav => fav.recipeId === recipeId);
        return {
          success: true,
          data: isFav,
          source: 'memory',
          timestamp: Date.now(),
          fromCache: true,
        };
      }
      
      // Carrega do storage
      const userFavorites = await this.loadUserFavorites(userId);
      const isFav = userFavorites.favorites.some(fav => fav.recipeId === recipeId);
      
      return {
        success: true,
        data: isFav,
        source: 'storage',
        timestamp: Date.now(),
        fromCache: false,
      };
      
    } catch (error) {
      console.error('❌ Erro ao verificar favorito:', error);
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
   * 🗑️ Limpa todos os favoritos do usuário
   */
  async clearFavorites(userId: string): Promise<StorageResult<boolean>> {
    try {
      console.log(`🗑️ Limpando favoritos do usuário: ${userId}`);
      
      const emptyFavorites: UserFavorites = {
        userId,
        favorites: [],
        totalCount: 0,
        lastUpdated: new Date(),
        syncVersion: 1,
      };
      
      const result = await this.saveUserFavorites(emptyFavorites);
      
      if (result.success) {
        console.log(`✅ Favoritos limpos para usuário: ${userId}`);
      }
      
      return {
        success: result.success,
        data: result.success,
        source: 'storage',
        timestamp: Date.now(),
        fromCache: false,
      };
      
    } catch (error) {
      console.error('❌ Erro ao limpar favoritos:', error);
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
   * 📊 Obtém estatísticas de favoritos
   */
  async getStats(): Promise<FavoriteStats> {
    try {
      // Carrega todos os usuários (implementação simplificada)
      const allUserIds = await this.getAllUserIds();
      const allFavorites: FavoriteData[] = [];
      
      for (const userId of allUserIds) {
        const userFavorites = await this.loadUserFavorites(userId);
        allFavorites.push(...userFavorites.favorites);
      }
      
      // Calcula estatísticas
      const recipeCount = new Map<string, number>();
      allFavorites.forEach(fav => {
        recipeCount.set(fav.recipeId, (recipeCount.get(fav.recipeId) || 0) + 1);
      });
      
      const mostFavoritedRecipe = Array.from(recipeCount.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
      
      const recentlyAdded = allFavorites
        .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
        .slice(0, 10);
      
      return {
        totalUsers: allUserIds.length,
        totalFavorites: allFavorites.length,
        averageFavoritesPerUser: allUserIds.length > 0 ? allFavorites.length / allUserIds.length : 0,
        mostFavoritedRecipe,
        recentlyAdded,
        topCategories: {}, // TODO: Implementar quando tiver categorias
      };
      
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas:', error);
      return {
        totalUsers: 0,
        totalFavorites: 0,
        averageFavoritesPerUser: 0,
        mostFavoritedRecipe: null,
        recentlyAdded: [],
        topCategories: {},
      };
    }
  }

  /**
   * 🧹 Limpa cache
   */
  clearCache(): void {
    this.userFavoritesCache.clear();
    this.lastCacheUpdate = 0;
    console.log('🧹 Cache de favoritos limpo');
  }

  /**
   * 🔧 Métodos privados
   */

  private async loadUserFavorites(userId: string, options: StorageOptions = {}): Promise<UserFavorites> {
    // Verifica cache primeiro
    if (options.useMemoryCache !== false && this.isCacheValid()) {
      const cached = this.userFavoritesCache.get(userId);
      if (cached) {
        return cached;
      }
    }
    
    // Carrega do storage
    const key = this.getUserFavoritesKey(userId);
    const result = await this.storageManager.load<UserFavorites>(key, options);
    
    let userFavorites: UserFavorites;
    
    if (result.success && result.data) {
      userFavorites = result.data;
    } else {
      // Cria estrutura inicial se não existir
      userFavorites = {
        userId,
        favorites: [],
        totalCount: 0,
        lastUpdated: new Date(),
        syncVersion: 1,
      };
    }
    
    // Atualiza cache
    this.userFavoritesCache.set(userId, userFavorites);
    this.lastCacheUpdate = Date.now();
    
    return userFavorites;
  }

  private async saveUserFavorites(userFavorites: UserFavorites): Promise<StorageResult<UserFavorites>> {
    const key = this.getUserFavoritesKey(userFavorites.userId);
    
    const result = await this.storageManager.save(key, userFavorites, {
      ttl: this.config.cacheTimeout,
    });
    
    if (result.success) {
      // Atualiza cache
      this.userFavoritesCache.set(userFavorites.userId, userFavorites);
      this.lastCacheUpdate = Date.now();
    }
    
    return result;
  }

  private getUserFavoritesKey(userId: string): string {
    return `${STORAGE_KEYS.FAVORITES}_${userId}`;
  }

  private isCacheValid(): boolean {
    return (Date.now() - this.lastCacheUpdate) < this.config.cacheTimeout;
  }

  private async getAllUserIds(): Promise<string[]> {
    // Implementação simplificada - em produção seria mais sofisticada
    const cachedUsers = Array.from(this.userFavoritesCache.keys());
    return cachedUsers.length > 0 ? cachedUsers : ['default_user'];
  }

  private startBackupTimer(): void {
    setInterval(async () => {
      try {
        await this.createBackup();
      } catch (error) {
        console.error('❌ Erro no backup automático:', error);
      }
    }, this.config.backupInterval);
  }

  private async createBackup(): Promise<void> {
    console.log('📦 Criando backup de favoritos...');
    
    const allUserIds = await this.getAllUserIds();
    const backup: Record<string, UserFavorites> = {};
    
    for (const userId of allUserIds) {
      backup[userId] = await this.loadUserFavorites(userId);
    }
    
    const backupKey = `${STORAGE_KEYS.FAVORITES}_backup_${Date.now()}`;
    await this.storageManager.save(backupKey, backup, {
      ttl: 30 * 24 * 60 * 60 * 1000, // 30 dias
    });
    
    console.log('✅ Backup de favoritos criado');
  }

  /**
   * 🔄 Métodos de sincronização (para implementação futura)
   */

  getPendingOperations(): Array<{type: 'add' | 'remove' | 'update'; data: FavoriteData; timestamp: number}> {
    return [...this.pendingOperations];
  }

  clearPendingOperations(): void {
    this.pendingOperations = [];
  }

  async syncWithServer(): Promise<boolean> {
    // TODO: Implementar sincronização com servidor
    console.log('🔄 Sincronização com servidor (placeholder)');
    return true;
  }
}