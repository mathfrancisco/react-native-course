/**
 * 📦 Storage Manager - Gerenciador Principal de Storage
 * 
 * Responsável por centralizar e coordenar todas as operações de storage,
 * implementando cache inteligente, TTL e estratégias de fallback.
 * 
 * @author RecipeApp Team
 * @since Fase 3 - Implementation Layer
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../../../shared/constants/storageKeys';
import { CacheConfig, IStorage, StorageError, StorageErrorType, StorageOptions, StorageResult } from '../interface/IStorage';

/**
 * ⚙️ Configurações padrão de cache
 */
const DEFAULT_CACHE_CONFIG: CacheConfig = {
  ttl: 24 * 60 * 60 * 1000, // 24 horas em ms
  maxSize: 100, // 100 MB
  enableCompression: true,
  autoCleanup: true,
  maxEntries: 1000
};

/**
 * 📦 Storage Manager Principal
 */
export class StorageManager implements IStorage {
  private static instance: StorageManager;
  private memoryCache: Map<string, any> = new Map();
  private cacheMetadata: Map<string, { timestamp: number; size: number; hitCount: number }> = new Map();
  private isInitialized: boolean = false;
  private config: CacheConfig;

  private constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
  }

  /**
   * 🏭 Singleton Pattern - Instância única
   */
  static getInstance(config?: Partial<CacheConfig>): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager(config);
    }
    return StorageManager.instance;
  }

  /**
   * 🚀 Inicialização do Storage Manager
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔄 Inicializando StorageManager...');
      
      // Verifica se AsyncStorage está disponível
      await this.testAsyncStorage();
      
      // Carrega metadados do cache
      await this.loadCacheMetadata();
      
      // Executa limpeza automática se habilitada
      if (this.config.autoCleanup) {
        await this.performAutoCleanup();
      }
      
      this.isInitialized = true;
      console.log('✅ StorageManager inicializado com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar StorageManager:', error);
      throw new StorageError('Failed to initialize StorageManager', StorageErrorType.INITIALIZATION_FAILED, error);
    }
  }

  /**
   * 💾 Salva dados no storage com cache inteligente
   */
  async save<T>(key: string, data: T, options: StorageOptions = {}): Promise<StorageResult<T>> {
    try {
      this.ensureInitialized();
      
      const finalOptions = this.mergeOptions(options);
      const serializedData = this.serializeData(data, finalOptions);
      const timestamp = Date.now();
      
      // Salva no AsyncStorage
      await AsyncStorage.setItem(key, serializedData);
      
      // Adiciona ao cache de memória se habilitado
      if (finalOptions.useMemoryCache) {
        this.memoryCache.set(key, {
          data,
          timestamp,
          ttl: finalOptions.ttl
        });
        
        // Atualiza metadados
        this.updateCacheMetadata(key, serializedData.length);
      }
      
      console.log(`💾 Dados salvos: ${key} (${this.formatSize(serializedData.length)})`);
      
      return {
        success: true,
        data,
        source: 'storage',
        timestamp,
        fromCache: false
      };

    } catch (error) {
      console.error(`❌ Erro ao salvar dados (${key}):`, error);
      return {
        success: false,
        data: null as any,
        source: 'storage',
        timestamp: Date.now(),
        fromCache: false,
        error: new StorageError(`Failed to save data for key: ${key}`, StorageErrorType.SAVE_FAILED, error)
      };
    }
  }

  /**
   * 📖 Carrega dados do storage com suporte a cache
   */
  async load<T>(key: string, options: StorageOptions = {}): Promise<StorageResult<T>> {
    try {
      this.ensureInitialized();
      
      const finalOptions = this.mergeOptions(options);
      
      // Verifica cache de memória primeiro
      if (finalOptions.useMemoryCache) {
        const cached = this.getFromMemoryCache<T>(key);
        if (cached) {
          this.incrementCacheHit(key);
          return cached;
        }
      }
      
      // Carrega do AsyncStorage
      const storedData = await AsyncStorage.getItem(key);
      
      if (!storedData) {
        return {
          success: false,
          data: null as any,
          source: 'storage',
          timestamp: Date.now(),
          fromCache: false,
          error: new StorageError(`No data found for key: ${key}`, StorageErrorType.KEY_NOT_FOUND)
        };
      }
      
      const deserializedData = this.deserializeData<T>(storedData, finalOptions);
      const timestamp = Date.now();
      
      // Adiciona ao cache de memória
      if (finalOptions.useMemoryCache) {
        this.memoryCache.set(key, {
          data: deserializedData,
          timestamp,
          ttl: finalOptions.ttl
        });
      }
      
      console.log(`📖 Dados carregados: ${key} (${this.formatSize(storedData.length)})`);
      
      return {
        success: true,
        data: deserializedData,
        source: 'storage',
        timestamp,
        fromCache: false
      };

    } catch (error) {
      console.error(`❌ Erro ao carregar dados (${key}):`, error);
      return {
        success: false,
        data: null as any,
        source: 'storage',
        timestamp: Date.now(),
        fromCache: false,
        error: new StorageError(`Failed to load data for key: ${key}`, StorageErrorType.LOAD_FAILED, error)
      };
    }
  }

  /**
   * 🗑️ Remove dados do storage e cache
   */
  async remove(key: string): Promise<StorageResult<boolean>> {
    try {
      this.ensureInitialized();
      
      // Remove do AsyncStorage
      await AsyncStorage.removeItem(key);
      
      // Remove do cache de memória
      this.memoryCache.delete(key);
      this.cacheMetadata.delete(key);
      
      console.log(`🗑️ Dados removidos: ${key}`);
      
      return {
        success: true,
        data: true,
        source: 'storage',
        timestamp: Date.now(),
        fromCache: false
      };

    } catch (error) {
      console.error(`❌ Erro ao remover dados (${key}):`, error);
      return {
        success: false,
        data: false,
        source: 'storage',
        timestamp: Date.now(),
        fromCache: false,
        error: new StorageError(`Failed to remove data for key: ${key}`, StorageErrorType.REMOVE_FAILED, error)
      };
    }
  }

  /**
   * 🧹 Limpa todo o storage (use com cuidado!)
   */
  async clear(): Promise<StorageResult<boolean>> {
    try {
      this.ensureInitialized();
      
      // Limpa AsyncStorage (apenas chaves do app)
      const allKeys = await AsyncStorage.getAllKeys();
      const appKeys = allKeys.filter(key => key.startsWith(StorageKeys.APP_PREFIX));
      
      if (appKeys.length > 0) {
        await AsyncStorage.multiRemove(appKeys);
      }
      
      // Limpa cache de memória
      this.memoryCache.clear();
      this.cacheMetadata.clear();
      
      console.log(`🧹 Storage limpo: ${appKeys.length} chaves removidas`);
      
      return {
        success: true,
        data: true,
        source: 'storage',
        timestamp: Date.now(),
        fromCache: false
      };

    } catch (error) {
      console.error('❌ Erro ao limpar storage:', error);
      return {
        success: false,
        data: false,
        source: 'storage',
        timestamp: Date.now(),
        fromCache: false,
        error: new StorageError('Failed to clear storage', StorageErrorType.CLEAR_FAILED, error)
      };
    }
  }

  /**
   * 📊 Obtém estatísticas do cache
   */
  getCacheStats() {
    const memorySize = this.calculateMemoryCacheSize();
    const hitRate = this.calculateHitRate();
    
    return {
      memoryCache: {
        entries: this.memoryCache.size,
        sizeBytes: memorySize,
        sizeFormatted: this.formatSize(memorySize),
        hitRate: hitRate.toFixed(2) + '%'
      },
      config: this.config,
      isInitialized: this.isInitialized
    };
  }

  /**
   * 🔧 Métodos privados auxiliares
   */

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new StorageError('StorageManager not initialized', StorageErrorType.NOT_INITIALIZED);
    }
  }

  private async testAsyncStorage(): Promise<void> {
    const testKey = StorageKeys.TEST_KEY;
    const testValue = 'storage_test';
    
    await AsyncStorage.setItem(testKey, testValue);
    const retrieved = await AsyncStorage.getItem(testKey);
    await AsyncStorage.removeItem(testKey);
    
    if (retrieved !== testValue) {
      throw new Error('AsyncStorage test failed');
    }
  }

  private mergeOptions(options: StorageOptions): Required<StorageOptions> {
    return {
      ttl: options.ttl ?? this.config.ttl,
      useMemoryCache: options.useMemoryCache ?? true,
      compress: options.compress ?? this.config.enableCompression,
      forceRefresh: options.forceRefresh ?? false
    };
  }

  private serializeData<T>(data: T, options: Required<StorageOptions>): string {
    let serialized = JSON.stringify({
      data,
      timestamp: Date.now(),
      ttl: options.ttl
    });
    
    // TODO: Implementar compressão se options.compress for true
    
    return serialized;
  }

  private deserializeData<T>(serialized: string, options: Required<StorageOptions>): T {
    // TODO: Implementar descompressão se necessário
    
    const parsed = JSON.parse(serialized);
    
    // Verifica TTL
    if (!options.forceRefresh && parsed.timestamp && parsed.ttl) {
      const isExpired = (Date.now() - parsed.timestamp) > parsed.ttl;
      if (isExpired) {
        throw new StorageError('Data expired', StorageErrorType.DATA_EXPIRED);
      }
    }
    
    return parsed.data;
  }

  private getFromMemoryCache<T>(key: string): StorageResult<T> | null {
    const cached = this.memoryCache.get(key);
    
    if (!cached) return null;
    
    // Verifica TTL
    const isExpired = (Date.now() - cached.timestamp) > cached.ttl;
    if (isExpired) {
      this.memoryCache.delete(key);
      this.cacheMetadata.delete(key);
      return null;
    }
    
    return {
      success: true,
      data: cached.data,
      source: 'memory',
      timestamp: cached.timestamp,
      fromCache: true
    };
  }

  private updateCacheMetadata(key: string, size: number): void {
    const existing = this.cacheMetadata.get(key);
    this.cacheMetadata.set(key, {
      timestamp: Date.now(),
      size,
      hitCount: existing?.hitCount ?? 0
    });
  }

  private incrementCacheHit(key: string): void {
    const metadata = this.cacheMetadata.get(key);
    if (metadata) {
      metadata.hitCount++;
    }
  }

  private calculateMemoryCacheSize(): number {
    let totalSize = 0;
    for (const [key, value] of this.memoryCache) {
      totalSize += JSON.stringify(value).length;
    }
    return totalSize;
  }

  private calculateHitRate(): number {
    if (this.cacheMetadata.size === 0) return 0;
    
    const totalHits = Array.from(this.cacheMetadata.values())
      .reduce((sum, meta) => sum + meta.hitCount, 0);
    
    return (totalHits / this.cacheMetadata.size) * 100;
  }

  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  private async loadCacheMetadata(): Promise<void> {
    // TODO: Implementar carregamento de metadados persistidos
  }

  private async performAutoCleanup(): Promise<void> {
    console.log('🧹 Executando limpeza automática do cache...');
    
    const now = Date.now();
    const keysToRemove: string[] = [];
    
    // Remove entradas expiradas
    for (const [key, cached] of this.memoryCache) {
      const isExpired = (now - cached.timestamp) > cached.ttl;
      if (isExpired) {
        keysToRemove.push(key);
      }
    }
    
    // Remove do cache
    keysToRemove.forEach(key => {
      this.memoryCache.delete(key);
      this.cacheMetadata.delete(key);
    });
    
    console.log(`🧹 Limpeza concluída: ${keysToRemove.length} entradas removidas`);
  }
}