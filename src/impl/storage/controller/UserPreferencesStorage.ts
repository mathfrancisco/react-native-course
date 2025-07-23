/**
 * ⚙️ User Preferences Storage - Storage de Preferências do Usuário
 * 
 * Gerencia a persistência de configurações e preferências do usuário,
 * com validação, migração e sincronização automática.
 * 
 * @author RecipeApp Team
 * @since Fase 3 - Implementation Layer
 */

import { StorageManager } from './StorageManager';
import { IUserPreferencesStorage, StorageResult, StorageOptions, UserPreferences } from '../interface/IStorage';
import { STORAGE_KEYS } from '../interface/StorageTypes';

/**
 * 📊 Versão das preferências para migração
 */
const PREFERENCES_VERSION = 2;

/**
 * 🎯 Configurações do storage de preferências
 */
interface PreferencesStorageConfig {
  enableValidation: boolean;
  enableMigration: boolean;
  enableBackup: boolean;
  cacheTimeout: number;
  enableEncryption: boolean;
  enableSync: boolean;
}

/**
 * 📈 Histórico de mudanças
 */
interface PreferenceChange {
  key: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
  source: 'user' | 'system' | 'sync';
}

/**
 * 📦 Estrutura de preferências versionada
 */
interface VersionedPreferences {
  version: number;
  preferences: UserPreferences;
  createdAt: Date;
  lastUpdated: Date;
  changeHistory: PreferenceChange[];
  migrationApplied: string[];
}

/**
 * ⚙️ User Preferences Storage Implementation
 */
export class UserPreferencesStorage implements IUserPreferencesStorage {
  private static instance: UserPreferencesStorage;
  private storageManager: StorageManager;
  private config: PreferencesStorageConfig;
  
  // Cache em memória
  private preferencesCache: Map<string, VersionedPreferences> = new Map();
  private lastCacheUpdate: number = 0;
  
  // Validadores
  private validators: Map<string, (value: any) => boolean> = new Map();
  
  // Migrações
  private migrations: Map<number, (prefs: any) => any> = new Map();

  private constructor(config: Partial<PreferencesStorageConfig> = {}) {
    this.config = {
      enableValidation: true,
      enableMigration: true,
      enableBackup: true,
      cacheTimeout: 60 * 60 * 1000, // 1 hora
      enableEncryption: false, // Por enquanto desabilitado
      enableSync: true,
      ...config,
    };
    
    this.storageManager = StorageManager.getInstance();
    
    this.setupValidators();
    this.setupMigrations();
  }

  /**
   * 🏭 Singleton Pattern
   */
  static getInstance(config?: Partial<PreferencesStorageConfig>): UserPreferencesStorage {
    if (!UserPreferencesStorage.instance) {
      UserPreferencesStorage.instance = new UserPreferencesStorage(config);
    }
    return UserPreferencesStorage.instance;
  }

  /**
   * 💾 Salva preferências completas
   */
  async savePreferences(
    userId: string, 
    preferences: UserPreferences, 
    options: StorageOptions = {}
  ): Promise<StorageResult<UserPreferences>> {
    try {
      console.log(`⚙️ Salvando preferências para usuário: ${userId}`);
      
      // Valida preferências se habilitado
      if (this.config.enableValidation) {
        const validationResult = this.validatePreferences(preferences);
        if (!validationResult.isValid) {
          throw new Error(`Preferências inválidas: ${validationResult.errors.join(', ')}`);
        }
      }
      
      // Carrega preferências atuais para histórico
      const currentVersioned = await this.loadVersionedPreferences(userId);
      
      // Calcula mudanças
      const changes = this.calculateChanges(currentVersioned.preferences, preferences);
      
      // Cria nova versão
      const newVersioned: VersionedPreferences = {
        version: PREFERENCES_VERSION,
        preferences,
        createdAt: currentVersioned.createdAt,
        lastUpdated: new Date(),
        changeHistory: [...currentVersioned.changeHistory, ...changes],
        migrationApplied: currentVersioned.migrationApplied,
      };
      
      // Limita histórico
      if (newVersioned.changeHistory.length > 100) {
        newVersioned.changeHistory = newVersioned.changeHistory.slice(-50);
      }
      
      // Salva no storage
      const key = this.getPreferencesKey(userId);
      const result = await this.storageManager.save(key, newVersioned, {
        ttl: this.config.cacheTimeout,
        ...options,
      });
      
      if (result.success) {
        // Atualiza cache
        this.preferencesCache.set(userId, newVersioned);
        this.lastCacheUpdate = Date.now();
        
        // Cria backup se habilitado
        if (this.config.enableBackup) {
          await this.createBackup(userId, newVersioned);
        }
        
        console.log(`✅ Preferências salvas: ${changes.length} alterações`);
      }
      
      return {
        success: result.success,
        data: preferences,
        source: 'storage',
        timestamp: Date.now(),
        fromCache: false,
        metadata: {
          changesCount: changes.length,
          version: PREFERENCES_VERSION,
        },
      };
      
    } catch (error) {
      console.error('❌ Erro ao salvar preferências:', error);
      return {
        success: false,
        data: preferences,
        source: 'storage',
        timestamp: Date.now(),
        fromCache: false,
        error: error as Error,
      };
    }
  }

  /**
   * 📖 Carrega preferências
   */
  async loadPreferences(
    userId: string, 
    options: StorageOptions = {}
  ): Promise<StorageResult<UserPreferences>> {
    try {
      // Verifica cache primeiro
      if (options.useMemoryCache !== false && this.isCacheValid()) {
        const cached = this.preferencesCache.get(userId);
        if (cached) {
          console.log(`📖 Preferências carregadas do cache (usuário: ${userId})`);
          return {
            success: true,
            data: cached.preferences,
            source: 'memory',
            timestamp: Date.now(),
            fromCache: true,
            metadata: {
              version: cached.version,
              lastUpdated: cached.lastUpdated,
            },
          };
        }
      }
      
      // Carrega do storage
      const versionedPrefs = await this.loadVersionedPreferences(userId, options);
      
      console.log(`📖 Preferências carregadas (usuário: ${userId}, versão: ${versionedPrefs.version})`);
      
      return {
        success: true,
        data: versionedPrefs.preferences,
        source: 'storage',
        timestamp: Date.now(),
        fromCache: false,
        metadata: {
          version: versionedPrefs.version,
          lastUpdated: versionedPrefs.lastUpdated,
          changesCount: versionedPrefs.changeHistory.length,
        },
      };
      
    } catch (error) {
      console.error('❌ Erro ao carregar preferências:', error);
      
      // Retorna preferências padrão em caso de erro
      const defaultPrefs = this.getDefaultPreferences();
      return {
        success: false,
        data: defaultPrefs,
        source: 'memory',
        timestamp: Date.now(),
        fromCache: false,
        error: error as Error,
      };
    }
  }

  /**
   * 🔧 Atualiza preferência específica
   */
  async updatePreference<K extends keyof UserPreferences>(
    userId: string,
    key: K,
    value: UserPreferences[K]
  ): Promise<StorageResult<UserPreferences>> {
    try {
      console.log(`🔧 Atualizando preferência: ${String(key)} (usuário: ${userId})`);
      
      // Carrega preferências atuais
      const currentResult = await this.loadPreferences(userId);
      if (!currentResult.success) {
        throw new Error('Falha ao carregar preferências atuais');
      }
      
      // Valida novo valor se habilitado
      if (this.config.enableValidation) {
        const isValid = this.validatePreferenceValue(key, value);
        if (!isValid) {
          throw new Error(`Valor inválido para preferência: ${String(key)}`);
        }
      }
      
      // Atualiza preferência específica
      const updatedPreferences = {
        ...currentResult.data,
        [key]: value,
      };
      
      // Salva preferências atualizadas
      return await this.savePreferences(userId, updatedPreferences);
      
    } catch (error) {
      console.error('❌ Erro ao atualizar preferência:', error);
      return {
        success: false,
        data: this.getDefaultPreferences(),
        source: 'storage',
        timestamp: Date.now(),
        fromCache: false,
        error: error as Error,
      };
    }
  }

  /**
   * 🗑️ Remove preferências do usuário
   */
  async removePreferences(userId: string): Promise<StorageResult<boolean>> {
    try {
      console.log(`🗑️ Removendo preferências do usuário: ${userId}`);
      
      const key = this.getPreferencesKey(userId);
      const result = await this.storageManager.remove(key);
      
      if (result.success) {
        // Remove do cache
        this.preferencesCache.delete(userId);
        console.log(`✅ Preferências removidas: ${userId}`);
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Erro ao remover preferências:', error);
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
   * 🔄 Migra preferências para nova versão
   */
  async migratePreferences(userId: string): Promise<boolean> {
    if (!this.config.enableMigration) {
      return true;
    }
    
    try {
      console.log(`🔄 Verificando migração de preferências: ${userId}`);
      
      const versionedPrefs = await this.loadVersionedPreferences(userId);
      
      if (versionedPrefs.version >= PREFERENCES_VERSION) {
        console.log('✅ Preferências já estão na versão atual');
        return true;
      }
      
      console.log(`🔄 Migrando de v${versionedPrefs.version} para v${PREFERENCES_VERSION}`);
      
      let migratedPrefs = versionedPrefs.preferences;
      const appliedMigrations = [...versionedPrefs.migrationApplied];
      
      // Aplica migrações necessárias
      for (let version = versionedPrefs.version + 1; version <= PREFERENCES_VERSION; version++) {
        if (this.migrations.has(version)) {
          const migration = this.migrations.get(version)!;
          migratedPrefs = migration(migratedPrefs);
          appliedMigrations.push(`v${version}`);
          console.log(`✅ Migração v${version} aplicada`);
        }
      }
      
      // Salva preferências migradas
      const newVersioned: VersionedPreferences = {
        ...versionedPrefs,
        version: PREFERENCES_VERSION,
        preferences: migratedPrefs,
        lastUpdated: new Date(),
        migrationApplied: appliedMigrations,
      };
      
      const key = this.getPreferencesKey(userId);
      const result = await this.storageManager.save(key, newVersioned);
      
      if (result.success) {
        this.preferencesCache.set(userId, newVersioned);
        console.log('✅ Migração concluída com sucesso');
      }
      
      return result.success;
      
    } catch (error) {
      console.error('❌ Erro na migração:', error);
      return false;
    }
  }

  /**
   * 📊 Obtém histórico de mudanças
   */
  async getChangeHistory(userId: string): Promise<PreferenceChange[]> {
    try {
      const versionedPrefs = await this.loadVersionedPreferences(userId);
      return versionedPrefs.changeHistory;
    } catch (error) {
      console.error('❌ Erro ao carregar histórico:', error);
      return [];
    }
  }

  /**
   * 🧹 Limpa cache
   */
  clearCache(): void {
    this.preferencesCache.clear();
    this.lastCacheUpdate = 0;
    console.log('🧹 Cache de preferências limpo');
  }

  /**
   * 🔧 Métodos privados
   */

  private async loadVersionedPreferences(
    userId: string, 
    options: StorageOptions = {}
  ): Promise<VersionedPreferences> {
    const key = this.getPreferencesKey(userId);
    const result = await this.storageManager.load<VersionedPreferences>(key, options);
    
    if (result.success && result.data) {
      // Atualiza cache
      this.preferencesCache.set(userId, result.data);
      this.lastCacheUpdate = Date.now();
      
      return result.data;
    }
    
    // Retorna estrutura inicial se não existir
    const defaultVersioned: VersionedPreferences = {
      version: PREFERENCES_VERSION,
      preferences: this.getDefaultPreferences(),
      createdAt: new Date(),
      lastUpdated: new Date(),
      changeHistory: [],
      migrationApplied: [],
    };
    
    this.preferencesCache.set(userId, defaultVersioned);
    return defaultVersioned;
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      theme: 'auto',
      language: 'pt-BR',
      
      notifications: {
        enabled: true,
        dailyRecipe: false,
        favoriteUpdates: true,
        newCategories: false,
        pushNotifications: true,
        emailNotifications: false,
      },
      
      dietary: {
        restrictions: [],
        preferences: [],
        allergies: [],
        customRestrictions: [],
      },
      
      display: {
        showImages: true,
        imageQuality: 'medium',
        animationsEnabled: true,
        compactMode: false,
        cardsPerRow: 2,
        showNutritionInfo: true,
        showCookingTime: true,
        showDifficulty: true,
        defaultView: 'grid',
      },
      
      cooking: {
        defaultServings: 4,
        preferredUnits: 'metric',
        scalingPreference: 'auto',
        timerEnabled: true,
        voiceInstructions: false,
      },
      
      privacy: {
        shareUsageData: false,
        personalizedRecommendations: true,
        shareRecipes: false,
        publicProfile: false,
        dataCollection: false,
      },
      
      advanced: {
        cacheEnabled: true,
        offlineMode: false,
        autoSync: true,
        debugMode: false,
        betaFeatures: false,
        performanceMode: 'balanced',
      },
    };
  }

  private setupValidators(): void {
    // Validador para tema
    this.validators.set('theme', (value) => 
      ['light', 'dark', 'auto'].includes(value)
    );
    
    // Validador para qualidade de imagem
    this.validators.set('display.imageQuality', (value) => 
      ['low', 'medium', 'high'].includes(value)
    );
    
    // Validador para modo de performance
    this.validators.set('advanced.performanceMode', (value) => 
      ['high', 'balanced', 'battery'].includes(value)
    );
    
    // Mais validadores podem ser adicionados aqui
  }

  private setupMigrations(): void {
    // Migração v1 → v2: Adiciona novos campos
    this.migrations.set(2, (prefs) => ({
      ...prefs,
      cooking: {
        defaultServings: 4,
        preferredUnits: 'metric',
        scalingPreference: 'auto',
        timerEnabled: true,
        voiceInstructions: false,
        ...prefs.cooking,
      },
    }));
    
    // Futuras migrações serão adicionadas aqui
  }

  private validatePreferences(preferences: UserPreferences): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validações básicas
    if (!preferences.theme || !['light', 'dark', 'auto'].includes(preferences.theme)) {
      errors.push('Tema inválido');
    }
    
    if (!preferences.language || typeof preferences.language !== 'string') {
      errors.push('Idioma inválido');
    }
    
    // Mais validações podem ser adicionadas
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private validatePreferenceValue<K extends keyof UserPreferences>(
    key: K, 
    value: UserPreferences[K]
  ): boolean {
    const validator = this.validators.get(String(key));
    return validator ? validator(value) : true;
  }

  private calculateChanges(
    oldPrefs: UserPreferences, 
    newPrefs: UserPreferences
  ): PreferenceChange[] {
    const changes: PreferenceChange[] = [];
    const timestamp = new Date();
    
    // Comparação simples de propriedades de primeiro nível
    Object.keys(newPrefs).forEach(key => {
      const oldValue = (oldPrefs as any)[key];
      const newValue = (newPrefs as any)[key];
      
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          key,
          oldValue,
          newValue,
          timestamp,
          source: 'user',
        });
      }
    });
    
    return changes;
  }

  private getPreferencesKey(userId: string): string {
    return `${STORAGE_KEYS.USER_PREFERENCES}_${userId}`;
  }

  private isCacheValid(): boolean {
    return (Date.now() - this.lastCacheUpdate) < this.config.cacheTimeout;
  }

  private async createBackup(userId: string, preferences: VersionedPreferences): Promise<void> {
    try {
      const backupKey = `${STORAGE_KEYS.USER_PREFERENCES}_backup_${userId}_${Date.now()}`;
      await this.storageManager.save(backupKey, preferences, {
        ttl: 30 * 24 * 60 * 60 * 1000, // 30 dias
      });
    } catch (error) {
      console.warn('⚠️ Falha ao criar backup de preferências:', error);
    }
  }
}