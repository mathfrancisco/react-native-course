# 🎨 Padrão Controller-View-Interface (CVI)

## 🎯 O que é o Padrão CVI?

O padrão **Controller-View-Interface** é nossa implementação do MVC (Model-View-Controller) adaptada para React Native e TypeScript. Cada pasta na nossa arquitetura segue essa estrutura.

## 🎪 Analogia: Orquestra Sinfônica

Imagine cada camada como uma **orquestra tocando uma sinfonia**:

### 🎼 **Interface (Partitura)**
- **O que é:** A partitura musical que todos seguem
- **Responsabilidade:** Define como todos devem tocar juntos
- **No código:** Contratos, tipos, interfaces TypeScript
- **Benefício:** Garante que todos "toquem na mesma música"

### 🎭 **Controller (Maestro)**  
- **O que é:** O maestro que rege a orquestra
- **Responsabilidade:** Coordena quando e como cada parte acontece
- **No código:** Lógica de negócio, fluxo de controle, decisões
- **Benefício:** Orquestra as operações de forma harmoniosa

### 🎨 **View (Músicos/Apresentação)**
- **O que é:** Os músicos que executam e o público que ouve
- **Responsabilidade:** Apresenta o resultado final
- **No código:** Componentes React, formatadores, apresentação
- **Benefício:** Entrega a experiência final ao usuário

## 📁 Estrutura Prática

Cada pasta segue este padrão:

```
📂 qualquer-funcionalidade/
├── 🎮 controller/     → "O cérebro que decide"
├── 🎨 view/          → "A cara que mostra"  
└── 🔌 interface/     → "O contrato que garante"
```

## 🍳 Exemplo Prático: Favoritos

### 🔌 **Interface - O Contrato**

**Arquivo:** `src/core/usecases/interface/IFavoriteUseCase.ts`

**O que define:**
```typescript
interface IFavoriteUseCase {
  // O que este caso de uso DEVE fazer
  toggleFavorite(recipeId: string, userId: string): Promise<FavoriteResult>;
  getFavorites(userId: string): Promise<Recipe[]>;
  isFavorite(recipeId: string, userId: string): Promise<boolean>;
}

interface FavoriteResult {
  success: boolean;
  action: 'added' | 'removed';
  message: string;
}
```

**Por que é importante:**
- Define o "contrato" que todas as implementações devem seguir
- Garante consistência entre diferentes implementações
- Facilita testes com mocks
- Documenta exatamente o que está disponível

### 🎮 **Controller - O Cérebro**

**Arquivo:** `src/core/usecases/controller/ToggleFavoriteUseCase.ts`

**O que faz:**
```typescript
class ToggleFavoriteUseCase implements IFavoriteUseCase {
  
  async toggleFavorite(recipeId: string, userId: string): Promise<FavoriteResult> {
    // 1. VALIDAR entrada
    if (!recipeId || !userId) {
      throw new Error("ID da receita e usuário são obrigatórios");
    }
    
    // 2. VERIFICAR estado atual
    const isCurrentlyFavorite = await this.isFavorite(recipeId, userId);
    
    // 3. DECIDIR ação
    if (isCurrentlyFavorite) {
      await this.removeFavorite(recipeId, userId);
      return { success: true, action: 'removed', message: 'Removido dos favoritos' };
    } else {
      await this.addFavorite(recipeId, userId);
      return { success: true, action: 'added', message: 'Adicionado aos favoritos' };
    }
  }
  
  // Métodos privados para lógica específica...
}
```

**Responsabilidades do Controller:**
- **Validar** entradas
- **Coordenar** operações
- **Aplicar** regras de negócio
- **Decidir** o que fazer em cada situação
- **Gerenciar** erros e exceções

### 🎨 **View - A Apresentação**

**Arquivo:** `src/core/usecases/view/FavoriteResultView.ts`

**O que faz:**
```typescript
class FavoriteResultView {
  
  static formatResult(result: FavoriteResult): UserFeedback {
    return {
      message: result.message,
      type: result.success ? 'success' : 'error',
      icon: result.action === 'added' ? '❤️' : '🤍',
      duration: 2000 // 2 segundos
    };
  }
  
  static formatFavoritesList(favorites: Recipe[]): FavoriteListDisplay {
    return {
      title: `Seus Favoritos (${favorites.length})`,
      items: favorites.map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        image: recipe.imageUrl,
        subtitle: `${recipe.prepTime + recipe.cookTime}min • ${recipe.difficulty}`
      })),
      emptyMessage: "Você ainda não tem receitas favoritas 😢"
    };
  }
}
```

**Responsabilidades da View:**
- **Formatar** dados para apresentação
- **Converter** dados técnicos em informação amigável
- **Preparar** estruturas para componentes UI
- **Adaptar** informações para diferentes contextos

## 🔄 Fluxo Completo CVI

### 📱 Exemplo: Usuário toca botão de favorito

```
👆 1. Usuário toca coração
    ↓
🔌 2. Interface define que ação deve existir
    ↓  
🎮 3. Controller processa a ação
   • Valida dados
   • Verifica estado atual  
   • Executa operação
   • Retorna resultado
    ↓
🎨 4. View formata resultado
   • Converte para formato amigável
   • Prepara feedback visual
   • Define duração da mensagem
    ↓
📱 5. Component React usa dados formatados
    ↓
👀 6. Usuário vê resultado (coração muda + mensagem)
```

## 🎯 Benefícios do Padrão CVI

### 🧪 **Testabilidade**
```typescript
// Testar Controller isoladamente
const controller = new ToggleFavoriteUseCase();
const result = await controller.toggleFavorite("recipe_123", "user_456");
expect(result.action).toBe('added');

// Testar View isoladamente  
const display = FavoriteResultView.formatResult(result);
expect(display.icon).toBe('❤️');
```

### 🔧 **Manutenibilidade**
- **Mudança na lógica** → Só mexe no Controller
- **Mudança visual** → Só mexe na View
- **Mudança de contrato** → Só mexe na Interface

### 👥 **Colaboração em Equipe**
- **Dev A** trabalha na lógica (Controller)
- **Dev B** trabalha na apresentação (View)
- **Dev C** define contratos (Interface)
- Todos trabalham sem conflitos!

### 📈 **Escalabilidade**
- Adicionar nova forma de apresentar → Nova View
- Mudar lógica de negócio → Novo Controller
- Manter compatibilidade → Interface não muda

## 🎨 Aplicação em Diferentes Camadas

### 🎯 **Na Camada CORE**
```
📂 core/entities/
├── 🎮 controller/    → RecipeController.ts (validações)
├── 🎨 view/         → RecipeFormatter.ts (formatação)
└── 🔌 interface/    → Recipe.ts (definição da entidade)
```

### ⚡ **Na Camada BUSINESS**
```
📂 business/services/
├── 🎮 controller/    → RecipeService.ts (orquestração)
├── 🎨 view/         → ServiceResultView.ts (apresentação)
└── 🔌 interface/    → IRecipeService.ts (contrato)
```

### 📱 **Na Camada IMPL**
```
📂 impl/screens/
├── 🎮 controller/    → HomeScreenController.ts (lógica da tela)
├── 🎨 view/         → HomeScreen.tsx (componente React)
└── 🔌 interface/    → HomeScreenTypes.ts (props e estados)
```

## 💡 Boas Práticas do CVI

### ✅ **Faça:**
- **Interface primeiro:** Defina contratos antes de implementar
- **Controller focado:** Uma responsabilidade por controller
- **View pura:** Apenas formatação, sem lógica complexa
- **Nomes claros:** Nome deve indicar exatamente o que faz

### ❌ **Evite:**
- Lógica de negócio na View
- Formatação no Controller  
- Interfaces muito genéricas ou específicas demais
- Dependências circulares entre C-V-I

### 🎯 **Padrão de Nomenclatura:**
```
📁 Controller: [Nome]Controller.ts, [Nome]Service.ts, [Nome]UseCase.ts
📁 View: [Nome]View.tsx, [Nome]Formatter.ts, [Nome]Display.ts
📁 Interface: I[Nome].ts, [Nome]Types.ts, [Nome]Props.ts
```

## 🚀 Evoluindo com CVI

### 📊 **Exemplo: Adicionar nova forma de exibir favoritos**

**Situação:** Cliente quer favoritos em formato de grid além da lista.

**Solução com CVI:**
```typescript
// ✅ Interface não muda (contrato mantido)
interface IFavoriteUseCase { /* permanece igual */ }

// ✅ Controller não muda (lógica mantida)  
class ToggleFavoriteUseCase { /* permanece igual */ }

// ✅ Apenas adicionar nova View
class FavoriteGridView {
  static formatAsGrid(favorites: Recipe[]): GridDisplay {
    // Nova formatação em grid
  }
}
```

**Resultado:** Feature adicionada sem quebrar nada existente!

O padrão CVI torna nosso código mais organizado, testável e preparado para evolução. É o foundation que permite crescimento sustentável da aplicação! 🚀