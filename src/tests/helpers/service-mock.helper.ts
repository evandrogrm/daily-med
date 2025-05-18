import { container } from 'tsyringe';

export class ServiceMockHelper {
  static mockService<T>(token: string, mockImplementation: any): jest.Mocked<T> {
    container.clearInstances();

    const mock = mockImplementation as jest.Mocked<T>;

    container.register(token, { useValue: mock });

    return mock;
  }

  static mockMultipleServices(mocks: Array<{ token: string; mock: any }>): void {
    container.clearInstances();

    mocks.forEach(({ token, mock }) => {
      container.register(token, { useValue: mock });
    });
  }

  static clearMocks(): void {
    container.clearInstances();
    jest.clearAllMocks();
  }

  static mockRepositoryMethods(repository: any, methods: string[]): jest.Mocked<typeof repository> {
    const mockRepository = {} as any;

    methods.forEach(method => {
      mockRepository[method] = jest.fn();
    });

    return mockRepository as jest.Mocked<typeof repository>;
  }

  static mockSuccessResponse(data: any) {
    return jest.fn().mockResolvedValue({
      success: true,
      data,
    });
  }

  static mockErrorResponse(error: Error) {
    return jest.fn().mockRejectedValue(error);
  }
}
