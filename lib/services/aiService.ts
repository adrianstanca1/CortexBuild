/**
 * AI Service
 * Unified interface for OpenAI, Google Gemini, and Anthropic Claude
 */

import axios from 'axios';

export type AIProvider = 'openai' | 'gemini' | 'claude';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionOptions {
  provider: AIProvider;
  model?: string;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AICompletionResponse {
  content: string;
  provider: AIProvider;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIImageAnalysisOptions {
  provider: AIProvider;
  imageUrl: string;
  prompt: string;
}

export interface AICodeGenerationOptions {
  provider: AIProvider;
  prompt: string;
  language?: string;
  framework?: string;
}

class AIService {
  private apiKeys: Record<AIProvider, string | undefined> = {
    openai: import.meta.env.VITE_OPENAI_API_KEY,
    gemini: import.meta.env.VITE_GOOGLE_GEMINI_API_KEY,
    claude: import.meta.env.VITE_ANTHROPIC_API_KEY,
  };

  /**
   * Generate completion from AI provider
   */
  async generateCompletion(options: AICompletionOptions): Promise<AICompletionResponse> {
    const { provider, model, messages, temperature = 0.7, maxTokens = 1000 } = options;

    switch (provider) {
      case 'openai':
        return this.generateOpenAI(model || 'gpt-4', messages, temperature, maxTokens);

      case 'gemini':
        return this.generateGemini(model || 'gemini-pro', messages, temperature, maxTokens);

      case 'claude':
        return this.generateClaude(model || 'claude-3-sonnet-20240229', messages, temperature, maxTokens);

      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }

  /**
   * OpenAI GPT-4 completion
   */
  private async generateOpenAI(
    model: string,
    messages: AIMessage[],
    temperature: number,
    maxTokens: number
  ): Promise<AICompletionResponse> {
    const apiKey = this.apiKeys.openai;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        content: response.data.choices[0].message.content,
        provider: 'openai',
        model,
        usage: {
          promptTokens: response.data.usage.prompt_tokens,
          completionTokens: response.data.usage.completion_tokens,
          totalTokens: response.data.usage.total_tokens,
        },
      };
    } catch (error) {
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Google Gemini completion
   */
  private async generateGemini(
    model: string,
    messages: AIMessage[],
    temperature: number,
    maxTokens: number
  ): Promise<AICompletionResponse> {
    const apiKey = this.apiKeys.gemini;
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    try {
      // Convert messages to Gemini format
      const contents = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

      const systemInstruction = messages.find(m => m.role === 'system')?.content;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          contents,
          systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        content: response.data.candidates[0].content.parts[0].text,
        provider: 'gemini',
        model,
        usage: {
          promptTokens: response.data.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.data.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.data.usageMetadata?.totalTokenCount || 0,
        },
      };
    } catch (error) {
      throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Anthropic Claude completion
   */
  private async generateClaude(
    model: string,
    messages: AIMessage[],
    temperature: number,
    maxTokens: number
  ): Promise<AICompletionResponse> {
    const apiKey = this.apiKeys.claude;
    if (!apiKey) {
      throw new Error('Claude API key not configured');
    }

    try {
      // Extract system message
      const systemMessage = messages.find(m => m.role === 'system')?.content;
      const conversationMessages = messages.filter(m => m.role !== 'system');

      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model,
          messages: conversationMessages,
          system: systemMessage,
          temperature,
          max_tokens: maxTokens,
        },
        {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        content: response.data.content[0].text,
        provider: 'claude',
        model,
        usage: {
          promptTokens: response.data.usage.input_tokens,
          completionTokens: response.data.usage.output_tokens,
          totalTokens: response.data.usage.input_tokens + response.data.usage.output_tokens,
        },
      };
    } catch (error) {
      throw new Error(`Claude API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze image with multimodal AI
   */
  async analyzeImage(options: AIImageAnalysisOptions): Promise<string> {
    const { provider, imageUrl, prompt } = options;

    if (provider === 'gemini') {
      return this.analyzeImageGemini(imageUrl, prompt);
    } else if (provider === 'openai') {
      return this.analyzeImageOpenAI(imageUrl, prompt);
    } else {
      throw new Error(`Image analysis not supported for provider: ${provider}`);
    }
  }

  /**
   * Analyze image with Gemini Vision
   */
  private async analyzeImageGemini(imageUrl: string, prompt: string): Promise<string> {
    const apiKey = this.apiKeys.gemini;
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    try {
      // Fetch image and convert to base64
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const base64Image = Buffer.from(imageResponse.data).toString('base64');
      const mimeType = imageResponse.headers['content-type'] || 'image/jpeg';

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}`,
        {
          contents: [{
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: base64Image,
                },
              },
            ],
          }],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      throw new Error(`Gemini Vision API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze image with OpenAI GPT-4 Vision
   */
  private async analyzeImageOpenAI(imageUrl: string, prompt: string): Promise<string> {
    const apiKey = this.apiKeys.openai;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: imageUrl } },
              ],
            },
          ],
          max_tokens: 1000,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      throw new Error(`OpenAI Vision API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate code with AI
   */
  async generateCode(options: AICodeGenerationOptions): Promise<string> {
    const { provider, prompt, language = 'typescript', framework } = options;

    const systemMessage = `You are an expert ${language} developer. Generate clean, production-ready code following best practices.`;
    const userMessage = framework
      ? `Generate ${language} code using ${framework}:\n${prompt}`
      : `Generate ${language} code:\n${prompt}`;

    const response = await this.generateCompletion({
      provider,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3, // Lower temperature for more consistent code
      maxTokens: 2000,
    });

    return response.content;
  }

  /**
   * Check if provider is configured
   */
  isProviderConfigured(provider: AIProvider): boolean {
    return Boolean(this.apiKeys[provider]);
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): AIProvider[] {
    return (Object.keys(this.apiKeys) as AIProvider[])
      .filter(provider => this.isProviderConfigured(provider));
  }
}

// Export singleton instance
export const aiService = new AIService();

