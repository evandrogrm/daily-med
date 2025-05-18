interface ICD10Mapping {
  code: string;
  description: string;
  keywords: string[];
}

// A simplified mapping of common conditions to ICD-10 codes
const ICD10_MAPPINGS: ICD10Mapping[] = [
  {
    code: 'E78.5',
    description: 'Hyperlipidemia, unspecified',
    keywords: ['cholesterol', 'hyperlipidemia', 'high lipids']
  },
  {
    code: 'I10',
    description: 'Essential (primary) hypertension',
    keywords: ['hypertension', 'high blood pressure', 'elevated bp']
  },
  {
    code: 'E11.65',
    description: 'Type 2 diabetes mellitus with hyperglycemia',
    keywords: ['diabetes', 'high blood sugar', 'hyperglycemia']
  },
  {
    code: 'J18.9',
    description: 'Pneumonia, unspecified',
    keywords: ['pneumonia', 'lung infection']
  },
  {
    code: 'M54.5',
    description: 'Low back pain',
    keywords: ['back pain', 'lumbago']
  }
];

/**
 * Finds the best matching ICD-10 code for a given text
 * @param text The text to analyze
 * @returns Array of matched ICD-10 codes with confidence scores
 */
export function mapTextToICD10(text: string): Array<{
  description: string;
  icd10Code: string;
  icd10Description: string;
  confidence: number;
}> {
  const lowerText = text.toLowerCase();
  const results: Array<{
    description: string;
    icd10Code: string;
    icd10Description: string;
    confidence: number;
  }> = [];

  // Simple keyword matching approach
  for (const mapping of ICD10_MAPPINGS) {
    for (const keyword of mapping.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        // Calculate a simple confidence score based on keyword match
        const keywordWeight = 0.7; // Base confidence for keyword match
        const lengthFactor = Math.min(keyword.length / 10, 1); // Longer keywords are more specific
        const confidence = Math.min(keywordWeight + (lengthFactor * 0.3), 0.95); // Cap at 95%
        
        // Add to results if not already added with higher confidence
        const existingIndex = results.findIndex(r => r.icd10Code === mapping.code);
        if (existingIndex === -1 || results[existingIndex].confidence < confidence) {
          const result = {
            description: keyword,
            icd10Code: mapping.code,
            icd10Description: mapping.description,
            confidence
          };
          
          if (existingIndex !== -1) {
            results[existingIndex] = result;
          } else {
            results.push(result);
          }
        }
      }
    }
  }

  // Sort by confidence (highest first)
  results.sort((a, b) => b.confidence - a.confidence);

  // If no matches found, return a default
  if (results.length === 0) {
    return [{
      description: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      icd10Code: 'R69',
      icd10Description: 'Illness, unspecified',
      confidence: 0.1
    }];
  }

  return results;
}
