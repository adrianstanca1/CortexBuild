// services/aiService.ts - Multi-provider AI Service with OpenAI Primary
import OpenAI from 'openai';
import { GoogleGenAI } from "@google/genai";

// AI Provider Configuration
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const PRIMARY_PROVIDER = import.meta.env.VITE_PRIMARY_AI_PROVIDER || 'openai';
const AI_MODEL = import.meta.env.VITE_AI_MODEL || 'gpt-4o';

// Initialize AI clients
const openaiClient = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY, dangerouslyAllowBrowser: true }) : null;
const geminiClient = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

export interface AIResponse {
  text: string;
  provider: 'openai' | 'gemini';
  model: string;
}

export interface AIGenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
  responseSchema?: any;
}

/**
 * Generate content using AI with automatic fallback
 * Primary: OpenAI, Fallback: Gemini
 */
export async function generateContent(
  prompt: string,
  options: AIGenerateOptions = {}
): Promise<AIResponse> {
  const {
    model = AI_MODEL,
    temperature = 0.7,
    maxTokens = 2000,
    responseFormat = 'text',
    responseSchema
  } = options;

  // Try OpenAI first (PRIMARY)
  if (openaiClient && (PRIMARY_PROVIDER === 'openai' || !geminiClient)) {
    try {
      const response = await openaiClient.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: maxTokens,
        response_format: responseFormat === 'json' ? { type: 'json_object' } : undefined,
      });

      const content = response.choices[0]?.message?.content || '';
      return {
        text: content,
        provider: 'openai',
        model: response.model
      };
    } catch (error) {
      console.warn('OpenAI request failed, trying Gemini fallback:', error);
      // Fall through to Gemini
    }
  }

  // Fallback to Gemini
  if (geminiClient) {
    try {
      const geminiModel = model.includes('gemini') ? model : 'gemini-2.5-flash';
      const config: any = {};
      
      if (responseFormat === 'json') {
        config.responseMimeType = 'application/json';
        if (responseSchema) {
          config.responseSchema = responseSchema;
        }
      }

      const response = await geminiClient.models.generateContent({
        model: geminiModel,
        contents: prompt,
        config: Object.keys(config).length > 0 ? config : undefined,
      });

      return {
        text: response.text || '',
        provider: 'gemini',
        model: geminiModel
      };
    } catch (error) {
      console.error('Gemini fallback also failed:', error);
      throw new Error('All AI providers failed');
    }
  }

  throw new Error('No AI providers configured. Please set VITE_OPENAI_API_KEY or VITE_GEMINI_API_KEY');
}

/**
 * Generate structured JSON response from AI
 */
export async function generateJSON<T = any>(
  prompt: string,
  schema?: any,
  options: Omit<AIGenerateOptions, 'responseFormat' | 'responseSchema'> = {}
): Promise<T> {
  const response = await generateContent(prompt, {
    ...options,
    responseFormat: 'json',
    responseSchema: schema
  });

  try {
    return JSON.parse(response.text) as T;
  } catch (error) {
    console.error('Failed to parse AI JSON response:', error);
    throw new Error('AI returned invalid JSON');
  }
}

/**
 * Generate streaming response (OpenAI only for now)
 */
export async function* generateStream(
  prompt: string,
  options: AIGenerateOptions = {}
): AsyncGenerator<string, void, unknown> {
  if (!openaiClient) {
    throw new Error('Streaming requires OpenAI API key');
  }

  const {
    model = AI_MODEL,
    temperature = 0.7,
    maxTokens = 2000,
  } = options;

  const stream = await openaiClient.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature,
    max_tokens: maxTokens,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

/**
 * Check which AI providers are available
 */
export function getAvailableProviders(): {
  openai: boolean;
  gemini: boolean;
  primary: string;
} {
  return {
    openai: !!openaiClient,
    gemini: !!geminiClient,
    primary: PRIMARY_PROVIDER
  };
}
