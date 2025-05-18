import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { MedicationController } from '../../infrastructure/controllers/medication.controller';
import { IMedicationService } from '@core/domain/interfaces/services/medication.service.interface';
import { Medication } from '@core/domain/entities/medication.entity';
import { UpdateMedicationDto } from '@application/dtos/update-medication.dto';

describe('MedicationController - updateMedication', () => {
  let controller: MedicationController;
  let mockMedicationService: jest.Mocked<IMedicationService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;
  
  const existingMedication: Medication = {
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

  const updateData: UpdateMedicationDto = {
    name: 'Ibuprofen Updated',
    dosage: '400mg',
    frequency: 'Every 8 hours',
    description: 'Updated description'
  };

  const updatedMedication: Medication = {
    ...existingMedication,
    ...updateData,
    updatedAt: new Date()
  };

  beforeEach(() => {
    container.clearInstances();

    mockMedicationService = {
      getMedicationById: jest.fn(),
      updateMedication: jest.fn(),
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

  it('should update an existing medication', async () => {
    mockRequest = {
      params: { id: '1' },
      body: updateData
    };
    
    mockMedicationService.updateMedication.mockResolvedValue(updatedMedication);

    await controller.updateMedication[1](
      mockRequest as Request,
      mockResponse as Response,
      jest.fn()
    );

    expect(mockMedicationService.updateMedication).toHaveBeenCalledWith('1', updateData);
    expect(responseObject).toEqual(updatedMedication);
  });

  it('should return 404 when medication does not exist', async () => {
    mockRequest = {
      params: { id: '999' },
      body: updateData
    };
    
    mockMedicationService.updateMedication.mockResolvedValue(null);

    await controller.updateMedication[1](
      mockRequest as Request,
      mockResponse as Response,
      jest.fn()
    );

    expect(mockMedicationService.updateMedication).toHaveBeenCalledWith('999', updateData);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(responseObject).toEqual({ message: 'Medication not found' });
  });

  it('should handle validation errors', async () => {
    // This test would typically be handled by the validation middleware
    // We're just checking that the controller passes the data to the service
    const invalidData = { name: '' }; // Invalid: name is required
    mockRequest = {
      params: { id: '1' },
      body: invalidData
    };
    
    // The validation middleware would catch this before the controller is called
    // So we don't expect the service to be called
    await expect(
      controller.updateMedication[1](
        mockRequest as Request,
        mockResponse as Response,
        jest.fn()
      )
    ).rejects.toThrow(); // The validation middleware would throw an error
  });

  it('should handle service errors', async () => {
    mockRequest = {
      params: { id: '1' },
      body: updateData
    };
    
    const error = new Error('Database error');
    mockMedicationService.updateMedication.mockRejectedValue(error);

    const next = jest.fn();
    
    await expect(
      controller.updateMedication[1](
        mockRequest as Request,
        mockResponse as Response,
        next
      )
    ).rejects.toThrow('Database error');
    
    expect(mockMedicationService.updateMedication).toHaveBeenCalledWith('1', updateData);
  });
});
