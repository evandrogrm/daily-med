import { TestDBHelper } from '../../helpers/test-db.helper';
import { connect, disconnect, connection } from 'mongoose';
import { MedicationModel } from '../../../../infrastructure/repositories/mongodb/models/medication.model';

// Mock mongoose
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
  connection: {
    db: {
      dropDatabase: jest.fn().mockResolvedValue(undefined),
    },
    close: jest.fn().mockResolvedValue(undefined),
  },
  model: jest.fn().mockReturnValue({
    create: jest.fn().mockImplementation((data) => ({
      ...data,
      _id: 'test-id',
      save: jest.fn().mockResolvedValue(true),
    })),
  }),
}));

// Mock the MedicationModel
jest.mock('../../../../infrastructure/repositories/mongodb/models/medication.model', () => ({
  MedicationModel: {
    create: jest.fn().mockResolvedValue({
      _id: 'test-id',
      name: 'Test Medication',
      dosage: '100mg',
    }),
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    findByIdAndDelete: jest.fn().mockReturnThis(),
    deleteMany: jest.fn().mockResolvedValue({ deletedCount: 0 }),
    lean: jest.fn().mockResolvedValue([{ _id: '1' }, { _id: '2' }]),
  },
}));

describe('TestDBHelper', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('connect', () => {
    it('should connect to the test database', async () => {
      await TestDBHelper.connect();
      
      expect(connect).toHaveBeenCalledWith(expect.stringContaining('mongodb://'));
    });
  });

  describe('disconnect', () => {
    it('should disconnect from the test database', async () => {
      await TestDBHelper.disconnect();
      
      expect(connection.close).toHaveBeenCalled();
    });
  });

  describe('clearDatabase', () => {
    it('should clear all data from the test database', async () => {
      await TestDBHelper.clearDatabase();
      
      expect(connection.db.dropDatabase).toHaveBeenCalled();
    });
  });

  describe('createTestMedication', () => {
    it('should create a test medication', async () => {
      const medicationData = {
        name: 'Ibuprofen',
        dosage: '200mg',
      };
      
      const result = await TestDBHelper.createTestMedication(medicationData);
      
      expect(MedicationModel.create).toHaveBeenCalledWith(medicationData);
      expect(result).toBeDefined();
      expect(result.name).toBe('Test Medication'); // From mock
      expect(result.dosage).toBe('100mg'); // From mock
    });
  });

  describe('findAllMedications', () => {
    it('should find all medications', async () => {
      const result = await TestDBHelper.findAllMedications();
      
      expect(MedicationModel.find).toHaveBeenCalledWith({});
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2); // From mock
    });
  });

  describe('findMedicationById', () => {
    it('should find a medication by id', async () => {
      const id = 'test-id';
      await TestDBHelper.findMedicationById(id);
      
      expect(MedicationModel.findById).toHaveBeenCalledWith(id);
    });
  });

  describe('updateMedication', () => {
    it('should update a medication', async () => {
      const id = 'test-id';
      const updateData = { dosage: '500mg' };
      
      await TestDBHelper.updateMedication(id, updateData);
      
      expect(MedicationModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        updateData,
        { new: true, runValidators: true }
      );
    });
  });

  describe('deleteMedication', () => {
    it('should delete a medication', async () => {
      const id = 'test-id';
      await TestDBHelper.deleteMedication(id);
      
      expect(MedicationModel.findByIdAndDelete).toHaveBeenCalledWith(id);
    });
  });

  describe('deleteAllMedications', () => {
    it('should delete all medications', async () => {
      await TestDBHelper.deleteAllMedications();
      
      expect(MedicationModel.deleteMany).toHaveBeenCalledWith({});
    });
  });
});
