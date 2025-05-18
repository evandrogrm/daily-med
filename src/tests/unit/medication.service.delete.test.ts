import { MedicationService } from '@infrastructure/services/medication.service';
import { IMedicationRepository } from '@core/domain/interfaces/repositories/medication.repository.interface';

describe('MedicationService - deleteMedication', () => {
  let service: MedicationService;
  let mockRepository: jest.Mocked<IMedicationRepository>;
  
  beforeEach(() => {
    mockRepository = {
      delete: jest.fn(),
      findById: jest.fn(),
    } as any;
    service = new MedicationService(mockRepository);
  });

  it('should delete an existing medication', async () => {
    const medicationId = '1';
    mockRepository.findById.mockResolvedValue({ id: medicationId } as any);
    mockRepository.delete.mockResolvedValue(true);
    
    const result = await service.deleteMedication(medicationId);
    
    expect(mockRepository.findById).toHaveBeenCalledWith(medicationId);
    expect(mockRepository.delete).toHaveBeenCalledWith(medicationId);
    expect(result).toBe(true);
  });

  it('should return false when medication does not exist', async () => {
    const medicationId = '999';
    mockRepository.findById.mockResolvedValue(null);
    
    const result = await service.deleteMedication(medicationId);
    
    expect(mockRepository.findById).toHaveBeenCalledWith(medicationId);
    expect(mockRepository.delete).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should handle repository errors during find', async () => {
    const medicationId = '1';
    const error = new Error('Database error');
    mockRepository.findById.mockRejectedValue(error);
    
    await expect(service.deleteMedication(medicationId)).rejects.toThrow('Database error');
    expect(mockRepository.findById).toHaveBeenCalledWith(medicationId);
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });

  it('should handle repository errors during delete', async () => {
    const medicationId = '1';
    const error = new Error('Delete failed');
    mockRepository.findById.mockResolvedValue({ id: medicationId } as any);
    mockRepository.delete.mockRejectedValue(error);
    
    await expect(service.deleteMedication(medicationId)).rejects.toThrow('Delete failed');
    expect(mockRepository.findById).toHaveBeenCalledWith(medicationId);
    expect(mockRepository.delete).toHaveBeenCalledWith(medicationId);
  });
});
