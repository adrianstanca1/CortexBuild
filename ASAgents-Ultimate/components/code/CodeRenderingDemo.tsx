import React, { useState } from 'react';
import { CodeRenderer, EnhancedMediaRenderer } from './CodeRenderer';
import { Card } from '../ui/Card';
import { FileText, Code, Settings, Play } from 'lucide-react';

// Sample code files for demonstration
const sampleFiles = [
    {
        id: 'js-sample',
        name: 'example.js',
        url: 'data:text/javascript,',
        type: 'application/javascript',
        size: 1024,
        mimeType: 'application/javascript',
        content: `// Sample JavaScript Code with AI Enhancement Capabilities
function calculateProjectCost(materials, labor, overhead = 0.15) {
  // Calculate base costs
  const baseCost = materials.reduce((total, material) => {
    return total + (material.quantity * material.unitPrice);
  }, 0);
  
  const laborCost = labor.hours * labor.hourlyRate;
  const overheadCost = (baseCost + laborCost) * overhead;
  
  return {
    materials: baseCost,
    labor: laborCost,
    overhead: overheadCost,
    total: baseCost + laborCost + overheadCost
  };
}

// Example usage with construction data
const materials = [
  { name: 'Concrete', quantity: 50, unitPrice: 45.00 },
  { name: 'Steel Rebar', quantity: 100, unitPrice: 12.50 },
  { name: 'Lumber 2x4', quantity: 200, unitPrice: 8.75 }
];

const labor = {
  hours: 120,
  hourlyRate: 35.00
};

const projectCost = calculateProjectCost(materials, labor);
console.log('Project Cost Breakdown:', projectCost);

// TODO: Add validation for negative values
// TODO: Consider bulk pricing discounts
`,
        language: 'javascript'
    },
    {
        id: 'py-sample',
        name: 'ai_assistant.py',
        url: 'data:text/python,',
        type: 'text/x-python',
        size: 2048,
        mimeType: 'text/x-python',
        content: `"""
AI-Enhanced Construction Management Assistant
Integrates with the ASAgents platform for intelligent project analysis
"""

import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any

class ConstructionAIAssistant:
    """AI assistant for construction project management and analysis"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key
        self.supported_languages = [
            'javascript', 'typescript', 'python', 'java', 'cpp', 
            'csharp', 'go', 'rust', 'php', 'ruby'
        ]
    
    def analyze_project_code(self, code: str, language: str) -> Dict[str, Any]:
        """
        Analyze construction project code for potential improvements
        """
        if language not in self.supported_languages:
            return {'error': f'Language {language} not supported'}
        
        # Mock analysis - in real implementation, would use AI API
        analysis = {
            'quality_score': 0.85,
            'complexity': 'medium',
            'suggestions': [
                'Consider adding input validation',
                'Add error handling for network requests',
                'Implement logging for debugging'
            ],
            'security_issues': [],
            'performance_tips': [
                'Use list comprehensions for better performance',
                'Consider caching expensive calculations'
            ]
        }
        
        return analysis
    
    def generate_documentation(self, code: str, language: str) -> str:
        """Generate documentation for construction project code"""
        
        doc_template = f'''
# Code Documentation
**Language:** {language}
**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Overview
This code appears to be part of a construction management system.

## Key Functions
- Data processing and calculation
- Project cost estimation
- Material quantity tracking

## Recommendations
- Add comprehensive error handling
- Implement unit tests
- Consider performance optimization for large datasets

## Integration Points
- Compatible with ASAgents platform
- Supports multi-language processing
- AI-enhanced analysis capabilities
        '''
        
        return doc_template.strip()
    
    def suggest_improvements(self, code: str) -> List[str]:
        """Suggest code improvements based on construction industry best practices"""
        
        suggestions = []
        
        # Simple pattern matching for demonstration
        if 'console.log' in code:
            suggestions.append('Replace console.log with proper logging framework')
        
        if 'var ' in code:
            suggestions.append('Use let/const instead of var for better scoping')
        
        if not 'try' in code and not 'catch' in code:
            suggestions.append('Add error handling with try-catch blocks')
        
        if len(code.splitlines()) > 100:
            suggestions.append('Consider breaking large functions into smaller modules')
        
        # Construction-specific suggestions
        if 'cost' in code.lower() or 'price' in code.lower():
            suggestions.append('Add currency validation and formatting')
        
        if 'material' in code.lower():
            suggestions.append('Implement material waste calculation')
        
        return suggestions

# Example usage
if __name__ == "__main__":
    assistant = ConstructionAIAssistant()
    
    sample_code = '''
    function calculateMaterials(project) {
        return project.areas * project.coverage;
    }
    '''
    
    analysis = assistant.analyze_project_code(sample_code, 'javascript')
    print("Code Analysis:", json.dumps(analysis, indent=2))
    
    improvements = assistant.suggest_improvements(sample_code)
    print("\\nSuggested Improvements:")
    for i, suggestion in enumerate(improvements, 1):
        print(f"{i}. {suggestion}")
`,
        language: 'python'
    },
    {
        id: 'ts-sample',
        name: 'types.ts',
        url: 'data:text/typescript,',
        type: 'application/typescript',
        size: 1536,
        mimeType: 'application/typescript',
        content: `// ASAgents Platform - Enhanced Type Definitions with AI Integration
// Supports multimodal, multilingual AI capabilities

export interface AIProvider {
  id: string;
  name: string;
  capabilities: AICapability[];
  supportedLanguages: string[];
  maxTokens: number;
  costPerToken?: number;
}

export interface AICapability {
  type: 'text' | 'image' | 'audio' | 'video' | 'code' | 'translation';
  description: string;
  enabled: boolean;
}

export interface CodeAnalysisRequest {
  code: string;
  language: string;
  filename?: string;
  context?: string;
  analysisType: 'quality' | 'security' | 'performance' | 'suggestions';
}

export interface CodeAnalysisResponse {
  quality: {
    score: number; // 0-100
    issues: CodeIssue[];
    suggestions: string[];
  };
  security: {
    vulnerabilities: SecurityIssue[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  performance: {
    optimizations: string[];
    complexity: number;
    estimatedRuntime: string;
  };
  documentation: {
    missing: string[];
    suggestions: string[];
    generatedDocs?: string;
  };
}

export interface CodeIssue {
  id: string;
  line: number;
  column?: number;
  type: 'error' | 'warning' | 'info' | 'suggestion';
  message: string;
  severity: 'high' | 'medium' | 'low';
  fixSuggestion?: string;
  category: 'syntax' | 'logic' | 'style' | 'performance' | 'security';
}

export interface SecurityIssue {
  id: string;
  type: string;
  description: string;
  line?: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cwe?: string; // Common Weakness Enumeration
  fix: string;
}

export interface MultilingualContent {
  original: string;
  language: string;
  translations: Record<string, string>;
  confidence: number;
  context?: string;
}

export interface AugmentedWritingFeatures {
  grammarCheck: boolean;
  styleImprovement: boolean;
  clarityEnhancement: boolean;
  technicalWriting: boolean;
  codeDocumentation: boolean;
  translationAssist: boolean;
}

export interface ConstructionProject {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  budget: number;
  materials: Material[];
  tasks: Task[];
  aiInsights?: AIInsight[];
}

export interface AIInsight {
  id: string;
  type: 'cost-optimization' | 'schedule-improvement' | 'risk-assessment' | 'quality-check';
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  actionItems: string[];
  generatedAt: Date;
}

// Enhanced types for code rendering and processing
export interface CodeRenderingOptions {
  syntaxHighlighting: boolean;
  lineNumbers: boolean;
  wordWrap: boolean;
  theme: 'light' | 'dark' | 'auto';
  fontSize: number;
  showMinimap: boolean;
  enableCodeExecution: boolean;
  enableAIAssistance: boolean;
  supportedLanguages: string[];
}

export interface LanguageProcessor {
  detect: (text: string) => Promise<string>;
  analyze: (code: string, language: string) => Promise<CodeAnalysisResponse>;
  suggest: (code: string, context?: string) => Promise<string[]>;
  format: (code: string, language: string) => Promise<string>;
  translate: (code: string, fromLang: string, toLang: string) => Promise<string>;
}

// Export utility types
export type SupportedLanguage = 
  | 'javascript' | 'typescript' | 'python' | 'java' | 'cpp' | 'csharp'
  | 'go' | 'rust' | 'php' | 'ruby' | 'swift' | 'kotlin' | 'scala'
  | 'sql' | 'html' | 'css' | 'scss' | 'json' | 'xml' | 'yaml'
  | 'markdown' | 'bash' | 'powershell' | 'dockerfile';

export type AIOperationType = 
  | 'code-analysis' | 'code-generation' | 'documentation' | 'translation'
  | 'optimization' | 'debugging' | 'testing' | 'refactoring';
`,
        language: 'typescript'
    }
];

export const CodeRenderingDemo: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState(sampleFiles[0]);
    const [showAI, setShowAI] = useState(true);
    const [enableExecution, setEnableExecution] = useState(true);
    const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    🚀 Code Rendering Adapter & Modulator
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Advanced code rendering with AI integration, multimodal support, and writing assistance
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                        <Code className="h-4 w-4" />
                        <span>20+ Languages</span>
                    </span>
                    <span className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>AI Assistant</span>
                    </span>
                    <span className="flex items-center space-x-1">
                        <Play className="h-4 w-4" />
                        <span>Code Execution</span>
                    </span>
                    <span className="flex items-center space-x-1">
                        <Settings className="h-4 w-4" />
                        <span>Customizable</span>
                    </span>
                </div>
            </div>

            {/* Controls */}
            <Card className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div>
                            <label htmlFor="file-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Sample File:
                            </label>
                            <select
                                id="file-select"
                                value={selectedFile.id}
                                onChange={(e) => {
                                    const file = sampleFiles.find(f => f.id === e.target.value);
                                    if (file) setSelectedFile(file);
                                }}
                                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                {sampleFiles.map(file => (
                                    <option key={file.id} value={file.id}>
                                        {file.name} ({file.language})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="theme-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Theme:
                            </label>
                            <select
                                id="theme-select"
                                value={theme}
                                onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'auto')}
                                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="auto">Auto</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={showAI}
                                onChange={(e) => setShowAI(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">AI Assistant</span>
                        </label>

                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={enableExecution}
                                onChange={(e) => setEnableExecution(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Code Execution</span>
                        </label>
                    </div>
                </div>
            </Card>

            {/* Code Renderer Demo */}
            <Card className="overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Enhanced Code Renderer with AI Integration
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Features: Syntax highlighting, line numbers, AI analysis, code execution, and writing assistance
                    </p>
                </div>

                <CodeRenderer
                    file={selectedFile}
                    enableAIAssistance={showAI}
                    enableCodeExecution={enableExecution}
                    showLineNumbers={true}
                    enableSyntaxHighlighting={true}
                    theme={theme}
                    maxHeight={600}
                    onCodeChange={(code) => {
                        console.log('Code changed:', code.length, 'characters');
                    }}
                    onLanguageDetected={(lang) => {
                        console.log('Language detected:', lang);
                    }}
                    onError={(error) => {
                        console.error('Code renderer error:', error);
                    }}
                />
            </Card>

            {/* Enhanced Media Renderer Demo */}
            <Card className="overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Enhanced Media Renderer (Auto-detects Code Files)
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Automatically uses CodeRenderer for code files, MediaRenderer for other file types
                    </p>
                </div>

                <EnhancedMediaRenderer
                    file={selectedFile}
                    enableAIAssistance={showAI}
                    enableCodeExecution={enableExecution}
                    theme={theme}
                    maxHeight={400}
                />
            </Card>

            {/* Features Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        🎨 Advanced Rendering
                    </h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• 20+ programming languages</li>
                        <li>• Syntax highlighting</li>
                        <li>• Line numbers & minimap</li>
                        <li>• Theme support (light/dark)</li>
                        <li>• Responsive design</li>
                    </ul>
                </Card>

                <Card className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        🤖 AI Integration
                    </h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Real-time code analysis</li>
                        <li>• Quality assessment</li>
                        <li>• AI-powered suggestions</li>
                        <li>• Language detection</li>
                        <li>• Writing assistance</li>
                    </ul>
                </Card>

                <Card className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        ⚡ Interactive Features
                    </h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Code execution</li>
                        <li>• Copy to clipboard</li>
                        <li>• File download</li>
                        <li>• Error highlighting</li>
                        <li>• Live editing</li>
                    </ul>
                </Card>
            </div>
        </div>
    );
};

export default CodeRenderingDemo;