/**
 * 🏷️ Storage Types - Tipos do Sistema de Storage
 * 
 * Centraliza todos os tipos específicos do sistema de storage,
 * incluindo configurações, estados e operações.
 * 
 * @author RecipeApp Team
 * @since Fase 3 - Implementation Layer
 */

/**
 * 🔑 Chaves de Storage
 */
export const STORAGE_KEYS = {
  // Prefixo da aplicação
  APP_PREFIX: '@RecipeApp:',
  
  // Dados principais
  RECIPES: '@RecipeApp:recipes',
  CATEGORIES: '@RecipeApp:categories',
  INGREDIENTS: '@RecipeApp:ingredients',
  
  // Dados do usuário
  USER_PREFERENCES: '@RecipeApp:user_preferences',
  FAVORITES: '@RecipeApp:favorites',
  RECENT_SEARCHES: '@RecipeApp:recent_searches',
  RECIPE_HISTORY: '@RecipeApp:recipe_history',
  
  // Cache e metadados
  CACHE_METADATA: '@RecipeApp:cache_metadata',
  LAST_SYNC: '@RecipeApp:last_sync',
  APP_VERSION: '@RecipeApp:app_version',
  
  // Configurações
  SETTINGS: '@RecipeApp:settings',
  THEME: '@RecipeApp:theme',
  LANGUAGE: '@RecipeApp:language',
  
  // Dados offline
  OFFLINE_QUEUE: '@RecipeApp:offline_queue',
  PENDING_UPLOADS: '@RecipeApp:pending_uploads',
  
  // Debug e desenvolvimento
  TEST_KEY: '@RecipeApp:test',
  DEBUG_INFO: '@RecipeApp:debug'
} as const;

/**
 * ⚙️ Configurações de Cache por Tipo de Dado
 */
export const CACHE_CONFIGURATIONS = {
  RECIPES: {
    ttl: 24 * 60 * 60 * 1000, // 24 horas
    priority: 'high',
    compression: true,
    maxSize: 50 * 1024 * 1024 // 50MB
  },
  CATEGORIES: {
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 dias
    priority: 'medium',
    compression: false,
    maxSize: 5 * 1024 * 1024 // 5MB
  },
  USER_DATA: {
    ttl: Infinity, // Não expira
    priority: 'critical',
    compression: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  },
  SEARCH_CACHE: {
    ttl: 60 * 60 * 1000, // 1 hora
    priority: 'low',
    compression: true,
    maxSize: 20 * 1024 * 1024 // 20MB
  }
} as const;

/**
 * 📊 Estados de Cache
 */
export enum CacheState {
  EMPTY = 'empty',
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error',
  EXPIRED = 'expired',
  UPDATING = 'updating'
}

/**
 * 🎯 Prioridades de Cache
 */
export enum CachePriority {
  CRITICAL = 'critical', // Dados essenciais que nunca devem ser removidos
  HIGH = 'high',        // Dados importantes com remoção rara
  MEDIUM = 'medium',    // Dados normais com remoção moderada
  LOW = 'low'          // Dados temporários com remoção frequente
}

/**
 * 🔄 Estados de Sincronização
 */
export enum SyncState {
  IDLE = 'idle',
  SYNCING = 'syncing',
  SUCCESS = 'success',
  ERROR = 'error',
  CONFLICT = 'conflict',
  OFFLINE = 'offline'
}

/**
 * 📋 Estratégias de Cache
 */
export enum CacheStrategy {
  CACHE_FIRST = 'cache_first',      // Busca cache primeiro, fallback para storage
  STORAGE_FIRST = 'storage_first',  // Busca storage primeiro, atualiza cache
  CACHE_ONLY = 'cache_only',        // Apenas cache (para dados temporários)
  STORAGE_ONLY = 'storage_only',    // Apenas storage (bypass cache)
  REFRESH = 'refresh'               // Força refresh de ambos
}

/**
 * 🏥 Health Check do Storage
 */
export interface StorageHealth {
  status: 'healthy' | 'warning' | 'critical';
  issues: StorageIssue[];
  recommendations: string[];
  lastCheck: Date;
  metrics: {
    responseTime: number;
    errorRate: number;
    cacheHitRate: number;
    storageUsage: number;
  };
}

export interface StorageIssue {
  type: 'performance' | 'space' | 'corruption' | 'sync';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestedAction: string;
}

/**
 * 📦 Configuração de Compressão
 */
export interface CompressionConfig {
  enabled: boolean;
  algorithm: 'gzip' | 'lz4' | 'none';
  level: number; // 1-9 para gzip
  threshold: number; // Tamanho mínimo em bytes para comprimir
}

/**
 * 🔐 Configuração de Encriptação
 */
export interface EncryptionConfig {
  enabled: boolean;
  algorithm: 'AES-256' | 'ChaCha20';
  keyDerivation: 'PBKDF2' | 'Argon2';
  saltRounds: number;
}

/**
 * ⏱️ Configuração de TTL
 */
export interface TTLConfig {
  default: number;
  max: number;
  min: number;
  strategy: 'sliding' | 'absolute';
  refreshThreshold: number; // Percentual para refresh automático (0-1)
}

/**
 * 🧹 Configuração de Limpeza
 */
export interface CleanupConfig {
  enabled: boolean;
  schedule: 'hourly' | 'daily' | 'weekly';
  maxAge: number; // Idade máxima em ms
  maxSize: number; // Tamanho máximo total em bytes
  strategy: 'lru' | 'fifo' | 'priority';
  keepMostUsed: number; // Quantos itens mais usados manter
}

/**
 * 📊 Métricas de Performance
 */
export interface PerformanceMetrics {
  operations: {
    reads: number;
    writes: number;
    deletes: number;
    clears: number;
  };
  timing: {
    avgReadTime: number;
    avgWriteTime: number;
    avgDeleteTime: number;
    slowestOperation: number;
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
    evictions: number;
  };
  storage: {
    totalSize: number;
    entryCount: number;
    avgEntrySize: number;
    largestEntry: number;
  };
  errors: {
    total: number;
    byType: Record<string, number>;
    lastError: Date | null;
  };
}

/**
 * 🔄 Configuração de Backup
 */
export interface BackupConfig {
  enabled: boolean;
  schedule: 'realtime' | 'hourly' | 'daily';
  retention: number; // Quantos backups manter
  compression: boolean;
  encryption: boolean;
  location: 'local' | 'cloud' | 'both';
}

/**
 * 🚨 Sistema de Alertas
 */
export interface AlertConfig {
  enabled: boolean;
  thresholds: {
    storageUsage: number; // Percentual (0-100)
    errorRate: number;    // Percentual (0-100)
    responseTime: number; // Em ms
    cacheHitRate: number; // Percentual (0-100)
  };
  actions: {
    cleanup: boolean;
    notification: boolean;
    logging: boolean;
    fallback: boolean;
  };
}

/**
 * 🎛️ Configuração Mestre do Storage
 */
export interface StorageConfig {
  cache: CacheConfig;
  compression: CompressionConfig;
  encryption: EncryptionConfig;
  ttl: TTLConfig;
  cleanup: CleanupConfig;
  backup: BackupConfig;
  alerts: AlertConfig;
  debug: {
    enabled: boolean;
    logLevel: 'none' | 'error' | 'warn' | 'info' | 'debug';
    persistLogs: boolean;
  };
}

/**
 * 📱 Configurações específicas por plataforma
 */
export interface PlatformConfig {
  ios: {
    useKeychain: boolean;
    backgroundSync: boolean;
    iCloudSync: boolean;
  };
  android: {
    useEncryptedSharedPreferences: boolean;
    backgroundSync: boolean;
    workManager: boolean;
  };
  web: {
    useIndexedDB: boolean;
    useWebWorkers: boolean;
    serviceWorker: boolean;
  };
}

/**
 * 🔒 Tipos para operações sensíveis
 */
export interface SecureStorageOptions extends StorageOptions {
  encrypt?: boolean;
  keyId?: string;
  requireBiometric?: boolean;
}

/**
 * 📈 Analytics do Storage
 */
export interface StorageAnalytics {
  usage: {
    totalOperations: number;
    operationsByType: Record<string, number>;
    dataTransferred: number;
    cacheEfficiency: number;
  };
  patterns: {
    mostAccessed: string[];
    peakUsageHours: number[];
    commonSearchTerms: string[];
  };
  health: {
    uptime: number;
    errorFrequency: number;
    performanceTrend: 'improving' | 'stable' | 'degrading';
  };
}

/**
 * 🚀 Tipos auxiliares
 */
export type StorageKey = keyof typeof STORAGE_KEYS;
export type CacheConfigKey = keyof typeof CACHE_CONFIGURATIONS;

/**
 * 📚 Imports necessários
 */
import { CacheConfig, StorageOptions } from './IStorage';