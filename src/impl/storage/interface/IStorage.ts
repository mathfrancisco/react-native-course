/**
 * 🔌 Storage Interfaces - Contratos de Storage
 * 
 * Define todos os contratos e tipos para o sistema de storage,
 * garantindo consistência e type safety.
 * 
 * @author RecipeApp Team
 * @since Fase 3 - Implementation Layer
 */

/**
 * 📋 Interface principal do Storage
 */
export interface IStorage {
  initialize(): Promise<void>;
  save<T>(key: string, data: T, options?: StorageOptions): Promise<StorageResult<T>>;
  load<T>(key: string, options?: StorageOptions): Promise<StorageResult<T>>;
  remove(key: string): Promise<StorageResult<boolean>>;
  clear(): Promise<StorageResult<boolean>>;
  getCacheStats(): CacheStats;
}

/**
 * 📊 Resultado das operações de storage
 */
export interface StorageResult<T> {
  success: boolean;
  data: T;
  source: 'storage' | 'memory' | 'network';
  timestamp: number;
  fromCache: boolean;
  error?: StorageError;
}

/**
 * ⚙️ Opções para operações de storage
 */
export interface StorageOptions {
  ttl?: number; // Time to live em milissegundos
  useMemoryCache?: boolean;
  compress?: boolean;
  forceRefresh?: boolean;
}

/**
 * 🔧 Configuração do cache
 */
export interface CacheConfig {
  ttl: number; // TTL padrão em ms
  maxSize: number; // Tamanho máximo em MB
  enableCompression: boolean;
  autoCleanup: boolean;
  maxEntries: number;
}

/**
 * 📈 Estatísticas do cache
 */
export interface CacheStats {
  memoryCache: {
    entries: number;
    sizeBytes: number;
    sizeFormatted: string;
    hitRate: string;
  };
  config: CacheConfig;
  isInitialized: boolean;
}

/**
 * ❌ Classe de erro específica do Storage
 */
export class StorageError extends Error {
  constructor(
    message: string,
    public type: StorageErrorType,
    public originalError?: any
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * 🏷️ Tipos de erro do Storage
 */
export enum StorageErrorType {
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  NOT_INITIALIZED = 'NOT_INITIALIZED',
  SAVE_FAILED = 'SAVE_FAILED',
  LOAD_FAILED = 'LOAD_FAILED',
  REMOVE_FAILED = 'REMOVE_FAILED',
  CLEAR_FAILED = 'CLEAR_FAILED',
  KEY_NOT_FOUND = 'KEY_NOT_FOUND',
  DATA_EXPIRED = 'DATA_EXPIRED',
  SERIALIZATION_FAILED = 'SERIALIZATION_FAILED',
  DESERIALIZATION_FAILED = 'DESERIALIZATION_FAILED'
}

/**
 * 🔑 Interface para Storage Específicos
 */
export interface IRecipeStorage {
  saveRecipe(recipe: Recipe, options?: StorageOptions): Promise<StorageResult<Recipe>>;
  loadRecipe(id: string, options?: StorageOptions): Promise<StorageResult<Recipe>>;
  saveRecipeList(recipes: Recipe[], options?: StorageOptions): Promise<StorageResult<Recipe[]>>;
  loadRecipeList(options?: StorageOptions): Promise<StorageResult<Recipe[]>>;
  removeRecipe(id: string): Promise<StorageResult<boolean>>;
  searchRecipes(query: string, options?: StorageOptions): Promise<StorageResult<Recipe[]>>;
}

export interface ICategoryStorage {
  saveCategory(category: Category, options?: StorageOptions): Promise<StorageResult<Category>>;
  loadCategory(id: string, options?: StorageOptions): Promise<StorageResult<Category>>;
  saveCategoryList(categories: Category[], options?: StorageOptions): Promise<StorageResult<Category[]>>;
  loadCategoryList(options?: StorageOptions): Promise<StorageResult<Category[]>>;
  removeCategory(id: string): Promise<StorageResult<boolean>>;
}

export interface IFavoriteStorage {
  addFavorite(userId: string, recipeId: string): Promise<StorageResult<boolean>>;
  removeFavorite(userId: string, recipeId: string): Promise<StorageResult<boolean>>;
  getFavorites(userId: string, options?: StorageOptions): Promise<StorageResult<string[]>>;
  isFavorite(userId: string, recipeId: string): Promise<StorageResult<boolean>>;
  clearFavorites(userId: string): Promise<StorageResult<boolean>>;
}

export interface IUserPreferencesStorage {
  savePreferences(userId: string, preferences: UserPreferences, options?: StorageOptions): Promise<StorageResult<UserPreferences>>;
  loadPreferences(userId: string, options?: StorageOptions): Promise<StorageResult<UserPreferences>>;
  updatePreference<K extends keyof UserPreferences>(
    userId: string, 
    key: K, 
    value: UserPreferences[K]
  ): Promise<StorageResult<UserPreferences>>;
  removePreferences(userId: string): Promise<StorageResult<boolean>>;
}

/**
 * 👤 Interface de preferências do usuário
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    enabled: boolean;
    dailyRecipe: boolean;
    favoriteUpdates: boolean;
    newCategories: boolean;
  };
  dietary: {
    restrictions: string[];
    preferences: string[];
    allergies: string[];
  };
  display: {
    showImages: boolean;
    imageQuality: 'low' | 'medium' | 'high';
    animationsEnabled: boolean;
    compactMode: boolean;
  };
  privacy: {
    shareUsageData: boolean;
    personalizedRecommendations: boolean;
  };
}

/**
 * 📦 Interface para Status do Storage
 */
export interface StorageStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingOperations: number;
  cacheHealth: 'good' | 'warning' | 'critical';
  storageUsage: {
    used: number; // em bytes
    available: number; // em bytes
    percentage: number;
  };
}

/**
 * 🔄 Interface para Sincronização
 */
export interface ISyncManager {
  sync(): Promise<SyncResult>;
  scheduleSync(intervalMs: number): void;
  cancelScheduledSync(): void;
  getSyncStatus(): SyncStatus;
}

export interface SyncResult {
  success: boolean;
  timestamp: number;
  operations: {
    uploaded: number;
    downloaded: number;
    conflicts: number;
  };
  errors: string[];
}

export interface SyncStatus {
  isEnabled: boolean;
  lastSync: Date | null;
  nextSync: Date | null;
  status: 'idle' | 'syncing' | 'error';
}

/**
 * 🚀 Tipos auxiliares importados
 */
import { Recipe } from '../../../core/entities/interface/Recipe';
import { Category } from '../../../core/entities/interface/Category';