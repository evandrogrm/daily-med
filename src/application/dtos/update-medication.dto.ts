import { z } from 'zod';

export const UpdateMedicationDtoSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().optional(),
  dosage: z.string().min(1).max(50).optional(),
  frequency: z.string().min(1).max(100).optional(),
  activeIngredients: z.array(z.string()).optional(),
  sideEffects: z.array(z.string()).optional(),
  indications: z.array(z.object({
    description: z.string(),
    icd10Code: z.string().optional(),
    icd10Description: z.string().optional(),
    confidence: z.number().min(0).max(1).optional(),
  })).optional(),
}).partial();

export type UpdateMedicationDto = z.infer<typeof UpdateMedicationDtoSchema>;
