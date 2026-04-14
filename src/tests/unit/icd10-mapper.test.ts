import { mapTextToICD10 } from '../../core/application/utils/icd10-mapper';

describe('mapTextToICD10', () => {
  describe('empty and blank inputs', () => {
    it('should return R69 fallback for an empty string', () => {
      const result = mapTextToICD10('');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        description: '',
        icd10Code: 'R69',
        icd10Description: 'Illness, unspecified',
        confidence: 0.1,
      });
    });

    it('should return R69 fallback for a whitespace-only string', () => {
      const result = mapTextToICD10('   ');

      expect(result).toHaveLength(1);
      expect(result[0].icd10Code).toBe('R69');
      expect(result[0].confidence).toBe(0.1);
    });
  });

  describe('no ICD-10 code matched', () => {
    it('should return R69 fallback when text has no matching keywords', () => {
      const result = mapTextToICD10('The patient feels fine and has no symptoms.');

      expect(result).toHaveLength(1);
      expect(result[0].icd10Code).toBe('R69');
      expect(result[0].icd10Description).toBe('Illness, unspecified');
      expect(result[0].confidence).toBe(0.1);
    });

    it('should return R69 fallback for random unrelated text', () => {
      const result = mapTextToICD10('Lorem ipsum dolor sit amet');

      expect(result).toHaveLength(1);
      expect(result[0].icd10Code).toBe('R69');
    });

    it('should not match partial keywords', () => {
      // "diabet" is a substring of "diabetes" but should not match
      const result = mapTextToICD10('diabet');

      expect(result).toHaveLength(1);
      expect(result[0].icd10Code).toBe('R69');
    });
  });

  describe('description truncation in R69 fallback', () => {
    it('should not add ellipsis for text exactly 50 characters', () => {
      const text50 = 'A'.repeat(50);
      const result = mapTextToICD10(text50);

      expect(result[0].icd10Code).toBe('R69');
      expect(result[0].description).toBe(text50);
      expect(result[0].description).toHaveLength(50);
      expect(result[0].description.endsWith('...')).toBe(false);
    });

    it('should truncate and add ellipsis for text longer than 50 characters', () => {
      const text60 = 'B'.repeat(60);
      const result = mapTextToICD10(text60);

      expect(result[0].icd10Code).toBe('R69');
      expect(result[0].description).toBe('B'.repeat(50) + '...');
      expect(result[0].description).toHaveLength(53);
    });

    it('should not add ellipsis for text shorter than 50 characters', () => {
      const text30 = 'C'.repeat(30);
      const result = mapTextToICD10(text30);

      expect(result[0].icd10Code).toBe('R69');
      expect(result[0].description).toBe(text30);
      expect(result[0].description).toHaveLength(30);
    });
  });

  describe('long text inputs', () => {
    it('should handle very long text with no matching keywords', () => {
      const longText = 'no relevant medical term here '.repeat(500);
      const result = mapTextToICD10(longText);

      expect(result).toHaveLength(1);
      expect(result[0].icd10Code).toBe('R69');
      expect(result[0].description).toHaveLength(53); // 50 + '...'
    });

    it('should find keywords embedded in very long text', () => {
      const longText = 'x'.repeat(5000) + ' diabetes ' + 'y'.repeat(5000);
      const result = mapTextToICD10(longText);

      expect(result).toHaveLength(1);
      expect(result[0].icd10Code).toBe('E11.65');
      expect(result[0].icd10Description).toBe(
        'Type 2 diabetes mellitus with hyperglycemia',
      );
    });

    it('should find multiple keywords in a long text', () => {
      const longText =
        'x'.repeat(1000) +
        ' hypertension ' +
        'y'.repeat(1000) +
        ' pneumonia ' +
        'z'.repeat(1000);
      const result = mapTextToICD10(longText);

      const codes = result.map((r) => r.icd10Code);
      expect(codes).toContain('I10');
      expect(codes).toContain('J18.9');
      expect(result).toHaveLength(2);
    });
  });

  describe('case insensitivity', () => {
    it('should match uppercase keywords', () => {
      const result = mapTextToICD10('DIABETES');

      expect(result).toHaveLength(1);
      expect(result[0].icd10Code).toBe('E11.65');
    });

    it('should match mixed-case keywords', () => {
      const result = mapTextToICD10('HyPerTenSion');

      expect(result).toHaveLength(1);
      expect(result[0].icd10Code).toBe('I10');
    });

    it('should match keywords with surrounding mixed-case text', () => {
      const result = mapTextToICD10('The Patient Has HIGH BLOOD PRESSURE.');

      const codes = result.map((r) => r.icd10Code);
      expect(codes).toContain('I10');
    });
  });

  describe('confidence scoring', () => {
    it('should calculate confidence based on keyword length', () => {
      // "cholesterol" has 11 chars -> lengthFactor = min(11/10, 1) = 1
      // confidence = min(0.7 + 1 * 0.3, 0.95) = 0.95 (capped)
      const result = mapTextToICD10('cholesterol');

      expect(result[0].icd10Code).toBe('E78.5');
      expect(result[0].confidence).toBeCloseTo(0.95, 2);
    });

    it('should produce lower confidence for shorter keywords', () => {
      // "lumbago" has 7 chars -> lengthFactor = min(7/10, 1) = 0.7
      // confidence = min(0.7 + 0.7 * 0.3, 0.95) = min(0.91, 0.95) = 0.91
      const result = mapTextToICD10('lumbago');

      expect(result[0].icd10Code).toBe('M54.5');
      expect(result[0].confidence).toBeCloseTo(0.91, 2);
    });

    it('should never exceed 0.95 confidence', () => {
      // "high blood pressure" has 19 chars -> capped at 0.95
      const result = mapTextToICD10('high blood pressure');

      expect(result[0].confidence).toBeLessThanOrEqual(0.95);
    });

    it('should sort results by confidence descending', () => {
      const result = mapTextToICD10(
        'Patient has cholesterol issues and also lumbago',
      );

      expect(result.length).toBeGreaterThanOrEqual(2);
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].confidence).toBeGreaterThanOrEqual(
          result[i + 1].confidence,
        );
      }
    });
  });

  describe('deduplication', () => {
    it('should keep only the highest-confidence match per ICD-10 code', () => {
      // "diabetes" (8 chars) and "hyperglycemia" (13 chars) both map to E11.65
      // "hyperglycemia" is longer -> higher confidence -> should win
      const result = mapTextToICD10('diabetes and hyperglycemia');

      const e11Matches = result.filter((r) => r.icd10Code === 'E11.65');
      expect(e11Matches).toHaveLength(1);
      expect(e11Matches[0].description).toBe('hyperglycemia');
    });

    it('should keep only the highest-confidence match for hypertension keywords', () => {
      // "hypertension" (12 chars), "high blood pressure" (19 chars), "elevated bp" (11 chars)
      // All map to I10. Both "hypertension" and "high blood pressure" cap at 0.95.
      // The first match ("hypertension") is kept because the later match is not
      // strictly greater in confidence.
      const result = mapTextToICD10(
        'hypertension with high blood pressure and elevated bp',
      );

      const i10Matches = result.filter((r) => r.icd10Code === 'I10');
      expect(i10Matches).toHaveLength(1);
      expect(i10Matches[0].confidence).toBe(0.95);
    });
  });

  describe('multiple matches', () => {
    it('should return multiple ICD-10 codes when text matches different conditions', () => {
      const result = mapTextToICD10(
        'Patient has diabetes, hypertension, and pneumonia',
      );

      const codes = result.map((r) => r.icd10Code);
      expect(codes).toContain('E11.65');
      expect(codes).toContain('I10');
      expect(codes).toContain('J18.9');
      expect(result.length).toBe(3);
    });

    it('should match all five conditions when all keywords are present', () => {
      const result = mapTextToICD10(
        'cholesterol hypertension diabetes pneumonia back pain',
      );

      const codes = result.map((r) => r.icd10Code);
      expect(codes).toContain('E78.5');
      expect(codes).toContain('I10');
      expect(codes).toContain('E11.65');
      expect(codes).toContain('J18.9');
      expect(codes).toContain('M54.5');
      expect(result.length).toBe(5);
    });
  });

  describe('special characters and edge formatting', () => {
    it('should match keywords surrounded by special characters', () => {
      const result = mapTextToICD10('(diabetes)');

      expect(result).toHaveLength(1);
      expect(result[0].icd10Code).toBe('E11.65');
    });

    it('should match keywords in text with newlines', () => {
      const result = mapTextToICD10('line one\ndiabetes\nline three');

      expect(result).toHaveLength(1);
      expect(result[0].icd10Code).toBe('E11.65');
    });

    it('should match multi-word keywords like "back pain"', () => {
      const result = mapTextToICD10('The patient reports back pain.');

      expect(result).toHaveLength(1);
      expect(result[0].icd10Code).toBe('M54.5');
    });

    it('should match multi-word keywords like "lung infection"', () => {
      const result = mapTextToICD10(
        'Diagnosis indicates a lung infection in the patient.',
      );

      expect(result).toHaveLength(1);
      expect(result[0].icd10Code).toBe('J18.9');
    });
  });

  describe('result structure', () => {
    it('should return objects with correct shape for matched results', () => {
      const result = mapTextToICD10('diabetes');

      expect(result[0]).toEqual(
        expect.objectContaining({
          description: expect.any(String),
          icd10Code: expect.any(String),
          icd10Description: expect.any(String),
          confidence: expect.any(Number),
        }),
      );
    });

    it('should return objects with correct shape for R69 fallback', () => {
      const result = mapTextToICD10('no match here');

      expect(result[0]).toEqual(
        expect.objectContaining({
          description: expect.any(String),
          icd10Code: 'R69',
          icd10Description: 'Illness, unspecified',
          confidence: 0.1,
        }),
      );
    });

    it('should always return a non-empty array', () => {
      const inputs = ['', 'diabetes', 'random text', 'A'.repeat(10000)];

      for (const input of inputs) {
        const result = mapTextToICD10(input);
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
      }
    });
  });
});
