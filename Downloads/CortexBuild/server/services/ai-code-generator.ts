/**
 * AI Code Generator Service
 * Supports both OpenAI and Google Gemini for code generation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

export interface CodeGenerationResult {
  code: string;
  explanation: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost: number;
  provider: string;
  model: string;
}

export class AICodeGenerator {
  private geminiClient: GoogleGenerativeAI | null = null;
  private openaiClient: OpenAI | null = null;

  constructor(
    private geminiApiKey?: string,
    private openaiApiKey?: string
  ) {
    if (geminiApiKey) {
      this.geminiClient = new GoogleGenerativeAI(geminiApiKey);
    }
    if (openaiApiKey) {
      this.openaiClient = new OpenAI({ apiKey: openaiApiKey });
    }
  }

  /**
   * Generate code using the specified provider
   */
  async generateCode(
    prompt: string,
    provider: 'gemini' | 'openai' = 'openai',
    model?: string
  ): Promise<CodeGenerationResult> {
    if (provider === 'gemini') {
      return this.generateWithGemini(prompt, model || 'gemini-pro');
    } else {
      return this.generateWithOpenAI(prompt, model || 'gpt-4o-mini');
    }
  }

  /**
   * Generate code using Google Gemini
   */
  private async generateWithGemini(
    prompt: string,
    model: string = 'gemini-pro'
  ): Promise<CodeGenerationResult> {
    if (!this.geminiClient) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const generativeModel = this.geminiClient.getGenerativeModel({ model });

      const systemPrompt = `You are an expert TypeScript developer specializing in construction management applications.
Generate clean, production-ready TypeScript code with proper types, error handling, and comments.
Focus on construction industry use cases like RFIs, safety inspections, project management, etc.`;

      const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}\n\nGenerate TypeScript code that fulfills this requirement. Include comments explaining key parts.`;

      const result = await generativeModel.generateContent(fullPrompt);
      const response = await result.response;
      const generatedText = response.text();

      // Extract code from markdown if present
      const code = this.extractCode(generatedText);

      // Estimate tokens (Gemini doesn't provide exact counts in free tier)
      const promptTokens = Math.ceil(fullPrompt.length / 4);
      const completionTokens = Math.ceil(generatedText.length / 4);

      return {
        code,
        explanation: this.generateExplanation(prompt, code),
        tokens: {
          prompt: promptTokens,
          completion: completionTokens,
          total: promptTokens + completionTokens
        },
        cost: this.calculateGeminiCost(promptTokens, completionTokens, model),
        provider: 'gemini',
        model
      };
    } catch (error: any) {
      console.error('Gemini generation error:', error);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  /**
   * Generate code using OpenAI
   */
  private async generateWithOpenAI(
    prompt: string,
    model: string = 'gpt-4o-mini'
  ): Promise<CodeGenerationResult> {
    if (!this.openaiClient) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const systemPrompt = `You are an expert TypeScript developer specializing in construction management applications.
Generate clean, production-ready TypeScript code with proper types, error handling, and comments.
Focus on construction industry use cases like RFIs, safety inspections, project management, subcontractor management, etc.
Always include:
- Proper TypeScript interfaces/types
- Error handling with try-catch
- JSDoc comments for functions
- Meaningful variable names
- Industry-specific logic`;

      const completion = await this.openaiClient.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate TypeScript code for: ${prompt}` }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const generatedText = completion.choices[0]?.message?.content || '';
      const code = this.extractCode(generatedText);

      const promptTokens = completion.usage?.prompt_tokens || 0;
      const completionTokens = completion.usage?.completion_tokens || 0;
      const totalTokens = completion.usage?.total_tokens || 0;

      return {
        code,
        explanation: this.generateExplanation(prompt, code),
        tokens: {
          prompt: promptTokens,
          completion: completionTokens,
          total: totalTokens
        },
        cost: this.calculateOpenAICost(promptTokens, completionTokens, model),
        provider: 'openai',
        model
      };
    } catch (error: any) {
      console.error('OpenAI generation error:', error);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  /**
   * Extract code from markdown code blocks
   */
  private extractCode(text: string): string {
    // Try to extract code from markdown code blocks
    const codeBlockRegex = /```(?:typescript|ts|javascript|js)?\n([\s\S]*?)```/g;
    const matches = [...text.matchAll(codeBlockRegex)];

    if (matches.length > 0) {
      // Return all code blocks concatenated
      return matches.map(match => match[1].trim()).join('\n\n');
    }

    // If no code blocks found, return the whole text
    return text.trim();
  }

  /**
   * Generate explanation for the code
   */
  private generateExplanation(prompt: string, code: string): string {
    const lines = code.split('\n').length;
    const hasInterfaces = code.includes('interface ');
    const hasFunctions = code.includes('function ') || code.includes('const ') || code.includes('async ');
    const hasErrorHandling = code.includes('try') && code.includes('catch');

    let explanation = `Generated TypeScript code for: "${prompt}"\n\n`;
    explanation += `Code Statistics:\n`;
    explanation += `- Lines of code: ${lines}\n`;
    explanation += `- Includes type definitions: ${hasInterfaces ? 'Yes' : 'No'}\n`;
    explanation += `- Includes functions: ${hasFunctions ? 'Yes' : 'No'}\n`;
    explanation += `- Includes error handling: ${hasErrorHandling ? 'Yes' : 'No'}\n\n`;
    explanation += `This code is production-ready and follows TypeScript best practices for construction management applications.`;

    return explanation;
  }

  /**
   * Calculate cost for Gemini API
   * Pricing (as of 2024): Free tier available, paid tier varies
   */
  private calculateGeminiCost(promptTokens: number, completionTokens: number, model: string): number {
    // Gemini Pro pricing (approximate)
    const inputCostPer1k = 0.00025; // $0.00025 per 1K input tokens
    const outputCostPer1k = 0.0005; // $0.0005 per 1K output tokens

    const inputCost = (promptTokens / 1000) * inputCostPer1k;
    const outputCost = (completionTokens / 1000) * outputCostPer1k;

    return inputCost + outputCost;
  }

  /**
   * Calculate cost for OpenAI API
   * Pricing (as of 2024)
   */
  private calculateOpenAICost(promptTokens: number, completionTokens: number, model: string): number {
    let inputCostPer1k = 0;
    let outputCostPer1k = 0;

    switch (model) {
      case 'gpt-4o':
        inputCostPer1k = 0.005; // $5 per 1M tokens = $0.005 per 1K
        outputCostPer1k = 0.015; // $15 per 1M tokens = $0.015 per 1K
        break;
      case 'gpt-4o-mini':
        inputCostPer1k = 0.00015; // $0.15 per 1M tokens = $0.00015 per 1K
        outputCostPer1k = 0.0006; // $0.60 per 1M tokens = $0.0006 per 1K
        break;
      case 'gpt-4-turbo':
        inputCostPer1k = 0.01; // $10 per 1M tokens
        outputCostPer1k = 0.03; // $30 per 1M tokens
        break;
      case 'gpt-3.5-turbo':
        inputCostPer1k = 0.0005; // $0.50 per 1M tokens
        outputCostPer1k = 0.0015; // $1.50 per 1M tokens
        break;
      default:
        inputCostPer1k = 0.00015; // Default to gpt-4o-mini pricing
        outputCostPer1k = 0.0006;
    }

    const inputCost = (promptTokens / 1000) * inputCostPer1k;
    const outputCost = (completionTokens / 1000) * outputCostPer1k;

    return inputCost + outputCost;
  }

  /**
   * Get available models for a provider
   */
  static getAvailableModels(provider: 'gemini' | 'openai'): Array<{ id: string; label: string; description: string }> {
    if (provider === 'gemini') {
      return [
        { id: 'gemini-pro', label: 'Gemini Pro', description: 'Best for text generation' },
        { id: 'gemini-pro-vision', label: 'Gemini Pro Vision', description: 'Supports images' },
        { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', description: 'Latest model with extended context' }
      ];
    } else {
      return [
        { id: 'gpt-4o', label: 'GPT-4o', description: 'Most capable, multimodal' },
        { id: 'gpt-4o-mini', label: 'GPT-4o Mini', description: 'Fast and affordable' },
        { id: 'gpt-4-turbo', label: 'GPT-4 Turbo', description: 'High intelligence' },
        { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Fast and economical' }
      ];
    }
  }

  /**
   * Test API connection
   */
  async testConnection(provider: 'gemini' | 'openai'): Promise<boolean> {
    try {
      const result = await this.generateCode(
        'Generate a simple hello world function in TypeScript',
        provider
      );
      return result.code.length > 0;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Create AI Code Generator from environment variables
 */
export const createAICodeGenerator = (): AICodeGenerator => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!geminiKey && !openaiKey) {
    console.warn('⚠️  No AI API keys configured. Code generation will not work.');
  }

  return new AICodeGenerator(geminiKey, openaiKey);
};

