
import { RecipeFilter } from '../../../src/core/entities/interface/Filter';
import { GetRecipesUseCase } from '../../../src/core/usecases/controller/GetRecipesUseCase';
import { MockRecipeRepository } from '../../__mocks__/repositories.mock';
import { RecipeFactory } from '../../fixtures/recipe.fixtures';


describe('GetRecipesUseCase', () => {
  let useCase: GetRecipesUseCase;
  let mockRepository: MockRecipeRepository;
  
  beforeEach(() => {
    mockRepository = new MockRecipeRepository();
    useCase = new GetRecipesUseCase(mockRepository);
  });
  
  describe('execute', () => {
    it('deve retornar todas as receitas quando não há filtros', async () => {
      // Arrange
      const recipes = RecipeFactory.createBatch(5);
      recipes.forEach(recipe => mockRepository.addRecipe(recipe));
      
      // Act
      const result = await useCase.execute();
      
      // Assert
      expect(result).toHaveLength(5);
      expect(result).toEqual(expect.arrayContaining(recipes));
    });
    
    it('deve aplicar filtros corretamente', async () => {
      // Arrange
      const recipes = [
        RecipeFactory.createValid({ categoryId: 'cat_1', difficulty: 'easy' }),
        RecipeFactory.createValid({ categoryId: 'cat_2', difficulty: 'medium' }),
        RecipeFactory.createValid({ categoryId: 'cat_1', difficulty: 'hard' })
      ];
      recipes.forEach(recipe => mockRepository.addRecipe(recipe));
      
      const filters: RecipeFilter = {
        categoryIds: ['cat_1']
      };
      
      // Act
      const result = await useCase.execute(filters);
      
      // Assert
      expect(result).toHaveLength(2);
      expect(result.every(r => r.categoryId === 'cat_1')).toBe(true);
    });
    
    it('deve retornar array vazio quando nenhuma receita atende aos filtros', async () => {
      // Arrange
      const recipes = RecipeFactory.createBatch(3);
      recipes.forEach(recipe => mockRepository.addRecipe(recipe));
      
      const filters: RecipeFilter = {
        categoryIds: ['categoria_inexistente']
      };
      
      // Act
      const result = await useCase.execute(filters);
      
      // Assert
      expect(result).toHaveLength(0);
    });
    
    it('deve propagar erro do repositório', async () => {
      // Arrange
      mockRepository.setShouldFail(true);
      
      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow('Erro ao buscar receitas');
    });
  });
  
  describe('executeWithPagination', () => {
    it('deve retornar receitas paginadas corretamente', async () => {
      // Arrange
      const recipes = RecipeFactory.createBatch(10);
      recipes.forEach(recipe => mockRepository.addRecipe(recipe));
      
      // Act
      const result = await useCase.executeWithPagination(undefined, 2, 3);
      
      // Assert
      expect(result.data).toHaveLength(3);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(3);
      expect(result.total).toBe(10);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrevious).toBe(true);
    });
    
    it('deve indicar corretamente quando não há próxima página', async () => {
      // Arrange
      const recipes = RecipeFactory.createBatch(5);
      recipes.forEach(recipe => mockRepository.addRecipe(recipe));
      
      // Act
      const result = await useCase.executeWithPagination(undefined, 2, 3);
      
      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrevious).toBe(true);
    });
    
    it('deve retornar primeira página corretamente', async () => {
      // Arrange
      const recipes = RecipeFactory.createBatch(5);
      recipes.forEach(recipe => mockRepository.addRecipe(recipe));
      
      // Act
      const result = await useCase.executeWithPagination(undefined, 1, 3);
      
      // Assert
      expect(result.data).toHaveLength(3);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrevious).toBe(false);
    });
  });
});