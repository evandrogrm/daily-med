import { Medication } from '@core/domain/entities/medication.entity';
import { MedicationService } from '@infrastructure/services/medication.service';
import { IMedicationRepository } from '@core/domain/interfaces/repositories/medication.repository.interface';

describe('MedicationService - searchMedications', () => {
  let service: MedicationService;
  let mockRepository: jest.Mocked<IMedicationRepository>;
  
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
      name: 'Ibuprofen Plus',
      dosage: '400mg',
      frequency: 'Every 8 hours',
      description: 'Stronger pain reliever',
      activeIngredients: ['Ibuprofen', 'Codeine'],
      sideEffects: ['Drowsiness', 'Dizziness'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  beforeEach(() => {
    mockRepository = {
      search: jest.fn(),
    } as any;
    service = new MedicationService(mockRepository);
  });

  it('should return medications matching the search query', async () => {
    const query = 'ibuprofen';
    mockRepository.search.mockResolvedValue(mockMedications);
    
    const result = await service.searchMedications(query);
    
    expect(mockRepository.search).toHaveBeenCalledWith(query);
    expect(result).toEqual(mockMedications);
  });

  it('should return an empty array when no medications match the query', async () => {
    const query = 'nonexistent';
    mockRepository.search.mockResolvedValue([]);
    
    const result = await service.searchMedications(query);
    
    expect(mockRepository.search).toHaveBeenCalledWith(query);
    expect(result).toEqual([]);
  });

  it('should handle empty search query', async () => {
    const query = '';
    mockRepository.search.mockResolvedValue(mockMedications);
    
    const result = await service.searchMedications(query);
    
    expect(mockRepository.search).toHaveBeenCalledWith(query);
    expect(result).toEqual(mockMedications);
  });

  it('should handle repository errors', async () => {
    const query = 'error';
    const error = new Error('Database error');
    mockRepository.search.mockRejectedValue(error);
    
    await expect(service.searchMedications(query)).rejects.toThrow('Database error');
    expect(mockRepository.search).toHaveBeenCalledWith(query);
  });
});
