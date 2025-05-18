import { Response } from 'express';
import { container } from 'tsyringe';

export const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

export const mockNext = jest.fn();

export const clearContainer = () => {
  container.clearInstances();
};

export const mockRequest = (body: any = {}, params: any = {}, query: any = {}): any => ({
  body,
  params,
  query,
  headers: {},
  get: jest.fn(),
});

export const mockError = (message: string, status: number = 400) => {
  const error: any = new Error(message);
  error.status = status;
  return error;
};

export const mockMedication = (overrides: any = {}) => ({
  id: '507f1f77bcf86cd799439011',
  name: 'Test Medication',
  dosage: '100mg',
  frequency: 'Once daily',
  description: 'Test description',
  activeIngredients: ['Test Ingredient'],
  sideEffects: ['Test Side Effect'],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
