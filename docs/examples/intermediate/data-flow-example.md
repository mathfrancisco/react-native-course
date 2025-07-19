# 🌊 Fluxo de Dados: Busca de Receitas

## 🎯 Cenário Completo

Usuário abre o app e quer buscar "receitas de sobremesa com chocolate para o jantar de hoje". Vamos acompanhar essa jornada completa através da nossa arquitetura.

## 📱 Etapa 1: Interface do Usuário (IMPL)

### 🖥️ **Tela Inicial - HomeScreen**

**O que o usuário vê:**
- Campo de busca no topo
- Categorias populares em cards
- Lista de receitas em destaque
- Botão de filtros

**O que acontece quando usuário digita:**

```
👆 Usuário digita "sobremesa chocolate"
    ↓
📱 SearchBar.tsx (View)
   - Captura texto digitado
   - Aplica debounce (evita muitas buscas)
   - Mostra indicador de "digitando..."
    ↓
📱 SearchController.ts (Controller)  
   - Processa entrada do usuário
   - Valida se busca é válida (min 2 caracteres)
   - Prepara parâmetros de busca
    ↓
📱 SearchTypes.ts (Interface)
   - Define estrutura dos parâmetros
   - Especifica formato de resposta esperado
```

**Dados passados para próxima camada:**
```javascript
{
  query: "sobremesa chocolate",
  filters: {
    category: "desserts",
    prepTime: "any",
    difficulty: "any"
  },
  pagination: {
    page: 1,
    limit: 20
  }
}
```

## ⚡ Etapa 2: Lógica de Negócio (BUSINESS)

### 🔍 **Processamento da Busca**

**O que acontece na camada Business:**

```
⚡ SearchService.ts (Controller)
   - Recebe parâmetros da busca
   - Aplica regras de negócio específicas
   - Coordena diferentes processadores
    ↓
⚡ SearchValidator.ts (Validator)
   - Valida se busca é permitida
   - Verifica se não é spam (muitas buscas rápidas)
   - Sanitiza entrada (remove caracteres especiais)
    ↓
⚡ SearchProcessor.ts (Processor)
   - Quebra busca em palavras-chave
   - Identifica sinônimos ("sobremesa" = "doce", "dessert")
   - Calcula relevância por categoria
    ↓
⚡ RecommendationService.ts (Service)
   - Adiciona receitas sugeridas
   - Considera histórico do usuário
   - Aplica algoritmo de relevância
```

**Lógica aplicada:**
- **Expansão de busca:** "chocolate" → inclui "cacau", "brownie", "trufa"
- **Filtro inteligente:** detecta "sobremesa" → aplica filtro de categoria automaticamente
- **Priorização:** receitas com mais ingredientes correspondentes ficam no topo
- **Personalização:** se usuário favoritou receitas veganas antes, prioriza opções veganas

**Dados processados:**
```javascript
{
  expandedQuery: ["sobremesa", "chocolate", "doce", "cacau", "brownie"],
  smartFilters: {
    category: "desserts", // detectado automaticamente
    contains: ["chocolate"],
    excludes: [], // baseado em alergias do usuário
  },
  relevanceWeights: {
    titleMatch: 3,
    ingredientMatch: 2,
    categoryMatch: 1
  }
}
```

## 🎯 Etapa 3: Regras Fundamentais (CORE)

### 📋 **Aplicação das Regras de Negócio**

**O que acontece na camada Core:**

```
🎯 SearchRecipesUseCase.ts (Controller)
   - Recebe busca processada
   - Aplica regras fundamentais de busca
   - Garante que apenas receitas válidas sejam retornadas
    ↓
🎯 Recipe.ts (Entity Interface)
   - Define o que é uma receita válida
   - Especifica campos obrigatórios
   - Garante integridade dos dados
    ↓
🎯 IRecipeRepository.ts (Repository Interface)
   - Define como buscar receitas
   - Especifica formato de retorno
   - Garante consistência de dados
```

**Regras aplicadas:**
- **Validação de receita:** Apenas receitas com título, ingredientes e instruções
- **Disponibilidade:** Apenas receitas ativas (não removidas)
- **Integridade:** Dados completos e consistentes
- **Segurança:** Filtrar conteúdo inadequado

**Busca executada:**
```javascript
// Pseudo-código das regras do Core
if (recipe.isValid && recipe.isActive && recipe.hasAllRequiredFields) {
  // Calcular score de relevância
  let score = 0;
  if (recipe.title.includes(searchTerms)) score += 3;
  if (recipe.ingredients.some(ing => searchTerms.includes(ing))) score += 2;
  if (recipe.category === detectedCategory) score += 1;
  
  return { recipe, relevanceScore: score };
}
```

## 🔗 Etapa 4: Recursos Compartilhados (SHARED)

### 🛠️ **Utilitários e Dados**

**O que é usado da camada Shared:**

```
🔗 searchHelpers.ts
   - normalizeText(): remove acentos, converte maiúsculas
   - calculateSimilarity(): compara strings
   - highlightMatches(): marca palavras encontradas
    ↓
🔗 recipeHelpers.ts
   - formatPrepTime(): "90min" → "1h 30min"
   - calculateDifficulty(): baseado em número de passos
   - estimateServings(): baseado em ingredientes
    ↓
🔗 data/json/recipes.json
   - Base de dados das receitas
   - Estrutura padronizada
   - Dados validados
```

**Processamento dos dados:**
- **Normalização:** "Sobremesa" = "sobremesa" = "SOBREMESA"
- **Formatação:** Tempos, dificuldades, porções padronizadas
- **Otimização:** Cache de buscas frequentes
- **Internacionalização:** Suporte a múltiplos idiomas

## 🔄 Etapa 5: Retorno dos Dados

### 📤 **Volta pela Cadeia**

**Jornada de volta:**

```
🔗 SHARED retorna dados processados
    ↓ 
🎯 CORE aplica filtros finais e validações
    ↓
⚡ BUSINESS formata resultados e adiciona metadados  
    ↓
📱 IMPL atualiza interface com resultados
    ↓
👀 Usuário vê lista de receitas relevantes
```

**Dados finais entregues à UI:**
```javascript
{
  results: [
    {
      id: "recipe_123",
      title: "Brownie de Chocolate Intenso",
      image: "brownie.jpg",
      prepTime: "45min",
      difficulty: "Médio",
      rating: 4.8,
      servings: 8,
      highlights: ["chocolate", "sobremesa"], // palavras encontradas
      relevanceScore: 95
    },
    // ... mais receitas
  ],
  metadata: {
    totalResults: 47,
    searchTime: "120ms",
    suggestions: ["bolo de chocolate", "mousse de chocolate"],
    appliedFilters: ["categoria: sobremesas"]
  }
}
```

## 📱 Etapa 6: Atualização da Interface

### 🎨 **Apresentação Final**

**O que o usuário vê:**

```
📱 SearchResults.tsx (View)
   - Lista de receitas encontradas
   - Destaque nas palavras-chave
   - Informações resumidas de cada receita
   - Botões de ação (favoritar, ver detalhes)
    ↓
📱 RecipeCard.tsx (Component)  
   - Card individual para cada receita
   - Imagem, título, tempo, dificuldade
   - Indicadores visuais (favorito, novo, popular)
    ↓
📱 FilterChips.tsx (Component)
   - Filtros aplicados automaticamente
   - Opção de remover filtros
   - Sugestões de refinamento
```

## 🎯 Exemplo Visual do Resultado

```
🔍 [sobremesa chocolate        ] 🔍
    ↳ Categoria: Sobremesas ✕

📋 47 receitas encontradas (120ms)

┌─────────────────────────────────────┐
│ 🍫 Brownie de Chocolate Intenso     │
│ ⭐ 4.8  ⏱️ 45min  👥 8 porções      │  
│ 💡 chocolate, sobremesa            │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🧁 Mousse de Chocolate Belga        │
│ ⭐ 4.9  ⏱️ 20min  👥 6 porções      │
│ 💡 chocolate, sobremesa, cremoso    │
└─────────────────────────────────────┘

🔮 Sugestões: bolo de chocolate, trufa
```

## 🚀 Benefícios do Fluxo Organizado

### ⚡ **Performance**
- Cache inteligente na camada Business
- Validação rápida na camada Core
- Otimizações específicas em cada camada

### 🔍 **Relevância**
- Múltiplas estratégias de busca
- Personalização baseada no usuário
- Refinamento contínuo dos algoritmos

### 🧪 **Testabilidade**
- Cada etapa pode ser testada isoladamente
- Mocks simples e eficazes
- Debugging facilitado

### 🔧 **Manutenibilidade**
- Mudanças localizadas por responsabilidade
- Evolução incremental de cada camada
- Adição de features sem quebrar existentes

## 💡 Pontos de Atenção

### ✅ **Boas Práticas Aplicadas**
- Separação clara de responsabilidades
- Fluxo unidirecional de dados
- Validação em múltiplas camadas
- Cache e otimizações apropriadas

### 🎯 **Resultado Final**
Uma busca simples se transforma em uma experiência rica e personalizada, mantendo o código organizado e cada camada focada em sua responsabilidade específica.

O usuário digitou "sobremesa chocolate" e recebeu resultados relevantes, personalizados e bem apresentados - tudo isso graças ao fluxo bem estruturado através das nossas camadas arquiteturais!