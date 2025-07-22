import { Category as CoreCategory } from '../../../core/entities';
import { Category as SharedCategory } from '../../../shared/types/category.types';

export class CategoryDataAdapter {
  /**
   * 🔄 Converte categoria Shared → Core
   */
  static sharedToCore(sharedCategory: SharedCategory): CoreCategory {
    return {
      id: sharedCategory.id,
      name: sharedCategory.name,
      slug: sharedCategory.slug,
      description: sharedCategory.description || '',
      imageUrl: sharedCategory.imageUrl || '',
      color: sharedCategory.color || '#007AFF',
      sortOrder: sharedCategory.sortOrder || 0,
      recipeCount: sharedCategory.recipeCount || 0,
      isActive: sharedCategory.isActive !== false, // Padrão true
      createdAt: sharedCategory.createdAt,
      updatedAt: sharedCategory.updatedAt
    };
  }
  
  /**
   * 🔄 Converte categoria Core → Shared
   */
  static coreToShared(coreCategory: CoreCategory): SharedCategory {
    return {
      id: coreCategory.id,
      name: coreCategory.name,
      description: coreCategory.description,
      slug: coreCategory.slug,
      imageUrl: coreCategory.imageUrl,
      iconName: 'restaurant', // Padrão
      color: coreCategory.color,
      parentId: null, // Será preenchido se necessário
      level: 0,
      isActive: coreCategory.isActive,
      isVisible: coreCategory.isActive,
      isFeatured: false,
      sortOrder: coreCategory.sortOrder,
      recipeCount: coreCategory.recipeCount,
      tags: [], // Será preenchido se necessário
      keywords: [coreCategory.name.toLowerCase()],
      mealTypes: [],
      dietaryTypes: [],
      createdAt: coreCategory.createdAt,
      updatedAt: coreCategory.updatedAt
    };
  }
  
  /**
   * 📋 Adapta lista de categorias
   */
  static adaptCategoryList(sharedCategories: SharedCategory[]): CoreCategory[] {
    return sharedCategories
      .map(category => {
        try {
          return this.sharedToCore(category);
        } catch (error) {
          console.warn(`❌ Erro ao adaptar categoria ${category.id}:`, error);
          return null;
        }
      })
      .filter((category): category is CoreCategory => category !== null);
  }
}