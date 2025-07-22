import { Category } from "../../entities/interface/Category";

export interface ICategoryRepository {
  // Operações básicas
  getAll(): Promise<Category[]>;
  getById(id: string): Promise<Category | null>;
  getBySlug(slug: string): Promise<Category | null>;
  save(category: Category): Promise<void>;
  delete(id: string): Promise<void>;
  
  // Operações específicas
  getActive(): Promise<Category[]>;
  updateRecipeCount(categoryId: string, count: number): Promise<void>;
  
  // Cache
  invalidateCache(): Promise<void>;
}