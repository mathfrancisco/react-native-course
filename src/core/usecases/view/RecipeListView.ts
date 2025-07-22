import { PaginatedResult } from '../../entities/interface/Common';
import { Recipe } from '../../entities/interface/Recipe';
import { RecipeFormatter } from '../../entities/view/RecipeFormatter';

export interface RecipeListItem {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  rating: string;
  reviewCount: string;
  isFavorite: boolean;
}

export class RecipeListView {
  /**
   * Formata lista de receitas para exibição
   */
  static formatList(recipes: Recipe[], favoriteIds: string[] = []): RecipeListItem[] {
    return recipes.map(recipe => ({
      id: recipe.id,
      title: recipe.title,
      summary: RecipeFormatter.formatSummary(recipe),
      imageUrl: recipe.imageUrl || '',
      rating: RecipeFormatter.formatRating(recipe.rating),
      reviewCount: RecipeFormatter.formatReviewCount(recipe.reviewCount),
      isFavorite: favoriteIds.includes(recipe.id)
    }));
  }
  
  /**
   * Formata resultado paginado
   */
  static formatPaginatedResult(
    result: PaginatedResult<Recipe>, 
    favoriteIds: string[] = []
  ): {
    items: RecipeListItem[];
    pagination: {
      current: number;
      total: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  } {
    return {
      items: this.formatList(result.data, favoriteIds),
      pagination: {
        current: result.page,
        total: Math.ceil(result.total / result.pageSize),
        hasNext: result.hasNext,
        hasPrevious: result.hasPrevious
      }
    };
  }
  
  /**
   * Formata estado de carregamento
   */
  static formatLoadingState(isLoading: boolean, itemCount: number = 10): {
    isLoading: boolean;
    placeholderItems: RecipeListItem[];
  } {
    const placeholderItems: RecipeListItem[] = Array.from(
      { length: itemCount }, 
      (_, index) => ({
        id: `placeholder-${index}`,
        title: '',
        summary: '',
        imageUrl: '',
        rating: '',
        reviewCount: '',
        isFavorite: false
      })
    );
    
    return {
      isLoading,
      placeholderItems
    };
  }
}