// Gemini AI service for handling Google's Generative AI API
import environment from '../config/environment';

export interface GeminiConfig {
  apiKey: string;
  browserKey: string;
  enabled: boolean;
}

export interface GeminiGenerationConfig {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
}

export interface GeminiSafetySettings {
  category: string;
  threshold: string;
}

export interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text?: string;
      inlineData?: {
        mimeType: string;
        data: string;
      };
    }>;
    role?: 'user' | 'model';
  }>;
  generationConfig?: GeminiGenerationConfig;
  safetySettings?: GeminiSafetySettings[];
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
      role: string;
    };
    finishReason: string;
    index: number;
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  promptFeedback?: {
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  };
}

class GeminiService {
  private config: GeminiConfig;
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    const env = environment;
    this.config = env.gemini;
  }

  /**
   * Get Gemini configuration
   */
  getConfig(): GeminiConfig {
    return this.config;
  }

  /**
   * Check if Gemini service is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Generate content using Gemini Pro model
   */
  async generateContent(
    prompt: string,
    options: {
      model?: 'gemini-pro' | 'gemini-pro-vision';
      generationConfig?: GeminiGenerationConfig;
      safetySettings?: GeminiSafetySettings[];
    } = {}
  ): Promise<string> {
    if (!this.config.enabled) {
      throw new Error('Gemini service is not configured');
    }

    const model = options.model || 'gemini-pro';
    const apiKey = this.config.apiKey;

    const request: GeminiRequest = {
      contents: [
        {
          parts: [{ text: prompt }],
          role: 'user',
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
        ...options.generationConfig,
      },
      safetySettings: options.safetySettings || [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ],
    };

    try {
      const response = await fetch(
        `${this.baseUrl}/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Gemini API error: ${response.status} ${response.statusText}. ${
            errorData.error?.message || ''
          }`
        );
      }

      const data: GeminiResponse = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated from Gemini');
      }

      const candidate = data.candidates[0];
      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error('Invalid response format from Gemini');
      }

      return candidate.content.parts[0].text;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  /**
   * Generate content with image input using Gemini Pro Vision
   */
  async generateContentWithImage(
    prompt: string,
    imageData: string,
    mimeType: string,
    options: {
      generationConfig?: GeminiGenerationConfig;
      safetySettings?: GeminiSafetySettings[];
    } = {}
  ): Promise<string> {
    if (!this.config.enabled) {
      throw new Error('Gemini service is not configured');
    }

    const request: GeminiRequest = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: imageData,
              },
            },
          ],
          role: 'user',
        },
      ],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096,
        ...options.generationConfig,
      },
      safetySettings: options.safetySettings || [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ],
    };

    try {
      const response = await fetch(
        `${this.baseUrl}/models/gemini-pro-vision:generateContent?key=${this.config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Gemini API error: ${response.status} ${response.statusText}. ${
            errorData.error?.message || ''
          }`
        );
      }

      const data: GeminiResponse = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated from Gemini Vision');
      }

      const candidate = data.candidates[0];
      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error('Invalid response format from Gemini Vision');
      }

      return candidate.content.parts[0].text;
    } catch (error) {
      console.error('Gemini Vision API error:', error);
      throw error;
    }
  }

  /**
   * Count tokens in text
   */
  async countTokens(text: string, model: 'gemini-pro' | 'gemini-pro-vision' = 'gemini-pro'): Promise<number> {
    if (!this.config.enabled) {
      throw new Error('Gemini service is not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/models/${model}:countTokens?key=${this.config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text }],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Token count error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.totalTokens || 0;
    } catch (error) {
      console.error('Token count error:', error);
      return 0;
    }
  }

  /**
   * Get available models
   */
  async getModels(): Promise<string[]> {
    if (!this.config.enabled) {
      throw new Error('Gemini service is not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/models?key=${this.config.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Models list error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      console.error('Models list error:', error);
      return ['gemini-pro', 'gemini-pro-vision']; // Fallback to known models
    }
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
