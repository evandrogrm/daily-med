import { TestConfig } from '../../config/test.config';
import { ApiTestClient } from '../../helpers/api-test-client';

jest.mock('../../../infrastructure/server', () => ({
  app: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApp = require('../../../infrastructure/server').app;

describe('ApiTestClient', () => {
  let apiClient: ApiTestClient;

  beforeEach(() => {
    (ApiTestClient as any).instance = null;
    apiClient = ApiTestClient.getInstance();

    jest.clearAllMocks();

    mockApp.get.mockImplementation((path: string) => ({
      set: jest.fn().mockReturnThis(),
      query: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      expect: jest.fn().mockReturnThis(),
      end: jest.fn().mockImplementation((callback) => {
        callback(null, { status: 200, body: { success: true, data: {} } });
      }),
    }));

    ['post', 'put', 'delete'].forEach(method => {
      mockApp[method].mockImplementation((path: string) => ({
        set: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        expect: jest.fn().mockReturnThis(),
        end: jest.fn().mockImplementation((callback) => {
          callback(null, { status: 200, body: { success: true, data: {} } });
        }),
      }));
    });
  });

  afterEach(() => {
    apiClient.clearAuthToken();
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = ApiTestClient.getInstance();
      const instance2 = ApiTestClient.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('setAuthToken', () => {
    it('should set the auth token', () => {
      const token = 'test-token';
      apiClient.setAuthToken(token);

      apiClient.get('/test');

      expect(mockApp.get).toHaveBeenCalled();
      const headers = mockApp.get.mock.calls[0][1];
      expect(headers.Authorization).toBe(`Bearer ${token}`);
    });
  });

  describe('clearAuthToken', () => {
    it('should clear the auth token', () => {
      apiClient.setAuthToken('test-token');
      apiClient.clearAuthToken();

      apiClient.get('/test');

      expect(mockApp.get).toHaveBeenCalled();
      const headers = mockApp.get.mock.calls[0][1];
      expect(headers.Authorization).toBeUndefined();
    });
  });

  describe('HTTP methods', () => {
    it('should make a GET request', async () => {
      const endpoint = '/test';
      const query = { page: 1, limit: 10 };

      await apiClient.get(endpoint, query);

      expect(mockApp.get).toHaveBeenCalledWith(
        `${TestConfig.API_PREFIX}${endpoint}`,
        expect.any(Function)
      );
    });

    it('should make a POST request', async () => {
      const endpoint = '/test';
      const data = { name: 'Test' };

      await apiClient.post(endpoint, data);

      expect(mockApp.post).toHaveBeenCalledWith(
        `${TestConfig.API_PREFIX}${endpoint}`,
        expect.any(Function)
      );
    });

    it('should make a PUT request', async () => {
      const endpoint = '/test/1';
      const data = { name: 'Updated Test' };

      await apiClient.put(endpoint, data);

      expect(mockApp.put).toHaveBeenCalledWith(
        `${TestConfig.API_PREFIX}${endpoint}`,
        expect.any(Function)
      );
    });

    it('should make a DELETE request', async () => {
      const endpoint = '/test/1';

      await apiClient.delete(endpoint);

      expect(mockApp.delete).toHaveBeenCalledWith(
        `${TestConfig.API_PREFIX}${endpoint}`,
        expect.any(Function)
      );
    });
  });

  describe('auth methods', () => {
    it('should handle login', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = {
        status: 200,
        body: { success: true, data: { token: 'test-token' } },
      };

      mockApp.post.mockImplementationOnce(() => ({
        send: jest.fn().mockReturnThis(),
        end: jest.fn().mockImplementation((callback) => {
          callback(null, mockResponse);
        }),
      }));

      const response = await apiClient.login(credentials);

      expect(response).toBe(mockResponse);
      expect(apiClient['authToken']).toBe('test-token');
    });

    it('should handle logout', () => {
      apiClient.setAuthToken('test-token');
      expect(apiClient['authToken']).toBe('test-token');

      apiClient.logout();

      expect(apiClient['authToken']).toBeNull();
    });
  });
});
