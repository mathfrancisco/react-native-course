import { RecipeService } from '../../../src/business/services/controller/RecipeService';
import { SearchCriteria } from '../../../src/core/entities/interface/Filter';
import { MockRepositoryFactory } from '../../__mocks__/repositories.mock';
import { RecipeFactory } from '../../fixtures/recipe.fixtures';

// Mock do RepositoryManager
jest.mock('@core/repositories/controller/RepositoryManager', () => ({
  RepositoryManager: {
    getInstance: () => ({
      getRecipeRepository: jest.fn(),
      getCategoryRepository: jest.fn(),
      getFavoriteRepository: jest.fn(),
    }),
  },
}));

describe('RecipeService', () => {
  let service: RecipeService;
  let mockRecipeRepository: any;
  let mockFavoriteRepository: any;
  let mockCategoryRepository: any;
  
  beforeEach(() => {
    const { RepositoryManager } = require('@core/repositories/controller/RepositoryManager');
    const manager = RepositoryManager.getInstance();
    
    mockRecipeRepository = MockRepositoryFactory.createRecipeRepository();
    mockFavoriteRepository = MockRepositoryFactory.createFavoriteRepository();
    mockCategoryRepository = MockRepositoryFactory.createCategoryRepository();
    
    manager.getRecipeRepository.mockReturnValue(mockRecipeRepository);
    manager.getFavoriteRepository.mockReturnValue(mockFavoriteRepository);
    manager.getCategoryRepository.mockReturnValue(mockCategoryRepository);
    
    service = new RecipeService();
  });
  
  describe('getAllRecipes', () => {
    it('deve retornar todas as receitas', async () => {
      // Arrange
      const testRecipes = RecipeFactory.createBatch(5);
      testRecipes.forEach(recipe => mockRecipeRepository.addRecipe(recipe));
      
      // Act
      const recipes = await service.getAllRecipes();
      
      // Assert
      expect(recipes).toHaveLength(5);
    });
    
    it('deve propagar erro do repositório', async () => {
      // Arrange
      mockRecipeRepository.setShouldFail(true);
      
      // Act & Assert
      await expect(service.getAllRecipes()).rejects.toThrow('Não foi possível carregar as receitas');
    });
  });
  
  describe('getRecipeById', () => {
    it('deve retornar receita pelo ID', async () => {
      // Arrange
      const testRecipe = RecipeFactory.createValid({ id: 'test_123' });
      mockRecipeRepository.addRecipe(testRecipe);
      
      // Act
      const recipe = await service.getRecipeById('test_123');
      
      // Assert
      expect(recipe).not.toBeNull();
      expect(recipe?.id).toBe('test_123');
    });
    
    it('deve retornar null para ID inexistente', async () => {
      // Act
      const recipe = await service.getRecipeById('inexistente');
      
      // Assert
      expect(recipe).toBeNull();
    });
    
    it('deve retornar null para ID vazio', async () => {
      // Act
      const recipe = await service.getRecipeById('');
      
      // Assert
      expect(recipe).toBeNull();
    });
  });
  
  describe('searchRecipes', () => {
    it('deve buscar receitas com critérios', async () => {
      // Arrange
      const testRecipes = [
        RecipeFactory.createValid({ title: 'Bolo de Chocolate' }),
        RecipeFactory.createValid({ title: 'Torta de Morango' }),
      ];
      testRecipes.forEach(recipe => mockRecipeRepository.addRecipe(recipe));
      
      const criteria: SearchCriteria = {
        query: 'chocolate',
        filters: {},
        sortBy: 'rating',
        sortOrder: 'desc'
      };
      
      // Act
      const result = await service.searchRecipes(criteria);
      
      // Assert
      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('Bolo de Chocolate');
    });
    
    it('deve retornar resultado vazio em caso de erro', async () => {
      // Arrange
      mockRecipeRepository.setShouldFail(true);
      
      const criteria: SearchCriteria = {
        query: 'teste',
        filters: {},
        sortBy: 'rating',
        sortOrder: 'desc'
      };
      
      // Act
      const result = await service.searchRecipes(criteria);
      
      // Assert
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });
  
  describe('getRecommendedRecipes', () => {
    beforeEach(() => {
      // Adiciona receitas variadas para teste de recomendação
      const recipes = [
        RecipeFactory.createValid({ rating: 4.8, reviewCount: 200 }),
        RecipeFactory.createValid({ rating: 4.5, reviewCount: 150 }),
        RecipeFactory.createValid({ rating: 4.2, reviewCount: 100 }),
        RecipeFactory.createValid({ rating: 3.8, reviewCount: 50 }),
      ];
      recipes.forEach(recipe => mockRecipeRepository.addRecipe(recipe));
    });
    
    it('deve retornar receitas recomendadas sem usuário', async () => {
      // Act
      const recommendations = await service.getRecommendedRecipes();
      
      // Assert
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.length).toBeLessThanOrEqual(10);
      
      // Verifica se está ordenado por popularidade (rating * log(reviews))
      const scores = recommendations.map(r => r.rating * Math.log(r.reviewCount + 1));
      for (let i = 0; i < scores.length - 1; i++) {
        expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
      }
    });
    
    it('deve retornar receitas baseadas em favoritos do usuário', async () => {
      // Arrange
      const userId = 'user_123';
      const favoriteRecipe = RecipeFactory.createValid({ categoryId: 'cat_desserts' });
      mockRecipeRepository.addRecipe(favoriteRecipe);
      await mockFavoriteRepository.add(favoriteRecipe.id, userId);
      
      // Act
      const recommendations = await service.getRecommendedRecipes(userId);
      
      // Assert
      expect(recommendations.length).toBeGreaterThan(0);
      // As recomendações devem incluir receitas similares (mesma categoria)
    });
  });
  
  describe('getRecipesWithFavoriteStatus', () => {
    it('deve adicionar status de favorito às receitas', async () => {
      // Arrange
      const userId = 'user_123';
      const recipes = RecipeFactory.createBatch(3);
      
      // Marca primeira receita como favorita
      await mockFavoriteRepository.add(recipes[0].id, userId);
      
      // Act
      const recipesWithStatus = await service.getRecipesWithFavoriteStatus(recipes, userId);
      
      // Assert
      expect(recipesWithStatus).toHaveLength(3);
      expect(recipesWithStatus[0].isFavorite).toBe(true);
      expect(recipesWithStatus[1].isFavorite).toBe(false);
      expect(recipesWithStatus[2].isFavorite).toBe(false);
    });
    
    it('deve marcar todas como não favoritas quando não há userId', async () => {
      // Arrange
      const recipes = RecipeFactory.createBatch(2);
      
      // Act
      const recipesWithStatus = await service.getRecipesWithFavoriteStatus(recipes, '');
      
      // Assert
      expect(recipesWithStatus).toHaveLength(2);
      expect(recipesWithStatus.every(r => !r.isFavorite)).toBe(true);
    });
    
    it('deve lidar com erro graciosamente', async () => {
      // Arrange
      const recipes = RecipeFactory.createBatch(2);
      mockFavoriteRepository.setShouldFail(true);
      
      // Act
      const recipesWithStatus = await service.getRecipesWithFavoriteStatus(recipes, 'user_123');
      
      // Assert
      expect(recipesWithStatus).toHaveLength(2);
      expect(recipesWithStatus.every(r => !r.isFavorite)).toBe(true);
    });
  });
  
  describe('getRecipeStats', () => {
    it('deve calcular estatísticas das receitas', async () => {
      // Arrange
      const recipes = [
        RecipeFactory.createValid({ 
          categoryId: 'cat_1', 
          rating: 4.0,
          tags: ['doce', 'fácil']
        }),
        RecipeFactory.createValid({ 
          categoryId: 'cat_1', 
          rating: 5.0,
          tags: ['doce', 'rápido']
        }),
        RecipeFactory.createValid({ 
          categoryId: 'cat_2', 
          rating: 3.0,
          tags: ['salgado', 'fácil']
        }),
      ];
      recipes.forEach(recipe => mockRecipeRepository.addRecipe(recipe));
      
      // Act
      const stats = await service.getRecipeStats();
      
      // Assert
      expect(stats.totalRecipes).toBe(3);
      expect(stats.averageRating).toBe(4.0); // (4.0 + 5.0 + 3.0) / 3
      
      expect(stats.topCategories).toHaveLength(2);
      expect(stats.topCategories[0]).toEqual({ categoryId: 'cat_1', count: 2 });
      expect(stats.topCategories[1]).toEqual({ categoryId: 'cat_2', count: 1 });
      
      expect(stats.popularTags).toContainEqual({ tag: 'doce', count: 2 });
      expect(stats.popularTags).toContainEqual({ tag: 'fácil', count: 2 });
    });
    
    it('deve retornar estatísticas vazias quando não há receitas', async () => {
      // Act
      const stats = await service.getRecipeStats();
      
      // Assert
      expect(stats.totalRecipes).toBe(0);
      expect(stats.averageRating).toBe(0);
      expect(stats.topCategories).toHaveLength(0);
      expect(stats.popularTags).toHaveLength(0);
    });
  });
});