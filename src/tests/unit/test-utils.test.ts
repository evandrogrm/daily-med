import { mockRequest, mockResponse, mockNext, mockError } from '../../../test-utils';

describe('Test Utils', () => {
  describe('mockRequest', () => {
    it('should create a mock request object', () => {
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
    it('should create a mock response object with chainable methods', () => {
      const res = mockResponse();
      
      // Test status chaining
      const statusResult = res.status(200);
      expect(statusResult).toBe(res);
      
      // Test json chaining
      const jsonResult = res.json({ success: true });
      expect(jsonResult).toBe(res);
      
      // Test send chaining
      const sendResult = res.send('test');
      expect(sendResult).toBe(res);
      
      // Test that methods were called
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true });
      expect(res.send).toHaveBeenCalledWith('test');
    });
  });

  describe('mockNext', () => {
    it('should create a mock next function', () => {
      const error = new Error('Test error');
      
      // Call the mock next function
      mockNext(error);
      
      // Check that it was called with the error
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('mockError', () => {
    it('should create an error with status code', () => {
      const message = 'Not found';
      const status = 404;
      
      const error = mockError(message, status);
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(message);
      expect(error.status).toBe(status);
    });

    it('should default to 500 status code if not provided', () => {
      const message = 'Server error';
      
      const error = mockError(message);
      
      expect(error.status).toBe(500);
    });
  });

  describe('mockValidationError', () => {
    it('should create a validation error with field errors', () => {
      const errors = [
        { field: 'name', message: 'Name is required' },
        { field: 'email', message: 'Invalid email' },
      ];
      
      const error = mockValidationError('Validation failed', errors);
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Validation failed');
      expect(error.status).toBe(400);
      expect(error.errors).toEqual(errors);
    });
  });
});

// Helper function used in the test
function mockValidationError(message: string, errors: any[]): any {
  const error: any = new Error(message);
  error.status = 400;
  error.errors = errors;
  return error;
}
