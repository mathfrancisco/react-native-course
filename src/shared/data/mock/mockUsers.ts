/**
 * 👥 Mock Users Data
 * 
 * Sample user data for development and testing.
 * Includes realistic user profiles, preferences, and activity data.
 */

import { UserPreferences, ThemeMode, LanguageCode } from '../../types/common.types';
import { DietaryType, MealType } from '../../types/recipe.types';

/**
 * 👤 User Interface
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  verified: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  isActive: boolean;
  
  // Profile stats
  stats: {
    recipesCreated: number;
    recipesFavorited: number;
    recipesCooked: number;
    followers: number;
    following: number;
    totalViews: number;
    totalLikes: number;
  };
  
  // User preferences
  preferences: UserPreferences;
  
  // Social data
  social: {
    favoriteRecipes: string[];
    followedUsers: string[];
    recentActivity: ActivityItem[];
    cookedRecipes: CookedRecipe[];
  };
  
  // Location
  location?: {
    country: string;
    city: string;
    timezone: string;
  };
  
  // Account details
  account: {
    type: 'free' | 'premium' | 'chef';
    subscriptionEndsAt?: Date;
    emailVerified: boolean;
    phoneVerified: boolean;
  };
}

/**
 * 📱 Activity Item
 */
export interface ActivityItem {
  id: string;
  type: 'recipe_created' | 'recipe_favorited' | 'recipe_cooked' | 'user_followed' | 'review_posted';
  userId: string;
  targetId: string; // Recipe ID, User ID, etc.
  targetType: 'recipe' | 'user' | 'review';
  data?: any;
  timestamp: Date;
}

/**
 * 🍳 Cooked Recipe
 */
export interface CookedRecipe {
  recipeId: string;
  cookedAt: Date;
  rating?: number;
  notes?: string;
  modifications?: string[];
  photos?: string[];
  servings?: number;
  cookTime?: number;
}

/**
 * 👥 Mock Users Array
 */
export const mockUsers: User[] = [
  {
    id: 'user_1',
    name: 'Ana Silva',
    email: 'ana.silva@email.com',
    avatar: 'https://picsum.photos/200/200?random=1',
    bio: 'Apaixonada por culinária italiana e doces caseiros. Sempre em busca de novas receitas para compartilhar com a família.',
    verified: true,
    createdAt: new Date('2023-01-15'),
    lastLoginAt: new Date('2024-01-20'),
    isActive: true,
    
    stats: {
      recipesCreated: 15,
      recipesFavorited: 89,
      recipesCooked: 156,
      followers: 234,
      following: 89,
      totalViews: 4567,
      totalLikes: 892,
    },
    
    preferences: {
      theme: 'light' as ThemeMode,
      language: 'pt-BR' as LanguageCode,
      notifications: {
        push: true,
        email: true,
        newRecipes: true,
        favorites: true,
      },
      units: {
        temperature: 'celsius',
        weight: 'metric',
        volume: 'metric',
      },
      privacy: {
        showProfile: true,
        allowRecommendations: true,
      },
    },
    
    social: {
      favoriteRecipes: ['recipe_1', 'recipe_3', 'recipe_7', 'recipe_12'],
      followedUsers: ['user_2', 'user_4', 'user_6'],
      recentActivity: [
        {
          id: 'activity_1',
          type: 'recipe_created',
          userId: 'user_1',
          targetId: 'recipe_15',
          targetType: 'recipe',
          timestamp: new Date('2024-01-18'),
        },
        {
          id: 'activity_2',
          type: 'recipe_favorited',
          userId: 'user_1',
          targetId: 'recipe_8',
          targetType: 'recipe',
          timestamp: new Date('2024-01-17'),
        },
      ],
      cookedRecipes: [
        {
          recipeId: 'recipe_1',
          cookedAt: new Date('2024-01-15'),
          rating: 5,
          notes: 'Ficou perfeito! Toda a família adorou.',
          servings: 6,
          cookTime: 45,
        },
        {
          recipeId: 'recipe_3',
          cookedAt: new Date('2024-01-12'),
          rating: 4,
          notes: 'Muito bom, só diminui um pouco o sal da próxima vez.',
          modifications: ['Menos sal'],
          servings: 4,
        },
      ],
    },
    
    location: {
      country: 'Brasil',
      city: 'São Paulo',
      timezone: 'America/Sao_Paulo',
    },
    
    account: {
      type: 'premium',
      subscriptionEndsAt: new Date('2024-12-31'),
      emailVerified: true,
      phoneVerified: true,
    },
  },
  
  {
    id: 'user_2',
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@email.com',
    avatar: 'https://picsum.photos/200/200?random=2',
    bio: 'Chef profissional especializado em culinária contemporânea brasileira. Amo experimentar com ingredientes locais.',
    verified: true,
    createdAt: new Date('2022-11-20'),
    lastLoginAt: new Date('2024-01-19'),
    isActive: true,
    
    stats: {
      recipesCreated: 67,
      recipesFavorited: 234,
      recipesCooked: 445,
      followers: 1256,
      following: 156,
      totalViews: 23456,
      totalLikes: 4567,
    },
    
    preferences: {
      theme: 'dark' as ThemeMode,
      language: 'pt-BR' as LanguageCode,
      notifications: {
        push: true,
        email: false,
        newRecipes: true,
        favorites: true,
      },
      units: {
        temperature: 'celsius',
        weight: 'metric',
        volume: 'metric',
      },
      privacy: {
        showProfile: true,
        allowRecommendations: true,
      },
    },
    
    social: {
      favoriteRecipes: ['recipe_2', 'recipe_5', 'recipe_9', 'recipe_14', 'recipe_18'],
      followedUsers: ['user_1', 'user_3', 'user_5', 'user_7'],
      recentActivity: [
        {
          id: 'activity_3',
          type: 'recipe_created',
          userId: 'user_2',
          targetId: 'recipe_20',
          targetType: 'recipe',
          timestamp: new Date('2024-01-19'),
        },
      ],
      cookedRecipes: [
        {
          recipeId: 'recipe_2',
          cookedAt: new Date('2024-01-18'),
          rating: 5,
          notes: 'Excelente combinação de sabores.',
          servings: 8,
        },
      ],
    },
    
    location: {
      country: 'Brasil',
      city: 'Rio de Janeiro',
      timezone: 'America/Sao_Paulo',
    },
    
    account: {
      type: 'chef',
      emailVerified: true,
      phoneVerified: true,
    },
  },
  
  {
    id: 'user_3',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    avatar: 'https://picsum.photos/200/200?random=3',
    bio: 'Mãe de dois filhos, sempre buscando receitas saudáveis e práticas para o dia a dia da família.',
    verified: false,
    createdAt: new Date('2023-06-10'),
    lastLoginAt: new Date('2024-01-16'),
    isActive: true,
    
    stats: {
      recipesCreated: 8,
      recipesFavorited: 67,
      recipesCooked: 89,
      followers: 45,
      following: 78,
      totalViews: 567,
      totalLikes: 123,
    },
    
    preferences: {
      theme: 'auto' as ThemeMode,
      language: 'pt-BR' as LanguageCode,
      notifications: {
        push: true,
        email: true,
        newRecipes: false,
        favorites: true,
      },
      units: {
        temperature: 'celsius',
        weight: 'metric',
        volume: 'metric',
      },
      privacy: {
        showProfile: false,
        allowRecommendations: true,
      },
    },
    
    social: {
      favoriteRecipes: ['recipe_4', 'recipe_6', 'recipe_11'],
      followedUsers: ['user_1', 'user_2'],
      recentActivity: [
        {
          id: 'activity_4',
          type: 'recipe_favorited',
          userId: 'user_3',
          targetId: 'recipe_11',
          targetType: 'recipe',
          timestamp: new Date('2024-01-16'),
        },
      ],
      cookedRecipes: [
        {
          recipeId: 'recipe_4',
          cookedAt: new Date('2024-01-14'),
          rating: 4,
          notes: 'As crianças adoraram!',
          modifications: ['Adicionei mais legumes'],
          servings: 4,
        },
      ],
    },
    
    location: {
      country: 'Brasil',
      city: 'Belo Horizonte',
      timezone: 'America/Sao_Paulo',
    },
    
    account: {
      type: 'free',
      emailVerified: true,
      phoneVerified: false,
    },
  },
  
  {
    id: 'user_4',
    name: 'João Costa',
    email: 'joao.costa@email.com',
    avatar: 'https://picsum.photos/200/200?random=4',
    bio: 'Estudante de gastronomia e entusiasta da cozinha vegana. Sempre testando receitas inovadoras.',
    verified: false,
    createdAt: new Date('2023-09-05'),
    lastLoginAt: new Date('2024-01-18'),
    isActive: true,
    
    stats: {
      recipesCreated: 23,
      recipesFavorited: 156,
      recipesCooked: 234,
      followers: 189,
      following: 234,
      totalViews: 2345,
      totalLikes: 567,
    },
    
    preferences: {
      theme: 'dark' as ThemeMode,
      language: 'pt-BR' as LanguageCode,
      notifications: {
        push: true,
        email: true,
        newRecipes: true,
        favorites: true,
      },
      units: {
        temperature: 'celsius',
        weight: 'metric',
        volume: 'metric',
      },
      privacy: {
        showProfile: true,
        allowRecommendations: true,
      },
    },
    
    social: {
      favoriteRecipes: ['recipe_5', 'recipe_10', 'recipe_13', 'recipe_16'],
      followedUsers: ['user_1', 'user_2', 'user_5'],
      recentActivity: [
        {
          id: 'activity_5',
          type: 'recipe_created',
          userId: 'user_4',
          targetId: 'recipe_23',
          targetType: 'recipe',
          timestamp: new Date('2024-01-17'),
        },
      ],
      cookedRecipes: [
        {
          recipeId: 'recipe_5',
          cookedAt: new Date('2024-01-16'),
          rating: 5,
          notes: 'Perfeito! Vou fazer novamente.',
          servings: 2,
        },
      ],
    },
    
    location: {
      country: 'Brasil',
      city: 'Porto Alegre',
      timezone: 'America/Sao_Paulo',
    },
    
    account: {
      type: 'free',
      emailVerified: true,
      phoneVerified: false,
    },
  },
  
  {
    id: 'user_5',
    name: 'Isabella Rodriguez',
    email: 'isabella.rodriguez@email.com',
    avatar: 'https://picsum.photos/200/200?random=5',
    bio: 'Confeiteira profissional apaixonada por doces artesanais e bolos decorados.',
    verified: true,
    createdAt: new Date('2022-08-12'),
    lastLoginAt: new Date('2024-01-19'),
    isActive: true,
    
    stats: {
      recipesCreated: 89,
      recipesFavorited: 123,
      recipesCooked: 567,
      followers: 2345,
      following: 98,
      totalViews: 45678,
      totalLikes: 8901,
    },
    
    preferences: {
      theme: 'light' as ThemeMode,
      language: 'pt-BR' as LanguageCode,
      notifications: {
        push: true,
        email: true,
        newRecipes: true,
        favorites: true,
      },
      units: {
        temperature: 'celsius',
        weight: 'metric',
        volume: 'metric',
      },
      privacy: {
        showProfile: true,
        allowRecommendations: true,
      },
    },
    
    social: {
      favoriteRecipes: ['recipe_7', 'recipe_12', 'recipe_17'],
      followedUsers: ['user_2', 'user_4'],
      recentActivity: [
        {
          id: 'activity_6',
          type: 'recipe_created',
          userId: 'user_5',
          targetId: 'recipe_89',
          targetType: 'recipe',
          timestamp: new Date('2024-01-19'),
        },
      ],
      cookedRecipes: [
        {
          recipeId: 'recipe_7',
          cookedAt: new Date('2024-01-17'),
          rating: 5,
          notes: 'Receita maravilhosa para eventos especiais.',
          photos: ['https://picsum.photos/400/300?random=10'],
          servings: 12,
        },
      ],
    },
    
    location: {
      country: 'Brasil',
      city: 'Curitiba',
      timezone: 'America/Sao_Paulo',
    },
    
    account: {
      type: 'chef',
      emailVerified: true,
      phoneVerified: true,
    },
  },
];

/**
 * 🔍 Helper functions for mock users
 */
export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getUsersByType = (type: 'free' | 'premium' | 'chef'): User[] => {
  return mockUsers.filter(user => user.account.type === type);
};

export const getVerifiedUsers = (): User[] => {
  return mockUsers.filter(user => user.verified);
};

export const getActiveUsers = (): User[] => {
  return mockUsers.filter(user => user.isActive);
};

export const getUsersWithMostRecipes = (limit: number = 5): User[] => {
  return [...mockUsers]
    .sort((a, b) => b.stats.recipesCreated - a.stats.recipesCreated)
    .slice(0, limit);
};

export const getUsersWithMostFollowers = (limit: number = 5): User[] => {
  return [...mockUsers]
    .sort((a, b) => b.stats.followers - a.stats.followers)
    .slice(0, limit);
};

export default mockUsers;