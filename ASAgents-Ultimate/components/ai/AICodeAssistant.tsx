import React, { useState, useCallback } from 'react';
import { aiSystem } from '../../services/ai/index';
import type { AIProvider } from '../../services/ai/index';

interface CodeAssistantProps {
    initialCode?: string;
    language?: string;
    filename?: string;
    onCodeChange?: (code: string) => void;
    onSuggestionAccept?: (suggestion: string) => void;
    className?: string;
}

interface CodeSuggestion {
    type: 'completion' | 'refactor' | 'fix' | 'documentation';
    title: string;
    description: string;
    code: string;
    confidence: number;
    provider: AIProvider;
}

export const AICodeAssistant: React.FC<CodeAssistantProps> = ({
    initialCode = '',
    language = 'typescript',
    filename = 'untitled.ts',
    onCodeChange,
    onSuggestionAccept,
    className = ''
}) => {
    const [code, setCode] = useState(initialCode);
    const [suggestions, setSuggestions] = useState<CodeSuggestion[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<string>('');
    const [selectedProvider, setSelectedProvider] = useState<AIProvider>('copilot');
    const [cursorPosition, setCursorPosition] = useState({ line: 0, column: 0 });

    // Handle code changes
    const handleCodeChange = useCallback((newCode: string) => {
        setCode(newCode);
        onCodeChange?.(newCode);
        setSuggestions([]); // Clear suggestions when code changes
    }, [onCodeChange]);

    // Get AI code analysis
    const analyzeCode = useCallback(async () => {
        if (!code.trim()) {
            setAnalysis('No code to analyze');
            return;
        }

        setIsAnalyzing(true);
        try {
            const result = await aiSystem.analyzeCode(code, language, filename);
            setAnalysis(result);
        } catch (error) {
            console.error('Code analysis error:', error);
            setAnalysis('Failed to analyze code. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    }, [code, language, filename]);

    // Get code completions
    const getCompletions = useCallback(async () => {
        if (!code.trim()) return;

        setIsAnalyzing(true);
        try {
            const completions = await aiSystem.developmentTools.getCodeCompletions(
                {
                    language,
                    filename,
                    content: code
                },
                cursorPosition
            );
            setSuggestions(completions);
        } catch (error) {
            console.error('Code completion error:', error);
        } finally {
            setIsAnalyzing(false);
        }
    }, [code, language, filename, cursorPosition]);

    // Accept suggestion
    const acceptSuggestion = useCallback((suggestion: CodeSuggestion) => {
        const updatedCode = code + '\n' + suggestion.code;
        setCode(updatedCode);
        onCodeChange?.(updatedCode);
        onSuggestionAccept?.(suggestion.code);
        setSuggestions(prev => prev.filter(s => s !== suggestion));
    }, [code, onCodeChange, onSuggestionAccept]);

    // Clear suggestions
    const clearSuggestions = useCallback(() => {
        setSuggestions([]);
    }, []);

    // Execute code (for supported languages)
    const executeCode = useCallback(async () => {
        if (!code.trim()) return;

        setIsAnalyzing(true);
        try {
            const result = await aiSystem.developmentTools.executeCode(code, language);

            if (result.success) {
                setAnalysis(`Execution successful:\n${result.output}`);
            } else {
                setAnalysis(`Execution failed:\n${result.errors?.join('\n') || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Code execution error:', error);
            setAnalysis('Failed to execute code. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    }, [code, language]);

    // Get syntax highlighting class
    const getSyntaxClass = (lang: string) => {
        const langMap: Record<string, string> = {
            javascript: 'language-javascript',
            typescript: 'language-typescript',
            python: 'language-python',
            java: 'language-java',
            cpp: 'language-cpp',
            csharp: 'language-csharp',
            php: 'language-php',
            ruby: 'language-ruby',
            go: 'language-go',
            rust: 'language-rust',
            swift: 'language-swift',
            kotlin: 'language-kotlin',
            scala: 'language-scala',
            sql: 'language-sql',
            html: 'language-html',
            css: 'language-css',
            json: 'language-json',
            xml: 'language-xml',
            yaml: 'language-yaml'
        };
        return langMap[lang] || 'language-text';
    };

    // Providers for code assistance
    const codeProviders: { id: AIProvider; name: string; description: string }[] = [
        { id: 'copilot', name: 'Copilot', description: 'Best for code completion' },
        { id: 'openai', name: 'OpenAI', description: 'General code assistance' },
        { id: 'gemini', name: 'Gemini', description: 'Code analysis and explanation' }
    ];

    return (
        <div className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                    <div className="text-lg">👨‍💻</div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            AI Code Assistant
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {filename} ({language})
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <select
                        value={selectedProvider}
                        onChange={(e) => setSelectedProvider(e.target.value as AIProvider)}
                        title="Select AI Provider for Code Assistance"
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                        {codeProviders.map((provider) => (
                            <option key={provider.id} value={provider.id}>
                                {provider.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex h-96">
                {/* Code Editor */}
                <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Code Editor
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={getCompletions}
                                disabled={isAnalyzing || !code.trim()}
                                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Get Suggestions
                            </button>
                            <button
                                onClick={analyzeCode}
                                disabled={isAnalyzing || !code.trim()}
                                className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Analyze
                            </button>
                            {(language === 'javascript' || language === 'typescript') && (
                                <button
                                    onClick={executeCode}
                                    disabled={isAnalyzing || !code.trim()}
                                    className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Run
                                </button>
                            )}
                        </div>
                    </div>

                    <textarea
                        value={code}
                        onChange={(e) => handleCodeChange(e.target.value)}
                        onSelect={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            const lines = target.value.substring(0, target.selectionStart).split('\n');
                            setCursorPosition({
                                line: lines.length - 1,
                                column: lines[lines.length - 1].length
                            });
                        }}
                        placeholder={`Enter your ${language} code here...`}
                        className={`flex-1 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-0 resize-none focus:ring-0 focus:outline-none ${getSyntaxClass(language)}`}
                        spellCheck={false}
                    />
                </div>

                {/* AI Assistance Panel */}
                <div className="w-80 border-l border-gray-200 dark:border-gray-700 flex flex-col">
                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                        <div className="flex-1 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                    Suggestions ({suggestions.length})
                                </h4>
                                <button
                                    onClick={clearSuggestions}
                                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    Clear
                                </button>
                            </div>

                            <div className="overflow-y-auto p-2 space-y-2 max-h-48">
                                {suggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {suggestion.title}
                                                </h5>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {suggestion.description}
                                                </p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${suggestion.type === 'fix' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                            suggestion.type === 'refactor' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                                suggestion.type === 'completion' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                                        }`}>
                                                        {suggestion.type}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {Math.round(suggestion.confidence * 100)}%
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                        {suggestion.provider}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono overflow-x-auto mb-2">
                                            <code>{suggestion.code}</code>
                                        </pre>

                                        <button
                                            onClick={() => acceptSuggestion(suggestion)}
                                            className="w-full px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                        >
                                            Accept Suggestion
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Analysis Results */}
                    {analysis && (
                        <div className="flex-1 border-t border-gray-200 dark:border-gray-700">
                            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                    AI Analysis
                                </h4>
                            </div>
                            <div className="p-4 overflow-y-auto">
                                {isAnalyzing ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            Analyzing code...
                                        </span>
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                                        {analysis}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!suggestions.length && !analysis && (
                        <div className="flex-1 flex items-center justify-center p-4">
                            <div className="text-center">
                                <div className="text-3xl mb-2">🤖</div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                    AI assistance ready
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                    Write code and click "Get Suggestions" or "Analyze"
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};