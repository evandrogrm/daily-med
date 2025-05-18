import { Medication } from '@core/domain/entities/medication.entity';
import { MedicationService } from '@infrastructure/services/medication.service';
import { IMedicationRepository } from '@core/domain/interfaces/repositories/medication.repository.interface';

describe('MedicationService - getMedicationById', () => {
  let service: MedicationService;
  let mockRepository: jest.Mocked<IMedicationRepository>;
  
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
    mockRepository = {
      findById: jest.fn(),
    } as any;
    service = new MedicationService(mockRepository);
  });

  it('should return a medication when found', async () => {
    mockRepository.findById.mockResolvedValue(mockMedication);
    
    const result = await service.getMedicationById('1');
    
    expect(result).toEqual(mockMedication);
    expect(mockRepository.findById).toHaveBeenCalledWith('1');
  });

  it('should return null when medication is not found', async () => {
    mockRepository.findById.mockResolvedValue(null);
    
    const result = await service.getMedicationById('999');
    
    expect(result).toBeNull();
    expect(mockRepository.findById).toHaveBeenCalledWith('999');
  });

  it('should handle repository errors', async () => {
    const error = new Error('Database error');
    mockRepository.findById.mockRejectedValue(error);
    
    await expect(service.getMedicationById('1')).rejects.toThrow('Database error');
    expect(mockRepository.findById).toHaveBeenCalledWith('1');
  });
});
