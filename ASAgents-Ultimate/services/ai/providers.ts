import { GoogleGenerativeAI } from '@google/genai';

// AI Provider Types
export type AIProvider = 'openai' | 'gemini' | 'copilot' | 'anthropic';
export type MessageRole = 'system' | 'user' | 'assistant';
export type MediaType = 'text' | 'image' | 'audio' | 'video' | 'file';

// Unified Message Interface
export interface AIMessage {
  id: string;
  role: MessageRole;
  content: string;
  mediaType?: MediaType;
  mediaUrl?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  provider?: AIProvider;
  language?: string;
  codeLanguage?: string;
}

// AI Provider Configuration
export interface AIProviderConfig {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  capabilities: {
    text: boolean;
    image: boolean;
    audio: boolean;
    video: boolean;
    code: boolean;
    realtime: boolean;
  };
}

// Provider Configurations
export const AI_PROVIDERS: Record<AIProvider, AIProviderConfig> = {
  openai: {
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: 4000,
    capabilities: {
      text: true,
      image: true,
      audio: true,
      video: false,
      code: true,
      realtime: true
    }
  },
  gemini: {
    model: 'gemini-1.5-pro',
    temperature: 0.7,
    maxTokens: 4000,
    capabilities: {
      text: true,
      image: true,
      audio: true,
      video: true,
      code: true,
      realtime: false
    }
  },
  copilot: {
    model: 'gpt-4-copilot',
    temperature: 0.3,
    maxTokens: 2000,
    capabilities: {
      text: true,
      image: false,
      audio: false,
      video: false,
      code: true,
      realtime: true
    }
  },
  anthropic: {
    model: 'claude-3-opus',
    temperature: 0.7,
    maxTokens: 4000,
    capabilities: {
      text: true,
      image: true,
      audio: false,
      video: false,
      code: true,
      realtime: false
    }
  }
};

// Response Interface
export interface AIResponse {
  id: string;
  provider: AIProvider;
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
  model?: string;
  timestamp: Date;
  language?: string;
  confidence?: number;
  metadata?: Record<string, any>;
}

// Multimodal Input Interface
export interface MultimodalInput {
  text?: string;
  images?: File[] | string[];
  audio?: File | string;
  video?: File | string;
  files?: File[];
  language?: string;
  context?: Record<string, any>;
}

// Abstract AI Provider Interface
export abstract class AIProviderBase {
  protected config: AIProviderConfig;
  protected provider: AIProvider;

  constructor(provider: AIProvider, config?: Partial<AIProviderConfig>) {
    this.provider = provider;
    this.config = { ...AI_PROVIDERS[provider], ...config };
  }

  abstract sendMessage(
    messages: AIMessage[],
    input?: MultimodalInput
  ): Promise<AIResponse>;

  abstract streamMessage(
    messages: AIMessage[],
    input?: MultimodalInput,
    onChunk: (chunk: string) => void
  ): Promise<AIResponse>;

  abstract analyzeMedia(
    mediaUrl: string,
    mediaType: MediaType,
    prompt?: string
  ): Promise<AIResponse>;

  getCapabilities() {
    return this.config.capabilities;
  }

  supportsMediaType(mediaType: MediaType): boolean {
    switch (mediaType) {
      case 'text': return this.config.capabilities.text;
      case 'image': return this.config.capabilities.image;
      case 'audio': return this.config.capabilities.audio;
      case 'video': return this.config.capabilities.video;
      default: return false;
    }
  }
}

// Gemini Provider Implementation
export class GeminiProvider extends AIProviderBase {
  private client?: GoogleGenerativeAI;

  constructor(apiKey?: string, config?: Partial<AIProviderConfig>) {
    super('gemini', config);
    if (apiKey) {
      this.client = new GoogleGenerativeAI(apiKey);
    }
  }

  async sendMessage(messages: AIMessage[], input?: MultimodalInput): Promise<AIResponse> {
    if (!this.client) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const model = this.client.getGenerativeModel({ 
        model: this.config.model || 'gemini-1.5-pro' 
      });

      // Convert messages to Gemini format
      const prompt = this.formatMessages(messages, input);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      return {
        id: crypto.randomUUID(),
        provider: 'gemini',
        content: response.text(),
        timestamp: new Date(),
        model: this.config.model,
        metadata: {
          candidates: response.candidates,
          promptFeedback: response.promptFeedback
        }
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  async streamMessage(
    messages: AIMessage[],
    input?: MultimodalInput,
    onChunk: (chunk: string) => void
  ): Promise<AIResponse> {
    if (!this.client) {
      throw new Error('Gemini API key not configured');
    }

    const model = this.client.getGenerativeModel({ 
      model: this.config.model || 'gemini-1.5-pro' 
    });

    const prompt = this.formatMessages(messages, input);
    const result = await model.generateContentStream(prompt);

    let fullContent = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullContent += chunkText;
      onChunk(chunkText);
    }

    return {
      id: crypto.randomUUID(),
      provider: 'gemini',
      content: fullContent,
      timestamp: new Date(),
      model: this.config.model
    };
  }

  async analyzeMedia(mediaUrl: string, mediaType: MediaType, prompt?: string): Promise<AIResponse> {
    if (!this.client) {
      throw new Error('Gemini API key not configured');
    }

    const model = this.client.getGenerativeModel({ 
      model: 'gemini-1.5-pro' 
    });

    let parts: any[] = [];
    
    if (mediaType === 'image') {
      // Handle image analysis
      const response = await fetch(mediaUrl);
      const imageData = await response.arrayBuffer();
      
      parts = [
        { text: prompt || 'Analyze this image' },
        {
          inlineData: {
            data: Buffer.from(imageData).toString('base64'),
            mimeType: 'image/jpeg'
          }
        }
      ];
    }

    const result = await model.generateContent(parts);
    const response = await result.response;

    return {
      id: crypto.randomUUID(),
      provider: 'gemini',
      content: response.text(),
      timestamp: new Date(),
      model: 'gemini-1.5-pro'
    };
  }

  private formatMessages(messages: AIMessage[], input?: MultimodalInput): string {
    let prompt = '';
    
    // Add system messages
    const systemMessages = messages.filter(m => m.role === 'system');
    if (systemMessages.length > 0) {
      prompt += systemMessages.map(m => m.content).join('\n\n') + '\n\n';
    }

    // Add conversation history
    const conversationMessages = messages.filter(m => m.role !== 'system');
    for (const message of conversationMessages) {
      const rolePrefix = message.role === 'user' ? 'Human: ' : 'Assistant: ';
      prompt += `${rolePrefix}${message.content}\n\n`;
    }

    // Add current input if provided
    if (input?.text) {
      prompt += `Human: ${input.text}\n\nAssistant: `;
    }

    return prompt;
  }
}

// OpenAI Provider Implementation (placeholder)
export class OpenAIProvider extends AIProviderBase {
  constructor(apiKey?: string, config?: Partial<AIProviderConfig>) {
    super('openai', config);
  }

  async sendMessage(messages: AIMessage[], input?: MultimodalInput): Promise<AIResponse> {
    // TODO: Implement OpenAI integration
    throw new Error('OpenAI provider not yet implemented');
  }

  async streamMessage(
    messages: AIMessage[],
    input?: MultimodalInput,
    onChunk: (chunk: string) => void
  ): Promise<AIResponse> {
    // TODO: Implement OpenAI streaming
    throw new Error('OpenAI streaming not yet implemented');
  }

  async analyzeMedia(mediaUrl: string, mediaType: MediaType, prompt?: string): Promise<AIResponse> {
    // TODO: Implement OpenAI vision
    throw new Error('OpenAI media analysis not yet implemented');
  }
}

// Copilot Provider Implementation (placeholder)
export class CopilotProvider extends AIProviderBase {
  constructor(config?: Partial<AIProviderConfig>) {
    super('copilot', config);
  }

  async sendMessage(messages: AIMessage[], input?: MultimodalInput): Promise<AIResponse> {
    // TODO: Implement GitHub Copilot integration
    throw new Error('Copilot provider not yet implemented');
  }

  async streamMessage(
    messages: AIMessage[],
    input?: MultimodalInput,
    onChunk: (chunk: string) => void
  ): Promise<AIResponse> {
    throw new Error('Copilot streaming not yet implemented');
  }

  async analyzeMedia(mediaUrl: string, mediaType: MediaType, prompt?: string): Promise<AIResponse> {
    throw new Error('Copilot does not support media analysis');
  }
}

// Provider Factory
export class AIProviderFactory {
  static createProvider(
    provider: AIProvider,
    apiKey?: string,
    config?: Partial<AIProviderConfig>
  ): AIProviderBase {
    switch (provider) {
      case 'gemini':
        return new GeminiProvider(apiKey, config);
      case 'openai':
        return new OpenAIProvider(apiKey, config);
      case 'copilot':
        return new CopilotProvider(config);
      case 'anthropic':
        // TODO: Implement Anthropic provider
        throw new Error('Anthropic provider not yet implemented');
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }
}