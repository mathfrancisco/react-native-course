/**
 * 🌱 Data Seeder
 * 
 * Seeds the application with initial data for development and testing.
 * Generates realistic sample data and manages data initialization.
 */

import { Recipe, DifficultyLevel, MealType, DietaryType, CookingMethod, MeasurementUnit } from '../../types/recipe.types';
import { Category } from '../../types/category.types';
import { generateRandomString } from '../../utils/stringUtils';
import { randomInRange } from '../../utils/numberUtils';

/**
 * 🎯 Seeder Configuration
 */
export interface SeederConfig {
  recipes: {
    count: number;
    withImages: boolean;
    withNutrition: boolean;
    withRatings: boolean;
  };
  categories: {
    count: number;
    maxDepth: number;
    withImages: boolean;
  };
  users: {
    count: number;
    withProfiles: boolean;
  };
}

/**
 * ⚙️ Default seeder configuration
 */
const DEFAULT_CONFIG: SeederConfig = {
  recipes: {
    count: 50,
    withImages: true,
    withNutrition: true,
    withRatings: true,
  },
  categories: {
    count: 20,
    maxDepth: 2,
    withImages: true,
  },
  users: {
    count: 10,
    withProfiles: true,
  },
};

/**
 * 📝 Sample data templates
 */
const RECIPE_TEMPLATES = [
  {
    title: 'Bolo de Chocolate',
    description: 'Um delicioso bolo de chocolate fofinho e saboroso',
    baseIngredients: ['farinha', 'açúcar', 'chocolate', 'ovos', 'manteiga'],
    category: 'sobremesas',
    mealTypes: [MealType.DESSERT],
    difficulty: DifficultyLevel.MEDIUM,
  },
  {
    title: 'Salada Caesar',
    description: 'Clássica salada caesar com alface, croutons e molho especial',
    baseIngredients: ['alface', 'parmesão', 'croutons', 'anchovas'],
    category: 'saladas',
    mealTypes: [MealType.LUNCH, MealType.DINNER],
    difficulty: DifficultyLevel.EASY,
  },
  {
    title: 'Risotto de Camarão',
    description: 'Cremoso risotto italiano com camarões frescos',
    baseIngredients: ['arroz arbóreo', 'camarão', 'vinho branco', 'cebola'],
    category: 'pratos-principais',
    mealTypes: [MealType.LUNCH, MealType.DINNER],
    difficulty: DifficultyLevel.HARD,
  },
];

const CATEGORY_TEMPLATES = [
  { name: 'Sobremesas', slug: 'sobremesas', color: '#E91E63' },
  { name: 'Pratos Principais', slug: 'pratos-principais', color: '#2196F3' },
  { name: 'Saladas', slug: 'saladas', color: '#4CAF50' },
  { name: 'Bebidas', slug: 'bebidas', color: '#FF9800' },
  { name: 'Lanches', slug: 'lanches', color: '#9C27B0' },
  { name: 'Massas', slug: 'massas', color: '#795548', parent: 'pratos-principais' },
  { name: 'Carnes', slug: 'carnes', color: '#F44336', parent: 'pratos-principais' },
  { name: 'Peixes', slug: 'peixes', color: '#00BCD4', parent: 'pratos-principais' },
];

/**
 * 🍳 Generate sample recipes
 */
export const generateSampleRecipes = (
  count: number,
  categories: Category[],
  config: Partial<SeederConfig['recipes']> = {}
): Recipe[] => {
  const recipes: Recipe[] = [];
  const options = { ...DEFAULT_CONFIG.recipes, ...config };
  
  for (let i = 0; i < count; i++) {
    const template = RECIPE_TEMPLATES[i % RECIPE_TEMPLATES.length];
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    const recipe: Recipe = {
      id: `recipe_${i + 1}`,
      title: generateRecipeTitle(template.title, i),
      description: generateRecipeDescription(template.description),
      imageUrl: options.withImages ? generateImageUrl('recipe') : undefined,
      images: options.withImages ? [generateImageInfo()] : [],
      
      ingredients: generateIngredients(template.baseIngredients),
      instructions: generateInstructions(),
      
      servings: randomInRange(2, 8),
      difficulty: template.difficulty,
      
      timing: {
        prepTime: randomInRange(10, 60),
        cookTime: randomInRange(15, 120),
        totalTime: 0, // Will be calculated
        restTime: Math.random() > 0.7 ? randomInRange(10, 60) : undefined,
      },
      
      categoryId: category.id,
      mealTypes: template.mealTypes,
      cookingMethods: generateCookingMethods(),
      dietaryTypes: generateDietaryTypes(),
      
      tags: generateTags(),
      cuisine: generateCuisine(),
      
      nutrition: options.withNutrition ? generateNutrition() : undefined,
      
      author: generateAuthor(),
      stats: generateStats(),
      ratings: options.withRatings ? generateRatings() : [],
      
      source: {
        type: 'user_created',
        name: 'RecipeApp',
      },
      
      isPublic: true,
      isVerified: Math.random() > 0.7,
      isFeatured: Math.random() > 0.8,
      status: 'published',
      
      language: 'pt-BR',
      searchKeywords: [],
      equipment: generateEquipment(),
      
      createdAt: generateRandomDate(),
      updatedAt: generateRandomDate(),
    };
    
    // Calculate total time
    recipe.timing.totalTime = recipe.timing.prepTime + recipe.timing.cookTime + (recipe.timing.restTime || 0);
    
    recipes.push(recipe);
  }
  
  return recipes;
};

/**
 * 📂 Generate sample categories
 */
export const generateSampleCategories = (
  config: Partial<SeederConfig['categories']> = {}
): Category[] => {
  const options = { ...DEFAULT_CONFIG.categories, ...config };
  const categories: Category[] = [];
  
  // Generate root categories
  CATEGORY_TEMPLATES.filter(t => !t.parent).forEach((template, index) => {
    const category: Category = {
      id: `category_${index + 1}`,
      name: template.name,
      description: `Deliciosas receitas de ${template.name.toLowerCase()}`,
      slug: template.slug,
      
      imageUrl: options.withImages ? generateImageUrl('category') : undefined,
      iconName: generateIconName(template.name),
      color: template.color,
      
      parentId: undefined,
      level: 0,
      path: template.slug,
      
      isActive: true,
      isVisible: true,
      isFeatured: Math.random() > 0.6,
      
      sortOrder: index,
      priority: randomInRange(1, 10),
      
      recipeCount: randomInRange(5, 50),
      activeRecipeCount: randomInRange(5, 45),
      
      tags: [`${template.name.toLowerCase()}`, 'popular'],
      keywords: [template.name.toLowerCase(), template.slug],
      
      mealTypes: generateCategoryMealTypes(template.name),
      dietaryTypes: [],
      cookingMethods: [],
      
      translations: [],
      
      createdAt: generateRandomDate(),
      updatedAt: generateRandomDate(),
    };
    
    categories.push(category);
  });
  
  // Generate subcategories
  let categoryIdCounter = categories.length + 1;
  CATEGORY_TEMPLATES.filter(t => t.parent).forEach((template) => {
    const parent = categories.find(cat => cat.slug === template.parent);
    if (parent) {
      const category: Category = {
        id: `category_${categoryIdCounter++}`,
        name: template.name,
        description: `Especialidades em ${template.name.toLowerCase()}`,
        slug: template.slug,
        
        imageUrl: options.withImages ? generateImageUrl('category') : undefined,
        iconName: generateIconName(template.name),
        color: template.color,
        
        parentId: parent.id,
        level: 1,
        path: `${parent.path}/${template.slug}`,
        
        isActive: true,
        isVisible: true,
        isFeatured: false,
        
        sortOrder: 0,
        priority: randomInRange(1, 5),
        
        recipeCount: randomInRange(3, 20),
        activeRecipeCount: randomInRange(3, 18),
        
        tags: [template.name.toLowerCase()],
        keywords: [template.name.toLowerCase(), template.slug],
        
        mealTypes: generateCategoryMealTypes(template.name),
        dietaryTypes: [],
        cookingMethods: [],
        
        translations: [],
        
        createdAt: generateRandomDate(),
        updatedAt: generateRandomDate(),
      };
      
      categories.push(category);
    }
  });
  
  return categories;
};

/**
 * 🍳 Generate recipe title variation
 */
const generateRecipeTitle = (baseTitle: string, index: number): string => {
  const variations = [
    baseTitle,
    `${baseTitle} Caseiro`,
    `${baseTitle} da Vovó`,
    `${baseTitle} Especial`,
    `${baseTitle} Tradicional`,
    `Delicioso ${baseTitle}`,
  ];
  
  return variations[index % variations.length];
};

/**
 * 📝 Generate recipe description
 */
const generateRecipeDescription = (baseDescription: string): string => {
  const endings = [
    'Perfeito para toda a família!',
    'Uma receita que sempre dá certo.',
    'Fácil de fazer e delicioso.',
    'Ideal para ocasiões especiais.',
    'Um clássico que nunca sai de moda.',
  ];
  
  const ending = endings[Math.floor(Math.random() * endings.length)];
  return `${baseDescription}. ${ending}`;
};

/**
 * 🥕 Generate ingredients
 */
const generateIngredients = (baseIngredients: string[]): any[] => {
  const units = Object.values(MeasurementUnit);
  
  return baseIngredients.map((name, index) => ({
    id: `ingredient_${index + 1}`,
    name,
    amount: randomInRange(1, 5, 1),
    unit: units[Math.floor(Math.random() * units.length)],
    notes: Math.random() > 0.7 ? 'bem picado' : undefined,
    isOptional: Math.random() > 0.8,
  }));
};

/**
 * 📋 Generate instructions
 */
const generateInstructions = (): any[] => {
  const steps = [
    'Pré-aqueça o forno a 180°C.',
    'Em uma tigela, misture todos os ingredientes secos.',
    'Em outra tigela, bata os ovos e adicione os ingredientes líquidos.',
    'Combine as misturas e mexa até obter uma massa homogênea.',
    'Despeje em uma forma untada e leve ao forno.',
    'Asse por 25-30 minutos ou até dourar.',
    'Retire do forno e deixe esfriar antes de servir.',
  ];
  
  const numSteps = randomInRange(4, 7);
  return steps.slice(0, numSteps).map((description, index) => ({
    id: `instruction_${index + 1}`,
    stepNumber: index + 1,
    description,
    timer: Math.random() > 0.6 ? randomInRange(5, 30) : undefined,
  }));
};

/**
 * 🔥 Generate cooking methods
 */
const generateCookingMethods = (): CookingMethod[] => {
  const methods = Object.values(CookingMethod);
  const count = randomInRange(1, 3);
  const selected: CookingMethod[] = [];
  
  for (let i = 0; i < count; i++) {
    const method = methods[Math.floor(Math.random() * methods.length)];
    if (!selected.includes(method)) {
      selected.push(method);
    }
  }
  
  return selected;
};

/**
 * 🥗 Generate dietary types
 */
const generateDietaryTypes = (): DietaryType[] => {
  const types = Object.values(DietaryType);
  const selected: DietaryType[] = [];
  
  // Random chance for each dietary type
  types.forEach(type => {
    if (Math.random() > 0.7) {
      selected.push(type);
    }
  });
  
  return selected;
};

/**
 * 🏷️ Generate tags
 */
const generateTags = (): any[] => {
  const tagNames = ['rápido', 'fácil', 'saudável', 'tradicional', 'gourmet', 'família', 'festa'];
  const count = randomInRange(2, 5);
  const selected = tagNames.sort(() => 0.5 - Math.random()).slice(0, count);
  
  return selected.map((name, index) => ({
    id: `tag_${index + 1}`,
    name,
  }));
};

/**
 * 🌍 Generate cuisine
 */
const generateCuisine = (): string => {
  const cuisines = ['Brasileira', 'Italiana', 'Francesa', 'Asiática', 'Mexicana', 'Mediterrânea'];
  return cuisines[Math.floor(Math.random() * cuisines.length)];
};

/**
 * 📊 Generate nutrition info
 */
const generateNutrition = (): any => ({
  calories: randomInRange(150, 800),
  protein: randomInRange(5, 40, 1),
  carbs: randomInRange(10, 80, 1),
  fat: randomInRange(2, 30, 1),
  fiber: randomInRange(1, 15, 1),
  sugar: randomInRange(1, 25, 1),
  sodium: randomInRange(100, 2000),
});

/**
 * 👤 Generate author
 */
const generateAuthor = (): any => {
  const names = ['Ana Silva', 'João Santos', 'Maria Oliveira', 'Pedro Costa', 'Carla Souza'];
  const name = names[Math.floor(Math.random() * names.length)];
  
  return {
    id: `author_${generateRandomString(8)}`,
    name,
    avatar: generateImageUrl('avatar'),
    verified: Math.random() > 0.6,
  };
};

/**
 * 📊 Generate stats
 */
const generateStats = (): any => ({
  views: randomInRange(50, 5000),
  favorites: randomInRange(5, 500),
  timesCooked: randomInRange(1, 100),
  averageRating: randomInRange(3, 5, 1),
  totalRatings: randomInRange(5, 200),
  shares: randomInRange(0, 50),
});

/**
 * ⭐ Generate ratings
 */
const generateRatings = (): any[] => {
  const count = randomInRange(3, 15);
  const ratings = [];
  
  for (let i = 0; i < count; i++) {
    ratings.push({
      userId: `user_${generateRandomString(8)}`,
      recipeId: '', // Will be set by caller
      rating: randomInRange(3, 5),
      review: Math.random() > 0.6 ? 'Receita muito boa!' : undefined,
      createdAt: generateRandomDate(),
    });
  }
  
  return ratings;
};

/**
 * 🔧 Generate equipment
 */
const generateEquipment = (): string[] => {
  const equipment = ['forno', 'liquidificador', 'batedeira', 'panela', 'frigideira', 'assadeira'];
  const count = randomInRange(1, 4);
  return equipment.sort(() => 0.5 - Math.random()).slice(0, count);
};

/**
 * 🖼️ Generate image URL
 */
const generateImageUrl = (type: 'recipe' | 'category' | 'avatar'): string => {
  const baseUrl = 'https://picsum.photos';
  
  switch (type) {
    case 'recipe':
      return `${baseUrl}/400/300?random=${Math.random()}`;
    case 'category':
      return `${baseUrl}/300/200?random=${Math.random()}`;
    case 'avatar':
      return `${baseUrl}/100/100?random=${Math.random()}`;
    default:
      return `${baseUrl}/300/200?random=${Math.random()}`;
  }
};

/**
 * 🖼️ Generate image info
 */
const generateImageInfo = (): any => ({
  id: generateRandomString(8),
  uri: generateImageUrl('recipe'),
  width: 400,
  height: 300,
  size: randomInRange(50000, 200000),
  mimeType: 'image/jpeg',
});

/**
 * 🎨 Generate icon name
 */
const generateIconName = (categoryName: string): string => {
  const iconMap: { [key: string]: string } = {
    'Sobremesas': 'cake',
    'Pratos Principais': 'restaurant',
    'Saladas': 'eco',
    'Bebidas': 'local_bar',
    'Lanches': 'fastfood',
    'Massas': 'restaurant_menu',
    'Carnes': 'lunch_dining',
    'Peixes': 'set_meal',
  };
  
  return iconMap[categoryName] || 'restaurant';
};

/**
 * 🍽️ Generate category meal types
 */
const generateCategoryMealTypes = (categoryName: string): MealType[] => {
  const mealTypeMap: { [key: string]: MealType[] } = {
    'Sobremesas': [MealType.DESSERT],
    'Bebidas': [MealType.DRINK],
    'Lanches': [MealType.SNACK],
    'Pratos Principais': [MealType.LUNCH, MealType.DINNER],
  };
  
  return mealTypeMap[categoryName] || [];
};

/**
 * 📅 Generate random date
 */
const generateRandomDate = (): Date => {
  const start = new Date(2023, 0, 1);
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

/**
 * 🌱 Seed all data
 */
export const seedAllData = (config: Partial<SeederConfig> = {}): {
  recipes: Recipe[];
  categories: Category[];
} => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const categories = generateSampleCategories(finalConfig.categories);
  const recipes = generateSampleRecipes(finalConfig.recipes.count, categories, finalConfig.recipes);
  
  return {
    recipes,
    categories,
  };
};

/**
 * 📋 Data seeder object
 */
export const DataSeeder = {
  generateSampleRecipes,
  generateSampleCategories,
  seedAllData,
  DEFAULT_CONFIG,
};

export default DataSeeder;