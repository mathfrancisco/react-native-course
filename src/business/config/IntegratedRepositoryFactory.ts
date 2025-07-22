
import { IntegratedRecipeRepository } from '../repositories/controller/IntegratedRecipeRepository';

import { FavoriteRepository } from '../repositories/controller/FavoriteRepository';
import { RepositoryConfig } from '../repositories/interface/IBaseRepository';
import { RepositoryManager } from '../../core/repositories/controller/RepositoryManager';

export class IntegratedRepositoryFactory {
  private static instance: IntegratedRepositoryFactory;
  private initialized = false;
  
  private constructor() {}
  
  static getInstance(): IntegratedRepositoryFactory {
    if (!IntegratedRepositoryFactory.instance) {
      IntegratedRepositoryFactory.instance = new IntegratedRepositoryFactory();
    }
    return IntegratedRepositoryFactory.instance;
  }
  
  /**
   * 🚀 Inicializa repositórios integrados
   */
  async initializeRepositories(): Promise<void> {
    if (this.initialized) {
      console.log('✅ Repositórios integrados já inicializados');
      return;
    }
    
    try {
      console.log('🔄 Inicializando repositórios integrados...');
      
      const config: RepositoryConfig = {
        enableCache: true,
        cacheTimeout: 5 * 60 * 1000,
        dataPath: 'src/shared/data/json',
        autoSync: true
      };
      
      // Cria repositórios integrados
      const recipeRepository = new IntegratedRecipeRepository(config);
      const categoryRepository = new IntegratedCategoryRepository({
        ...config,
        cacheTimeout: 10 * 60 * 1000 // Categorias mudam menos
      });
      const favoriteRepository = new FavoriteRepository(config);
      
      // Registra no RepositoryManager
      const manager = RepositoryManager.getInstance();
      manager.setRecipeRepository(recipeRepository);
      manager.setCategoryRepository(categoryRepository);
      manager.setFavoriteRepository(favoriteRepository);
      
      // Inicializa todos (conecta com JSONs)
      console.log('🔗 Conectando com dados JSON...');
      await Promise.all([
        recipeRepository.initialize(),
        categoryRepository.initialize(),
        favoriteRepository.initialize()
      ]);
      
      this.initialized = true;
      console.log('✅ Repositórios integrados inicializados com sucesso!');
      
      // Mostra estatísticas
      await this.showInitializationStats();
      
    } catch (error) {
      console.error('❌ Erro na inicialização dos repositórios integrados:', error);
      throw error;
    }
  }
  
  /**
   * 📊 Mostra estatísticas da inicialização
   */
  private async showInitializationStats(): Promise<void> {
    try {
      const manager = RepositoryManager.getInstance();
      
      const recipes = await manager.getRecipeRepository().getAll();
      const categories = await manager.getCategoryRepository().getAll();
      
      console.log(`📊 Estatísticas da inicialização:`);
      console.log(`   📄 ${recipes.length} receitas carregadas`);
      console.log(`   📂 ${categories.length} categorias carregadas`);
      console.log(`   ⚡ Cache habilitado`);
      console.log(`   🔗 Integração JSON ativa`);
      
      // Verifica integridade
      const ValidationBridge = require('../bridges/controller/ValidationBridge').ValidationBridge;
      const bridge = ValidationBridge.getInstance();
      const integrity = bridge.checkDataIntegrity(recipes, categories);
      
      if (integrity.validationErrors.length > 0) {
        console.warn(`⚠️  ${integrity.validationErrors.length} problemas de validação encontrados`);
      }
      
      if (integrity.missingCategories.length > 0) {
        console.warn(`⚠️  ${integrity.missingCategories.length} categorias referenciadas não encontradas`);
      }
      
    } catch (error) {
      console.warn('⚠️  Não foi possível mostrar estatísticas:', error);
    }
  }
  
  /**
   * 🔄 Sincroniza todos os dados
   */
  async syncAllData(): Promise<void> {
    try {
      console.log('🔄 Sincronizando todos os dados JSON...');
      
      const manager = RepositoryManager.getInstance();
      
      await Promise.all([
        manager.getRecipeRepository().sync(),
        manager.getCategoryRepository().sync(),
        manager.getFavoriteRepository().sync()
      ]);
      
      console.log('✅ Sincronização concluída');
      
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      throw error;
    }
  }
  
  /**
   * 📊 Status da integração
   */
  async getIntegrationStatus(): Promise<{
    isConnected: boolean;
    dataSource: string;
    lastSync: Date | null;
    recipeCount: number;
    categoryCount: number;
    errors: string[];
  }> {
    try {
      const manager = RepositoryManager.getInstance();
      
      const recipes = await manager.getRecipeRepository().getAll();
      const categories = await manager.getCategoryRepository().getAll();
      
      return {
        isConnected: this.initialized,
        dataSource: 'JSON Files + DataLoader',
        lastSync: new Date(),
        recipeCount: recipes.length,
        categoryCount: categories.length,
        errors: []
      };
      
    } catch (error) {
      return {
        isConnected: false,
        dataSource: 'Erro',
        lastSync: null,
        recipeCount: 0,
        categoryCount: 0,
        errors: [error.message]
      };
    }
  }
  
  isInitialized(): boolean {
    return this.initialized;
  }
}