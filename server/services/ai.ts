// CortexBuild AI Service - OpenAI Integration
// Handles all AI operations: code generation, chat, analysis, etc.

import OpenAI from 'openai';
import Database from 'better-sqlite3';
import * as mcp from './mcp';

// Initialize OpenAI clients with multiple API keys for load balancing
const primaryOpenAI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-proj-test-key'
});

const legacyOpenAI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_LEGACY || process.env.OPENAI_API_KEY || 'sk-proj-test-key'
});

// API key rotation for SDK developer users
let useAlternateKey = false;

export function getOpenAIClient(forSDKUser: boolean = false): OpenAI {
  if (forSDKUser) {
    // Rotate between keys for SDK users to distribute load
    useAlternateKey = !useAlternateKey;
    return useAlternateKey ? legacyOpenAI : primaryOpenAI;
  }
  return primaryOpenAI;
}

// Legacy export for backward compatibility
const openai = primaryOpenAI;

interface AIRequest {
  userId: string;
  companyId: string;
  provider: string;
  model: string;
  requestType: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

// Track AI usage in database
export function trackAIUsage(db: Database.Database, request: AIRequest) {
  try {
    db.prepare(`
      INSERT INTO ai_requests (user_id, company_id, provider, model, request_type, prompt_tokens, completion_tokens, total_tokens, estimated_cost)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      request.userId,
      request.companyId,
      request.provider,
      request.model,
      request.requestType,
      request.promptTokens,
      request.completionTokens,
      request.totalTokens,
      request.estimatedCost
    );

    // Update SDK developer usage
    db.prepare(`
      UPDATE sdk_developers 
      SET api_requests_used = api_requests_used + 1 
      WHERE user_id = ?
    `).run(request.userId);
  } catch (error) {
    console.error('Failed to track AI usage:', error);
  }
}

// Calculate cost based on model and tokens
function calculateCost(model: string, promptTokens: number, completionTokens: number): number {
  const pricing: Record<string, { prompt: number; completion: number }> = {
    'gpt-4': { prompt: 0.03 / 1000, completion: 0.06 / 1000 },
    'gpt-4-turbo': { prompt: 0.01 / 1000, completion: 0.03 / 1000 },
    'gpt-3.5-turbo': { prompt: 0.0005 / 1000, completion: 0.0015 / 1000 }
  };

  const modelPricing = pricing[model] || pricing['gpt-3.5-turbo'];
  return (promptTokens * modelPricing.prompt) + (completionTokens * modelPricing.completion);
}

// Generate code from natural language
export async function generateCode(
  prompt: string,
  userId: string,
  companyId: string,
  db: Database.Database
): Promise<{ code: string; explanation: string }> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert React/TypeScript developer specializing in construction management applications.
Generate clean, production-ready code following these guidelines:
- Use TypeScript with proper type definitions
- Follow React best practices and hooks
- Use Tailwind CSS for styling
- Include error handling
- Add helpful comments
- Make code modular and reusable
- Focus on construction industry use cases`
        },
        {
          role: 'user',
          content: `Generate a complete React component for: ${prompt}\n\nProvide the code and a brief explanation.`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const response = completion.choices[0].message.content || '';
    
    // Extract code and explanation
    const codeMatch = response.match(/```(?:typescript|tsx|jsx)?\n([\s\S]*?)```/);
    const code = codeMatch ? codeMatch[1].trim() : response;
    const explanation = response.replace(/```(?:typescript|tsx|jsx)?\n[\s\S]*?```/g, '').trim();

    // Track usage
    trackAIUsage(db, {
      userId,
      companyId,
      provider: 'openai',
      model: 'gpt-4-turbo',
      requestType: 'code_generation',
      promptTokens: completion.usage?.prompt_tokens || 0,
      completionTokens: completion.usage?.completion_tokens || 0,
      totalTokens: completion.usage?.total_tokens || 0,
      estimatedCost: calculateCost('gpt-4-turbo', completion.usage?.prompt_tokens || 0, completion.usage?.completion_tokens || 0)
    });

    return { code, explanation };
  } catch (error: any) {
    console.error('Code generation error:', error);
    throw new Error(`AI code generation failed: ${error.message}`);
  }
}

// Developer-focused chatbot with MCP support
export async function developerChat(
  message: string,
  conversationHistory: Array<{ role: string; content: string }>,
  userId: string,
  companyId: string,
  db: Database.Database,
  sessionId?: string
): Promise<{ response: string; sessionId: string }> {
  try {
    // Get or create MCP session
    const mcpSessionId = mcp.getOrCreateSession(db, userId, sessionId);

    // Add user message to MCP session
    mcp.addMessage(db, mcpSessionId, 'user', message);

    // Build enhanced prompt with MCP context
    const systemPrompt = `You are an expert CortexBuild SDK Developer Assistant specializing in construction management software development.

Your capabilities:
- Help developers build custom modules and apps
- Explain CortexBuild SDK APIs and features
- Provide code examples and best practices
- Debug issues and suggest solutions
- Guide through template customization
- Explain workflow automation
- Help with AI agent configuration
- Assist with integrations (QuickBooks, Slack, etc.)

CortexBuild SDK Features:
- Modular architecture with self-contained modules
- Type-safe TypeScript APIs
- Real-time data access to projects, RFIs, invoices, etc.
- AI-powered code generation
- Visual workflow builder
- AI agents for automation
- 30+ construction-specific templates
- Sandbox testing environment
- One-click deployment
- 70% revenue share marketplace

Always provide:
- Clear, actionable answers
- Code examples when relevant
- Links to documentation (use placeholder URLs)
- Best practices for construction industry
- Security and performance considerations`;

    const { messages: enhancedMessages } = mcp.buildEnhancedPrompt(
      db,
      mcpSessionId,
      message,
      systemPrompt
    );

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: enhancedMessages,
      temperature: 0.8,
      max_tokens: 1500
    });

    const response = completion.choices[0].message.content || 'I apologize, but I could not generate a response.';

    // Add assistant response to MCP session
    mcp.addMessage(db, mcpSessionId, 'assistant', response);

    // Track usage
    trackAIUsage(db, {
      userId,
      companyId,
      provider: 'openai',
      model: 'gpt-4-turbo',
      requestType: 'developer_chat',
      promptTokens: completion.usage?.prompt_tokens || 0,
      completionTokens: completion.usage?.completion_tokens || 0,
      totalTokens: completion.usage?.total_tokens || 0,
      estimatedCost: calculateCost('gpt-4-turbo', completion.usage?.prompt_tokens || 0, completion.usage?.completion_tokens || 0)
    });

    // Save to chat history (legacy)
    db.prepare(`
      INSERT INTO ai_chat_history (user_id, company_id, role, content, context_type)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, companyId, 'user', message, 'developer');

    db.prepare(`
      INSERT INTO ai_chat_history (user_id, company_id, role, content, context_type)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, companyId, 'assistant', response, 'developer');

    return { response, sessionId: mcpSessionId };
  } catch (error: any) {
    console.error('Developer chat error:', error);
    throw new Error(`AI chat failed: ${error.message}`);
  }
}

// Analyze code for security and best practices
export async function analyzeCode(
  code: string,
  userId: string,
  companyId: string,
  db: Database.Database
): Promise<{ issues: string[]; suggestions: string[]; score: number }> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a code review expert. Analyze the provided code for security issues, performance problems, and best practice violations. Return a JSON object with: issues (array of problems), suggestions (array of improvements), and score (0-100).'
        },
        {
          role: 'user',
          content: `Analyze this code:\n\n${code}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    const response = JSON.parse(completion.choices[0].message.content || '{}');

    // Track usage
    trackAIUsage(db, {
      userId,
      companyId,
      provider: 'openai',
      model: 'gpt-4-turbo',
      requestType: 'code_analysis',
      promptTokens: completion.usage?.prompt_tokens || 0,
      completionTokens: completion.usage?.completion_tokens || 0,
      totalTokens: completion.usage?.total_tokens || 0,
      estimatedCost: calculateCost('gpt-4-turbo', completion.usage?.prompt_tokens || 0, completion.usage?.completion_tokens || 0)
    });

    return {
      issues: response.issues || [],
      suggestions: response.suggestions || [],
      score: response.score || 0
    };
  } catch (error: any) {
    console.error('Code analysis error:', error);
    throw new Error(`AI code analysis failed: ${error.message}`);
  }
}

// Generate test cases for code
export async function generateTests(
  code: string,
  userId: string,
  companyId: string,
  db: Database.Database
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a testing expert. Generate comprehensive unit tests using Jest and React Testing Library for the provided code.'
        },
        {
          role: 'user',
          content: `Generate tests for this code:\n\n${code}`
        }
      ],
      temperature: 0.5,
      max_tokens: 1500
    });

    const tests = completion.choices[0].message.content || '';

    // Track usage
    trackAIUsage(db, {
      userId,
      companyId,
      provider: 'openai',
      model: 'gpt-4-turbo',
      requestType: 'test_generation',
      promptTokens: completion.usage?.prompt_tokens || 0,
      completionTokens: completion.usage?.completion_tokens || 0,
      totalTokens: completion.usage?.total_tokens || 0,
      estimatedCost: calculateCost('gpt-4-turbo', completion.usage?.prompt_tokens || 0, completion.usage?.completion_tokens || 0)
    });

    return tests;
  } catch (error: any) {
    console.error('Test generation error:', error);
    throw new Error(`AI test generation failed: ${error.message}`);
  }
}

// Add code context to MCP session
export function addCodeContext(
  db: Database.Database,
  userId: string,
  sessionId: string,
  code: string,
  language: string = 'typescript',
  metadata: any = {}
): string {
  return mcp.addContext(db, sessionId, userId, 'code', {
    code,
    language,
    timestamp: new Date().toISOString()
  }, {
    ...metadata,
    tags: ['code', language]
  });
}

// Add project context to MCP session
export function addProjectContext(
  db: Database.Database,
  userId: string,
  sessionId: string,
  projectData: any
): string {
  return mcp.addContext(db, sessionId, userId, 'project', projectData, {
    tags: ['project', 'construction']
  });
}

// Get MCP session statistics
export function getMCPStats(db: Database.Database, userId: string): any {
  return mcp.getSessionStats(db, userId);
}

