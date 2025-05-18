import { faker } from '@faker-js/faker';
import { IMedication } from '../../../core/domain/interfaces/medication.interface';

export class MedicationFactory {
  static create(overrides: Partial<IMedication> = {}): IMedication {
    const now = new Date();
    
    const defaultMedication: IMedication = {
      id: faker.database.mongodbObjectId(),
      name: faker.commerce.productName(),
      dosage: `${faker.number.int({ min: 10, max: 1000 })}mg`,
      frequency: faker.helpers.arrayElement(['Once daily', 'Twice daily', 'Three times daily', 'As needed']),
      description: faker.lorem.sentence(),
      activeIngredients: [faker.science.chemicalElement().name],
      sideEffects: [faker.lorem.words(3)],
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };

    return defaultMedication;
  }

  static createMany(count: number, overrides: Partial<IMedication> = {}): IMedication[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static createForDB(overrides: Partial<IMedication> = {}): Omit<IMedication, 'id'> {
    const { id, ...medication } = this.create(overrides);
    return medication;
  }
}
