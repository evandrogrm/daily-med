import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { MedicationController } from '../../infrastructure/controllers/medication.controller';
import { IMedicationService } from '@core/domain/interfaces/services/medication.service.interface';
import { Medication } from '../../core/domain/entities/medication.entity';

describe('MedicationController', () => {
  let controller: MedicationController;
  let mockMedicationService: jest.Mocked<IMedicationService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;
  
  const mockMedication: Medication = {
    id: '1',
    name: 'Test Medication',
    dosage: '100mg',
    frequency: 'Once daily',
    description: 'Test description',
    activeIngredients: ['Test Ingredient'],
    sideEffects: ['Headache'],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    container.clearInstances();

    mockMedicationService = {
      createMedication: jest.fn(),
      getMedicationById: jest.fn(),
      getAllMedications: jest.fn(),
      updateMedication: jest.fn(),
      deleteMedication: jest.fn(),
      searchMedications: jest.fn(),
      extractAndMapIndications: jest.fn(),
    };

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

  describe('createMedication', () => {
    it('should create a new medication', async () => {
      const { id, ...medicationData } = mockMedication;
      
      mockRequest = {
        body: medicationData,
      };

      mockMedicationService.createMedication.mockResolvedValue(mockMedication);

      await controller.createMedication[1](
        mockRequest as Request,
        mockResponse as Response,
        jest.fn()
      );

      expect(mockMedicationService.createMedication).toHaveBeenCalledWith(medicationData);
      expect(responseObject.status).toHaveBeenCalledWith(201);
      expect(responseObject.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          ...medicationData,
        })
      );
    });
  });

  describe('getMedication', () => {
    it('should return a medication by id', async () => {
      const medication = {
        id: '1',
        name: 'Ibuprofen',
        dosage: '200mg',
        frequency: 'Every 6 hours',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest = {
        params: { id: '1' },
      };

      mockMedicationService.getMedicationById.mockResolvedValue(medication);

      await controller.getMedication(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockMedicationService.getMedicationById).toHaveBeenCalledWith('1');
      expect(responseObject).toEqual(medication);
    });

    it('should return 404 if medication not found', async () => {
      mockRequest = {
        params: { id: 'nonexistent' },
      };

      mockMedicationService.getMedicationById.mockResolvedValue(null);

      await controller.getMedication(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject).toEqual({ message: 'Medication not found' });
    });
  });

});
