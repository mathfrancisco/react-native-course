# 🏗️ Arquitetura do App de Receitas

## 📁 Estrutura de Pastas Completa

```
RecipeApp/
├── src/
│   ├── core/                    # Camada Central - Regras de Negócio Puras
│   │   ├── entities/           # Modelos de dados principais
│   │   │   ├── controller/     # Lógica de manipulação de entidades
│   │   │   ├── view/          # Representação visual das entidades
│   │   │   └── interface/     # Contratos das entidades
│   │   ├── usecases/          # Casos de uso da aplicação
│   │   │   ├── controller/    # Orquestração dos casos de uso
│   │   │   ├── view/         # Apresentação dos casos de uso
│   │   │   └── interface/    # Contratos dos casos de uso
│   │   └── repositories/      # Interfaces dos repositórios
│   │       ├── controller/    # Controle de acesso aos dados
│   │       ├── view/         # Visualização dos dados
│   │       └── interface/    # Contratos de repositório
│   │
│   ├── business/              # Camada de Negócio - Regras Específicas
│   │   ├── services/         # Serviços de negócio
│   │   │   ├── controller/   # Controle dos serviços
│   │   │   ├── view/        # Interface dos serviços
│   │   │   └── interface/   # Contratos dos serviços
│   │   ├── validators/       # Validações de negócio
│   │   │   ├── controller/   # Controle de validações
│   │   │   ├── view/        # Feedback de validações
│   │   │   └── interface/   # Contratos de validação
│   │   └── processors/       # Processadores de dados
│   │       ├── controller/   # Controle do processamento
│   │       ├── view/        # Visualização do processamento
│   │       └── interface/   # Contratos de processamento
│   │
│   ├── impl/                 # Camada de Implementação - Framework/UI
│   │   ├── screens/         # Telas da aplicação
│   │   │   ├── controller/  # Controle das telas
│   │   │   ├── view/       # Componentes visuais
│   │   │   └── interface/  # Props e tipos das telas
│   │   ├── components/      # Componentes reutilizáveis
│   │   │   ├── controller/  # Lógica dos componentes
│   │   │   ├── view/       # UI dos componentes
│   │   │   └── interface/  # Props dos componentes
│   │   ├── navigation/      # Configuração de navegação
│   │   │   ├── controller/  # Lógica de navegação
│   │   │   ├── view/       # Stack/Tab navigators
│   │   │   └── interface/  # Tipos de navegação
│   │   ├── contexts/        # Context providers
│   │   │   ├── controller/  # Lógica dos contexts
│   │   │   ├── view/       # Providers
│   │   │   └── interface/  # Tipos dos contexts
│   │   ├── hooks/          # Custom hooks
│   │   │   ├── controller/  # Lógica dos hooks
│   │   │   ├── view/       # Interface dos hooks
│   │   │   └── interface/  # Tipos dos hooks
│   │   ├── storage/        # Implementação de armazenamento
│   │   │   ├── controller/  # Controle do storage
│   │   │   ├── view/       # Interface de storage
│   │   │   └── interface/  # Contratos de storage
│   │   └── api/            # Implementação de APIs
│   │       ├── controller/  # Controle das APIs
│   │       ├── view/       # Formatação de dados
│   │       └── interface/  # Contratos de API
│   │
│   ├── shared/              # Recursos Compartilhados
│   │   ├── constants/       # Constantes da aplicação
│   │   ├── utils/          # Funções utilitárias
│   │   ├── types/          # Tipos TypeScript globais
│   │   └── assets/         # Recursos estáticos
│   │
│   └── config/             # Configurações
│       ├── environment.ts   # Variáveis de ambiente
│       ├── theme.ts        # Tema da aplicação
│       └── navigation.ts   # Configurações de navegação
│
├── assets/                 # Recursos estáticos
│   ├── images/
│   ├── icons/
│   └── fonts/
│
└── __tests__/             # Testes
    ├── core/
    ├── business/
    └── impl/
```

## 🎯 Princípios da Arquitetura

### **1. Separação de Responsabilidades**
- **Core**: Regras de negócio puras, independentes de framework
- **Business**: Lógica específica da aplicação
- **Impl**: Implementação com React Native

### **2. Inversão de Dependência**
- Camadas superiores não dependem de implementações
- Uso de interfaces para desacoplar componentes
- Facilita testes e manutenção

### **3. Padrão MVC por Camada**
- **Controller**: Lógica de controle e orquestração
- **View**: Componentes visuais e apresentação
- **Interface**: Contratos e tipos TypeScript

## 🔄 Fluxo de Dados

```
User Interaction
       ↓
impl/screens/view
       ↓
impl/screens/controller
       ↓
business/services/controller
       ↓
core/usecases/controller
       ↓
core/repositories/interface
       ↓
impl/storage/controller
       ↓
Data Source (AsyncStorage/API)
```

## 📊 Entidades Principais

### **Recipe (Receita)**
```typescript
interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: Step[];
  category: Category;
  difficulty: Difficulty;
  prepTime: number;
  servings: number;
  image: string;
  isFavorite: boolean;
  rating: number;
  createdAt: Date;
}
```

### **Category (Categoria)**
```typescript
interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}
```

### **Filter (Filtro)**
```typescript
interface RecipeFilter {
  categories: string[];
  difficulty: Difficulty[];
  maxPrepTime: number;
  minRating: number;
  searchQuery: string;
}
```
```
graph TB
    subgraph "📱 IMPL Layer - React Native Implementation"
        A1[Screens<br/>Controller/View/Interface]
        A2[Components<br/>Controller/View/Interface]
        A3[Navigation<br/>Controller/View/Interface]
        A4[Contexts<br/>Controller/View/Interface]
        A5[Storage<br/>Controller/View/Interface]
        A6[API<br/>Controller/View/Interface]
    end

    subgraph "⚡ BUSINESS Layer - Application Logic"
        B1[Services<br/>Controller/View/Interface]
        B2[Validators<br/>Controller/View/Interface]
        B3[Processors<br/>Controller/View/Interface]
    end

    subgraph "🎯 CORE Layer - Business Rules"
        C1[Entities<br/>Controller/View/Interface]
        C2[UseCases<br/>Controller/View/Interface]
        C3[Repositories<br/>Controller/View/Interface]
    end

    subgraph "📊 Data Sources"
        D1[(AsyncStorage)]
        D2[(API External)]
        D3[(Cache)]
    end

    A1 --> A4
    A1 --> A2
    A3 --> A1
    A4 --> B1
    A5 --> D1
    A6 --> D2
    
    B1 --> C2
    B2 --> C1
    B3 --> C1
    
    C2 --> C3
    C3 --> A5
    C3 --> A6
    
    A5 --> D3

    classDef impl fill:#e1f5fe
    classDef business fill:#f3e5f5
    classDef core fill:#e8f5e8
    classDef data fill:#fff3e0

    class A1,A2,A3,A4,A5,A6 impl
    class B1,B2,B3 business
    class C1,C2,C3 core
    class D1,D2,D3 data
```
sequenceDiagram
    participant User as 👤 User
    participant UI as 🎨 FavoriteButton.tsx
    participant Hook as 🪝 useFavorites
    participant Context as 📦 FavoriteContext
    participant Service as ⚡ FavoriteService
    participant Validator as ✅ FavoriteValidator
    participant UseCase as 🎯 ToggleFavoriteUseCase
    participant Repo as 💾 FavoriteRepository
    participant Storage as 📱 AsyncStorage

    User->>UI: Toca no botão favorito
    UI->>Hook: useFavorites().toggleFavorite(recipeId)
    Hook->>Context: toggleFavorite(recipeId)
    
    Context->>Service: favoriteService.toggleFavorite(recipeId)
    Service->>Validator: validateRecipeId(recipeId)
    Validator-->>Service: ValidationResult
    
    alt Validation Success
        Service->>UseCase: execute(recipeId)
        UseCase->>Repo: isFavorite(recipeId)
        Repo->>Storage: AsyncStorage.getItem()
        Storage-->>Repo: favorites[]
        Repo-->>UseCase: boolean
        
        alt Is Favorite
            UseCase->>Repo: removeFavorite(recipeId)
            Repo->>Storage: AsyncStorage.setItem()
        else Not Favorite
            UseCase->>Repo: addFavorite(recipeId)
            Repo->>Storage: AsyncStorage.setItem()
        end
        
        UseCase-->>Service: boolean (new state)
        Service-->>Context: FavoriteUseCaseResult
        Context->>Context: setFavorites(newState)
        Context-->>Hook: Updated context
        Hook-->>UI: Re-render with new state
        UI-->>User: Visual feedback (heart filled/empty)
    else Validation Error
        Service-->>Context: Error
        Context-->>UI: Error state
        UI-->>User: Error feedback
    end

# 🚀 Guia de Implementação - App de Receitas

## 🛠️ Stack Tecnológico

### **📱 Framework Base**
```bash
# React Native CLI
npx react-native init RecipeApp --template react-native-template-typescript
```

### **🧭 Navegação**
```bash
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs @react-navigation/drawer
npm install react-native-screens react-native-safe-area-context
npm install react-native-gesture-handler react-native-reanimated
```

### **💾 Gerenciamento de Estado**
```bash
npm install @reduxjs/toolkit react-redux
npm install @react-native-async-storage/async-storage
```

### **🎨 UI e Animações**
```bash
npm install react-native-vector-icons
npm install react-native-reanimated
npm install react-native-fast-image
npm install react-native-linear-gradient
```

### **🔧 Utilitários**
```bash
npm install lodash
npm install date-fns
npm install react-native-uuid
```

### **🧪 Testes**
```bash
npm install --save-dev @testing-library/react-native
npm install --save-dev jest
```

## 📋 Metodologia de Desenvolvimento

### **🎯 Fase 1: Setup e Core (Semana 1-2)**

#### **1.1 Configuração Inicial**
- [ ] Setup do projeto React Native CLI
- [ ] Configuração do TypeScript
- [ ] Setup das dependências base
- [ ] Configuração do ESLint/Prettier

#### **1.2 Core Layer - Entidades**
- [ ] **core/entities/interface/Recipe.ts**
  - Definir interface Recipe
  - Definir interface Ingredient
  - Definir interface Category
  - Definir enums (Difficulty, MealType)

- [ ] **core/entities/controller/RecipeController.ts**
  - Lógica de criação de receitas
  - Validações básicas
  - Transformações de dados

- [ ] **core/entities/view/RecipeView.ts**
  - Formatação de dados para exibição
  - Cálculos derivados (tempo total, calorias)

#### **1.3 Core Layer - Repositórios**
- [ ] **core/repositories/interface/IRecipeRepository.ts**
  - Contratos para CRUD de receitas
  - Interfaces para filtros e busca

### **🎯 Fase 2: Business Logic (Semana 2-3)**

#### **2.1 Business Layer - Services**
- [ ] **business/services/controller/RecipeService.ts**
  - Lógica de negócio para receitas
  - Algoritmos de recomendação
  - Lógica de favoritos

- [ ] **business/services/controller/FilterService.ts**
  - Lógica de filtros avançados
  - Algoritmos de busca
  - Ordenação por relevância

#### **2.2 Business Layer - Validators**
- [ ] **business/validators/controller/RecipeValidator.ts**
  - Validações de receitas
  - Regras de negócio específicas

#### **2.3 Core Layer - Use Cases**
- [ ] **core/usecases/controller/GetRecipesUseCase.ts**
- [ ] **core/usecases/controller/SearchRecipesUseCase.ts**
- [ ] **core/usecases/controller/ToggleFavoriteUseCase.ts**
- [ ] **core/usecases/controller/FilterRecipesUseCase.ts**

### **🎯 Fase 3: Implementation Layer (Semana 3-4)**

#### **3.1 Storage Implementation**
- [ ] **impl/storage/controller/AsyncStorageRepository.ts**
  - Implementação do repositório com AsyncStorage
  - Cache de receitas
  - Persistência de favoritos

#### **3.2 Context Setup**
- [ ] **impl/contexts/controller/RecipeContext.ts**
  - Context para gerenciar estado global
  - Actions e reducers

- [ ] **impl/contexts/controller/FilterContext.ts**
  - Context para filtros
  - Estado de busca

#### **3.3 Custom Hooks**
- [ ] **impl/hooks/controller/useRecipes.ts**
- [ ] **impl/hooks/controller/useFilters.ts**
- [ ] **impl/hooks/controller/useFavorites.ts**

### **🎯 Fase 4: UI Components (Semana 4-5)**

#### **4.1 Base Components**
- [ ] **impl/components/view/Button.tsx**
- [ ] **impl/components/view/Input.tsx**
- [ ] **impl/components/view/Card.tsx**
- [ ] **impl/components/view/Loading.tsx**

#### **4.2 Recipe Components**
- [ ] **impl/components/view/RecipeCard.tsx**
- [ ] **impl/components/view/RecipeList.tsx**
- [ ] **impl/components/view/CategoryCard.tsx**
- [ ] **impl/components/view/FilterModal.tsx**

#### **4.3 Component Controllers**
- [ ] **impl/components/controller/RecipeCardController.ts**
- [ ] **impl/components/controller/FilterController.ts**

### **🎯 Fase 5: Screens (Semana 5-6)**

#### **5.1 Screen Views**
- [ ] **impl/screens/view/HomeScreen.tsx**
- [ ] **impl/screens/view/RecipeDetailScreen.tsx**
- [ ] **impl/screens/view/CategoriesScreen.tsx**
- [ ] **impl/screens/view/FavoritesScreen.tsx**
- [ ] **impl/screens/view/SearchScreen.tsx**

#### **5.2 Screen Controllers**
- [ ] **impl/screens/controller/HomeController.ts**
- [ ] **impl/screens/controller/RecipeDetailController.ts**
- [ ] **impl/screens/controller/SearchController.ts**

#### **5.3 Navigation Setup**
- [ ] **impl/navigation/view/AppNavigator.tsx**
- [ ] **impl/navigation/view/TabNavigator.tsx**
- [ ] **impl/navigation/controller/NavigationController.ts**

### **🎯 Fase 6: Features Avançadas (Semana 6-7)**

#### **6.1 Search & Filter**
- [ ] Implementar busca em tempo real
- [ ] Filtros por categoria, dificuldade, tempo
- [ ] Histórico de buscas

#### **6.2 Favoritos**
- [ ] Sistema de favoritos persistente
- [ ] Sincronização entre telas

#### **6.3 Performance**
- [ ] Lazy loading de imagens
- [ ] Virtualização de listas
- [ ] Cache inteligente

## 🔍 Patterns e Conceitos Aplicados

### **1. Clean Architecture**
- Separação clara de responsabilidades
- Independência de frameworks
- Facilidade para testes

### **2. SOLID Principles**
- **S**ingle Responsibility: Cada classe tem uma responsabilidade
- **O**pen/Closed: Aberto para extensão, fechado para modificação
- **L**iskov Substitution: Substituição de implementações
- **I**nterface Segregation: Interfaces específicas
- **D**ependency Inversion: Dependência de abstrações

### **3. Repository Pattern**
- Abstração da camada de dados
- Facilita mudança de source de dados
- Simplifica testes

### **4. Use Case Pattern**
- Encapsula regras de negócio
- Orquestra operações complexas
- Facilita reuso

### **5. MVC por Camada**
- **Model**: Interfaces e tipos
- **View**: Componentes React Native
- **Controller**: Lógica de controle

## 📚 Conceitos de React Native Aplicados

### **1. Navigation**
```typescript
// Stack Navigation para fluxo linear
// Tab Navigation para seções principais
// Drawer Navigation para menu lateral
```

### **2. Context API**
```typescript
// Gerenciamento de estado global
// Evita prop drilling
// Facilita compartilhamento de dados
```

### **3. Custom Hooks**
```typescript
// Reutilização de lógica
// Separação de concerns
// Facilita testes
```

### **4. Performance**
```typescript
// FlatList com getItemLayout
// React.memo para otimização
// useMemo e useCallback
```

### **5. Storage**
```typescript
// AsyncStorage para persistência
// Cache em memória
// Sincronização de dados
```

## 🎓 Aspectos Didáticos

### **Por que esta arquitetura?**
1. **Escalabilidade**: Fácil de adicionar novas features
2. **Manutenibilidade**: Código organizado e testável
3. **Reutilização**: Componentes e lógica reutilizáveis
4. **Aprendizado**: Aplica boas práticas da indústria

### **O que você aprenderá:**
- Arquitetura de software robusta
- Padrões de design aplicados
- TypeScript avançado
- React Native best practices
- Gerenciamento de estado complexo
- Performance optimization
- Testing strategies

### **Próximos passos:**
1. Implementar cada fase gradualmente
2. Testar cada camada isoladamente
3. Adicionar features incrementalmente
4. Refatorar conforme necessário
