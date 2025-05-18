import { MedicationFactory } from '../../factories/medication.factory';
import { DBTestHelper } from '../../helpers/db-test.helper';
import { TestDBHelper } from '../../helpers/test-db.helper';

jest.mock('../../helpers/test-db.helper', () => ({
  TestDBHelper: {
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    clearDatabase: jest.fn().mockResolvedValue(undefined),
    createTestMedication: jest.fn().mockImplementation((data) => ({
      id: 'test-id',
      name: data.name || 'Test Medication',
      dosage: data.dosage || '100mg',
      save: jest.fn().mockResolvedValue(true),
    })),
  },
}));

jest.mock('../../factories/medication.factory', () => ({
  MedicationFactory: {
    createMany: jest.fn().mockImplementation((count) =>
      Array(count).fill({
        id: 'test-id',
        name: 'Test Medication',
        dosage: '100mg',
      })
    ),
  },
}));

describe('DBTestHelper', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setupTestDatabase', () => {
    it('should connect to the test database', async () => {
      await DBTestHelper.setupTestDatabase();

      expect(TestDBHelper.connect).toHaveBeenCalled();
    });
  });

  describe('teardownTestDatabase', () => {
    it('should clear and disconnect from the test database', async () => {
      await DBTestHelper.teardownTestDatabase();

      expect(TestDBHelper.clearDatabase).toHaveBeenCalled();
      expect(TestDBHelper.disconnect).toHaveBeenCalled();
    });
  });

  describe('createTestMedication', () => {
    it('should create a test medication', async () => {
      const medicationData = {
        name: 'Ibuprofen',
        dosage: '200mg',
      };

      const result = await DBTestHelper.createTestMedication(medicationData);

      expect(TestDBHelper.createTestMedication).toHaveBeenCalledWith(medicationData);
      expect(result).toBeDefined();
      expect(result.name).toBe(medicationData.name);
      expect(result.dosage).toBe(medicationData.dosage);
    });
  });

  describe('createTestMedications', () => {
    it('should create multiple test medications', async () => {
      const count = 3;
      const overrides = { dosage: '500mg' };

      const result = await DBTestHelper.createTestMedications(count, overrides);

      expect(MedicationFactory.createMany).toHaveBeenCalledWith(count, overrides);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(count);
    });
  });

  describe('clearCollections', () => {
    it('should clear all collections', async () => {
      await DBTestHelper.clearCollections();

      expect(TestDBHelper.clearDatabase).toHaveBeenCalled();
    });
  });

  describe('withDatabase', () => {
    it('should execute callback within a database transaction', async () => {
      const callback = jest.fn().mockResolvedValue('test result');

      const result = await DBTestHelper.withDatabase(callback);

      expect(TestDBHelper.connect).toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
      expect(TestDBHelper.clearDatabase).toHaveBeenCalled();
      expect(TestDBHelper.disconnect).toHaveBeenCalled();
      expect(result).toBe('test result');
    });

    it('should clean up even if callback throws', async () => {
      const error = new Error('Test error');
      const callback = jest.fn().mockRejectedValue(error);

      await expect(DBTestHelper.withDatabase(callback)).rejects.toThrow(error);

      expect(TestDBHelper.connect).toHaveBeenCalled();
      expect(TestDBHelper.clearDatabase).toHaveBeenCalled();
      expect(TestDBHelper.disconnect).toHaveBeenCalled();
    });
  });
});
