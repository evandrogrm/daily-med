import { TestDBHelper } from './test-db.helper';
import { MedicationFactory } from '../factories/medication.factory';

export class DBTestHelper {
  static async setupTestDatabase() {
    await TestDBHelper.connect();
    await TestDBHelper.clearDatabase();
  }

  static async teardownTestDatabase() {
    await TestDBHelper.clearDatabase();
    await TestDBHelper.disconnect();
  }

  static async createTestMedication(overrides: any = {}) {
    return TestDBHelper.createTestMedication(overrides);
  }

  static async createTestMedications(count: number, overrides: any = {}) {
    return MedicationFactory.createMany(count, overrides);
  }

  static async clearCollections() {
    await TestDBHelper.clearDatabase();
  }

  static async withDatabase(testFn: () => Promise<void>) {
    try {
      await this.setupTestDatabase();
      await testFn();
    } finally {
      await this.teardownTestDatabase();
    }
  }
}
