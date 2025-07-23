/**
 * 🪝 useRecipes - Hook Principal de Receitas
 * 
 * Hook customizado que centraliza toda a lógica de gerenciamento de receitas,
 * incluindo loading, cache, busca, filtros e favoritos.
 * 
 * @author RecipeApp Team
 * @since Fase 3 - Implementation Layer
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { DataLoaderBridge } from '../../../business/bridges/controller/DataLoaderBridge';
import { StorageManager } from '../../storage/controller/StorageManager';
import { Recipe } from '../../../core/entities/interface/Recipe';
import { useAppContext } from '../../contexts/providers/AppProvider';
import { useDebounce } from './useDebounce';

/**
 * 🎯 Configurações do hook
 */
interface UseRecipesConfig {
  autoLoad?: boolean;
  cacheEnabled?: boolean;
  searchDebounceMs?: number;
  refreshInterval?: number;
  enableRealTimeUpdates?: boolean;
}

/**
 * 🔍 Filtros de receitas
 */
export interface RecipeFilters {
  categoryId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  maxPrepTime?: number;
  maxCookTime?: number;
  dietaryType?: string[];
  tags?: string[];
  rating?: number;
  servings?: { min?: number; max?: number };
  ingredients?: string[];
}

/**
 * 📊 Estado de busca
 */
interface SearchState {
  query: string;
  isSearching: boolean;
  searchResults: Recipe[];
  totalResults: number;
  searchTime: number;
  suggestions: string[];
}

/**
 * ⚡ Estado de carregamento
 */
interface LoadingState {
  initial: boolean;
  refresh: boolean;
  search: boolean;
  filter: boolean;
  loadMore: boolean;
}

/**
 * 📋 Estado do hook
 */
interface RecipesState {
  // Dados principais
  recipes: Recipe[];
  filteredRecipes: Recipe[];
  favoriteRecipes: Recipe[];
  
  // Paginação
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  
  // Estados de loading
  loading: LoadingState;
  
  // Busca e filtros
  search: SearchState;
  activeFilters: RecipeFilters;
  
  // Metadados
  lastUpdated: Date | null;
  totalCount: number;
  
  // Erros
  error: string | null;
  hasError: boolean;
}

/**
 * 🏭 Estado inicial
 */
const initialState: RecipesState = {
  recipes: [],
  filteredRecipes: [],
  favoriteRecipes: [],
  
  currentPage: 1,
  totalPages: 1,
  hasMore: false,
  
  loading: {
    initial: false,
    refresh: false,
    search: false,
    filter: false,
    loadMore: false,
  },
  
  search: {
    query: '',
    isSearching: false,
    searchResults: [],
    totalResults: 0,
    searchTime: 0,
    suggestions: [],
  },
  
  activeFilters: {},
  lastUpdated: null,
  totalCount: 0,
  error: null,
  hasError: false,
};

/**
 * 🪝 Hook useRecipes
 */
export const useRecipes = (config: UseRecipesConfig = {}) => {
  const {
    autoLoad = true,
    cacheEnabled = true,
    searchDebounceMs = 300,
    refreshInterval = 300000, // 5 minutos
    enableRealTimeUpdates = false,
  } = config;

  const { state: appState } = useAppContext();
  const [state, setState] = useState<RecipesState>(initialState);
  
  // Refs para otimização
  const dataLoader = useRef(DataLoaderBridge.getInstance());
  const storageManager = useRef(StorageManager.getInstance());
  const abortController = useRef<AbortController | null>(null);
  
  // Debounce para busca
  const debouncedSearchQuery = useDebounce(state.search.query, searchDebounceMs);

  /**
   * 🔄 Carrega receitas
   */
  const loadRecipes = useCallback(async (refresh = false): Promise<void> => {
    try {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, [refresh ? 'refresh' : 'initial']: true },
        hasError: false,
        error: null,
      }));

      console.log('🔄 Carregando receitas...');
      
      let recipes: Recipe[];
      
      // Tenta usar dados do contexto primeiro
      if (appState.recipes.length > 0 && !refresh) {
        recipes = appState.recipes;
        console.log('📋 Usando receitas do contexto global');
      } else {
        // Carrega via DataLoader
        recipes = await dataLoader.current.loadRecipes();
        console.log(`📖 ${recipes.length} receitas carregadas`);
      }

      // Atualiza estado
      setState(prev => ({
        ...prev,
        recipes,
        filteredRecipes: recipes,
        totalCount: recipes.length,
        lastUpdated: new Date(),
        currentPage: 1,
        totalPages: Math.ceil(recipes.length / 20), // 20 por página
        hasMore: recipes.length > 20,
      }));

      // Cache se habilitado
      if (cacheEnabled) {
        await storageManager.current.save('recipes_cache', recipes, {
          ttl: 24 * 60 * 60 * 1000, // 24 horas
        });
      }

    } catch (error) {
      console.error('❌ Erro ao carregar receitas:', error);
      setState(prev => ({
        ...prev,
        hasError: true,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }));
    } finally {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, initial: false, refresh: false },
      }));
    }
  }, [appState.recipes, cacheEnabled]);

  /**
   * 🔍 Busca receitas
   */
  const searchRecipes = useCallback(async (query: string): Promise<void> => {
    if (!query.trim()) {
      setState(prev => ({
        ...prev,
        search: {
          ...prev.search,
          query: '',
          searchResults: [],
          totalResults: 0,
          isSearching: false,
        },
        filteredRecipes: prev.recipes,
      }));
      return;
    }

    try {
      setState(prev => ({
        ...prev,
        search: { ...prev.search, isSearching: true, query },
        loading: { ...prev.loading, search: true },
      }));

      const startTime = Date.now();
      
      // Cancela busca anterior se houver
      if (abortController.current) {
        abortController.current.abort();
      }
      abortController.current = new AbortController();

      console.log(`🔍 Buscando receitas: "${query}"`);
      
      // Usa DataLoader para busca
      const searchResults = await dataLoader.current.searchRecipes(query, state.recipes);
      
      const searchTime = Date.now() - startTime;

      setState(prev => ({
        ...prev,
        search: {
          ...prev.search,
          searchResults,
          totalResults: searchResults.length,
          searchTime,
          isSearching: false,
        },
        filteredRecipes: searchResults,
      }));

      console.log(`✅ Busca concluída: ${searchResults.length} resultados em ${searchTime}ms`);

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('❌ Erro na busca:', error);
        setState(prev => ({
          ...prev,
          search: { ...prev.search, isSearching: false },
          hasError: true,
          error: 'Erro na busca de receitas',
        }));
      }
    } finally {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, search: false },
      }));
    }
  }, [state.recipes]);

  /**
   * 🎯 Aplica filtros
   */
  const applyFilters = useCallback(async (filters: RecipeFilters): Promise<void> => {
    try {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, filter: true },
        activeFilters: filters,
      }));

      console.log('🎯 Aplicando filtros:', filters);

      let recipesToFilter = state.search.query ? state.search.searchResults : state.recipes;
      
      // Aplica filtros usando helpers
      let filtered = recipesToFilter;

      if (filters.categoryId) {
        filtered = filtered.filter(recipe => recipe.categoryId === filters.categoryId);
      }

      if (filters.difficulty) {
        filtered = filtered.filter(recipe => recipe.difficulty === filters.difficulty);
      }

      if (filters.maxPrepTime) {
        filtered = filtered.filter(recipe => recipe.prepTime <= filters.maxPrepTime!);
      }

      if (filters.maxCookTime) {
        filtered = filtered.filter(recipe => recipe.cookTime <= filters.maxCookTime!);
      }

      if (filters.rating) {
        filtered = filtered.filter(recipe => recipe.rating >= filters.rating!);
      }

      if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter(recipe => 
          filters.tags!.some(tag => recipe.tags.includes(tag))
        );
      }

      setState(prev => ({
        ...prev,
        filteredRecipes: filtered,
        currentPage: 1,
        totalPages: Math.ceil(filtered.length / 20),
        hasMore: filtered.length > 20,
      }));

      console.log(`✅ Filtros aplicados: ${filtered.length} receitas`);

    } catch (error) {
      console.error('❌ Erro ao aplicar filtros:', error);
    } finally {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, filter: false },
      }));
    }
  }, [state.recipes, state.search]);

  /**
   * ❤️ Gerencia favoritos
   */
  const toggleFavorite = useCallback(async (recipeId: string): Promise<void> => {
    try {
      // TODO: Implementar lógica de favoritos com UserContext
      console.log(`❤️ Toggle favorito: ${recipeId}`);
      
      // Por agora, apenas simula
      setState(prev => {
        const isFavorite = prev.favoriteRecipes.some(r => r.id === recipeId);
        const recipe = prev.recipes.find(r => r.id === recipeId);
        
        if (!recipe) return prev;
        
        const newFavorites = isFavorite
          ? prev.favoriteRecipes.filter(r => r.id !== recipeId)
          : [...prev.favoriteRecipes, recipe];
        
        return {
          ...prev,
          favoriteRecipes: newFavorites,
        };
      });

    } catch (error) {
      console.error('❌ Erro ao gerenciar favorito:', error);
    }
  }, []);

  /**
   * 📄 Carrega mais receitas (paginação)
   */
  const loadMore = useCallback(async (): Promise<void> => {
    if (!state.hasMore || state.loading.loadMore) return;

    try {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, loadMore: true },
      }));

      // Simula carregamento de mais receitas
      const nextPage = state.currentPage + 1;
      
      setState(prev => ({
        ...prev,
        currentPage: nextPage,
        hasMore: nextPage < prev.totalPages,
      }));

    } catch (error) {
      console.error('❌ Erro ao carregar mais:', error);
    } finally {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, loadMore: false },
      }));
    }
  }, [state.hasMore, state.currentPage, state.totalPages, state.loading.loadMore]);

  /**
   * 🧹 Limpa filtros
   */
  const clearFilters = useCallback((): void => {
    setState(prev => ({
      ...prev,
      activeFilters: {},
      filteredRecipes: prev.search.query ? prev.search.searchResults : prev.recipes,
    }));
  }, []);

  /**
   * 🔄 Refresh manual
   */
  const refresh = useCallback((): Promise<void> => {
    return loadRecipes(true);
  }, [loadRecipes]);

  /**
   * 🧹 Limpa busca
   */
  const clearSearch = useCallback((): void => {
    setState(prev => ({
      ...prev,
      search: {
        ...initialState.search,
      },
      filteredRecipes: prev.recipes,
    }));
  }, []);

  /**
   * 📊 Getters computados
   */
  const getters = useMemo(() => ({
    // Estado da busca
    isSearchActive: !!state.search.query,
    hasSearchResults: state.search.searchResults.length > 0,
    
    // Estado dos filtros
    hasActiveFilters: Object.keys(state.activeFilters).length > 0,
    activeFilterCount: Object.keys(state.activeFilters).length,
    
    // Estado geral
    isEmpty: state.filteredRecipes.length === 0,
    isLoading: Object.values(state.loading).some(Boolean),
    hasData: state.recipes.length > 0,
    
    // Paginação
    canLoadMore: state.hasMore && !state.loading.loadMore,
    
    // Receitas por categoria (para estatísticas)
    recipesByCategory: state.recipes.reduce((acc, recipe) => {
      acc[recipe.categoryId] = (acc[recipe.categoryId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  }), [state]);

  /**
   * 🔄 Effects
   */

  // Auto-load inicial
  useEffect(() => {
    if (autoLoad && !state.recipes.length && !state.loading.initial) {
      loadRecipes();
    }
  }, [autoLoad, loadRecipes, state.recipes.length, state.loading.initial]);

  // Busca com debounce
  useEffect(() => {
    if (debouncedSearchQuery !== state.search.query) {
      searchRecipes(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, searchRecipes]);

  // Refresh automático
  useEffect(() => {
    if (!enableRealTimeUpdates || !refreshInterval) return;

    const interval = setInterval(() => {
      if (!state.loading.refresh) {
        refresh();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [enableRealTimeUpdates, refreshInterval, refresh, state.loading.refresh]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  /**
   * 📋 Retorno do hook
   */
  return {
    // Estado
    ...state,
    ...getters,
    
    // Ações
    loadRecipes,
    searchRecipes,
    applyFilters,
    clearFilters,
    toggleFavorite,
    loadMore,
    refresh,
    clearSearch,
    
    // Utilitários
    getRecipeById: (id: string) => state.recipes.find(r => r.id === id),
    getRecipesByCategory: (categoryId: string) => 
      state.recipes.filter(r => r.categoryId === categoryId),
    isFavorite: (recipeId: string) => 
      state.favoriteRecipes.some(r => r.id === recipeId),
  };
};