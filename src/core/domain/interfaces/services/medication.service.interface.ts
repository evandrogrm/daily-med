import { Medication } from '../../entities/medication.entity';

export interface IMedicationService {
  createMedication(medication: Omit<Medication, 'id'>): Promise<Medication>;
  getMedicationById(id: string): Promise<Medication | null>;
  getAllMedications(): Promise<Medication[]>;
  updateMedication(id: string, updates: Partial<Omit<Medication, 'id'>>): Promise<Medication | null>;
  deleteMedication(id: string): Promise<boolean>;
  searchMedications(query: string): Promise<Medication[]>;
  extractAndMapIndications(text: string): Promise<{description: string, icd10Code: string, icd10Description: string, confidence: number}[]>;
}
