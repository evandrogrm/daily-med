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
      update: jest.fn(),
    } as any;
    service = new MedicationService(mockRepository);
  });

  it('should update an existing medication', async () => {
    mockRepository.update.mockResolvedValue(updatedMedication);
    
    const result = await service.updateMedication('1', updateData);
    
    expect(mockRepository.update).toHaveBeenCalledWith('1', updateData);
    expect(result).toEqual(updatedMedication);
  });

  it('should return null when medication does not exist', async () => {
    mockRepository.update.mockResolvedValue(null);
    
    const result = await service.updateMedication('999', updateData);
    
    expect(result).toBeNull();
    expect(mockRepository.update).toHaveBeenCalledWith('999', updateData);
  });

  it('should handle repository errors during update', async () => {
    const error = new Error('Update failed');
    mockRepository.update.mockRejectedValue(error);
    
    await expect(service.updateMedication('1', updateData)).rejects.toThrow('Update failed');
    expect(mockRepository.update).toHaveBeenCalledWith('1', updateData);
  });
});
