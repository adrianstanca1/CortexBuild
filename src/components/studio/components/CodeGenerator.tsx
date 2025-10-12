/**
 * AI Code Generator Component
 * Provides AI-powered code generation capabilities
 */

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Send,
  Copy,
  Download,
  RefreshCw,
  Settings,
  Code,
  FileText,
  Zap,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Target,
  Lightbulb,
  Database,
  Globe,
  Smartphone,
  Monitor,
  Package,
  Layers,
  GitBranch
} from 'lucide-react';

import { CodeGenerationRequest, CodeGenerationResponse } from '../types/index';
import { studioAPI } from '../services/studioAPI';
import { useToast } from '../../hooks/useToast';

interface CodeGeneratorProps {
  user: any;
  company?: any;
  selectedProject: any;
  onProjectSelect: (project: any) => void;
  onProjectCreate: (project: any) => void;
  projects: any[];
  workspaces: any[];
  refreshData: () => void;
}

type GenerationType = 'component' | 'function' | 'class' | 'api' | 'utility' | 'complete-app';
type ComplexityLevel = 'simple' | 'medium' | 'complex';
type Language = 'typescript' | 'javascript' | 'python' | 'java' | 'csharp' | 'php' | 'go' | 'rust';

interface GenerationTemplate {
  id: string;
  name: string;
  description: string;
  type: GenerationType;
  language: Language;
  complexity: ComplexityLevel;
  prompt: string;
  icon: React.ComponentType<any>;
}

const GENERATION_TEMPLATES: GenerationTemplate[] = [
  {
    id: 'react-component',
    name: 'React Component',
    description: 'Create a reusable React component with TypeScript',
    type: 'component',
    language: 'typescript',
    complexity: 'medium',
    prompt: 'Create a modern React component with TypeScript that',
    icon: Layers
  },
  {
    id: 'api-endpoint',
    name: 'API Endpoint',
    description: 'Generate REST API endpoint with validation',
    type: 'api',
    language: 'typescript',
    complexity: 'medium',
    prompt: 'Create a REST API endpoint for',
    icon: GitBranch
  },
  {
    id: 'utility-function',
    name: 'Utility Function',
    description: 'Create a utility function with proper error handling',
    type: 'function',
    language: 'typescript',
    complexity: 'simple',
    prompt: 'Create a utility function that',
    icon: Code
  },
  {
    id: 'data-model',
    name: 'Data Model',
    description: 'Generate data models with validation schemas',
    type: 'class',
    language: 'typescript',
    complexity: 'medium',
    prompt: 'Create data models for',
    icon: Database
  },
  {
    id: 'web-app',
    name: 'Web Application',
    description: 'Generate a complete web application',
    type: 'complete-app',
    language: 'typescript',
    complexity: 'complex',
    prompt: 'Create a complete web application for',
    icon: Globe
  },
  {
    id: 'mobile-app',
    name: 'Mobile App',
    description: 'Generate React Native mobile application',
    type: 'complete-app',
    language: 'typescript',
    complexity: 'complex',
    prompt: 'Create a React Native mobile app for',
    icon: Smartphone
  }
];

export const CodeGenerator: React.FC<CodeGeneratorProps> = ({
  user,
  selectedProject,
  projects
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<GenerationTemplate | null>(null);
  const [generationType, setGenerationType] = useState<GenerationType>('component');
  const [language, setLanguage] = useState<Language>('typescript');
  const [complexity, setComplexity] = useState<ComplexityLevel>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<CodeGenerationResponse | null>(null);
  const [history, setHistory] = useState<Array<{ prompt: string; response: CodeGenerationResponse; timestamp: string }>>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { showToast } = useToast();

  const handleTemplateSelect = (template: GenerationTemplate) => {
    setSelectedTemplate(template);
    setGenerationType(template.type);
    setLanguage(template.language);
    setComplexity(template.complexity);
    setPrompt(template.prompt);
    textareaRef.current?.focus();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast({
        type: 'error',
        title: 'Prompt required',
        message: 'Please enter a prompt for code generation'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const request: CodeGenerationRequest = {
        prompt: prompt.trim(),
        language,
        type: generationType,
        complexity,
        options: {
          framework: selectedProject ? 'react' : undefined,
          includeTests: true,
          includeDocumentation: true
        }
      };

      const response = await studioAPI.generateCode(request);

      setGeneratedCode(response);

      // Add to history
      setHistory(prev => [{
        prompt,
        response,
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 19)]); // Keep last 20

      showToast({
        type: 'success',
        title: 'Code generated',
        message: `Generated ${response.tokens.total} tokens in ${response.tokens.completion} completion tokens`
      });
    } catch (error: any) {
      console.error('Code generation failed:', error);
      showToast({
        type: 'error',
        title: 'Generation failed',
        message: error.message || 'Failed to generate code'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = async () => {
    if (generatedCode) {
      await navigator.clipboard.writeText(generatedCode.code);
      showToast({
        type: 'success',
        title: 'Code copied',
        message: 'Generated code copied to clipboard'
      });
    }
  };

  const handleDownloadCode = () => {
    if (generatedCode) {
      const blob = new Blob([generatedCode.code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-code-${Date.now()}.${language === 'typescript' ? 'ts' : 'js'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast({
        type: 'success',
        title: 'Code downloaded',
        message: 'Generated code downloaded successfully'
      });
    }
  };

  const handleHistoryItemClick = (item: typeof history[0]) => {
    setPrompt(item.prompt);
    setGeneratedCode(item.response);
  };

  const getComplexityColor = (level: ComplexityLevel) => {
    switch (level) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'complex': return 'bg-red-100 text-red-800';
    }
  };

  const getLanguageIcon = (lang: Language) => {
    switch (lang) {
      case 'typescript': return <Code className="h-4 w-4" />;
      case 'javascript': return <Code className="h-4 w-4" />;
      case 'python': return <Code className="h-4 w-4" />;
      case 'java': return <Code className="h-4 w-4" />;
      case 'csharp': return <Code className="h-4 w-4" />;
      case 'php': return <Code className="h-4 w-4" />;
      case 'go': return <Code className="h-4 w-4" />;
      case 'rust': return <Code className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-full flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Bot className="h-6 w-6 mr-2 text-blue-600" />
                AI Code Generator
              </h2>
              <p className="text-sm text-gray-600">Generate code with artificial intelligence</p>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={generationType}
                onChange={(e) => setGenerationType(e.target.value as GenerationType)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="component">Component</option>
                <option value="function">Function</option>
                <option value="class">Class</option>
                <option value="api">API</option>
                <option value="utility">Utility</option>
                <option value="complete-app">Complete App</option>
              </select>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="typescript">TypeScript</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="csharp">C#</option>
                <option value="php">PHP</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
              </select>

              <select
                value={complexity}
                onChange={(e) => setComplexity(e.target.value as ComplexityLevel)}
                className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${getComplexityColor(complexity)}`}
              >
                <option value="simple">Simple</option>
                <option value="medium">Medium</option>
                <option value="complex">Complex</option>
              </select>
            </div>
          </div>

          {/* Templates */}
          <div className="flex flex-wrap gap-2">
            {GENERATION_TEMPLATES.map(template => {
              const Icon = template.icon;
              return (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`
                    flex items-center px-3 py-2 text-sm rounded-lg border transition-colors
                    ${selectedTemplate?.id === template.id
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {template.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Area */}
        <div className="flex-1 flex">
          <div className="flex-1 p-6">
            <div className="h-full flex flex-col">
              <div className="flex-1 mb-4">
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want to generate... (e.g., 'Create a user authentication component with login and register forms')"
                  className="w-full h-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isGenerating}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Target className="h-4 w-4" />
                    <span>Type: {generationType}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getLanguageIcon(language)}
                    <span>{language}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className={`px-2 py-1 rounded-full text-xs ${getComplexityColor(complexity)}`}>
                      {complexity}
                    </span>
                  </div>
                </div>

                <motion.button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {isGenerating ? 'Generating...' : 'Generate Code'}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Output Area */}
          <div className="w-96 border-l border-gray-200 bg-gray-50">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">Generated Code</h3>
              <p className="text-sm text-gray-600">AI-generated code output</p>
            </div>

            <div className="p-4 h-full overflow-auto">
              {generatedCode ? (
                <div className="space-y-4">
                  {/* Code Stats */}
                  <div className="bg-white rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{generatedCode.tokens.total} tokens</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span>${generatedCode.cost.toFixed(4)}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {generatedCode.provider} • {generatedCode.model}
                    </div>
                  </div>

                  {/* Code Content */}
                  <div className="bg-white rounded-lg border">
                    <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                      <span className="text-sm font-medium">Generated Code</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleCopyCode}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Copy code"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleDownloadCode}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Download code"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <pre className="p-4 text-sm overflow-auto max-h-96 bg-gray-900 text-gray-100 rounded-b-lg">
                      {generatedCode.code}
                    </pre>
                  </div>

                  {/* Explanation */}
                  {generatedCode.explanation && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">Explanation</p>
                          <p className="text-sm text-blue-800 mt-1">{generatedCode.explanation}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Generated code will appear here</p>
                  <p className="text-sm text-gray-500 mt-1">Enter a prompt and click Generate</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* History Sidebar */}
      <div className="w-80 border-l border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Generation History</h3>
          <p className="text-sm text-gray-600">Recent generations</p>
        </div>

        <div className="p-4 space-y-3 max-h-96 overflow-auto">
          {history.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No generation history</p>
          ) : (
            history.map((item, index) => (
              <button
                key={index}
                onClick={() => handleHistoryItemClick(item)}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.prompt.length > 50 ? `${item.prompt.substring(0, 50)}...` : item.prompt}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {item.response.tokens.total} tokens
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};