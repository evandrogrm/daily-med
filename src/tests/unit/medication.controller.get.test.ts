import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { MedicationController } from '../../infrastructure/controllers/medication.controller';
import { IMedicationService } from '@core/domain/interfaces/services/medication.service.interface';
import { Medication } from '@core/domain/entities/medication.entity';

describe('MedicationController - getMedication', () => {
  let controller: MedicationController;
  let mockMedicationService: jest.Mocked<IMedicationService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;
  
  const mockMedication: Medication = {
    id: '1',
    name: 'Ibuprofen',
    dosage: '200mg',
    frequency: 'Every 6 hours',
    description: 'Pain reliever and fever reducer',
    activeIngredients: ['Ibuprofen'],
    sideEffects: ['Upset stomach', 'Heartburn'],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    container.clearInstances();

    mockMedicationService = {
      getMedicationById: jest.fn(),
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
    };
  });

  it('should return a medication when found', async () => {
    mockRequest = { params: { id: '1' } };
    mockMedicationService.getMedicationById.mockResolvedValue(mockMedication);

    await controller.getMedication(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockMedicationService.getMedicationById).toHaveBeenCalledWith('1');
    expect(responseObject).toEqual(mockMedication);
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should return 404 when medication is not found', async () => {
    mockRequest = { params: { id: '999' } };
    mockMedicationService.getMedicationById.mockResolvedValue(null);

    await controller.getMedication(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockMedicationService.getMedicationById).toHaveBeenCalledWith('999');
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(responseObject).toEqual({ message: 'Medication not found' });
  });

  it('should handle service errors', async () => {
    mockRequest = { params: { id: '1' } };
    const error = new Error('Database error');
    mockMedicationService.getMedicationById.mockRejectedValue(error);

    const next = jest.fn();
    
    await expect(
      controller.getMedication(
        mockRequest as Request,
        mockResponse as Response,
        next
      )
    ).rejects.toThrow('Database error');
    
    expect(mockMedicationService.getMedicationById).toHaveBeenCalledWith('1');
  });
});
