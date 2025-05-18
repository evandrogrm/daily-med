import { container } from 'tsyringe';
import { MedicationService } from '../../core/application/services/medication.service';
import { IMedicationRepository } from '../../core/domain/interfaces/repositories/medication.repository.interface';
import { IMedicationService } from '../../core/domain/interfaces/services/medication.service.interface';
import { MedicationRepository } from '../persistence/mongodb/repositories/medication.repository';

export class Container {
  static registerDependencies(): void {
    container.register<IMedicationService>('IMedicationService', {
      useClass: MedicationService,
    });

    container.register<IMedicationRepository>('IMedicationRepository', {
      useClass: MedicationRepository,
    });
  }
}
