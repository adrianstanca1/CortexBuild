/**
 * Enhanced Developer Console - Next-Gen Development Environment
 * Features: AI Assistant, Command Palette, Advanced Code Editor, Terminal, Snippets
 * Version: 2.0.0 - Complete Redesign
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    Terminal,
    Play,
    Code,
    Zap,
    Settings,
    Save,
    Trash2,
    Download,
    Upload,
    LogOut,
    Moon,
    Sun,
    Command,
    Sparkles,
    MessageSquare,
    FileCode,
    Layers,
    Search,
    Copy,
    Check,
    AlertCircle,
    CheckCircle,
    XCircle,
    Cpu,
    Database,
    Globe,
    Package,
    Folder,
    GitBranch,
    BarChart3,
    Shield,
    Users,
    Share2,
    CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';
import FileExplorer from '../../developer/FileExplorer';
import GitPanel from '../../developer/GitPanel';
import DatabaseViewer from '../../developer/DatabaseViewer';
import APITester from '../../developer/APITester';
import Marketplace from '../../apps/Marketplace';
import AppContainer, { MiniApp } from '../../apps/AppContainer';
import { APP_REGISTRY, installApp as installAppInRegistry } from '../../apps/appRegistry';

// Advanced Development Platform Components
import AdvancedCodeEditor from '../../development/AdvancedCodeEditor';
import GitIntegration from '../../development/GitIntegration';
import APIBuilder from '../../development/APIBuilder';
import TestingFramework from '../../development/TestingFramework';
import AnalyticsDashboard from '../../development/AnalyticsDashboard';

// User Management Components
import UserRolesPermissions from '../../user-management/UserRolesPermissions';
import TeamCollaboration from '../../user-management/TeamCollaboration';
import AppSharingReviews from '../../user-management/AppSharingReviews';
import BillingPayments from '../../user-management/BillingPayments';

interface ConsoleLog {
    id: string;
    type: 'log' | 'error' | 'warn' | 'info' | 'success';
    message: string;
    timestamp: Date;
}

interface AIMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface CodeSnippet {
    id: string;
    title: string;
    description: string;
    code: string;
    language: string;
    category: string;
}

interface EnhancedDeveloperConsoleProps {
    onLogout?: () => void;
    navigateTo?: (screen: string, params?: any) => void;
}

let logIdCounter = 0;
let messageIdCounter = 0;

const PREDEFINED_SNIPPETS: CodeSnippet[] = [
    {
        id: '1',
        title: 'Fetch API Example',
        description: 'Basic fetch request with error handling',
        language: 'javascript',
        category: 'API',
        code: `async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network error');
    const data = await response.json();
    console.log('Data:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}`
    },
    {
        id: '2',
        title: 'React Component',
        description: 'Functional component with hooks',
        language: 'javascript',
        category: 'React',
        code: `import React, { useState, useEffect } from 'react';

function MyComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Fetch data on mount
    fetchData();
  }, []);
  
  return (
    <div>
      <h1>My Component</h1>
      {data && <p>{data}</p>}
    </div>
  );
}`
    },
    {
        id: '3',
        title: 'Array Methods',
        description: 'Common array operations',
        language: 'javascript',
        category: 'Utilities',
        code: `const numbers = [1, 2, 3, 4, 5];

// Map
const doubled = numbers.map(n => n * 2);

// Filter
const evens = numbers.filter(n => n % 2 === 0);

// Reduce
const sum = numbers.reduce((acc, n) => acc + n, 0);

// Find
const found = numbers.find(n => n > 3);

console.log({ doubled, evens, sum, found });`
    },
    {
        id: '4',
        title: 'Promise Chain',
        description: 'Async operations with promises',
        language: 'javascript',
        category: 'Async',
        code: `function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

delay(1000)
  .then(() => {
    console.log('After 1 second');
    return delay(1000);
  })
  .then(() => {
    console.log('After 2 seconds');
  })
  .catch(error => {
    console.error('Error:', error);
  });`
    },
    {
        id: '5',
        title: 'Local Storage Helper',
        description: 'Save and load from localStorage',
        language: 'javascript',
        category: 'Utilities',
        code: `const storage = {
  save: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  load: (key) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  remove: (key) => {
    localStorage.removeItem(key);
  },
  clear: () => {
    localStorage.clear();
  }
};

// Usage
storage.save('user', { name: 'John', age: 30 });
const user = storage.load('user');
console.log(user);`
    }
];

const EnhancedDeveloperConsole: React.FC<EnhancedDeveloperConsoleProps> = ({ onLogout, navigateTo }) => {
    // State
    const [activeTab, setActiveTab] = useState<'console' | 'ai' | 'snippets' | 'terminal' | 'files' | 'git' | 'database' | 'api' | 'apps' | 'code-editor' | 'git-integration' | 'api-builder' | 'testing' | 'analytics' | 'user-roles' | 'teams' | 'app-sharing' | 'billing'>('console');
    const [apps, setApps] = useState<MiniApp[]>(APP_REGISTRY);
    const [runningApp, setRunningApp] = useState<MiniApp | null>(null);
    const [code, setCode] = useState<string>('// Write your code here\nconsole.log("Hello, Developer!");');
    const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
    const [isExecuting, setIsExecuting] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
    const [aiInput, setAiInput] = useState('');
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet | null>(null);
    const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
    const [terminalInput, setTerminalInput] = useState('');

    const consoleEndRef = useRef<HTMLDivElement>(null);
    const aiEndRef = useRef<HTMLDivElement>(null);
    const terminalEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [consoleLogs]);

    useEffect(() => {
        aiEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [aiMessages]);

    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [terminalOutput]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd+K or Ctrl+K for command palette
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setShowCommandPalette(true);
            }
            // Escape to close command palette
            if (e.key === 'Escape') {
                setShowCommandPalette(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Add log
    const addLog = (type: ConsoleLog['type'], message: string) => {
        logIdCounter++;
        const newLog: ConsoleLog = {
            id: `${Date.now()}-${logIdCounter}`,
            type,
            message,
            timestamp: new Date()
        };
        setConsoleLogs(prev => [...prev, newLog]);
    };

    // Clear console
    const clearConsole = () => {
        setConsoleLogs([]);
        toast.success('Console cleared');
    };

    // Execute code
    const executeCode = async () => {
        setIsExecuting(true);
        addLog('info', '> Executing code...');

        try {
            const sandbox = {
                console: {
                    log: (...args: any[]) => addLog('log', args.join(' ')),
                    error: (...args: any[]) => addLog('error', args.join(' ')),
                    warn: (...args: any[]) => addLog('warn', args.join(' ')),
                    info: (...args: any[]) => addLog('info', args.join(' '))
                },
                JSON, Math, Date, Array, Object, String, Number, Boolean
            };

            const func = new Function(...Object.keys(sandbox), code);
            const result = func(...Object.values(sandbox));

            if (result !== undefined) {
                addLog('success', `Result: ${JSON.stringify(result)}`);
            }
            addLog('success', '✓ Execution completed');
        } catch (error: any) {
            addLog('error', `Error: ${error.message}`);
        } finally {
            setIsExecuting(false);
        }
    };

    // Save code
    const saveCode = () => {
        localStorage.setItem('dev_console_code', code);
        toast.success('Code saved!');
    };

    // Load code
    const loadCode = () => {
        const saved = localStorage.getItem('dev_console_code');
        if (saved) {
            setCode(saved);
            toast.success('Code loaded!');
        } else {
            toast.error('No saved code found');
        }
    };

    // Download code
    const downloadCode = () => {
        const blob = new Blob([code], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'code.js';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Code downloaded!');
    };

    // AI Assistant - Send message
    const sendAIMessage = async () => {
        if (!aiInput.trim()) return;

        const userMessage: AIMessage = {
            id: `msg-${Date.now()}-${messageIdCounter++}`,
            role: 'user',
            content: aiInput,
            timestamp: new Date()
        };

        setAiMessages(prev => [...prev, userMessage]);
        setAiInput('');
        setIsAiThinking(true);

        // Simulate AI response (în producție, aici ar fi un API call real)
        setTimeout(() => {
            const assistantMessage: AIMessage = {
                id: `msg-${Date.now()}-${messageIdCounter++}`,
                role: 'assistant',
                content: generateAIResponse(userMessage.content),
                timestamp: new Date()
            };
            setAiMessages(prev => [...prev, assistantMessage]);
            setIsAiThinking(false);
        }, 1000);
    };

    // Generate AI response (mock - în producție ar fi API call)
    const generateAIResponse = (userInput: string): string => {
        const input = userInput.toLowerCase();

        if (input.includes('help') || input.includes('what can you do')) {
            return `I'm your AI coding assistant! I can help you with:
• Generate code snippets
• Explain code concepts
• Debug errors
• Suggest improvements
• Answer programming questions
• Run code examples

Try asking me to "generate a fetch example" or "explain async/await"!`;
        }

        if (input.includes('generate') && input.includes('fetch')) {
            const fetchCode = PREDEFINED_SNIPPETS.find(s => s.title.includes('Fetch'));
            return `Here's a fetch API example:\n\n\`\`\`javascript\n${fetchCode?.code}\n\`\`\`\n\nThis code shows how to make an HTTP request with proper error handling.`;
        }

        if (input.includes('async') || input.includes('await')) {
            return `Async/await is a modern way to handle asynchronous operations in JavaScript:

• \`async\` keyword makes a function return a Promise
• \`await\` pauses execution until Promise resolves
• Makes async code look synchronous
• Better error handling with try/catch

Example:
\`\`\`javascript
async function getData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}
\`\`\``;
        }

        if (input.includes('error') || input.includes('debug')) {
            return `To debug your code:
1. Check the console for error messages
2. Use console.log() to inspect values
3. Verify variable types and values
4. Check for typos in variable/function names
5. Ensure all required libraries are imported

Would you like me to help debug specific code?`;
        }

        return `I understand you're asking about "${userInput}". I can help with:
• Code generation
• Debugging
• Explanations
• Best practices

Could you be more specific about what you need?`;
    };

    // Apply snippet to editor
    const applySnippet = (snippet: CodeSnippet) => {
        setCode(snippet.code);
        setSelectedSnippet(snippet);
        setActiveTab('console');
        toast.success(`Applied: ${snippet.title}`);
    };

    // Terminal command execution
    const executeTerminalCommand = () => {
        if (!terminalInput.trim()) return;

        setTerminalOutput(prev => [...prev, `$ ${terminalInput}`]);

        // Simulate command execution
        const cmd = terminalInput.toLowerCase().trim();

        if (cmd === 'help') {
            setTerminalOutput(prev => [...prev, 'Available commands: help, clear, date, echo, ls, pwd']);
        } else if (cmd === 'clear') {
            setTerminalOutput([]);
        } else if (cmd === 'date') {
            setTerminalOutput(prev => [...prev, new Date().toString()]);
        } else if (cmd.startsWith('echo ')) {
            setTerminalOutput(prev => [...prev, cmd.substring(5)]);
        } else if (cmd === 'ls') {
            setTerminalOutput(prev => [...prev, 'code.js  snippets/  terminal/  ai-assistant/']);
        } else if (cmd === 'pwd') {
            setTerminalOutput(prev => [...prev, '/developer-console']);
        } else {
            setTerminalOutput(prev => [...prev, `Command not found: ${cmd}`]);
        }

        setTerminalInput('');
    };

    // Get log icon
    const getLogIcon = (type: ConsoleLog['type']) => {
        switch (type) {
            case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
            case 'warn': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'info': return <AlertCircle className="h-4 w-4 text-blue-500" />;
            default: return <Terminal className="h-4 w-4 text-gray-500" />;
        }
    };

    // Get log color
    const getLogColor = (type: ConsoleLog['type']) => {
        switch (type) {
            case 'error': return 'text-red-600';
            case 'warn': return 'text-yellow-600';
            case 'success': return 'text-green-600';
            case 'info': return 'text-blue-600';
            default: return 'text-gray-700';
        }
    };

    const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
    const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
    const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    const inputClass = isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300';

    return (
        <div className={`min-h-screen ${bgClass} ${textClass} transition-colors duration-300`}>
            {/* Modern Animated Header */}
            <div className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-2xl overflow-hidden">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Terminal className="h-8 w-8" />
                            <div>
                                <h1 className="text-3xl font-bold">Developer Console Pro</h1>
                                <p className="text-purple-100 text-sm mt-1">AI-Powered Development Environment</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setShowCommandPalette(true)}
                                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                title="Command Palette (Cmd+K)"
                            >
                                <Command className="h-4 w-4" />
                                <span className="text-sm">Cmd+K</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                title="Toggle Theme"
                            >
                                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>
                            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                                Developer Mode
                            </span>
                            {navigateTo && (
                                <button
                                    type="button"
                                    onClick={() => navigateTo('sdk-developer')}
                                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-colors border border-yellow-500/30"
                                    title="Open SDK Workspace with Zapier Builder"
                                >
                                    <Zap className="h-4 w-4" />
                                    <span className="text-sm font-medium">SDK Workspace</span>
                                </button>
                            )}
                            {onLogout && (
                                <button
                                    type="button"
                                    onClick={onLogout}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="text-sm font-medium">Logout</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modern Tabs with Gradient */}
            <div className={`${cardClass} border-b backdrop-blur-sm`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('console')}
                            className={`relative px-6 py-3 font-semibold text-sm transition-all duration-300 rounded-t-lg ${activeTab === 'console'
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg transform scale-105'
                                : isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Code className={`h-4 w-4 ${activeTab === 'console' ? 'animate-pulse' : ''}`} />
                                Code Editor
                            </div>
                            {activeTab === 'console' && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full"></div>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('ai')}
                            className={`relative px-6 py-3 font-semibold text-sm transition-all duration-300 rounded-t-lg ${activeTab === 'ai'
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg transform scale-105'
                                : isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Sparkles className={`h-4 w-4 ${activeTab === 'ai' ? 'animate-pulse' : ''}`} />
                                AI Assistant
                            </div>
                            {activeTab === 'ai' && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('snippets')}
                            className={`relative px-6 py-3 font-semibold text-sm transition-all duration-300 rounded-t-lg ${activeTab === 'snippets'
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg transform scale-105'
                                : isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <FileCode className={`h-4 w-4 ${activeTab === 'snippets' ? 'animate-pulse' : ''}`} />
                                Code Snippets
                            </div>
                            {activeTab === 'snippets' && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"></div>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('terminal')}
                            className={`relative px-6 py-3 font-semibold text-sm transition-all duration-300 rounded-t-lg ${activeTab === 'terminal'
                                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg transform scale-105'
                                : isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Terminal className={`h-4 w-4 ${activeTab === 'terminal' ? 'animate-pulse' : ''}`} />
                                Terminal
                            </div>
                            {activeTab === 'terminal' && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-orange-500 rounded-full"></div>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('files')}
                            className={`relative px-6 py-3 font-semibold text-sm transition-all duration-300 rounded-t-lg ${activeTab === 'files'
                                ? 'bg-gradient-to-r from-yellow-600 to-amber-600 text-white shadow-lg transform scale-105'
                                : isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Folder className={`h-4 w-4 ${activeTab === 'files' ? 'animate-pulse' : ''}`} />
                                Files
                            </div>
                            {activeTab === 'files' && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"></div>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('git')}
                            className={`relative px-6 py-3 font-semibold text-sm transition-all duration-300 rounded-t-lg ${activeTab === 'git'
                                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg transform scale-105'
                                : isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <GitBranch className={`h-4 w-4 ${activeTab === 'git' ? 'animate-pulse' : ''}`} />
                                Git
                            </div>
                            {activeTab === 'git' && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full"></div>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('database')}
                            className={`relative px-6 py-3 font-semibold text-sm transition-all duration-300 rounded-t-lg ${activeTab === 'database'
                                ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg transform scale-105'
                                : isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Database className={`h-4 w-4 ${activeTab === 'database' ? 'animate-pulse' : ''}`} />
                                Database
                            </div>
                            {activeTab === 'database' && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-teal-500 rounded-full"></div>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('api')}
                            className={`relative px-6 py-3 font-semibold text-sm transition-all duration-300 rounded-t-lg ${activeTab === 'api'
                                ? 'bg-gradient-to-r from-lime-600 to-green-600 text-white shadow-lg transform scale-105'
                                : isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Globe className={`h-4 w-4 ${activeTab === 'api' ? 'animate-pulse' : ''}`} />
                                API Tester
                            </div>
                            {activeTab === 'api' && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-lime-500 rounded-full"></div>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('apps')}
                            className={`relative px-6 py-3 font-semibold text-sm transition-all duration-300 rounded-t-lg ${activeTab === 'apps'
                                ? 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-lg transform scale-105'
                                : isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Package className={`h-4 w-4 ${activeTab === 'apps' ? 'animate-pulse' : ''}`} />
                                Apps
                            </div>
                            {activeTab === 'apps' && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 to-fuchsia-500 rounded-full"></div>
                            )}
                        </button>
                    </div>

                    {/* Advanced Development Platform Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        <div className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'} text-xs font-semibold`}>
                            ADVANCED PLATFORM
                        </div>
                        <button
                            type="button"
                            onClick={() => setActiveTab('code-editor')}
                            className={`relative px-6 py-3 font-semibold text-sm transition-all duration-300 rounded-t-lg ${activeTab === 'code-editor'
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg transform scale-105'
                                : isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <FileCode className={`h-4 w-4 ${activeTab === 'code-editor' ? 'animate-pulse' : ''}`} />
                                Monaco Editor
                            </div>
                            {activeTab === 'code-editor' && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"></div>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('git-integration')}
                            className={`relative px-6 py-3 font-semibold text-sm transition-all duration-300 rounded-t-lg ${activeTab === 'git-integration'
                                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg transform scale-105'
                                : isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <GitBranch className={`h-4 w-4 ${activeTab === 'git-integration' ? 'animate-pulse' : ''}`} />
                                Git Integration
                            </div>
                            {activeTab === 'git-integration' && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-orange-500 rounded-full"></div>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('api-builder')}
                            className={`relative px-6 py-3 font-semibold text-sm transition-all duration-300 rounded-t-lg ${activeTab === 'api-builder'
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg transform scale-105'
                                : isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Globe className={`h-4 w-4 ${activeTab === 'api-builder' ? 'animate-pulse' : ''}`} />
                                API Builder
                            </div>
                            {activeTab === 'api-builder' && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('testing')}
                            className={`relative px-6 py-3 font-semibold text-sm transition-all duration-300 rounded-t-lg ${activeTab === 'testing'
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg transform scale-105'
                                : isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <CheckCircle className={`h-4 w-4 ${activeTab === 'testing' ? 'animate-pulse' : ''}`} />
                                Testing
                            </div>
                            {activeTab === 'testing' && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"></div>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('analytics')}
                            className={`relative px-6 py-3 font-semibold text-sm transition-all duration-300 rounded-t-lg ${activeTab === 'analytics'
                                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg transform scale-105'
                                : isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <BarChart3 className={`h-4 w-4 ${activeTab === 'analytics' ? 'animate-pulse' : ''}`} />
                                Analytics
                            </div>
                            {activeTab === 'analytics' && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full"></div>
                            )}
                        </button>
                    </div>

                    {/* User Management Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        <div className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'} text-xs font-semibold`}>
                            USER MANAGEMENT
                        </div>
                        <button
                            type="button"
                            onClick={() => setActiveTab('user-roles')}
                            className={`relative px-6 py-3 font-semibold text-sm transition-all duration-300 rounded-t-lg ${activeTab === 'user-roles'
                                ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg transform scale-105'
                                : isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Shield className={`h-4 w-4 ${activeTab === 'user-roles' ? 'animate-pulse' : ''}`} />
                                User Roles
                            </div>
                            {activeTab === 'user-roles' && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 to-red-500 rounded-full"></div>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('teams')}
                            className={`relative px-6 py-3 font-semibold text-sm transition-all duration-300 rounded-t-lg ${activeTab === 'teams'
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg transform scale-105'
                                : isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Users className={`h-4 w-4 ${activeTab === 'teams' ? 'animate-pulse' : ''}`} />
                                Teams
                            </div>
                            {activeTab === 'teams' && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('app-sharing')}
                            className={`relative px-6 py-3 font-semibold text-sm transition-all duration-300 rounded-t-lg ${activeTab === 'app-sharing'
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg transform scale-105'
                                : isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Share2 className={`h-4 w-4 ${activeTab === 'app-sharing' ? 'animate-pulse' : ''}`} />
                                App Sharing
                            </div>
                            {activeTab === 'app-sharing' && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"></div>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('billing')}
                            className={`relative px-6 py-3 font-semibold text-sm transition-all duration-300 rounded-t-lg ${activeTab === 'billing'
                                ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg transform scale-105'
                                : isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <CreditCard className={`h-4 w-4 ${activeTab === 'billing' ? 'animate-pulse' : ''}`} />
                                Billing
                            </div>
                            {activeTab === 'billing' && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full"></div>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Code Editor Tab */}
                {activeTab === 'console' && (
                    <div className="grid grid-cols-2 gap-6">
                        {/* Code Editor */}
                        <div className={`${cardClass} border rounded-lg overflow-hidden`}>
                            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                                <h2 className={`font-semibold ${textClass}`}>Code Editor</h2>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={saveCode}
                                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                                        title="Save (Cmd+S)"
                                    >
                                        <Save className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={loadCode}
                                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                                        title="Load"
                                    >
                                        <Upload className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={downloadCode}
                                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                                        title="Download"
                                    >
                                        <Download className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className={`w-full h-96 p-4 font-mono text-sm ${isDarkMode ? 'bg-gray-900 text-green-400' : 'bg-gray-50 text-gray-900'} focus:outline-none resize-none`}
                                placeholder="// Write your JavaScript code here..."
                                spellCheck={false}
                            />
                            <div className="p-4 border-t border-gray-700 flex gap-2">
                                <button
                                    onClick={executeCode}
                                    disabled={isExecuting}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <Play className="h-4 w-4" />
                                    {isExecuting ? 'Running...' : 'Run Code'}
                                </button>
                                <button
                                    onClick={clearConsole}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Clear Console
                                </button>
                            </div>
                        </div>

                        {/* Console Output */}
                        <div className={`${cardClass} border rounded-lg overflow-hidden`}>
                            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                                <h2 className={`font-semibold ${textClass}`}>Console Output</h2>
                                <Terminal className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className={`h-96 overflow-y-auto p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                                {consoleLogs.length === 0 ? (
                                    <div className="text-gray-500 text-center py-8">
                                        Console is empty. Run some code to see output.
                                    </div>
                                ) : (
                                    <div className="space-y-1 font-mono text-sm">
                                        {consoleLogs.map((log) => (
                                            <div key={log.id} className="flex items-start gap-2 py-1">
                                                {getLogIcon(log.type)}
                                                <span className={`flex-1 ${getLogColor(log.type)}`}>
                                                    {log.message}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {log.timestamp.toLocaleTimeString()}
                                                </span>
                                            </div>
                                        ))}
                                        <div ref={consoleEndRef} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* AI Assistant Tab */}
                {activeTab === 'ai' && (
                    <div className={`${cardClass} border rounded-lg overflow-hidden`}>
                        <div className="flex items-center justify-between p-4 border-b border-gray-700">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-purple-500" />
                                <h2 className={`font-semibold ${textClass}`}>AI Coding Assistant</h2>
                            </div>
                            <span className="text-xs text-gray-500">Powered by AI</span>
                        </div>

                        {/* Chat Messages */}
                        <div className={`h-96 overflow-y-auto p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                            {aiMessages.length === 0 ? (
                                <div className="text-center py-12">
                                    <Sparkles className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                                    <h3 className={`text-lg font-semibold ${textClass} mb-2`}>AI Assistant Ready</h3>
                                    <p className="text-gray-500 mb-4">Ask me anything about coding!</p>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p>Try: "Help me with async/await"</p>
                                        <p>Or: "Generate a fetch example"</p>
                                        <p>Or: "Explain promises"</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {aiMessages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user'
                                                    ? 'bg-purple-600 text-white'
                                                    : isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900 border'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    {msg.role === 'assistant' && <Sparkles className="h-4 w-4 text-purple-500" />}
                                                    <span className="text-xs font-semibold">
                                                        {msg.role === 'user' ? 'You' : 'AI Assistant'}
                                                    </span>
                                                </div>
                                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                <span className="text-xs opacity-70 mt-1 block">
                                                    {msg.timestamp.toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {isAiThinking && (
                                        <div className="flex justify-start">
                                            <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white border'}`}>
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />
                                                    <span className="text-sm text-gray-500">AI is thinking...</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={aiEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-gray-700">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={aiInput}
                                    onChange={(e) => setAiInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendAIMessage()}
                                    placeholder="Ask AI anything about coding..."
                                    className={`flex-1 px-4 py-2 ${inputClass} border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                />
                                <button
                                    onClick={sendAIMessage}
                                    disabled={!aiInput.trim() || isAiThinking}
                                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Code Snippets Tab */}
                {activeTab === 'snippets' && (
                    <div className="grid grid-cols-3 gap-4">
                        {PREDEFINED_SNIPPETS.map((snippet) => (
                            <div
                                key={snippet.id}
                                className={`${cardClass} border rounded-lg p-4 hover:border-purple-500 transition-colors cursor-pointer`}
                                onClick={() => applySnippet(snippet)}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <FileCode className="h-5 w-5 text-purple-500" />
                                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                        {snippet.category}
                                    </span>
                                </div>
                                <h3 className={`font-semibold ${textClass} mb-1`}>{snippet.title}</h3>
                                <p className="text-sm text-gray-500 mb-3">{snippet.description}</p>
                                <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded p-2 font-mono text-xs overflow-hidden`}>
                                    <code className="text-green-600 line-clamp-3">{snippet.code}</code>
                                </div>
                                <button className="mt-3 w-full px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors">
                                    Apply to Editor
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Terminal Tab */}
                {activeTab === 'terminal' && (
                    <div className={`${cardClass} border rounded-lg overflow-hidden`}>
                        <div className="flex items-center justify-between p-4 border-b border-gray-700">
                            <div className="flex items-center gap-2">
                                <Terminal className="h-5 w-5 text-green-500" />
                                <h2 className={`font-semibold ${textClass}`}>Terminal Emulator</h2>
                            </div>
                            <span className="text-xs text-gray-500">Type 'help' for commands</span>
                        </div>

                        {/* Terminal Output */}
                        <div className={`h-96 overflow-y-auto p-4 font-mono text-sm ${isDarkMode ? 'bg-gray-900 text-green-400' : 'bg-gray-50 text-gray-900'}`}>
                            <div className="mb-2 text-gray-500">
                                Developer Console Terminal v1.0.0
                            </div>
                            <div className="mb-2 text-gray-500">
                                Type 'help' to see available commands
                            </div>
                            <div className="mb-4 text-gray-500">
                                ─────────────────────────────────────
                            </div>
                            {terminalOutput.map((line, index) => (
                                <div key={index} className="mb-1">
                                    {line}
                                </div>
                            ))}
                            <div ref={terminalEndRef} />
                        </div>

                        {/* Terminal Input */}
                        <div className="p-4 border-t border-gray-700">
                            <div className="flex items-center gap-2">
                                <span className="text-green-500 font-mono">$</span>
                                <input
                                    type="text"
                                    value={terminalInput}
                                    onChange={(e) => setTerminalInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && executeTerminalCommand()}
                                    placeholder="Enter command..."
                                    className={`flex-1 px-3 py-2 ${isDarkMode ? 'bg-gray-900 text-green-400' : 'bg-gray-50 text-gray-900'} font-mono text-sm border-none focus:outline-none`}
                                    autoFocus
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* File Explorer Tab */}
                {activeTab === 'files' && (
                    <div className="h-[600px]">
                        <FileExplorer isDarkMode={isDarkMode} />
                    </div>
                )}

                {/* Git Panel Tab */}
                {activeTab === 'git' && (
                    <div className="h-[600px]">
                        <GitPanel isDarkMode={isDarkMode} />
                    </div>
                )}

                {/* Database Viewer Tab */}
                {activeTab === 'database' && (
                    <div className="h-[600px]">
                        <DatabaseViewer isDarkMode={isDarkMode} />
                    </div>
                )}

                {/* API Tester Tab */}
                {activeTab === 'api' && (
                    <div className="h-[600px]">
                        <APITester isDarkMode={isDarkMode} />
                    </div>
                )}

                {/* Apps Marketplace Tab */}
                {activeTab === 'apps' && (
                    <div className="h-[600px]">
                        <Marketplace
                            apps={apps}
                            onInstall={(appId) => {
                                installAppInRegistry(appId);
                                setApps([...APP_REGISTRY]);
                            }}
                            onLaunch={(appId) => {
                                const app = apps.find(a => a.id === appId);
                                if (app) {
                                    setRunningApp(app);
                                }
                            }}
                            isDarkMode={isDarkMode}
                        />
                    </div>
                )}

                {/* Advanced Code Editor Tab */}
                {activeTab === 'code-editor' && (
                    <div className="h-[700px]">
                        <AdvancedCodeEditor isDarkMode={isDarkMode} />
                    </div>
                )}

                {/* Git Integration Tab */}
                {activeTab === 'git-integration' && (
                    <div className="h-[700px]">
                        <GitIntegration isDarkMode={isDarkMode} />
                    </div>
                )}

                {/* API Builder Tab */}
                {activeTab === 'api-builder' && (
                    <div className="h-[700px]">
                        <APIBuilder isDarkMode={isDarkMode} />
                    </div>
                )}

                {/* Testing Framework Tab */}
                {activeTab === 'testing' && (
                    <div className="h-[700px]">
                        <TestingFramework isDarkMode={isDarkMode} />
                    </div>
                )}

                {/* Analytics Dashboard Tab */}
                {activeTab === 'analytics' && (
                    <div className="h-[700px]">
                        <AnalyticsDashboard isDarkMode={isDarkMode} />
                    </div>
                )}

                {/* User Roles & Permissions Tab */}
                {activeTab === 'user-roles' && (
                    <div className="h-[700px]">
                        <UserRolesPermissions isDarkMode={isDarkMode} />
                    </div>
                )}

                {/* Team Collaboration Tab */}
                {activeTab === 'teams' && (
                    <div className="h-[700px]">
                        <TeamCollaboration isDarkMode={isDarkMode} />
                    </div>
                )}

                {/* App Sharing & Reviews Tab */}
                {activeTab === 'app-sharing' && (
                    <div className="h-[700px]">
                        <AppSharingReviews isDarkMode={isDarkMode} />
                    </div>
                )}

                {/* Billing & Payments Tab */}
                {activeTab === 'billing' && (
                    <div className="h-[700px]">
                        <BillingPayments isDarkMode={isDarkMode} />
                    </div>
                )}

                {/* Running App Container */}
                {runningApp && (
                    <AppContainer
                        app={runningApp}
                        onClose={() => setRunningApp(null)}
                        isDarkMode={isDarkMode}
                    />
                )}

                {/* Command Palette Modal */}
                {showCommandPalette && (
                    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50">
                        <div className={`${cardClass} border rounded-lg w-full max-w-2xl mx-4 overflow-hidden shadow-2xl`}>
                            <div className="p-4 border-b border-gray-700">
                                <div className="flex items-center gap-2">
                                    <Search className="h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Type a command or search..."
                                        className={`flex-1 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} border-none focus:outline-none`}
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="p-2 max-h-96 overflow-y-auto">
                                <div className="space-y-1">
                                    <button
                                        onClick={() => { setActiveTab('console'); setShowCommandPalette(false); }}
                                        className={`w-full text-left px-4 py-2 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Code className="h-4 w-4 text-purple-500" />
                                            <div>
                                                <div className={textClass}>Go to Code Editor</div>
                                                <div className="text-xs text-gray-500">Write and execute code</div>
                                            </div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => { setActiveTab('ai'); setShowCommandPalette(false); }}
                                        className={`w-full text-left px-4 py-2 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Sparkles className="h-4 w-4 text-purple-500" />
                                            <div>
                                                <div className={textClass}>Open AI Assistant</div>
                                                <div className="text-xs text-gray-500">Get coding help from AI</div>
                                            </div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => { setActiveTab('snippets'); setShowCommandPalette(false); }}
                                        className={`w-full text-left px-4 py-2 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileCode className="h-4 w-4 text-purple-500" />
                                            <div>
                                                <div className={textClass}>Browse Code Snippets</div>
                                                <div className="text-xs text-gray-500">Ready-to-use code templates</div>
                                            </div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => { setActiveTab('terminal'); setShowCommandPalette(false); }}
                                        className={`w-full text-left px-4 py-2 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Terminal className="h-4 w-4 text-green-500" />
                                            <div>
                                                <div className={textClass}>Open Terminal</div>
                                                <div className="text-xs text-gray-500">Execute terminal commands</div>
                                            </div>
                                        </div>
                                    </button>
                                    <div className="border-t border-gray-700 my-2"></div>
                                    <button
                                        onClick={() => { executeCode(); setShowCommandPalette(false); }}
                                        className={`w-full text-left px-4 py-2 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Play className="h-4 w-4 text-green-500" />
                                            <div>
                                                <div className={textClass}>Run Code</div>
                                                <div className="text-xs text-gray-500">Execute current code</div>
                                            </div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => { clearConsole(); setShowCommandPalette(false); }}
                                        className={`w-full text-left px-4 py-2 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                            <div>
                                                <div className={textClass}>Clear Console</div>
                                                <div className="text-xs text-gray-500">Remove all console output</div>
                                            </div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => { setIsDarkMode(!isDarkMode); setShowCommandPalette(false); }}
                                        className={`w-full text-left px-4 py-2 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {isDarkMode ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4 text-blue-500" />}
                                            <div>
                                                <div className={textClass}>Toggle Theme</div>
                                                <div className="text-xs text-gray-500">Switch between dark and light mode</div>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EnhancedDeveloperConsole;
