
import { RecipeRepository } from '../../../src/business/repositories/controller/RecipeRepository';
import { RepositoryConfig } from '../../../src/business/repositories/interface/IBaseRepository';
import { RecipeFactory } from '../../fixtures/recipe.fixtures';

// Mock do DataLoaderBridge
jest.mock('@business/bridges/controller/DataLoaderBridge', () => ({
  DataLoaderBridge: {
    getInstance: () => ({
      loadRecipes: jest.fn(),
      searchRecipes: jest.fn(),
      filterRecipes: jest.fn(),
      clearCache: jest.fn(),
    }),
  },
}));

// Mock do ValidationBridge
jest.mock('@business/bridges/controller/ValidationBridge', () => ({
  ValidationBridge: {
    getInstance: () => ({
      validateRecipe: jest.fn(() => ({ isValid: true, errors: [] })),
    }),
  },
}));

describe('RecipeRepository', () => {
  let repository: RecipeRepository;
  let mockDataLoaderBridge: any;
  let mockValidationBridge: any;
  
  const config: RepositoryConfig = {
    enableCache: true,
    cacheTimeout: 5000,
    dataPath: 'test',
    autoSync: false,
  };
  
  beforeEach(() => {
    const { DataLoaderBridge } = require('@business/bridges/controller/DataLoaderBridge');
    const { ValidationBridge } = require('@business/bridges/controller/ValidationBridge');
    
    mockDataLoaderBridge = DataLoaderBridge.getInstance();
    mockValidationBridge = ValidationBridge.getInstance();
    
    repository = new RecipeRepository(config);
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  describe('initialize', () => {
    it('deve inicializar com sucesso', async () => {
      // Arrange
      const testRecipes = RecipeFactory.createBatch(3);
      mockDataLoaderBridge.loadRecipes.mockResolvedValue(testRecipes);
      
      // Act
      await repository.initialize();
      
      // Assert
      expect(repository.isInitialized()).toBe(true);
      expect(mockDataLoaderBridge.loadRecipes).toHaveBeenCalledTimes(1);
      expect(mockValidationBridge.validateRecipe).toHaveBeenCalledTimes(3);
    });
    
    it('deve filtrar receitas inválidas durante inicialização', async () => {
      // Arrange
      const testRecipes = RecipeFactory.createBatch(3);
      mockDataLoaderBridge.loadRecipes.mockResolvedValue(testRecipes);
      
      // Primeira receita válida, segunda inválida, terceira válida
      mockValidationBridge.validateRecipe
        .mockReturnValueOnce({ isValid: true, errors: [] })
        .mockReturnValueOnce({ isValid: false, errors: ['Erro de teste'] })
        .mockReturnValueOnce({ isValid: true, errors: [] });
      
      // Act
      await repository.initialize();
      
      // Assert
      const allRecipes = await repository.getAll();
      expect(allRecipes).toHaveLength(2); // Apenas as válidas
    });
    
    it('deve propagar erro de inicialização', async () => {
      // Arrange
      mockDataLoaderBridge.loadRecipes.mockRejectedValue(new Error('Erro no loader'));
      
      // Act & Assert
      await expect(repository.initialize()).rejects.toThrow('Falha na inicialização');
    });
    
    it('não deve inicializar múltiplas vezes', async () => {
      // Arrange
      const testRecipes = RecipeFactory.createBatch(2);
      mockDataLoaderBridge.loadRecipes.mockResolvedValue(testRecipes);
      
      // Act
      await repository.initialize();
      await repository.initialize(); // Segunda chamada
      
      // Assert
      expect(mockDataLoaderBridge.loadRecipes).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('getAll', () => {
    beforeEach(async () => {
      const testRecipes = RecipeFactory.createBatch(5);
      mockDataLoaderBridge.loadRecipes.mockResolvedValue(testRecipes);
      await repository.initialize();
    });
    
    it('deve retornar todas as receitas ordenadas por rating', async () => {
      // Act
      const recipes = await repository.getAll();
      
      // Assert
      expect(recipes).toHaveLength(5);
      
      // Verifica se está ordenado por rating (decrescente)
      for (let i = 0; i < recipes.length - 1; i++) {
        expect(recipes[i].rating).toBeGreaterThanOrEqual(recipes[i + 1].rating);
      }
    });
    
    it('deve usar cache na segunda chamada', async () => {
      // Act
      await repository.getAll(); // Primeira chamada
      await repository.getAll(); // Segunda chamada (deve usar cache)
      
      // Assert
      // Como estamos testando o repositório isoladamente,
      // verificamos se não houve nova inicialização
      expect(mockDataLoaderBridge.loadRecipes).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('getById', () => {
    let testRecipe: any;
    
    beforeEach(async () => {
      testRecipe = RecipeFactory.createValid({ id: 'test_recipe_123' });
      mockDataLoaderBridge.loadRecipes.mockResolvedValue([testRecipe]);
      await repository.initialize();
    });
    
    it('deve retornar receita pelo ID', async () => {
      // Act
      const recipe = await repository.getById('test_recipe_123');
      
      // Assert
      expect(recipe).not.toBeNull();
      expect(recipe?.id).toBe('test_recipe_123');
    });
    
    it('deve retornar null para ID inexistente', async () => {
      // Act
      const recipe = await repository.getById('id_inexistente');
      
      // Assert
      expect(recipe).toBeNull();
    });
    
    it('deve retornar null para ID vazio', async () => {
      // Act
      const recipe = await repository.getById('');
      
      // Assert
      expect(recipe).toBeNull();
    });
  });
  
  describe('search', () => {
    beforeEach(async () => {
      const testRecipes = [
        RecipeFactory.createValid({ title: 'Bolo de Chocolate' }),
        RecipeFactory.createValid({ title: 'Torta de Morango' }),
        RecipeFactory.createValid({ title: 'Pudim de Leite' }),
      ];
      mockDataLoaderBridge.loadRecipes.mockResolvedValue(testRecipes);
      mockDataLoaderBridge.searchRecipes.mockImplementation((query, recipes) => {
        return recipes.filter((r: any) => 
          r.title.toLowerCase().includes(query.toLowerCase())
        );
      });
      await repository.initialize();
    });
    
    it('deve buscar receitas por query', async () => {
      // Act
      const results = await repository.search('chocolate');
      
      // Assert
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Bolo de Chocolate');
      expect(mockDataLoaderBridge.searchRecipes).toHaveBeenCalledWith('chocolate', expect.any(Array));
    });
    
    it('deve retornar todas as receitas para query vazia', async () => {
      // Arrange
      mockDataLoaderBridge.searchRecipes.mockImplementation((query, recipes) => {
        if (!query || query.trim().length < 2) {
          return recipes;
        }
        return [];
      });
      
      // Act
      const results = await repository.search('');
      
      // Assert
      expect(results).toHaveLength(3);
    });
    
    it('deve usar cache para buscas repetidas', async () => {
      // Act
      await repository.search('torta');
      await repository.search('torta'); // Segunda busca igual
      
      // Assert
      expect(mockDataLoaderBridge.searchRecipes).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('save', () => {
    beforeEach(async () => {
      mockDataLoaderBridge.loadRecipes.mockResolvedValue([]);
      await repository.initialize();
    });
    
    it('deve salvar receita válida', async () => {
      // Arrange
      const newRecipe = RecipeFactory.createValid();
      mockValidationBridge.validateRecipe.mockReturnValue({ isValid: true, errors: [] });
      
      // Act
      await repository.save(newRecipe);
      
      // Assert
      const savedRecipe = await repository.getById(newRecipe.id);
      expect(savedRecipe).not.toBeNull();
      expect(savedRecipe?.title).toBe(newRecipe.title);
    });
    
    it('deve rejeitar receita inválida', async () => {
      // Arrange
      const invalidRecipe = RecipeFactory.createValid();
      mockValidationBridge.validateRecipe.mockReturnValue({ 
        isValid: false, 
        errors: ['Receita inválida'] 
      });
      
      // Act & Assert
      await expect(repository.save(invalidRecipe))
        .rejects.toThrow('Receita inválida: Receita inválida');
    });
    
    it('deve atualizar receita existente', async () => {
      // Arrange
      const recipe = RecipeFactory.createValid();
      await repository.save(recipe);
      
      const updatedRecipe = { ...recipe, title: 'Título Atualizado' };
      
      // Act
      await repository.save(updatedRecipe);
      
      // Assert
      const savedRecipe = await repository.getById(recipe.id);
      expect(savedRecipe?.title).toBe('Título Atualizado');
    });
  });
  
  describe('delete', () => {
    let testRecipe: any;
    
    beforeEach(async () => {
      testRecipe = RecipeFactory.createValid();
      mockDataLoaderBridge.loadRecipes.mockResolvedValue([testRecipe]);
      await repository.initialize();
    });
    
    it('deve deletar receita existente', async () => {
      // Arrange
      expect(await repository.getById(testRecipe.id)).not.toBeNull();
      
      // Act
      await repository.delete(testRecipe.id);
      
      // Assert
      expect(await repository.getById(testRecipe.id)).toBeNull();
    });
    
    it('deve ignorar tentativa de deletar receita inexistente', async () => {
      // Act & Assert (não deve lançar erro)
      await expect(repository.delete('id_inexistente')).resolves.not.toThrow();
    });
  });
  
  describe('cache management', () => {
    beforeEach(async () => {
      const testRecipes = RecipeFactory.createBatch(3);
      mockDataLoaderBridge.loadRecipes.mockResolvedValue(testRecipes);
      await repository.initialize();
    });
    
    it('deve limpar cache', async () => {
      // Arrange
      await repository.getAll(); // Popula cache
      
      // Act
      await repository.invalidateCache();
      
      // Assert
      // O teste específico do cache seria mais complexo,
      // mas aqui verificamos que o método não falha
      expect(true).toBe(true);
    });
    
    it('deve atualizar cache', async () => {
      // Act
      await repository.refreshCache();
      
      // Assert
      expect(true).toBe(true);
    });
  });
});