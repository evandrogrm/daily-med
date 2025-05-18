import mongoose from 'mongoose';
import { MedicationModel } from '../../infrastructure/repositories/mongodb/models/medication.model';
import { IMedication } from '../../../core/domain/interfaces/medication.interface';

export class TestDBHelper {
  static async connect(): Promise<void> {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dailymed-test';
    await mongoose.connect(mongoUri);
  }

  static async disconnect(): Promise<void> {
    await mongoose.disconnect();
  }

  static async clearDatabase(): Promise<void> {
    await MedicationModel.deleteMany({});
  }

  static async createTestMedication(overrides: Partial<IMedication> = {}): Promise<IMedication> {
    const defaultMedication: Partial<IMedication> = {
      name: 'Test Medication',
      dosage: '100mg',
      frequency: 'Once daily',
      description: 'Test description',
      activeIngredients: ['Test Ingredient'],
      sideEffects: ['Test Side Effect'],
    };

    const medication = new MedicationModel({
      ...defaultMedication,
      ...overrides,
    });

    return medication.save();
  }

  static async createTestMedications(count: number): Promise<IMedication[]> {
    const medications: IMedication[] = [];
    
    for (let i = 0; i < count; i++) {
      const medication = await this.createTestMedication({
        name: `Test Medication ${i + 1}`,
        dosage: `${i + 1}00mg`,
      });
      medications.push(medication);
    }
    
    return medications;
  }
}
