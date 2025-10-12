/**
 * Codex MCP Bridge Service
 * 
 * Bridges the Python Codex MCP server with our TypeScript/Node.js application
 * Provides seamless integration between Codex CLI and CortexBuild platform
 */

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import type { Database } from 'better-sqlite3';
import { addContext, addMessage, getOrCreateSession, buildEnhancedPrompt } from './mcp.js';

export interface CodexMCPConfig {
  command: string;
  args: string[];
  timeout: number;
  autoRestart: boolean;
}

export interface CodexMessage {
  id: string;
  method: string;
  params?: any;
  result?: any;
  error?: any;
}

export interface CodexSession {
  sessionId: string;
  userId: string;
  codexProcess?: ChildProcess;
  isActive: boolean;
  lastActivity: Date;
}

export class CodexMCPBridge extends EventEmitter {
  private db: Database.Database;
  private sessions: Map<string, CodexSession> = new Map();
  private config: CodexMCPConfig;

  constructor(db: Database.Database, config?: Partial<CodexMCPConfig>) {
    super();
    this.db = db;
    this.config = {
      command: 'npx',
      args: ['-y', 'codex', 'mcp'],
      timeout: 360000, // 6 minutes
      autoRestart: true,
      ...config
    };
  }

  /**
   * Start a new Codex MCP session for a user
   */
  async startCodexSession(userId: string, sessionId?: string): Promise<string> {
    const mcpSessionId = getOrCreateSession(this.db, userId, sessionId);
    
    if (this.sessions.has(mcpSessionId)) {
      const session = this.sessions.get(mcpSessionId)!;
      if (session.isActive) {
        return mcpSessionId;
      }
    }

    try {
      // Spawn Codex MCP process
      const codexProcess = spawn(this.config.command, this.config.args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          CODEX_SESSION_ID: mcpSessionId,
          CODEX_USER_ID: userId
        }
      });

      const session: CodexSession = {
        sessionId: mcpSessionId,
        userId,
        codexProcess,
        isActive: true,
        lastActivity: new Date()
      };

      this.sessions.set(mcpSessionId, session);

      // Setup process event handlers
      this.setupProcessHandlers(session);

      // Add session start context
      addContext(this.db, mcpSessionId, userId, 'codex', {
        action: 'session_started',
        timestamp: new Date().toISOString(),
        config: this.config
      });

      addMessage(this.db, mcpSessionId, 'system', 'Codex MCP session started');

      console.log(`🤖 Codex MCP session started: ${mcpSessionId}`);
      this.emit('sessionStarted', { sessionId: mcpSessionId, userId });

      return mcpSessionId;
    } catch (error) {
      console.error('❌ Failed to start Codex MCP session:', error);
      throw new Error(`Failed to start Codex session: ${error}`);
    }
  }

  /**
   * Send message to Codex MCP server
   */
  async sendToCodex(sessionId: string, message: string, context?: any): Promise<any> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.isActive || !session.codexProcess) {
      throw new Error('Codex session not active');
    }

    try {
      // Build enhanced prompt with MCP context
      const { messages, contexts } = buildEnhancedPrompt(
        this.db,
        sessionId,
        message,
        'You are Codex, an advanced AI coding assistant integrated with CortexBuild platform.'
      );

      // Add user message to MCP
      addMessage(this.db, sessionId, 'user', message);

      // Add context if provided
      if (context) {
        addContext(this.db, sessionId, session.userId, 'code', context);
      }

      // Prepare Codex message
      const codexMessage: CodexMessage = {
        id: `msg_${Date.now()}`,
        method: 'chat',
        params: {
          messages,
          contexts,
          user_id: session.userId,
          session_id: sessionId
        }
      };

      // Send to Codex process
      const response = await this.sendMessageToProcess(session, codexMessage);

      // Add response to MCP
      if (response.result) {
        addMessage(this.db, sessionId, 'assistant', response.result.content || JSON.stringify(response.result));
      }

      session.lastActivity = new Date();
      return response;

    } catch (error) {
      console.error('❌ Error sending to Codex:', error);
      addMessage(this.db, sessionId, 'system', `Error: ${error}`);
      throw error;
    }
  }

  /**
   * Execute code through Codex
   */
  async executeCode(sessionId: string, code: string, language: string = 'typescript'): Promise<any> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.isActive) {
      throw new Error('Codex session not active');
    }

    const codexMessage: CodexMessage = {
      id: `exec_${Date.now()}`,
      method: 'execute',
      params: {
        code,
        language,
        session_id: sessionId,
        user_id: session.userId
      }
    };

    // Add execution context
    addContext(this.db, sessionId, session.userId, 'code', {
      action: 'code_execution',
      language,
      code: code.substring(0, 500), // Truncate for storage
      timestamp: new Date().toISOString()
    });

    addMessage(this.db, sessionId, 'user', `Execute ${language} code: ${code.substring(0, 100)}...`);

    const response = await this.sendMessageToProcess(session, codexMessage);

    if (response.result) {
      addMessage(this.db, sessionId, 'assistant', `Execution result: ${JSON.stringify(response.result)}`);
    }

    return response;
  }

  /**
   * Get code suggestions from Codex
   */
  async getCodeSuggestions(sessionId: string, prompt: string, context?: any): Promise<any> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.isActive) {
      throw new Error('Codex session not active');
    }

    const codexMessage: CodexMessage = {
      id: `suggest_${Date.now()}`,
      method: 'suggest',
      params: {
        prompt,
        context,
        session_id: sessionId,
        user_id: session.userId
      }
    };

    addContext(this.db, sessionId, session.userId, 'code', {
      action: 'code_suggestion',
      prompt,
      context,
      timestamp: new Date().toISOString()
    });

    addMessage(this.db, sessionId, 'user', `Code suggestion request: ${prompt}`);

    const response = await this.sendMessageToProcess(session, codexMessage);

    if (response.result) {
      addMessage(this.db, sessionId, 'assistant', `Code suggestions: ${JSON.stringify(response.result)}`);
    }

    return response;
  }

  /**
   * Stop Codex session
   */
  async stopCodexSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    try {
      if (session.codexProcess && session.isActive) {
        session.codexProcess.kill('SIGTERM');
        
        // Wait for graceful shutdown
        await new Promise((resolve) => {
          const timeout = setTimeout(() => {
            if (session.codexProcess) {
              session.codexProcess.kill('SIGKILL');
            }
            resolve(void 0);
          }, 5000);

          session.codexProcess!.on('exit', () => {
            clearTimeout(timeout);
            resolve(void 0);
          });
        });
      }

      session.isActive = false;
      this.sessions.delete(sessionId);

      addMessage(this.db, sessionId, 'system', 'Codex MCP session ended');

      console.log(`🛑 Codex MCP session stopped: ${sessionId}`);
      this.emit('sessionStopped', { sessionId });

    } catch (error) {
      console.error('❌ Error stopping Codex session:', error);
    }
  }

  /**
   * Get active sessions
   */
  getActiveSessions(): CodexSession[] {
    return Array.from(this.sessions.values()).filter(s => s.isActive);
  }

  /**
   * Cleanup inactive sessions
   */
  async cleanupInactiveSessions(maxIdleTime: number = 30 * 60 * 1000): Promise<void> {
    const now = new Date();
    const sessionsToCleanup: string[] = [];

    for (const [sessionId, session] of this.sessions) {
      if (now.getTime() - session.lastActivity.getTime() > maxIdleTime) {
        sessionsToCleanup.push(sessionId);
      }
    }

    for (const sessionId of sessionsToCleanup) {
      await this.stopCodexSession(sessionId);
    }

    console.log(`🧹 Cleaned up ${sessionsToCleanup.length} inactive Codex sessions`);
  }

  /**
   * Setup process event handlers
   */
  private setupProcessHandlers(session: CodexSession): void {
    if (!session.codexProcess) return;

    session.codexProcess.stdout?.on('data', (data) => {
      const output = data.toString();
      console.log(`📤 Codex stdout [${session.sessionId}]:`, output);
      this.emit('codexOutput', { sessionId: session.sessionId, output, type: 'stdout' });
    });

    session.codexProcess.stderr?.on('data', (data) => {
      const error = data.toString();
      console.error(`📥 Codex stderr [${session.sessionId}]:`, error);
      this.emit('codexOutput', { sessionId: session.sessionId, output: error, type: 'stderr' });
    });

    session.codexProcess.on('exit', (code, signal) => {
      console.log(`🔚 Codex process exited [${session.sessionId}]: code=${code}, signal=${signal}`);
      session.isActive = false;
      
      if (this.config.autoRestart && code !== 0) {
        console.log(`🔄 Auto-restarting Codex session: ${session.sessionId}`);
        setTimeout(() => {
          this.startCodexSession(session.userId, session.sessionId);
        }, 2000);
      }

      this.emit('processExit', { sessionId: session.sessionId, code, signal });
    });

    session.codexProcess.on('error', (error) => {
      console.error(`❌ Codex process error [${session.sessionId}]:`, error);
      session.isActive = false;
      this.emit('processError', { sessionId: session.sessionId, error });
    });
  }

  /**
   * Send message to Codex process and wait for response
   */
  private async sendMessageToProcess(session: CodexSession, message: CodexMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!session.codexProcess || !session.isActive) {
        reject(new Error('Codex process not available'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Codex request timeout'));
      }, this.config.timeout);

      // Setup response handler
      const responseHandler = (data: Buffer) => {
        try {
          const response = JSON.parse(data.toString());
          if (response.id === message.id) {
            clearTimeout(timeout);
            session.codexProcess!.stdout?.off('data', responseHandler);
            resolve(response);
          }
        } catch (error) {
          // Ignore parsing errors, might be partial data
        }
      };

      session.codexProcess.stdout?.on('data', responseHandler);

      // Send message
      const messageStr = JSON.stringify(message) + '\n';
      session.codexProcess.stdin?.write(messageStr);
    });
  }
}

export default CodexMCPBridge;
