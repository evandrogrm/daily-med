import { Medication } from '@core/domain/entities/medication.entity';
import { MedicationService } from '@infrastructure/services/medication.service';
import { IMedicationRepository } from '@core/domain/interfaces/repositories/medication.repository.interface';

describe('MedicationService - getAllMedications', () => {
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
    mockRepository = {
      findAll: jest.fn(),
    } as any;
    service = new MedicationService(mockRepository);
  });

  it('should return an array of medications', async () => {
    mockRepository.findAll.mockResolvedValue(mockMedications);
    
    const result = await service.getAllMedications();
    
    expect(result).toEqual(mockMedications);
    expect(mockRepository.findAll).toHaveBeenCalled();
  });

  it('should return an empty array when no medications exist', async () => {
    mockRepository.findAll.mockResolvedValue([]);
    
    const result = await service.getAllMedications();
    
    expect(result).toEqual([]);
    expect(mockRepository.findAll).toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    const error = new Error('Database error');
    mockRepository.findAll.mockRejectedValue(error);
    
    await expect(service.getAllMedications()).rejects.toThrow('Database error');
    expect(mockRepository.findAll).toHaveBeenCalled();
  });
});
