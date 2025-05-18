import { inject, injectable } from 'tsyringe';
import { Medication } from '../../../core/domain/entities/medication.entity';
import { IMedicationRepository } from '../../../core/domain/interfaces/repositories/medication.repository.interface';
import { IMedicationService } from '../../../core/domain/interfaces/services/medication.service.interface';
import { CreateMedicationDto } from '../../application/dtos/create-medication.dto';
import { UpdateMedicationDto } from '../../application/dtos/update-medication.dto';

@injectable()
export class MedicationService implements IMedicationService {
  constructor(
    @inject('IMedicationRepository') private medicationRepository: IMedicationRepository,
  ) {}

  async createMedication(medication: CreateMedicationDto): Promise<Medication> {
    return this.medicationRepository.create(medication);
  }

  async getMedicationById(id: string): Promise<Medication | null> {
    return this.medicationRepository.findById(id);
  }

  async getAllMedications(): Promise<Medication[]> {
    return this.medicationRepository.findAll();
  }

  async updateMedication(id: string, updates: UpdateMedicationDto): Promise<Medication | null> {
    return this.medicationRepository.update(id, updates);
  }

  async deleteMedication(id: string): Promise<boolean> {
    return this.medicationRepository.delete(id);
  }

  async searchMedications(query: string): Promise<Medication[]> {
    return this.medicationRepository.search(query);
  }

  async extractAndMapIndications(text: string): Promise<{ description: string, icd10Code: string, icd10Description: string, confidence: number }[]> {
    // Use the ICD-10 mapper to find relevant codes
    const { mapTextToICD10 } = await import('@core/application/utils/icd10-mapper');
    return mapTextToICD10(text);
  }
}
