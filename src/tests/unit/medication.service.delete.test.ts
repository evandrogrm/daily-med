import { MedicationService } from '@infrastructure/services/medication.service';
import { IMedicationRepository } from '@core/domain/interfaces/repositories/medication.repository.interface';

describe('MedicationService - deleteMedication', () => {
  let service: MedicationService;
  let mockRepository: jest.Mocked<IMedicationRepository>;
  
  beforeEach(() => {
    mockRepository = {
      delete: jest.fn(),
    } as any;
    service = new MedicationService(mockRepository);
  });

  it('should delete an existing medication and return true', async () => {
    const medicationId = '1';
    mockRepository.delete.mockResolvedValue(true);
    
    const result = await service.deleteMedication(medicationId);
    
    expect(mockRepository.delete).toHaveBeenCalledWith(medicationId);
    expect(result).toBe(true);
  });

  it('should return false when medication does not exist', async () => {
    const medicationId = '999';
    mockRepository.delete.mockResolvedValue(false);
    
    const result = await service.deleteMedication(medicationId);
    
    expect(mockRepository.delete).toHaveBeenCalledWith(medicationId);
    expect(result).toBe(false);
  });

  it('should handle repository errors during delete', async () => {
    const medicationId = '1';
    const error = new Error('Delete failed');
    mockRepository.delete.mockRejectedValue(error);
    
    await expect(service.deleteMedication(medicationId)).rejects.toThrow('Delete failed');
    expect(mockRepository.delete).toHaveBeenCalledWith(medicationId);
  });
});
