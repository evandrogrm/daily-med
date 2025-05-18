import { AuthTestHelper } from '../../helpers/auth-test.helper';
import { TestConfig } from '../../config/test.config';
import { apiClient } from '../../helpers/api-test-client';

// Mock the API client
jest.mock('../../helpers/api-test-client', () => ({
  apiClient: {
    post: jest.fn().mockResolvedValue({
      status: 200,
      body: { success: true, data: { token: 'test-token' } },
    }),
  },
}));

describe('AuthTestHelper', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login a user with valid credentials', async () => {
      const credentials = {
        email: testUser.email,
        password: testUser.password,
      };

      const result = await AuthTestHelper.login(credentials);
      
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual({
        status: 200,
        body: { success: true, data: { token: 'test-token' } },
      });
    });
  });

  describe('loginAsTestUser', () => {
    it('should login as test user', async () => {
      const result = await AuthTestHelper.loginAsTestUser();
      
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: TestConfig.TEST_USER_EMAIL,
        password: TestConfig.TEST_USER_PASSWORD,
      });
      expect(result).toBe('test-token');
    });
  });

  describe('withAuth', () => {
    it('should execute callback with auth token', async () => {
      const callback = jest.fn().mockResolvedValue('test result');
      
      const result = await AuthTestHelper.withAuth(callback);
      
      expect(callback).toHaveBeenCalledWith('test-token');
      expect(result).toBe('test result');
    });

    it('should pass the token to the callback', async () => {
      const token = 'custom-test-token';
      const callback = jest.fn().mockImplementation((t) => t);
      
      // Mock login to return custom token
      jest.spyOn(AuthTestHelper, 'loginAsTestUser').mockResolvedValueOnce(token);
      
      const result = await AuthTestHelper.withAuth(callback);
      
      expect(callback).toHaveBeenCalledWith(token);
      expect(result).toBe(token);
    });
  });

  describe('createTestUser', () => {
    it('should create a test user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      // Mock the API response for user creation
      const mockResponse = {
        status: 201,
        body: { success: true, data: { ...userData, id: 'test-user-id' } },
      };
      
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      const result = await AuthTestHelper.createTestUser(userData);
      
      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
        ...userData,
        confirmPassword: userData.password,
      });
      expect(result).toEqual(mockResponse.body.data);
    });
  });

  describe('getAuthHeaders', () => {
    it('should return auth headers with token', () => {
      const token = 'test-token';
      const headers = AuthTestHelper.getAuthHeaders(token);
      
      expect(headers).toEqual({
        Authorization: `Bearer ${token}`,
      });
    });
  });
});
