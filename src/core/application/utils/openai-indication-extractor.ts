import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { config } from '../../../infra/config';

interface IndicationResult {
  description: string;
  icd10Code: string;
  icd10Description: string;
  confidence: number;
}

const SYSTEM_PROMPT = `You are a medical coding assistant. Given a clinical text, extract medication indications and map each one to its most appropriate ICD-10 code.

Return a JSON array where each element has:
- "description": a short description of the indication found in the text
- "icd10Code": the ICD-10-CM code
- "icd10Description": the official description of that ICD-10 code
- "confidence": a number between 0 and 1 representing your confidence in the mapping

Only return the JSON array, no additional text or markdown formatting.`;

export async function extractIndicationsWithOpenAI(text: string): Promise<IndicationResult[]> {
  const model = new ChatOpenAI({
    openAIApiKey: config.openaiApiKey,
    modelName: 'gpt-3.5-turbo',
    temperature: 0,
  });

  const response = await model.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(text),
  ]);

  const content = typeof response.content === 'string'
    ? response.content
    : JSON.stringify(response.content);

  const parsed = JSON.parse(content);

  if (!Array.isArray(parsed)) {
    throw new Error('OpenAI response is not a valid JSON array');
  }

  return parsed.map((item: Record<string, unknown>) => ({
    description: String(item.description ?? ''),
    icd10Code: String(item.icd10Code ?? ''),
    icd10Description: String(item.icd10Description ?? ''),
    confidence: Number(item.confidence ?? 0),
  }));
}
