import { injectable } from 'tsyringe';
import { IMedication } from '../../domain/interfaces/medication.interface';
import { IMedicationService } from '../../domain/interfaces/services/medication.service.interface';
import { IMedicationRepository } from '../../domain/interfaces/repositories/medication.repository.interface';

@injectable()
export class MedicationService implements IMedicationService {
  constructor(private repository: IMedicationRepository) {}

  async create(medication: IMedication): Promise<IMedication> {
    return this.repository.create(medication);
  }

  async findAll(): Promise<IMedication[]> {
    return this.repository.find();
  }

  async findById(id: string): Promise<IMedication | null> {
    return this.repository.findById(id);
  }

  async update(id: string, medication: Partial<IMedication>): Promise<IMedication | null> {
    return this.repository.update(id, medication);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
