import { Category } from "../../src/core/entities/interface/Category";


export const validCategory: Category = {
  id: 'cat_desserts',
  name: 'Sobremesas',
  slug: 'sobremesas',
  description: 'Deliciosas sobremesas para adoçar seu dia',
  imageUrl: 'https://example.com/sobremesas.jpg',
  color: '#E91E63',
  sortOrder: 1,
  recipeCount: 45,
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:30:00Z'
};

export const CategoryFactory = {
  createValid: (overrides: Partial<Category> = {}): Category => ({
    ...validCategory,
    ...overrides,
    id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }),
  
  createBatch: (count: number): Category[] => {
    const categories = [
      { name: 'Sobremesas', slug: 'sobremesas', color: '#E91E63' },
      { name: 'Pratos Principais', slug: 'pratos-principais', color: '#FF9800' },
      { name: 'Entradas', slug: 'entradas', color: '#4CAF50' },
      { name: 'Bebidas', slug: 'bebidas', color: '#2196F3' },
      { name: 'Lanches', slug: 'lanches', color: '#9C27B0' }
    ];
    
    return Array.from({ length: count }, (_, index) => {
      const base = categories[index % categories.length];
      return CategoryFactory.createValid({
        ...base,
        name: `${base.name} ${Math.floor(index / categories.length) + 1}`,
        sortOrder: index + 1,
        recipeCount: Math.floor(Math.random() * 50)
      });
    });
  }
};