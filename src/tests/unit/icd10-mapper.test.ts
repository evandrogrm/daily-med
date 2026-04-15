import { mapTextToICD10 } from '@core/application/utils/icd10-mapper';

describe('mapTextToICD10', () => {
  describe('single keyword matches', () => {
    it('should match cholesterol to E78.5 Hyperlipidemia', () => {
      const results = mapTextToICD10('Patient has high cholesterol');
      
      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            icd10Code: 'E78.5',
            icd10Description: 'Hyperlipidemia, unspecified',
          }),
        ])
      );
    });

    it('should match hypertension to I10', () => {
      const results = mapTextToICD10('Diagnosed with hypertension');

      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            icd10Code: 'I10',
            icd10Description: 'Essential (primary) hypertension',
          }),
        ])
      );
    });

    it('should match diabetes to E11.65', () => {
      const results = mapTextToICD10('Patient has diabetes');

      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            icd10Code: 'E11.65',
            icd10Description: 'Type 2 diabetes mellitus with hyperglycemia',
          }),
        ])
      );
    });

    it('should match pneumonia to J18.9', () => {
      const results = mapTextToICD10('Suspected pneumonia');

      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            icd10Code: 'J18.9',
            icd10Description: 'Pneumonia, unspecified',
          }),
        ])
      );
    });

    it('should match back pain to M54.5', () => {
      const results = mapTextToICD10('Suffering from back pain');

      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            icd10Code: 'M54.5',
            icd10Description: 'Low back pain',
          }),
        ])
      );
    });
  });

  describe('case-insensitive matching', () => {
    it('should match regardless of input case', () => {
      const lower = mapTextToICD10('cholesterol');
      const upper = mapTextToICD10('CHOLESTEROL');
      const mixed = mapTextToICD10('Cholesterol');

      expect(lower[0].icd10Code).toBe('E78.5');
      expect(upper[0].icd10Code).toBe('E78.5');
      expect(mixed[0].icd10Code).toBe('E78.5');
    });
  });

  describe('confidence scoring', () => {
    it('should calculate confidence based on keyword length', () => {
      const results = mapTextToICD10('cholesterol');
      const confidence = results[0].confidence;

      // keywordWeight = 0.7, lengthFactor = min(11/10, 1) = 1
      // confidence = min(0.7 + 1 * 0.3, 0.95) = min(1.0, 0.95) = 0.95
      expect(confidence).toBeCloseTo(0.95);
    });

    it('should give lower confidence for shorter keywords', () => {
      // "lumbago" length=7, lengthFactor = 7/10 = 0.7
      // confidence = min(0.7 + 0.7 * 0.3, 0.95) = min(0.91, 0.95) = 0.91
      const results = mapTextToICD10('lumbago');
      const confidence = results[0].confidence;

      expect(confidence).toBeCloseTo(0.91);
    });

    it('should cap confidence at 0.95', () => {
      // "high blood pressure" length=19, lengthFactor = min(19/10, 1) = 1
      // confidence = min(0.7 + 1 * 0.3, 0.95) = 0.95
      const results = mapTextToICD10('high blood pressure');
      
      expect(results[0].confidence).toBeLessThanOrEqual(0.95);
    });

    it('should sort results by confidence descending', () => {
      const results = mapTextToICD10('Patient has lumbago and pneumonia');

      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].confidence).toBeGreaterThanOrEqual(results[i].confidence);
      }
    });
  });

  describe('multiple keyword matches for the same ICD-10 code', () => {
    it('should deduplicate and keep the higher confidence match', () => {
      // "high blood pressure" (19 chars) and "hypertension" (12 chars) both map to I10
      // "high blood pressure" -> lengthFactor = 1, confidence = 0.95
      // "hypertension" -> lengthFactor = 1, confidence = 0.95
      const text = 'Patient with hypertension and high blood pressure';
      const results = mapTextToICD10(text);

      const i10Matches = results.filter(r => r.icd10Code === 'I10');
      expect(i10Matches).toHaveLength(1);
    });

    it('should prefer the keyword with higher confidence when deduplicating', () => {
      // "elevated bp" (11 chars) -> lengthFactor = 1, confidence = 0.95
      // "hypertension" (12 chars) -> lengthFactor = 1, confidence = 0.95
      // Both should produce similar confidence; only one entry for I10
      const text = 'elevated bp and hypertension';
      const results = mapTextToICD10(text);

      const i10Matches = results.filter(r => r.icd10Code === 'I10');
      expect(i10Matches).toHaveLength(1);
    });
  });

  describe('multiple different ICD-10 matches', () => {
    it('should return multiple results for different conditions', () => {
      const text = 'Patient with diabetes and pneumonia';
      const results = mapTextToICD10(text);

      const codes = results.map(r => r.icd10Code);
      expect(codes).toContain('E11.65');
      expect(codes).toContain('J18.9');
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it('should match all five conditions when all keywords are present', () => {
      const text = 'cholesterol hypertension diabetes pneumonia back pain';
      const results = mapTextToICD10(text);

      const codes = results.map(r => r.icd10Code);
      expect(codes).toContain('E78.5');
      expect(codes).toContain('I10');
      expect(codes).toContain('E11.65');
      expect(codes).toContain('J18.9');
      expect(codes).toContain('M54.5');
    });
  });

  describe('no matches — fallback result', () => {
    it('should return R69 fallback when no keywords match', () => {
      const results = mapTextToICD10('completely unrelated text');

      expect(results).toHaveLength(1);
      expect(results[0].icd10Code).toBe('R69');
      expect(results[0].icd10Description).toBe('Illness, unspecified');
      expect(results[0].confidence).toBe(0.1);
    });

    it('should truncate text longer than 50 chars with ellipsis in fallback description', () => {
      const longText = 'A'.repeat(60);
      const results = mapTextToICD10(longText);

      expect(results[0].description).toBe('A'.repeat(50) + '...');
      expect(results[0].description.length).toBe(53);
    });

    it('should not add ellipsis for text with exactly 50 chars', () => {
      const text50 = 'A'.repeat(50);
      const results = mapTextToICD10(text50);

      expect(results[0].description).toBe(text50);
      expect(results[0].description).not.toContain('...');
    });

    it('should not add ellipsis for text shorter than 50 chars', () => {
      const shortText = 'short unrelated text';
      const results = mapTextToICD10(shortText);

      expect(results[0].description).toBe(shortText);
    });
  });

  describe('empty and edge-case inputs', () => {
    it('should return R69 fallback for empty string', () => {
      const results = mapTextToICD10('');

      expect(results).toHaveLength(1);
      expect(results[0].icd10Code).toBe('R69');
      expect(results[0].description).toBe('');
    });

    it('should return R69 fallback for whitespace-only input', () => {
      const results = mapTextToICD10('   ');

      expect(results).toHaveLength(1);
      expect(results[0].icd10Code).toBe('R69');
    });

    it('should match keywords embedded in longer text', () => {
      const results = mapTextToICD10('The patient was diagnosed with chronic hypertension last year');

      expect(results[0].icd10Code).toBe('I10');
    });
  });

  describe('alternative keyword variants', () => {
    it('should match "hyperlipidemia" keyword for E78.5', () => {
      const results = mapTextToICD10('diagnosed with hyperlipidemia');
      expect(results[0].icd10Code).toBe('E78.5');
    });

    it('should match "high lipids" keyword for E78.5', () => {
      const results = mapTextToICD10('patient has high lipids');
      expect(results[0].icd10Code).toBe('E78.5');
    });

    it('should match "high blood sugar" for E11.65', () => {
      const results = mapTextToICD10('experiencing high blood sugar');
      expect(results[0].icd10Code).toBe('E11.65');
    });

    it('should match "hyperglycemia" for E11.65', () => {
      const results = mapTextToICD10('presented with hyperglycemia');
      expect(results[0].icd10Code).toBe('E11.65');
    });

    it('should match "lung infection" for J18.9', () => {
      const results = mapTextToICD10('has a lung infection');
      expect(results[0].icd10Code).toBe('J18.9');
    });

    it('should match "elevated bp" for I10', () => {
      const results = mapTextToICD10('noted elevated bp');
      expect(results[0].icd10Code).toBe('I10');
    });

    it('should match "lumbago" for M54.5', () => {
      const results = mapTextToICD10('complaining of lumbago');
      expect(results[0].icd10Code).toBe('M54.5');
    });
  });
});
