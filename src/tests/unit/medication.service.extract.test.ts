import { MedicationService } from '@infrastructure/services/medication.service';
import { IMedicationRepository } from '@core/domain/interfaces/repositories/medication.repository.interface';

describe('MedicationService - extractAndMapIndications', () => {
  let service: MedicationService;
  let mockRepository: jest.Mocked<IMedicationRepository>;

  beforeEach(() => {
    mockRepository = {} as any;
    service = new MedicationService(mockRepository);
  });

  it('should extract and map indications from text with matching keywords', async () => {
    const result = await service.extractAndMapIndications(
      'Patient has been experiencing high cholesterol levels and needs medication.'
    );

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('description');
    expect(result[0]).toHaveProperty('icd10Code');
    expect(result[0]).toHaveProperty('icd10Description');
    expect(result[0]).toHaveProperty('confidence');
    expect(result[0].icd10Code).toBe('E78.5');
  });

  it('should return R69 fallback for empty text', async () => {
    const result = await service.extractAndMapIndications('');

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
    expect(result[0].icd10Code).toBe('R69');
    expect(result[0].confidence).toBe(0.1);
  });

  it('should return R69 fallback with truncated description for long unmatched text', async () => {
    const longText = 'A very long text that should be truncated to 50 characters plus ellipsis...';
    const result = await service.extractAndMapIndications(longText);

    expect(result[0].icd10Code).toBe('R69');
    expect(result[0].description.length).toBeLessThanOrEqual(53);
    expect(result[0].description.endsWith('...')).toBe(true);
  });

  it('should delegate to mapTextToICD10 and return its results', async () => {
    const result = await service.extractAndMapIndications('diabetes and pneumonia');

    expect(result.length).toBeGreaterThanOrEqual(2);
    const codes = result.map(r => r.icd10Code);
    expect(codes).toContain('E11.65');
    expect(codes).toContain('J18.9');
  });
});
