import { Medication } from '../../entities/medication.entity';

export interface IMedicationRepository {
  create(medication: Omit<Medication, 'id'>): Promise<Medication>;
  findById(id: string): Promise<Medication | null>;
  findAll(): Promise<Medication[]>;
  update(id: string, medication: Partial<Omit<Medication, 'id'>>): Promise<Medication | null>;
  delete(id: string): Promise<boolean>;
  search(query: string): Promise<Medication[]>;
}
