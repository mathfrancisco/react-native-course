/**
 * 🔄 Recipe Reducer - Gerenciamento de Estado de Receitas
 * 
 * Reducer especializado para gerenciar o estado das receitas de forma
 * imutável e performática, seguindo padrões Redux.
 * 
 * @author RecipeApp Team
 * @since Fase 3 - Implementation Layer
 */

import { Recipe } from "../../../../core/entities/interface/Recipe";

/**
 * 🎯 Estado das receitas
 */
export interface RecipeState {
  // Dados principais
  items: Recipe[];
  
  // Estados de carregamento
  loading: {
    initial: boolean;
    refresh: boolean;
    loadMore: boolean;
    search: boolean;
    filter: boolean;
  };
  
  // Estados de operação
  operations: {
    adding: boolean;
    updating: boolean;
    deleting: boolean;
    favoriting: boolean;
  };
  
  // Dados derivados
  filtered: Recipe[];
  searchResults: Recipe[];
  favorites: string[]; // IDs das receitas favoritas
  
  // Paginação
  pagination: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    hasMore: boolean;
    totalItems: number;
  };
  
  // Filtros ativos
  filters: {
    categoryId?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    maxPrepTime?: number;
    maxCookTime?: number;
    tags?: string[];
    rating?: number;
    searchQuery?: string;
  };
  
  // Ordenação
  sorting: {
    field: 'title' | 'rating' | 'prepTime' | 'cookTime' | 'createdAt';
    direction: 'asc' | 'desc';
  };
  
  // Estado de sincronização
  sync: {
    lastSync: Date | null;
    pendingChanges: Recipe[];
    conflicted: Recipe[];
    isSyncing: boolean;
  };
  
  // Metadados
  metadata: {
    lastUpdated: Date | null;
    version: number;
    source: 'cache' | 'network' | 'storage';
  };
  
  // Erros
  errors: {
    loading: string | null;
    saving: string | null;
    deleting: string | null;
    syncing: string | null;
  };
  
  // Configurações
  config: {
    autoRefresh: boolean;
    cacheEnabled: boolean;
    offlineMode: boolean;
  };
}

/**
 * ⚡ Ações do reducer
 */
export type RecipeAction =
  // Carregamento inicial
  | { type: 'RECIPES_LOAD_START' }
  | { type: 'RECIPES_LOAD_SUCCESS'; payload: { recipes: Recipe[]; source: string } }
  | { type: 'RECIPES_LOAD_ERROR'; payload: string }
  
  // Refresh
  | { type: 'RECIPES_REFRESH_START' }
  | { type: 'RECIPES_REFRESH_SUCCESS'; payload: Recipe[] }
  | { type: 'RECIPES_REFRESH_ERROR'; payload: string }
  
  // Carregar mais (paginação)
  | { type: 'RECIPES_LOAD_MORE_START' }
  | { type: 'RECIPES_LOAD_MORE_SUCCESS'; payload: Recipe[] }
  | { type: 'RECIPES_LOAD_MORE_ERROR'; payload: string }
  
  // Busca
  | { type: 'RECIPES_SEARCH_START'; payload: string }
  | { type: 'RECIPES_SEARCH_SUCCESS'; payload: Recipe[] }
  | { type: 'RECIPES_SEARCH_ERROR'; payload: string }
  | { type: 'RECIPES_SEARCH_CLEAR' }
  
  // Filtros
  | { type: 'RECIPES_FILTER_START' }
  | { type: 'RECIPES_FILTER_SUCCESS'; payload: Recipe[] }
  | { type: 'RECIPES_FILTER_ERROR'; payload: string }
  | { type: 'RECIPES_FILTER_SET'; payload: Partial<RecipeState['filters']> }
  | { type: 'RECIPES_FILTER_CLEAR' }
  
  // Ordenação
  | { type: 'RECIPES_SORT_SET'; payload: { field: RecipeState['sorting']['field']; direction: RecipeState['sorting']['direction'] } }
  
  // CRUD Operations
  | { type: 'RECIPES_ADD_START' }
  | { type: 'RECIPES_ADD_SUCCESS'; payload: Recipe }
  | { type: 'RECIPES_ADD_ERROR'; payload: string }
  
  | { type: 'RECIPES_UPDATE_START'; payload: string }
  | { type: 'RECIPES_UPDATE_SUCCESS'; payload: Recipe }
  | { type: 'RECIPES_UPDATE_ERROR'; payload: string }
  
  | { type: 'RECIPES_DELETE_START'; payload: string }
  | { type: 'RECIPES_DELETE_SUCCESS'; payload: string }
  | { type: 'RECIPES_DELETE_ERROR'; payload: string }
  
  // Favoritos
  | { type: 'RECIPES_FAVORITE_START' }
  | { type: 'RECIPES_FAVORITE_TOGGLE'; payload: string }
  | { type: 'RECIPES_FAVORITE_SET'; payload: string[] }
  | { type: 'RECIPES_FAVORITE_ERROR'; payload: string }
  
  // Sincronização
  | { type: 'RECIPES_SYNC_START' }
  | { type: 'RECIPES_SYNC_SUCCESS'; payload: { synced: Recipe[]; conflicts: Recipe[] } }
  | { type: 'RECIPES_SYNC_ERROR'; payload: string }
  | { type: 'RECIPES_SYNC_RESOLVE_CONFLICT'; payload: { recipeId: string; resolution: Recipe } }
  
  // Paginação
  | { type: 'RECIPES_PAGINATION_SET'; payload: Partial<RecipeState['pagination']> }
  
  // Configurações
  | { type: 'RECIPES_CONFIG_UPDATE'; payload: Partial<RecipeState['config']> }
  
  // Reset e limpeza
  | { type: 'RECIPES_RESET' }
  | { type: 'RECIPES_CLEAR_ERRORS' }
  | { type: 'RECIPES_CLEAR_CACHE' };

/**
 * 🏭 Estado inicial
 */
export const initialRecipeState: RecipeState = {
  items: [],
  
  loading: {
    initial: false,
    refresh: false,
    loadMore: false,
    search: false,
    filter: false,
  },
  
  operations: {
    adding: false,
    updating: false,
    deleting: false,
    favoriting: false,
  },
  
  filtered: [],
  searchResults: [],
  favorites: [],
  
  pagination: {
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 20,
    hasMore: false,
    totalItems: 0,
  },
  
  filters: {},
  
  sorting: {
    field: 'createdAt',
    direction: 'desc',
  },
  
  sync: {
    lastSync: null,
    pendingChanges: [],
    conflicted: [],
    isSyncing: false,
  },
  
  metadata: {
    lastUpdated: null,
    version: 1,
    source: 'cache',
  },
  
  errors: {
    loading: null,
    saving: null,
    deleting: null,
    syncing: null,
  },
  
  config: {
    autoRefresh: true,
    cacheEnabled: true,
    offlineMode: false,
  },
};

/**
 * 🎮 Recipe Reducer
 */
export function recipeReducer(state = initialRecipeState, action: RecipeAction): RecipeState {
  switch (action.type) {
    // Carregamento inicial
    case 'RECIPES_LOAD_START':
      return {
        ...state,
        loading: { ...state.loading, initial: true },
        errors: { ...state.errors, loading: null },
      };
      
    case 'RECIPES_LOAD_SUCCESS':
      return {
        ...state,
        loading: { ...state.loading, initial: false },
        items: action.payload.recipes,
        filtered: action.payload.recipes,
        metadata: {
          ...state.metadata,
          lastUpdated: new Date(),
          source: action.payload.source as any,
          version: state.metadata.version + 1,
        },
        pagination: {
          ...state.pagination,
          totalItems: action.payload.recipes.length,
          totalPages: Math.ceil(action.payload.recipes.length / state.pagination.itemsPerPage),
          hasMore: action.payload.recipes.length > state.pagination.itemsPerPage,
        },
        errors: { ...state.errors, loading: null },
      };
      
    case 'RECIPES_LOAD_ERROR':
      return {
        ...state,
        loading: { ...state.loading, initial: false },
        errors: { ...state.errors, loading: action.payload },
      };

    // Refresh
    case 'RECIPES_REFRESH_START':
      return {
        ...state,
        loading: { ...state.loading, refresh: true },
        errors: { ...state.errors, loading: null },
      };
      
    case 'RECIPES_REFRESH_SUCCESS':
      return {
        ...state,
        loading: { ...state.loading, refresh: false },
        items: action.payload,
        filtered: applyFiltersAndSort(action.payload, state.filters, state.sorting),
        metadata: {
          ...state.metadata,
          lastUpdated: new Date(),
          version: state.metadata.version + 1,
        },
        errors: { ...state.errors, loading: null },
      };
      
    case 'RECIPES_REFRESH_ERROR':
      return {
        ...state,
        loading: { ...state.loading, refresh: false },
        errors: { ...state.errors, loading: action.payload },
      };

    // Carregar mais
    case 'RECIPES_LOAD_MORE_START':
      return {
        ...state,
        loading: { ...state.loading, loadMore: true },
      };
      
    case 'RECIPES_LOAD_MORE_SUCCESS':
      const newItems = [...state.items, ...action.payload];
      return {
        ...state,
        loading: { ...state.loading, loadMore: false },
        items: newItems,
        filtered: applyFiltersAndSort(newItems, state.filters, state.sorting),
        pagination: {
          ...state.pagination,
          currentPage: state.pagination.currentPage + 1,
          hasMore: action.payload.length === state.pagination.itemsPerPage,
        },
      };
      
    case 'RECIPES_LOAD_MORE_ERROR':
      return {
        ...state,
        loading: { ...state.loading, loadMore: false },
        errors: { ...state.errors, loading: action.payload },
      };

    // Busca
    case 'RECIPES_SEARCH_START':
      return {
        ...state,
        loading: { ...state.loading, search: true },
        filters: { ...state.filters, searchQuery: action.payload },
      };
      
    case 'RECIPES_SEARCH_SUCCESS':
      return {
        ...state,
        loading: { ...state.loading, search: false },
        searchResults: action.payload,
        filtered: action.payload,
      };
      
    case 'RECIPES_SEARCH_ERROR':
      return {
        ...state,
        loading: { ...state.loading, search: false },
        errors: { ...state.errors, loading: action.payload },
      };
      
    case 'RECIPES_SEARCH_CLEAR':
      return {
        ...state,
        searchResults: [],
        filtered: applyFiltersAndSort(state.items, { ...state.filters, searchQuery: undefined }, state.sorting),
        filters: { ...state.filters, searchQuery: undefined },
      };

    // Filtros
    case 'RECIPES_FILTER_START':
      return {
        ...state,
        loading: { ...state.loading, filter: true },
      };
      
    case 'RECIPES_FILTER_SUCCESS':
      return {
        ...state,
        loading: { ...state.loading, filter: false },
        filtered: action.payload,
      };
      
    case 'RECIPES_FILTER_ERROR':
      return {
        ...state,
        loading: { ...state.loading, filter: false },
        errors: { ...state.errors, loading: action.payload },
      };
      
    case 'RECIPES_FILTER_SET':
      const newFilters = { ...state.filters, ...action.payload };
      return {
        ...state,
        filters: newFilters,
        filtered: applyFiltersAndSort(state.items, newFilters, state.sorting),
      };
      
    case 'RECIPES_FILTER_CLEAR':
      return {
        ...state,
        filters: {},
        filtered: applyFiltersAndSort(state.items, {}, state.sorting),
      };

    // Ordenação
    case 'RECIPES_SORT_SET':
      const newSorting = action.payload;
      return {
        ...state,
        sorting: newSorting,
        filtered: applyFiltersAndSort(state.items, state.filters, newSorting),
      };

    // Adicionar receita
    case 'RECIPES_ADD_START':
      return {
        ...state,
        operations: { ...state.operations, adding: true },
        errors: { ...state.errors, saving: null },
      };
      
    case 'RECIPES_ADD_SUCCESS':
      const addedItems = [...state.items, action.payload];
      return {
        ...state,
        operations: { ...state.operations, adding: false },
        items: addedItems,
        filtered: applyFiltersAndSort(addedItems, state.filters, state.sorting),
        sync: {
          ...state.sync,
          pendingChanges: [...state.sync.pendingChanges, action.payload],
        },
        errors: { ...state.errors, saving: null },
      };
      
    case 'RECIPES_ADD_ERROR':
      return {
        ...state,
        operations: { ...state.operations, adding: false },
        errors: { ...state.errors, saving: action.payload },
      };

    // Atualizar receita
    case 'RECIPES_UPDATE_START':
      return {
        ...state,
        operations: { ...state.operations, updating: true },
        errors: { ...state.errors, saving: null },
      };
      
    case 'RECIPES_UPDATE_SUCCESS':
      const updatedItems = state.items.map(item => 
        item.id === action.payload.id ? action.payload : item
      );
      return {
        ...state,
        operations: { ...state.operations, updating: false },
        items: updatedItems,
        filtered: applyFiltersAndSort(updatedItems, state.filters, state.sorting),
        sync: {
          ...state.sync,
          pendingChanges: updatePendingChanges(state.sync.pendingChanges, action.payload),
        },
        errors: { ...state.errors, saving: null },
      };
      
    case 'RECIPES_UPDATE_ERROR':
      return {
        ...state,
        operations: { ...state.operations, updating: false },
        errors: { ...state.errors, saving: action.payload },
      };

    // Deletar receita
    case 'RECIPES_DELETE_START':
      return {
        ...state,
        operations: { ...state.operations, deleting: true },
        errors: { ...state.errors, deleting: null },
      };
      
    case 'RECIPES_DELETE_SUCCESS':
      const remainingItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        operations: { ...state.operations, deleting: false },
        items: remainingItems,
        filtered: applyFiltersAndSort(remainingItems, state.filters, state.sorting),
        favorites: state.favorites.filter(id => id !== action.payload),
        sync: {
          ...state.sync,
          pendingChanges: state.sync.pendingChanges.filter(item => item.id !== action.payload),
        },
        errors: { ...state.errors, deleting: null },
      };
      
    case 'RECIPES_DELETE_ERROR':
      return {
        ...state,
        operations: { ...state.operations, deleting: false },
        errors: { ...state.errors, deleting: action.payload },
      };

    // Favoritos
    case 'RECIPES_FAVORITE_START':
      return {
        ...state,
        operations: { ...state.operations, favoriting: true },
      };
      
    case 'RECIPES_FAVORITE_TOGGLE':
      const isFavorite = state.favorites.includes(action.payload);
      const newFavorites = isFavorite
        ? state.favorites.filter(id => id !== action.payload)
        : [...state.favorites, action.payload];
      
      return {
        ...state,
        operations: { ...state.operations, favoriting: false },
        favorites: newFavorites,
      };
      
    case 'RECIPES_FAVORITE_SET':
      return {
        ...state,
        operations: { ...state.operations, favoriting: false },
        favorites: action.payload,
      };
      
    case 'RECIPES_FAVORITE_ERROR':
      return {
        ...state,
        operations: { ...state.operations, favoriting: false },
        errors: { ...state.errors, saving: action.payload },
      };

    // Sincronização
    case 'RECIPES_SYNC_START':
      return {
        ...state,
        sync: { ...state.sync, isSyncing: true },
        errors: { ...state.errors, syncing: null },
      };
      
    case 'RECIPES_SYNC_SUCCESS':
      return {
        ...state,
        sync: {
          ...state.sync,
          isSyncing: false,
          lastSync: new Date(),
          pendingChanges: [],
          conflicted: action.payload.conflicts,
        },
        items: action.payload.synced,
        filtered: applyFiltersAndSort(action.payload.synced, state.filters, state.sorting),
        errors: { ...state.errors, syncing: null },
      };
      
    case 'RECIPES_SYNC_ERROR':
      return {
        ...state,
        sync: { ...state.sync, isSyncing: false },
        errors: { ...state.errors, syncing: action.payload },
      };
      
    case 'RECIPES_SYNC_RESOLVE_CONFLICT':
      const resolvedItems = state.items.map(item =>
        item.id === action.payload.recipeId ? action.payload.resolution : item
      );
      return {
        ...state,
        items: resolvedItems,
        filtered: applyFiltersAndSort(resolvedItems, state.filters, state.sorting),
        sync: {
          ...state.sync,
          conflicted: state.sync.conflicted.filter(item => item.id !== action.payload.recipeId),
        },
      };

    // Paginação
    case 'RECIPES_PAGINATION_SET':
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload },
      };

    // Configurações
    case 'RECIPES_CONFIG_UPDATE':
      return {
        ...state,
        config: { ...state.config, ...action.payload },
      };

    // Reset e limpeza
    case 'RECIPES_RESET':
      return initialRecipeState;
      
    case 'RECIPES_CLEAR_ERRORS':
      return {
        ...state,
        errors: {
          loading: null,
          saving: null,
          deleting: null,
          syncing: null,
        },
      };
      
    case 'RECIPES_CLEAR_CACHE':
      return {
        ...state,
        items: [],
        filtered: [],
        searchResults: [],
        metadata: {
          ...state.metadata,
          lastUpdated: null,
          version: 1,
        },
      };

    default:
      return state;
  }
}

/**
 * 🔧 Funções auxiliares
 */

function applyFiltersAndSort(
  recipes: Recipe[],
  filters: RecipeState['filters'],
  sorting: RecipeState['sorting']
): Recipe[] {
  let filtered = [...recipes];

  // Aplica filtros
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

  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(recipe =>
      recipe.title.toLowerCase().includes(query) ||
      recipe.description?.toLowerCase().includes(query) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }

  // Aplica ordenação
  filtered.sort((a, b) => {
    let comparison = 0;

    switch (sorting.field) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'rating':
        comparison = a.rating - b.rating;
        break;
      case 'prepTime':
        comparison = a.prepTime - b.prepTime;
        break;
      case 'cookTime':
        comparison = a.cookTime - b.cookTime;
        break;
      case 'createdAt':
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        comparison = aTime - bTime;
        break;
      default:
        comparison = 0;
    }

    return sorting.direction === 'asc' ? comparison : -comparison;
  });

  return filtered;
}

function updatePendingChanges(pendingChanges: Recipe[], updatedRecipe: Recipe): Recipe[] {
  const existingIndex = pendingChanges.findIndex(recipe => recipe.id === updatedRecipe.id);
  
  if (existingIndex >= 0) {
    // Atualiza receita existente nas mudanças pendentes
    const updated = [...pendingChanges];
    updated[existingIndex] = updatedRecipe;
    return updated;
  } else {
    // Adiciona nova receita às mudanças pendentes
    return [...pendingChanges, updatedRecipe];
  }
}

/**
 * 🎯 Seletores úteis
 */
export const recipeSelectors = {
  // Seletores básicos
  getAllRecipes: (state: RecipeState) => state.items,
  getFilteredRecipes: (state: RecipeState) => state.filtered,
  getSearchResults: (state: RecipeState) => state.searchResults,
  getFavoriteIds: (state: RecipeState) => state.favorites,
  
  // Seletores derivados
  getFavoriteRecipes: (state: RecipeState) =>
    state.items.filter(recipe => state.favorites.includes(recipe.id)),
  
  getRecipeById: (state: RecipeState, id: string) =>
    state.items.find(recipe => recipe.id === id),
  
  getRecipesByCategory: (state: RecipeState, categoryId: string) =>
    state.items.filter(recipe => recipe.categoryId === categoryId),
  
  // Seletores de estado
  isLoading: (state: RecipeState) =>
    Object.values(state.loading).some(Boolean),
  
  hasOperations: (state: RecipeState) =>
    Object.values(state.operations).some(Boolean),
  
  hasErrors: (state: RecipeState) =>
    Object.values(state.errors).some(error => error !== null),
  
  // Seletores de estatísticas
  getTotalCount: (state: RecipeState) => state.items.length,
  getFilteredCount: (state: RecipeState) => state.filtered.length,
  getFavoriteCount: (state: RecipeState) => state.favorites.length,
  
  // Seletores de estado complexo
  isDataReady: (state: RecipeState) =>
    !state.loading.initial && state.items.length > 0,
  
  hasPendingChanges: (state: RecipeState) =>
    state.sync.pendingChanges.length > 0,
  
  hasConflicts: (state: RecipeState) =>
    state.sync.conflicted.length > 0,
};