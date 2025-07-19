# 📋 Documentação da API - RecipeApp

## 🎯 Visão Geral

A API do RecipeApp segue os princípios da **Clean Architecture**, organizando-se em camadas bem definidas com responsabilidades específicas.

## 📚 Estrutura da Documentação

### 🎯 [Core API](core/)
**"As regras fundamentais"**
- Entities (Recipe, Category, Ingredient)
- Use Cases (GetRecipes, SearchRecipes, ToggleFavorite)
- Repository Interfaces (IRecipeRepository, ICategoryRepository)

### ⚡ [Business API](business/)
**"A implementação das regras"**
- Services (RecipeService, SearchService, FavoriteService)
- Validators (RecipeValidator, SearchValidator)
- Processors (DataProcessor, ImageProcessor)

### 📱 [Implementation API](impl/)
**"A interface com o usuário"**
- Screens (HomeScreen, RecipeDetailScreen, SearchScreen)
- Components (RecipeCard, SearchBar, FilterModal)
- Hooks (useRecipes, useSearch, useFavorites)

### 🔗 [Shared API](shared/)
**"Recursos compartilhados"**
- Utils (dateUtils, stringUtils, validationUtils)
- Types (recipe.types, navigation.types, common.types)
- Constants (appConstants, storageKeys)

## 🔄 Fluxo de Comunicação entre APIs

```
📱 IMPL API
   ↓ chama
⚡ BUSINESS API
   ↓ usa
🎯 CORE API
   ↓ utiliza
🔗 SHARED API
```

## 📖 Convenções de Documentação

### 📁 **Estrutura Padrão de Cada API**
```
📄 index.md          → Visão geral da camada
📄 interfaces.md     → Contratos e tipos
📄 controllers.md    → Lógica de controle
📄 views.md         → Apresentação/formatação
📄 examples.md      → Exemplos práticos
📄 best-practices.md → Boas práticas específicas
```

### 🏷️ **Padrão de Nomenclatura**
- **Interfaces:** começam com `I` (ex: `IRecipeRepository`)
- **Types:** terminam com `.types` (ex: `recipe.types.ts`)
- **Controllers:** terminam com `Controller` (ex: `RecipeController`)
- **Views:** terminam com `View` ou são componentes React (ex: `RecipeFormatter`, `RecipeCard.tsx`)

### 📝 **Formato de Documentação**
Cada método/função documentado inclui:
- **Propósito:** O que faz
- **Parâmetros:** O que recebe
- **Retorno:** O que retorna
- **Exemplo:** Como usar
- **Notas:** Considerações especiais

## 🎯 Filosofia da API

### 🧩 **Separação de Responsabilidades**
Cada camada tem uma responsabilidade específica e não conhece detalhes das outras:

- **CORE:** Define regras que nunca mudam
- **BUSINESS:** Implementa como executar essas regras  
- **IMPL:** Apresenta para o usuário
- **SHARED:** Oferece suporte comum

### 🔒 **Encapsulamento**
As camadas internas não conhecem as externas:
- Core não sabe sobre React Native
- Business não sabe sobre componentes específicos
- Shared serve todas as camadas igualmente

### 🎭 **Interface-First**
Primeiro definimos contratos (interfaces), depois implementamos:
- Facilita testes com mocks
- Permite múltiplas implementações
- Garante consistência

## 🚀 Começando

1. **Para entender conceitos:** Comece com [Core API](core/)
2. **Para implementar features:** Veja [Business API](business/)  
3. **Para criar interfaces:** Explore [Implementation API](impl/)
4. **Para utilitários:** Consulte [Shared API](shared/)

## 💡 Dicas de Uso

### ✅ **Boas Práticas**
- Sempre use interfaces ao invés de implementações concretas
- Respeite a direção das dependências
- Mantenha cada camada focada em sua responsabilidade
- Use tipos TypeScript para garantir contratos

### ❌ **Evite**
- Importar camadas superiores nas inferiores
- Misturar responsabilidades entre camadas
- Criar dependências circulares
- Ignorar interfaces definidas

A documentação está organizada para ser consultada conforme sua necessidade, seja para entender conceitos ou implementar funcionalidades específicas!
EOF

cat > docs/api/core/entities.md << 'EOF'
# 📦 Core Entities API

## 🎯 Visão Geral

As **Entities** são os objetos fundamentais do nosso domínio. Elas representam as "coisas" principais que nossa aplicação manipula e definem as regras mais básicas sobre esses objetos.

## 🍳 Recipe Entity

### 📄 **Interface: Recipe**

**Localização:** `src/core/entities/interface/Recipe.ts`

**Propósito:** Define a estrutura fundamental de uma receita.

```typescript
interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
  prepTime: number; // em minutos
  cookTime: number; // em minutos
  servings: number;
  difficulty: DifficultyLevel;
  category: CategoryId;
  imageUrl?: string;
  nutrition?: NutritionalInfo;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

**Regras Fundamentais:**
- `id` deve ser único e imutável
- `title` é obrigatório e não pode ser vazio
- `ingredients` deve ter pelo menos 1 item
- `instructions` deve ter pelo menos 1 passo
- `prepTime` e `cookTime` devem ser números positivos
- `servings` deve ser maior que 0

### 🎮 **Controller: RecipeController**

**Localização:** `src/core/entities/controller/RecipeController.ts`

**Propósito:** Controla operações e validações sobre receitas.

#### **Métodos Principais:**

##### `validateRecipe(recipe: Recipe): ValidationResult`
**O que faz:** Valida se uma receita atende a todas as regras fundamentais.

**Parâmetros:**
- `recipe`: Objeto Recipe para validar

**Retorno:**
- `ValidationResult`: Indica se é válida e lista erros se houver

**Exemplo:**
```typescript
const result = RecipeController.validateRecipe(myRecipe);
if (result.isValid) {
  console.log("Receita válida!");
} else {
  console.log("Erros:", result.errors);
}
```

##### `calculateTotalTime(recipe: Recipe): number`
**O que faz:** Calcula tempo total de preparo (prepTime + cookTime).

**Parâmetros:**
- `recipe`: Receita para calcular tempo

**Retorno:**
- `number`: Tempo total em minutos

##### `isComplete(recipe: Recipe): boolean`
**O que faz:** Verifica se receita tem todos os campos obrigatórios preenchidos.

### 🎨 **View: RecipeFormatter**

**Localização:** `src/core/entities/view/RecipeFormatter.ts`

**Propósito:** Formata dados de receitas para apresentação.

#### **Métodos Principais:**

##### `formatTime(minutes: number): string`
**O que faz:** Converte minutos em formato legível.

**Exemplo:**
- `90` → `"1h 30min"`
- `45` → `"45min"`
- `120` → `"2h"`

##### `formatDifficulty(level: DifficultyLevel): string`
**O que faz:** Converte nível de dificuldade para texto amigável.

**Exemplo:**
- `DifficultyLevel.EASY` → `"Fácil"`
- `DifficultyLevel.MEDIUM` → `"Médio"`
- `DifficultyLevel.HARD` → `"Difícil"`

##### `formatIngredientsList(ingredients: Ingredient[]): string[]`
**O que faz:** Formata lista de ingredientes com quantidades.

**Exemplo:**
```typescript
// Input: [{ name: "açúcar", amount: 250, unit: "g" }]
// Output: ["250g de açúcar"]
```

## 🏷️ Category Entity

### 📄 **Interface: Category**

**Localização:** `src/core/entities/interface/Category.ts`

```typescript
interface Category {
  id: CategoryId;
  name: string;
  description?: string;
  imageUrl?: string;
  parentId?: CategoryId; // para subcategorias
  isActive: boolean;
  sortOrder: number;
}
```

**Regras Fundamentais:**
- `id` deve ser único
- `name` é obrigatório e único por nível
- `sortOrder` determina ordem de exibição
- Categorias podem ter subcategorias (hierarquia)

### 🎮 **Controller: CategoryController**

**Métodos Principais:**
- `validateCategory(category: Category): ValidationResult`
- `isParentOf(parent: Category, child: Category): boolean`
- `getHierarchy(category: Category): Category[]`

### 🎨 **View: CategoryFormatter**

**Métodos Principais:**
- `formatHierarchyPath(category: Category): string`
- `formatCategoryIcon(category: Category): IconName`

## 🥕 Ingredient Entity

### 📄 **Interface: Ingredient**

**Localização:** `src/core/entities/interface/Ingredient.ts`

```typescript
interface Ingredient {
  id?: string;
  name: string;
  amount: number;
  unit: MeasurementUnit;
  notes?: string; // ex: "bem picado", "à temperatura ambiente"
  isOptional?: boolean;
}
```

**Regras Fundamentais:**
- `name` é obrigatório
- `amount` deve ser positivo
- `unit` deve ser uma unidade válida
- Ingredientes opcionais são claramente marcados

## 📋 Instruction Entity

### 📄 **Interface: Instruction**

**Localização:** `src/core/entities/interface/Instruction.ts`

```typescript
interface Instruction {
  id?: string;
  stepNumber: number;
  description: string;
  imageUrl?: string;
  timer?: number; // tempo em minutos para este passo
  temperature?: Temperature;
  notes?: string;
}
```

**Regras Fundamentais:**
- `stepNumber` deve ser sequencial e único
- `description` é obrigatória e clara
- Steps devem formar uma sequência lógica

## 🔍 Filter Entity

### 📄 **Interface: Filter**

**Localização:** `src/core/entities/interface/Filter.ts`

```typescript
interface Filter {
  categories?: CategoryId[];
  maxPrepTime?: number;
  maxCookTime?: number;
  difficulty?: DifficultyLevel[];
  servings?: {
    min?: number;
    max?: number;
  };
  tags?: string[];
  ingredients?: {
    include?: string[];
    exclude?: string[];
  };
  nutritional?: {
    maxCalories?: number;
    isVegetarian?: boolean;
    isVegan?: boolean;
    isGlutenFree?: boolean;
  };
}
```

## 🎯 Tipos Auxiliares

### 📊 **Enums Importantes**

```typescript
enum DifficultyLevel {
  EASY = 1,
  MEDIUM = 2,
  HARD = 3
}

enum MeasurementUnit {
  // Volume
  ML = "ml",
  L = "l",
  CUP = "xícara",
  TABLESPOON = "colher de sopa",
  TEASPOON = "colher de chá",
  
  // Peso
  G = "g",
  KG = "kg",
  
  // Quantidade
  UNIT = "unidade",
  SLICE = "fatia",
  PIECE = "pedaço"
}
```

### 🏷️ **Type Aliases**

```typescript
type CategoryId = string;
type RecipeId = string;
type UserId = string;

type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
};

type NutritionalInfo = {
  calories: number;
  protein: number; // gramas
  carbs: number; // gramas
  fat: number; // gramas
  fiber?: number; // gramas
  sugar?: number; // gramas
};
```

## 💡 Boas Práticas para Entities

### ✅ **Faça:**
- Mantenha entities simples e focadas
- Use validação rigorosa nas regras fundamentais
- Documente todas as regras de negócio
- Use tipos TypeScript para garantir consistência

### ❌ **Evite:**
- Lógica complexa nas entities
- Dependências externas
- Formatação específica de UI
- Regras que mudam frequentemente

### 🎯 **Exemplo de Uso Completo:**

```typescript
// Criar nova receita
const newRecipe: Recipe = {
  id: generateId(),
  title: "Brownie de Chocolate",
  ingredients: [
    {
      name: "chocolate meio amargo",
      amount: 200,
      unit: MeasurementUnit.G
    }
  ],
  instructions: [
    {
      stepNumber: 1,
      description: "Derreta o chocolate em banho-maria"
    }
  ],
  prepTime: 30,
  cookTime: 45,
  servings: 8,
  difficulty: DifficultyLevel.MEDIUM,
  category: "desserts",
  tags: ["chocolate", "sobremesa"],
  createdAt: new Date(),
  updatedAt: new Date()
};

// Validar receita
const validation = RecipeController.validateRecipe(newRecipe);
if (validation.isValid) {
  // Formatar para exibição
  const totalTime = RecipeController.calculateTotalTime(newRecipe);
  const timeText = RecipeFormatter.formatTime(totalTime);
  console.log(`Tempo total: ${timeText}`); // "1h 15min"
}
```

As Entities são a base sólida sobre a qual toda a aplicação é construída. Elas garantem que os dados fundamentais estejam sempre consistentes e válidos!