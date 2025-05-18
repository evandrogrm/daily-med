import { mockError, mockNext, mockRequest, mockResponse } from '../../../test-utils';
import { MedicationFactory } from '../../factories/medication.factory';
import { TestDBHelper } from '../../helpers/test-db.helper';

describe('Test Utilities', () => {
  describe('mockRequest', () => {
    it('should create a mock request with provided data', () => {
      const body = { name: 'Test' };
      const params = { id: '123' };
      const query = { page: '1' };

      const req = mockRequest(body, params, query);

      expect(req.body).toEqual(body);
      expect(req.params).toEqual(params);
      expect(req.query).toEqual(query);
      expect(typeof req.get).toBe('function');
    });
  });

  describe('mockResponse', () => {
    it('should create a mock response with chainable methods', () => {
      const res = mockResponse();

      res.status(200);
      res.json({ success: true });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });
  });

  describe('mockNext', () => {
    it('should create a mock next function', () => {
      const error = new Error('Test error');
      mockNext(error);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('mockError', () => {
    it('should create an error with status code', () => {
      const error = mockError('Not found', 404);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Not found');
      expect(error.status).toBe(404);
    });
  });
});

describe('TestDBHelper', () => {
  beforeAll(async () => {
    await TestDBHelper.connect();
  });

  afterEach(async () => {
    await TestDBHelper.clearDatabase();
  });

  afterAll(async () => {
    await TestDBHelper.disconnect();
  });

  describe('createTestMedication', () => {
    it('should create a test medication in the database', async () => {
      const medication = await TestDBHelper.createTestMedication({
        name: 'Test Medication',
        dosage: '100mg',
      });

      expect(medication).toBeDefined();
      expect(medication.name).toBe('Test Medication');
      expect(medication.dosage).toBe('100mg');
      expect(medication.id).toBeDefined();
    });
  });

  describe('clearDatabase', () => {
    it('should clear all data from the database', async () => {
      await TestDBHelper.createTestMedication({
        name: 'Test Medication',
        dosage: '100mg',
      });

      await TestDBHelper.clearDatabase();

      const medications = await TestDBHelper.clearDatabase();

      expect(medications).toBeUndefined();
    });
  });
});

describe('MedicationFactory', () => {
  it('should create a medication object with default values', () => {
    const medication = MedicationFactory.create();

    expect(medication).toBeDefined();
    expect(medication.name).toBeDefined();
    expect(medication.dosage).toMatch(/\d+mg/);
    expect(medication.frequency).toBeDefined();
    expect(medication.id).toBeDefined();
  });

  it('should create multiple medication objects', () => {
    const count = 3;
    const medications = MedicationFactory.createMany(count);

    expect(Array.isArray(medications)).toBe(true);
    expect(medications.length).toBe(count);

    medications.forEach(medication => {
      expect(medication).toBeDefined();
      expect(medication.id).toBeDefined();
    });
  });

  it('should create a medication object for database without id', () => {
    const medication = MedicationFactory.createForDB();

    expect(medication).toBeDefined();
    expect(medication).not.toHaveProperty('id');
  });
});
