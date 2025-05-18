import { Response } from 'superagent';
import { TestConfig } from '../config/test.config';

export class HttpTestHelper {
  static expectSuccessResponse(response: Response, statusCode = 200) {
    expect(response.status).toBe(statusCode);
    expect(response.body).toBeDefined();
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    return response.body.data;
  }

  static expectErrorResponse(response: Response, statusCode: number, errorMessage?: string) {
    expect(response.status).toBe(statusCode);
    expect(response.body).toBeDefined();
    expect(response.body.success).toBe(false);
    
    if (errorMessage) {
      expect(response.body.message).toContain(errorMessage);
    }
    
    return response.body;
  }

  static expectValidationError(response: Response, field: string) {
    expect(response.status).toBe(400);
    expect(response.body).toBeDefined();
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toBeDefined();
    expect(Array.isArray(response.body.errors)).toBe(true);
    
    if (field) {
      const fieldError = response.body.errors.find((e: any) => e.path.includes(field));
      expect(fieldError).toBeDefined();
      return fieldError;
    }
    
    return response.body.errors;
  }

  static expectPagination(response: Response, expectedTotal: number, page = 1, limit = TestConfig.DEFAULT_LIMIT) {
    const { data, pagination } = response.body;
    
    expect(Array.isArray(data)).toBe(true);
    expect(pagination).toBeDefined();
    expect(pagination.total).toBe(expectedTotal);
    expect(pagination.page).toBe(page);
    expect(pagination.limit).toBe(limit);
    expect(pagination.pages).toBe(Math.ceil(expectedTotal / limit));
    
    return { data, pagination };
  }
}
