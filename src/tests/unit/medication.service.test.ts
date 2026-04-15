import { Medication } from '@core/domain/entities/medication.entity';
import { MedicationService } from '@infrastructure/services/medication.service';
import { IMedicationRepository } from '@core/domain/interfaces/repositories/medication.repository.interface';
import { CreateMedicationDto } from '@application/dtos/create-medication.dto';

describe('MedicationService', () => {
  let service: MedicationService;
  let mockRepository: jest.Mocked<IMedicationRepository>;
  
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
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      search: jest.fn()
    };
    service = new MedicationService(mockRepository);
  });

  describe('createMedication', () => {
    it('should create a new medication', async () => {
      const medicationData: CreateMedicationDto = {
        name: 'Ibuprofen',
        dosage: '200mg',
        frequency: 'Every 6 hours',
      };

      const expectedMedication: Medication = {
        id: '1',
        ...medicationData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockResolvedValue(expectedMedication);

      const result = await service.createMedication(medicationData);

      expect(mockRepository.create).toHaveBeenCalledWith(medicationData);
      expect(result).toEqual(expect.objectContaining({
        id: '1',
        ...medicationData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }));
      expect(result).toEqual(expectedMedication);
    });

    it('should handle repository errors during create', async () => {
      const medicationData: CreateMedicationDto = {
        name: 'Ibuprofen',
        dosage: '200mg',
        frequency: 'Every 6 hours',
      };
      const error = new Error('Create failed');
      mockRepository.create.mockRejectedValue(error);

      await expect(service.createMedication(medicationData)).rejects.toThrow('Create failed');
      expect(mockRepository.create).toHaveBeenCalledWith(medicationData);
    });
  });

  describe('getMedicationById', () => {
    it('should return a medication by id', async () => {
      mockRepository.findById.mockResolvedValue(mockMedication);

      const result = await service.getMedicationById('1');

      expect(result).toEqual(mockMedication);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if medication not found', async () => {
      mockRepository.findById.mockResolvedValue(null);
      
      const result = await service.getMedicationById('999');
      expect(result).toBeNull();
      expect(mockRepository.findById).toHaveBeenCalledWith('999');
    });
  });
});
