# 🎯 Camada CORE - O Coração da Aplicação

## 🧠 O que é a Camada Core?

A camada **Core** é o **cérebro** da nossa aplicação. Ela contém as **regras de negócio mais fundamentais** - aquelas que existiriam mesmo se mudássemos completamente a tecnologia.

## 🎪 Analogia: O Coração do Circo

Imagine que o RecipeApp é um circo:
- **Core** = O espetáculo principal (nunca muda)
- **Business** = Como organizar o show (pode melhorar)
- **Implementation** = A arquibancada e bilheteria (pode renovar)
- **Shared** = Infraestrutura (luz, som, segurança)

O **Core** é o que faz um circo ser um circo, independentemente do local ou época!

## 📁 Estrutura da Camada Core

```
🎯 src/core/
├── 📦 entities/          → "Os personagens principais"
├── 🎬 usecases/          → "As cenas do espetáculo"  
└── 🗄️ repositories/      → "O roteiro do show"
```

## 📦 Entities - Os Personagens Principais

### 🎭 O que são Entities?

**Entities** são os **objetos principais** da nossa aplicação. Eles representam as "coisas" mais importantes do nosso domínio.

### 🍳 No RecipeApp, temos:

#### 🥘 **Recipe (Receita)**
- **O que é:** O personagem principal da nossa história
- **Responsabilidade:** Definir o que faz uma receita ser uma receita
- **Regras fundamentais:**
  - Deve ter um título
  - Deve ter pelo menos um ingrediente
  - Deve ter instruções de preparo
  - Pode ter informações nutricionais

#### 🏷️ **Category (Categoria)**  
- **O que é:** O "gênero" da nossa receita
- **Responsabilidade:** Organizar receitas por tipo
- **Regras fundamentais:**
  - Deve ter um nome único
  - Pode ter uma descrição
  - Pode ter uma imagem representativa

#### 🥕 **Ingredient (Ingrediente)**
- **O que é:** Os "materiais" necessários
- **Responsabilidade:** Definir componentes das receitas
- **Regras fundamentais:**
  - Deve ter um nome
  - Deve ter uma quantidade
  - Pode ter unidade de medida

### 📂 Estrutura MVC nas Entities

#### 🎮 **Controller** (entities/controller/)
**O que faz:** Controla como as entidades se comportam

**Exemplo - RecipeController.ts:**
- Valida se uma receita está completa
- Calcula tempo total de preparo
- Verifica se ingredientes são suficientes

#### 🎨 **View** (entities/view/)
**O que faz:** Formata como as entidades são apresentadas

**Exemplo - RecipeFormatter.ts:**
- Formata tempo de preparo (ex: "1h 30min")
- Converte unidades (ex: "250ml" → "1 xícara")
- Formata lista de ingredientes

#### 🔌 **Interface** (entities/interface/)
**O que faz:** Define "contratos" que todos devem seguir

**Exemplo - Recipe.ts:**
- Define estrutura obrigatória de uma receita
- Especifica tipos de dados aceitos
- Documenta propriedades disponíveis

## 🎬 Use Cases - As Cenas do Espetáculo

### 🎯 O que são Use Cases?

**Use Cases** são as **ações principais** que nossa aplicação pode realizar. Eles representam o que o usuário quer fazer.

### 🍳 No RecipeApp, temos:

#### 🔍 **GetRecipesUseCase**
- **O que faz:** Busca receitas disponíveis
- **Quando usar:** Usuário quer ver lista de receitas
- **Regra fundamental:** Sempre retornar receitas válidas e organizadas

#### 🔎 **SearchRecipesUseCase**
- **O que faz:** Procura receitas por critérios
- **Quando usar:** Usuário digita algo na busca
- **Regra fundamental:** Busca deve ser relevante e rápida

#### ❤️ **ToggleFavoriteUseCase**
- **O que faz:** Adiciona/remove receita dos favoritos
- **Quando usar:** Usuário toca no coração
- **Regra fundamental:** Favorito deve ser único por usuário

### 📂 Estrutura MVC nos Use Cases

#### 🎮 **Controller** (usecases/controller/)
**O que faz:** Orquestra a execução dos casos de uso

**Exemplo - GetRecipesUseCase.ts:**
- Coordena busca de receitas
- Aplica filtros necessários
- Garante ordem correta

#### 🎨 **View** (usecases/view/)
**O que faz:** Apresenta resultados dos casos de uso

**Exemplo - RecipeListView.ts:**
- Formata lista de receitas
- Agrupa por categorias
- Adiciona informações extras

#### 🔌 **Interface** (usecases/interface/)
**O que faz:** Define contratos dos casos de uso

**Exemplo - IGetRecipesUseCase.ts:**
- Define método execute()
- Especifica parâmetros de entrada
- Documenta formato de retorno

## 🗄️ Repositories - O Roteiro do Show

### 📚 O que são Repositories?

**Repositories** definem **como acessar dados**, mas sem especificar onde esses dados estão. É como um "roteiro" que diz o que precisa acontecer.

### 🍳 No RecipeApp, temos:

#### 📄 **IRecipeRepository**
- **O que define:** Como buscar, salvar e gerenciar receitas
- **Não se importa com:** Se dados vêm de JSON, API ou banco
- **Garante:** Interface consistente para trabalhar com receitas

#### 🏷️ **ICategoryRepository**
- **O que define:** Como gerenciar categorias
- **Não se importa com:** Implementação específica
- **Garante:** Acesso organizado às categorias

### 📂 Estrutura MVC nos Repositories

#### 🎮 **Controller** (repositories/controller/)
**O que faz:** Gerencia acesso aos dados

**Exemplo - RepositoryManager.ts:**
- Coordena múltiplos repositórios
- Gerencia cache de dados
- Controla sincronização

#### 🎨 **View** (repositories/view/)
**O que faz:** Apresenta status dos dados

**Exemplo - DataPresenter.ts:**
- Mostra progresso de carregamento
- Formata mensagens de erro
- Exibe status de sincronização

#### 🔌 **Interface** (repositories/interface/)
**O que faz:** Define contratos de dados

**Exemplo - IRecipeRepository.ts:**
- Define métodos obrigatórios
- Especifica formato dos dados
- Documenta comportamento esperado

## 🌊 Fluxo na Camada Core

### 📱 Exemplo: "Usuário quer ver receitas favoritas"

```
1. 🎬 Use Case recebe solicitação
   ↓
2. 📦 Entity valida o que é "favorito"
   ↓
3. 🗄️ Repository define como buscar favoritos
   ↓
4. 🎬 Use Case organiza e processa
   ↓
5. 📦 Entity garante dados válidos
   ↓
6. ✅ Resultado entregue às camadas superiores
```

## 🎯 Características Importantes do Core

### 🧼 **Pureza Total**
- Não conhece React Native
- Não sabe o que é tela ou botão
- Não depende de bibliotecas externas
- Funciona em qualquer plataforma

### 🎭 **Regras Imutáveis**
- Define o que NUNCA muda na aplicação
- Estabelece verdades fundamentais
- Protege a integridade dos dados

### 🔬 **Testabilidade Máxima**
- Fácil de testar isoladamente
- Não precisa de mocks complexos
- Testes rápidos e confiáveis

## 💡 Boas Práticas para o Core

### ✅ **Faça:**
- Mantenha simples e focado
- Use nomes claros e descritivos
- Documente regras de negócio
- Escreva testes abundantes

### ❌ **Evite:**
- Importar bibliotecas UI
- Conhecer detalhes de implementação
- Lógica específica de plataforma
- Dependências externas desnecessárias

## 🚀 Próximos Passos

1. **Entenda as Entities** → Comece definindo seus objetos principais
2. **Mapeie Use Cases** → Liste o que sua app precisa fazer
3. **Defina Repositories** → Pense em como acessar dados
4. **Mantenha simples** → Core cresce devagar e com cuidado

O Core é a fundação sólida que permite tudo o mais funcionar. Investir tempo aqui economiza horas de refatoração depois!