# 📂 Organização de Código - Boas Práticas

## 🎯 Filosofia da Organização

Nossa organização de código segue o princípio **"Cada coisa em seu lugar, cada lugar com sua coisa"**. Isso significa que quando você precisar encontrar algo, você saberá exatamente onde procurar!

## 🗺️ Mapa Mental da Estrutura

```
🤔 "Onde fica...?"

❓ Regras fundamentais → 🎯 CORE
❓ Como implementar → ⚡ BUSINESS  
❓ Interface do usuário → 📱 IMPL
❓ Funções auxiliares → 🔗 SHARED
```

## 📁 Estrutura Detalhada com Propósitos

### 🎯 **CORE - "O que nunca muda"**

```
src/core/
├── entities/              → "Os personagens principais"
│   ├── controller/        → "Como os personagens se comportam"
│   │   ├── RecipeController.ts     → Valida receitas
│   │   ├── CategoryController.ts   → Gerencia categorias
│   │   └── FilterController.ts     → Controla filtros
│   ├── view/             → "Como apresentar os personagens"
│   │   ├── RecipeFormatter.ts      → Formata receitas
│   │   ├── CategoryFormatter.ts    → Formata categorias
│   │   └── NutritionalFormatter.ts → Formata nutrição
│   └── interface/        → "Definição dos personagens"
│       ├── Recipe.ts               → O que é uma receita
│       ├── Category.ts             → O que é uma categoria
│       ├── Ingredient.ts           → O que é um ingrediente
│       ├── Instruction.ts          → O que é uma instrução
│       └── Filter.ts               → O que é um filtro
│
├── usecases/             → "As cenas do espetáculo"  
│   ├── controller/       → "Direção das cenas"
│   │   ├── GetRecipesUseCase.ts    → Como buscar receitas
│   │   ├── SearchRecipesUseCase.ts → Como fazer busca
│   │   ├── FilterRecipesUseCase.ts → Como filtrar
│   │   ├── ToggleFavoriteUseCase.ts → Como favoritar
│   │   └── GetCategoriesUseCase.ts → Como buscar categorias
│   ├── view/            → "Apresentação das cenas"
│   │   ├── RecipeListView.ts       → Como mostrar lista
│   │   ├── SearchResultView.ts     → Como mostrar busca
│   │   └── FavoriteResultView.ts   → Como mostrar favoritos
│   └── interface/       → "Roteiro das cenas"
│       ├── IGetRecipesUseCase.ts   → Contrato de busca
│       ├── ISearchUseCase.ts       → Contrato de pesquisa
│       └── IFavoriteUseCase.ts     → Contrato de favoritos
│
└── repositories/         → "Como acessar dados"
    ├── controller/       → "Gerentes dos dados"
    │   ├── RepositoryManager.ts    → Coordena repositórios
    │   └── CacheController.ts      → Gerencia cache
    ├── view/            → "Apresentação dos dados"
    │   ├── DataPresenter.ts        → Mostra status dados
    │   └── ErrorPresenter.ts       → Mostra erros
    └── interface/       → "Contratos de dados"
        ├── IRecipeRepository.ts    → Como acessar receitas
        ├── ICategoryRepository.ts  → Como acessar categorias
        └── IFavoriteRepository.ts  → Como acessar favoritos
```

### ⚡ **BUSINESS - "Como fazer acontecer"**

```
src/business/
├── services/             → "Orquestradores inteligentes"
│   ├── controller/       → "Maestros dos serviços"
│   │   ├── RecipeService.ts        → Orquestra receitas
│   │   ├── SearchService.ts        → Orquestra busca
│   │   ├── FilterService.ts        → Orquestra filtros
│   │   ├── FavoriteService.ts      → Orquestra favoritos
│   │   └── RecommendationService.ts → Orquestra sugestões
│   ├── view/            → "Resultado dos serviços"
│   │   ├── ServiceResultView.ts    → Formata sucessos
│   │   └── ServiceErrorView.ts     → Formata erros
│   └── interface/       → "Contratos dos serviços"
│       ├── IRecipeService.ts       → O que recipe service faz
│       ├── ISearchService.ts       → O que search service faz
│       └── IFavoriteService.ts     → O que favorite service faz
│
├── validators/           → "Guardiões da qualidade"
│   ├── controller/       → "Executores da validação"
│   │   ├── RecipeValidator.ts      → Valida receitas
│   │   ├── SearchValidator.ts      → Valida buscas
│   │   └── FilterValidator.ts      → Valida filtros
│   ├── view/            → "Feedback da validação"
│   │   ├── ValidationErrorView.ts  → Mostra erros
│   │   └── ValidationSuccessView.ts → Mostra sucessos
│   └── interface/       → "Regras de validação"
│       ├── IValidator.ts           → Como validar
│       └── ValidationResult.ts     → Resultado validação
│
└── processors/          → "Transformadores de dados"
    ├── controller/      → "Executores de processamento"
    │   ├── DataProcessor.ts        → Processa dados gerais
    │   ├── ImageProcessor.ts       → Processa imagens
    │   └── SearchProcessor.ts      → Processa buscas
    ├── view/           → "Resultado do processamento"
    │   ├── ProcessingStatusView.ts → Status processamento
    │   └── ProcessingResultView.ts → Resultado processamento
    └── interface/      → "Como processar"
        ├── IDataProcessor.ts       → Contrato processamento
        └── ProcessingOptions.ts    → Opções processamento
```

### 📱 **IMPL - "A cara da aplicação"**

```
src/impl/
├── screens/             → "As telas que o usuário vê"
│   ├── controller/      → "Cérebro das telas"
│   │   ├── HomeScreenController.ts    → Lógica tela inicial
│   │   ├── RecipeDetailController.ts  → Lógica detalhes
│   │   ├── SearchController.ts        → Lógica busca
│   │   ├── CategoriesController.ts    → Lógica categorias
│   │   └── FavoritesController.ts     → Lógica favoritos
│   ├── view/           → "Interface visual das telas"
│   │   ├── HomeScreen.tsx             → Tela inicial
│   │   ├── RecipeDetailScreen.tsx     → Tela detalhes
│   │   ├── SearchScreen.tsx           → Tela busca
│   │   ├── CategoriesScreen.tsx       → Tela categorias
│   │   └── FavoritesScreen.tsx        → Tela favoritos
│   └── interface/      → "Tipos das telas"
│       ├── HomeScreenTypes.ts         → Props tela inicial
│       ├── RecipeDetailTypes.ts       → Props detalhes
│       ├── SearchTypes.ts             → Props busca
│       └── NavigationTypes.ts         → Props navegação
│
├── components/         → "Peças reutilizáveis"
│   ├── controller/     → "Lógica dos componentes"
│   │   ├── RecipeCardController.ts    → Lógica card receita
│   │   ├── CategoryCardController.ts  → Lógica card categoria
│   │   ├── FilterModalController.ts   → Lógica modal filtro
│   │   └── SearchBarController.ts     → Lógica barra busca
│   ├── view/          → "Visual dos componentes"
│   │   ├── common/                    → "Componentes básicos"
│   │   │   ├── Button.tsx             → Botão reutilizável
│   │   │   ├── Input.tsx              → Input reutilizável
│   │   │   ├── Card.tsx               → Card reutilizável
│   │   │   ├── Loading.tsx            → Loading reutilizável
│   │   │   └── Modal.tsx              → Modal reutilizável
│   │   ├── recipe/                    → "Componentes de receita"
│   │   │   ├── RecipeCard.tsx         → Card da receita
│   │   │   ├── RecipeList.tsx         → Lista de receitas
│   │   │   ├── RecipeDetail.tsx       → Detalhes receita
│   │   │   ├── IngredientList.tsx     → Lista ingredientes
│   │   │   └── InstructionList.tsx    → Lista instruções
│   │   ├── category/                  → "Componentes categoria"
│   │   │   ├── CategoryCard.tsx       → Card categoria
│   │   │   ├── CategoryList.tsx       → Lista categorias
│   │   │   └── CategoryFilter.tsx     → Filtro categoria
│   │   └── search/                    → "Componentes busca"
│   │       ├── SearchBar.tsx          → Barra de busca
│   │       ├── FilterModal.tsx        → Modal de filtros
│   │       ├── SearchResults.tsx      → Resultados busca
│   │       └── FilterChips.tsx        → Chips de filtro
│   └── interface/     → "Tipos dos componentes"
│       ├── CommonComponentTypes.ts    → Props comuns
│       ├── RecipeComponentTypes.ts    → Props receita
│       ├── CategoryComponentTypes.ts  → Props categoria
│       └── SearchComponentTypes.ts    → Props busca
```

## 🎯 Regras de Organização

### 📂 **Regra da Localização Lógica**

**Pergunta:** "Onde devo colocar este arquivo?"
**Resposta:** "Onde alguém esperaria encontrá-lo?"

```
🤔 Validação de receita → business/validators/
🤔 Formatação de tempo → shared/utils/
🤔 Tela de busca → impl/screens/
🤔 Definição de receita → core/entities/
```

### 🔍 **Regra da Busca Rápida**

**Objetivo:** Encontrar qualquer arquivo em menos de 10 segundos.

**Como:**
1. **Identifique a camada** (Core, Business, Impl, Shared)
2. **Identifique o módulo** (entities, services, components, etc.)
3. **Identifique o padrão** (controller, view, interface)

### 📝 **Regra da Nomenclatura Consistente**

```
📁 Pasta sempre minúscula: components/, entities/, services/
📄 Arquivo sempre PascalCase: RecipeController.ts, HomeScreen.tsx
🔧 Função sempre camelCase: validateRecipe(), formatTime()
📊 Constante sempre UPPER_CASE: API_BASE_URL, MAX_RETRIES
```

## 🎨 Padrões de Arquivos por Tipo

### 🎮 **Controllers (.ts)**
```typescript
// Padrão: [Nome]Controller.ts
class RecipeController {
  // Métodos estáticos para operações
  static validateRecipe(recipe: Recipe): ValidationResult { }
  static calculateTotalTime(recipe: Recipe): number { }
}
```

### 🎨 **Views (.tsx ou .ts)**
```typescript
// Componente React: [Nome].tsx
export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  // JSX aqui
};

// Formatador: [Nome]Formatter.ts  
export class RecipeFormatter {
  static formatTime(minutes: number): string { }
  static formatDifficulty(level: DifficultyLevel): string { }
}
```

### 🔌 **Interfaces (.ts)**
```typescript
// Interface: I[Nome].ts ou [Nome]Types.ts
export interface IRecipeRepository {
  getRecipes(): Promise<Recipe[]>;
  saveRecipe(recipe: Recipe): Promise<void>;
}

export interface RecipeCardProps {
  recipe: Recipe;
  onFavorite?: (recipeId: string) => void;
}
```

## 📊 Índices e Barrel Exports

### 🎯 **Estrutura de index.ts**

Cada pasta principal deve ter um `index.ts` que exporta tudo:

```typescript
// src/core/entities/index.ts
export * from './interface/Recipe';
export * from './interface/Category';
export * from './controller/RecipeController';
export * from './view/RecipeFormatter';

// src/impl/components/index.ts  
export * from './view/common/Button';
export * from './view/recipe/RecipeCard';
export * from './controller/RecipeCardController';
```

**Benefício:** Imports limpos
```typescript
// ❌ Ruim
import { Recipe } from '../../../core/entities/interface/Recipe';
import { RecipeController } from '../../../core/entities/controller/RecipeController';

// ✅ Bom
import { Recipe, RecipeController } from '@/core/entities';
```

## 🔄 Fluxo de Desenvolvimento

### 📝 **Adicionando Nova Funcionalidade**

**Exemplo:** Adicionar sistema de avaliações

**1. Defina a camada (Core):**
```
src/core/entities/interface/Rating.ts
src/core/entities/controller/RatingController.ts
src/core/entities/view/RatingFormatter.ts
```

**2. Implemente regras (Business):**
```
src/business/services/controller/RatingService.ts
src/business/validators/controller/RatingValidator.ts
```

**3. Crie interface (Impl):**
```
src/impl/components/view/rating/RatingStars.tsx
src/impl/components/controller/RatingController.ts
```

**4. Adicione utilitários (Shared):**
```
src/shared/utils/ratingUtils.ts
src/shared/types/rating.types.ts
```

## 💡 Dicas Práticas

### ✅ **Boas Práticas**

1. **Um arquivo, uma responsabilidade**
2. **Nomes auto-explicativos** 
3. **Estrutura consistente** em todas as camadas
4. **Exports organizados** via index.ts
5. **Documentação** inline quando necessário

### ❌ **Evite**

1. **Arquivos gigantes** (mais de 200 linhas)
2. **Nomes genéricos** (utils.ts, helpers.ts)
3. **Misturar responsabilidades** em um arquivo
4. **Imports relativos profundos** (../../..)
5. **Duplicação de código** entre camadas

### 🎯 **Checklist do Arquivo Bem Organizado**

- [ ] Nome claro e específico
- [ ] Na pasta correta da arquitetura
- [ ] Segue padrão CVI (Controller/View/Interface)  
- [ ] Exportado no index.ts da pasta
- [ ] Comentários onde necessário
- [ ] Imports organizados (externos → internos)
- [ ] Uma responsabilidade principal

## 🚀 Evolução da Organização

### 📈 **Quando Reorganizar**

- Pasta com mais de 10 arquivos → Criar subpastas
- Arquivo com mais de 200 linhas → Quebrar em menores
- Funcionalidades relacionadas espalhadas → Agrupar
- Dificuldade para encontrar arquivos → Revisar estrutura

### 🔄 **Refatoração Segura**

1. **Crie nova estrutura** sem quebrar a antiga
2. **Mova arquivos** um por vez
3. **Teste** após cada movimento
4. **Atualize imports** gradualmente
5. **Remove estrutura antiga** apenas no final

A organização é um investimento que se paga a cada dia de desenvolvimento. Uma estrutura bem pensada economiza horas de procura e facilita a manutenção! 🎯
EOF