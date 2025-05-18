import { TestConfig } from '../config/test.config';
import { apiClient } from './api-test-client';

export class AuthTestHelper {
  private static testUser = {
    email: TestConfig.TEST_USER.email,
    password: TestConfig.TEST_USER.password,
  };

  static async loginAsTestUser() {
    try {
      await apiClient.post('/auth/register', {
        ...this.testUser,
        name: 'Test User',
      });
    } catch (error) {
    }

    const response = await apiClient.login(this.testUser);
    return response.body.token;
  }

  static async getAuthToken() {
    const token = await this.loginAsTestUser();
    apiClient.setAuthToken(token);
    return token;
  }

  static async withAuth(
    testFn: (token: string) => Promise<void>,
    setupFn?: () => Promise<void>
  ) {
    const token = await this.getAuthToken();

    if (setupFn) {
      await setupFn();
    }

    try {
      await testFn(token);
    } finally {
      apiClient.clearAuthToken();
    }
  }

  static async withAdmin(testFn: (token: string) => Promise<void>) {
    return this.withAuth(testFn, async () => {
    });
  }
}
