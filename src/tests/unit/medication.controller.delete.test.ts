import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { MedicationController } from '../../infrastructure/controllers/medication.controller';
import { IMedicationService } from '@core/domain/interfaces/services/medication.service.interface';

describe('MedicationController - deleteMedication', () => {
  let controller: MedicationController;
  let mockMedicationService: jest.Mocked<IMedicationService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;
  
  beforeEach(() => {
    container.clearInstances();

    mockMedicationService = {
      getMedicationById: jest.fn(),
      deleteMedication: jest.fn(),
    } as any;

    container.registerInstance('IMedicationService', mockMedicationService);
    controller = new MedicationController(mockMedicationService);

    responseObject = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((result) => {
        responseObject = result;
        return mockResponse as Response;
      }),
      send: jest.fn().mockReturnThis(),
    };
  });

  it('should delete an existing medication', async () => {
    const medicationId = '1';
    mockRequest = {
      params: { id: medicationId },
    };
    
    mockMedicationService.deleteMedication.mockResolvedValue(true);

    await controller.deleteMedication(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockMedicationService.deleteMedication).toHaveBeenCalledWith(medicationId);
    expect(mockResponse.status).toHaveBeenCalledWith(204);
    expect(mockResponse.send).toHaveBeenCalled();
  });

  it('should return 404 when medication does not exist', async () => {
    const medicationId = '999';
    mockRequest = {
      params: { id: medicationId },
    };
    
    mockMedicationService.deleteMedication.mockResolvedValue(false);

    await controller.deleteMedication(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockMedicationService.deleteMedication).toHaveBeenCalledWith(medicationId);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(responseObject).toEqual({ message: 'Medication not found' });
  });

  it('should handle service errors', async () => {
    const medicationId = '1';
    mockRequest = {
      params: { id: medicationId },
    };
    
    const error = new Error('Database error');
    mockMedicationService.deleteMedication.mockRejectedValue(error);

    const next = jest.fn();
    
    await expect(
      controller.deleteMedication(
        mockRequest as Request,
        mockResponse as Response,
        next
      )
    ).rejects.toThrow('Database error');
    
    expect(mockMedicationService.deleteMedication).toHaveBeenCalledWith(medicationId);
  });
});
