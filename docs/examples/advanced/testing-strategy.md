# 🧪 Estratégia de Testes na Arquitetura Clean

## 🎯 Filosofia de Testes

Nossa arquitetura permite uma **estratégia de testes em camadas**, onde cada nível tem características e objetivos específicos. É como testar um **edifício** - testamos as fundações, a estrutura, os acabamentos e a experiência final.

## 🏗️ Pirâmide de Testes por Camadas

```
         📱 E2E Tests (Poucos, Caros)
        /                              \
      📱 Integration Tests (Alguns, Médios)
     /                                      \
   ⚡ Business Logic Tests (Muitos, Rápidos)
  /                                            \
🎯 Unit Tests Core (Muitos, Instantâneos)
────────────────────────────────────────────────
🔗 Shared Utils Tests (Muitos, Simples)
```

## 🎯 Testes da Camada CORE

### 🧪 **Características**
- **Mais rápidos** (sem dependências externas)
- **Mais simples** (lógica pura)
- **Mais numerosos** (cobertura alta)
- **Mais estáveis** (mudam raramente)

### 📦 **Testando Entities**

**Exemplo: Recipe Entity**

```typescript
// __tests__/core/entities/Recipe.test.ts

describe('Recipe Entity', () => {
  describe('Validation Rules', () => {
    
    it('should validate complete recipe', () => {
      // 🎯 Arrange: Preparar dados
      const validRecipe: Recipe = {
        id: 'recipe_123',
        title: 'Brownie de Chocolate',
        ingredients: [{ name: 'chocolate', amount: 200, unit: 'g' }],
        instructions: [{ stepNumber: 1, description: 'Derreta o chocolate' }],
        prepTime: 30,
        cookTime: 45,
        servings: 8,
        difficulty: DifficultyLevel.MEDIUM,
        category: 'desserts',
        tags: ['chocolate'],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // 🎬 Act: Executar ação
      const result = RecipeController.validateRecipe(validRecipe);
      
      // ✅ Assert: Verificar resultado
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should reject recipe without title', () => {
      const invalidRecipe = { ...validRecipe, title: '' };
      
      const result = RecipeController.validateRecipe(invalidRecipe);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Título é obrigatório');
    });
    
    it('should calculate total time correctly', () => {
      const recipe = { ...validRecipe, prepTime: 30, cookTime: 45 };
      
      const totalTime = RecipeController.calculateTotalTime(recipe);
      
      expect(totalTime).toBe(75); // 30 + 45
    });
  });
  
  describe('Formatting', () => {
    
    it('should format time correctly', () => {
      expect(RecipeFormatter.formatTime(45)).toBe('45min');
      expect(RecipeFormatter.formatTime(90)).toBe('1h 30min');
      expect(RecipeFormatter.formatTime(120)).toBe('2h');
    });
    
    it('should format difficulty levels', () => {
      expect(RecipeFormatter.formatDifficulty(DifficultyLevel.EASY)).toBe('Fácil');
      expect(RecipeFormatter.formatDifficulty(DifficultyLevel.MEDIUM)).toBe('Médio');
      expect(RecipeFormatter.formatDifficulty(DifficultyLevel.HARD)).toBe('Difícil');
    });
  });
});
```

### 🎬 **Testando Use Cases**

```typescript
// __tests__/core/usecases/GetRecipesUseCase.test.ts

describe('GetRecipesUseCase', () => {
  let useCase: GetRecipesUseCase;
  let mockRepository: jest.Mocked<IRecipeRepository>;
  
  beforeEach(() => {
    // 🎭 Criar mocks simples
    mockRepository = {
      getRecipes: jest.fn(),
      saveRecipe: jest.fn(),
      deleteRecipe: jest.fn()
    };
    
    useCase = new GetRecipesUseCase(mockRepository);
  });
  
  it('should return valid recipes only', async () => {
    // 🎯 Arrange
    const mockRecipes = [
      { ...validRecipe, id: 'valid_1' },
      { ...invalidRecipe, id: 'invalid_1' }, // receita inválida
      { ...validRecipe, id: 'valid_2' }
    ];
    mockRepository.getRecipes.mockResolvedValue(mockRecipes);
    
    // 🎬 Act
    const result = await useCase.execute();
    
    // ✅ Assert
    expect(result).toHaveLength(2); // apenas as válidas
    expect(result.every(recipe => RecipeController.validateRecipe(recipe).isValid)).toBe(true);
  });
  
  it('should handle repository errors gracefully', async () => {
    // 🎯 Arrange
    mockRepository.getRecipes.mockRejectedValue(new Error('Database error'));
    
    // 🎬 Act & Assert
    await expect(useCase.execute()).rejects.toThrow('Failed to get recipes');
  });
});
```

## ⚡ Testes da Camada BUSINESS

### 🧪 **Características**
- **Lógica complexa** (orquestração)
- **Múltiplas dependências** (mocks necessários)
- **Regras específicas** (validações complexas)
- **Integração** entre componentes

### 🔧 **Testando Services**

```typescript
// __tests__/business/services/SearchService.test.ts

describe('SearchService', () => {
  let searchService: SearchService;
  let mockRecipeService: jest.Mocked<IRecipeService>;
  let mockValidator: jest.Mocked<SearchValidator>;
  let mockProcessor: jest.Mocked<SearchProcessor>;
  
  beforeEach(() => {
    // 🎭 Setup completo de mocks
    mockRecipeService = createMockRecipeService();
    mockValidator = createMockValidator();
    mockProcessor = createMockProcessor();
    
    searchService = new SearchService(
      mockRecipeService,
      mockValidator,
      mockProcessor
    );
  });
  
  describe('Complex Search Flow', () => {
    
    it('should execute complete search workflow', async () => {
      // 🎯 Arrange: Cenário complexo
      const searchQuery = 'sobremesa chocolate';
      const searchParams = {
        query: searchQuery,
        filters: { category: 'desserts' },
        pagination: { page: 1, limit: 10 }
      };
      
      mockValidator.validateSearch.mockReturnValue({ isValid: true, errors: [] });
      mockProcessor.processQuery.mockReturnValue({
        expandedTerms: ['sobremesa', 'chocolate', 'doce'],
        smartFilters: { category: 'desserts' }
      });
      mockRecipeService.searchRecipes.mockResolvedValue(mockSearchResults);
      
      // 🎬 Act
      const result = await searchService.search(searchParams);
      
      // ✅ Assert: Verificar todo o fluxo
      expect(mockValidator.validateSearch).toHaveBeenCalledWith(searchParams);
      expect(mockProcessor.processQuery).toHaveBeenCalledWith(searchQuery);
      expect(mockRecipeService.searchRecipes).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.arrayContaining(['sobremesa', 'chocolate'])
        })
      );
      expect(result.results).toBeDefined();
      expect(result.metadata.searchTime).toBeLessThan(1000);
    });
    
    it('should handle validation errors', async () => {
      // 🎯 Arrange
      mockValidator.validateSearch.mockReturnValue({
        isValid: false,
        errors: ['Query muito curta']
      });
      
      // 🎬 Act & Assert
      await expect(searchService.search({ query: 'a' }))
        .rejects.toThrow('Query muito curta');
    });
    
    it('should apply smart filters automatically', async () => {
      // 🎯 Arrange
      const searchQuery = 'receita vegana';
      mockProcessor.processQuery.mockReturnValue({
        expandedTerms: ['receita', 'vegana'],
        smartFilters: { 
          dietary: ['vegan'],
          excludeIngredients: ['leite', 'ovos', 'manteiga']
        }
      });
      
      // 🎬 Act
      await searchService.search({ query: searchQuery });
      
      // ✅ Assert
      expect(mockRecipeService.searchRecipes).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            dietary: ['vegan'],
            excludeIngredients: ['leite', 'ovos', 'manteiga']
          })
        })
      );
    });
  });
});
```

### 🔍 **Testando Validators**

```typescript
// __tests__/business/validators/RecipeValidator.test.ts

describe('RecipeValidator', () => {
  
  describe('Business Rules Validation', () => {
    
    it('should validate recipe uniqueness', async () => {
      // 🎯 Arrange
      const existingRecipe = { title: 'Brownie Especial' };
      const newRecipe = { title: 'Brownie Especial' }; // mesmo título
      
      // Mock repository
      const mockRepo = {
        findByTitle: jest.fn().mockResolvedValue(existingRecipe)
      };
      
      const validator = new RecipeValidator(mockRepo);
      
      // 🎬 Act
      const result = await validator.validateUniqueness(newRecipe);
      
      // ✅ Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Receita com este título já existe');
    });
    
    it('should validate ingredient availability', async () => {
      // 🎯 Arrange
      const recipe = {
        ingredients: [
          { name: 'chocolate', amount: 200, unit: 'g' },
          { name: 'ingredient_inexistente', amount: 100, unit: 'g' }
        ]
      };
      
      const validator = new RecipeValidator();
      
      // 🎬 Act
      const result = await validator.validateIngredients(recipe);
      
      // ✅ Assert
      expect(result.warnings).toContain('Ingrediente não encontrado: ingredient_inexistente');
    });
  });
});
```

## 📱 Testes da Camada IMPL

### 🧪 **Características**
- **Testes de componente** (React Testing Library)
- **Interação do usuário** (eventos, navegação)
- **Integração com hooks** (estado, contexto)
- **Renderização condicional** (loading, error states)

### 🎨 **Testando Components**

```typescript
// __tests__/impl/components/RecipeCard.test.tsx

import { render, fireEvent, screen } from '@testing-library/react-native';
import { RecipeCard } from '@/impl/components';

describe('RecipeCard Component', () => {
  const mockRecipe: Recipe = {
    id: 'recipe_123',
    title: 'Brownie de Chocolate',
    imageUrl: 'brownie.jpg',
    prepTime: 30,
    cookTime: 45,
    difficulty: DifficultyLevel.MEDIUM,
    rating: 4.5
  };
  
  it('should render recipe information correctly', () => {
    // 🎬 Act
    render(<RecipeCard recipe={mockRecipe} />);
    
    // ✅ Assert
    expect(screen.getByText('Brownie de Chocolate')).toBeOnTheScreen();
    expect(screen.getByText('1h 15min')).toBeOnTheScreen(); // tempo formatado
    expect(screen.getByText('Médio')).toBeOnTheScreen();
    expect(screen.getByTestId('recipe-image')).toHaveProp('source', { uri: 'brownie.jpg' });
  });
  
  it('should handle favorite button press', () => {
    // 🎯 Arrange
    const mockOnFavorite = jest.fn();
    
    render(
      <RecipeCard 
        recipe={mockRecipe} 
        onFavorite={mockOnFavorite}
      />
    );
    
    // 🎬 Act
    fireEvent.press(screen.getByTestId('favorite-button'));
    
    // ✅ Assert
    expect(mockOnFavorite).toHaveBeenCalledWith('recipe_123');
  });
  
  it('should show loading state', () => {
    render(<RecipeCard recipe={mockRecipe} isLoading={true} />);
    
    expect(screen.getByTestId('loading-skeleton')).toBeOnTheScreen();
    expect(screen.queryByText('Brownie de Chocolate')).not.toBeOnTheScreen();
  });
});
```

### 🖥️ **Testando Screens**

```typescript
// __tests__/impl/screens/HomeScreen.test.tsx

describe('HomeScreen', () => {
  
  it('should load and display recipes on mount', async () => {
    // 🎯 Arrange
    const mockRecipes = [mockRecipe1, mockRecipe2];
    const mockUseRecipes = {
      recipes: mockRecipes,
      loading: false,
      error: null,
      refreshRecipes: jest.fn()
    };
    
    // Mock do hook
    jest.spyOn(require('@/impl/hooks'), 'useRecipes')
      .mockReturnValue(mockUseRecipes);
    
    // 🎬 Act
    render(<HomeScreen />);
    
    // ✅ Assert
    await waitFor(() => {
      expect(screen.getByText('Receitas em Destaque')).toBeOnTheScreen();
      expect(screen.getByText(mockRecipe1.title)).toBeOnTheScreen();
      expect(screen.getByText(mockRecipe2.title)).toBeOnTheScreen();
    });
  });
  
  it('should handle search interaction', async () => {
    // 🎯 Arrange
    const mockNavigation = { navigate: jest.fn() };
    render(<HomeScreen navigation={mockNavigation} />);
    
    // 🎬 Act
    const searchBar = screen.getByTestId('search-input');
    fireEvent.changeText(searchBar, 'chocolate');
    fireEvent(searchBar, 'submitEditing');
    
    // ✅ Assert
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Search', {
      initialQuery: 'chocolate'
    });
  });
});
```

### 🪝 **Testando Hooks**

```typescript
// __tests__/impl/hooks/useRecipes.test.ts

import { renderHook, act } from '@testing-library/react-hooks';
import { useRecipes } from '@/impl/hooks';

describe('useRecipes Hook', () => {
  
  it('should load recipes on mount', async () => {
    // 🎯 Arrange
    const mockRecipes = [mockRecipe1, mockRecipe2];
    jest.spyOn(RecipeService, 'getRecipes')
      .mockResolvedValue(mockRecipes);
    
    // 🎬 Act
    const { result, waitForNextUpdate } = renderHook(() => useRecipes());
    
    // ✅ Assert inicial
    expect(result.current.loading).toBe(true);
    expect(result.current.recipes).toEqual([]);
    
    // ✅ Assert após carregamento
    await waitForNextUpdate();
    expect(result.current.loading).toBe(false);
    expect(result.current.recipes).toEqual(mockRecipes);
  });
  
  it('should handle refresh', async () => {
    // 🎯 Arrange
    const { result } = renderHook(() => useRecipes());
    
    // 🎬 Act
    act(() => {
      result.current.refreshRecipes();
    });
    
    // ✅ Assert
    expect(result.current.loading).toBe(true);
  });
});
```

## 🔗 Testes da Camada SHARED

### 🧪 **Características**
- **Funções puras** (entrada → saída)
- **Testes rápidos** (sem side effects)
- **Alta cobertura** (muitos casos edge)
- **Testes parametrizados** (múltiplos cenários)

```typescript
// __tests__/shared/utils/dateUtils.test.ts

describe('dateUtils', () => {
  
  describe('formatRelativeTime', () => {
    it.each([
      [new Date(Date.now() - 1000 * 30), 'há 30 segundos'],
      [new Date(Date.now() - 1000 * 60 * 5), 'há 5 minutos'],
      [new Date(Date.now() - 1000 * 60 * 60), 'há 1 hora'],
      [new Date(Date.now() - 1000 * 60 * 60 * 24), 'há 1 dia'],
      [new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), 'há 1 semana'],
    ])('should format %s as %s', (date, expected) => {
      expect(formatRelativeTime(date)).toBe(expected);
    });
  });
  
  describe('isToday', () => {
    it('should return true for today', () => {
      expect(isToday(new Date())).toBe(true);
    });
    
    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });
  });
});
```

## 🎯 Estratégias por Tipo de Teste

### ⚡ **Testes Unitários (80%)**
- **Foco:** Lógica isolada
- **Velocidade:** Instantâneos  
- **Mocks:** Mínimos e simples
- **Cobertura:** Alta (>90%)

### 🔗 **Testes de Integração (15%)**
- **Foco:** Comunicação entre camadas
- **Velocidade:** Rápidos
- **Mocks:** Apenas externos (APIs, storage)
- **Cobertura:** Fluxos principais

### 🎭 **Testes E2E (5%)**
- **Foco:** Experiência do usuário
- **Velocidade:** Lentos
- **Mocks:** Mínimos
- **Cobertura:** Jornadas críticas

## 💡 Boas Práticas de Teste

### ✅ **Estrutura AAA**
```typescript
it('should do something', () => {
  // 🎯 Arrange: Preparar cenário
  const input = 'test input';
  const expected = 'expected output';
  
  // 🎬 Act: Executar ação
  const result = functionToTest(input);
  
  // ✅ Assert: Verificar resultado
  expect(result).toBe(expected);
});
```

### 🎭 **Mocks Inteligentes**
```typescript
// ✅ Mock específico por teste
const mockRepository = {
  getRecipes: jest.fn().mockResolvedValue(testRecipes),
  saveRecipe: jest.fn().mockResolvedValue(undefined)
};

// ❌ Mock genérico demais
const mockRepository = jest.fn();
```

### 📊 **Testes Parametrizados**
```typescript
describe.each([
  ['easy', DifficultyLevel.EASY, 'Fácil'],
  ['medium', DifficultyLevel.MEDIUM, 'Médio'],
  ['hard', DifficultyLevel.HARD, 'Difícil']
])('formatDifficulty(%s)', (name, input, expected) => {
  it(`should format ${name} difficulty`, () => {
    expect(formatDifficulty(input)).toBe(expected);
  });
});
```

## 🚀 Automação e CI/CD

### 📋 **Pipeline de Testes**
```yaml
# .github/workflows/tests.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      
      # Testes por camada
      - name: Test Core Layer
        run: npm test -- __tests__/core
        
      - name: Test Business Layer  
        run: npm test -- __tests__/business
        
      - name: Test Implementation Layer
        run: npm test -- __tests__/impl
        
      - name: Test Shared Layer
        run: npm test -- __tests__/shared
        
      # Cobertura geral
      - name: Coverage Report
        run: npm run test:coverage
```

A estratégia de testes em camadas garante qualidade em todos os níveis, desde as regras fundamentais até a experiência do usuário final! 🎯