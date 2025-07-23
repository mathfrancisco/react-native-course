/**
 * 📊 Data Provider - Provider Específico de Dados
 * 
 * Provider especializado no gerenciamento de dados da aplicação,
 * incluindo receitas, categorias, favoritos e sincronização.
 * 
 * @author RecipeApp Team
 * @since Fase 3 - Implementation Layer
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { useAppContext } from './AppProvider';
import { RecipeRepositoryImpl } from '../../repositories/controller/RecipeRepositoryImpl';
import { Recipe } from '../../../core/entities/interface/Recipe';
import { Category } from '../../../core/entities/interface/Category';

/**
 * 🎯 Estado de dados
 */
export interface DataState {
  // Dados principais
  recipes: {
    data: Recipe[];
    isLoading: boolean;
    isRefreshing: boolean;
    error: string | null;
    lastUpdated: Date | null;
    hasMore: boolean;
    currentPage: number;
  };
  
  categories: {
    data: Category[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
  };
  
  favorites: {
    recipeIds: string[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
  };
  
  // Estados de busca
  search: {
    query: string;
    results: Recipe[];
    isSearching: boolean;
    suggestions: string[];
    recentSearches: string[];
  };
  
  // Estados de filtros
  filters: {
    active: Record<string, any>;
    available: Record<string, any[]>;
    isApplying: boolean;
  };
  
  // Sincronização
  sync: {
    isOnline: boolean;
    lastSync: Date | null;
    isSyncing: boolean;
    pendingOperations: number;
    syncError: string | null;
  };
  
  // Cache e performance
  cache: {
    size: number;
    hitRate: number;
    lastCleanup: Date | null;
  };
}

/**
 * ⚡ Ações do reducer de dados
 */
export type DataAction =
  // Receitas
  | { type: 'RECIPES_LOADING'; payload: boolean }
  | { type: 'RECIPES_REFRESHING'; payload: boolean }
  | { type: 'RECIPES_SUCCESS'; payload: { recipes: Recipe[]; append?: boolean } }
  | { type: 'RECIPES_ERROR'; payload: string }
  | { type: 'RECIPES_UPDATE_PAGE'; payload: number }
  | { type: 'RECIPES_SET_HAS_MORE'; payload: boolean }
  
  // Categorias
  | { type: 'CATEGORIES_LOADING'; payload: boolean }
  | { type: 'CATEGORIES_SUCCESS'; payload: Category[] }
  | { type: 'CATEGORIES_ERROR'; payload: string }
  
  // Favoritos
  | { type: 'FAVORITES_LOADING'; payload: boolean }
  | { type: 'FAVORITES_SUCCESS'; payload: string[] }
  | { type: 'FAVORITES_ERROR'; payload: string }
  | { type: 'FAVORITES_TOGGLE'; payload: string }
  
  // Busca
  | { type: 'SEARCH_SET_QUERY'; payload: string }
  | { type: 'SEARCH_LOADING'; payload: boolean }
  | { type: 'SEARCH_SUCCESS'; payload: Recipe[] }
  | { type: 'SEARCH_ADD_RECENT'; payload: string }
  | { type: 'SEARCH_CLEAR' }
  
  // Filtros
  | { type: 'FILTERS_SET_ACTIVE'; payload: Record<string, any> }
  | { type: 'FILTERS_SET_AVAILABLE'; payload: Record<string, any[]> }
  | { type: 'FILTERS_APPLYING'; payload: boolean }
  | { type: 'FILTERS_CLEAR' }
  
  // Sincronização
  | { type: 'SYNC_SET_ONLINE'; payload: boolean }
  | { type: 'SYNC_LOADING'; payload: boolean }
  | { type: 'SYNC_SUCCESS'; payload: Date }
  | { type: 'SYNC_ERROR'; payload: string }
  | { type: 'SYNC_SET_PENDING'; payload: number }
  
  // Cache
  | { type: 'CACHE_UPDATE_STATS'; payload: { size: number; hitRate: number } }
  | { type: 'CACHE_SET_CLEANUP'; payload: Date };

/**
 * 🏭 Estado inicial
 */
const initialState: DataState = {
  recipes: {
    data: [],
    isLoading: false,
    isRefreshing: false,
    error: null,
    lastUpdated: null,
    hasMore: true,
    currentPage: 1,
  },
  
  categories: {
    data: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
  },
  
  favorites: {
    recipeIds: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
  },
  
  search: {
    query: '',
    results: [],
    isSearching: false,
    suggestions: [],
    recentSearches: [],
  },
  
  filters: {
    active: {},
    available: {},
    isApplying: false,
  },
  
  sync: {
    isOnline: true,
    lastSync: null,
    isSyncing: false,
    pendingOperations: 0,
    syncError: null,
  },
  
  cache: {
    size: 0,
    hitRate: 0,
    lastCleanup: null,
  },
};

/**
 * 🎮 Reducer de dados
 */
function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    // Receitas
    case 'RECIPES_LOADING':
      return {
        ...state,
        recipes: { ...state.recipes, isLoading: action.payload, error: null },
      };
      
    case 'RECIPES_REFRESHING':
      return {
        ...state,
        recipes: { ...state.recipes, isRefreshing: action.payload },
      };
      
    case 'RECIPES_SUCCESS':
      return {
        ...state,
        recipes: {
          ...state.recipes,
          data: action.payload.append 
            ? [...state.recipes.data, ...action.payload.recipes]
            : action.payload.recipes,
          isLoading: false,
          isRefreshing: false,
          error: null,
          lastUpdated: new Date(),
        },
      };
      
    case 'RECIPES_ERROR':
      return {
        ...state,
        recipes: {
          ...state.recipes,
          isLoading: false,
          isRefreshing: false,
          error: action.payload,
        },
      };
      
    case 'RECIPES_UPDATE_PAGE':
      return {
        ...state,
        recipes: { ...state.recipes, currentPage: action.payload },
      };
      
    case 'RECIPES_SET_HAS_MORE':
      return {
        ...state,
        recipes: { ...state.recipes, hasMore: action.payload },
      };

    // Categorias
    case 'CATEGORIES_LOADING':
      return {
        ...state,
        categories: { ...state.categories, isLoading: action.payload, error: null },
      };
      
    case 'CATEGORIES_SUCCESS':
      return {
        ...state,
        categories: {
          ...state.categories,
          data: action.payload,
          isLoading: false,
          error: null,
          lastUpdated: new Date(),
        },
      };
      
    case 'CATEGORIES_ERROR':
      return {
        ...state,
        categories: {
          ...state.categories,
          isLoading: false,
          error: action.payload,
        },
      };

    // Favoritos
    case 'FAVORITES_LOADING':
      return {
        ...state,
        favorites: { ...state.favorites, isLoading: action.payload, error: null },
      };
      
    case 'FAVORITES_SUCCESS':
      return {
        ...state,
        favorites: {
          ...state.favorites,
          recipeIds: action.payload,
          isLoading: false,
          error: null,
          lastUpdated: new Date(),
        },
      };
      
    case 'FAVORITES_ERROR':
      return {
        ...state,
        favorites: {
          ...state.favorites,
          isLoading: false,
          error: action.payload,
        },
      };
      
    case 'FAVORITES_TOGGLE':
      const isFavorite = state.favorites.recipeIds.includes(action.payload);
      return {
        ...state,
        favorites: {
          ...state.favorites,
          recipeIds: isFavorite
            ? state.favorites.recipeIds.filter(id => id !== action.payload)
            : [...state.favorites.recipeIds, action.payload],
          lastUpdated: new Date(),
        },
      };

    // Busca
    case 'SEARCH_SET_QUERY':
      return {
        ...state,
        search: { ...state.search, query: action.payload },
      };
      
    case 'SEARCH_LOADING':
      return {
        ...state,
        search: { ...state.search, isSearching: action.payload },
      };
      
    case 'SEARCH_SUCCESS':
      return {
        ...state,
        search: {
          ...state.search,
          results: action.payload,
          isSearching: false,
        },
      };
      
    case 'SEARCH_ADD_RECENT':
      const newRecentSearches = [
        action.payload,
        ...state.search.recentSearches.filter(s => s !== action.payload),
      ].slice(0, 10); // Máximo 10 buscas recentes
      
      return {
        ...state,
        search: { ...state.search, recentSearches: newRecentSearches },
      };
      
    case 'SEARCH_CLEAR':
      return {
        ...state,
        search: {
          ...state.search,
          query: '',
          results: [],
          isSearching: false,
        },
      };

    // Filtros
    case 'FILTERS_SET_ACTIVE':
      return {
        ...state,
        filters: { ...state.filters, active: action.payload },
      };
      
    case 'FILTERS_SET_AVAILABLE':
      return {
        ...state,
        filters: { ...state.filters, available: action.payload },
      };
      
    case 'FILTERS_APPLYING':
      return {
        ...state,
        filters: { ...state.filters, isApplying: action.payload },
      };
      
    case 'FILTERS_CLEAR':
      return {
        ...state,
        filters: { ...state.filters, active: {} },
      };

    // Sincronização
    case 'SYNC_SET_ONLINE':
      return {
        ...state,
        sync: { ...state.sync, isOnline: action.payload },
      };
      
    case 'SYNC_LOADING':
      return {
        ...state,
        sync: { ...state.sync, isSyncing: action.payload, syncError: null },
      };
      
    case 'SYNC_SUCCESS':
      return {
        ...state,
        sync: {
          ...state.sync,
          isSyncing: false,
          lastSync: action.payload,
          syncError: null,
        },
      };
      
    case 'SYNC_ERROR':
      return {
        ...state,
        sync: {
          ...state.sync,
          isSyncing: false,
          syncError: action.payload,
        },
      };
      
    case 'SYNC_SET_PENDING':
      return {
        ...state,
        sync: { ...state.sync, pendingOperations: action.payload },
      };

    // Cache
    case 'CACHE_UPDATE_STATS':
      return {
        ...state,
        cache: {
          ...state.cache,
          size: action.payload.size,
          hitRate: action.payload.hitRate,
        },
      };
      
    case 'CACHE_SET_CLEANUP':
      return {
        ...state,
        cache: { ...state.cache, lastCleanup: action.payload },
      };

    default:
      return state;
  }
}

/**
 * 🔗 Context de dados
 */
interface DataContextType {
  state: DataState;
  dispatch: React.Dispatch<DataAction>;
  
  // Métodos de receitas
  loadRecipes: (refresh?: boolean) => Promise<void>;
  loadMoreRecipes: () => Promise<void>;
  getRecipeById: (id: string) => Recipe | undefined;
  
  // Métodos de categorias
  loadCategories: () => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
  
  // Métodos de favoritos
  loadFavorites: () => Promise<void>;
  toggleFavorite: (recipeId: string) => void;
  isFavorite: (recipeId: string) => boolean;
  
  // Métodos de busca
  searchRecipes: (query: string) => Promise<void>;
  clearSearch: () => void;
  addRecentSearch: (query: string) => void;
  
  // Métodos de filtros
  applyFilters: (filters: Record<string, any>) => Promise<void>;
  clearFilters: () => void;
  
  // Métodos de sincronização
  syncData: () => Promise<void>;
  
  // Métodos de cache
  clearCache: () => void;
  updateCacheStats: () => void;
  
  // Getters úteis
  totalRecipes: number;
  favoriteRecipes: Recipe[];
  isDataReady: boolean;
  hasAnyError: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

/**
 * 📊 Props do Provider
 */
interface DataProviderProps {
  children: ReactNode;
  config?: {
    autoLoad?: boolean;
    pageSize?: number;
    cacheEnabled?: boolean;
    offlineMode?: boolean;
  };
}

/**
 * 🚀 Data Provider Component
 */
export const DataProvider: React.FC<DataProviderProps> = ({ 
  children, 
  config = {} 
}) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const { state: appState } = useAppContext();
  
  const {
    autoLoad = true,
    pageSize = 20,
    cacheEnabled = true,
    offlineMode = false,
  } = config;

  // Repository instances
  const recipeRepository = RecipeRepositoryImpl.getInstance();

  /**
   * 📖 Carrega receitas
   */
  const loadRecipes = useCallback(async (refresh = false): Promise<void> => {
    try {
      if (refresh) {
        dispatch({ type: 'RECIPES_REFRESHING', payload: true });
      } else {
        dispatch({ type: 'RECIPES_LOADING', payload: true });
      }

      console.log(`🔄 Carregando receitas${refresh ? ' (refresh)' : ''}...`);
      
      const result = await recipeRepository.getAllRecipes({
        useCache: cacheEnabled,
        forceRefresh: refresh,
      });

      if (result.success) {
        dispatch({ 
          type: 'RECIPES_SUCCESS', 
          payload: { 
            recipes: result.data,
            append: false,
          }
        });
        
        // Atualiza estatísticas de cache
        if (result.metadata) {
          updateCacheStats();
        }
        
        console.log(`✅ ${result.data.length} receitas carregadas (${result.source})`);
      } else {
        throw result.error || new Error('Falha ao carregar receitas');
      }

    } catch (error) {
      console.error('❌ Erro ao carregar receitas:', error);
      dispatch({ 
        type: 'RECIPES_ERROR', 
        payload: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }, [recipeRepository, cacheEnabled]);

  /**
   * 📄 Carrega mais receitas (paginação)
   */
  const loadMoreRecipes = useCallback(async (): Promise<void> => {
    if (!state.recipes.hasMore || state.recipes.isLoading) return;

    try {
      // TODO: Implementar paginação real quando tiver backend
      console.log('📄 Carregando mais receitas...');
      
      // Por agora, simula que não há mais dados
      dispatch({ type: 'RECIPES_SET_HAS_MORE', payload: false });
      
    } catch (error) {
      console.error('❌ Erro ao carregar mais receitas:', error);
    }
  }, [state.recipes.hasMore, state.recipes.isLoading]);

  /**
   * 📂 Carrega categorias
   */
  const loadCategories = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'CATEGORIES_LOADING', payload: true });
      
      console.log('🔄 Carregando categorias...');
      
      // Usa as categorias do AppContext se disponível
      if (appState.categories.length > 0) {
        dispatch({ type: 'CATEGORIES_SUCCESS', payload: appState.categories });
        console.log(`✅ ${appState.categories.length} categorias carregadas (context)`);
        return;
      }

      // TODO: Implementar CaregoryRepository
      dispatch({ type: 'CATEGORIES_SUCCESS', payload: [] });
      
    } catch (error) {
      console.error('❌ Erro ao carregar categorias:', error);
      dispatch({ 
        type: 'CATEGORIES_ERROR', 
        payload: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }, [appState.categories]);

  /**
   * ❤️ Carrega favoritos
   */
  const loadFavorites = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'FAVORITES_LOADING', payload: true });
      
      // TODO: Implementar carregamento real de favoritos
      // Por agora, simula dados vazios
      dispatch({ type: 'FAVORITES_SUCCESS', payload: [] });
      
    } catch (error) {
      console.error('❌ Erro ao carregar favoritos:', error);
      dispatch({ 
        type: 'FAVORITES_ERROR', 
        payload: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }, []);

  /**
   * 🔍 Busca receitas
   */
  const searchRecipes = useCallback(async (query: string): Promise<void> => {
    if (!query.trim()) {
      dispatch({ type: 'SEARCH_CLEAR' });
      return;
    }

    try {
      dispatch({ type: 'SEARCH_SET_QUERY', payload: query });
      dispatch({ type: 'SEARCH_LOADING', payload: true });
      
      console.log(`🔍 Buscando receitas: "${query}"`);
      
      const result = await recipeRepository.searchRecipes(query);
      
      if (result.success) {
        dispatch({ type: 'SEARCH_SUCCESS', payload: result.data });
        dispatch({ type: 'SEARCH_ADD_RECENT', payload: query });
        console.log(`✅ ${result.data.length} receitas encontradas`);
      } else {
        throw result.error || new Error('Falha na busca');
      }

    } catch (error) {
      console.error('❌ Erro na busca:', error);
      dispatch({ type: 'SEARCH_LOADING', payload: false });
    }
  }, [recipeRepository]);

  /**
   * 🎯 Aplica filtros
   */
  const applyFilters = useCallback(async (filters: Record<string, any>): Promise<void> => {
    try {
      dispatch({ type: 'FILTERS_APPLYING', payload: true });
      dispatch({ type: 'FILTERS_SET_ACTIVE', payload: filters });
      
      console.log('🎯 Aplicando filtros:', filters);
      
      const result = await recipeRepository.getRecipesByFilter(filters);
      
      if (result.success) {
        dispatch({ 
          type: 'RECIPES_SUCCESS', 
          payload: { 
            recipes: result.data,
            append: false,
          }
        });
        console.log(`✅ ${result.data.length} receitas filtradas`);
      } else {
        throw result.error || new Error('Falha ao aplicar filtros');
      }

    } catch (error) {
      console.error('❌ Erro ao aplicar filtros:', error);
      dispatch({ 
        type: 'RECIPES_ERROR', 
        payload: error instanceof Error ? error.message : 'Erro nos filtros'
      });
    } finally {
      dispatch({ type: 'FILTERS_APPLYING', payload: false });
    }
  }, [recipeRepository]);

  /**
   * 🔄 Sincroniza dados
   */
  const syncData = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'SYNC_LOADING', payload: true });
      
      console.log('🔄 Sincronizando dados...');
      
      // Força refresh de todos os dados
      await Promise.all([
        loadRecipes(true),
        loadCategories(),
        loadFavorites(),
      ]);
      
      dispatch({ type: 'SYNC_SUCCESS', payload: new Date() });
      console.log('✅ Sincronização concluída');
      
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      dispatch({ 
        type: 'SYNC_ERROR', 
        payload: error instanceof Error ? error.message : 'Erro na sincronização'
      });
    }
  }, [loadRecipes, loadCategories, loadFavorites]);

  /**
   * 🧹 Limpa cache
   */
  const clearCache = useCallback((): void => {
    recipeRepository.clearCache();
    dispatch({ type: 'CACHE_SET_CLEANUP', payload: new Date() });
    console.log('🧹 Cache limpo');
  }, [recipeRepository]);

  /**
   * 📊 Atualiza estatísticas de cache
   */
  const updateCacheStats = useCallback((): void => {
    const metrics = recipeRepository.getMetrics();
    const hitRate = metrics.totalRequests > 0 
      ? (metrics.cacheHits / metrics.totalRequests) * 100 
      : 0;
    
    dispatch({ 
      type: 'CACHE_UPDATE_STATS', 
      payload: { 
        size: 0, // TODO: Calcular tamanho real do cache
        hitRate: Math.round(hitRate),
      }
    });
  }, [recipeRepository]);

  /**
   * 🔧 Métodos auxiliares
   */
  const getRecipeById = useCallback((id: string): Recipe | undefined => {
    return state.recipes.data.find(recipe => recipe.id === id);
  }, [state.recipes.data]);

  const getCategoryById = useCallback((id: string): Category | undefined => {
    return state.categories.data.find(category => category.id === id);
  }, [state.categories.data]);

  const toggleFavorite = useCallback((recipeId: string): void => {
    dispatch({ type: 'FAVORITES_TOGGLE', payload: recipeId });
    // TODO: Persistir favorito
  }, []);

  const isFavorite = useCallback((recipeId: string): boolean => {
    return state.favorites.recipeIds.includes(recipeId);
  }, [state.favorites.recipeIds]);

  const clearSearch = useCallback((): void => {
    dispatch({ type: 'SEARCH_CLEAR' });
  }, []);

  const addRecentSearch = useCallback((query: string): void => {
    dispatch({ type: 'SEARCH_ADD_RECENT', payload: query });
  }, []);

  const clearFilters = useCallback((): void => {
    dispatch({ type: 'FILTERS_CLEAR' });
    // Recarrega receitas sem filtros
    loadRecipes();
  }, [loadRecipes]);

  /**
   * 📊 Getters computados
   */
  const totalRecipes = state.recipes.data.length;
  const favoriteRecipes = state.recipes.data.filter(recipe => 
    state.favorites.recipeIds.includes(recipe.id)
  );
  const isDataReady = !state.recipes.isLoading && !state.categories.isLoading;
  const hasAnyError = !!(state.recipes.error || state.categories.error || state.favorites.error);

  /**
   * 🔄 Effects
   */

  // Auto-load inicial
  useEffect(() => {
    if (autoLoad && appState.isInitialized && isDataReady && !totalRecipes) {
      loadRecipes();
      loadCategories();
      loadFavorites();
    }
  }, [autoLoad, appState.isInitialized, isDataReady, totalRecipes, loadRecipes, loadCategories, loadFavorites]);

  // Atualiza estatísticas de cache periodicamente
  useEffect(() => {
    const interval = setInterval(updateCacheStats, 30000); // A cada 30s
    return () => clearInterval(interval);
  }, [updateCacheStats]);

  /**
   * 📋 Valor do contexto
   */
  const contextValue: DataContextType = {
    state,
    dispatch,
    
    // Receitas
    loadRecipes,
    loadMoreRecipes,
    getRecipeById,
    
    // Categorias
    loadCategories,
    getCategoryById,
    
    // Favoritos
    loadFavorites,
    toggleFavorite,
    isFavorite,
    
    // Busca
    searchRecipes,
    clearSearch,
    addRecentSearch,
    
    // Filtros
    applyFilters,
    clearFilters,
    
    // Sincronização
    syncData,
    
    // Cache
    clearCache,
    updateCacheStats,
    
    // Getters
    totalRecipes,
    favoriteRecipes,
    isDataReady,
    hasAnyError,
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

/**
 * 🪝 Hook para usar o contexto de dados
 */
export const useDataContext = (): DataContextType => {
  const context = useContext(DataContext);
  
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  
  return context;
};