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
