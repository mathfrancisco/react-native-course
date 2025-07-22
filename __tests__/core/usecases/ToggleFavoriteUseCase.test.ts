
import { ToggleFavoriteUseCase } from '../../../src/core/usecases/controller/ToggleFavoriteUseCase';
import { MockFavoriteRepository, MockRecipeRepository } from '../../__mocks__/repositories.mock';
import { RecipeFactory } from '../../fixtures/recipe.fixtures';

describe('ToggleFavoriteUseCase', () => {
  let useCase: ToggleFavoriteUseCase;
  let mockFavoriteRepository: MockFavoriteRepository;
  let mockRecipeRepository: MockRecipeRepository;
  let testRecipe: any;
  const testUserId = 'user_123';
  
  beforeEach(() => {
    mockFavoriteRepository = new MockFavoriteRepository();
    mockRecipeRepository = new MockRecipeRepository();
    useCase = new ToggleFavoriteUseCase(mockFavoriteRepository, mockRecipeRepository);
    
    testRecipe = RecipeFactory.createValid();
    mockRecipeRepository.addRecipe(testRecipe);
  });
  
  describe('toggleFavorite', () => {
    it('deve adicionar receita aos favoritos quando não é favorita', async () => {
      // Arrange
      expect(await mockFavoriteRepository.isFavorite(testRecipe.id, testUserId)).toBe(false);
      
      // Act
      const result = await useCase.toggleFavorite(testRecipe.id, testUserId);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.action).toBe('added');
      expect(result.message).toBe('Receita adicionada aos favoritos');
      expect(result.recipeId).toBe(testRecipe.id);
      expect(await mockFavoriteRepository.isFavorite(testRecipe.id, testUserId)).toBe(true);
    });
    
    it('deve remover receita dos favoritos quando já é favorita', async () => {
      // Arrange
      await mockFavoriteRepository.add(testRecipe.id, testUserId);
      expect(await mockFavoriteRepository.isFavorite(testRecipe.id, testUserId)).toBe(true);
      
      // Act
      const result = await useCase.toggleFavorite(testRecipe.id, testUserId);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.action).toBe('removed');
      expect(result.message).toBe('Receita removida dos favoritos');
      expect(result.recipeId).toBe(testRecipe.id);
      expect(await mockFavoriteRepository.isFavorite(testRecipe.id, testUserId)).toBe(false);
    });
    
    it('deve rejeitar parâmetros inválidos', async () => {
      // Act & Assert
      await expect(useCase.toggleFavorite('', testUserId)).rejects.toThrow('ID da receita e usuário são obrigatórios');
      await expect(useCase.toggleFavorite(testRecipe.id, '')).rejects.toThrow('ID da receita e usuário são obrigatórios');
    });
    
    it('deve rejeitar receita inexistente', async () => {
      // Act & Assert
      await expect(useCase.toggleFavorite('receita_inexistente', testUserId))
        .rejects.toThrow('Receita não encontrada');
    });
    
    it('deve propagar erro do repositório', async () => {
      // Arrange
      mockFavoriteRepository.setShouldFail(true);
      
      // Act & Assert
      await expect(useCase.toggleFavorite(testRecipe.id, testUserId))
        .rejects.toThrow('Erro ao alterar favorito');
    });
  });
  
  describe('getFavorites', () => {
    it('deve retornar receitas favoritas do usuário', async () => {
      // Arrange
      const recipe1 = RecipeFactory.createValid();
      const recipe2 = RecipeFactory.createValid();
      mockRecipeRepository.addRecipe(recipe1);
      mockRecipeRepository.addRecipe(recipe2);
      
      await mockFavoriteRepository.add(recipe1.id, testUserId);
      await mockFavoriteRepository.add(recipe2.id, testUserId);
      
      // Act
      const favorites = await useCase.getFavorites(testUserId);
      
      // Assert
      expect(favorites).toHaveLength(2);
      expect(favorites.map(r => r.id)).toContain(recipe1.id);
      expect(favorites.map(r => r.id)).toContain(recipe2.id);
    });
    
    it('deve retornar array vazio quando usuário não tem favoritos', async () => {
      // Act
      const favorites = await useCase.getFavorites(testUserId);
      
      // Assert
      expect(favorites).toHaveLength(0);
    });
    
    it('deve rejeitar userId inválido', async () => {
      // Act & Assert
      await expect(useCase.getFavorites('')).rejects.toThrow('ID do usuário é obrigatório');
    });
  });
  
  describe('isFavorite', () => {
    it('deve retornar true quando receita é favorita', async () => {
      // Arrange
      await mockFavoriteRepository.add(testRecipe.id, testUserId);
      
      // Act
      const isFavorite = await useCase.isFavorite(testRecipe.id, testUserId);
      
      // Assert
      expect(isFavorite).toBe(true);
    });
    
    it('deve retornar false quando receita não é favorita', async () => {
      // Act
      const isFavorite = await useCase.isFavorite(testRecipe.id, testUserId);
      
      // Assert
      expect(isFavorite).toBe(false);
    });
    
    it('deve retornar false para parâmetros inválidos', async () => {
      // Act & Assert
      expect(await useCase.isFavorite('', testUserId)).toBe(false);
      expect(await useCase.isFavorite(testRecipe.id, '')).toBe(false);
    });
  });
});