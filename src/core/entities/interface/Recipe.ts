import { NutritionalInfo } from "./Common";
import { Ingredient } from "./Ingredient";
import { Instruction } from "./Instruction";

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  difficulty: DifficultyLevel;
  prepTime: number; // em minutos
  cookTime: number; // em minutos
  servings: number;
  ingredients: Ingredient[];
  instructions: Instruction[];
  nutritional?: NutritionalInfo;
  tags: string[];
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  author?: string;
  createdAt: string;
  updatedAt: string;
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';