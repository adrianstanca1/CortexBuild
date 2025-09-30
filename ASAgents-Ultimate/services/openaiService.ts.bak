// OpenAI API service
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY;

export const openaiService = {
  // Generate text completion
  async generateCompletion(prompt: string, options: any = {}): Promise<string> {
    const { model = 'gpt-4-turbo-preview', maxTokens = 2048 } = options;
    
    if (!API_KEY) {
      throw new Error('OpenAI API key not configured');
    }
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: maxTokens,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating completion:', error);
      throw error;
    }
  },

  // Stream chat completion
  async *streamChatCompletion(messages: any[], options: any = {}) {
    const { model = 'gpt-4-turbo-preview', maxTokens = 2048 } = options;
    
    if (!API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          temperature: 0.7,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                break;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
                  const content = parsed.choices[0].delta.content;
                  if (content) {
                    yield content;
                  }
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      } catch (error) {
        console.error('Error in streaming chat:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error setting up stream:', error);
      throw error;
    }
  },

  // Analyze construction documents
  async analyzeConstructionDocument(content: string): Promise<any> {
    const prompt = `
      Analyze this construction document and extract key information:
      ${content}
      
      Please provide:
      1. Document type (invoice, contract, report, etc.)
      2. Key dates
      3. Financial information
      4. Risk factors
      5. Action items
      6. Summary
      
      Format the response as JSON.
    `;

    try {
      const response = await this.generateCompletion(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error analyzing document:', error);
      return {
        documentType: 'Unknown',
        summary: 'Analysis failed',
        error: error.message
      };
    }
  },

  // Test connection
  async testConnection(): Promise<boolean> {
    if (!API_KEY) {
      return false;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
};