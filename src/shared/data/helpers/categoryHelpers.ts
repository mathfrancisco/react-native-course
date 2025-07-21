/**
 * 📂 Category Helpers
 * 
 * Helper functions for category data manipulation, hierarchy building, and navigation.
 * These functions handle category-related operations and organization.
 */

import { Category, CategoryTreeNode, CategoryHierarchy, CategoryFilters } from '../../types/category.types';
import { normalizeString, fuzzyMatch, createSlug } from '../../utils/stringUtils';

/**
 * 🌳 Build category hierarchy
 */
export const buildCategoryHierarchy = (categories: Category[]): CategoryHierarchy => {
  const byId = categories.reduce((acc, category) => {
    acc[category.id] = category;
    return acc;
  }, {} as { [id: string]: Category });
  
  const bySlug = categories.reduce((acc, category) => {
    acc[category.slug] = category;
    return acc;
  }, {} as { [slug: string]: Category });
  
  // Build tree structure
  const rootNodes: CategoryTreeNode[] = [];
  const nodeMap = new Map<string, CategoryTreeNode>();
  
  // Create nodes for all categories
  categories.forEach(category => {
    const node: CategoryTreeNode = {
      category,
      children: [],
      depth: category.level,
      hasChildren: false,
    };
    nodeMap.set(category.id, node);
  });
  
  // Build parent-child relationships
  categories.forEach(category => {
    const node = nodeMap.get(category.id)!;
    
    if (category.parentId && nodeMap.has(category.parentId)) {
      const parent = nodeMap.get(category.parentId)!;
      parent.children.push(node);
      parent.hasChildren = true;
      node.parent = parent;
    } else {
      rootNodes.push(node);
    }
  });
  
  // Sort children by sortOrder
  const sortNodes = (nodes: CategoryTreeNode[]): void => {
    nodes.sort((a, b) => a.category.sortOrder - b.category.sortOrder);
    nodes.forEach(node => sortNodes(node.children));
  };
  
  sortNodes(rootNodes);
  
  // Calculate max depth
  const maxDepth = Math.max(...categories.map(c => c.level));
  
  return {
    root: rootNodes,
    flat: categories,
    byId,
    bySlug,
    maxDepth,
  };
};

/**
 * 🔍 Find category by path
 */
export const findCategoryByPath = (hierarchy: CategoryHierarchy, path: string): Category | null => {
  const slug = path.split('/').pop();
  return hierarchy.bySlug[slug || ''] || null;
};

/**
 * 📊 Get category statistics
 */
export const getCategoryStats = (category: Category, allCategories: Category[]) => {
  const children = allCategories.filter(cat => cat.parentId === category.id);
  const descendants = getAllDescendants(category, allCategories);
  
  return {
    directChildren: children.length,
    totalDescendants: descendants.length,
    maxDepth: Math.max(...descendants.map(cat => cat.level), category.level),
    totalRecipes: descendants.reduce((sum, cat) => sum + cat.recipeCount, category.recipeCount),
  };
};

/**
 * 🌿 Get all descendants of a category
 */
export const getAllDescendants = (category: Category, allCategories: Category[]): Category[] => {
  const descendants: Category[] = [];
  const directChildren = allCategories.filter(cat => cat.parentId === category.id);
  
  directChildren.forEach(child => {
    descendants.push(child);
    descendants.push(...getAllDescendants(child, allCategories));
  });
  
  return descendants;
};

/**
 * 📍 Get category breadcrumb
 */
export const getCategoryBreadcrumb = (category: Category, allCategories: Category[]): Category[] => {
  const breadcrumb: Category[] = [category];
  let current = category;
  
  while (current.parentId) {
    const parent = allCategories.find(cat => cat.id === current.parentId);
    if (parent) {
      breadcrumb.unshift(parent);
      current = parent;
    } else {
      break;
    }
  }
  
  return breadcrumb;
};

/**
 * 🔍 Search categories
 */
export const searchCategories = (
  categories: Category[],
  query: string,
  options?: {
    includeInactive?: boolean;
    searchFields?: ('name' | 'description' | 'keywords')[];
  }
): Category[] => {
  if (!query.trim()) return categories;
  
  const searchFields = options?.searchFields || ['name', 'description', 'keywords'];
  const includeInactive = options?.includeInactive || false;
  
  return categories.filter(category => {
    // Skip inactive categories unless specified
    if (!includeInactive && !category.isActive) return false;
    
    // Search in name
    if (searchFields.includes('name')) {
      if (fuzzyMatch(category.name, query)) return true;
    }
    
    // Search in description
    if (searchFields.includes('description') && category.description) {
      if (fuzzyMatch(category.description, query)) return true;
    }
    
    // Search in keywords
    if (searchFields.includes('keywords') && category.keywords) {
      const hasKeyword = category.keywords.some(keyword =>
        fuzzyMatch(keyword, query)
      );
      if (hasKeyword) return true;
    }
    
    return false;
  });
};

/**
 * 🔧 Filter categories
 */
export const filterCategories = (categories: Category[], filters: CategoryFilters): Category[] => {
  return categories.filter(category => {
    // Parent filter
    if (filters.parentId !== undefined) {
      if (category.parentId !== filters.parentId) return false;
    }
    
    // Level filter
    if (filters.level !== undefined) {
      if (category.level !== filters.level) return false;
    }
    
    // Active filter
    if (filters.isActive !== undefined) {
      if (category.isActive !== filters.isActive) return false;
    }
    
    // Featured filter
    if (filters.isFeatured !== undefined) {
      if (category.isFeatured !== filters.isFeatured) return false;
    }
    
    // Has recipes filter
    if (filters.hasRecipes) {
      if (category.recipeCount === 0) return false;
    }
    
    // Minimum recipe count
    if (filters.minRecipeCount !== undefined) {
      if (category.recipeCount < filters.minRecipeCount) return false;
    }
    
    // Meal types filter
    if (filters.mealTypes && filters.mealTypes.length > 0) {
      if (!category.mealTypes) return false;
      const hasMatchingMealType = category.mealTypes.some(mealType =>
        filters.mealTypes!.includes(mealType)
      );
      if (!hasMatchingMealType) return false;
    }
    
    // Dietary types filter
    if (filters.dietaryTypes && filters.dietaryTypes.length > 0) {
      if (!category.dietaryTypes) return false;
      const hasMatchingDiet = category.dietaryTypes.some(diet =>
        filters.dietaryTypes!.includes(diet)
      );
      if (!hasMatchingDiet) return false;
    }
    
    // Search filter
    if (filters.search) {
      if (!fuzzyMatch(category.name, filters.search) &&
          (!category.description || !fuzzyMatch(category.description, filters.search))) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * 📊 Sort categories
 */
export const sortCategories = (
  categories: Category[],
  sortBy: 'name' | 'recipeCount' | 'popularity' | 'order' | 'newest',
  order: 'asc' | 'desc' = 'asc'
): Category[] => {
  return [...categories].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'recipeCount':
        comparison = a.recipeCount - b.recipeCount;
        break;
      case 'popularity':
        // Could be based on views, favorites, etc.
        comparison = a.recipeCount - b.recipeCount; // Simple fallback
        break;
      case 'order':
        comparison = a.sortOrder - b.sortOrder;
        break;
      case 'newest':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
};

/**
 * 🎯 Get category recommendations
 */
export const getCategoryRecommendations = (
  allCategories: Category[],
  userHistory?: string[], // Category IDs
  userPreferences?: any,
  limit: number = 5
): Category[] => {
  const activeCategories = allCategories.filter(cat => cat.isActive && cat.recipeCount > 0);
  
  const recommendations = activeCategories
    .map(category => ({
      category,
      score: calculateCategoryScore(category, userHistory, userPreferences),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.category);
  
  return recommendations;
};

/**
 * 📊 Calculate category recommendation score
 */
const calculateCategoryScore = (
  category: Category,
  userHistory?: string[],
  userPreferences?: any
): number => {
  let score = 0;
  
  // Base popularity score
  score += Math.min(category.recipeCount / 10, 20);
  
  // Featured boost
  if (category.isFeatured) score += 15;
  
  // User history
  if (userHistory) {
    // Boost if user has viewed this category
    if (userHistory.includes(category.id)) score += 10;
    
    // Boost if user has viewed similar categories (same parent)
    const siblingViews = userHistory.filter(catId => {
      const viewedCat = allCategories.find(c => c.id === catId);
      return viewedCat && viewedCat.parentId === category.parentId;
    });
    score += siblingViews.length * 3;
  }
  
  // User preferences
  if (userPreferences) {
    if (userPreferences.preferredMealTypes && category.mealTypes) {
      const matchingMealTypes = category.mealTypes.filter(type =>
        userPreferences.preferredMealTypes.includes(type)
      );
      score += matchingMealTypes.length * 5;
    }
    
    if (userPreferences.dietaryRestrictions && category.dietaryTypes) {
      const matchingDiets = category.dietaryTypes.filter(diet =>
        userPreferences.dietaryRestrictions.includes(diet)
      );
      score += matchingDiets.length * 7;
    }
  }
  
  return score;
};

/**
 * 🏷️ Generate category slug
 */
export const generateCategorySlug = (name: string, existingSlugs: string[]): string => {
  let baseSlug = createSlug(name);
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

/**
 * 📍 Build category path
 */
export const buildCategoryPath = (category: Category, allCategories: Category[]): string => {
  const breadcrumb = getCategoryBreadcrumb(category, allCategories);
  return breadcrumb.map(cat => cat.slug).join('/');
};

/**
 * ✅ Validate category data
 */
export const validateCategoryData = (
  category: Partial<Category>,
  allCategories: Category[] = []
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!category.name || category.name.trim().length < 2) {
    errors.push('Nome deve ter pelo menos 2 caracteres');
  }
  
  if (category.name && category.name.length > 50) {
    errors.push('Nome deve ter no máximo 50 caracteres');
  }
  
  // Check for duplicate names at same level
  if (category.name && category.parentId !== undefined) {
    const siblings = allCategories.filter(cat => 
      cat.parentId === category.parentId && 
      cat.id !== category.id
    );
    
    const duplicate = siblings.find(cat => 
      normalizeString(cat.name) === normalizeString(category.name)
    );
    
    if (duplicate) {
      errors.push('Já existe uma categoria com este nome no mesmo nível');
    }
  }
  
  // Validate parent relationship
  if (category.parentId) {
    const parent = allCategories.find(cat => cat.id === category.parentId);
    if (!parent) {
      errors.push('Categoria pai não encontrada');
    } else if (parent.level >= 3) {
      errors.push('Máximo de 3 níveis de hierarquia permitidos');
    }
  }
  
  // Validate sort order
  if (category.sortOrder !== undefined && category.sortOrder < 0) {
    errors.push('Ordem de classificação deve ser um número positivo');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 🔄 Update category hierarchy after changes
 */
export const updateCategoryHierarchy = (
  categories: Category[],
  updatedCategory: Category
): Category[] => {
  const updated = categories.map(cat => 
    cat.id === updatedCategory.id ? updatedCategory : cat
  );
  
  // Update paths for all descendants
  const descendants = getAllDescendants(updatedCategory, updated);
  
  return updated.map(cat => {
    if (descendants.some(desc => desc.id === cat.id)) {
      return {
        ...cat,
        path: buildCategoryPath(cat, updated),
      };
    }
    return cat;
  });
};

/**
 * 📊 Get popular categories
 */
export const getPopularCategories = (
  categories: Category[],
  limit: number = 10
): Category[] => {
  return categories
    .filter(cat => cat.isActive)
    .sort((a, b) => b.recipeCount - a.recipeCount)
    .slice(0, limit);
};

/**
 * 📋 Category helpers object
 */
export const CategoryHelpers = {
  buildCategoryHierarchy,
  findCategoryByPath,
  getCategoryStats,
  getAllDescendants,
  getCategoryBreadcrumb,
  searchCategories,
  filterCategories,
  sortCategories,
  getCategoryRecommendations,
  generateCategorySlug,
  buildCategoryPath,
  validateCategoryData,
  updateCategoryHierarchy,
  getPopularCategories,
};

export default CategoryHelpers;