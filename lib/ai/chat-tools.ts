/**
 * Chat Tools for AI Integration
 * Provides utility functions for chat operations
 */

export interface ChatContext {
  userId: string;
  companyId: string;
  userName: string;
  companyName: string;
  userRole: string;
  currentPage?: string;
  availableData?: any;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: any;
}

export class ChatTools {
  /**
   * Format chat context for AI processing
   */
  static formatContext(context: ChatContext): string {
    return `
      User: ${context.userName}
      Company: ${context.companyName}
      Role: ${context.userRole}
      Current Page: ${context.currentPage || 'Unknown'}
      Available Data: ${JSON.stringify(context.availableData || {})}
    `.trim();
  }

  /**
   * Validate chat message format
   */
  static validateMessage(message: any): boolean {
    return message &&
           typeof message.content === 'string' &&
           message.content.trim().length > 0;
  }

  /**
   * Sanitize chat message content
   */
  static sanitizeMessage(content: string): string {
    return content
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 10000); // Limit message length
  }

  /**
   * Generate session ID for chat
   */
  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format chat history for AI context
   */
  static formatChatHistory(messages: ChatMessage[]): string {
    return messages
      .slice(-10) // Last 10 messages
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n');
  }

  /**
   * Check if user has permission for chat operation
   */
  static hasChatPermission(userRole: string, operation: string): boolean {
    const permissions = {
      'admin': ['read', 'write', 'delete', 'manage'],
      'manager': ['read', 'write', 'delete'],
      'user': ['read', 'write'],
      'viewer': ['read']
    };

    return permissions[userRole as keyof typeof permissions]?.includes(operation) || false;
  }

  /**
   * Get chat rate limits based on user role
   */
  static getRateLimits(userRole: string) {
    const limits = {
      'admin': { messages: 100, window: 60000 }, // 100 messages per minute
      'manager': { messages: 50, window: 60000 },  // 50 messages per minute
      'user': { messages: 20, window: 60000 },    // 20 messages per minute
      'viewer': { messages: 5, window: 60000 }    // 5 messages per minute
    };

    return limits[userRole as keyof typeof limits] || limits.user;
  }
}