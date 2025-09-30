import { AIProviderBase, AIMessage, AIResponse, AIProvider, MultimodalInput } from './providers';
import { AILanguageProcessor, DetectedLanguage } from './language';

// Conversation Context
export interface ConversationContext {
  id: string;
  title: string;
  language: string;
  domain: string; // 'construction', 'general', 'technical', 'creative'
  participants: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Conversation Manager
export class ConversationManager {
  private conversations = new Map<string, AIMessage[]>();
  private contexts = new Map<string, ConversationContext>();
  private providers = new Map<AIProvider, AIProviderBase>();

  constructor(private languageProcessor: AILanguageProcessor) {}

  // Register AI Providers
  registerProvider(provider: AIProvider, instance: AIProviderBase): void {
    this.providers.set(provider, instance);
  }

  // Create New Conversation
  createConversation(
    title: string,
    domain: string = 'general',
    language: string = 'en'
  ): string {
    const id = crypto.randomUUID();
    const context: ConversationContext = {
      id,
      title,
      language,
      domain,
      participants: [],
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.contexts.set(id, context);
    this.conversations.set(id, []);
    return id;
  }

  // Add Message to Conversation
  addMessage(conversationId: string, message: Omit<AIMessage, 'id' | 'timestamp'>): void {
    const messages = this.conversations.get(conversationId) || [];
    const fullMessage: AIMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };

    messages.push(fullMessage);
    this.conversations.set(conversationId, messages);

    // Update conversation context
    const context = this.contexts.get(conversationId);
    if (context) {
      context.updatedAt = new Date();
      this.contexts.set(conversationId, context);
    }
  }

  // Get Conversation Messages
  getMessages(conversationId: string): AIMessage[] {
    return this.conversations.get(conversationId) || [];
  }

  // Get Conversation Context
  getContext(conversationId: string): ConversationContext | null {
    return this.contexts.get(conversationId) || null;
  }

  // Smart Provider Selection
  private async selectProvider(
    messages: AIMessage[],
    input?: MultimodalInput,
    preferredProvider?: AIProvider
  ): Promise<AIProviderBase> {
    // If a preferred provider is specified and available, use it
    if (preferredProvider && this.providers.has(preferredProvider)) {
      const provider = this.providers.get(preferredProvider)!;
      
      // Check if provider supports the required modalities
      if (input?.images && !provider.supportsMediaType('image')) {
        // Fall back to a provider that supports images
        for (const [type, instance] of this.providers.entries()) {
          if (instance.supportsMediaType('image')) {
            return instance;
          }
        }
      }
      
      return provider;
    }

    // Analyze the conversation to determine the best provider
    const lastMessage = messages[messages.length - 1];
    const hasCode = lastMessage?.codeLanguage || /```[\s\S]*```/.test(lastMessage?.content || '');
    const hasImages = input?.images && input.images.length > 0;
    const hasAudio = input?.audio;
    const hasVideo = input?.video;

    // Provider selection logic
    if (hasCode) {
      // Prefer Copilot for code-related tasks
      const copilot = this.providers.get('copilot');
      if (copilot) return copilot;
    }

    if (hasVideo) {
      // Only Gemini supports video
      const gemini = this.providers.get('gemini');
      if (gemini) return gemini;
    }

    if (hasImages || hasAudio) {
      // Prefer providers with multimodal capabilities
      const gemini = this.providers.get('gemini');
      if (gemini) return gemini;
      
      const openai = this.providers.get('openai');
      if (openai) return openai;
    }

    // Default to first available provider
    return this.providers.values().next().value;
  }

  // Send Message with Auto-Provider Selection
  async sendMessage(
    conversationId: string,
    content: string,
    input?: MultimodalInput,
    preferredProvider?: AIProvider
  ): Promise<AIResponse> {
    const messages = this.getMessages(conversationId);
    const context = this.getContext(conversationId);

    // Detect language if not specified
    let detectedLanguage: DetectedLanguage | null = null;
    if (content && (!context?.language || context.language === 'auto')) {
      try {
        detectedLanguage = await this.languageProcessor.enhancedLanguageDetection(content);
        if (context) {
          context.language = detectedLanguage.code;
          this.contexts.set(conversationId, context);
        }
      } catch (error) {
        console.error('Language detection failed:', error);
      }
    }

    // Add user message
    const userMessage: AIMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
      language: detectedLanguage?.code || context?.language || 'en',
      mediaType: input?.images ? 'image' : 'text'
    };

    messages.push(userMessage);

    // Select appropriate provider
    const provider = await this.selectProvider(messages, input, preferredProvider);

    try {
      // Send message to AI provider
      const response = await provider.sendMessage(messages, input);

      // Add assistant response
      const assistantMessage: AIMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        provider: response.provider,
        language: detectedLanguage?.code || context?.language || 'en'
      };

      messages.push(assistantMessage);
      this.conversations.set(conversationId, messages);

      return response;
    } catch (error) {
      console.error('AI provider error:', error);
      throw error;
    }
  }

  // Stream Message with Auto-Provider Selection
  async streamMessage(
    conversationId: string,
    content: string,
    onChunk: (chunk: string) => void,
    input?: MultimodalInput,
    preferredProvider?: AIProvider
  ): Promise<AIResponse> {
    const messages = this.getMessages(conversationId);
    const userMessage: AIMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    messages.push(userMessage);

    const provider = await this.selectProvider(messages, input, preferredProvider);
    
    try {
      const response = await provider.streamMessage(messages, input, onChunk);

      const assistantMessage: AIMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        provider: response.provider
      };

      messages.push(assistantMessage);
      this.conversations.set(conversationId, messages);

      return response;
    } catch (error) {
      console.error('AI streaming error:', error);
      throw error;
    }
  }

  // Translate Conversation
  async translateConversation(conversationId: string, targetLanguage: string): Promise<AIMessage[]> {
    const messages = this.getMessages(conversationId);
    const translatedMessages: AIMessage[] = [];

    for (const message of messages) {
      if (message.role === 'system') {
        translatedMessages.push(message);
        continue;
      }

      try {
        const translation = await this.languageProcessor.smartTranslation(
          message.content,
          targetLanguage,
          'Conversation message translation'
        );

        translatedMessages.push({
          ...message,
          content: translation.translatedText,
          language: targetLanguage,
          metadata: {
            ...message.metadata,
            originalContent: message.content,
            originalLanguage: message.language || 'unknown',
            translationConfidence: translation.confidence
          }
        });
      } catch (error) {
        console.error('Translation failed for message:', error);
        translatedMessages.push(message); // Keep original if translation fails
      }
    }

    return translatedMessages;
  }

  // Export Conversation
  exportConversation(conversationId: string, format: 'json' | 'markdown' | 'txt' = 'json'): string {
    const messages = this.getMessages(conversationId);
    const context = this.getContext(conversationId);

    switch (format) {
      case 'markdown':
        let markdown = `# ${context?.title || 'Conversation'}\n\n`;
        markdown += `**Language:** ${context?.language || 'unknown'}\n`;
        markdown += `**Domain:** ${context?.domain || 'general'}\n`;
        markdown += `**Created:** ${context?.createdAt.toISOString()}\n\n`;

        for (const message of messages) {
          const role = message.role.charAt(0).toUpperCase() + message.role.slice(1);
          markdown += `## ${role}\n\n${message.content}\n\n`;
          if (message.provider) {
            markdown += `*Powered by ${message.provider}*\n\n`;
          }
        }
        return markdown;

      case 'txt':
        let text = `${context?.title || 'Conversation'}\n`;
        text += `${'='.repeat(text.length)}\n\n`;

        for (const message of messages) {
          const role = message.role.toUpperCase();
          text += `${role}: ${message.content}\n\n`;
        }
        return text;

      default:
        return JSON.stringify({
          context,
          messages
        }, null, 2);
    }
  }

  // List All Conversations
  listConversations(): ConversationContext[] {
    return Array.from(this.contexts.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  // Delete Conversation
  deleteConversation(conversationId: string): boolean {
    const exists = this.conversations.has(conversationId);
    this.conversations.delete(conversationId);
    this.contexts.delete(conversationId);
    return exists;
  }

  // Clear All Conversations
  clearAllConversations(): void {
    this.conversations.clear();
    this.contexts.clear();
  }
}