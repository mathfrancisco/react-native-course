import { RecipeController } from '../../../src/core/entities/controller/RecipeController';
import { Recipe } from '../../../src/core/entities/interface/Recipe';
import { RecipeFactory, validRecipe, invalidRecipe } from '../../fixtures/recipe.fixtures';

describe('RecipeController', () => {
  describe('validateRecipe', () => {
    it('deve validar receita válida com sucesso', () => {
      // Arrange
      const recipe = validRecipe;
      
      // Act
      const result = RecipeController.validateRecipe(recipe);
      
      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('deve detectar receita inválida', () => {
      // Arrange
      const recipe = invalidRecipe as Recipe;
      
      // Act
      const result = RecipeController.validateRecipe(recipe);
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Título da receita é obrigatório');
      expect(result.errors).toContain('Receita deve ter pelo menos um ingrediente');
      expect(result.errors).toContain('Receita deve ter pelo menos uma instrução');
    });
    
    it('deve validar título vazio', () => {
      // Arrange
      const recipe = RecipeFactory.createValid({ title: '' });
      
      // Act
      const result = RecipeController.validateRecipe(recipe);
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Título da receita é obrigatório');
    });
    
    it('deve validar tempos negativos', () => {
      // Arrange
      const recipe = RecipeFactory.createValid({ 
        prepTime: -10, 
        cookTime: -5 
      });
      
      // Act
      const result = RecipeController.validateRecipe(recipe);
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Tempo de preparo não pode ser negativo');
      expect(result.errors).toContain('Tempo de cozimento não pode ser negativo');
    });
    
    it('deve validar porções inválidas', () => {
      // Arrange
      const recipe = RecipeFactory.createValid({ servings: 0 });
      
      // Act
      const result = RecipeController.validateRecipe(recipe);
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Número de porções deve ser positivo');
    });
    
    it('deve validar ingredientes vazios', () => {
      // Arrange
      const recipe = RecipeFactory.createValid({ ingredients: [] });
      
      // Act
      const result = RecipeController.validateRecipe(recipe);
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Receita deve ter pelo menos um ingrediente');
    });
    
    it('deve validar instruções vazias', () => {
      // Arrange
      const recipe = RecipeFactory.createValid({ instructions: [] });
      
      // Act
      const result = RecipeController.validateRecipe(recipe);
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Receita deve ter pelo menos uma instrução');
    });
  });
  
  describe('calculateTotalTime', () => {
    it('deve calcular tempo total corretamente', () => {
      // Arrange
      const recipe = RecipeFactory.createValid({ 
        prepTime: 15, 
        cookTime: 30 
      });
      
      // Act
      const totalTime = RecipeController.calculateTotalTime(recipe);
      
      // Assert
      expect(totalTime).toBe(45);
    });
    
    it('deve calcular tempo total com zero', () => {
      // Arrange
      const recipe = RecipeFactory.createValid({ 
        prepTime: 0, 
        cookTime: 20 
      });
      
      // Act
      const totalTime = RecipeController.calculateTotalTime(recipe);
      
      // Assert
      expect(totalTime).toBe(20);
    });
  });
  
  describe('isComplete', () => {
    it('deve retornar true para receita completa', () => {
      // Arrange
      const recipe = validRecipe;
      
      // Act
      const isComplete = RecipeController.isComplete(recipe);
      
      // Assert
      expect(isComplete).toBe(true);
    });
    
    it('deve retornar false para receita incompleta', () => {
      // Arrange
      const recipe = invalidRecipe as Recipe;
      
      // Act
      const isComplete = RecipeController.isComplete(recipe);
      
      // Assert
      expect(isComplete).toBe(false);
    });
  });
  
  describe('calculateDifficulty', () => {
    it('deve calcular dificuldade fácil', () => {
      // Arrange
      const recipe = RecipeFactory.createValid({
        ingredients: [
          { id: '1', name: 'Ingrediente 1', amount: 1, unit: 'un' },
          { id: '2', name: 'Ingrediente 2', amount: 1, unit: 'un' }
        ],
        instructions: [
          { step: 1, description: 'Passo 1' },
          { step: 2, description: 'Passo 2' }
        ],
        prepTime: 10,
        cookTime: 15
      });
      
      // Act
      const difficulty = RecipeController.calculateDifficulty(recipe);
      
      // Assert
      expect(difficulty).toBe('easy');
    });
    
    it('deve calcular dificuldade média', () => {
      // Arrange
      const recipe = RecipeFactory.createValid({
        ingredients: Array.from({ length: 8 }, (_, i) => ({
          id: `ing_${i}`,
          name: `Ingrediente ${i}`,
          amount: 1,
          unit: 'un'
        })),
        instructions: Array.from({ length: 6 }, (_, i) => ({
          step: i + 1,
          description: `Passo ${i + 1}`
        })),
        prepTime: 30,
        cookTime: 45
      });
      
      // Act
      const difficulty = RecipeController.calculateDifficulty(recipe);
      
      // Assert
      expect(difficulty).toBe('medium');
    });
    
    it('deve calcular dificuldade difícil', () => {
      // Arrange
      const recipe = RecipeFactory.createValid({
        ingredients: Array.from({ length: 15 }, (_, i) => ({
          id: `ing_${i}`,
          name: `Ingrediente ${i}`,
          amount: 1,
          unit: 'un'
        })),
        instructions: Array.from({ length: 12 }, (_, i) => ({
          step: i + 1,
          description: `Passo ${i + 1}`
        })),
        prepTime: 60,
        cookTime: 90
      });
      
      // Act
      const difficulty = RecipeController.calculateDifficulty(recipe);
      
      // Assert
      expect(difficulty).toBe('hard');
    });
  });
  
  describe('getNutritionPerServing', () => {
    it('deve calcular nutrição por porção', () => {
      // Arrange
      const recipe = RecipeFactory.createValid({
        servings: 4,
        nutritional: {
          calories: 800,
          protein: 20,
          carbs: 100,
          fat: 16
        }
      });
      
      // Act
      const nutritionPerServing = RecipeController.getNutritionPerServing(recipe);
      
      // Assert
      expect(nutritionPerServing).toEqual({
        calories: 200,
        protein: 5,
        carbs: 25,
        fat: 4
      });
    });
    
    it('deve retornar null se não houver informação nutricional', () => {
      // Arrange
      const recipe = RecipeFactory.createValid({ nutritional: undefined });
      
      // Act
      const nutritionPerServing = RecipeController.getNutritionPerServing(recipe);
      
      // Assert
      expect(nutritionPerServing).toBeNull();
    });
  });
});