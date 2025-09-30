import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    Code,
    Copy,
    Play,
    Download,
    Terminal,
    Sparkles,
    Brain
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { MediaFile, MediaRenderer } from '../media/MediaRenderer';
import { AICodeAssistant } from '../ai/AICodeAssistant';
import './CodeRenderer.css';

interface CodeFile extends MediaFile {
    content?: string;
    language?: string;
    encoding?: string;
    syntaxHighlighting?: boolean;
}

interface CodeRendererProps {
    file: CodeFile;
    className?: string;
    maxWidth?: number;
    maxHeight?: number;
    showLineNumbers?: boolean;
    enableSyntaxHighlighting?: boolean;
    enableCodeExecution?: boolean;
    enableAIAssistance?: boolean;
    readOnly?: boolean;
    theme?: 'light' | 'dark' | 'auto';
    onCodeChange?: (content: string) => void;
    onLanguageDetected?: (language: string) => void;
    onError?: (error: Error) => void;
}

interface CodeAnalysis {
    issues: CodeIssue[];
    suggestions: string[];
    complexity: number;
    quality: number;
}

interface CodeIssue {
    id: string;
    line: number;
    column?: number;
    type: 'error' | 'warning' | 'info';
    message: string;
    severity: 'high' | 'medium' | 'low';
}

export const CodeRenderer: React.FC<CodeRendererProps> = ({
    file,
    className = '',
    maxHeight = 800,
    showLineNumbers = true,
    enableSyntaxHighlighting = true,
    enableCodeExecution = false,
    enableAIAssistance = true,
    readOnly = false,
    theme = 'auto',
    onCodeChange,
    onLanguageDetected,
    onError,
}) => {
    const [content, setContent] = useState<string>(file.content || '');
    const [detectedLanguage, setDetectedLanguage] = useState<string>(file.language || '');
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState<CodeAnalysis | null>(null);
    const [executionResult, setExecutionResult] = useState<string>('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [showAIAssistant, setShowAIAssistant] = useState(false);
    const [lineCount, setLineCount] = useState(1);
    const [selectedText, setSelectedText] = useState('');

    const codeRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Language detection and syntax highlighting
    const supportedLanguages = {
        javascript: { name: 'JavaScript', color: '#f7df1e', extensions: ['.js', '.mjs'] },
        typescript: { name: 'TypeScript', color: '#3178c6', extensions: ['.ts', '.tsx'] },
        python: { name: 'Python', color: '#3776ab', extensions: ['.py', '.pyw'] },
        java: { name: 'Java', color: '#ed8b00', extensions: ['.java'] },
        csharp: { name: 'C#', color: '#239120', extensions: ['.cs'] },
        cpp: { name: 'C++', color: '#00599c', extensions: ['.cpp', '.cc', '.cxx'] },
        c: { name: 'C', color: '#a8b9cc', extensions: ['.c'] },
        php: { name: 'PHP', color: '#777bb4', extensions: ['.php'] },
        ruby: { name: 'Ruby', color: '#cc342d', extensions: ['.rb'] },
        go: { name: 'Go', color: '#00add8', extensions: ['.go'] },
        rust: { name: 'Rust', color: '#dea584', extensions: ['.rs'] },
        swift: { name: 'Swift', color: '#fa7343', extensions: ['.swift'] },
        kotlin: { name: 'Kotlin', color: '#7f52ff', extensions: ['.kt', '.kts'] },
        scala: { name: 'Scala', color: '#dc322f', extensions: ['.scala'] },
        sql: { name: 'SQL', color: '#4479a1', extensions: ['.sql'] },
        html: { name: 'HTML', color: '#e34c26', extensions: ['.html', '.htm'] },
        css: { name: 'CSS', color: '#1572b6', extensions: ['.css'] },
        scss: { name: 'SCSS', color: '#cf649a', extensions: ['.scss'] },
        json: { name: 'JSON', color: '#292929', extensions: ['.json'] },
        xml: { name: 'XML', color: '#0060ac', extensions: ['.xml'] },
        yaml: { name: 'YAML', color: '#cb171e', extensions: ['.yml', '.yaml'] },
        markdown: { name: 'Markdown', color: '#083fa1', extensions: ['.md', '.markdown'] },
        bash: { name: 'Bash', color: '#4eaa25', extensions: ['.sh', '.bash'] },
        powershell: { name: 'PowerShell', color: '#5391fe', extensions: ['.ps1'] },
        dockerfile: { name: 'Dockerfile', color: '#2496ed', extensions: ['Dockerfile'] },
    };

    // Detect language from file extension
    const detectLanguage = useCallback(async () => {
        if (detectedLanguage) return detectedLanguage;

        setIsLoading(true);
        try {
            // Extension-based detection
            const extension = file.name.split('.').pop()?.toLowerCase();
            const langByExtension = Object.entries(supportedLanguages).find(([, config]) =>
                config.extensions.some(ext => ext.includes(extension || ''))
            );

            if (langByExtension) {
                const language = langByExtension[0];
                setDetectedLanguage(language);
                onLanguageDetected?.(language);
                return language;
            }

            // Simple heuristic detection for common patterns
            const lowerContent = content.toLowerCase();
            let detectedLang = 'text';

            if (lowerContent.includes('function ') || lowerContent.includes('const ') || lowerContent.includes('let ')) {
                detectedLang = 'javascript';
            } else if (lowerContent.includes('def ') || lowerContent.includes('import ')) {
                detectedLang = 'python';
            } else if (lowerContent.includes('public class') || lowerContent.includes('private ')) {
                detectedLang = 'java';
            } else if (lowerContent.includes('<html') || lowerContent.includes('<!doctype')) {
                detectedLang = 'html';
            } else if (lowerContent.includes('SELECT ') || lowerContent.includes('FROM ')) {
                detectedLang = 'sql';
            }

            setDetectedLanguage(detectedLang);
            onLanguageDetected?.(detectedLang);
            return detectedLang;
        } catch (error) {
            console.error('Language detection failed:', error);
            onError?.(error as Error);
            return 'text';
        } finally {
            setIsLoading(false);
        }
    }, [file.name, content, detectedLanguage, onLanguageDetected, onError]);

    // Load file content
    const loadContent = useCallback(async () => {
        if (file.content) {
            setContent(file.content);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(file.url);
            const text = await response.text();
            setContent(text);
            setLineCount(text.split('\n').length);
        } catch (error) {
            console.error('Failed to load file content:', error);
            onError?.(error as Error);
        } finally {
            setIsLoading(false);
        }
    }, [file.content, file.url, onError]);

    // Mock code analysis for demonstration
    const analyzeCode = useCallback(async () => {
        if (!enableAIAssistance || !content.trim() || !detectedLanguage) return;

        setIsLoading(true);
        try {
            // Mock analysis - in real implementation, this would call your AI service
            const mockIssues: CodeIssue[] = [];
            const mockSuggestions: string[] = [];

            // Simple pattern matching for common issues
            const lines = content.split('\n');
            lines.forEach((line, index) => {
                if (line.includes('console.log') && detectedLanguage === 'javascript') {
                    mockIssues.push({
                        id: `issue-${index}`,
                        line: index + 1,
                        type: 'warning',
                        message: 'Consider removing console.log in production',
                        severity: 'low'
                    });
                }

                if (line.length > 120) {
                    mockIssues.push({
                        id: `long-line-${index}`,
                        line: index + 1,
                        type: 'info',
                        message: 'Line is too long',
                        severity: 'low'
                    });
                }
            });

            if (detectedLanguage === 'javascript' && !content.includes('use strict')) {
                mockSuggestions.push('Consider using "use strict" mode');
            }

            if (content.includes('var ') && detectedLanguage === 'javascript') {
                mockSuggestions.push('Consider using "let" or "const" instead of "var"');
            }

            setAnalysis({
                issues: mockIssues,
                suggestions: mockSuggestions,
                complexity: Math.min(content.length / 1000, 1),
                quality: Math.max(0.5, 1 - (mockIssues.length * 0.1))
            });
        } catch (error) {
            console.error('Code analysis failed:', error);
            onError?.(error as Error);
        } finally {
            setIsLoading(false);
        }
    }, [content, detectedLanguage, enableAIAssistance, onError]);

    // Mock code execution
    const executeCode = useCallback(async () => {
        if (!enableCodeExecution || !content.trim()) return;

        const executableLanguages = ['javascript', 'python', 'bash'];
        if (!executableLanguages.includes(detectedLanguage)) {
            setExecutionResult('Code execution not supported for this language');
            return;
        }

        setIsExecuting(true);
        setExecutionResult('');

        try {
            // Mock execution - in real implementation, this would call your backend
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (detectedLanguage === 'javascript' && content.includes('console.log')) {
                const matches = content.match(/console\.log\(['"`](.*?)['"`]\)/g);
                if (matches) {
                    const outputs = matches.map(match => {
                        const text = match.match(/['"`](.*?)['"`]/)?.[1] || '';
                        return text;
                    });
                    setExecutionResult(outputs.join('\n'));
                } else {
                    setExecutionResult('Code executed successfully');
                }
            } else {
                setExecutionResult('Code executed successfully (mock result)');
            }
        } catch (error) {
            console.error('Code execution failed:', error);
            setExecutionResult(`Execution error: ${error}`);
        } finally {
            setIsExecuting(false);
        }
    }, [content, detectedLanguage, enableCodeExecution]);

    // Handle content changes
    const handleContentChange = useCallback((newContent: string) => {
        setContent(newContent);
        setLineCount(newContent.split('\n').length);
        onCodeChange?.(newContent);
    }, [onCodeChange]);

    // Copy to clipboard
    const copyToClipboard = useCallback(async () => {
        const textToCopy = selectedText || content;
        try {
            await navigator.clipboard.writeText(textToCopy);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    }, [content, selectedText]);

    // Download file
    const downloadFile = useCallback(() => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [content, file.name]);

    // Get syntax highlighting class
    const getSyntaxClass = useCallback((language: string) => {
        if (!enableSyntaxHighlighting) return '';
        return `language-${language}`;
    }, [enableSyntaxHighlighting]);

    // Get quality badge class
    const getQualityBadgeClass = useCallback((quality: number) => {
        if (quality > 0.8) return 'status-badge quality-high';
        if (quality > 0.6) return 'status-badge quality-medium';
        return 'status-badge quality-low';
    }, []);

    // Get issue badge class
    const getIssueBadgeClass = useCallback((issue: CodeIssue) => {
        const baseClass = 'issue-badge';
        if (issue.type === 'error') return `${baseClass} error`;
        if (issue.type === 'warning') return `${baseClass} warning`;
        return `${baseClass} info`;
    }, []);

    // Initialize
    useEffect(() => {
        loadContent();
    }, [loadContent]);

    useEffect(() => {
        if (content) {
            detectLanguage();
        }
    }, [content, detectLanguage]);

    // Auto-analyze code when content or language changes
    useEffect(() => {
        const timer = setTimeout(analyzeCode, 1000);
        return () => clearTimeout(timer);
    }, [analyzeCode]);

    if (isLoading && !content) {
        return (
            <Card className={className}>
                <div className="flex items-center justify-center p-8">
                    <div className="loading-spinner"></div>
                    <span className="ml-3">Loading code...</span>
                </div>
            </Card>
        );
    }

    const languageConfig = supportedLanguages[detectedLanguage as keyof typeof supportedLanguages];

    return (
        <div
            className={`code-renderer-container ${theme === 'dark' ? 'dark' : ''} ${className}`}
            ref={containerRef}
            data-max-height={maxHeight}
        >
            {/* Header */}
            <div className="code-renderer-header">
                <div className="flex items-center space-x-3">
                    <Code className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {file.name}
                        </h3>
                        {languageConfig && (
                            <div className="flex items-center space-x-2 mt-1">
                                <div
                                    className="language-indicator"
                                    data-color={detectedLanguage}
                                />
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {languageConfig.name}
                                </span>
                                {lineCount > 1 && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        • {lineCount} lines
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    {/* Analysis Status */}
                    {analysis && (
                        <div className="flex items-center space-x-1">
                            {analysis.issues.length > 0 && (
                                <span className="status-badge issues">
                                    {analysis.issues.length} issues
                                </span>
                            )}
                            <span className={getQualityBadgeClass(analysis.quality)}>
                                Quality: {Math.round(analysis.quality * 100)}%
                            </span>
                        </div>
                    )}

                    {enableAIAssistance && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAIAssistant(!showAIAssistant)}
                            className={showAIAssistant ? 'ai-assistant-button active' : 'ai-assistant-button'}
                        >
                            <Brain className="h-4 w-4" />
                        </Button>
                    )}

                    {enableCodeExecution && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={executeCode}
                            disabled={isExecuting}
                        >
                            {isExecuting ? (
                                <div className="loading-spinner" />
                            ) : (
                                <Play className="h-4 w-4" />
                            )}
                        </Button>
                    )}

                    <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4" />
                    </Button>

                    <Button variant="ghost" size="sm" onClick={downloadFile}>
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className={`code-renderer-content ${maxHeight ? 'with-max-height' : ''}`}>
                {/* Main code area */}
                <div className="flex-1 flex">
                    {/* Line numbers */}
                    {showLineNumbers && (
                        <div className="line-numbers">
                            {Array.from({ length: lineCount }, (_, i) => (
                                <div key={`line-${i + 1}`} className="leading-6">
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Code editor */}
                    <div className="code-editor-area">
                        <label htmlFor={`code-editor-${file.name}`} className="sr-only">
                            Code Editor for {file.name}
                        </label>
                        <textarea
                            id={`code-editor-${file.name}`}
                            ref={codeRef}
                            value={content}
                            onChange={(e) => handleContentChange(e.target.value)}
                            readOnly={readOnly}
                            className={`code-editor-textarea ${getSyntaxClass(detectedLanguage)}`}
                            placeholder="Enter your code here..."
                            title={`Code Editor for ${file.name}`}
                            spellCheck={false}
                            onSelect={(e) => {
                                const textarea = e.target as HTMLTextAreaElement;
                                const selected = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
                                setSelectedText(selected);
                            }}
                        />

                        {/* Issues overlay */}
                        {analysis?.issues.length && analysis.issues.length > 0 && (
                            <div className="issues-overlay">
                                {analysis.issues.slice(0, 3).map((issue) => (
                                    <div
                                        key={issue.id}
                                        className={getIssueBadgeClass(issue)}
                                    >
                                        Line {issue.line}: {issue.message.length > 50 ? issue.message.substring(0, 50) + '...' : issue.message}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Assistant Panel */}
                {showAIAssistant && enableAIAssistance && (
                    <div className="ai-assistant-panel">
                        <AICodeAssistant
                            initialCode={content}
                            language={detectedLanguage}
                            filename={file.name}
                            onCodeChange={handleContentChange}
                            className="h-full border-0 rounded-none"
                        />
                    </div>
                )}
            </div>

            {/* Execution Result */}
            {executionResult && (
                <div className="execution-result-section">
                    <div className="execution-result-content">
                        <div className="execution-result-header">
                            <Terminal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                Execution Result
                            </span>
                        </div>
                        <div className="execution-result-output">
                            {executionResult}
                        </div>
                    </div>
                </div>
            )}

            {/* Analysis Summary */}
            {analysis && analysis.suggestions.length > 0 && (
                <div className="suggestions-section">
                    <div className="suggestions-content">
                        <div className="suggestions-header">
                            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                AI Suggestions
                            </span>
                        </div>
                        <div className="suggestions-list">
                            {analysis.suggestions.slice(0, 3).map((suggestion, index) => (
                                <div key={`suggestion-${suggestion.slice(0, 20)}-${index}`} className="suggestion-item">
                                    {suggestion}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Enhanced MediaRenderer that delegates to CodeRenderer for code files
export const EnhancedMediaRenderer: React.FC<{
    file: MediaFile;
    className?: string;
    [key: string]: unknown;
}> = ({ file, ...props }) => {
    const isCodeFile = useCallback(() => {
        const codeExtensions = [
            '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cs', '.cpp', '.c', '.php',
            '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.sql', '.html', '.css',
            '.scss', '.json', '.xml', '.yml', '.yaml', '.md', '.sh', '.ps1'
        ];

        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        return codeExtensions.includes(extension) ||
            file.mimeType.includes('text/') ||
            file.name === 'Dockerfile';
    }, [file.name, file.mimeType]);

    if (isCodeFile()) {
        return (
            <CodeRenderer
                file={file as CodeFile}
                enableSyntaxHighlighting={true}
                enableAIAssistance={true}
                enableCodeExecution={true}
                showLineNumbers={true}
                {...props}
            />
        );
    }

    return <MediaRenderer file={file} {...props} />;
};

export default CodeRenderer;