import { MedicationService } from '@infrastructure/services/medication.service';
import { IMedicationRepository } from '@core/domain/interfaces/repositories/medication.repository.interface';

jest.mock('../../infra/config', () => ({
  config: {
    openaiApiKey: '',
  },
}));

const mockConfig = jest.requireMock('../../infra/config').config;

describe('MedicationService - extractAndMapIndications', () => {
  let service: MedicationService;
  let mockRepository: jest.Mocked<IMedicationRepository>;
  
  const mockText = 'Patient has been experiencing high cholesterol levels and needs medication.';

  beforeEach(() => {
    mockRepository = {} as any;
    service = new MedicationService(mockRepository);
    mockConfig.openaiApiKey = '';
  });

  describe('when OPENAI_API_KEY is not set (fallback to keyword matcher)', () => {
    it('should extract and map indications from text', async () => {
      const result = await service.extractAndMapIndications(mockText);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('description');
      expect(result[0]).toHaveProperty('icd10Code');
      expect(result[0]).toHaveProperty('icd10Description');
      expect(result[0]).toHaveProperty('confidence');
    });

    it('should handle empty text', async () => {
      const result = await service.extractAndMapIndications('');
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return a truncated description for long text', async () => {
      const longText = 'A very long text that should be truncated to 50 characters plus ellipsis...';
      const result = await service.extractAndMapIndications(longText);
      
      expect(result[0].description.length).toBeLessThanOrEqual(53); // 50 + '...'
      expect(result[0].description.endsWith('...')).toBe(true);
    });
  });

  describe('when OPENAI_API_KEY is set', () => {
    const mockOpenAIResult = [
      {
        description: 'high cholesterol',
        icd10Code: 'E78.5',
        icd10Description: 'Hyperlipidemia, unspecified',
        confidence: 0.92,
      },
    ];

    beforeEach(() => {
      mockConfig.openaiApiKey = 'test-openai-key';
      jest.resetModules();
    });

    it('should use OpenAI-based extraction', async () => {
      jest.doMock('@core/application/utils/openai-indication-extractor', () => ({
        extractIndicationsWithOpenAI: jest.fn().mockResolvedValue(mockOpenAIResult),
      }));

      const result = await service.extractAndMapIndications(mockText);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('description');
      expect(result[0]).toHaveProperty('icd10Code');
      expect(result[0]).toHaveProperty('icd10Description');
      expect(result[0]).toHaveProperty('confidence');
    });
  });
});
