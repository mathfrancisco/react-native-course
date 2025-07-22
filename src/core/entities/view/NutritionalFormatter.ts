import { NutritionalInfo } from "../interface/Common";

export class NutritionalFormatter {
  /**
   * Formata calorias
   */
  static formatCalories(calories: number): string {
    return `${Math.round(calories)} kcal`;
  }
  
  /**
   * Formata macronutrientes
   */
  static formatMacro(grams: number, label: string): string {
    return `${Math.round(grams)}g ${label}`;
  }
  
  /**
   * Formata informação nutricional completa
   */
  static formatComplete(nutrition: NutritionalInfo): {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  } {
    return {
      calories: this.formatCalories(nutrition.calories),
      protein: this.formatMacro(nutrition.protein, 'proteína'),
      carbs: this.formatMacro(nutrition.carbs, 'carboidratos'),
      fat: this.formatMacro(nutrition.fat, 'gordura')
    };
  }
  
  /**
   * Calcula percentual de macronutrientes
   */
  static calculateMacroPercentages(nutrition: NutritionalInfo): {
    protein: number;
    carbs: number;
    fat: number;
  } {
    const proteinCal = nutrition.protein * 4;
    const carbsCal = nutrition.carbs * 4;
    const fatCal = nutrition.fat * 9;
    
    const total = proteinCal + carbsCal + fatCal;
    
    if (total === 0) {
      return { protein: 0, carbs: 0, fat: 0 };
    }
    
    return {
      protein: Math.round((proteinCal / total) * 100),
      carbs: Math.round((carbsCal / total) * 100),
      fat: Math.round((fatCal / total) * 100)
    };
  }
}