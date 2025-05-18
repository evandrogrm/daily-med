import { TestConfig } from './config/test.config';
import { apiClient } from './helpers/api-test-client';
import { AuthTestHelper } from './helpers/auth-test.helper';
import { DBTestHelper } from './helpers/db-test.helper';
import { ServiceMockHelper } from './helpers/service-mock.helper';

export class BaseTest {
  static async beforeAll() {
    jest.setTimeout(TestConfig.TEST_TIMEOUT);

    await DBTestHelper.setupTestDatabase();
  }

  static async afterAll() {
    await DBTestHelper.teardownTestDatabase();
  }

  static beforeEach() {
    ServiceMockHelper.clearMocks();

    apiClient.clearAuthToken();
  }

  static afterEach() {
    ServiceMockHelper.clearMocks();
  }

  protected async withAuth(testFn: (token: string) => Promise<void>) {
    return AuthTestHelper.withAuth(testFn);
  }

  protected async createTestMedication(overrides: any = {}) {
    return DBTestHelper.createTestMedication(overrides);
  }

  protected async createTestMedications(count: number, overrides: any = {}) {
    return DBTestHelper.createTestMedications(count, overrides);
  }

  protected mockService<T>(token: string, mockImplementation: any): jest.Mocked<T> {
    return ServiceMockHelper.mockService<T>(token, mockImplementation);
  }
}
