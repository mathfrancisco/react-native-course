/**
 * 🪝 useRecipe - Hook para Gerenciamento de Receita Única
 * 
 * Hook especializado para operações com uma receita específica,
 * incluindo carregamento, edição, favoritos e interações.
 * 
 * @author RecipeApp Team
 * @since Fase 3 - Implementation Layer
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { RecipeRepositoryImpl } from '../../repositories/controller/RecipeRepositoryImpl';
import { Recipe } from '../../../core/entities/interface/Recipe';
import { Category } from '../../../core/entities/interface/Category';
import { useAppContext } from '../../contexts/providers/AppProvider';
import { useDataContext } from '../../contexts/providers/DataProvider';

/**
 * 🎯 Configurações do hook
 */
interface UseRecipeConfig {
  autoLoad?: boolean;
  enableEdit?: boolean;
  trackViews?: boolean;
  enableRelated?: boolean;
  cacheEnabled?: boolean;
}

/**
 * 📊 Estado de uma receita
 */
interface RecipeState {
  // Dados principais
  recipe: Recipe | null;
  isLoading: boolean;
  isNotFound: boolean;
  error: string | null;
  
  // Metadados
  lastViewed: Date | null;
  viewCount: number;
  isFavorite: boolean;
  
  // Receitas relacionadas
  relatedRecipes: Recipe[];
  isLoadingRelated: boolean;
  
  // Estado de edição
  isEditing: boolean;
  editedRecipe: Recipe | null;
  hasUnsavedChanges: boolean;
  
  // Interações
  isScaling: boolean;
  currentServings: number;
  scaledIngredients: Recipe['ingredients'];
  
  // Histórico
  versions: Recipe[];
  currentVersion: number;
}

/**
 * 🏭 Estado inicial
 */
const createInitialState = (): RecipeState => ({
  recipe: null,
  isLoading: false,
  isNotFound: false,
  error: null,
  
  lastViewed: null,
  viewCount: 0,
  isFavorite: false,
  
  relatedRecipes: [],
  isLoadingRelated: false,
  
  isEditing: false,
  editedRecipe: null,
  hasUnsavedChanges: false,
  
  isScaling: false,
  currentServings: 4,
  scaledIngredients: [],
  
  versions: [],
  currentVersion: 0,
});

/**
 * 🪝 Hook useRecipe
 */
export const useRecipe = (recipeId: string | null, config: UseRecipeConfig = {}) => {
  const {
    autoLoad = true,
    enableEdit = false,
    trackViews = true,
    enableRelated = true,
    cacheEnabled = true,
  } = config;

  const { state: appState } = useAppContext();
  const { 
    toggleFavorite, 
    isFavorite: checkIsFavorite,
    getRecipeById 
  } = useDataContext();
  
  const [state, setState] = useState<RecipeState>(createInitialState);
  
  // Refs para otimização
  const recipeRepository = useRef(RecipeRepositoryImpl.getInstance());
  const viewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 📖 Carrega receita
   */
  const loadRecipe = useCallback(async (id: string): Promise<void> => {
    if (!id) return;
    
    try {
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
        isNotFound: false,
      }));

      console.log(`📖 Carregando receita: ${id}`);
      
      // Tenta buscar no contexto primeiro
      let recipe = getRecipeById(id);
      
      if (!recipe) {
        // Busca via repository
        const result = await recipeRepository.current.getRecipeById(id, {
          useCache: cacheEnabled,
        });
        
        if (result.success && result.data) {
          recipe = result.data;
        } else {
          setState(prev => ({ ...prev, isNotFound: true }));
          return;
        }
      }

      // Verifica se é favorito
      const isFav = checkIsFavorite(id);
      
      // Atualiza estado
      setState(prev => ({
        ...prev,
        recipe,
        isFavorite: isFav,
        currentServings: recipe.servings,
        scaledIngredients: recipe.ingredients,
        lastViewed: new Date(),
        viewCount: prev.viewCount + 1,
      }));

      // Carrega receitas relacionadas se habilitado
      if (enableRelated) {
        loadRelatedRecipes(recipe);
      }
      
      // Registra visualização se habilitado
      if (trackViews) {
        trackRecipeView(id);
      }
      
      console.log(`✅ Receita carregada: ${recipe.title}`);

    } catch (error) {
      console.error('❌ Erro ao carregar receita:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao carregar receita',
      }));
    } finally {
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, [getRecipeById, checkIsFavorite, cacheEnabled, enableRelated, trackViews]);

  /**
   * 🔗 Carrega receitas relacionadas
   */
  const loadRelatedRecipes = useCallback(async (recipe: Recipe): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoadingRelated: true }));
      
      // Busca receitas da mesma categoria
      const result = await recipeRepository.current.getRecipesByCategory(recipe.categoryId, {
        useCache: cacheEnabled,
      });
      
      if (result.success) {
        // Remove a receita atual e pega as 5 primeiras
        const related = result.data
          .filter(r => r.id !== recipe.id)
          .slice(0, 5);
        
        setState(prev => ({ ...prev, relatedRecipes: related }));
        console.log(`🔗 ${related.length} receitas relacionadas carregadas`);
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar receitas relacionadas:', error);
    } finally {
      setState(prev => ({ ...prev, isLoadingRelated: false }));
    }
  }, [cacheEnabled]);

  /**
   * ❤️ Toggle favorito
   */
  const handleToggleFavorite = useCallback(async (): Promise<void> => {
    if (!state.recipe) return;
    
    try {
      await toggleFavorite(state.recipe.id);
      
      setState(prev => ({
        ...prev,
        isFavorite: !prev.isFavorite,
      }));
      
      console.log(`❤️ Favorito ${state.isFavorite ? 'removido' : 'adicionado'}: ${state.recipe.title}`);
      
    } catch (error) {
      console.error('❌ Erro ao alterar favorito:', error);
    }
  }, [state.recipe, state.isFavorite, toggleFavorite]);

  /**
   * 📏 Escala ingredientes
   */
  const scaleRecipe = useCallback((newServings: number): void => {
    if (!state.recipe || newServings <= 0) return;
    
    setState(prev => ({
      ...prev,
      isScaling: true,
    }));
    
    // Calcula fator de escala
    const scaleFactor = newServings / state.recipe.servings;
    
    // Escala ingredientes
    const scaledIngredients = state.recipe.ingredients.map(ingredient => ({
      ...ingredient,
      quantity: Math.round((ingredient.quantity * scaleFactor) * 100) / 100, // 2 casas decimais
    }));
    
    setState(prev => ({
      ...prev,
      currentServings: newServings,
      scaledIngredients,
      isScaling: false,
    }));
    
    console.log(`📏 Receita escalada para ${newServings} porções (fator: ${scaleFactor})`);
  }, [state.recipe]);

  /**
   * ✏️ Inicia edição (se habilitado)
   */
  const startEditing = useCallback((): void => {
    if (!enableEdit || !state.recipe) return;
    
    setState(prev => ({
      ...prev,
      isEditing: true,
      editedRecipe: { ...prev.recipe! },
      hasUnsavedChanges: false,
    }));
    
    console.log('✏️ Modo de edição ativado');
  }, [enableEdit, state.recipe]);

  /**
   * 💾 Salva edições
   */
  const saveEdits = useCallback(async (): Promise<void> => {
    if (!state.editedRecipe) return;
    
    try {
      // TODO: Implementar salvamento real quando tiver backend
      console.log('💾 Salvando edições...');
      
      setState(prev => ({
        ...prev,
        recipe: prev.editedRecipe!,
        isEditing: false,
        editedRecipe: null,
        hasUnsavedChanges: false,
        versions: [...prev.versions, prev.recipe!],
        currentVersion: prev.versions.length + 1,
      }));
      
      console.log('✅ Edições salvas com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao salvar edições:', error);
    }
  }, [state.editedRecipe]);

  /**
   * ❌ Cancela edição
   */
  const cancelEditing = useCallback((): void => {
    setState(prev => ({
      ...prev,
      isEditing: false,
      editedRecipe: null,
      hasUnsavedChanges: false,
    }));
    
    console.log('❌ Edição cancelada');
  }, []);

  /**
   * 📝 Atualiza campo da receita editada
   */
  const updateRecipeField = useCallback(<K extends keyof Recipe>(
    field: K,
    value: Recipe[K]
  ): void => {
    if (!state.isEditing) return;
    
    setState(prev => ({
      ...prev,
      editedRecipe: prev.editedRecipe ? {
        ...prev.editedRecipe,
        [field]: value,
      } : null,
      hasUnsavedChanges: true,
    }));
  }, [state.isEditing]);

  /**
   * 🔄 Reseta escala
   */
  const resetScale = useCallback((): void => {
    if (!state.recipe) return;
    
    setState(prev => ({
      ...prev,
      currentServings: prev.recipe!.servings,
      scaledIngredients: prev.recipe!.ingredients,
    }));
    
    console.log('🔄 Escala resetada para porções originais');
  }, [state.recipe]);

  /**
   * 👁️ Registra visualização
   */
  const trackRecipeView = useCallback((id: string): void => {
    // Debounce para evitar múltiplos registros
    if (viewTimeoutRef.current) {
      clearTimeout(viewTimeoutRef.current);
    }
    
    viewTimeoutRef.current = setTimeout(() => {
      // TODO: Enviar para analytics quando implementado
      console.log(`👁️ Visualização registrada: ${id}`);
    }, 2000); // 2 segundos de delay
  }, []);

  /**
   * 📊 Obtém categoria da receita
   */
  const getRecipeCategory = useCallback((): Category | null => {
    if (!state.recipe) return null;
    
    return appState.categories.find(c => c.id === state.recipe!.categoryId) || null;
  }, [state.recipe, appState.categories]);

  /**
   * ⏱️ Calcula tempo total
   */
  const getTotalTime = useCallback((): number => {
    if (!state.recipe) return 0;
    return state.recipe.prepTime + state.recipe.cookTime;
  }, [state.recipe]);

  /**
   * 🔄 Effects
   */

  // Auto-load quando recipeId muda
  useEffect(() => {
    if (autoLoad && recipeId) {
      loadRecipe(recipeId);
    } else if (!recipeId) {
      setState(createInitialState());
    }
  }, [autoLoad, recipeId, loadRecipe]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (viewTimeoutRef.current) {
        clearTimeout(viewTimeoutRef.current);
      }
    };
  }, []);

  /**
   * 📋 Retorno do hook
   */
  return {
    // Estado principal
    ...state,
    
    // Estado computado
    isReady: !state.isLoading && !state.error && !!state.recipe,
    hasData: !!state.recipe,
    isScaled: state.currentServings !== (state.recipe?.servings || 0),
    scaleFactor: state.recipe ? state.currentServings / state.recipe.servings : 1,
    
    // Ações principais
    loadRecipe,
    refresh: () => recipeId ? loadRecipe(recipeId) : Promise.resolve(),
    toggleFavorite: handleToggleFavorite,
    
    // Escala
    scaleRecipe,
    resetScale,
    
    // Edição (se habilitado)
    startEditing: enableEdit ? startEditing : undefined,
    saveEdits: enableEdit ? saveEdits : undefined,
    cancelEditing: enableEdit ? cancelEditing : undefined,
    updateRecipeField: enableEdit ? updateRecipeField : undefined,
    
    // Utilitários
    getRecipeCategory,
    getTotalTime,
    
    // Dados derivados
    category: getRecipeCategory(),
    totalTime: getTotalTime(),
    
    // Helpers de tempo
    prepTimeFormatted: state.recipe ? formatTime(state.recipe.prepTime) : '',
    cookTimeFormatted: state.recipe ? formatTime(state.recipe.cookTime) : '',
    totalTimeFormatted: formatTime(getTotalTime()),
    
    // Helpers de dificuldade
    difficultyLabel: state.recipe ? getDifficultyLabel(state.recipe.difficulty) : '',
    difficultyColor: state.recipe ? getDifficultyColor(state.recipe.difficulty) : '',
    
    // Estado de loading específico
    isLoadingAny: state.isLoading || state.isLoadingRelated || state.isScaling,
  };
};

/**
 * 🔧 Funções auxiliares
 */

function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
}

function getDifficultyLabel(difficulty: string): string {
  const labels = {
    easy: 'Fácil',
    medium: 'Médio',
    hard: 'Difícil',
  };
  
  return labels[difficulty as keyof typeof labels] || difficulty;
}

function getDifficultyColor(difficulty: string): string {
  const colors = {
    easy: '#4CAF50',   // Verde
    medium: '#FF9800', // Laranja
    hard: '#F44336',   // Vermelho
  };
  
  return colors[difficulty as keyof typeof colors] || '#757575';
}