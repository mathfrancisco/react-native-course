export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  color?: string;
  sortOrder: number;
  recipeCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}