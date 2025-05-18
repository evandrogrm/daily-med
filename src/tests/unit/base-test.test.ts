import { BaseTest } from '../base-test';
import { AuthTestHelper } from '../helpers/auth-test.helper';
import { DBTestHelper } from '../helpers/db-test.helper';
import { ServiceMockHelper } from '../helpers/service-mock.helper';

jest.mock('../helpers/db-test.helper', () => ({
  DBTestHelper: {
    setupTestDatabase: jest.fn().mockResolvedValue(undefined),
    teardownTestDatabase: jest.fn().mockResolvedValue(undefined),
    createTestMedication: jest.fn().mockResolvedValue({ id: 'test-id' }),
    createTestMedications: jest.fn().mockResolvedValue([{ id: 'test-id' }]),
  },
}));

jest.mock('../helpers/service-mock.helper', () => ({
  ServiceMockHelper: {
    clearMocks: jest.fn(),
    mockService: jest.fn().mockReturnValue({}),
  },
}));

jest.mock('../helpers/auth-test.helper', () => ({
  AuthTestHelper: {
    withAuth: jest.fn().mockImplementation((fn) => fn('test-token')),
  },
}));

jest.mock('../helpers/api-test-client', () => ({
  apiClient: {
    clearAuthToken: jest.fn(),
  },
}));

const mockApiClient = require('../helpers/api-test-client').apiClient;

describe('BaseTest', () => {
  class TestClass extends BaseTest {}
  let testInstance: TestClass;

  beforeEach(() => {
    testInstance = new TestClass();
    jest.clearAllMocks();
  });

  describe('beforeAll', () => {
    it('should set up test database', async () => {
      await TestClass.beforeAll();

      expect(DBTestHelper.setupTestDatabase).toHaveBeenCalled();
    });
  });

  describe('afterAll', () => {
    it('should tear down test database', async () => {
      await TestClass.afterAll();

      expect(DBTestHelper.teardownTestDatabase).toHaveBeenCalled();
    });
  });

  describe('beforeEach', () => {
    it('should clear mocks and auth token', () => {
      TestClass.beforeEach();

      expect(ServiceMockHelper.clearMocks).toHaveBeenCalled();
      expect(mockApiClient.clearAuthToken).toHaveBeenCalled();
    });
  });

  describe('afterEach', () => {
    it('should clear mocks', () => {
      TestClass.afterEach();

      expect(ServiceMockHelper.clearMocks).toHaveBeenCalled();
    });
  });

  describe('withAuth', () => {
    it('should execute callback with auth token', async () => {
      const callback = jest.fn().mockResolvedValue('test result');

      const result = await testInstance.withAuth(callback);

      expect(AuthTestHelper.withAuth).toHaveBeenCalledWith(expect.any(Function));
      expect(callback).toHaveBeenCalledWith('test-token');
      expect(result).toBe('test result');
    });
  });

  describe('createTestMedication', () => {
    it('should create a test medication', async () => {
      const overrides = { name: 'Ibuprofen' };

      const result = await testInstance.createTestMedication(overrides);

      expect(DBTestHelper.createTestMedication).toHaveBeenCalledWith(overrides);
      expect(result).toEqual({ id: 'test-id' });
    });
  });

  describe('createTestMedications', () => {
    it('should create multiple test medications', async () => {
      const count = 3;
      const overrides = { dosage: '500mg' };

      const result = await testInstance.createTestMedications(count, overrides);

      expect(DBTestHelper.createTestMedications).toHaveBeenCalledWith(count, overrides);
      expect(result).toEqual([{ id: 'test-id' }]);
    });
  });

  describe('mockService', () => {
    it('should mock a service', () => {
      const token = 'ITestService';
      const mockImpl = { test: jest.fn() };

      const result = testInstance.mockService(token, mockImpl);

      expect(ServiceMockHelper.mockService).toHaveBeenCalledWith(token, mockImpl);
      expect(result).toBeDefined();
    });
  });
});
