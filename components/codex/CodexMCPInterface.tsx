import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Code, 
  Play, 
  Lightbulb, 
  Terminal, 
  Send, 
  Loader, 
  CheckCircle, 
  XCircle,
  Settings,
  Activity,
  Zap
} from 'lucide-react';

interface CodexMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: 'chat' | 'code' | 'suggestion' | 'execution';
}

interface CodexSession {
  sessionId: string;
  isActive: boolean;
  lastActivity: Date;
}

const CodexMCPInterface: React.FC = () => {
  const [session, setSession] = useState<CodexSession | null>(null);
  const [messages, setMessages] = useState<CodexMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'code' | 'suggestions'>('chat');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startSession = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/codex-mcp/session/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSession({
          sessionId: data.sessionId,
          isActive: true,
          lastActivity: new Date()
        });
        
        addMessage('system', 'Codex MCP session started successfully! 🤖');
      } else {
        throw new Error(data.error || 'Failed to start session');
      }
    } catch (error: any) {
      console.error('Error starting session:', error);
      addMessage('system', `Error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const stopSession = async () => {
    if (!session) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/codex-mcp/session/${session.sessionId}/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSession(null);
        addMessage('system', 'Codex MCP session stopped. 👋');
      }
    } catch (error: any) {
      console.error('Error stopping session:', error);
      addMessage('system', `Error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!session || !inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    addMessage('user', userMessage);

    try {
      setIsLoading(true);
      const response = await fetch('/api/codex-mcp/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sessionId: session.sessionId,
          message: userMessage,
          context: {
            platform: 'CortexBuild',
            timestamp: new Date().toISOString()
          }
        })
      });

      const data = await response.json();
      if (data.success && data.response.result) {
        addMessage('assistant', data.response.result.content || JSON.stringify(data.response.result));
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      addMessage('system', `Error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const executeCode = async () => {
    if (!session || !codeInput.trim()) return;

    const code = codeInput.trim();
    addMessage('user', `Execute ${language} code:\n\`\`\`${language}\n${code}\n\`\`\``, 'code');

    try {
      setIsLoading(true);
      const response = await fetch('/api/codex-mcp/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sessionId: session.sessionId,
          code,
          language
        })
      });

      const data = await response.json();
      if (data.success && data.response.result) {
        const result = data.response.result;
        addMessage('assistant', `Execution Result:\n\`\`\`\n${result.output || JSON.stringify(result)}\n\`\`\``, 'execution');
      } else {
        throw new Error(data.error || 'Failed to execute code');
      }
    } catch (error: any) {
      console.error('Error executing code:', error);
      addMessage('system', `Execution Error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestions = async (prompt: string) => {
    if (!session || !prompt.trim()) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/codex-mcp/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sessionId: session.sessionId,
          prompt,
          context: {
            platform: 'CortexBuild',
            language: 'typescript',
            framework: 'React'
          }
        })
      });

      const data = await response.json();
      if (data.success && data.response.result) {
        setSuggestions(data.response.result.suggestions || []);
        addMessage('assistant', `Generated ${data.response.result.suggestions?.length || 0} code suggestions`, 'suggestion');
      } else {
        throw new Error(data.error || 'Failed to get suggestions');
      }
    } catch (error: any) {
      console.error('Error getting suggestions:', error);
      addMessage('system', `Error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const addMessage = (role: 'user' | 'assistant' | 'system', content: string, type?: string) => {
    const message: CodexMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: new Date(),
      type: type as any
    };
    setMessages(prev => [...prev, message]);
  };

  const getMessageIcon = (message: CodexMessage) => {
    if (message.role === 'system') {
      return message.content.includes('Error') ? 
        <XCircle className="w-4 h-4 text-red-500" /> : 
        <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (message.type === 'code' || message.type === 'execution') {
      return <Terminal className="w-4 h-4 text-blue-500" />;
    }
    if (message.type === 'suggestion') {
      return <Lightbulb className="w-4 h-4 text-yellow-500" />;
    }
    return message.role === 'user' ? 
      <div className="w-4 h-4 bg-blue-500 rounded-full" /> : 
      <Bot className="w-4 h-4 text-purple-500" />;
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Codex MCP</h2>
            <p className="text-sm text-gray-500">
              {session ? `Session: ${session.sessionId.slice(-8)}` : 'No active session'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {session ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-green-600">
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium">Active</span>
              </div>
              <button
                onClick={stopSession}
                disabled={isLoading}
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
              >
                Stop
              </button>
            </div>
          ) : (
            <button
              onClick={startSession}
              disabled={isLoading}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              <span>Start Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'chat', label: 'Chat', icon: Bot },
          { id: 'code', label: 'Execute', icon: Play },
          { id: 'suggestions', label: 'Suggest', icon: Lightbulb }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div className="flex-shrink-0 mt-1">
              {getMessageIcon(message)}
            </div>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : message.role === 'system'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {message.content}
              </pre>
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-500">
            <Loader className="w-4 h-4 animate-spin" />
            <span className="text-sm">Processing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {session && (
        <div className="border-t border-gray-200 p-4">
          {activeTab === 'chat' && (
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Ask Codex anything about CortexBuild..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                onClick={sendChatMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex space-x-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="typescript">TypeScript</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                </select>
                <button
                  onClick={executeCode}
                  disabled={isLoading || !codeInput.trim()}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Execute</span>
                </button>
              </div>
              <textarea
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder={`Enter ${language} code to execute...`}
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                disabled={isLoading}
              />
            </div>
          )}

          {activeTab === 'suggestions' && (
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Describe what you want to build..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      getSuggestions((e.target as HTMLInputElement).value);
                    }
                  }}
                  disabled={isLoading}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input[placeholder*="Describe"]') as HTMLInputElement;
                    if (input) getSuggestions(input.value);
                  }}
                  disabled={isLoading}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>Suggest</span>
                </button>
              </div>
              
              {suggestions.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-md">
                      <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        <code>{suggestion.code}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CodexMCPInterface;
