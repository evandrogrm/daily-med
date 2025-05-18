import { Response } from 'express';
import { HttpTestHelper } from '../../helpers/http-test.helper';

describe('HttpTestHelper', () => {
  describe('expectSuccessResponse', () => {
    it('should validate a successful response', () => {
      const mockRes = {
        status: 200,
        body: {
          success: true,
          data: { id: '123', name: 'Test' },
        },
      } as unknown as Response;

      const result = HttpTestHelper.expectSuccessResponse(mockRes);
      
      expect(result).toEqual(mockRes.body.data);
    });

    it('should validate a successful response with custom status code', () => {
      const mockRes = {
        status: 201,
        body: {
          success: true,
          data: { id: '123', name: 'Test' },
        },
      } as unknown as Response;

      const result = HttpTestHelper.expectSuccessResponse(mockRes, 201);
      
      expect(result).toEqual(mockRes.body.data);
    });
  });

  describe('expectErrorResponse', () => {
    it('should validate an error response', () => {
      const mockRes = {
        status: 404,
        body: {
          success: false,
          message: 'Not found',
        },
      } as unknown as Response;

      const result = HttpTestHelper.expectErrorResponse(mockRes, 404, 'Not found');
      
      expect(result).toEqual(mockRes.body);
    });

    it('should validate an error response without message check', () => {
      const mockRes = {
        status: 500,
        body: {
          success: false,
          message: 'Internal server error',
        },
      } as unknown as Response;

      const result = HttpTestHelper.expectErrorResponse(mockRes, 500);
      
      expect(result).toEqual(mockRes.body);
    });
  });

  describe('expectValidationError', () => {
    it('should validate a validation error response', () => {
      const mockRes = {
        status: 400,
        body: {
          success: false,
          errors: [
            { path: ['name'], message: 'Name is required' },
            { path: ['email'], message: 'Invalid email' },
          ],
        },
      } as unknown as Response;

      const result = HttpTestHelper.expectValidationError(mockRes, 'name');
      
      expect(result).toBeDefined();
      expect(result.path).toContain('name');
      expect(result.message).toBe('Name is required');
    });

    it('should return all errors when no field is specified', () => {
      const mockRes = {
        status: 400,
        body: {
          success: false,
          errors: [
            { path: ['name'], message: 'Name is required' },
            { path: ['email'], message: 'Invalid email' },
          ],
        },
      } as unknown as Response;

      const result = HttpTestHelper.expectValidationError(mockRes);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });
  });

  describe('expectPagination', () => {
    it('should validate a paginated response', () => {
      const items = [{ id: '1' }, { id: '2' }];
      const mockRes = {
        body: {
          data: items,
          pagination: {
            total: 2,
            page: 1,
            limit: 10,
            pages: 1,
          },
        },
      } as unknown as Response;

      const { data, pagination } = HttpTestHelper.expectPagination(mockRes, 2);
      
      expect(data).toEqual(items);
      expect(pagination.total).toBe(2);
      expect(pagination.page).toBe(1);
      expect(pagination.limit).toBe(10);
      expect(pagination.pages).toBe(1);
    });

    it('should validate pagination with custom page and limit', () => {
      const items = Array(15).fill({ id: '1' });
      const mockRes = {
        body: {
          data: items,
          pagination: {
            total: 50,
            page: 2,
            limit: 15,
            pages: 4,
          },
        },
      } as unknown as Response;

      const { pagination } = HttpTestHelper.expectPagination(mockRes, 50, 2, 15);
      
      expect(pagination.total).toBe(50);
      expect(pagination.page).toBe(2);
      expect(pagination.limit).toBe(15);
      expect(pagination.pages).toBe(4);
    });
  });
});
