/**
 * Codex Agent Component
 * OpenAI Codex SDK Integration for CortexBuild
 * 
 * Features:
 * - Interactive chat interface
 * - Thread management
 * - Code preview
 * - File changes visualization
 * - Real-time execution
 */

import React, { useState, useEffect, useRef } from 'react';
import { CodexSDK, CodexThread, CodexMessage, CodexResult } from '../lib/integrations/codex-sdk';
import { Send, Code, FileText, CheckCircle, AlertCircle, Loader, Sparkles } from 'lucide-react';

interface CodexAgentProps {
  projectId?: string;
  initialContext?: Record<string, any>;
  onResult?: (result: CodexResult) => void;
}

export const CodexAgent: React.FC<CodexAgentProps> = ({
  projectId,
  initialContext,
  onResult,
}) => {
  const [codex] = useState(() => new CodexSDK());
  const [thread, setThread] = useState<CodexThread | null>(null);
  const [messages, setMessages] = useState<CodexMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<CodexResult | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize thread
  useEffect(() => {
    const initThread = async () => {
      const newThread = await codex.startThread(initialContext);
      setThread(newThread);
    };
    initThread();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle send message
  const handleSend = async () => {
    if (!input.trim() || !thread || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message to UI
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      },
    ]);

    try {
      // Execute command
      const result = await codex.run(thread.id, userMessage);
      setLastResult(result);

      // Add assistant response
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: result.output,
          timestamp: new Date(),
          metadata: {
            code: result.code,
            files: result.files,
            success: result.success,
          },
        },
      ]);

      // Callback
      if (onResult) {
        onResult(result);
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ Error: ${error.message}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick actions
  const quickActions = [
    { label: 'Explore repo', command: 'Explore this repository' },
    { label: 'Propose changes', command: 'Propose improvements' },
    { label: 'Review code', command: 'Review recent changes' },
    { label: 'Run tests', command: 'Run all tests' },
  ];

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Codex Agent
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Powered by GPT-5-Codex
            </p>
          </div>
        </div>
        {thread && (
          <div className="text-xs text-gray-400">
            Thread: {thread.id.slice(0, 12)}...
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
              <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Welcome to Codex Agent
            </h3>
            <p className="mb-6 max-w-md text-sm text-gray-500 dark:text-gray-400">
              I can help you explore code, propose changes, review PRs, and run tests.
              Try one of the quick actions below or type your own command.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => setInput(action.command)}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                }`}
            >
              <div className="whitespace-pre-wrap text-sm">{message.content}</div>

              {/* Code preview */}
              {message.metadata?.code && (
                <div className="mt-3 rounded-md bg-gray-900 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-400">Code</span>
                  </div>
                  <pre className="text-xs text-gray-300 overflow-x-auto">
                    <code>{message.metadata.code}</code>
                  </pre>
                </div>
              )}

              {/* Files preview */}
              {message.metadata?.files && message.metadata.files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.metadata.files.map((file: any, fileIndex: number) => (
                    <div
                      key={fileIndex}
                      className="rounded-md border border-gray-300 dark:border-gray-600 p-3"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {file.path}
                        </span>
                      </div>
                      {file.changes && (
                        <div className="flex gap-4 text-xs">
                          <span className="text-green-600">+{file.changes.added}</span>
                          <span className="text-red-600">-{file.changes.removed}</span>
                          <span className="text-yellow-600">~{file.changes.modified}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-2 text-xs opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin text-purple-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Codex is thinking...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Codex to explore, propose, implement, review, or test..."
            className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={2}
            disabled={isLoading || !thread}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || !thread}
            className="flex h-full items-center justify-center rounded-lg bg-purple-600 px-6 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        {/* Status */}
        {lastResult && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            {lastResult.success ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Success</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-600">Error</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodexAgent;

