import { Ingredient } from "../../src/core/entities/interface/Ingredient";
import { Instruction } from "../../src/core/entities/interface/Instruction";
import { DifficultyLevel, Recipe } from "../../src/core/entities/interface/Recipe";


export const mockIngredients: Ingredient[] = [
  {
    id: 'ing_1',
    name: 'Farinha de trigo',
    amount: 2,
    unit: 'xícaras',
    category: 'grãos',
    isOptional: false
  },
  {
    id: 'ing_2',
    name: 'Ovos',
    amount: 3,
    unit: 'unidades',
    category: 'proteínas',
    isOptional: false
  },
  {
    id: 'ing_3',
    name: 'Leite',
    amount: 1,
    unit: 'xícara',
    category: 'laticínios',
    isOptional: false
  },
  {
    id: 'ing_4',
    name: 'Açúcar',
    amount: 0.5,
    unit: 'xícara',
    category: 'doces',
    isOptional: true
  }
];

export const mockInstructions: Instruction[] = [
  {
    step: 1,
    description: 'Misture a farinha com o açúcar em uma tigela grande',
    duration: 5,
    notes: 'Peneire a farinha para evitar grumos'
  },
  {
    step: 2,
    description: 'Adicione os ovos batidos e o leite gradualmente',
    duration: 10,
    notes: 'Misture até obter uma massa homogênea'
  },
  {
    step: 3,
    description: 'Asse em forno pré-aquecido a 180°C por 25 minutos',
    duration: 25,
    temperature: 180,
    notes: 'Teste com palito para verificar se está assado'
  }
];

export const validRecipe: Recipe = {
  id: 'recipe_test_1',
  title: 'Bolo de Baunilha Simples',
  description: 'Um delicioso bolo de baunilha fácil de fazer, perfeito para o café da tarde.',
  categoryId: 'cat_desserts',
  difficulty: 'easy' as DifficultyLevel,
  prepTime: 15,
  cookTime: 25,
  servings: 8,
  ingredients: mockIngredients,
  instructions: mockInstructions,
  nutritional: {
    calories: 285,
    protein: 6.2,
    carbs: 45.8,
    fat: 9.1,
    fiber: 1.2,
    sugar: 22.5,
    sodium: 180
  },
  tags: ['fácil', 'sobremesa', 'baunilha', 'caseiro'],
  rating: 4.7,
  reviewCount: 156,
  imageUrl: 'https://example.com/bolo-baunilha.jpg',
  author: 'Chef Maria',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-20T14:45:00Z'
};

export const invalidRecipe: Partial<Recipe> = {
  id: 'recipe_invalid',
  title: '', // Inválido - título vazio
  description: '',
  categoryId: '',
  difficulty: 'easy' as DifficultyLevel,
  prepTime: -5, // Inválido - tempo negativo
  cookTime: 30,
  servings: 0, // Inválido - zero porções
  ingredients: [], // Inválido - sem ingredientes
  instructions: [], // Inválido - sem instruções
  tags: [],
  rating: 0,
  reviewCount: 0,
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:30:00Z'
};

export const recipeWithWarnings: Recipe = {
  ...validRecipe,
  id: 'recipe_warnings',
  title: 'Receita com Avisos',
  prepTime: 200, // Warning - tempo muito longo
  cookTime: 100,
  nutritional: {
    calories: 850, // Warning - muitas calorias
    protein: 10,
    carbs: 100,
    fat: 35,
    sodium: 2500 // Warning - muito sódio
  },
  tags: ['vegetariano'], // Warning se tiver ingredientes de carne
  ingredients: [
    ...mockIngredients,
    {
      id: 'ing_exotic',
      name: 'Açafrão importado', // Info - ingrediente exótico
      amount: 1,
      unit: 'pitada',
      category: 'temperos'
    }
  ]
};

export const veganRecipe: Recipe = {
  ...validRecipe,
  id: 'recipe_vegan',
  title: 'Bolo Vegano de Chocolate',
  tags: ['vegano', 'vegetariano', 'chocolate'],
  ingredients: [
    {
      id: 'ing_flour',
      name: 'Farinha de trigo',
      amount: 2,
      unit: 'xícaras',
      category: 'grãos'
    },
    {
      id: 'ing_cocoa',
      name: 'Cacau em pó',
      amount: 0.5,
      unit: 'xícara',
      category: 'doces'
    },
    {
      id: 'ing_plant_milk',
      name: 'Leite de amêndoas',
      amount: 1,
      unit: 'xícara',
      category: 'vegetais'
    }
  ]
};

// Factory para criar receitas de teste
export const RecipeFactory = {
  createValid: (overrides: Partial<Recipe> = {}): Recipe => ({
    ...validRecipe,
    ...overrides,
    id: `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }),
  
  createInvalid: (overrides: Partial<Recipe> = {}): Partial<Recipe> => ({
    ...invalidRecipe,
    ...overrides
  }),
  
  createWithWarnings: (overrides: Partial<Recipe> = {}): Recipe => ({
    ...recipeWithWarnings,
    ...overrides,
    id: `recipe_warn_${Date.now()}`
  }),
  
  createBatch: (count: number): Recipe[] => {
    return Array.from({ length: count }, (_, index) =>
      RecipeFactory.createValid({ 
        title: `Receita de Teste ${index + 1}`,
        rating: Math.random() * 5
      })
    );
  }
};