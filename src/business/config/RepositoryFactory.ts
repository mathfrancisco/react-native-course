
import { RecipeRepository } from '../repositories/controller/RecipeRepository';
import { CategoryRepository } from '../repositories/controller/CategoryRepository';
import { FavoriteRepository } from '../repositories/controller/FavoriteRepository';
import { RepositoryConfig } from '../repositories/interface/IBaseRepository';
import { RepositoryManager } from '../../core/repositories/controller/RepositoryManager';

export class RepositoryFactory {
  private static instance: RepositoryFactory;
  private initialized = false;
  
  private constructor() {}
  
  static getInstance(): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory();
    }
    return RepositoryFactory.instance;
  }
  
  /**
   * 🚀 Inicializa todos os repositórios
   */
  async initializeRepositories(): Promise<void> {
    if (this.initialized) {
      console.log('✅ Repositórios já inicializados');
      return;
    }
    
    try {
      console.log('🔄 Inicializando repositórios...');
      
      // Configuração padrão
      const defaultConfig: RepositoryConfig = {
        enableCache: true,
        cacheTimeout: 5 * 60 * 1000, // 5 minutos
        dataPath: '',
        autoSync: true
      };
      
      // Cria instâncias dos repositórios
      const recipeRepository = new RecipeRepository(defaultConfig);
      const categoryRepository = new CategoryRepository({
        ...defaultConfig,
        cacheTimeout: 10 * 60 * 1000 // Categorias mudam menos
      });
      const favoriteRepository = new FavoriteRepository(defaultConfig);
      
      // Registra no RepositoryManager
      const manager = RepositoryManager.getInstance();
      manager.setRecipeRepository(recipeRepository);
      manager.setCategoryRepository(categoryRepository);
      manager.setFavoriteRepository(favoriteRepository);
      
      // Inicializa todos
      await Promise.all([
        recipeRepository.initialize(),
        categoryRepository.initialize(),
        favoriteRepository.initialize()
      ]);
      
      this.initialized = true;
      console.log('✅ Todos os repositórios inicializados com sucesso');
      
    } catch (error) {
      console.error('❌ Erro na inicialização dos repositórios:', error);
      throw error;
    }
  }
  
  /**
   * 🔄 Sincroniza todos os repositórios
   */
  async syncAllRepositories(): Promise<void> {
    try {
      console.log('🔄 Sincronizando repositórios...');
      
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
   * 🧹 Limpa cache de todos os repositórios
   */
  async clearAllCaches(): Promise<void> {
    try {
      await RepositoryManager.getInstance().clearAllCaches();
      console.log('🧹 Cache limpo com sucesso');
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
    }
  }
  
  /**
   * 📊 Status de todos os repositórios
   */
  async getRepositoriesStatus(): Promise<{
    recipe: any;
    category: any;
    favorite: any;
  }> {
    try {
      const manager = RepositoryManager.getInstance();
      
      const recipeRepo = manager.getRecipeRepository() as any;
      const categoryRepo = manager.getCategoryRepository() as any;
      const favoriteRepo = manager.getFavoriteRepository() as any;
      
      return {
        recipe: {
          initialized: recipeRepo.isInitialized(),
          lastSync: recipeRepo.getLastSyncTime(),
          enableCache: recipeRepo.enableCache
        },
        category: {
          initialized: categoryRepo.isInitialized(),
          lastSync: categoryRepo.getLastSyncTime(),
          enableCache: categoryRepo.enableCache
        },
        favorite: {
          initialized: favoriteRepo.isInitialized(),
          lastSync: favoriteRepo.getLastSyncTime(),
          enableCache: favoriteRepo.enableCache
        }
      };
      
    } catch (error) {
      console.error('❌ Erro ao obter status:', error);
      return {
        recipe: { initialized: false, lastSync: null, enableCache: false },
        category: { initialized: false, lastSync: null, enableCache: false },
        favorite: { initialized: false, lastSync: null, enableCache: false }
      };
    }
  }
  
  isInitialized(): boolean {
    return this.initialized;
  }
}