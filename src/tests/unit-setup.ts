import 'reflect-metadata';

process.env.NODE_ENV = 'test';

afterEach(() => {
  jest.clearAllMocks();
});
