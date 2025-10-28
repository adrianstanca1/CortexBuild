export type AgentResponse = {
  content: string;
};

export abstract class BaseAgent {
  // Placeholder query implementation. Replace with real AI backend when available.
  protected async query(_prompt: string): Promise<AgentResponse> {
    throw new Error('AI backend not configured');
  }

  protected extractJSON(text: string): any {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  protected validateResponse(obj: any, requiredKeys: string[]): boolean {
    if (!obj || typeof obj !== 'object') return false;
    return requiredKeys.every((k) => k in obj);
  }
}

