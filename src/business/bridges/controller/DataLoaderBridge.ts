import { dataLoader } from '../../../shared/data/typescript/DataLoader';
import { Recipe as CoreRecipe, Category as CoreCategory } from '../../../core/entities';
import { RecipeDataAdapter } from '../../adapters/controller/RecipeDataAdapter';
import { CategoryDataAdapter } from '../../adapters/controller/CategoryDataAdapter';
import { RecipeHelpers } from '../../../shared/data/helpers/recipeHelpers';
import { CategoryHelpers } from '../../../shared/data/helpers/categoryHelpers';

export class DataLoaderBridge {
  private static instance: DataLoaderBridge;
  
  private constructor() {}
  
  static getInstance(): DataLoaderBridge {
    if (!DataLoaderBridge.instance) {
      DataLoaderBridge.instance = new DataLoaderBridge();
    }
    return DataLoaderBridge.instance;
  }
  
  /**
   * 🍳 Carrega receitas usando DataLoader existente
   */
  async loadRecipes(): Promise<CoreRecipe[]> {
    try {
      console.log('🔄 Carregando receitas via DataLoader...');
      
      // Usa o DataLoader existente
      const result = await dataLoader.loadRecipes({
        source: 'json', // Força usar JSON
        forceRefresh: false,
        includeInactive: false
      });
      
      console.log(`📊 ${result.data.length} receitas carregadas do ${result.source}`);
      
      // Converte usando adapter
      const coreRecipes = RecipeDataAdapter.adaptRecipeList(result.data);
      
      console.log(`✅ ${coreRecipes.length} receitas adaptadas com sucesso`);
      
      return coreRecipes;
      
    } catch (error) {
      console.error('❌ Erro ao carregar receitas:', error);
      
      // Fallback: tenta carregar dados mock
      try {
        console.log('🔄 Tentando fallback para dados mock...');
        const mockResult = await dataLoader.loadRecipes({ source: 'mock' });
        return RecipeDataAdapter.adaptRecipeList(mockResult.data);
      } catch (mockError) {
        console.error('❌ Fallback também falhou:', mockError);
        return [];
      }
    }
  }
  
  /**
   * 📂 Carrega categorias usando DataLoader existente
   */
  async loadCategories(): Promise<CoreCategory[]> {
    try {
      console.log('🔄 Carregando categorias via DataLoader...');
      
      const result = await dataLoader.loadCategories({
        source: 'json',
        forceRefresh: false,
        includeInactive: false
      });
      
      console.log(`📊 ${result.data.length} categorias carregadas do ${result.source}`);
      
      // Converte usando adapter
      const coreCategories = CategoryDataAdapter.adaptCategoryList(result.data);
      
      console.log(`✅ ${coreCategories.length} categorias adaptadas com sucesso`);
      
      return coreCategories;
      
    } catch (error) {
      console.error('❌ Erro ao carregar categorias:', error);
      
      // Fallback para mock
      try {
        const mockResult = await dataLoader.loadCategories({ source: 'mock' });
        return CategoryDataAdapter.adaptCategoryList(mockResult.data);
      } catch (mockError) {
        console.error('❌ Fallback de categorias falhou:', mockError);
        return [];
      }
    }
  }
  
  /**
   * 🔍 Busca receitas usando helpers existentes
   */
  async searchRecipes(query: string, allRecipes?: CoreRecipe[]): Promise<CoreRecipe[]> {
    try {
      let recipes: CoreRecipe[];
      
      if (allRecipes) {
        recipes = allRecipes;
      } else {
        recipes = await this.loadRecipes();
      }
      
      // Converte para formato Shared para usar helper
      const sharedRecipes = recipes.map(recipe => RecipeDataAdapter.coreToShared(recipe));
      
      // Usa o helper existente
      const searchResults = RecipeHelpers.searchRecipes(sharedRecipes, query);
      
      // Converte de volta para Core
      return RecipeDataAdapter.adaptRecipeList(searchResults);
      
    } catch (error) {
      console.error('❌ Erro na busca de receitas:', error);
      return [];
    }
  }
  
  /**
   * 🔍 Filtra receitas usando helpers existentes
   */
  async filterRecipes(filters: any, allRecipes?: CoreRecipe[]): Promise<CoreRecipe[]> {
    try {
      let recipes: CoreRecipe[];
      
      if (allRecipes) {
        recipes = allRecipes;
      } else {
        recipes = await this.loadRecipes();
      }
      
      // Converte para formato Shared
      const sharedRecipes = recipes.map(recipe => RecipeDataAdapter.coreToShared(recipe));
      
      // Usa o helper existente (adapta filtros se necessário)
      const filteredResults = RecipeHelpers.filterRecipes(sharedRecipes, filters);
      
      // Converte de volta
      return RecipeDataAdapter.adaptRecipeList(filteredResults);
      
    } catch (error) {
      console.error('❌ Erro ao filtrar receitas:', error);
      return [];
    }
  }
  
  /**
   * 📊 Obtém estatísticas usando DataLoader
   */
  async getLoadStats() {
    return {
      cache: dataLoader.getCacheStats(),
      lastUpdate: new Date()
    };
  }
  
  /**
   * 🧹 Limpa cache do DataLoader
   */
  async clearCache(): Promise<void> {
    dataLoader.clearCache();
  }
  
  /**
   * 🔄 Força refresh dos dados
   */
  async refreshData(): Promise<{
    recipes: CoreRecipe[];
    categories: CoreCategory[];
  }> {
    // Limpa cache primeiro
    await this.clearCache();
    
    // Carrega tudo novamente
    const [recipes, categories] = await Promise.all([
      this.loadRecipes(),
      this.loadCategories()
    ]);
    
    return { recipes, categories };
  }
}