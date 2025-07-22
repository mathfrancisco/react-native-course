import { Recipe as CoreRecipe } from '../../../core/entities';
import { Recipe as SharedRecipe } from '../../../shared/types/recipe.types';


export class RecipeDataAdapter {
  /**
   * 🔄 Converte receita Shared → Core
   */
  static sharedToCore(sharedRecipe: SharedRecipe): CoreRecipe {
    return {
      // Mapeamento direto dos campos básicos
      id: sharedRecipe.id,
      title: sharedRecipe.title,
      description: sharedRecipe.description || '',
      categoryId: sharedRecipe.categoryId,
      
      // Dificuldade (converte string → enum)
      difficulty: this.adaptDifficulty(sharedRecipe.difficulty),
      
      // Tempos (estrutura diferente)
      prepTime: sharedRecipe.timing?.prepTime || sharedRecipe.prepTime || 0,
      cookTime: sharedRecipe.timing?.cookTime || sharedRecipe.cookTime || 0,
      
      servings: sharedRecipe.servings,
      
      // Ingredientes (adapta estrutura)
      ingredients: this.adaptIngredients(sharedRecipe.ingredients),
      
      // Instruções (adapta estrutura)
      instructions: this.adaptInstructions(sharedRecipe.instructions),
      
      // Informação nutricional
      nutritional: this.adaptNutrition(sharedRecipe.nutrition),
      
      // Tags e classificações
      tags: sharedRecipe.tags?.map(tag => typeof tag === 'string' ? tag : tag.name) || [],
      
      // Avaliação e reviews
      rating: sharedRecipe.stats?.averageRating || sharedRecipe.rating || 0,
      reviewCount: sharedRecipe.stats?.totalRatings || sharedRecipe.reviewCount || 0,
      
      // Metadados
      imageUrl: sharedRecipe.imageUrl || sharedRecipe.images?.[0],
      author: sharedRecipe.author?.name || sharedRecipe.authorName,
      createdAt: sharedRecipe.createdAt,
      updatedAt: sharedRecipe.updatedAt
    };
  }
  
  /**
   * 🔄 Converte receita Core → Shared  
   */
  static coreToShared(coreRecipe: CoreRecipe): SharedRecipe {
    return {
      id: coreRecipe.id,
      title: coreRecipe.title,
      description: coreRecipe.description,
      imageUrl: coreRecipe.imageUrl,
      images: coreRecipe.imageUrl ? [coreRecipe.imageUrl] : [],
      
      // Estrutura de tempo do shared
      timing: {
        prepTime: coreRecipe.prepTime,
        cookTime: coreRecipe.cookTime,
        totalTime: coreRecipe.prepTime + coreRecipe.cookTime,
        restTime: 0
      },
      
      servings: coreRecipe.servings,
      difficulty: coreRecipe.difficulty,
      
      ingredients: coreRecipe.ingredients.map(ing => ({
        id: ing.id,
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        category: ing.category,
        notes: ing.notes,
        isOptional: ing.isOptional || false
      })),
      
      instructions: coreRecipe.instructions.map((inst, index) => ({
        stepNumber: inst.step,
        description: inst.description,
        duration: inst.duration,
        temperature: inst.temperature,
        notes: inst.notes,
        imageUrl: inst.imageUrl
      })),
      
      categoryId: coreRecipe.categoryId,
      mealTypes: [], // Será preenchido se necessário
      cookingMethods: [], 
      dietaryTypes: [],
      
      tags: coreRecipe.tags.map(tag => ({ name: tag, color: '#007AFF' })),
      cuisine: '',
      
      nutrition: coreRecipe.nutritional ? {
        calories: coreRecipe.nutritional.calories,
        protein: coreRecipe.nutritional.protein,
        carbs: coreRecipe.nutritional.carbs,
        fat: coreRecipe.nutritional.fat,
        fiber: coreRecipe.nutritional.fiber,
        sugar: coreRecipe.nutritional.sugar,
        sodium: coreRecipe.nutritional.sodium
      } : undefined,
      
      author: {
        id: 'system',
        name: coreRecipe.author || 'RecipeApp',
        avatar: '',
        bio: '',
        verified: false
      },
      
      stats: {
        views: 0,
        favorites: 0,
        timesCooked: 0,
        averageRating: coreRecipe.rating,
        totalRatings: coreRecipe.reviewCount,
        shares: 0
      },
      
      ratings: [],
      
      source: {
        type: 'json',
        name: 'RecipeApp',
        url: '',
        author: coreRecipe.author
      },
      
      visibility: 'public',
      isPublic: true,
      isFeatured: false,
      status: 'published',
      language: 'pt-BR',
      
      createdAt: coreRecipe.createdAt,
      updatedAt: coreRecipe.updatedAt
    };
  }
  
  /**
   * 📋 Adapta lista de receitas
   */
  static adaptRecipeList(sharedRecipes: SharedRecipe[]): CoreRecipe[] {
    return sharedRecipes
      .map(recipe => {
        try {
          return this.sharedToCore(recipe);
        } catch (error) {
          console.warn(`❌ Erro ao adaptar receita ${recipe.id}:`, error);
          return null;
        }
      })
      .filter((recipe): recipe is CoreRecipe => recipe !== null);
  }
  
  /**
   * 🔧 Métodos auxiliares privados
   */
  private static adaptDifficulty(difficulty: any): 'easy' | 'medium' | 'hard' {
    if (typeof difficulty === 'string') {
      const normalized = difficulty.toLowerCase();
      if (normalized.includes('fac') || normalized === 'easy') return 'easy';
      if (normalized.includes('dif') || normalized === 'hard') return 'hard';
      return 'medium';
    }
    
    if (typeof difficulty === 'number') {
      if (difficulty <= 1) return 'easy';
      if (difficulty >= 3) return 'hard';
      return 'medium';
    }
    
    return 'medium'; // Padrão
  }
  
  private static adaptIngredients(ingredients: any[]): any[] {
    if (!Array.isArray(ingredients)) return [];
    
    return ingredients.map((ing, index) => ({
      id: ing.id || `ing_${index}`,
      name: ing.name || ing.ingredient || '',
      amount: parseFloat(ing.amount || ing.quantity || '1'),
      unit: ing.unit || ing.measure || 'unidade',
      category: ing.category || '',
      notes: ing.notes || ing.note || '',
      isOptional: ing.isOptional || ing.optional || false
    }));
  }
  
  private static adaptInstructions(instructions: any[]): any[] {
    if (!Array.isArray(instructions)) return [];
    
    return instructions.map((inst, index) => ({
      step: inst.stepNumber || inst.step || (index + 1),
      description: inst.description || inst.text || inst.instruction || '',
      duration: inst.duration || inst.time || 0,
      temperature: inst.temperature || 0,
      notes: inst.notes || inst.tip || '',
      imageUrl: inst.imageUrl || inst.image || ''
    }));
  }
  
  private static adaptNutrition(nutrition: any): any {
    if (!nutrition) return undefined;
    
    return {
      calories: nutrition.calories || 0,
      protein: nutrition.protein || 0,
      carbs: nutrition.carbs || nutrition.carbohydrates || 0,
      fat: nutrition.fat || nutrition.fats || 0,
      fiber: nutrition.fiber || 0,
      sugar: nutrition.sugar || nutrition.sugars || 0,
      sodium: nutrition.sodium || 0
    };
  }
}