import { Medication } from '@core/domain/entities/medication.entity';
import { MedicationService } from '@infrastructure/services/medication.service';
import { IMedicationRepository } from '@core/domain/interfaces/repositories/medication.repository.interface';
import { UpdateMedicationDto } from '@application/dtos/update-medication.dto';

describe('MedicationService - updateMedication', () => {
  let service: MedicationService;
  let mockRepository: jest.Mocked<IMedicationRepository>;
  
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
    mockRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as any;
    service = new MedicationService(mockRepository);
  });

  it('should update an existing medication', async () => {
    mockRepository.findById.mockResolvedValue(existingMedication);
    mockRepository.update.mockResolvedValue(updatedMedication);
    
    const result = await service.updateMedication('1', updateData);
    
    expect(mockRepository.findById).toHaveBeenCalledWith('1');
    expect(mockRepository.update).toHaveBeenCalledWith('1', updateData);
    expect(result).toEqual(updatedMedication);
  });

  it('should return null when medication does not exist', async () => {
    mockRepository.findById.mockResolvedValue(null);
    
    const result = await service.updateMedication('999', updateData);
    
    expect(result).toBeNull();
    expect(mockRepository.findById).toHaveBeenCalledWith('999');
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should handle repository errors during find', async () => {
    const error = new Error('Database error');
    mockRepository.findById.mockRejectedValue(error);
    
    await expect(service.updateMedication('1', updateData)).rejects.toThrow('Database error');
    expect(mockRepository.findById).toHaveBeenCalledWith('1');
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should handle repository errors during update', async () => {
    const error = new Error('Update failed');
    mockRepository.findById.mockResolvedValue(existingMedication);
    mockRepository.update.mockRejectedValue(error);
    
    await expect(service.updateMedication('1', updateData)).rejects.toThrow('Update failed');
    expect(mockRepository.findById).toHaveBeenCalledWith('1');
    expect(mockRepository.update).toHaveBeenCalledWith('1', updateData);
  });
});
