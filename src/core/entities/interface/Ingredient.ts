import { NutritionalInfo } from "./Common";

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category?: string;
  notes?: string;
  isOptional?: boolean;
}

export interface IngredientBase {
  id: string;
  name: string;
  category: string;
  defaultUnit: string;
  nutritionPer100g?: NutritionalInfo;
}