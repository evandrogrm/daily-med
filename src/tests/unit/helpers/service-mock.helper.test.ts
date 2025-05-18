import { container } from 'tsyringe';
import { ServiceMockHelper } from '../../helpers/service-mock.helper';

interface ITestService {
  getItem(id: string): Promise<{ id: string; name: string }>;
  createItem(data: { name: string }): Promise<{ id: string; name: string }>;
  updateItem(id: string, data: { name: string }): Promise<{ id: string; name: string }>;
  deleteItem(id: string): Promise<boolean>;
}

describe('ServiceMockHelper', () => {
  const TOKEN = 'ITestService';
  
  afterEach(() => {
    container.clearInstances();
    jest.clearAllMocks();
  });

  describe('mockService', () => {
    it('should register a mock service in the container', () => {
      const mockService = {
        getItem: jest.fn().mockResolvedValue({ id: '1', name: 'Test' }),
        createItem: jest.fn(),
        updateItem: jest.fn(),
        deleteItem: jest.fn(),
      };

      const result = ServiceMockHelper.mockService<ITestService>(TOKEN, mockService);
      
      expect(result).toBeDefined();
      expect(result.getItem).toBeDefined();
      expect(container.isRegistered(TOKEN)).toBe(true);
    });
  });

  describe('mockMultipleServices', () => {
    it('should register multiple mock services in the container', () => {
      const mockService1 = {
        getItem: jest.fn().mockResolvedValue({ id: '1', name: 'Test' }),
      };

      const mockService2 = {
        getItems: jest.fn().mockResolvedValue([{ id: '1' }, { id: '2' }]),
      };

      ServiceMockHelper.mockMultipleServices([
        { token: 'Service1', mock: mockService1 },
        { token: 'Service2', mock: mockService2 },
      ]);
      
      expect(container.isRegistered('Service1')).toBe(true);
      expect(container.isRegistered('Service2')).toBe(true);
    });
  });

  describe('clearMocks', () => {
    it('should clear all mocks and container instances', () => {
      const mockService = {
        getItem: jest.fn(),
      };

      ServiceMockHelper.mockService(TOKEN, mockService);
      expect(container.isRegistered(TOKEN)).toBe(true);
      
      ServiceMockHelper.clearMocks();
      
      expect(container.isRegistered(TOKEN)).toBe(false);
      expect(jest.getTimerCount()).toBe(0);
    });
  });

  describe('mockRepositoryMethods', () => {
    it('should create a mock repository with specified methods', () => {
      const methods = ['find', 'findById', 'create', 'update', 'delete'];
      const mockRepo = ServiceMockHelper.mockRepositoryMethods('TestRepository', methods);
      
      methods.forEach(method => {
        expect(mockRepo[method]).toBeDefined();
        expect(typeof mockRepo[method]).toBe('function');
      });
    });
  });

  describe('mockSuccessResponse', () => {
    it('should create a mock function that resolves with success response', async () => {
      const data = { id: '1', name: 'Test' };
      const mockFn = ServiceMockHelper.mockSuccessResponse(data);
      
      const result = await mockFn();
      
      expect(result).toEqual({
        success: true,
        data,
      });
    });
  });

  describe('mockErrorResponse', () => {
    it('should create a mock function that rejects with an error', async () => {
      const error = new Error('Test error');
      const mockFn = ServiceMockHelper.mockErrorResponse(error);
      
      await expect(mockFn()).rejects.toThrow('Test error');
    });
  });
});
