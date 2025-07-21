/**
 * 📂 Mock Categories Data
 * 
 * Sample category data for development and testing.
 * Includes realistic Brazilian cuisine categories with hierarchy.
 */

import { Category } from '../../types/category.types';
import { MealType, DietaryType } from '../../types/recipe.types';

/**
 * 📂 Mock Categories Array
 */
export const mockCategories: Category[] = [
  {
    id: 'category_1',
    name: 'Sobremesas',
    description: 'Deliciosas sobremesas para adoçar o seu dia, desde doces tradicionais brasileiros até sobremesas internacionais.',
    slug: 'sobremesas',
    
    imageUrl: 'https://picsum.photos/300/200?random=10',
    iconName: 'cake',
    color: '#E91E63',
    
    parentId: undefined,
    level: 0,
    path: 'sobremesas',
    
    isActive: true,
    isVisible: true,
    isFeatured: true,
    
    sortOrder: 1,
    priority: 10,
    
    recipeCount: 45,
    activeRecipeCount: 42,
    
    tags: ['doces', 'sobremesas', 'festa'],
    keywords: ['sobremesa', 'doce', 'bolo', 'torta', 'pudim', 'brigadeiro'],
    
    mealTypes: [MealType.DESSERT],
    dietaryTypes: [],
    cookingMethods: [],
    
    translations: [],
    
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
  },

  {
    id: 'category_2',
    name: 'Pratos Principais',
    description: 'Receitas substanciosas para o almoço e jantar, incluindo carnes, massas, risotos e pratos vegetarianos.',
    slug: 'pratos-principais',
    
    imageUrl: 'https://picsum.photos/300/200?random=11',
    iconName: 'restaurant',
    color: '#2196F3',
    
    parentId: undefined,
    level: 0,
    path: 'pratos-principais',
    
    isActive: true,
    isVisible: true,
    isFeatured: true,
    
    sortOrder: 2,
    priority: 9,
    
    recipeCount: 78,
    activeRecipeCount: 75,
    
    tags: ['almoço', 'jantar', 'proteína'],
    keywords: ['prato principal', 'almoço', 'jantar', 'carne', 'frango', 'peixe'],
    
    mealTypes: [MealType.LUNCH, MealType.DINNER],
    dietaryTypes: [],
    cookingMethods: [],
    
    translations: [],
    
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
  },

  {
    id: 'category_3',
    name: 'Saladas',
    description: 'Saladas frescas e nutritivas, perfeitas para refeições leves ou acompanhamentos saudáveis.',
    slug: 'saladas',
    
    imageUrl: 'https://picsum.photos/300/200?random=12',
    iconName: 'eco',
    color: '#4CAF50',
    
    parentId: undefined,
    level: 0,
    path: 'saladas',
    
    isActive: true,
    isVisible: true,
    isFeatured: false,
    
    sortOrder: 3,
    priority: 7,
    
    recipeCount: 23,
    activeRecipeCount: 23,
    
    tags: ['saudável', 'leve', 'vegetais'],
    keywords: ['salada', 'verde', 'vegetal', 'folhas', 'tomate'],
    
    mealTypes: [MealType.LUNCH, MealType.DINNER],
    dietaryTypes: [DietaryType.VEGETARIAN, DietaryType.VEGAN],
    cookingMethods: [],
    
    translations: [],
    
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
  },

  {
    id: 'category_4',
    name: 'Bebidas',
    description: 'Sucos, smoothies, chás e outras bebidas refrescantes e nutritivas para todas as ocasiões.',
    slug: 'bebidas',
    
    imageUrl: 'https://picsum.photos/300/200?random=13',
    iconName: 'local_bar',
    color: '#FF9800',
    
    parentId: undefined,
    level: 0,
    path: 'bebidas',
    
    isActive: true,
    isVisible: true,
    isFeatured: false,
    
    sortOrder: 4,
    priority: 6,
    
    recipeCount: 18,
    activeRecipeCount: 16,
    
    tags: ['bebida', 'suco', 'refrescante'],
    keywords: ['bebida', 'suco', 'smoothie', 'vitamina', 'chá'],
    
    mealTypes: [MealType.DRINK, MealType.BREAKFAST, MealType.SNACK],
    dietaryTypes: [DietaryType.VEGAN, DietaryType.VEGETARIAN],
    cookingMethods: [],
    
    translations: [],
    
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
  },

  {
    id: 'category_5',
    name: 'Lanches',
    description: 'Opções deliciosas para o lanche da tarde, café da manhã ou quando bater aquela fome.',
    slug: 'lanches',
    
    imageUrl: 'https://picsum.photos/300/200?random=14',
    iconName: 'fastfood',
    color: '#9C27B0',
    
    parentId: undefined,
    level: 0,
    path: 'lanches',
    
    isActive: true,
    isVisible: true,
    isFeatured: false,
    
    sortOrder: 5,
    priority: 8,
    
    recipeCount: 34,
    activeRecipeCount: 32,
    
    tags: ['lanche', 'prático', 'rápido'],
    keywords: ['lanche', 'sanduíche', 'pão', 'biscoito', 'salgado'],
    
    mealTypes: [MealType.SNACK, MealType.BREAKFAST],
    dietaryTypes: [],
    cookingMethods: [],
    
    translations: [],
    
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
  },

  // Subcategorias de Sobremesas
  {
    id: 'category_6',
    name: 'Bolos',
    description: 'Bolos caseiros para todas as ocasiões, desde os mais simples até os mais elaborados.',
    slug: 'bolos',
    
    imageUrl: 'https://picsum.photos/300/200?random=15',
    iconName: 'cake',
    color: '#F06292',
    
    parentId: 'category_1',
    level: 1,
    path: 'sobremesas/bolos',
    
    isActive: true,
    isVisible: true,
    isFeatured: false,
    
    sortOrder: 1,
    priority: 5,
    
    recipeCount: 18,
    activeRecipeCount: 17,
    
    tags: ['bolo', 'aniversário', 'festa'],
    keywords: ['bolo', 'massa', 'cobertura', 'chocolate', 'cenoura'],
    
    mealTypes: [MealType.DESSERT],
    dietaryTypes: [],
    cookingMethods: [],
    
    translations: [],
    
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
  },

  {
    id: 'category_7',
    name: 'Doces Tradicionais',
    description: 'Doces clássicos da culinária brasileira que fazem sucesso há gerações.',
    slug: 'doces-tradicionais',
    
    imageUrl: 'https://picsum.photos/300/200?random=16',
    iconName: 'favorite',
    color: '#EC407A',
    
    parentId: 'category_1',
    level: 1,
    path: 'sobremesas/doces-tradicionais',
    
    isActive: true,
    isVisible: true,
    isFeatured: true,
    
    sortOrder: 2,
    priority: 8,
    
    recipeCount: 15,
    activeRecipeCount: 15,
    
    tags: ['tradicional', 'brasileiro', 'caseiro'],
    keywords: ['brigadeiro', 'beijinho', 'pudim', 'quindim', 'cocada'],
    
    mealTypes: [MealType.DESSERT],
    dietaryTypes: [],
    cookingMethods: [],
    
    translations: [],
    
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
  },

  // Subcategorias de Pratos Principais
  {
    id: 'category_8',
    name: 'Massas',
    description: 'Pratos de massa italiano e variações brasileiras, desde as mais simples até as mais sofisticadas.',
    slug: 'massas',
    
    imageUrl: 'https://picsum.photos/300/200?random=17',
    iconName: 'restaurant_menu',
    color: '#42A5F5',
    
    parentId: 'category_2',
    level: 1,
    path: 'pratos-principais/massas',
    
    isActive: true,
    isVisible: true,
    isFeatured: false,
    
    sortOrder: 1,
    priority: 6,
    
    recipeCount: 25,
    activeRecipeCount: 24,
    
    tags: ['massa', 'italiano', 'molho'],
    keywords: ['macarrão', 'espaguete', 'lasanha', 'molho', 'italiano'],
    
    mealTypes: [MealType.LUNCH, MealType.DINNER],
    dietaryTypes: [],
    cookingMethods: [],
    
    translations: [],
    
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
  },

  {
    id: 'category_9',
    name: 'Carnes',
    description: 'Receitas com diferentes tipos de carne: bovina, suína, aves e preparos especiais.',
    slug: 'carnes',
    
    imageUrl: 'https://picsum.photos/300/200?random=18',
    iconName: 'lunch_dining',
    color: '#D32F2F',
    
    parentId: 'category_2',
    level: 1,
    path: 'pratos-principais/carnes',
    
    isActive: true,
    isVisible: true,
    isFeatured: false,
    
    sortOrder: 2,
    priority: 7,
    
    recipeCount: 32,
    activeRecipeCount: 30,
    
    tags: ['carne', 'proteína', 'churrasco'],
    keywords: ['carne', 'bife', 'frango', 'porco', 'assado'],
    
    mealTypes: [MealType.LUNCH, MealType.DINNER],
    dietaryTypes: [DietaryType.HIGH_PROTEIN],
    cookingMethods: [],
    
    translations: [],
    
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
  },

  {
    id: 'category_10',
    name: 'Peixes e Frutos do Mar',
    description: 'Deliciosas receitas com peixes frescos e frutos do mar para uma alimentação saudável.',
    slug: 'peixes-frutos-do-mar',
    
    imageUrl: 'https://picsum.photos/300/200?random=19',
    iconName: 'set_meal',
    color: '#00ACC1',
    
    parentId: 'category_2',
    level: 1,
    path: 'pratos-principais/peixes-frutos-do-mar',
    
    isActive: true,
    isVisible: true,
    isFeatured: true,
    
    sortOrder: 3,
    priority: 6,
    
    recipeCount: 21,
    activeRecipeCount: 21,
    
    tags: ['peixe', 'camarão', 'saudável'],
    keywords: ['peixe', 'camarão', 'salmão', 'bacalhau', 'marisco'],
    
    mealTypes: [MealType.LUNCH, MealType.DINNER],
    dietaryTypes: [DietaryType.HIGH_PROTEIN],
    cookingMethods: [],
    
    translations: [],
    
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
  },

  // Categorias Especiais
  {
    id: 'category_11',
    name: 'Comida Brasileira',
    description: 'O melhor da culinária brasileira, com pratos típicos de todas as regiões do país.',
    slug: 'comida-brasileira',
    
    imageUrl: 'https://picsum.photos/300/200?random=20',
    iconName: 'flag',
    color: '#388E3C',
    
    parentId: undefined,
    level: 0,
    path: 'comida-brasileira',
    
    isActive: true,
    isVisible: true,
    isFeatured: true,
    
    sortOrder: 6,
    priority: 9,
    
    recipeCount: 56,
    activeRecipeCount: 54,
    
    tags: ['brasileiro', 'tradicional', 'regional'],
    keywords: ['brasileiro', 'feijoada', 'farofa', 'açaí', 'tapioca'],
    
    mealTypes: [MealType.LUNCH, MealType.DINNER, MealType.BREAKFAST],
    dietaryTypes: [],
    cookingMethods: [],
    
    translations: [],
    
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
  },

  {
    id: 'category_12',
    name: 'Receitas Veganas',
    description: 'Receitas 100% vegetais, saborosas e nutritivas para quem escolheu um estilo de vida vegano.',
    slug: 'receitas-veganas',
    
    imageUrl: 'https://picsum.photos/300/200?random=21',
    iconName: 'eco',
    color: '#689F38',
    
    parentId: undefined,
    level: 0,
    path: 'receitas-veganas',
    
    isActive: true,
    isVisible: true,
    isFeatured: true,
    
    sortOrder: 7,
    priority: 8,
    
    recipeCount: 39,
    activeRecipeCount: 37,
    
    tags: ['vegano', 'plant-based', 'saudável'],
    keywords: ['vegano', 'plant-based', 'tofu', 'quinoa', 'legumes'],
    
    mealTypes: [MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER, MealType.SNACK],
    dietaryTypes: [DietaryType.VEGAN, DietaryType.VEGETARIAN],
    cookingMethods: [],
    
    translations: [],
    
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
  },

  {
    id: 'category_13',
    name: 'Receitas Rápidas',
    description: 'Pratos deliciosos que ficam prontos em até 30 minutos, perfeitos para o dia a dia corrido.',
    slug: 'receitas-rapidas',
    
    imageUrl: 'https://picsum.photos/300/200?random=22',
    iconName: 'timer',
    color: '#FF5722',
    
    parentId: undefined,
    level: 0,
    path: 'receitas-rapidas',
    
    isActive: true,
    isVisible: true,
    isFeatured: false,
    
    sortOrder: 8,
    priority: 7,
    
    recipeCount: 42,
    activeRecipeCount: 40,
    
    tags: ['rápido', 'prático', '30 minutos'],
    keywords: ['rápido', 'fácil', 'prático', 'express', 'minutos'],
    
    mealTypes: [MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER, MealType.SNACK],
    dietaryTypes: [],
    cookingMethods: [],
    
    translations: [],
    
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

/**
 * 🔍 Helper functions for mock categories
 */
export const getCategoryById = (id: string): Category | undefined => {
  return mockCategories.find(category => category.id === id);
};

export const getRootCategories = (): Category[] => {
  return mockCategories.filter(category => category.level === 0);
};

export const getSubcategories = (parentId: string): Category[] => {
  return mockCategories.filter(category => category.parentId === parentId);
};

export const getFeaturedCategories = (): Category[] => {
  return mockCategories.filter(category => category.isFeatured);
};

export const getCategoriesByLevel = (level: number): Category[] => {
  return mockCategories.filter(category => category.level === level);
};

export const getActiveCategories = (): Category[] => {
  return mockCategories.filter(category => category.isActive);
};

export const getCategoriesWithMostRecipes = (limit: number = 5): Category[] => {
  return [...mockCategories]
    .sort((a, b) => b.recipeCount - a.recipeCount)
    .slice(0, limit);
};

export const getCategoryBySlug = (slug: string): Category | undefined => {
  return mockCategories.find(category => category.slug === slug);
};

export const getCategoryPath = (categoryId: string): Category[] => {
  const category = getCategoryById(categoryId);
  if (!category) return [];
  
  const path: Category[] = [category];
  let current = category;
  
  while (current.parentId) {
    const parent = getCategoryById(current.parentId);
    if (parent) {
      path.unshift(parent);
      current = parent;
    } else {
      break;
    }
  }
  
  return path;
};

export default mockCategories;