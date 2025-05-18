import { faker } from '@faker-js/faker';
import { IMedication } from '../../../core/domain/interfaces/medication.interface';

export class FixtureHelper {
  static createMedicationData(overrides: Partial<IMedication> = {}): Partial<IMedication> {
    return {
      name: faker.commerce.productName(),
      dosage: `${faker.number.int({ min: 10, max: 1000 })}mg`,
      frequency: faker.helpers.arrayElement(['Once daily', 'Twice daily', 'Three times daily', 'As needed']),
      description: faker.lorem.sentence(),
      activeIngredients: [faker.science.chemicalElement().name],
      sideEffects: [faker.lorem.words(3)],
      ...overrides,
    };
  }

  static createUserData(overrides: any = {}) {
    const username = faker.internet.userName();
    const email = faker.internet.email();
    
    return {
      name: faker.person.fullName(),
      email,
      username,
      password: 'Test@123',
      confirmPassword: 'Test@123',
      role: 'user',
      ...overrides,
    };
  }

  static createPaginationData<T>(items: T[], total: number, page = 1, limit = 10) {
    return {
      data: items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }


  static createErrorResponse(message: string, errors: any[] = []) {
    return {
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    };
  }
}
