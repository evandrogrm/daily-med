import { z } from 'zod';

export const MedicationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  dosage: z.string().min(1).max(50),
  frequency: z.string().min(1).max(100),
  activeIngredients: z.array(z.string()).optional(),
  sideEffects: z.array(z.string()).optional(),
  indications: z.array(z.object({
    description: z.string(),
    icd10Code: z.string().optional(),
    icd10Description: z.string().optional(),
    confidence: z.number().min(0).max(1).optional(),
  })).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Medication = z.infer<typeof MedicationSchema>;
