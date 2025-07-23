/**
 * 🪝 useCategories - Hook para Gerenciamento de Categorias
 * 
 * Hook customizado que centraliza toda a lógica de gerenciamento de categorias,
 * incluindo hierarquia, busca, cache e navegação.
 * 
 * @author RecipeApp Team
 * @since Fase 3 - Implementation Layer
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

import { CategoryRepositoryImpl } from '../../repositories/controller/CategoryRepositoryImpl';
import { Category } from '../../../core/entities/interface/Category';
import { useAppContext } from '../../contexts/providers/AppProvider';

/**
 * 🎯 Configurações do hook
 */
interface UseCategoriesConfig {
  autoLoad?: boolean;
  enableHierarchy?: boolean;
  enableSearch?: boolean;
  cacheEnabled?: boolean;
  maxDepth?: number;
  includeInactive?: boolean;
  sortBy?: 'name' | 'order' | 'recipeCount';
  sortDirection?: 'asc' | 'desc';
}

/**
 * 🌳 Estrutura hierárquica de categoria
 */
export interface CategoryNode {
  category: Category;
  children: CategoryNode[];
  parent?: CategoryNode;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  path: string[];
}

/**
 * 🔍 Estado de busca de categorias
 */
interface CategorySearchState {
  query: string;
  isSearching: boolean;
  results: Category[];
  suggestions: string[];
  recentSearches: string[];
}

/**
 * ⚡ Estado de carregamento
 */
interface CategoryLoadingState {
  initial: boolean;
  refresh: boolean;
  search: boolean;
  hierarchy: boolean;
}

/**
 * 📊 Estado do hook
 */
interface CategoriesState {
  // Dados principais
  categories: Category[];
  hierarchyTree: CategoryNode[];
  flatList: Category[];
  
  // Navegação
  currentCategory: Category | null;
  breadcrumb: Category[];
  
  // Estados de loading
  loading: CategoryLoadingState;
  
  // Busca
  search: CategorySearchState;
  
  // Metadados
  lastUpdated: Date | null;
  totalCount: number;
  activeCount: number;
  maxDepth: number;
  
  // Erros
  error: string | null;
  hasError: boolean;
}

/**
 * 🏭 Estado inicial
 */
const initialState: CategoriesState = {
  categories: [],
  hierarchyTree: [],
  flatList: [],
  
  currentCategory: null,
  breadcrumb: [],
  
  loading: {
    initial: false,
    refresh: false,
    search: false,
    hierarchy: false,
  },
  
  search: {
    query: '',
    isSearching: false,
    results: [],
    suggestions: [],
    recentSearches: [],
  },
  
  lastUpdated: null,
  totalCount: 0,
  activeCount: 0,
  maxDepth: 0,
  error: null,
  hasError: false,
};

/**
 * 🪝 Hook useCategories
 */
export const useCategories = (config: UseCategoriesConfig = {}) => {
  const {
    autoLoad = true,
    enableHierarchy = true,
    enableSearch = true,
    cacheEnabled = true,
    maxDepth = 5,
    includeInactive = false,
    sortBy = 'order',
    sortDirection = 'asc',
  } = config;

  const { state: appState } = useAppContext();
  const [state, setState] = useState<CategoriesState>(initialState);
  
  // Refs para otimização
  const categoryRepository = useRef(CategoryRepositoryImpl.getInstance());
  const abortController = useRef<AbortController | null>(null);

  /**
   * 📖 Carrega categorias
   */
  const loadCategories = useCallback(async (refresh = false): Promise<void> => {
    try {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, [refresh ? 'refresh' : 'initial']: true },
        hasError: false,
        error: null,
      }));

      console.log('📖 Carregando categorias...');
      
      let categories: Category[];
      
      // Tenta usar dados do contexto primeiro
      if (appState.categories.length > 0 && !refresh) {
        categories = appState.categories;
        console.log('📋 Usando categorias do contexto global');
      } else {
        // Carrega via repository
        const result = await categoryRepository.current.getAllCategories({
          includeInactive,
          sortBy,
          sortDirection,
          maxDepth,
        });
        
        if (!result.success) {
          throw result.error || new Error('Falha ao carregar categorias');
        }
        
        categories = result.data;
        console.log(`📖 ${categories.length} categorias carregadas`);
      }

      // Processa dados
      const activeCategories = categories.filter(c => c.isActive);
      const calculatedMaxDepth = Math.max(...categories.map(c => c.level || 0), 0);
      
      // Constrói hierarquia se habilitado
      let hierarchyTree: CategoryNode[] = [];
      if (enableHierarchy) {
        hierarchyTree = buildCategoryHierarchy(categories);
      }

      // Atualiza estado
      setState(prev => ({
        ...prev,
        categories,
        flatList: categories,
        hierarchyTree,
        totalCount: categories.length,
        activeCount: activeCategories.length,
        maxDepth: calculatedMaxDepth,
        lastUpdated: new Date(),
      }));

    } catch (error) {
      console.error('❌ Erro ao carregar categorias:', error);
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
  }, [appState.categories, includeInactive, sortBy, sortDirection, maxDepth, enableHierarchy]);

  /**
   * 🔍 Busca categorias
   */
  const searchCategories = useCallback(async (query: string): Promise<void> => {
    if (!enableSearch) return;
    
    if (!query.trim()) {
      setState(prev => ({
        ...prev,
        search: {
          ...prev.search,
          query: '',
          results: [],
          isSearching: false,
        },
      }));
      return;
    }

    try {
      setState(prev => ({
        ...prev,
        search: { ...prev.search, isSearching: true, query },
        loading: { ...prev.loading, search: true },
      }));

      // Cancela busca anterior se houver
      if (abortController.current) {
        abortController.current.abort();
      }
      abortController.current = new AbortController();

      console.log(`🔍 Buscando categorias: "${query}"`);
      
      const result = await categoryRepository.current.searchCategories(query, {
        includeInactive,
        maxDepth,
      });
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          search: {
            ...prev.search,
            results: result.data,
            isSearching: false,
            recentSearches: addToRecentSearches(prev.search.recentSearches, query),
          },
        }));

        console.log(`✅ Busca concluída: ${result.data.length} categorias encontradas`);
      } else {
        throw result.error || new Error('Falha na busca');
      }

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('❌ Erro na busca de categorias:', error);
        setState(prev => ({
          ...prev,
          hasError: true,
          error: 'Erro na busca de categorias',
        }));
      }
    } finally {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, search: false },
        search: { ...prev.search, isSearching: false },
      }));
    }
  }, [enableSearch, includeInactive, maxDepth]);

  /**
   * 📂 Navega para uma categoria
   */
  const navigateToCategory = useCallback((category: Category | null): void => {
    setState(prev => {
      const newBreadcrumb = category ? buildBreadcrumb(category, prev.categories) : [];
      
      return {
        ...prev,
        currentCategory: category,
        breadcrumb: newBreadcrumb,
      };
    });
    
    console.log(`📂 Navegando para categoria: ${category?.name || 'raiz'}`);
  }, []);

  /**
   * 🌳 Expande/contrai nó da hierarquia
   */
  const toggleCategoryNode = useCallback((categoryId: string): void => {
    setState(prev => ({
      ...prev,
      hierarchyTree: toggleNodeExpansion(prev.hierarchyTree, categoryId),
    }));
  }, []);

  /**
   * 👨‍👩‍👧‍👦 Obtém categorias filhas
   */
  const getChildCategories = useCallback((parentId?: string): Category[] => {
    return state.categories.filter(category => category.parentId === parentId);
  }, [state.categories]);

  /**
   * 🔄 Atualiza cache
   */
  const refreshCache = useCallback((): Promise<void> => {
    return loadCategories(true);
  }, [loadCategories]);

  /**
   * 🧹 Limpa busca
   */
  const clearSearch = useCallback((): void => {
    setState(prev => ({
      ...prev,
      search: {
        ...prev.search,
        query: '',
        results: [],
        isSearching: false,
      },
    }));
  }, []);

  /**
   * 📊 Getters computados
   */
  const getters = useMemo(() => ({
    // Estado da busca
    isSearchActive: !!state.search.query,
    hasSearchResults: state.search.results.length > 0,
    
    // Estado geral
    isEmpty: state.categories.length === 0,
    isLoading: Object.values(state.loading).some(Boolean),
    hasData: state.categories.length > 0,
    
    // Categorias por nível
    rootCategories: state.categories.filter(c => !c.parentId),
    leafCategories: state.categories.filter(c => 
      !state.categories.some(child => child.parentId === c.id)
    ),
    
    // Navegação
    isAtRoot: !state.currentCategory,
    canGoBack: state.breadcrumb.length > 0,
    currentLevel: state.currentCategory?.level || 0,
    
    // Estatísticas
    categoriesByLevel: state.categories.reduce((acc, category) => {
      const level = category.level || 0;
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<number, number>),
    
  }), [state]);

  /**
   * 🔄 Effects
   */

  // Auto-load inicial
  useEffect(() => {
    if (autoLoad && !state.categories.length && !state.loading.initial) {
      loadCategories();
    }
  }, [autoLoad, loadCategories, state.categories.length, state.loading.initial]);

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
    loadCategories,
    searchCategories,
    navigateToCategory,
    toggleCategoryNode,
    getChildCategories,
    refreshCache,
    clearSearch,
    
    // Utilitários
    getCategoryById: (id: string) => state.categories.find(c => c.id === id),
    getCategoryPath: (category: Category) => buildBreadcrumb(category, state.categories),
    isCategoryActive: (id: string) => {
      const category = state.categories.find(c => c.id === id);
      return category?.isActive || false;
    },
    
    // Hierarquia
    getCategoryDepth: (id: string) => {
      const category = state.categories.find(c => c.id === id);
      return category?.level || 0;
    },
    
    // Estatísticas
    getStats: () => ({
      totalCategories: state.totalCount,
      activeCategories: state.activeCount,
      maxDepth: state.maxDepth,
      searchesCount: state.search.recentSearches.length,
    }),
  };
};

/**
 * 🔧 Funções auxiliares
 */

function buildCategoryHierarchy(categories: Category[]): CategoryNode[] {
  const categoryMap = new Map<string, CategoryNode>();
  const rootNodes: CategoryNode[] = [];

  // Cria nós
  categories.forEach(category => {
    const node: CategoryNode = {
      category,
      children: [],
      depth: category.level || 0,
      hasChildren: false,
      isExpanded: false,
      path: category.path ? category.path.split('/') : [category.id],
    };
    categoryMap.set(category.id, node);
  });

  // Constrói hierarquia
  categories.forEach(category => {
    const node = categoryMap.get(category.id)!;
    
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.children.push(node);
        parent.hasChildren = true;
        node.parent = parent;
      }
    } else {
      rootNodes.push(node);
    }
  });

  // Ordena por sortOrder
  const sortNodes = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => {
      const orderA = a.category.sortOrder || 0;
      const orderB = b.category.sortOrder || 0;
      return orderA - orderB;
    });
    
    nodes.forEach(node => sortNodes(node.children));
  };

  sortNodes(rootNodes);
  
  return rootNodes;
}

function buildBreadcrumb(category: Category, allCategories: Category[]): Category[] {
  const breadcrumb: Category[] = [];
  let current: Category | undefined = category;
  
  while (current) {
    breadcrumb.unshift(current);
    current = current.parentId 
      ? allCategories.find(c => c.id === current!.parentId)
      : undefined;
  }
  
  return breadcrumb;
}

function toggleNodeExpansion(tree: CategoryNode[], categoryId: string): CategoryNode[] {
  return tree.map(node => {
    if (node.category.id === categoryId) {
      return { ...node, isExpanded: !node.isExpanded };
    }
    
    if (node.children.length > 0) {
      return {
        ...node,
        children: toggleNodeExpansion(node.children, categoryId),
      };
    }
    
    return node;
  });
}

function addToRecentSearches(current: string[], newSearch: string): string[] {
  const filtered = current.filter(search => search !== newSearch);
  return [newSearch, ...filtered].slice(0, 10); // Máximo 10
}