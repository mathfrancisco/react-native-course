import { CoreRecipeValidator } from '../../../src/core/validators/controller/CoreRecipeValidator';
import { RecipeFactory, validRecipe, invalidRecipe, recipeWithWarnings } from '../../fixtures/recipe.fixtures';

describe('CoreRecipeValidator', () => {
  let validator: CoreRecipeValidator;
  
  beforeEach(() => {
    validator = new CoreRecipeValidator();
  });
  
  describe('validate', () => {
    it('deve validar receita válida com sucesso', async () => {
      // Act
      const result = await validator.validate(validRecipe);
      
      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.score).toBeGreaterThan(80);
    });
    
    it('deve detectar múltiplos erros em receita inválida', async () => {
      // Arrange
      const recipe = invalidRecipe as any;
      
      // Act
      const result = await validator.validate(recipe);
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      
      const errorMessages = result.errors.map(e => e.message);
      expect(errorMessages).toContain('Título da receita é obrigatório');
      expect(errorMessages).toContain('Receita deve ter pelo menos um ingrediente');
      expect(errorMessages).toContain('Receita deve ter pelo menos uma instrução');
    });
    
    it('deve gerar warnings para receita com problemas menores', async () => {
      // Act
      const result = await validator.validate(recipeWithWarnings);
      
      // Assert
      expect(result.isValid).toBe(true); // Warnings não invalidam
      expect(result.warnings.length).toBeGreaterThan(0);
      
      const warningMessages = result.warnings.map(w => w.message);
      expect(warningMessages).toContainEqual(expect.stringContaining('tempo total muito longo'));
    });
    
    it('deve gerar info para melhorias opcionais', async () => {
      // Arrange
      const recipe = RecipeFactory.createValid({
        description: 'Desc curta', // Muito curta para info
        nutritional: undefined // Falta nutricional para info
      });
      
      // Act
      const result = await validator.validate(recipe);
      
      // Assert
      expect(result.isValid).toBe(true);
      expect(result.info.length).toBeGreaterThan(0);
      
      const infoMessages = result.info.map(i => i.message);
      expect(infoMessages).toContainEqual(expect.stringContaining('informações nutricionais'));
    });
  });
  
  describe('validateSync', () => {
    it('deve validar sincronamente', () => {
      // Act
      const result = validator.validateSync(validRecipe);
      
      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('deve ser mais rápido que validação async', async () => {
      // Arrange
      const startSync = performance.now();
      validator.validateSync(validRecipe);
      const endSync = performance.now();
      
      const startAsync = performance.now();
      await validator.validate(validRecipe);
      const endAsync = performance.now();
      
      // Assert
      const syncTime = endSync - startSync;
      const asyncTime = endAsync - startAsync;
      expect(syncTime).toBeLessThan(asyncTime);
    });
  });
  
  describe('validateField', () => {
    it('deve validar título válido', () => {
      // Act
      const result = validator.validateField('title', 'Bolo Delicioso');
      
      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('deve rejeitar título vazio', () => {
      // Act
      const result = validator.validateField('title', '');
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toBe('Título é obrigatório');
      expect(result.errors[0].suggestion).toBe('Digite um título atrativo para sua receita');
    });
    
    it('deve rejeitar título muito curto', () => {
      // Act
      const result = validator.validateField('title', 'ab');
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toBe('Título muito curto');
    });
    
    it('deve rejeitar título muito longo', () => {
      // Act
      const longTitle = 'a'.repeat(150);
      const result = validator.validateField('title', longTitle);
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toBe('Título muito longo');
    });
    
    it('deve validar ingredientes válidos', () => {
      // Arrange
      const ingredients = [
        { id: '1', name: 'Farinha', amount: 2, unit: 'xícaras' },
        { id: '2', name: 'Ovos', amount: 3, unit: 'unidades' }
      ];
      
      // Act
      const result = validator.validateField('ingredients', ingredients);
      
      // Assert
      expect(result.isValid).toBe(true);
    });
    
    it('deve rejeitar lista de ingredientes vazia', () => {
      // Act
      const result = validator.validateField('ingredients', []);
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toBe('Pelo menos um ingrediente é obrigatório');
    });
    
    it('deve validar instruções válidas', () => {
      // Arrange
      const instructions = [
        { step: 1, description: 'Misture os ingredientes secos' },
        { step: 2, description: 'Adicione os líquidos gradualmente' }
      ];
      
      // Act
      const result = validator.validateField('instructions', instructions);
      
      // Assert
      expect(result.isValid).toBe(true);
    });
    
    it('deve rejeitar tempo negativo', () => {
      // Act
      const result = validator.validateField('prepTime', -10);
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toBe('Tempo não pode ser negativo');
    });
    
    it('deve gerar warning para tempo zero', () => {
      // Act
      const result = validator.validateField('cookTime', 0);
      
      // Assert
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('zero');
    });
    
    it('deve validar porções válidas', () => {
      // Act
      const result = validator.validateField('servings', 4);
      
      // Assert
      expect(result.isValid).toBe(true);
    });
    
    it('deve rejeitar porções inválidas', () => {
      // Act
      const result = validator.validateField('servings', 0);
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toBe('Número de porções deve ser positivo');
    });
  });
  
  describe('addRule e removeRule', () => {
    it('deve adicionar regra customizada', () => {
      // Arrange
      const customRule = {
        name: 'custom_test_rule',
        message: 'Regra de teste customizada',
        severity: 'warning' as const,
        validate: (recipe: any) => recipe.title !== 'Título Proibido'
      };
      
      validator.addRule(customRule);
      
      const recipe = RecipeFactory.createValid({ title: 'Título Proibido' });
      
      // Act
      const result = validator.validateSync(recipe);
      
      // Assert
      expect(result.warnings.some(w => w.message === 'Regra de teste customizada')).toBe(true);
    });
    
    it('deve remover regra existente', () => {
      // Arrange
      validator.removeRule('title_required');
      
      const recipeWithoutTitle = RecipeFactory.createValid({ title: '' });
      
      // Act
      const result = validator.validateSync(recipeWithoutTitle);
      
      // Assert
      // Como removemos a regra de título obrigatório, não deve ter esse erro
      expect(result.errors.some(e => e.message === 'Título da receita é obrigatório')).toBe(false);
    });
  });
  
  describe('strict mode', () => {
    it('deve aplicar modo estrito', () => {
      // Arrange
      validator.setStrictMode(true);
      
      // Receita com pequenos problemas que podem ser mais rigorosos no modo estrito
      const recipe = RecipeFactory.createValid({
        description: 'Desc muito curta'
      });
      
      // Act
      const result = validator.validateSync(recipe);
      
      // Assert
      // Em modo estrito, pode gerar mais warnings ou transformar alguns info em warnings
      expect(result).toBeDefined();
    });
  });
  
  describe('qualityScore calculation', () => {
    it('deve calcular score alto para receita completa', async () => {
      // Arrange
      const completeRecipe = RecipeFactory.createValid({
        description: 'Uma descrição bem detalhada e atrativa da receita que vai fazer toda diferença',
        nutritional: { calories: 300, protein: 10, carbs: 40, fat: 12 },
        imageUrl: 'https://example.com/image.jpg',
        tags: ['fácil', 'rápido', 'delicioso'],
        ingredients: Array.from({ length: 6 }, (_, i) => ({
          id: `ing_${i}`,
          name: `Ingrediente ${i}`,
          amount: 1,
          unit: 'unidade'
        })),
        instructions: Array.from({ length: 5 }, (_, i) => ({
          step: i + 1,
          description: `Passo ${i + 1} com descrição detalhada`
        }))
      });
      
      // Act
      const result = await validator.validate(completeRecipe);
      
      // Assert
      expect(result.score).toBeGreaterThan(90);
    });
    
    it('deve calcular score baixo para receita incompleta', async () => {
      // Arrange
      const incompleteRecipe = RecipeFactory.createValid({
        description: '', // Sem descrição
        nutritional: undefined, // Sem informação nutricional
        imageUrl: undefined, // Sem imagem
        tags: [], // Sem tags
        ingredients: [{ id: '1', name: 'Único ingrediente', amount: 1, unit: 'unidade' }],
        instructions: [{ step: 1, description: 'Único passo' }]
      });
      
      // Act
      const result = await validator.validate(incompleteRecipe);
      
      // Assert
      expect(result.score).toBeLessThan(70);
    });
  });
});