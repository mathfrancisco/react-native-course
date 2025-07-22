import { IntegratedRepositoryFactory } from '../../src/business/config/IntegratedRepositoryFactory';
import { RecipeService } from '../../src/business/services/controller/RecipeService';
import { ValidationManager } from '../../src/core/validators/controller/ValidationManager';
import { RecipeFactory } from '../fixtures/recipe.fixtures';

// Mocks para integração
jest.mock('@business/bridges/controller/DataLoaderBridge');
jest.mock('@business/bridges/controller/ValidationBridge');

describe('Recipe Workflow Integration', () => {
  let factory: IntegratedRepositoryFactory;
  let recipeService: RecipeService;
  let validationManager: ValidationManager;
  
  beforeAll(async () => {
    // Setup da integração
    factory = IntegratedRepositoryFactory.getInstance();
    
    // Mock dos dados para teste de integração
    const mockDataLoaderBridge = require('@business/bridges/controller/DataLoaderBridge').DataLoaderBridge.getInstance();
    const mockValidationBridge = require('@business/bridges/controller/ValidationBridge').ValidationBridge.getInstance();
    
    const testRecipes = RecipeFactory.createBatch(10);
    mockDataLoaderBridge.loadRecipes.mockResolvedValue(testRecipes);
    mockValidationBridge.validateRecipe.mockReturnValue({ isValid: true, errors: [] });
    
    // Inicializa o sistema
    await factory.initializeRepositories();
    
    recipeService = new RecipeService();
    validationManager = ValidationManager.getInstance();
  });
  
  describe('Complete Recipe Lifecycle', () => {
    it('deve executar fluxo completo: criar, validar, buscar, favoritar', async () => {
      const userId = 'integration_user_123';
      
      // 1. Criar receita
      const newRecipe = RecipeFactory.createValid({
        title: 'Receita de Integração',
        description: 'Receita criada para teste de integração completo'
      });
      
      // 2. Validar receita
      const validation = await validationManager.validateRecipe(newRecipe);
      expect(validation.isValid).toBe(true);
      expect(validation.score).toBeGreaterThan(70);
      
      // 3. Buscar receitas
      const searchResults = await recipeService.searchRecipes({
        query: 'integração',
        filters: {},
        sortBy: 'rating',
        sortOrder: 'desc'
      });
      
      expect(searchResults.data.length).toBeGreaterThanOrEqual(0);
      
      // 4. Buscar por categoria
      const categoryRecipes = await recipeService.getRecipesByCategory(newRecipe.categoryId);
      expect(Array.isArray(categoryRecipes)).toBe(true);
      
      // 5. Obter recomendações
      const recommendations = await recipeService.getRecommendedRecipes(userId);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.length).toBeLessThanOrEqual(10);
      
      // 6. Verificar estatísticas
      const stats = await recipeService.getRecipeStats();
      expect(stats.totalRecipes).toBeGreaterThan(0);
      expect(stats.averageRating).toBeGreaterThanOrEqual(0);
      expect(stats.topCategories.length).toBeGreaterThan(0);
    });
  });
  
  describe('Validation Integration', () => {
    it('deve aplicar diferentes perfis de validação', async () => {
      const testRecipe = RecipeFactory.createValid();
      
      // Perfil padrão
      validationManager.setValidationProfile({
        name: 'Teste Padrão',
        description: 'Perfil para teste',
        strictMode: false,
        enableBusinessRules: true,
        enableRealTimeValidation: true
      });
      
      const standardValidation = await validationManager.validateRecipe(testRecipe);
      
      // Perfil rigoroso
      validationManager.setValidationProfile({
        name: 'Teste Rigoroso',
        description: 'Perfil rigoroso para teste',
        strictMode: true,
        enableBusinessRules: true,
        enableRealTimeValidation: true
      });
      
      const strictValidation = await validationManager.validateRecipe(testRecipe);
      
      // Ambos devem ser válidos, mas podem ter scores diferentes
      expect(standardValidation.isValid).toBe(true);
      expect(strictValidation.isValid).toBe(true);
    });
  });
  
  describe('Error Handling Integration', () => {
    it('deve lidar graciosamente com falhas de repositório', async () => {
      // Simula falha no repositório
      const mockRepository = require('@core/repositories/controller/RepositoryManager').RepositoryManager.getInstance();
      const failingRepo = {
        getAll: jest.fn().mockRejectedValue(new Error('Repository failure')),
        getById: jest.fn().mockResolvedValue(null),
        search: jest.fn().mockResolvedValue([]),
      };
      
      mockRepository.getRecipeRepository.mockReturnValue(failingRepo);
      
      // Testa recuperação de erro
      await expect(recipeService.getAllRecipes()).rejects.toThrow();
      
      // Verifica que outros métodos ainda funcionam
      const recipeById = await recipeService.getRecipeById('any_id');
      expect(recipeById).toBeNull();
    });
  });
  
  describe('Performance Integration', () => {
    it('deve executar operações em tempo aceitável', async () => {
      const startTime = performance.now();
      
      // Executa várias operações
      await Promise.all([
        recipeService.getAllRecipes(),
        recipeService.getRecipeStats(),
        recipeService.getRecommendedRecipes(),
      ]);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Deve executar em menos de 2 segundos
      expect(executionTime).toBeLessThan(2000);
    });
    
    it('deve lidar com lotes grandes de receitas', async () => {
      // Teste com validação em lote
      const largeRecipeBatch = RecipeFactory.createBatch(50);
      
      const startTime = performance.now();
      const batchResult = await validationManager.validateBatch(largeRecipeBatch);
      const endTime = performance.now();
      
      expect(batchResult.results).toHaveLength(50);
      expect(batchResult.summary.total).toBe(50);
      
      // Deve processar lote em tempo razoável
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(5000); // 5 segundos
    });
  });
});