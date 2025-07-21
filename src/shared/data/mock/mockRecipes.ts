/**
 * 🍳 Mock Recipes Data
 * 
 * Sample recipe data for development and testing.
 * Includes realistic Brazilian recipes with complete ingredient lists and instructions.
 */

import { 
  Recipe, 
  DifficultyLevel, 
  MealType, 
  DietaryType, 
  CookingMethod, 
  MeasurementUnit 
} from '../../types/recipe.types';

/**
 * 🍳 Mock Recipes Array
 */
export const mockRecipes: Recipe[] = [
  {
    id: 'recipe_1',
    title: 'Brigadeiro Tradicional',
    description: 'O clássico doce brasileiro que conquista corações. Cremoso, doce e perfeito para qualquer ocasião especial.',
    imageUrl: 'https://picsum.photos/400/300?random=1',
    images: [
      {
        id: 'img_1',
        uri: 'https://picsum.photos/400/300?random=1',
        width: 400,
        height: 300,
        alt: 'Brigadeiros enrolados em chocolate granulado',
      },
    ],
    
    ingredients: [
      {
        id: 'ing_1',
        name: 'Leite condensado',
        amount: 1,
        unit: MeasurementUnit.CAN,
        notes: '395g',
      },
      {
        id: 'ing_2',
        name: 'Chocolate em pó',
        amount: 3,
        unit: MeasurementUnit.COLHER_SOPA,
        notes: 'achocolatado em pó',
      },
      {
        id: 'ing_3',
        name: 'Manteiga',
        amount: 1,
        unit: MeasurementUnit.COLHER_SOPA,
      },
      {
        id: 'ing_4',
        name: 'Chocolate granulado',
        amount: 200,
        unit: MeasurementUnit.G,
        notes: 'para enrolar',
      },
    ],
    
    instructions: [
      {
        id: 'inst_1',
        stepNumber: 1,
        description: 'Em uma panela antiaderente, misture o leite condensado, o chocolate em pó e a manteiga.',
      },
      {
        id: 'inst_2',
        stepNumber: 2,
        description: 'Leve ao fogo médio, mexendo sempre com uma colher de pau.',
        timer: 15,
      },
      {
        id: 'inst_3',
        stepNumber: 3,
        description: 'Cozinhe até que o brigadeiro desgrude do fundo da panela (cerca de 10-15 minutos).',
        timer: 15,
        tips: ['O ponto está certo quando você inclina a panela e o brigadeiro escorrega devagar'],
      },
      {
        id: 'inst_4',
        stepNumber: 4,
        description: 'Transfira para um prato untado com manteiga e deixe esfriar completamente.',
        timer: 60,
      },
      {
        id: 'inst_5',
        stepNumber: 5,
        description: 'Com as mãos untadas, faça bolinhas e passe no chocolate granulado.',
        notes: 'Unte bem as mãos com manteiga para não grudar',
      },
    ],
    
    servings: 30,
    difficulty: DifficultyLevel.EASY,
    
    timing: {
      prepTime: 5,
      cookTime: 15,
      totalTime: 80,
      restTime: 60,
    },
    
    categoryId: 'category_1',
    mealTypes: [MealType.DESSERT],
    cookingMethods: [CookingMethod.BOILING],
    dietaryTypes: [],
    
    tags: [
      { id: 'tag_1', name: 'doces' },
      { id: 'tag_2', name: 'festa' },
      { id: 'tag_3', name: 'brasileiro' },
      { id: 'tag_4', name: 'fácil' },
    ],
    
    cuisine: 'Brasileira',
    
    nutrition: {
      calories: 89,
      protein: 1.2,
      carbs: 16.8,
      fat: 2.1,
      sugar: 15.2,
      sodium: 15,
    },
    
    author: {
      id: 'user_1',
      name: 'Ana Silva',
      avatar: 'https://picsum.photos/100/100?random=1',
      verified: true,
    },
    
    stats: {
      views: 15420,
      favorites: 892,
      timesCooked: 1205,
      averageRating: 4.8,
      totalRatings: 324,
      shares: 156,
    },
    
    ratings: [],
    
    source: {
      type: 'user_created',
      name: 'RecipeApp',
    },
    
    isPublic: true,
    isVerified: true,
    isFeatured: true,
    status: 'published',
    
    language: 'pt-BR',
    searchKeywords: ['brigadeiro', 'doce', 'chocolate', 'festa', 'brasileiro'],
    equipment: ['panela antiaderente', 'colher de pau'],
    
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },

  {
    id: 'recipe_2',
    title: 'Feijão Tropeiro',
    description: 'Prato típico mineiro cheio de sabor, com feijão, bacon, linguiça e farinha de mandioca. Uma explosão de sabores regionais.',
    imageUrl: 'https://picsum.photos/400/300?random=2',
    images: [
      {
        id: 'img_2',
        uri: 'https://picsum.photos/400/300?random=2',
        width: 400,
        height: 300,
        alt: 'Feijão tropeiro servido em panela de barro',
      },
    ],
    
    ingredients: [
      {
        id: 'ing_5',
        name: 'Feijão carioca',
        amount: 500,
        unit: MeasurementUnit.G,
        notes: 'cozido e escorrido',
      },
      {
        id: 'ing_6',
        name: 'Bacon',
        amount: 200,
        unit: MeasurementUnit.G,
        notes: 'cortado em cubos',
      },
      {
        id: 'ing_7',
        name: 'Linguiça calabresa',
        amount: 200,
        unit: MeasurementUnit.G,
        notes: 'cortada em rodelas',
      },
      {
        id: 'ing_8',
        name: 'Farinha de mandioca',
        amount: 2,
        unit: MeasurementUnit.XICARA,
      },
      {
        id: 'ing_9',
        name: 'Cebola',
        amount: 2,
        unit: MeasurementUnit.UNIT,
        notes: 'picadas',
      },
      {
        id: 'ing_10',
        name: 'Alho',
        amount: 4,
        unit: MeasurementUnit.CLOVE,
        notes: 'picados',
      },
      {
        id: 'ing_11',
        name: 'Ovos',
        amount: 4,
        unit: MeasurementUnit.UNIT,
      },
      {
        id: 'ing_12',
        name: 'Couve',
        amount: 1,
        unit: MeasurementUnit.BUNCH,
        notes: 'picada finamente',
      },
    ],
    
    instructions: [
      {
        id: 'inst_6',
        stepNumber: 1,
        description: 'Em uma panela grande, frite o bacon até dourar e liberar a gordura.',
        timer: 8,
      },
      {
        id: 'inst_7',
        stepNumber: 2,
        description: 'Adicione a linguiça e refogue até dourar. Reserve as carnes.',
        timer: 5,
      },
      {
        id: 'inst_8',
        stepNumber: 3,
        description: 'Na mesma panela, refogue a cebola e o alho até ficarem transparentes.',
        timer: 5,
      },
      {
        id: 'inst_9',
        stepNumber: 4,
        description: 'Adicione o feijão cozido e misture bem. Tempere com sal e pimenta.',
        timer: 3,
      },
      {
        id: 'inst_10',
        stepNumber: 5,
        description: 'Volte as carnes para a panela e misture.',
      },
      {
        id: 'inst_11',
        stepNumber: 6,
        description: 'Bata os ovos e adicione à mistura, mexendo rapidamente para não empelotar.',
        timer: 2,
      },
      {
        id: 'inst_12',
        stepNumber: 7,
        description: 'Adicione a farinha de mandioca aos poucos, mexendo sempre.',
      },
      {
        id: 'inst_13',
        stepNumber: 8,
        description: 'Por último, adicione a couve picada e refogue rapidamente.',
        timer: 2,
      },
    ],
    
    servings: 6,
    difficulty: DifficultyLevel.MEDIUM,
    
    timing: {
      prepTime: 20,
      cookTime: 25,
      totalTime: 45,
    },
    
    categoryId: 'category_2',
    mealTypes: [MealType.LUNCH, MealType.DINNER],
    cookingMethods: [CookingMethod.SAUTEING, CookingMethod.FRYING],
    dietaryTypes: [DietaryType.HIGH_PROTEIN],
    
    tags: [
      { id: 'tag_5', name: 'mineiro' },
      { id: 'tag_6', name: 'tradicional' },
      { id: 'tag_7', name: 'proteína' },
      { id: 'tag_8', name: 'almoço' },
    ],
    
    cuisine: 'Mineira',
    
    nutrition: {
      calories: 485,
      protein: 24.5,
      carbs: 38.2,
      fat: 25.8,
      fiber: 12.3,
      sodium: 890,
    },
    
    author: {
      id: 'user_2',
      name: 'Carlos Oliveira',
      avatar: 'https://picsum.photos/100/100?random=2',
      verified: true,
    },
    
    stats: {
      views: 8934,
      favorites: 445,
      timesCooked: 623,
      averageRating: 4.6,
      totalRatings: 189,
      shares: 89,
    },
    
    ratings: [],
    
    source: {
      type: 'user_created',
      name: 'RecipeApp',
    },
    
    isPublic: true,
    isVerified: true,
    isFeatured: false,
    status: 'published',
    
    language: 'pt-BR',
    searchKeywords: ['feijão', 'tropeiro', 'mineiro', 'bacon', 'linguiça'],
    equipment: ['panela grande', 'tábua de corte', 'faca'],
    
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
  },

  {
    id: 'recipe_3',
    title: 'Salada Caesar Vegana',
    description: 'Versão plant-based da clássica salada caesar, com molho cremoso de castanha de caju e croutons crocantes.',
    imageUrl: 'https://picsum.photos/400/300?random=3',
    images: [
      {
        id: 'img_3',
        uri: 'https://picsum.photos/400/300?random=3',
        width: 400,
        height: 300,
        alt: 'Salada caesar vegana com croutons',
      },
    ],
    
    ingredients: [
      {
        id: 'ing_13',
        name: 'Alface romana',
        amount: 2,
        unit: MeasurementUnit.UNIT,
        notes: 'lavada e picada',
      },
      {
        id: 'ing_14',
        name: 'Castanha de caju',
        amount: 100,
        unit: MeasurementUnit.G,
        notes: 'crua, deixada de molho por 2 horas',
      },
      {
        id: 'ing_15',
        name: 'Suco de limão',
        amount: 3,
        unit: MeasurementUnit.COLHER_SOPA,
      },
      {
        id: 'ing_16',
        name: 'Azeite de oliva',
        amount: 4,
        unit: MeasurementUnit.COLHER_SOPA,
      },
      {
        id: 'ing_17',
        name: 'Mostarda dijon',
        amount: 1,
        unit: MeasurementUnit.COLHER_CHA,
      },
      {
        id: 'ing_18',
        name: 'Alho',
        amount: 2,
        unit: MeasurementUnit.CLOVE,
      },
      {
        id: 'ing_19',
        name: 'Fermento nutricional',
        amount: 2,
        unit: MeasurementUnit.COLHER_SOPA,
      },
      {
        id: 'ing_20',
        name: 'Pão integral',
        amount: 4,
        unit: MeasurementUnit.SLICE,
        notes: 'para os croutons',
      },
    ],
    
    instructions: [
      {
        id: 'inst_14',
        stepNumber: 1,
        description: 'Deixe as castanhas de molho em água por 2 horas. Escorra e enxágue.',
        timer: 120,
      },
      {
        id: 'inst_15',
        stepNumber: 2,
        description: 'Corte o pão em cubos e torre no forno a 180°C por 10 minutos até ficarem dourados.',
        timer: 10,
        temperature: {
          value: 180,
          unit: 'celsius',
          description: 'forno pré-aquecido',
        },
      },
      {
        id: 'inst_16',
        stepNumber: 3,
        description: 'No liquidificador, bata as castanhas, limão, azeite, mostarda, alho e 1/4 xícara de água.',
      },
      {
        id: 'inst_17',
        stepNumber: 4,
        description: 'Adicione o fermento nutricional, sal e pimenta a gosto. Bata até obter um molho cremoso.',
      },
      {
        id: 'inst_18',
        stepNumber: 5,
        description: 'Em uma tigela grande, misture a alface com o molho.',
      },
      {
        id: 'inst_19',
        stepNumber: 6,
        description: 'Finalize com os croutons por cima e sirva imediatamente.',
      },
    ],
    
    servings: 4,
    difficulty: DifficultyLevel.EASY,
    
    timing: {
      prepTime: 15,
      cookTime: 10,
      totalTime: 145,
      restTime: 120,
    },
    
    categoryId: 'category_3',
    mealTypes: [MealType.LUNCH, MealType.DINNER],
    cookingMethods: [CookingMethod.BAKING, CookingMethod.NO_COOK],
    dietaryTypes: [DietaryType.VEGAN, DietaryType.VEGETARIAN],
    
    tags: [
      { id: 'tag_9', name: 'vegano' },
      { id: 'tag_10', name: 'saudável' },
      { id: 'tag_11', name: 'salada' },
      { id: 'tag_12', name: 'leve' },
    ],
    
    cuisine: 'Internacional',
    
    nutrition: {
      calories: 245,
      protein: 8.2,
      carbs: 18.5,
      fat: 16.8,
      fiber: 4.2,
      sodium: 320,
    },
    
    author: {
      id: 'user_4',
      name: 'João Costa',
      avatar: 'https://picsum.photos/100/100?random=4',
      verified: false,
    },
    
    stats: {
      views: 5678,
      favorites: 234,
      timesCooked: 345,
      averageRating: 4.3,
      totalRatings: 78,
      shares: 45,
    },
    
    ratings: [],
    
    source: {
      type: 'user_created',
      name: 'RecipeApp',
    },
    
    isPublic: true,
    isVerified: false,
    isFeatured: false,
    status: 'published',
    
    language: 'pt-BR',
    searchKeywords: ['salada', 'caesar', 'vegana', 'saudável', 'castanha'],
    equipment: ['liquidificador', 'forno', 'tigela grande'],
    
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
  },

  {
    id: 'recipe_4',
    title: 'Risotto de Camarão',
    description: 'Cremoso risotto italiano com camarões frescos, vinho branco e temperos especiais. Elegante e saboroso.',
    imageUrl: 'https://picsum.photos/400/300?random=4',
    images: [
      {
        id: 'img_4',
        uri: 'https://picsum.photos/400/300?random=4',
        width: 400,
        height: 300,
        alt: 'Risotto de camarão cremoso',
      },
    ],
    
    ingredients: [
      {
        id: 'ing_21',
        name: 'Arroz arbóreo',
        amount: 300,
        unit: MeasurementUnit.G,
      },
      {
        id: 'ing_22',
        name: 'Camarão',
        amount: 500,
        unit: MeasurementUnit.G,
        notes: 'limpos e descascados',
      },
      {
        id: 'ing_23',
        name: 'Caldo de camarão',
        amount: 1,
        unit: MeasurementUnit.L,
        notes: 'quente',
      },
      {
        id: 'ing_24',
        name: 'Vinho branco seco',
        amount: 150,
        unit: MeasurementUnit.ML,
      },
      {
        id: 'ing_25',
        name: 'Cebola',
        amount: 1,
        unit: MeasurementUnit.UNIT,
        notes: 'picada finamente',
      },
      {
        id: 'ing_26',
        name: 'Alho',
        amount: 3,
        unit: MeasurementUnit.CLOVE,
        notes: 'picados',
      },
      {
        id: 'ing_27',
        name: 'Manteiga',
        amount: 50,
        unit: MeasurementUnit.G,
      },
      {
        id: 'ing_28',
        name: 'Parmesão ralado',
        amount: 100,
        unit: MeasurementUnit.G,
      },
      {
        id: 'ing_29',
        name: 'Azeite de oliva',
        amount: 3,
        unit: MeasurementUnit.COLHER_SOPA,
      },
    ],
    
    instructions: [
      {
        id: 'inst_20',
        stepNumber: 1,
        description: 'Mantenha o caldo de camarão aquecido em fogo baixo.',
      },
      {
        id: 'inst_21',
        stepNumber: 2,
        description: 'Em uma panela grande, aqueça o azeite e refogue a cebola até ficar transparente.',
        timer: 5,
      },
      {
        id: 'inst_22',
        stepNumber: 3,
        description: 'Adicione o alho e refogue por mais 1 minuto.',
        timer: 1,
      },
      {
        id: 'inst_23',
        stepNumber: 4,
        description: 'Acrescente o arroz e mexa por 2 minutos até os grãos ficarem translúcidos.',
        timer: 2,
      },
      {
        id: 'inst_24',
        stepNumber: 5,
        description: 'Adicione o vinho branco e mexa até secar quase completamente.',
        timer: 3,
      },
      {
        id: 'inst_25',
        stepNumber: 6,
        description: 'Comece a adicionar o caldo quente, uma concha por vez, mexendo sempre.',
        timer: 18,
        notes: 'Continue até o arroz ficar al dente (cerca de 18 minutos)',
      },
      {
        id: 'inst_26',
        stepNumber: 7,
        description: 'Nos últimos 5 minutos, adicione os camarões.',
        timer: 5,
      },
      {
        id: 'inst_27',
        stepNumber: 8,
        description: 'Retire do fogo, adicione manteiga e parmesão. Misture bem e sirva.',
      },
    ],
    
    servings: 4,
    difficulty: DifficultyLevel.HARD,
    
    timing: {
      prepTime: 15,
      cookTime: 35,
      totalTime: 50,
    },
    
    categoryId: 'category_2',
    mealTypes: [MealType.LUNCH, MealType.DINNER],
    cookingMethods: [CookingMethod.SAUTEING, CookingMethod.BOILING],
    dietaryTypes: [],
    
    tags: [
      { id: 'tag_13', name: 'italiano' },
      { id: 'tag_14', name: 'sofisticado' },
      { id: 'tag_15', name: 'camarão' },
      { id: 'tag_16', name: 'risotto' },
    ],
    
    cuisine: 'Italiana',
    
    nutrition: {
      calories: 425,
      protein: 28.5,
      carbs: 45.2,
      fat: 14.8,
      sodium: 780,
    },
    
    author: {
      id: 'user_2',
      name: 'Carlos Oliveira',
      avatar: 'https://picsum.photos/100/100?random=2',
      verified: true,
    },
    
    stats: {
      views: 12354,
      favorites: 678,
      timesCooked: 234,
      averageRating: 4.7,
      totalRatings: 156,
      shares: 89,
    },
    
    ratings: [],
    
    source: {
      type: 'user_created',
      name: 'RecipeApp',
    },
    
    isPublic: true,
    isVerified: true,
    isFeatured: true,
    status: 'published',
    
    language: 'pt-BR',
    searchKeywords: ['risotto', 'camarão', 'italiano', 'cremoso', 'arbóreo'],
    equipment: ['panela grande', 'concha', 'ralador'],
    
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },

  {
    id: 'recipe_5',
    title: 'Smoothie Verde Detox',
    description: 'Smoothie nutritivo e refrescante com espinafre, banana, maçã verde e gengibre. Perfeito para começar o dia.',
    imageUrl: 'https://picsum.photos/400/300?random=5',
    images: [
      {
        id: 'img_5',
        uri: 'https://picsum.photos/400/300?random=5',
        width: 400,
        height: 300,
        alt: 'Smoothie verde em copo de vidro',
      },
    ],
    
    ingredients: [
      {
        id: 'ing_30',
        name: 'Espinafre',
        amount: 2,
        unit: MeasurementUnit.XICARA,
        notes: 'lavado',
      },
      {
        id: 'ing_31',
        name: 'Banana',
        amount: 1,
        unit: MeasurementUnit.UNIT,
        notes: 'madura',
      },
      {
        id: 'ing_32',
        name: 'Maçã verde',
        amount: 1,
        unit: MeasurementUnit.UNIT,
        notes: 'descascada',
      },
      {
        id: 'ing_33',
        name: 'Gengibre',
        amount: 1,
        unit: MeasurementUnit.COLHER_CHA,
        notes: 'ralado',
      },
      {
        id: 'ing_34',
        name: 'Água de coco',
        amount: 200,
        unit: MeasurementUnit.ML,
      },
      {
        id: 'ing_35',
        name: 'Suco de limão',
        amount: 1,
        unit: MeasurementUnit.COLHER_SOPA,
      },
      {
        id: 'ing_36',
        name: 'Mel',
        amount: 1,
        unit: MeasurementUnit.COLHER_CHA,
        isOptional: true,
      },
    ],
    
    instructions: [
      {
        id: 'inst_28',
        stepNumber: 1,
        description: 'Lave bem o espinafre e escorra.',
      },
      {
        id: 'inst_29',
        stepNumber: 2,
        description: 'Descasque e corte a banana e a maçã em pedaços.',
      },
      {
        id: 'inst_30',
        stepNumber: 3,
        description: 'Rale o gengibre finamente.',
      },
      {
        id: 'inst_31',
        stepNumber: 4,
        description: 'No liquidificador, adicione primeiro a água de coco.',
      },
      {
        id: 'inst_32',
        stepNumber: 5,
        description: 'Acrescente o espinafre, banana, maçã e gengibre.',
      },
      {
        id: 'inst_33',
        stepNumber: 6,
        description: 'Adicione o suco de limão e mel (se desejar).',
      },
      {
        id: 'inst_34',
        stepNumber: 7,
        description: 'Bata tudo até obter uma mistura homogênea e cremosa.',
        timer: 2,
      },
      {
        id: 'inst_35',
        stepNumber: 8,
        description: 'Sirva imediatamente em copos gelados.',
      },
    ],
    
    servings: 2,
    difficulty: DifficultyLevel.EASY,
    
    timing: {
      prepTime: 10,
      cookTime: 0,
      totalTime: 10,
    },
    
    categoryId: 'category_4',
    mealTypes: [MealType.BREAKFAST, MealType.SNACK],
    cookingMethods: [CookingMethod.NO_COOK],
    dietaryTypes: [DietaryType.VEGAN, DietaryType.VEGETARIAN, DietaryType.GLUTEN_FREE],
    
    tags: [
      { id: 'tag_17', name: 'detox' },
      { id: 'tag_18', name: 'saudável' },
      { id: 'tag_19', name: 'verde' },
      { id: 'tag_20', name: 'rápido' },
    ],
    
    cuisine: 'Internacional',
    
    nutrition: {
      calories: 95,
      protein: 2.8,
      carbs: 22.4,
      fat: 0.8,
      fiber: 4.2,
      sugar: 17.6,
      vitaminC: 45,
      iron: 2.1,
    },
    
    author: {
      id: 'user_3',
      name: 'Maria Santos',
      avatar: 'https://picsum.photos/100/100?random=3',
      verified: false,
    },
    
    stats: {
      views: 7892,
      favorites: 567,
      timesCooked: 892,
      averageRating: 4.4,
      totalRatings: 234,
      shares: 123,
    },
    
    ratings: [],
    
    source: {
      type: 'user_created',
      name: 'RecipeApp',
    },
    
    isPublic: true,
    isVerified: false,
    isFeatured: false,
    status: 'published',
    
    language: 'pt-BR',
    searchKeywords: ['smoothie', 'verde', 'detox', 'saudável', 'vitamina'],
    equipment: ['liquidificador', 'ralador'],
    
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
  },
];

/**
 * 🔍 Helper functions for mock recipes
 */
export const getRecipeById = (id: string): Recipe | undefined => {
  return mockRecipes.find(recipe => recipe.id === id);
};

export const getRecipesByCategory = (categoryId: string): Recipe[] => {
  return mockRecipes.filter(recipe => recipe.categoryId === categoryId);
};

export const getFeaturedRecipes = (): Recipe[] => {
  return mockRecipes.filter(recipe => recipe.isFeatured);
};

export const getPopularRecipes = (limit: number = 5): Recipe[] => {
  return [...mockRecipes]
    .sort((a, b) => b.stats.favorites - a.stats.favorites)
    .slice(0, limit);
};

export const getRecipesByDifficulty = (difficulty: DifficultyLevel): Recipe[] => {
  return mockRecipes.filter(recipe => recipe.difficulty === difficulty);
};

export const getRecipesByMealType = (mealType: MealType): Recipe[] => {
  return mockRecipes.filter(recipe => recipe.mealTypes.includes(mealType));
};

export const getVeganRecipes = (): Recipe[] => {
  return mockRecipes.filter(recipe => 
    recipe.dietaryTypes.includes(DietaryType.VEGAN)
  );
};

export const getQuickRecipes = (maxTimeMinutes: number = 30): Recipe[] => {
  return mockRecipes.filter(recipe => recipe.timing.totalTime <= maxTimeMinutes);
};

export default mockRecipes;