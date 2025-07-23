/**
 * 📱 App Provider - Provider Principal da Aplicação
 * 
 * Provider raiz que centraliza todo o estado global da aplicação,
 * incluindo dados, configurações, tema e estado de loading.
 * 
 * @author RecipeApp Team
 * @since Fase 3 - Implementation Layer
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { StorageManager } from '../../storage/controller/StorageManager';
import { DataLoaderBridge } from '../../../business/bridges/controller/DataLoaderBridge';
import { Recipe } from '../../../core/entities/interface/Recipe';
import { Category } from '../../../core/entities/interface/Category';
import { UserPreferences } from '../interface/ContextTypes';
import { LoadingManager } from '../../storage/controller/LoadingManager';

/**
 * 🎯 Estado global da aplicação
 */
export interface AppState {
  // Estado de inicialização
  isInitialized: boolean;
  isLoading: boolean;
  initializationError: string | null;
  
  // Dados principais
  recipes: Recipe[];
  categories: Category[];
  
  // Estado de loading específico
  loadingStates: {
    recipes: boolean;
    categories: boolean;
    favorites: boolean;
    sync: boolean;
  };
  
  // Configurações e preferências
  userPreferences: UserPreferences;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  
  // Estado da aplicação
  isOnline: boolean;
  lastSync: Date | null;
  hasError: boolean;
  errorMessage: string | null;
  
  // Cache e performance
  cacheHealth: 'good' | 'warning' | 'critical';
  performanceMode: 'high' | 'balanced' | 'battery';
}

/**
 * ⚡ Ações do reducer
 */
export type AppAction =
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INITIALIZATION_ERROR'; payload: string | null }
  | { type: 'SET_RECIPES'; payload: Recipe[] }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'SET_LOADING_STATE'; payload: { key: keyof AppState['loadingStates']; value: boolean } }
  | { type: 'SET_USER_PREFERENCES'; payload: UserPreferences }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'auto' }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'SET_LAST_SYNC'; payload: Date | null }
  | { type: 'SET_ERROR'; payload: { hasError: boolean; message: string | null } }
  | { type: 'SET_CACHE_HEALTH'; payload: 'good' | 'warning' | 'critical' }
  | { type: 'SET_PERFORMANCE_MODE'; payload: 'high' | 'balanced' | 'battery' }
  | { type: 'RESET_STATE' };

/**
 * 🏭 Estado inicial
 */
const initialState: AppState = {
  isInitialized: false,
  isLoading: true,
  initializationError: null,
  
  recipes: [],
  categories: [],
  
  loadingStates: {
    recipes: false,
    categories: false,
    favorites: false,
    sync: false,
  },
  
  userPreferences: {
    theme: 'auto',
    language: 'pt-BR',
    notifications: {
      enabled: true,
      dailyRecipe: false,
      favoriteUpdates: true,
      newCategories: false,
    },
    dietary: {
      restrictions: [],
      preferences: [],
      allergies: [],
    },
    display: {
      showImages: true,
      imageQuality: 'medium',
      animationsEnabled: true,
      compactMode: false,
    },
    privacy: {
      shareUsageData: false,
      personalizedRecommendations: true,
    },
  },
  
  theme: 'auto',
  language: 'pt-BR',
  isOnline: true,
  lastSync: null,
  hasError: false,
  errorMessage: null,
  cacheHealth: 'good',
  performanceMode: 'balanced',
};

/**
 * 🎮 Reducer da aplicação
 */
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };
      
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_INITIALIZATION_ERROR':
      return { ...state, initializationError: action.payload };
      
    case 'SET_RECIPES':
      return { ...state, recipes: action.payload };
      
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
      
    case 'SET_LOADING_STATE':
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          [action.payload.key]: action.payload.value,
        },
      };
      
    case 'SET_USER_PREFERENCES':
      return { ...state, userPreferences: action.payload };
      
    case 'SET_THEME':
      return { 
        ...state, 
        theme: action.payload,
        userPreferences: {
          ...state.userPreferences,
          theme: action.payload,
        },
      };
      
    case 'SET_LANGUAGE':
      return { 
        ...state, 
        language: action.payload,
        userPreferences: {
          ...state.userPreferences,
          language: action.payload,
        },
      };
      
    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload };
      
    case 'SET_LAST_SYNC':
      return { ...state, lastSync: action.payload };
      
    case 'SET_ERROR':
      return { 
        ...state, 
        hasError: action.payload.hasError,
        errorMessage: action.payload.message,
      };
      
    case 'SET_CACHE_HEALTH':
      return { ...state, cacheHealth: action.payload };
      
    case 'SET_PERFORMANCE_MODE':
      return { ...state, performanceMode: action.payload };
      
    case 'RESET_STATE':
      return { ...initialState, isInitialized: false };
      
    default:
      return state;
  }
}

/**
 * 🔗 Context da aplicação
 */
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // Métodos de conveniência
  initializeApp: () => Promise<void>;
  refreshData: () => Promise<void>;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  setTheme: (theme: 'light' | 'dark' | 'auto') => Promise<void>;
  setLanguage: (language: string) => Promise<void>;
  clearError: () => void;
  resetApp: () => Promise<void>;
  
  // Getters úteis
  isAppReady: boolean;
  hasData: boolean;
  isLoadingAny: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * 📱 Props do Provider
 */
interface AppProviderProps {
  children: ReactNode;
  config?: {
    autoInitialize?: boolean;
    loadingTimeout?: number;
    cacheEnabled?: boolean;
    debugMode?: boolean;
  };
}

/**
 * 🚀 App Provider Component
 */
export const AppProvider: React.FC<AppProviderProps> = ({ 
  children, 
  config = {} 
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  const {
    autoInitialize = true,
    loadingTimeout = 30000, // 30 segundos
    cacheEnabled = true,
    debugMode = __DEV__
  } = config;

  /**
   * 🏁 Inicializa a aplicação
   */
  const initializeApp = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_INITIALIZATION_ERROR', payload: null });
      
      console.log('🚀 Inicializando aplicação...');
      
      // 1. Inicializa StorageManager
      const storageManager = StorageManager.getInstance({
        ttl: 24 * 60 * 60 * 1000, // 24 horas
        enableCompression: true,
        autoCleanup: true,
      });
      
      await storageManager.initialize();
      console.log('✅ StorageManager inicializado');
      
      // 2. Inicializa LoadingManager
      const loadingManager = LoadingManager.getInstance();
      await loadingManager.initialize();
      console.log('✅ LoadingManager inicializado');
      
      // 3. Carrega dados principais
      await loadInitialData();
      
      // 4. Carrega preferências do usuário
      await loadUserPreferences();
      
      // 5. Verifica status de conexão
      updateOnlineStatus();
      
      dispatch({ type: 'SET_INITIALIZED', payload: true });
      console.log('🎉 Aplicação inicializada com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro na inicialização:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      dispatch({ type: 'SET_INITIALIZATION_ERROR', payload: errorMessage });
      
      // Tenta carregar dados em modo degradado
      await loadFallbackData();
      
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /**
   * 📚 Carrega dados iniciais
   */
  const loadInitialData = async (): Promise<void> => {
    const dataLoader = DataLoaderBridge.getInstance();
    
    try {
      // Carrega receitas
      dispatch({ type: 'SET_LOADING_STATE', payload: { key: 'recipes', value: true } });
      const recipes = await dataLoader.loadRecipes();
      dispatch({ type: 'SET_RECIPES', payload: recipes });
      console.log(`📖 ${recipes.length} receitas carregadas`);
      
      // Carrega categorias
      dispatch({ type: 'SET_LOADING_STATE', payload: { key: 'categories', value: true } });
      const categories = await dataLoader.loadCategories();
      dispatch({ type: 'SET_CATEGORIES', payload: categories });
      console.log(`📂 ${categories.length} categorias carregadas`);
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados iniciais:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING_STATE', payload: { key: 'recipes', value: false } });
      dispatch({ type: 'SET_LOADING_STATE', payload: { key: 'categories', value: false } });
    }
  };

  /**
   * 📱 Carrega preferências do usuário
   */
  const loadUserPreferences = async (): Promise<void> => {
    try {
      const storageManager = StorageManager.getInstance();
      const result = await storageManager.load<UserPreferences>('user_preferences');
      
      if (result.success && result.data) {
        dispatch({ type: 'SET_USER_PREFERENCES', payload: result.data });
        dispatch({ type: 'SET_THEME', payload: result.data.theme });
        dispatch({ type: 'SET_LANGUAGE', payload: result.data.language });
        console.log('✅ Preferências do usuário carregadas');
      }
    } catch (error) {
      console.warn('⚠️ Erro ao carregar preferências, usando padrões:', error);
    }
  };

  /**
   * 💾 Dados de fallback em caso de erro
   */
  const loadFallbackData = async (): Promise<void> => {
    try {
      console.log('🔄 Carregando dados de fallback...');
      
      // Tenta carregar dados do cache local
      const storageManager = StorageManager.getInstance();
      
      const recipesResult = await storageManager.load<Recipe[]>('recipes_cache');
      if (recipesResult.success) {
        dispatch({ type: 'SET_RECIPES', payload: recipesResult.data });
      }
      
      const categoriesResult = await storageManager.load<Category[]>('categories_cache');
      if (categoriesResult.success) {
        dispatch({ type: 'SET_CATEGORIES', payload: categoriesResult.data });
      }
      
      console.log('✅ Dados de fallback carregados');
      
    } catch (error) {
      console.error('❌ Falha ao carregar dados de fallback:', error);
    }
  };

  /**
   * 🔄 Atualiza dados
   */
  const refreshData = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await loadInitialData();
      dispatch({ type: 'SET_LAST_SYNC', payload: new Date() });
    } catch (error) {
      console.error('❌ Erro ao atualizar dados:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { hasError: true, message: 'Falha ao atualizar dados' }
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /**
   * ⚙️ Atualiza preferências do usuário
   */
  const updateUserPreferences = async (preferences: Partial<UserPreferences>): Promise<void> => {
    try {
      const newPreferences = { ...state.userPreferences, ...preferences };
      
      // Salva no storage
      const storageManager = StorageManager.getInstance();
      await storageManager.save('user_preferences', newPreferences);
      
      // Atualiza estado
      dispatch({ type: 'SET_USER_PREFERENCES', payload: newPreferences });
      
      console.log('✅ Preferências atualizadas');
      
    } catch (error) {
      console.error('❌ Erro ao salvar preferências:', error);
      throw error;
    }
  };

  /**
   * 🎨 Define tema
   */
  const setTheme = async (theme: 'light' | 'dark' | 'auto'): Promise<void> => {
    await updateUserPreferences({ theme });
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  /**
   * 🌐 Define idioma
   */
  const setLanguage = async (language: string): Promise<void> => {
    await updateUserPreferences({ language });
    dispatch({ type: 'SET_LANGUAGE', payload: language });
  };

  /**
   * 🧹 Limpa erro
   */
  const clearError = (): void => {
    dispatch({ type: 'SET_ERROR', payload: { hasError: false, message: null } });
  };

  /**
   * 🔄 Reseta aplicação
   */
  const resetApp = async (): Promise<void> => {
    try {
      const storageManager = StorageManager.getInstance();
      await storageManager.clear();
      dispatch({ type: 'RESET_STATE' });
      await initializeApp();
    } catch (error) {
      console.error('❌ Erro ao resetar aplicação:', error);
    }
  };

  /**
   * 📡 Atualiza status de conexão
   */
  const updateOnlineStatus = (): void => {
    // TODO: Implementar detecção real de conexão
    dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
  };

  /**
   * 🎯 Getters computados
   */
  const isAppReady = state.isInitialized && !state.isLoading && !state.hasError;
  const hasData = state.recipes.length > 0 && state.categories.length > 0;
  const isLoadingAny = state.isLoading || Object.values(state.loadingStates).some(Boolean);

  /**
   * 🔄 Effects
   */
  useEffect(() => {
    if (autoInitialize) {
      initializeApp();
    }
  }, [autoInitialize]);

  // Timeout de inicialização
  useEffect(() => {
    if (state.isLoading) {
      const timeout = setTimeout(() => {
        if (state.isLoading) {
          dispatch({ 
            type: 'SET_INITIALIZATION_ERROR', 
            payload: 'Timeout na inicialização' 
          });
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }, loadingTimeout);
      
      return () => clearTimeout(timeout);
    }
  }, [state.isLoading, loadingTimeout]);

  // Debug logs
  useEffect(() => {
    if (debugMode) {
      console.log('🐛 AppState Update:', {
        isInitialized: state.isInitialized,
        isLoading: state.isLoading,
        recipesCount: state.recipes.length,
        categoriesCount: state.categories.length,
        hasError: state.hasError,
      });
    }
  }, [state, debugMode]);

  /**
   * 📋 Valor do contexto
   */
  const contextValue: AppContextType = {
    state,
    dispatch,
    initializeApp,
    refreshData,
    updateUserPreferences,
    setTheme,
    setLanguage,
    clearError,
    resetApp,
    isAppReady,
    hasData,
    isLoadingAny,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * 🪝 Hook para usar o contexto
 */
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  
  return context;
};