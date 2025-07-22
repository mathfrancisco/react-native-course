export interface Instruction {
  step: number;
  description: string;
  duration?: number; // em minutos
  temperature?: number; // em celsius
  notes?: string;
  imageUrl?: string;
}