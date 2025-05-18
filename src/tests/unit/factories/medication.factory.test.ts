import { MedicationFactory } from '../../factories/medication.factory';
import { IMedication } from '../../core/domain/interfaces/medication.interface';

describe('MedicationFactory', () => {
  describe('create', () => {
    it('should create a medication with default values', () => {
      const medication = MedicationFactory.create();
      
      expect(medication).toBeDefined();
      expect(medication.id).toBeDefined();
      expect(medication.name).toBeDefined();
      expect(medication.dosage).toMatch(/\d+mg/);
      expect(medication.frequency).toBeDefined();
      expect(medication.description).toBeDefined();
      expect(Array.isArray(medication.activeIngredients)).toBe(true);
      expect(Array.isArray(medication.sideEffects)).toBe(true);
    });

    it('should override default values with provided overrides', () => {
      const overrides: Partial<IMedication> = {
        name: 'Ibuprofen',
        dosage: '400mg',
        frequency: 'Every 6 hours',
      };
      
      const medication = MedicationFactory.create(overrides);
      
      expect(medication.name).toBe(overrides.name);
      expect(medication.dosage).toBe(overrides.dosage);
      expect(medication.frequency).toBe(overrides.frequency);
    });
  });

  describe('createMany', () => {
    it('should create the specified number of medications', () => {
      const count = 3;
      const medications = MedicationFactory.createMany(count);
      
      expect(Array.isArray(medications)).toBe(true);
      expect(medications.length).toBe(count);
      
      medications.forEach(medication => {
        expect(medication).toBeDefined();
        expect(medication.id).toBeDefined();
      });
    });

    it('should apply the same overrides to all medications', () => {
      const count = 2;
      const overrides: Partial<IMedication> = {
        name: 'Paracetamol',
        dosage: '500mg',
      };
      
      const medications = MedicationFactory.createMany(count, overrides);
      
      medications.forEach(medication => {
        expect(medication.name).toBe(overrides.name);
        expect(medication.dosage).toBe(overrides.dosage);
      });
    });
  });

  describe('createForDB', () => {
    it('should create a medication without an id', () => {
      const medication = MedicationFactory.createForDB();
      
      expect(medication).toBeDefined();
      expect(medication).not.toHaveProperty('id');
      expect(medication.name).toBeDefined();
    });

    it('should include provided overrides', () => {
      const overrides = {
        name: 'Aspirin',
        dosage: '81mg',
      };
      
      const medication = MedicationFactory.createForDB(overrides);
      
      expect(medication.name).toBe(overrides.name);
      expect(medication.dosage).toBe(overrides.dosage);
    });
  });
});
