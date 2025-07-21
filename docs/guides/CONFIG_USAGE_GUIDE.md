# Criar guia didático de uso das configurações
echo "📚 Criando guia didático completo de uso das configurações..."

# Navegar para o diretório de documentação
cd react-native-course/RecipeApp

# Criar o guia principal
cat > docs/guides/CONFIG_USAGE_GUIDE.md << 'EOF'
# 📚 Guia Didático - Como Usar as Configurações do RecipeApp

## 🎯 O que são as Configurações?

Imagine as **configurações** como o **manual de instruções** da sua casa. Elas definem:
- 🏠 **Como a casa funciona** (environment)
- 🎨 **Como a casa parece** (theme)  
- 🚪 **Como navegar pela casa** (navigation)
- 📦 **Onde guardar as coisas** (storage)

## 🗺️ Mapa das Configurações

```
🏠 Sua Aplicação RecipeApp
├── 🌍 environment.ts  → "As regras da casa"
├── 🎨 theme.ts        → "A decoração da casa"
├── 🧭 navigation.ts   → "Os caminhos da casa"
├── 💾 storage.ts      → "Os armários da casa"
└── 📋 index.ts        → "O catálogo completo"
```

---

## 🌍 Environment - As Regras da Casa

### 🤔 **O que faz?**
Define **como sua app se comporta** em diferentes situações. É como ter regras diferentes para:
- 🏗️ **Construção** (development) → Tudo liberado para testar
- 🧪 **Reforma** (staging) → Algumas limitações para validar
- 🏡 **Morando** (production) → Regras finais para usuários

### 💡 **Quando usar?**

#### **1. Verificar se estou testando ou na versão final**
```typescript
import { isDevelopment } from '@/config';

// Mostrar botões de teste apenas durante desenvolvimento
if (isDevelopment()) {
  // Mostrar menu de debug, logs detalhados, etc.
}
```

#### **2. Ligar/desligar funcionalidades**
```typescript
import { isFeatureEnabled } from '@/config';

// Verificar se posso mostrar avaliações
const canShowRatings = isFeatureEnabled('ENABLE_RECIPE_RATING');
```

**Analogia:** É como ter um interruptor para cada cômodo da casa. Você pode ligar a luz da sala, mas deixar o quarto escuro enquanto arruma.

### 📋 **Features Principais:**
- ✅ **ENABLE_ANALYTICS** → Rastrear uso do app
- ✅ **ENABLE_OFFLINE_MODE** → Funcionar sem internet
- ✅ **ENABLE_PUSH_NOTIFICATIONS** → Enviar notificações
- ✅ **ENABLE_AI_RECOMMENDATIONS** → Sugestões inteligentes

---

## 🎨 Theme - A Decoração da Casa

### 🤔 **O que faz?**
Define **como sua app parece visualmente**. É o seu **catálogo de decoração** com cores, fontes, tamanhos e estilos.

### 💡 **Quando usar?**

#### **1. Escolher cores padronizadas**
```typescript
import { Colors } from '@/config';

// Usar cores consistentes em toda a app
backgroundColor: Colors.primary[500]    // Dourado principal
color: Colors.text.primary             // Texto principal
borderColor: Colors.border.light       // Borda clara
```

**Analogia:** Em vez de ir na loja escolher tinta toda vez, você já tem uma **paleta de cores aprovada** para usar em qualquer cômodo.

#### **2. Aplicar tipografia consistente**
```typescript
import { Typography } from '@/config';

// Usar estilos de texto padronizados
style: Typography.styles.h1            // Título grande
style: Typography.styles.body          // Texto normal
style: Typography.styles.caption       // Texto pequeno
```

#### **3. Usar espaçamentos harmoniosos**
```typescript
import { Spacing } from '@/config';

// Espaçamentos consistentes
marginTop: Spacing.md                  // 16px
padding: Spacing.lg                    // 24px
gap: Spacing.sm                        // 8px
```

### 🌈 **Paleta de Cores Explicada:**
- 🟡 **Primary (Dourado)** → Botões principais, destaques
- 🟢 **Secondary (Verde)** → Ações secundárias, sucesso
- 🔴 **Accent (Vermelho/Laranja)** → Alertas, favoritos
- ⚫ **Neutral (Cinza)** → Textos, bordas, fundos

**Dica:** Use primary para ações importantes (salvar, favoritar), secondary para ações de apoio (cancelar, voltar).

---

## 🧭 Navigation - Os Caminhos da Casa

### 🤔 **O que faz?**
Define **como o usuário navega** pela sua app. É como ter **placas de sinalização** em cada cômodo.

### 💡 **Quando usar?**

#### **1. Navegar entre telas**
```typescript
import { SCREEN_NAMES } from '@/config';

// Ir para tela de detalhes da receita
navigation.navigate(SCREEN_NAMES.RECIPE_DETAIL, { 
  recipeId: '123' 
});
```

**Analogia:** Em vez de decorar "vá para a cozinha", você usa uma placa universal que sempre aponta para o mesmo lugar.

#### **2. Configurar abas do menu**
```typescript
import { TAB_NAMES, TAB_LABELS } from '@/config';

// Os nomes das abas já estão definidos
Home → "Início"
Search → "Buscar"  
Categories → "Categorias"
Favorites → "Favoritos"
Profile → "Perfil"
```

#### **3. Definir títulos das telas**
```typescript
import { SCREEN_TITLES } from '@/config';

// Título automático baseado na tela
const title = SCREEN_TITLES[SCREEN_NAMES.RECIPE_DETAIL]; // "Receita"
```

### 🗺️ **Estrutura de Navegação:**
```
📱 App Principal
├── 🏠 Início → Lista de receitas em destaque
├── 🔍 Buscar → Procurar receitas específicas
├── 📂 Categorias → Receitas organizadas por tipo
├── ❤️ Favoritos → Receitas que o usuário salvou
└── 👤 Perfil → Dados do usuário e configurações
```

**Dica:** Use links diretos como `recipeapp://recipe/123` para levar usuários direto para uma receita específica.

---

## 💾 Storage - Os Armários da Casa

### 🤔 **O que faz?**
Define **onde e como guardar informações** no celular do usuário. É como ter **diferentes tipos de armários** para diferentes coisas.

### 💡 **Quando usar?**

#### **1. Salvar favoritos do usuário**
```typescript
import { STORAGE_KEYS } from '@/config';

// Chave organizada para favoritos
const favoritesKey = STORAGE_KEYS.USER.FAVORITES;
```

#### **2. Cache de receitas (para funcionar offline)**
```typescript
import { STORAGE_KEYS, CACHE_CONFIG } from '@/config';

// Salvar receitas por 24 horas
const recipesKey = STORAGE_KEYS.RECIPES.CACHE;
const duration = CACHE_CONFIG.TTL.RECIPES; // 24 horas
```

**Analogia:** É como ter armários específicos:
- 🗄️ **Arquivo pessoal** → Favoritos, perfil, preferências
- 📚 **Biblioteca** → Receitas em cache para acesso rápido
- 🗃️ **Arquivo temporário** → Buscas recentes, resultados

### 🏠 **Organização do Storage:**
```
💾 Storage do RecipeApp
├── 👤 USER → Dados pessoais (favoritos, perfil, preferências)
├── 🍳 RECIPES → Cache de receitas (offline, personalizadas)
├── 📂 CATEGORIES → Cache de categorias
├── 🔍 SEARCH → Histórico e filtros de busca
├── 📱 APP → Configurações do app (tema, idioma)
└── 🔐 AUTH → Dados de autenticação (se necessário)
```

### ⏰ **Duração do Cache:**
- 📚 **Receitas** → 24 horas (atualiza diariamente)
- 📂 **Categorias** → 7 dias (raramente mudam)
- 🔍 **Buscas** → 30 minutos (resultados ficam relevantes)
- 👤 **Perfil** → 1 hora (sincroniza dados do usuário)

---

## 📋 Como Usar Tudo Junto

### 🚀 **Importação Simples**
```typescript
// Importar tudo de uma vez
import { 
  CONFIG,           // Configurações de ambiente
  Colors,           // Paleta de cores
  SCREEN_NAMES,     // Nomes das telas
  STORAGE_KEYS      // Chaves de armazenamento
} from '@/config';
```

### 🎯 **Exemplo Prático: Componente de Receita**

```typescript
import { Colors, Typography, isFeatureEnabled } from '@/config';

const RecipeCard = ({ recipe }) => {
  // 1. Usar cores do tema
  const cardStyle = {
    backgroundColor: Colors.background.paper,
    borderRadius: 12,
    padding: 16,
  };
  
  // 2. Usar tipografia padronizada  
  const titleStyle = Typography.styles.h3;
  const descriptionStyle = Typography.styles.body;
  
  // 3. Verificar feature flag
  const showRating = isFeatureEnabled('ENABLE_RECIPE_RATING');
  
  return (
    <View style={cardStyle}>
      <Text style={titleStyle}>{recipe.title}</Text>
      <Text style={descriptionStyle}>{recipe.description}</Text>
      {showRating && <RatingStars rating={recipe.rating} />}
    </View>
  );
};
```

## 💡 Dicas Importantes

### ✅ **Boas Práticas:**

1. **Sempre use as configurações** em vez de valores fixos
2. **Importe do index.ts** para ter tudo centralizado
3. **Verifique feature flags** antes de mostrar funcionalidades
4. **Use cores e espaçamentos do tema** para consistência
5. **Organize storage** com as chaves pré-definidas

### ❌ **Evite:**

1. **Cores hardcoded** → Use `Colors.primary[500]` em vez de `'#FFC107'`
2. **Nomes de tela diretos** → Use `SCREEN_NAMES.HOME` em vez de `'Home'`
3. **Chaves de storage inventadas** → Use `STORAGE_KEYS.USER.FAVORITES`
4. **Espaçamentos aleatórios** → Use `Spacing.md` em vez de `16`

## 🎓 Resumo - Quando Usar Cada Config

### 🌍 **Environment**
- ✅ Verificar se está em desenvolvimento
- ✅ Ligar/desligar funcionalidades
- ✅ Configurar APIs diferentes por ambiente
- ✅ Mostrar/esconder ferramentas de debug

### 🎨 **Theme**  
- ✅ Escolher cores para componentes
- ✅ Definir tamanhos de fonte
- ✅ Aplicar espaçamentos consistentes
- ✅ Usar sombras e bordas padronizadas

### 🧭 **Navigation**
- ✅ Navegar entre telas
- ✅ Configurar deep links
- ✅ Definir títulos e ícones
- ✅ Organizar estrutura de navegação

### 💾 **Storage**
- ✅ Salvar dados do usuário
- ✅ Cache de receitas para offline
- ✅ Armazenar preferências
- ✅ Gerenciar limpeza automática

## 🚀 Próximos Passos

1. **Explore cada arquivo** para entender todas as opções
2. **Personalize as cores** conforme sua marca
3. **Ajuste feature flags** para suas necessidades
4. **Configure URLs de API** para seus ambientes
5. **Teste a navegação** e ajuste conforme necessário