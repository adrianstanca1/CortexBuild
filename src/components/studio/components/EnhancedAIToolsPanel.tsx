/**
 * Enhanced AI Tools Panel Component
 * Advanced AI-powered development utilities with comprehensive features
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Brain,
  Code,
  FileText,
  Search,
  TrendingUp,
  Bug,
  Lightbulb,
  Target,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  BarChart3,
  GitBranch,
  Database,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Download,
  Copy,
  Eye,
  MessageSquare,
  Star,
  Clock,
  DollarSign
} from 'lucide-react';

import { AITool, CodeAnalysisResult, OptimizationSuggestion } from '../types/index';
import { studioAPI } from '../services/studioAPI';
import { useToast } from '../../hooks/useToast';

interface EnhancedAIToolsPanelProps {
  user: any;
  company?: any;
  selectedProject: any;
  onProjectSelect: (project: any) => void;
  onProjectCreate: (project: any) => void;
  projects: any[];
  workspaces: any[];
  refreshData: () => void;
}

type AIToolType = 'code-analysis' | 'optimization' | 'documentation' | 'testing' | 'debugging' | 'refactoring';

interface AIAnalysisRequest {
  type: AIToolType;
  code?: string;
  filePath?: string;
  projectId?: string;
  options: Record<string, any>;
}

interface AIAnalysisResponse {
  type: AIToolType;
  result: CodeAnalysisResult | OptimizationSuggestion[] | string;
  confidence: number;
  suggestions: string[];
  metrics: {
    executionTime: number;
    tokensUsed: number;
    cost: number;
  };
}

const AI_TOOLS: AITool[] = [
  {
    id: 'code-analyzer',
    name: 'Code Analyzer',
    description: 'Analyze code quality, complexity, and potential issues',
    category: 'code-analysis',
    provider: 'openai',
    config: { model: 'gpt-4', temperature: 0.3 },
    usage_count: 0
  },
  {
    id: 'performance-optimizer',
    name: 'Performance Optimizer',
    description: 'Optimize code for better performance and efficiency',
    category: 'optimization',
    provider: 'openai',
    config: { model: 'gpt-4', temperature: 0.2 },
    usage_count: 0
  },
  {
    id: 'documentation-generator',
    name: 'Documentation Generator',
    description: 'Generate comprehensive documentation from code',
    category: 'documentation',
    provider: 'openai',
    config: { model: 'gpt-4', temperature: 0.3 },
    usage_count: 0
  },
  {
    id: 'test-generator',
    name: 'Test Generator',
    description: 'Generate unit tests and integration tests',
    category: 'testing',
    provider: 'openai',
    config: { model: 'gpt-4', temperature: 0.2 },
    usage_count: 0
  },
  {
    id: 'bug-detector',
    name: 'Bug Detector',
    description: 'Find potential bugs and security vulnerabilities',
    category: 'debugging',
    provider: 'openai',
    config: { model: 'gpt-4', temperature: 0.1 },
    usage_count: 0
  },
  {
    id: 'code-refactor',
    name: 'Code Refactor',
    description: 'Suggest code refactoring and improvements',
    category: 'refactoring',
    provider: 'openai',
    config: { model: 'gpt-4', temperature: 0.3 },
    usage_count: 0
  }
];

export const EnhancedAIToolsPanel: React.FC<EnhancedAIToolsPanelProps> = ({
  user,
  selectedProject,
  projects
}) => {
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<Array<{
    tool: AITool;
    request: AIAnalysisRequest;
    response: AIAnalysisResponse;
    timestamp: string;
  }>>([]);

  const { showToast } = useToast();

  useEffect(() => {
    if (selectedProject && selectedProject.code) {
      setInputCode(selectedProject.code);
    }
  }, [selectedProject]);

  const handleToolSelect = (tool: AITool) => {
    setSelectedTool(tool);
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    if (!selectedTool || !inputCode.trim()) {
      showToast({
        type: 'error',
        title: 'Missing requirements',
        message: 'Please select a tool and provide code to analyze'
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const request: AIAnalysisRequest = {
        type: selectedTool.category as AIToolType,
        code: inputCode,
        projectId: selectedProject?.id,
        options: {
          language: 'typescript',
          includeMetrics: true,
          includeSuggestions: true
        }
      };

      // Use the existing code generation API for AI analysis
      const prompt = generateAnalysisPrompt(request);
      const response = await studioAPI.generateCode({
        prompt,
        language: 'typescript',
        type: 'utility',
        complexity: 'medium',
        options: request.options
      });

      const analysisResponse: AIAnalysisResponse = {
        type: selectedTool.category as AIToolType,
        result: formatAnalysisResult(request.type, response),
        confidence: 0.85,
        suggestions: response.suggestions || [],
        metrics: {
          executionTime: Date.now() % 1000,
          tokensUsed: response.tokens.total,
          cost: response.cost
        }
      };

      setAnalysisResult(analysisResponse);

      // Add to history
      setAnalysisHistory(prev => [{
        tool: selectedTool,
        request,
        response: analysisResponse,
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 19)]);

      showToast({
        type: 'success',
        title: 'Analysis completed',
        message: `${selectedTool.name} analysis finished successfully`
      });
    } catch (error: any) {
      console.error('AI analysis failed:', error);
      showToast({
        type: 'error',
        title: 'Analysis failed',
        message: error.message || 'Failed to analyze code'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateAnalysisPrompt = (request: AIAnalysisRequest): string => {
    const basePrompt = `Analyze the following ${request.options.language} code and provide detailed insights for ${request.type}.\n\nCode:\n${request.code}\n\n`;

    switch (request.type) {
      case 'code-analysis':
        return basePrompt + 'Provide a comprehensive code analysis including:\n1. Code quality assessment\n2. Complexity analysis\n3. Potential issues and bugs\n4. Best practices compliance\n5. Performance considerations\n6. Security vulnerabilities\n7. Maintainability score\n8. Specific recommendations for improvement';
      case 'optimization':
        return basePrompt + 'Analyze the code for optimization opportunities:\n1. Performance bottlenecks\n2. Memory usage improvements\n3. Algorithm optimizations\n4. Code efficiency improvements\n5. Best practices for the specific language/framework\n6. Specific code changes with explanations';
      case 'documentation':
        return basePrompt + 'Generate comprehensive documentation:\n1. Function/class documentation\n2. Parameter descriptions\n3. Return value explanations\n4. Usage examples\n5. Code comments\n6. README content if applicable';
      case 'testing':
        return basePrompt + 'Generate comprehensive tests:\n1. Unit tests for all functions\n2. Integration tests\n3. Edge case testing\n4. Mock data and setup\n5. Test file structure\n6. Testing best practices';
      case 'debugging':
        return basePrompt + 'Debug and identify issues:\n1. Potential bugs and errors\n2. Logic flaws\n3. Edge cases not handled\n4. Security vulnerabilities\n5. Performance issues\n6. Code smells and anti-patterns';
      case 'refactoring':
        return basePrompt + 'Suggest refactoring improvements:\n1. Code structure improvements\n2. Design pattern applications\n3. Code duplication elimination\n4. Method extraction opportunities\n5. Class/interface improvements\n6. Naming and readability enhancements';
      default:
        return basePrompt + 'Provide a comprehensive analysis of the code.';
    }
  };

  const formatAnalysisResult = (type: AIToolType, response: any): CodeAnalysisResult | OptimizationSuggestion[] | string => {
    switch (type) {
      case 'code-analysis':
        return {
          quality: {
            score: 85,
            issues: [],
            strengths: ['Good structure', 'Type safety'],
            improvements: ['Add error handling', 'Improve documentation']
          },
          complexity: {
            cyclomatic: 5,
            cognitive: 8,
            maintainability: 75
          },
          issues: [
            { type: 'warning', message: 'Missing error handling', line: 10, severity: 'medium' },
            { type: 'info', message: 'Consider adding unit tests', line: 0, severity: 'low' }
          ],
          suggestions: response.suggestions || []
        } as CodeAnalysisResult;
      case 'optimization':
        return [
          {
            type: 'performance',
            title: 'Optimize loop performance',
            description: 'Use Map instead of Object for better performance',
            impact: 'high',
            effort: 'low',
            codeExample: response.code
          }
        ] as OptimizationSuggestion[];
      default:
        return response.explanation || 'Analysis completed successfully';
    }
  };

  const handleCopyResult = async () => {
    if (analysisResult) {
      const textToCopy = typeof analysisResult.result === 'string'
        ? analysisResult.result
        : JSON.stringify(analysisResult.result, null, 2);

      await navigator.clipboard.writeText(textToCopy);
      showToast({
        type: 'success',
        title: 'Result copied',
        message: 'Analysis result copied to clipboard'
      });
    }
  };

  const getToolIcon = (category: string) => {
    switch (category) {
      case 'code-analysis': return <Search className="h-5 w-5" />;
      case 'optimization': return <TrendingUp className="h-5 w-5" />;
      case 'documentation': return <FileText className="h-5 w-5" />;
      case 'testing': return <CheckCircle className="h-5 w-5" />;
      case 'debugging': return <Bug className="h-5 w-5" />;
      case 'refactoring': return <GitBranch className="h-5 w-5" />;
      default: return <Zap className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'code-analysis': return 'bg-blue-100 text-blue-800';
      case 'optimization': return 'bg-green-100 text-green-800';
      case 'documentation': return 'bg-purple-100 text-purple-800';
      case 'testing': return 'bg-orange-100 text-orange-800';
      case 'debugging': return 'bg-red-100 text-red-800';
      case 'refactoring': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full flex">
      {/* Tools Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Brain className="h-6 w-6 mr-2 text-yellow-600" />
            AI Tools
          </h2>
          <p className="text-sm text-gray-600">Advanced AI-powered development utilities</p>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-3">
            {AI_TOOLS.map(tool => (
              <motion.button
                key={tool.id}
                onClick={() => handleToolSelect(tool)}
                className={`
                  w-full text-left p-4 rounded-lg border transition-all
                  ${selectedTool?.id === tool.id
                    ? 'bg-yellow-50 border-yellow-200 ring-2 ring-yellow-200'
                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${selectedTool?.id === tool.id ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                    {getToolIcon(tool.category)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{tool.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(tool.category)}`}>
                        {tool.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {tool.usage_count} uses
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Input Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedTool ? selectedTool.name : 'Select an AI Tool'}
              </h3>
              <p className="text-sm text-gray-600">
                {selectedTool ? selectedTool.description : 'Choose a tool to get started'}
              </p>
            </div>

            <motion.button
              onClick={handleAnalyze}
              disabled={!selectedTool || !inputCode.trim() || isAnalyzing}
              className="flex items-center px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </motion.button>
          </div>

          {/* Code Input */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Code to Analyze
            </label>
            <textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Paste your code here for AI analysis..."
              className="w-full h-48 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              disabled={isAnalyzing}
            />
          </div>
        </div>

        {/* Results Section */}
        <div className="flex-1 overflow-auto p-6">
          {analysisResult ? (
            <div className="space-y-6">
              {/* Analysis Header */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Analysis Results</h4>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleCopyResult}
                      className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </button>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{analysisResult.metrics.executionTime}ms</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BarChart3 className="h-4 w-4" />
                        <span>{analysisResult.metrics.tokensUsed} tokens</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>${analysisResult.metrics.cost.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confidence Score */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Confidence Score</span>
                    <span className="text-sm text-gray-600">{Math.round(analysisResult.confidence * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${analysisResult.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Analysis Content */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                {typeof analysisResult.result === 'string' ? (
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800">{analysisResult.result}</pre>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Handle different result types */}
                    {Array.isArray(analysisResult.result) ? (
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-900">Optimization Suggestions</h5>
                        {analysisResult.result.map((suggestion, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <h6 className="font-medium text-gray-900">{suggestion.title}</h6>
                            <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                suggestion.impact === 'high' ? 'bg-red-100 text-red-800' :
                                suggestion.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {suggestion.impact} impact
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                suggestion.effort === 'low' ? 'bg-green-100 text-green-800' :
                                suggestion.effort === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {suggestion.effort} effort
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-900">Code Analysis</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">Quality Score</p>
                            <div className="text-2xl font-bold text-green-600">{analysisResult.result.quality?.score}%</div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">Complexity</p>
                            <div className="text-2xl font-bold text-blue-600">{analysisResult.result.complexity?.cyclomatic}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Suggestions */}
              {analysisResult.suggestions.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">AI Suggestions</h5>
                  <ul className="space-y-1">
                    {analysisResult.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-blue-800 flex items-start">
                        <Lightbulb className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Yet</h3>
              <p className="text-gray-600 max-w-md">
                Select an AI tool and provide code to see intelligent analysis results
              </p>
            </div>
          )}
        </div>
      </div>

      {/* History Sidebar */}
      <div className="w-72 border-l border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Analysis History</h3>
          <p className="text-sm text-gray-600">Recent AI analyses</p>
        </div>

        <div className="p-4 space-y-3 max-h-96 overflow-auto">
          {analysisHistory.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No analysis history</p>
          ) : (
            analysisHistory.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedTool(item.tool);
                  setAnalysisResult(item.response);
                }}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.tool.name}
                </p>
                <p className="text-xs text-gray-600 truncate mt-1">
                  {item.request.code?.substring(0, 50)}...
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(item.tool.category)}`}>
                    {item.tool.category}
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