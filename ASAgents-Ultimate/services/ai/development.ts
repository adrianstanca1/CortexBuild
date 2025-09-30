import { AIProviderBase, AIProvider } from './providers';
import { AILanguageProcessor } from './language';
import { ConversationManager } from './conversation';
import { MultimodalHandler } from './multimodal';

// Development Environment Types
export interface DevelopmentEnvironment {
  id: string;
  name: string;
  language: string;
  framework?: string;
  version?: string;
  extensions: string[];
  capabilities: string[];
}

export interface CodeContext {
  language: string;
  framework?: string;
  filename: string;
  content: string;
  dependencies?: string[];
  errors?: CompileError[];
  warnings?: CompileWarning[];
}

export interface CompileError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code?: string;
}

export interface CompileWarning extends CompileError {}

export interface CodeSuggestion {
  type: 'completion' | 'refactor' | 'fix' | 'documentation';
  title: string;
  description: string;
  code: string;
  confidence: number;
  provider: AIProvider;
}

// Development Tools Integration
export class DevelopmentToolsIntegration {
  private environments = new Map<string, DevelopmentEnvironment>();
  
  constructor(
    private conversationManager: ConversationManager,
    private multimodalHandler: MultimodalHandler,
    private languageProcessor: AILanguageProcessor
  ) {
    this.setupDefaultEnvironments();
  }

  private setupDefaultEnvironments(): void {
    const environments: DevelopmentEnvironment[] = [
      {
        id: 'vscode',
        name: 'Visual Studio Code',
        language: 'multi',
        extensions: ['copilot', 'intellisense', 'debugger'],
        capabilities: ['completion', 'refactoring', 'debugging', 'git']
      },
      {
        id: 'chatgpt',
        name: 'ChatGPT Interface',
        language: 'multi',
        capabilities: ['conversation', 'code-generation', 'explanation', 'debugging']
      },
      {
        id: 'gemini',
        name: 'Google Gemini',
        language: 'multi',
        capabilities: ['multimodal', 'code-analysis', 'conversation', 'translation']
      },
      {
        id: 'copilot',
        name: 'GitHub Copilot',
        language: 'multi',
        capabilities: ['code-completion', 'code-generation', 'chat', 'explanation']
      },
      {
        id: 'node',
        name: 'Node.js Environment',
        language: 'javascript',
        framework: 'node',
        capabilities: ['execution', 'debugging', 'npm', 'testing']
      },
      {
        id: 'react',
        name: 'React Development',
        language: 'typescript',
        framework: 'react',
        capabilities: ['jsx', 'hooks', 'components', 'hot-reload']
      },
      {
        id: 'vite',
        name: 'Vite Build System',
        language: 'javascript',
        framework: 'vite',
        capabilities: ['bundling', 'hot-reload', 'optimization', 'dev-server']
      }
    ];

    environments.forEach(env => {
      this.environments.set(env.id, env);
    });
  }

  // Register Development Environment
  registerEnvironment(environment: DevelopmentEnvironment): void {
    this.environments.set(environment.id, environment);
  }

  // Get Environment Capabilities
  getEnvironmentCapabilities(environmentId: string): string[] {
    const env = this.environments.get(environmentId);
    return env?.capabilities || [];
  }

  // Smart Code Completion
  async getCodeCompletions(
    context: CodeContext,
    cursorPosition: { line: number; column: number },
    environmentId?: string
  ): Promise<CodeSuggestion[]> {
    const suggestions: CodeSuggestion[] = [];

    // Analyze code context
    const analysisPrompt = this.buildCodeAnalysisPrompt(context, cursorPosition);
    
    // Create temporary conversation
    const conversationId = this.conversationManager.createConversation(
      'Code Completion',
      'technical',
      'en'
    );

    try {
      // Get suggestions from multiple providers
      const providers: AIProvider[] = ['copilot', 'openai', 'gemini'];
      
      for (const provider of providers) {
        try {
          const response = await this.conversationManager.sendMessage(
            conversationId,
            analysisPrompt,
            undefined,
            provider
          );

          const providerSuggestions = this.parseCodeSuggestions(response.content, provider);
          suggestions.push(...providerSuggestions);
        } catch (error) {
          console.error(`Code completion failed for ${provider}:`, error);
        }
      }

      // Clean up
      this.conversationManager.deleteConversation(conversationId);

      // Rank and deduplicate suggestions
      return this.rankSuggestions(suggestions, context);
    } catch (error) {
      this.conversationManager.deleteConversation(conversationId);
      throw error;
    }
  }

  private buildCodeAnalysisPrompt(
    context: CodeContext,
    cursorPosition: { line: number; column: number }
  ): string {
    const lines = context.content.split('\n');
    const currentLine = lines[cursorPosition.line] || '';
    const beforeCursor = currentLine.substring(0, cursorPosition.column);
    const afterCursor = currentLine.substring(cursorPosition.column);

    const contextLines = Math.min(5, lines.length);
    const startLine = Math.max(0, cursorPosition.line - contextLines);
    const endLine = Math.min(lines.length, cursorPosition.line + contextLines + 1);
    const surroundingCode = lines.slice(startLine, endLine).join('\n');

    return `
Please provide code completions for the following ${context.language} code context:

File: ${context.filename}
Language: ${context.language}
${context.framework ? `Framework: ${context.framework}` : ''}

Current cursor position: Line ${cursorPosition.line + 1}, Column ${cursorPosition.column + 1}

Code before cursor on current line:
\`\`\`${context.language}
${beforeCursor}
\`\`\`

Code after cursor on current line:
\`\`\`${context.language}
${afterCursor}
\`\`\`

Surrounding code context:
\`\`\`${context.language}
${surroundingCode}
\`\`\`

${context.dependencies ? `Dependencies: ${context.dependencies.join(', ')}` : ''}

${context.errors && context.errors.length > 0 ? `
Current errors:
${context.errors.map(e => `Line ${e.line}: ${e.message}`).join('\n')}
` : ''}

Please provide:
1. Code completions that would be appropriate at the cursor position
2. Any refactoring suggestions for the surrounding code
3. Fixes for any identified errors
4. Documentation suggestions if applicable

Format your response as JSON with the following structure:
{
  "suggestions": [
    {
      "type": "completion|refactor|fix|documentation",
      "title": "Brief title",
      "description": "Detailed description",
      "code": "The actual code",
      "confidence": 0.0-1.0
    }
  ]
}
`;
  }

  private parseCodeSuggestions(response: string, provider: AIProvider): CodeSuggestion[] {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // Fallback: parse as plain text
        return this.parseTextSuggestions(response, provider);
      }

      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
        return parsed.suggestions.map((s: any) => ({
          ...s,
          provider,
          confidence: s.confidence || 0.8
        }));
      }
    } catch (error) {
      console.error('Failed to parse JSON suggestions:', error);
    }

    return this.parseTextSuggestions(response, provider);
  }

  private parseTextSuggestions(response: string, provider: AIProvider): CodeSuggestion[] {
    const suggestions: CodeSuggestion[] = [];
    
    // Extract code blocks
    const codeBlocks = response.match(/```[\s\S]*?```/g) || [];
    
    codeBlocks.forEach((block, index) => {
      const code = block.replace(/```\w*\n?|\n?```/g, '').trim();
      if (code) {
        suggestions.push({
          type: 'completion',
          title: `Code Suggestion ${index + 1}`,
          description: `Generated by ${provider}`,
          code,
          confidence: 0.7,
          provider
        });
      }
    });

    return suggestions;
  }

  private rankSuggestions(
    suggestions: CodeSuggestion[],
    context: CodeContext
  ): CodeSuggestion[] {
    return suggestions
      .sort((a, b) => {
        // Prioritize by confidence
        if (b.confidence !== a.confidence) {
          return b.confidence - a.confidence;
        }
        
        // Prioritize fixes over completions
        const typeWeight = { fix: 4, refactor: 3, completion: 2, documentation: 1 };
        return (typeWeight[b.type] || 0) - (typeWeight[a.type] || 0);
      })
      .slice(0, 10); // Limit to top 10 suggestions
  }

  // Multi-Environment Code Execution
  async executeCode(
    code: string,
    language: string,
    environmentId?: string
  ): Promise<{
    success: boolean;
    output: string;
    errors?: string[];
    warnings?: string[];
    executionTime?: number;
  }> {
    const startTime = Date.now();

    try {
      switch (language.toLowerCase()) {
        case 'javascript':
        case 'typescript':
          return await this.executeJavaScript(code, environmentId);
        
        case 'python':
          return await this.executePython(code);
        
        case 'bash':
        case 'shell':
          return await this.executeShell(code);
        
        default:
          throw new Error(`Execution not supported for language: ${language}`);
      }
    } catch (error) {
      return {
        success: false,
        output: '',
        errors: [error instanceof Error ? error.message : String(error)],
        executionTime: Date.now() - startTime
      };
    }
  }

  private async executeJavaScript(
    code: string,
    environmentId?: string
  ): Promise<{
    success: boolean;
    output: string;
    errors?: string[];
    warnings?: string[];
    executionTime?: number;
  }> {
    const startTime = Date.now();

    try {
      // Create sandboxed execution context
      const originalConsole = console;
      const logs: string[] = [];
      const errors: string[] = [];

      // Mock console to capture output
      const mockConsole = {
        log: (...args: any[]) => logs.push(args.map(String).join(' ')),
        error: (...args: any[]) => errors.push(args.map(String).join(' ')),
        warn: (...args: any[]) => logs.push(`WARNING: ${args.map(String).join(' ')}`),
        info: (...args: any[]) => logs.push(`INFO: ${args.map(String).join(' ')}`)
      };

      // Execute code with mocked console
      const func = new Function('console', code);
      const result = func(mockConsole);

      return {
        success: errors.length === 0,
        output: [...logs, result !== undefined ? String(result) : ''].join('\n'),
        errors: errors.length > 0 ? errors : undefined,
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        errors: [error instanceof Error ? error.message : String(error)],
        executionTime: Date.now() - startTime
      };
    }
  }

  private async executePython(code: string): Promise<{
    success: boolean;
    output: string;
    errors?: string[];
    executionTime?: number;
  }> {
    // This would require a Python execution environment
    // For now, return a placeholder
    return {
      success: false,
      output: '',
      errors: ['Python execution not implemented - would require server-side Python interpreter'],
      executionTime: 0
    };
  }

  private async executeShell(code: string): Promise<{
    success: boolean;
    output: string;
    errors?: string[];
    executionTime?: number;
  }> {
    // Shell execution should be handled server-side for security
    return {
      success: false,
      output: '',
      errors: ['Shell execution not available in browser environment'],
      executionTime: 0
    };
  }

  // Cross-Platform Context Sharing
  async shareContextBetweenEnvironments(
    sourceEnvId: string,
    targetEnvId: string,
    context: Record<string, any>
  ): Promise<boolean> {
    try {
      const sourceEnv = this.environments.get(sourceEnvId);
      const targetEnv = this.environments.get(targetEnvId);

      if (!sourceEnv || !targetEnv) {
        throw new Error('Source or target environment not found');
      }

      // Transform context based on target environment capabilities
      const transformedContext = await this.transformContext(
        context,
        sourceEnv,
        targetEnv
      );

      // Store context for retrieval by target environment
      sessionStorage.setItem(
        `ai_context_${targetEnvId}`,
        JSON.stringify(transformedContext)
      );

      return true;
    } catch (error) {
      console.error('Context sharing failed:', error);
      return false;
    }
  }

  private async transformContext(
    context: Record<string, any>,
    sourceEnv: DevelopmentEnvironment,
    targetEnv: DevelopmentEnvironment
  ): Promise<Record<string, any>> {
    // Transform context based on environment differences
    const transformed = { ...context };

    // Language-specific transformations
    if (sourceEnv.language !== targetEnv.language && targetEnv.language !== 'multi') {
      if (context.code && context.language) {
        // Translate code comments or strings if needed
        const translatedCode = await this.translateCodeComments(
          context.code,
          context.language,
          targetEnv.language
        );
        transformed.code = translatedCode;
      }
    }

    // Framework-specific transformations
    if (sourceEnv.framework !== targetEnv.framework) {
      if (context.dependencies) {
        transformed.dependencies = this.transformDependencies(
          context.dependencies,
          sourceEnv.framework,
          targetEnv.framework
        );
      }
    }

    return transformed;
  }

  private async translateCodeComments(
    code: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string> {
    // Extract comments and translate them
    const commentPatterns: Record<string, RegExp[]> = {
      javascript: [/\/\*[\s\S]*?\*\//g, /\/\/.*$/gm],
      python: [/#.*$/gm, /"""[\s\S]*?"""/g],
      java: [/\/\*[\s\S]*?\*\//g, /\/\/.*$/gm],
      cpp: [/\/\*[\s\S]*?\*\//g, /\/\/.*$/gm]
    };

    const patterns = commentPatterns[sourceLanguage] || [];
    let translatedCode = code;

    for (const pattern of patterns) {
      const matches = code.match(pattern) || [];
      for (const match of matches) {
        try {
          const translation = await this.languageProcessor.smartTranslation(
            match,
            targetLanguage,
            'Code comment translation'
          );
          translatedCode = translatedCode.replace(match, translation.translatedText);
        } catch (error) {
          // Keep original if translation fails
          console.error('Comment translation failed:', error);
        }
      }
    }

    return translatedCode;
  }

  private transformDependencies(
    dependencies: string[],
    sourceFramework?: string,
    targetFramework?: string
  ): string[] {
    // Transform dependencies between frameworks
    const frameworkMappings: Record<string, Record<string, string>> = {
      'react': {
        'vue': {
          'react': 'vue',
          'react-dom': 'vue',
          'react-router-dom': 'vue-router'
        },
        'angular': {
          'react': '@angular/core',
          'react-dom': '@angular/platform-browser',
          'react-router-dom': '@angular/router'
        }
      }
    };

    if (!sourceFramework || !targetFramework) {
      return dependencies;
    }

    const mapping = frameworkMappings[sourceFramework]?.[targetFramework];
    if (!mapping) {
      return dependencies;
    }

    return dependencies.map(dep => mapping[dep] || dep);
  }

  // Get Shared Context
  getSharedContext(environmentId: string): Record<string, any> | null {
    try {
      const stored = sessionStorage.getItem(`ai_context_${environmentId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to retrieve shared context:', error);
      return null;
    }
  }

  // Clear Shared Context
  clearSharedContext(environmentId: string): void {
    sessionStorage.removeItem(`ai_context_${environmentId}`);
  }

  // List Available Environments
  listEnvironments(): DevelopmentEnvironment[] {
    return Array.from(this.environments.values());
  }
}