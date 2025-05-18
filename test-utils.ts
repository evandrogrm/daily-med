import { Request, Response, NextFunction } from 'express';

export const mockRequest = (body: any = {}, params: any = {}, query: any = {}): Partial<Request> => ({
  body,
  params,
  query,
  headers: {},
});

export const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

export const mockNext = (): NextFunction => 
  jest.fn().mockImplementation((error) => {
    if (error) throw error;
  });

export const mockError = (message: string, statusCode: number = 400) => {
  const error = new Error(message) as any;
  error.statusCode = statusCode;
  return error;
};
