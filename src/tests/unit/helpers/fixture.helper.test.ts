import { FixtureHelper } from '../../helpers/fixture.helper';

describe('FixtureHelper', () => {
  describe('createMedicationData', () => {
    it('should create medication data with default values', () => {
      const data = FixtureHelper.createMedicationData();

      expect(data).toBeDefined();
      expect(data.name).toBeDefined();
      expect(data.dosage).toMatch(/\d+mg/);
      expect(data.frequency).toBeDefined();
      expect(data.description).toBeDefined();
      expect(Array.isArray(data.activeIngredients)).toBe(true);
      expect(Array.isArray(data.sideEffects)).toBe(true);
    });

    it('should override default values with provided overrides', () => {
      const overrides = {
        name: 'Custom Medication',
        dosage: '500mg',
      };

      const data = FixtureHelper.createMedicationData(overrides);

      expect(data.name).toBe(overrides.name);
      expect(data.dosage).toBe(overrides.dosage);
      expect(data.frequency).toBeDefined();
    });
  });

  describe('createUserData', () => {
    it('should create user data with default values', () => {
      const data = FixtureHelper.createUserData();

      expect(data).toBeDefined();
      expect(data.name).toBeDefined();
      expect(data.email).toBeDefined();
      expect(data.email).toContain('@');
      expect(data.username).toBeDefined();
      expect(data.password).toBe('Test@123');
      expect(data.confirmPassword).toBe('Test@123');
      expect(data.role).toBe('user');
    });

    it('should override default values with provided overrides', () => {
      const overrides = {
        name: 'Admin User',
        role: 'admin',
      };

      const data = FixtureHelper.createUserData(overrides);

      expect(data.name).toBe(overrides.name);
      expect(data.role).toBe(overrides.role);
      expect(data.email).toBeDefined();
    });
  });

  describe('createPaginationData', () => {
    it('should create pagination data with default values', () => {
      const items = [{ id: '1' }, { id: '2' }];
      const total = 10;

      const result = FixtureHelper.createPaginationData(items, total);

      expect(result.data).toBe(items);
      expect(result.pagination.total).toBe(total);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.pages).toBe(1);
    });

    it('should create pagination data with custom page and limit', () => {
      const items = Array(15).fill({ id: '1' });
      const total = 50;
      const page = 2;
      const limit = 15;

      const result = FixtureHelper.createPaginationData(items, total, page, limit);

      expect(result.pagination.page).toBe(page);
      expect(result.pagination.limit).toBe(limit);
      expect(result.pagination.pages).toBe(4);
    });
  });

  describe('createErrorResponse', () => {
    it('should create an error response with message', () => {
      const message = 'Test error';
      const response = FixtureHelper.createErrorResponse(message);

      expect(response.success).toBe(false);
      expect(response.message).toBe(message);
      expect(Array.isArray(response.errors)).toBe(true);
      expect(response.timestamp).toBeDefined();
    });

    it('should include errors if provided', () => {
      const errors = [
        { field: 'name', message: 'Name is required' },
        { field: 'email', message: 'Invalid email' },
      ];

      const response = FixtureHelper.createErrorResponse('Validation failed', errors);

      expect(response.errors).toBe(errors);
    });
  });
});
