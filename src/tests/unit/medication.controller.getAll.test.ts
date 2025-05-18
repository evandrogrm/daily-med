import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { MedicationController } from '../../infrastructure/controllers/medication.controller';
import { IMedicationService } from '@core/domain/interfaces/services/medication.service.interface';
import { Medication } from '@core/domain/entities/medication.entity';

describe('MedicationController - getAllMedications', () => {
  let controller: MedicationController;
  let mockMedicationService: jest.Mocked<IMedicationService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;
  
  const mockMedications: Medication[] = [
    {
      id: '1',
      name: 'Ibuprofen',
      dosage: '200mg',
      frequency: 'Every 6 hours',
      description: 'Pain reliever and fever reducer',
      activeIngredients: ['Ibuprofen'],
      sideEffects: ['Upset stomach', 'Heartburn'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Paracetamol',
      dosage: '500mg',
      frequency: 'Every 4-6 hours',
      description: 'Pain reliever and fever reducer',
      activeIngredients: ['Paracetamol'],
      sideEffects: ['Nausea', 'Liver damage in high doses'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  beforeEach(() => {
    container.clearInstances();

    mockMedicationService = {
      getAllMedications: jest.fn(),
    } as any;

    container.registerInstance('IMedicationService', mockMedicationService);
    controller = new MedicationController(mockMedicationService);

    responseObject = [];
    mockResponse = {
      json: jest.fn().mockImplementation((result) => {
        responseObject = result;
        return mockResponse as Response;
      }),
    };
  });

  it('should return an array of medications', async () => {
    mockRequest = {};
    mockMedicationService.getAllMedications.mockResolvedValue(mockMedications);

    await controller.getAllMedications(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockMedicationService.getAllMedications).toHaveBeenCalled();
    expect(responseObject).toEqual(mockMedications);
  });

  it('should return an empty array when no medications exist', async () => {
    mockRequest = {};
    mockMedicationService.getAllMedications.mockResolvedValue([]);

    await controller.getAllMedications(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockMedicationService.getAllMedications).toHaveBeenCalled();
    expect(responseObject).toEqual([]);
  });

  it('should handle service errors', async () => {
    mockRequest = {};
    const error = new Error('Database error');
    mockMedicationService.getAllMedications.mockRejectedValue(error);

    const next = jest.fn();
    
    await expect(
      controller.getAllMedications(
        mockRequest as Request,
        mockResponse as Response,
        next
      )
    ).rejects.toThrow('Database error');
    
    expect(mockMedicationService.getAllMedications).toHaveBeenCalled();
  });
});
