export interface IMedication {
  id?: string;
  name: string;
  dosage: string;
  frequency: string;
  description?: string;
  activeIngredients?: string[];
  sideEffects?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
