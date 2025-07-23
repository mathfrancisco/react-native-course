/**
 * 🪝 useSearch - Hook para Sistema de Busca
 * 
 * Hook avançado para busca de receitas com autocomplete,
 * histórico, sugestões e cache inteligente.
 * 
 * @author RecipeApp Team
 * @since Fase 3 - Implementation Layer
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Recipe } from '../../../core/entities/interface/Recipe';
import { Category } from '../../../core/entities/interface/Category';
import { RecipeMemo } from '../../optimization/memoization/RecipeMemo';
import { useDataContext } from '../../contexts/providers/DataProvider';
import { useDebounce } from './useDebounce';

/**
 * 🎯 Configurações do hook de busca
 */
interface UseSearchConfig {
  debounceMs?: number;
  enableAutoComplete?: boolean;
  enableSuggestions?: boolean;
  enableHistory?: boolean;
  maxHistoryItems?: number;
  minQueryLength?: number;
  enableFuzzySearch?: boolean;
  cacheResults?: boolean;
  enableHighlight?: boolean;
}

/**
 * 🔍 Configurações de busca avançada
 */
interface SearchOptions {
  scope?: 'all' | 'titles' | 'ingredients' | 'instructions';
  categories?: string[];
  difficulty?: string[];
  maxPrepTime?: number;
  maxCookTime?: number;
  tags?: string[];
  exactMatch?: boolean;
  caseSensitive?: boolean;
}

/**
 * 📊 Resultado de busca
 */
interface SearchResult {
  recipe: Recipe;
  relevanceScore: number;
  matchedFields: string[];
  highlightedTitle?: string;
  highlightedDescription?: string;
  category?: Category;
}

/**
 * 💡 Sugestão de busca
 */
interface SearchSuggestion {
  text: string;
  type: 'recipe' | 'ingredient' | 'category' | 'tag';
  count: number;
  popularity: number;
}

/**
 * 📈 Estado de busca
 */
interface SearchState {
  // Query atual
  query: string;
  previousQuery: string;
  
  // Resultados
  results: SearchResult[];
  totalResults: number;
  isSearching: boolean;
  hasResults: boolean;
  
  // Sugestões e autocomplete
  suggestions: SearchSuggestion[];
  autoComplete: string[];
  showSuggestions: boolean;
  
  // Histórico
  searchHistory: string[];
  popularSearches: string[];
  
  // Filtros aplicados
  activeFilters: SearchOptions;
  
  // Performance
  searchTime: number;
  lastSearchTimestamp: number;
  
  // Cache
  cachedResults: Map<string, SearchResult[]>;
  cacheHits: number;
  cacheMisses: number;
  
  // Estados
  error: string | null;
  hasError: boolean;
}

/**
 * 🏭 Estado inicial
 */
const createInitialState = (): SearchState => ({
  query: '',
  previousQuery: '',
  
  results: [],
  totalResults: 0,
  isSearching: false,
  hasResults: false,
  
  suggestions: [],
  autoComplete: [],
  showSuggestions: false,
  
  searchHistory: [],
  popularSearches: [],
  
  activeFilters: {},
  
  searchTime: 0,
  lastSearchTimestamp: 0,
  
  cachedResults: new Map(),
  cacheHits: 0,
  cacheMisses: 0,
  
  error: null,
  hasError: false,
});

/**
 * 🪝 Hook useSearch
 */
export const useSearch = (config: UseSearchConfig = {}) => {
  const {
    debounceMs = 300,
    enableAutoComplete = true,
    enableSuggestions = true,
    enableHistory = true,
    maxHistoryItems = 20,
    minQueryLength = 2,
    enableFuzzySearch = true,
    cacheResults = true,
    enableHighlight = true,
  } = config;

  const { state: dataState, searchRecipes: contextSearch } = useDataContext();
  const [state, setState] = useState<SearchState>(createInitialState);
  
  // Debounce da query
  const debouncedQuery = useDebounce(state.query, debounceMs);
  
  // Refs para otimização
  const abortController = useRef<AbortController | null>(null);
  const searchStats = useRef({ total: 0, successful: 0, failed: 0 });

  /**
   * 🔍 Executa busca principal
   */
  const performSearch = useCallback(async (
    query: string, 
    options: SearchOptions = {}
  ): Promise<void> => {
    if (!query.trim() || query.length < minQueryLength) {
      setState(prev => ({
        ...prev,
        results: [],
        totalResults: 0,
        hasResults: false,
        isSearching: false,
      }));
      return;
    }

    try {
      // Cancela busca anterior
      if (abortController.current) {
        abortController.current.abort();
      }
      abortController.current = new AbortController();

      setState(prev => ({
        ...prev,
        isSearching: true,
        hasError: false,
        error: null,
        previousQuery: prev.query,
      }));

      const startTime = Date.now();
      console.log(`🔍 Buscando: "${query}"`);

      // Verifica cache primeiro
      const cacheKey = generateCacheKey(query, options);
      if (cacheResults && state.cachedResults.has(cacheKey)) {
        const cachedResults = state.cachedResults.get(cacheKey)!;
        
        setState(prev => ({
          ...prev,
          results: cachedResults,
          totalResults: cachedResults.length,
          hasResults: cachedResults.length > 0,
          isSearching: false,
          searchTime: Date.now() - startTime,
          cacheHits: prev.cacheHits + 1,
        }));
        
        console.log(`💾 Resultado do cache: ${cachedResults.length} receitas`);
        return;
      }

      // Executa busca
      setState(prev => ({ ...prev, cacheMisses: prev.cacheMisses + 1 }));
      
      let searchResults: Recipe[];
      
      // Usa busca do contexto ou memoizada
      if (Object.keys(options).length === 0) {
        // Busca simples usando contexto
        await contextSearch(query);
        searchResults = dataState.search.results;
      } else {
        // Busca avançada usando memoização
        searchResults = RecipeMemo.searchRecipes(dataState.recipes.data, query);
        
        // Aplica filtros adicionais
        searchResults = applyAdvancedFilters(searchResults, options);
      }

      // Calcula relevância e cria resultados
      const results = searchResults.map(recipe => 
        createSearchResult(recipe, query, options)
      );

      // Ordena por relevância
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);

      const searchTime = Date.now() - startTime;

      // Atualiza estado
      setState(prev => ({
        ...prev,
        results,
        totalResults: results.length,
        hasResults: results.length > 0,
        isSearching: false,
        searchTime,
        lastSearchTimestamp: Date.now(),
      }));

      // Salva no cache
      if (cacheResults) {
        setState(prev => {
          const newCache = new Map(prev.cachedResults);
          newCache.set(cacheKey, results);
          
          // Limita tamanho do cache
          if (newCache.size > 50) {
            const firstKey = newCache.keys().next().value;
            newCache.delete(firstKey);
          }
          
          return { ...prev, cachedResults: newCache };
        });
      }

      // Adiciona ao histórico
      if (enableHistory) {
        addToHistory(query);
      }

      // Atualiza estatísticas
      searchStats.current.total++;
      searchStats.current.successful++;

      console.log(`✅ Busca concluída: ${results.length} resultados em ${searchTime}ms`);

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('❌ Erro na busca:', error);
        
        setState(prev => ({
          ...prev,
          hasError: true,
          error: error instanceof Error ? error.message : 'Erro na busca',
          isSearching: false,
        }));
        
        searchStats.current.total++;
        searchStats.current.failed++;
      }
    }
  }, [
    minQueryLength, 
    cacheResults, 
    state.cachedResults, 
    contextSearch, 
    dataState.search.results,
    dataState.recipes.data,
    enableHistory
  ]);

  /**
   * 💡 Gera sugestões
   */
  const generateSuggestions = useCallback((query: string): void => {
    if (!enableSuggestions || !query.trim()) {
      setState(prev => ({ ...prev, suggestions: [], showSuggestions: false }));
      return;
    }

    const suggestions: SearchSuggestion[] = [];
    const queryLower = query.toLowerCase();

    // Sugestões de receitas
    const recipeMatches = dataState.recipes.data
      .filter(recipe => recipe.title.toLowerCase().includes(queryLower))
      .slice(0, 5)
      .map(recipe => ({
        text: recipe.title,
        type: 'recipe' as const,
        count: 1,
        popularity: recipe.rating * 10,
      }));
    
    suggestions.push(...recipeMatches);

    // Sugestões de ingredientes
    const ingredientMatches = new Set<string>();
    dataState.recipes.data.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        if (ingredient.name.toLowerCase().includes(queryLower) && 
            ingredientMatches.size < 3) {
          ingredientMatches.add(ingredient.name);
        }
      });
    });
    
    ingredientMatches.forEach(ingredient => {
      suggestions.push({
        text: ingredient,
        type: 'ingredient',
        count: 1,
        popularity: 5,
      });
    });

    // Sugestões de tags
    const tagMatches = new Set<string>();
    dataState.recipes.data.forEach(recipe => {
      recipe.tags.forEach(tag => {
        if (tag.toLowerCase().includes(queryLower) && tagMatches.size < 3) {
          tagMatches.add(tag);
        }
      });
    });
    
    tagMatches.forEach(tag => {
      suggestions.push({
        text: tag,
        type: 'tag',
        count: 1,
        popularity: 3,
      });
    });

    // Ordena por popularidade
    suggestions.sort((a, b) => b.popularity - a.popularity);

    setState(prev => ({
      ...prev,
      suggestions: suggestions.slice(0, 10),
      showSuggestions: suggestions.length > 0,
    }));
  }, [enableSuggestions, dataState.recipes.data]);

  /**
   * 📝 Gera autocomplete
   */
  const generateAutoComplete = useCallback((query: string): void => {
    if (!enableAutoComplete || !query.trim()) {
      setState(prev => ({ ...prev, autoComplete: [] }));
      return;
    }

    const queryLower = query.toLowerCase();
    const autoComplete: string[] = [];

    // Autocomplete de títulos de receitas
    dataState.recipes.data.forEach(recipe => {
      if (recipe.title.toLowerCase().startsWith(queryLower) && 
          autoComplete.length < 8) {
        autoComplete.push(recipe.title);
      }
    });

    setState(prev => ({ ...prev, autoComplete }));
  }, [enableAutoComplete, dataState.recipes.data]);

  /**
   * 📈 Adiciona ao histórico
   */
  const addToHistory = useCallback((query: string): void => {
    setState(prev => {
      const newHistory = [query, ...prev.searchHistory.filter(h => h !== query)]
        .slice(0, maxHistoryItems);
      
      return { ...prev, searchHistory: newHistory };
    });
  }, [maxHistoryItems]);

  /**
   * 🔄 Define query de busca
   */
  const setQuery = useCallback((query: string): void => {
    setState(prev => ({ ...prev, query }));
    
    // Gera sugestões e autocomplete em tempo real
    if (query.trim()) {
      generateSuggestions(query);
      generateAutoComplete(query);
    } else {
      setState(prev => ({
        ...prev,
        suggestions: [],
        autoComplete: [],
        showSuggestions: false,
      }));
    }
  }, [generateSuggestions, generateAutoComplete]);

  /**
   * 🎯 Aplica filtros
   */
  const applyFilters = useCallback((filters: SearchOptions): void => {
    setState(prev => ({ ...prev, activeFilters: filters }));
    
    if (state.query.trim()) {
      performSearch(state.query, filters);
    }
  }, [state.query, performSearch]);

  /**
   * 🧹 Limpa busca
   */
  const clearSearch = useCallback((): void => {
    setState(prev => ({
      ...prev,
      query: '',
      results: [],
      totalResults: 0,
      hasResults: false,
      suggestions: [],
      autoComplete: [],
      showSuggestions: false,
      activeFilters: {},
      error: null,
      hasError: false,
    }));
  }, []);

  /**
   * 🧹 Limpa histórico
   */
  const clearHistory = useCallback((): void => {
    setState(prev => ({ ...prev, searchHistory: [] }));
  }, []);

  /**
   * 💾 Limpa cache
   */
  const clearCache = useCallback((): void => {
    setState(prev => ({
      ...prev,
      cachedResults: new Map(),
      cacheHits: 0,
      cacheMisses: 0,
    }));
  }, []);

  /**
   * 📊 Getters computados
   */
  const getters = useMemo(() => ({
    // Estados
    hasQuery: !!state.query.trim(),
    hasActiveFilters: Object.keys(state.activeFilters).length > 0,
    isEmpty: !state.hasResults && !state.isSearching,
    
    // Performance
    cacheHitRate: state.cacheHits + state.cacheMisses > 0 
      ? (state.cacheHits / (state.cacheHits + state.cacheMisses)) * 100 
      : 0,
    
    // Estatísticas
    searchStats: {
      ...searchStats.current,
      successRate: searchStats.current.total > 0 
        ? (searchStats.current.successful / searchStats.current.total) * 100 
        : 0,
    },
    
    // Resultados agrupados
    resultsByCategory: state.results.reduce((acc, result) => {
      const categoryId = result.recipe.categoryId;
      if (!acc[categoryId]) acc[categoryId] = [];
      acc[categoryId].push(result);
      return acc;
    }, {} as Record<string, SearchResult[]>),
    
  }), [state]);

  /**
   * 🔄 Effects
   */

  // Busca com debounce
  useEffect(() => {
    if (debouncedQuery.trim() && debouncedQuery !== state.previousQuery) {
      performSearch(debouncedQuery, state.activeFilters);
    }
  }, [debouncedQuery, state.activeFilters, state.previousQuery, performSearch]);

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
    // Estado principal
    ...state,
    ...getters,
    
    // Ações principais
    search: (query: string, options?: SearchOptions) => {
      setQuery(query);
      if (query.trim()) {
        performSearch(query, options || state.activeFilters);
      }
    },
    setQuery,
    performSearch,
    applyFilters,
    clearSearch,
    clearHistory,
    clearCache,
    
    // Sugestões
    selectSuggestion: (suggestion: SearchSuggestion) => {
      setQuery(suggestion.text);
      performSearch(suggestion.text, state.activeFilters);
    },
    
    // Histórico
    searchFromHistory: (query: string) => {
      setQuery(query);
      performSearch(query, state.activeFilters);
    },
    
    // Utilitários
    highlightText: (text: string, highlight: string) => 
      enableHighlight ? highlightMatch(text, highlight) : text,
    
    getResultsCount: () => state.totalResults,
    getSearchTime: () => state.searchTime,
    
    // Filtros rápidos
    quickFilters: {
      byCategory: (categoryId: string) => 
        applyFilters({ ...state.activeFilters, categories: [categoryId] }),
      byDifficulty: (difficulty: string) => 
        applyFilters({ ...state.activeFilters, difficulty: [difficulty] }),
      byMaxTime: (maxTime: number) => 
        applyFilters({ ...state.activeFilters, maxPrepTime: maxTime }),
    },
  };
};

/**
 * 🔧 Funções auxiliares
 */

function generateCacheKey(query: string, options: SearchOptions): string {
  return `${query.toLowerCase()}_${JSON.stringify(options)}`;
}

function createSearchResult(
  recipe: Recipe, 
  query: string, 
  options: SearchOptions
): SearchResult {
  const queryLower = query.toLowerCase();
  const matchedFields: string[] = [];
  let relevanceScore = 0;

  // Verifica matches em diferentes campos
  if (recipe.title.toLowerCase().includes(queryLower)) {
    matchedFields.push('title');
    relevanceScore += 100;
    
    // Bonus se a query está no início do título
    if (recipe.title.toLowerCase().startsWith(queryLower)) {
      relevanceScore += 50;
    }
  }

  if (recipe.description?.toLowerCase().includes(queryLower)) {
    matchedFields.push('description');
    relevanceScore += 30;
  }

  if (recipe.tags.some(tag => tag.toLowerCase().includes(queryLower))) {
    matchedFields.push('tags');
    relevanceScore += 20;
  }

  if (recipe.ingredients.some(ing => ing.name.toLowerCase().includes(queryLower))) {
    matchedFields.push('ingredients');
    relevanceScore += 40;
  }

  // Bonus por rating
  relevanceScore += recipe.rating * 5;

  return {
    recipe,
    relevanceScore,
    matchedFields,
  };
}

function applyAdvancedFilters(recipes: Recipe[], options: SearchOptions): Recipe[] {
  let filtered = [...recipes];

  if (options.categories?.length) {
    filtered = filtered.filter(recipe => 
      options.categories!.includes(recipe.categoryId)
    );
  }

  if (options.difficulty?.length) {
    filtered = filtered.filter(recipe => 
      options.difficulty!.includes(recipe.difficulty)
    );
  }

  if (options.maxPrepTime) {
    filtered = filtered.filter(recipe => 
      recipe.prepTime <= options.maxPrepTime!
    );
  }

  if (options.maxCookTime) {
    filtered = filtered.filter(recipe => 
      recipe.cookTime <= options.maxCookTime!
    );
  }

  if (options.tags?.length) {
    filtered = filtered.filter(recipe =>
      options.tags!.some(tag => recipe.tags.includes(tag))
    );
  }

  return filtered;
}

function highlightMatch(text: string, highlight: string): string {
  if (!highlight.trim()) return text;
  
  const regex = new RegExp(`(${highlight})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}