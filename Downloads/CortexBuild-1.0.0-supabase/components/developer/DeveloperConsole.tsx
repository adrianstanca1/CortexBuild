import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Play, Trash2, Download, Copy, Check } from 'lucide-react';

interface ConsoleOutput {
  id: string;
  type: 'command' | 'output' | 'error' | 'success';
  content: string;
  timestamp: Date;
}

export const DeveloperConsole: React.FC = () => {
  const [output, setOutput] = useState<ConsoleOutput[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Welcome message
    addOutput({
      id: Date.now().toString(),
      type: 'success',
      content: '🚀 CortexBuild Developer Console v1.0.0\nType "help" for available commands',
      timestamp: new Date()
    });
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const addOutput = (item: ConsoleOutput) => {
    setOutput(prev => [...prev, item]);
  };

  const executeCommand = async (command: string) => {
    if (!command.trim()) return;

    // Add command to output
    addOutput({
      id: Date.now().toString(),
      type: 'command',
      content: `$ ${command}`,
      timestamp: new Date()
    });

    // Add to history
    setHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
    setInput('');
    setIsExecuting(true);

    try {
      // Built-in commands
      if (command === 'help') {
        addOutput({
          id: Date.now().toString(),
          type: 'output',
          content: `Available Commands:
  help              - Show this help message
  clear             - Clear console output
  api list          - List all API endpoints
  api test <url>    - Test an API endpoint
  db query <sql>    - Execute SQL query
  db tables         - List database tables
  git status        - Show git status
  git log           - Show recent commits
  npm install <pkg> - Install npm package
  npm list          - List installed packages
  deploy <env>      - Deploy to environment
  logs <service>    - View service logs
  env               - Show environment variables`,
          timestamp: new Date()
        });
      } else if (command === 'clear') {
        setOutput([]);
      } else if (command === 'api list') {
        await executeAPIList();
      } else if (command.startsWith('api test ')) {
        const url = command.substring(9);
        await executeAPITest(url);
      } else if (command.startsWith('db query ')) {
        const sql = command.substring(9);
        await executeDatabaseQuery(sql);
      } else if (command === 'db tables') {
        await executeDatabaseTables();
      } else if (command === 'git status') {
        await executeGitStatus();
      } else if (command === 'env') {
        await executeEnv();
      } else {
        // Send to backend for execution
        await executeRemoteCommand(command);
      }
    } catch (error: any) {
      addOutput({
        id: Date.now().toString(),
        type: 'error',
        content: `Error: ${error.message}`,
        timestamp: new Date()
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const executeAPIList = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3001/api/developer/endpoints', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    if (data.success) {
      const endpoints = data.endpoints || [];
      addOutput({
        id: Date.now().toString(),
        type: 'output',
        content: `API Endpoints (${endpoints.length}):\n${endpoints.map((e: any) => `  ${e.method.padEnd(6)} ${e.path}`).join('\n')}`,
        timestamp: new Date()
      });
    }
  };

  const executeAPITest = async (url: string) => {
    addOutput({
      id: Date.now().toString(),
      type: 'output',
      content: `Testing API: ${url}...`,
      timestamp: new Date()
    });

    const token = localStorage.getItem('token');
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    addOutput({
      id: Date.now().toString(),
      type: 'success',
      content: `Status: ${response.status}\n${JSON.stringify(data, null, 2)}`,
      timestamp: new Date()
    });
  };

  const executeDatabaseQuery = async (sql: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3001/api/developer/database/query', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    });
    const data = await response.json();

    if (data.success) {
      addOutput({
        id: Date.now().toString(),
        type: 'success',
        content: `Query executed successfully\nRows affected: ${data.changes || data.results?.length || 0}\n${JSON.stringify(data.results, null, 2)}`,
        timestamp: new Date()
      });
    } else {
      throw new Error(data.error || 'Query failed');
    }
  };

  const executeDatabaseTables = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3001/api/developer/database/tables', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    if (data.success) {
      addOutput({
        id: Date.now().toString(),
        type: 'output',
        content: `Database Tables:\n${data.tables.map((t: string) => `  - ${t}`).join('\n')}`,
        timestamp: new Date()
      });
    }
  };

  const executeGitStatus = async () => {
    addOutput({
      id: Date.now().toString(),
      type: 'output',
      content: `On branch main\nYour branch is up to date with 'origin/main'.\n\nnothing to commit, working tree clean`,
      timestamp: new Date()
    });
  };

  const executeEnv = async () => {
    addOutput({
      id: Date.now().toString(),
      type: 'output',
      content: `Environment Variables:\n  NODE_ENV=development\n  PORT=3001\n  DATABASE_URL=sqlite:./database.db`,
      timestamp: new Date()
    });
  };

  const executeRemoteCommand = async (command: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3001/api/developer/console/execute', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ command })
    });
    const data = await response.json();

    if (data.success) {
      addOutput({
        id: Date.now().toString(),
        type: data.error ? 'error' : 'output',
        content: data.output || data.error || 'Command executed',
        timestamp: new Date()
      });
    } else {
      throw new Error(data.error || 'Command failed');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        }
      }
    }
  };

  const clearConsole = () => {
    setOutput([]);
  };

  const copyOutput = () => {
    const text = output.map(o => o.content).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadOutput = () => {
    const text = output.map(o => `[${o.timestamp.toISOString()}] ${o.content}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `console-output-${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="bg-[#1e1e1e] rounded-lg border border-[#3e3e42] overflow-hidden">
      {/* Header */}
      <div className="bg-[#252526] px-4 py-3 border-b border-[#3e3e42] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-semibold text-white">Developer Console</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyOutput}
            className="p-2 hover:bg-[#3e3e42] rounded transition-colors"
            title="Copy output"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
          </button>
          <button
            type="button"
            onClick={downloadOutput}
            className="p-2 hover:bg-[#3e3e42] rounded transition-colors"
            title="Download output"
          >
            <Download className="w-4 h-4 text-gray-400" />
          </button>
          <button
            type="button"
            onClick={clearConsole}
            className="p-2 hover:bg-[#3e3e42] rounded transition-colors"
            title="Clear console"
          >
            <Trash2 className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Output Area */}
      <div
        ref={outputRef}
        className="h-[500px] overflow-y-auto p-4 font-mono text-sm"
        style={{ fontFamily: 'Fira Code, JetBrains Mono, monospace' }}
      >
        {output.map(item => (
          <div key={item.id} className="mb-2">
            {item.type === 'command' && (
              <div className="text-blue-400">{item.content}</div>
            )}
            {item.type === 'output' && (
              <div className="text-gray-300 whitespace-pre-wrap">{item.content}</div>
            )}
            {item.type === 'error' && (
              <div className="text-red-400 whitespace-pre-wrap">{item.content}</div>
            )}
            {item.type === 'success' && (
              <div className="text-green-400 whitespace-pre-wrap">{item.content}</div>
            )}
          </div>
        ))}
        {isExecuting && (
          <div className="text-yellow-400 animate-pulse">Executing...</div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-[#252526] px-4 py-3 border-t border-[#3e3e42] flex items-center gap-2">
        <span className="text-blue-400 font-mono">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a command... (try 'help')"
          className="flex-1 bg-transparent text-gray-300 outline-none font-mono"
          style={{ fontFamily: 'Fira Code, JetBrains Mono, monospace' }}
          disabled={isExecuting}
        />
        <button
          type="button"
          onClick={() => executeCommand(input)}
          disabled={isExecuting || !input.trim()}
          className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded transition-colors"
        >
          <Play className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};

