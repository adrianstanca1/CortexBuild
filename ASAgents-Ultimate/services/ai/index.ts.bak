// @ts-nocheck
// Main AI Integration Hub
export { AIProviderBase, AIProvider, AIMessage, AIResponse, MultimodalInput } from './providers';
export { GeminiProvider } from './providers';
export { createAIProvider, listAvailableProviders } from './providers';

export { 
  DetectedLanguage, 
  TranslationResult, 
  BasicLanguageDetector,
  AILanguageProcessor,
  MultilingualContentManager 
} from './language';

export { 
  ConversationContext, 
  ConversationManager 
} from './conversation';

export { 
  FileContent,
  ProcessedFile,
  VoiceInput,
  VoiceOutput,
  ImageAnalysis,
  MultimodalHandler 
} from './multimodal';

export { 
  DevelopmentEnvironment,
  CodeContext,
  CompileError,
  CodeSuggestion,
  DevelopmentToolsIntegration 
} from './development';

// Unified AI System
import { GeminiProvider } from './providers';
import { AILanguageProcessor, BasicLanguageDetector } from './language';
import { ConversationManager } from './conversation';
import { MultimodalHandler } from './multimodal';
import { DevelopmentToolsIntegration } from './development';
import type { AIProvider } from './providers';

export class UnifiedAISystem {
  private languageDetector: BasicLanguageDetector;
  private languageProcessor: AILanguageProcessor;
  public conversationManager: ConversationManager;
  public multimodalHandler: MultimodalHandler;
  public developmentTools: DevelopmentToolsIntegration;

  constructor() {
    // Initialize language processing
    this.languageDetector = new BasicLanguageDetector();
    this.languageProcessor = new AILanguageProcessor(this.languageDetector);

    // Initialize conversation management
    this.conversationManager = new ConversationManager(this.languageProcessor);

    // Initialize multimodal handling
    this.multimodalHandler = new MultimodalHandler(this.conversationManager);

    // Initialize development tools integration
    this.developmentTools = new DevelopmentToolsIntegration(
      this.conversationManager,
      this.multimodalHandler,
      this.languageProcessor
    );

    // Setup AI providers
    this.setupProviders();
  }

  private setupProviders(): void {
    try {
      // Register Gemini provider (already implemented)
      const geminiProvider = new GeminiProvider();
      this.conversationManager.registerProvider('gemini', geminiProvider);

      // TODO: Register other providers when implemented
      // const openaiProvider = new OpenAIProvider();
      // this.conversationManager.registerProvider('openai', openaiProvider);
      
      // const copilotProvider = new CopilotProvider();
      // this.conversationManager.registerProvider('copilot', copilotProvider);
      
      // const anthropicProvider = new AnthropicProvider();
      // this.conversationManager.registerProvider('anthropic', anthropicProvider);

      console.log('AI providers registered successfully');
    } catch (error) {
      console.error('Failed to setup AI providers:', error);
    }
  }

  // Quick access methods
  async chat(
    message: string,
    conversationId?: string,
    provider?: AIProvider
  ): Promise<{ response: string; conversationId: string }> {
    if (!conversationId) {
      conversationId = this.conversationManager.createConversation(
        'Quick Chat',
        'general',
        'auto'
      );
    }

    const response = await this.conversationManager.sendMessage(
      conversationId,
      message,
      undefined,
      provider
    );

    return {
      response: response.content,
      conversationId
    };
  }

  async translate(
    text: string,
    targetLanguage: string,
    context?: string
  ): Promise<string> {
    const result = await this.languageProcessor.smartTranslation(
      text,
      targetLanguage,
      context || 'General translation'
    );
    return result.translatedText;
  }

  async detectLanguage(text: string): Promise<{
    code: string;
    name: string;
    confidence: number;
  }> {
    const detected = await this.languageProcessor.enhancedLanguageDetection(text);
    return {
      code: detected.code,
      name: detected.name,
      confidence: detected.confidence
    };
  }

  async analyzeCode(
    code: string,
    language: string,
    filename?: string
  ): Promise<string> {
    const conversationId = this.conversationManager.createConversation(
      'Code Analysis',
      'technical',
      'en'
    );

    try {
      const response = await this.conversationManager.sendMessage(
        conversationId,
        `Please analyze this ${language} code${filename ? ` from file "${filename}"` : ''}:

\`\`\`${language}
${code}
\`\`\`

Provide insights about:
1. Code quality and best practices
2. Potential bugs or issues
3. Performance optimizations
4. Suggestions for improvement`,
        undefined,
        'copilot' // Prefer Copilot for code analysis
      );

      return response.content;
    } finally {
      this.conversationManager.deleteConversation(conversationId);
    }
  }

  async processImage(
    imageFile: File,
    question?: string
  ): Promise<string> {
    const analysis = await this.multimodalHandler.analyzeImage(
      imageFile,
      'gemini' // Use Gemini for image analysis
    );

    if (question) {
      const conversationId = this.conversationManager.createConversation(
        'Image Analysis',
        'technical',
        'en'
      );

      try {
        const response = await this.conversationManager.sendMessage(
          conversationId,
          `Based on this image analysis: "${analysis.description}", please answer: ${question}`,
          {
            images: [{ 
              data: await this.fileToBase64(imageFile), 
              type: imageFile.type 
            }]
          },
          'gemini'
        );

        return response.content;
      } finally {
        this.conversationManager.deleteConversation(conversationId);
      }
    }

    return analysis.description;
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // System status and health
  getSystemStatus(): {
    providersRegistered: number;
    conversationsActive: number;
    languageSupport: boolean;
    multimodalSupport: boolean;
    developmentToolsReady: boolean;
  } {
    return {
      providersRegistered: 1, // Currently only Gemini
      conversationsActive: this.conversationManager.listConversations().length,
      languageSupport: true,
      multimodalSupport: true,
      developmentToolsReady: true
    };
  }
}

// Export singleton instance
export const aiSystem = new UnifiedAISystem();