// Multi-AI Service integrating Claude Sonnet 3.5, Gemini, and OpenAI
import { GoogleGenerativeAI } from '@google/genai';
import Anthropic from '@anthropic-ai/sdk';

export interface AIResponse {
  content: string;
  provider: 'claude' | 'gemini' | 'openai';
  model: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
}

export interface AIServiceConfig {
  geminiApiKey?: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  preferredProvider?: 'claude' | 'gemini' | 'openai';
  fallbackEnabled?: boolean;
}

export class MultiAIService {
  private geminiClient?: GoogleGenerativeAI;
  private anthropicClient?: Anthropic;
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = {
      fallbackEnabled: true,
      preferredProvider: 'claude',
      ...config
    };

    if (config.geminiApiKey) {
      this.geminiClient = new GoogleGenerativeAI(config.geminiApiKey);
    }

    if (config.anthropicApiKey) {
      this.anthropicClient = new Anthropic({
        apiKey: config.anthropicApiKey,
        dangerouslyAllowBrowser: true
      });
    }
  }

  async generateText(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
    provider?: 'claude' | 'gemini' | 'openai';
    systemPrompt?: string;
  }): Promise<AIResponse> {
    const provider = options?.provider || this.config.preferredProvider || 'claude';
    
    try {
      switch (provider) {
        case 'claude':
          return await this.generateWithClaude(prompt, options);
        case 'gemini':
          return await this.generateWithGemini(prompt, options);
        case 'openai':
          return await this.generateWithOpenAI(prompt, options);
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      console.error(`AI generation failed with ${provider}:`, error);
      
      if (this.config.fallbackEnabled) {
        const fallbackProviders: Array<'claude' | 'gemini' | 'openai'> = 
          ['claude', 'gemini', 'openai'].filter(p => p !== provider) as Array<'claude' | 'gemini' | 'openai'>;
        
        for (const fallbackProvider of fallbackProviders) {
          try {
            console.log(`Trying fallback provider: ${fallbackProvider}`);
            return await this.generateText(prompt, { ...options, provider: fallbackProvider });
          } catch (fallbackError) {
            console.error(`Fallback provider ${fallbackProvider} also failed:`, fallbackError);
          }
        }
      }
      
      throw new Error(`All AI providers failed. Last error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateWithClaude(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
  }): Promise<AIResponse> {
    if (!this.anthropicClient) {
      throw new Error('Anthropic API key not configured');
    }

    try {
      const message = await this.anthropicClient.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: options?.maxTokens || 1024,
        temperature: options?.temperature || 0.7,
        system: options?.systemPrompt || 'You are a helpful AI assistant specializing in construction management.',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      return {
        content: content.text,
        provider: 'claude',
        model: 'claude-3-5-sonnet-20241022',
        usage: {
          inputTokens: message.usage.input_tokens,
          outputTokens: message.usage.output_tokens,
          totalTokens: message.usage.input_tokens + message.usage.output_tokens
        }
      };
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error(`Claude API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateWithGemini(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
  }): Promise<AIResponse> {
    if (!this.geminiClient) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const model = this.geminiClient.getGenerativeModel({ 
        model: 'gemini-1.5-pro',
        generationConfig: {
          maxOutputTokens: options?.maxTokens || 1024,
          temperature: options?.temperature || 0.7,
        }
      });

      const fullPrompt = options?.systemPrompt 
        ? `${options.systemPrompt}\n\nUser: ${prompt}`
        : prompt;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      return {
        content: text,
        provider: 'gemini',
        model: 'gemini-1.5-pro',
        usage: {
          inputTokens: Math.floor(prompt.length / 4),
          outputTokens: Math.floor(text.length / 4),
          totalTokens: Math.floor((prompt.length + text.length) / 4)
        }
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateWithOpenAI(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
  }): Promise<AIResponse> {
    if (!this.config.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const messages = [];
      
      if (options?.systemPrompt) {
        messages.push({
          role: 'system',
          content: options.systemPrompt
        });
      }
      
      messages.push({
        role: 'user',
        content: prompt
      });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages,
          max_tokens: options?.maxTokens || 1024,
          temperature: options?.temperature || 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';

      return {
        content,
        provider: 'openai',
        model: 'gpt-4',
        usage: {
          inputTokens: data.usage?.prompt_tokens,
          outputTokens: data.usage?.completion_tokens,
          totalTokens: data.usage?.total_tokens
        }
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Specialized methods for construction management
  async generateProjectInsight(projectData: any): Promise<AIResponse> {
    const systemPrompt = `You are an expert construction project manager and business analyst. 
    Provide actionable insights and recommendations based on the project data provided.
    Focus on timeline optimization, cost management, resource allocation, and risk mitigation.`;

    const prompt = `Analyze this construction project data and provide insights:
    
    Project: ${projectData.name}
    Status: ${projectData.status}
    Budget: £${projectData.budget?.toLocaleString()}
    Timeline: ${projectData.startDate} to ${projectData.endDate}
    Team Size: ${projectData.teamSize || 'Not specified'}
    
    Provide specific recommendations for:
    1. Schedule optimization
    2. Cost management opportunities
    3. Resource allocation improvements
    4. Risk mitigation strategies
    5. Quality assurance measures`;

    return this.generateText(prompt, {
      systemPrompt,
      maxTokens: 1500,
      temperature: 0.7
    });
  }

  async generateSafetyAnalysis(incidentData: any): Promise<AIResponse> {
    const systemPrompt = `You are a construction safety expert and risk analyst.
    Analyze safety incidents and provide preventive measures and safety recommendations.`;

    const prompt = `Analyze this safety incident and provide recommendations:
    
    Type: ${incidentData.type}
    Severity: ${incidentData.severity}
    Description: ${incidentData.description}
    Location: ${incidentData.location}
    Date: ${incidentData.date}
    
    Provide:
    1. Root cause analysis
    2. Preventive measures
    3. Safety protocol recommendations
    4. Training requirements
    5. Equipment or process improvements`;

    return this.generateText(prompt, {
      systemPrompt,
      maxTokens: 1200,
      temperature: 0.6
    });
  }

  // Get service status
  getStatus() {
    return {
      gemini: !!this.config.geminiApiKey,
      openai: !!this.config.openaiApiKey,
      claude: !!this.config.anthropicApiKey,
      preferredProvider: this.config.preferredProvider,
      fallbackEnabled: this.config.fallbackEnabled
    };
  }
}