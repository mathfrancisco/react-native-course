/**
 * 🪝 useFavorites - Hook para Gerenciamento de Favoritos
 * 
 * Hook especializado para operações com receitas favoritas,
 * incluindo persistência, sincronização e organização.
 * 
 * @author RecipeApp Team
 * @since Fase 3 - Implementation Layer
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FavoriteStorage } from '../../storage/controller/FavoriteStorage';
import { Recipe } from '../../../core/entities/interface/Recipe';
import { useAppContext } from '../../contexts/providers/AppProvider';
import { useDataContext } from '../../contexts/providers/DataProvider';

/**
 * 🎯 Configurações do hook
 */
interface UseFavoritesConfig {
  autoLoad?: boolean;
  enableSync?: boolean;
  enableAnalytics?: boolean;
  maxFavorites?: number;
  sortBy?: 'name' | 'dateAdded' | 'rating' | 'category';
  sortDirection?: 'asc' | 'desc';
}

/**
 * 📊 Estado de favoritos
 */
interface FavoritesState {
  // Dados principais
  favoriteIds: string[];
  favoriteRecipes: Recipe[];
  
  // Estados de loading
  isLoading: boolean;
  isAdding: boolean;
  isRemoving: boolean;
  isSyncing: boolean;
  
  // Organização
  sortBy: 'name' | 'dateAdded' | 'rating' | 'category';
  sortDirection: 'asc' | 'desc';
  groupBy: 'none' | 'category' | 'difficulty' | 'dateAdded';
  
  // Filtros
  searchQuery: string;
  filteredFavorites: Recipe[];
  
  // Estatísticas
  totalCount: number;
  favoritesByCategory: Record<string, number>;
  averageRating: number;
  lastAdded: Date | null;
  
  // Metadados
  lastUpdated: Date | null;
  lastSync: Date | null;
  
  // Erros
  error: string | null;
  hasError: boolean;
}

/**
 * 📈 Operação de favorito para histórico
 */
interface FavoriteOperation {
  id: string;
  recipeId: string;
  action: 'add' | 'remove';
  timestamp: Date;
  success: boolean;
  error?: string;
}

/**
 * 🏭 Estado inicial
 */
const createInitialState = (config: UseFavoritesConfig): FavoritesState => ({
  favoriteIds: [],
  favoriteRecipes: [],
  
  isLoading: false,
  isAdding: false,
  isRemoving: false,
  isSyncing: false,
  
  sortBy: config.sortBy || 'dateAdded',
  sortDirection: config.sortDirection || 'desc',
  groupBy: 'none',
  
  searchQuery: '',
  filteredFavorites: [],
  
  totalCount: 0,
  favoritesByCategory: {},
  averageRating: 0,
  lastAdded: null,
  
  lastUpdated: null,
  lastSync: null,
  
  error: null,
  hasError: false,
});

/**
 * 🪝 Hook useFavorites
 */
export const useFavorites = (config: UseFavoritesConfig = {}) => {
  const {
    autoLoad = true,
    enableSync = true,
    enableAnalytics = true,
    maxFavorites = 500,
    sortBy = 'dateAdded',
    sortDirection = 'desc',
  } = config;

  const { state: appState } = useAppContext();
  const { state: dataState, getRecipeById } = useDataContext();
  const [state, setState] = useState<FavoritesState>(() => createInitialState(config));
  
  // Refs para otimização
  const favoriteStorage = useRef(FavoriteStorage.getInstance());
  const operationHistory = useRef<FavoriteOperation[]>([]);
  const currentUserId = useRef('default_user'); // TODO: Pegar do contexto de auth

  /**
   * 📖 Carrega favoritos
   */
  const loadFavorites = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({
        ...prev,
        isLoading: true,
        hasError: false,
        error: null,
      }));

      console.log('📖 Carregando favoritos...');
      
      const result = await favoriteStorage.current.getFavorites(currentUserId.current);
      
      if (result.success) {
        const favoriteIds = result.data;
        
        // Busca dados completos das receitas
        const favoriteRecipes = favoriteIds
          .map(id => getRecipeById(id))
          .filter((recipe): recipe is Recipe => recipe !== undefined);

        setState(prev => ({
          ...prev,
          favoriteIds,
          favoriteRecipes,
          totalCount: favoriteIds.length,
          lastUpdated: new Date(),
        }));
        
        console.log(`✅ ${favoriteIds.length} favoritos carregados`);
      } else {
        throw result.error || new Error('Falha ao carregar favoritos');
      }

    } catch (error) {
      console.error('❌ Erro ao carregar favoritos:', error);
      setState(prev => ({
        ...prev,
        hasError: true,
        error: error instanceof Error ? error.message : 'Erro ao carregar favoritos',
      }));
    } finally {
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, [getRecipeById]);

  /**
   * ❤️ Adiciona favorito
   */
  const addFavorite = useCallback(async (recipeId: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isAdding: true }));
      
      // Verifica se já é favorito
      if (state.favoriteIds.includes(recipeId)) {
        console.log('⚠️ Receita já está nos favoritos');
        return true;
      }
      
      // Verifica limite
      if (state.totalCount >= maxFavorites) {
        throw new Error(`Limite de ${maxFavorites} favoritos atingido`);
      }
      
      console.log(`❤️ Adicionando favorito: ${recipeId}`);
      
      const result = await favoriteStorage.current.addFavorite(currentUserId.current, recipeId);
      
      if (result.success) {
        // Busca dados da receita
        const recipe = getRecipeById(recipeId);
        
        if (recipe) {
          setState(prev => ({
            ...prev,
            favoriteIds: [...prev.favoriteIds, recipeId],
            favoriteRecipes: [...prev.favoriteRecipes, recipe],
            totalCount: prev.totalCount + 1,
            lastAdded: new Date(),
            lastUpdated: new Date(),
          }));
        }
        
        // Registra operação no histórico
        operationHistory.current.push({
          id: `add_${Date.now()}`,
          recipeId,
          action: 'add',
          timestamp: new Date(),
          success: true,
        });
        
        console.log(`✅ Favorito adicionado: ${recipe?.title || recipeId}`);
        return true;
      } else {
        throw result.error || new Error('Falha ao adicionar favorito');
      }
      
    } catch (error) {
      console.error('❌ Erro ao adicionar favorito:', error);
      
      // Registra erro no histórico
      operationHistory.current.push({
        id: `add_error_${Date.now()}`,
        recipeId,
        action: 'add',
        timestamp: new Date(),
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
      
      setState(prev => ({
        ...prev,
        hasError: true,
        error: error instanceof Error ? error.message : 'Erro ao adicionar favorito',
      }));
      
      return false;
    } finally {
      setState(prev => ({ ...prev, isAdding: false }));
    }
  }, [state.favoriteIds, state.totalCount, maxFavorites, getRecipeById]);

  /**
   * 💔 Remove favorito
   */
  const removeFavorite = useCallback(async (recipeId: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isRemoving: true }));
      
      console.log(`💔 Removendo favorito: ${recipeId}`);
      
      const result = await favoriteStorage.current.removeFavorite(currentUserId.current, recipeId);
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          favoriteIds: prev.favoriteIds.filter(id => id !== recipeId),
          favoriteRecipes: prev.favoriteRecipes.filter(recipe => recipe.id !== recipeId),
          totalCount: prev.totalCount - 1,
          lastUpdated: new Date(),
        }));
        
        // Registra operação no histórico
        operationHistory.current.push({
          id: `remove_${Date.now()}`,
          recipeId,
          action: 'remove',
          timestamp: new Date(),
          success: true,
        });
        
        const recipe = getRecipeById(recipeId);
        console.log(`✅ Favorito removido: ${recipe?.title || recipeId}`);
        return true;
      } else {
        throw result.error || new Error('Falha ao remover favorito');
      }
      
    } catch (error) {
      console.error('❌ Erro ao remover favorito:', error);
      
      // Registra erro no histórico
      operationHistory.current.push({
        id: `remove_error_${Date.now()}`,
        recipeId,
        action: 'remove',
        timestamp: new Date(),
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
      
      setState(prev => ({
        ...prev,
        hasError: true,
        error: error instanceof Error ? error.message : 'Erro ao remover favorito',
      }));
      
      return false;
    } finally {
      setState(prev => ({ ...prev, isRemoving: false }));
    }
  }, [getRecipeById]);

  /**
   * 🔄 Toggle favorito
   */
  const toggleFavorite = useCallback(async (recipeId: string): Promise<boolean> => {
    const isFav = state.favoriteIds.includes(recipeId);
    return isFav ? removeFavorite(recipeId) : addFavorite(recipeId);
  }, [state.favoriteIds, addFavorite, removeFavorite]);

  /**
   * 🧹 Limpa todos os favoritos
   */
  const clearAllFavorites = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🧹 Limpando todos os favoritos...');
      
      const result = await favoriteStorage.current.clearFavorites(currentUserId.current);
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          favoriteIds: [],
          favoriteRecipes: [],
          totalCount: 0,
          lastUpdated: new Date(),
        }));
        
        console.log('✅ Todos os favoritos foram removidos');
        return true;
      } else {
        throw result.error || new Error('Falha ao limpar favoritos');
      }
      
    } catch (error) {
      console.error('❌ Erro ao limpar favoritos:', error);
      setState(prev => ({
        ...prev,
        hasError: true,
        error: error instanceof Error ? error.message : 'Erro ao limpar favoritos',
      }));
      return false;
    }
  }, []);

  /**
   * 🔍 Busca nos favoritos
   */
  const searchFavorites = useCallback((query: string): void => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  /**
   * 🔄 Ordena favoritos
   */
  const sortFavorites = useCallback((
    sortBy: FavoritesState['sortBy'],
    direction: FavoritesState['sortDirection']
  ): void => {
    setState(prev => ({
      ...prev,
      sortBy,
      sortDirection: direction,
    }));
  }, []);

  /**
   * 📊 Agrupa favoritos
   */
  const groupFavorites = useCallback((groupBy: FavoritesState['groupBy']): void => {
    setState(prev => ({ ...prev, groupBy }));
  }, []);

  /**
   * 🔄 Sincroniza favoritos
   */
  const syncFavorites = useCallback(async (): Promise<boolean> => {
    if (!enableSync) return true;
    
    try {
      setState(prev => ({ ...prev, isSyncing: true }));
      
      console.log('🔄 Sincronizando favoritos...');
      
      // TODO: Implementar sincronização real com servidor
      const success = await favoriteStorage.current.syncWithServer();
      
      if (success) {
        setState(prev => ({ ...prev, lastSync: new Date() }));
        console.log('✅ Favoritos sincronizados');
      }
      
      return success;
      
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      return false;
    } finally {
      setState(prev => ({ ...prev, isSyncing: false }));
    }
  }, [enableSync]);

  /**
   * 📊 Calcula estatísticas
   */
  const calculateStats = useCallback((): void => {
    const favoritesByCategory = state.favoriteRecipes.reduce((acc, recipe) => {
      acc[recipe.categoryId] = (acc[recipe.categoryId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const totalRating = state.favoriteRecipes.reduce((sum, recipe) => sum + recipe.rating, 0);
    const averageRating = state.favoriteRecipes.length > 0 
      ? totalRating / state.favoriteRecipes.length 
      : 0;
    
    setState(prev => ({
      ...prev,
      favoritesByCategory,
      averageRating: Math.round(averageRating * 10) / 10,
    }));
  }, [state.favoriteRecipes]);

  /**
   * 🔧 Aplica filtros e ordenação
   */
  const processedFavorites = useMemo(() => {
    let filtered = [...state.favoriteRecipes];
    
    // Aplica busca
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(query) ||
        recipe.description?.toLowerCase().includes(query) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Aplica ordenação
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (state.sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'category':
          comparison = a.categoryId.localeCompare(b.categoryId);
          break;
        case 'dateAdded':
          // Simula data de adição baseada na ordem no array
          const indexA = state.favoriteIds.indexOf(a.id);
          const indexB = state.favoriteIds.indexOf(b.id);
          comparison = indexA - indexB;
          break;
        default:
          comparison = 0;
      }
      
      return state.sortDirection === 'desc' ? -comparison : comparison;
    });
    
    return filtered;
  }, [state.favoriteRecipes, state.searchQuery, state.sortBy, state.sortDirection, state.favoriteIds]);

  /**
   * 📊 Getters computados
   */
  const getters = useMemo(() => ({
    // Estado geral
    isEmpty: state.totalCount === 0,
    isFull: state.totalCount >= maxFavorites,
    hasData: state.totalCount > 0,
    
    // Loading states
    isLoadingAny: state.isLoading || state.isAdding || state.isRemoving || state.isSyncing,
    
    // Utilitários
    isFavorite: (recipeId: string) => state.favoriteIds.includes(recipeId),
    getFavoriteCount: () => state.totalCount,
    getFavoriteIndex: (recipeId: string) => state.favoriteIds.indexOf(recipeId),
    
    // Estatísticas
    remainingSlots: maxFavorites - state.totalCount,
    usagePercentage: (state.totalCount / maxFavorites) * 100,
    
    // Agrupamento
    favoritesByGroup: state.groupBy === 'none' ? null : groupFavoritesByCategory(processedFavorites),
    
  }), [state, maxFavorites, processedFavorites]);

  /**
   * 🔄 Effects
   */

  // Auto-load inicial
  useEffect(() => {
    if (autoLoad && !state.favoriteIds.length && !state.isLoading) {
      loadFavorites();
    }
  }, [autoLoad, loadFavorites, state.favoriteIds.length, state.isLoading]);

  // Recalcula estatísticas quando favoritos mudam
  useEffect(() => {
    if (enableAnalytics) {
      calculateStats();
    }
  }, [state.favoriteRecipes, enableAnalytics, calculateStats]);

  // Atualiza favoritos filtrados
  useEffect(() => {
    setState(prev => ({ ...prev, filteredFavorites: processedFavorites }));
  }, [processedFavorites]);

  /**
   * 📋 Retorno do hook
   */
  return {
    // Estado principal
    ...state,
    ...getters,
    
    // Favoritos processados
    favorites: processedFavorites,
    
    // Ações principais
    loadFavorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearAllFavorites,
    
    // Busca e organização
    searchFavorites,
    sortFavorites,
    groupFavorites,
    
    // Sincronização
    syncFavorites,
    
    // Utilitários
    refresh: loadFavorites,
    clearSearch: () => searchFavorites(''),
    resetSort: () => sortFavorites('dateAdded', 'desc'),
    
    // Histórico de operações
    getOperationHistory: () => [...operationHistory.current],
    clearOperationHistory: () => { operationHistory.current = []; },
    
    // Dados derivados
    topCategories: Object.entries(state.favoritesByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
  };
};

/**
 * 🔧 Funções auxiliares
 */

function groupFavoritesByCategory(favorites: Recipe[]): Record<string, Recipe[]> {
  return favorites.reduce((acc, recipe) => {
    if (!acc[recipe.categoryId]) {
      acc[recipe.categoryId] = [];
    }
    acc[recipe.categoryId].push(recipe);
    return acc;
  }, {} as Record<string, Recipe[]>);
}