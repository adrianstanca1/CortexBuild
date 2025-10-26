/**
 * Advanced Code Editor - Monaco Editor (VS Code engine)
 * 
 * Features:
 * - Syntax highlighting for multiple languages
 * - IntelliSense (autocomplete)
 * - Error detection
 * - Code formatting
 * - Multi-file support
 * - Themes (dark/light)
 * - Minimap
 * - Find & Replace
 */

import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
    Play,
    Save,
    Download,
    Upload,
    Settings,
    FileCode,
    Plus,
    X,
    Search,
    GitBranch,
    Terminal,
    Bug
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AdvancedCodeEditorProps {
    isDarkMode?: boolean;
}

interface CodeFile {
    id: string;
    name: string;
    language: string;
    content: string;
    path: string;
}

const AdvancedCodeEditor: React.FC<AdvancedCodeEditorProps> = ({ isDarkMode = true }) => {
    const [files, setFiles] = useState<CodeFile[]>([
        {
            id: '1',
            name: 'app.tsx',
            language: 'typescript',
            path: '/src/app.tsx',
            content: `import React from 'react';

interface AppProps {
    title: string;
}

const App: React.FC<AppProps> = ({ title }) => {
    return (
        <div className="app">
            <h1>{title}</h1>
            <p>Welcome to CortexBuild!</p>
        </div>
    );
};

export default App;`
        },
        {
            id: '2',
            name: 'styles.css',
            language: 'css',
            path: '/src/styles.css',
            content: `.app {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

h1 {
    color: #6366f1;
    font-size: 2rem;
    font-weight: bold;
}`
        }
    ]);

    const [activeFileId, setActiveFileId] = useState(files[0].id);
    const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'light'>('vs-dark');
    const [fontSize, setFontSize] = useState(14);
    const [showSettings, setShowSettings] = useState(false);
    const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
    const editorRef = useRef<any>(null);

    const activeFile = files.find(f => f.id === activeFileId) || files[0];

    const handleEditorDidMount = (editor: any, monaco: any) => {
        editorRef.current = editor;

        // Configure Monaco Editor
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ES2020,
            allowNonTsExtensions: true,
            moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            module: monaco.languages.typescript.ModuleKind.CommonJS,
            noEmit: true,
            esModuleInterop: true,
            jsx: monaco.languages.typescript.JsxEmit.React,
            reactNamespace: 'React',
            allowJs: true,
            typeRoots: ['node_modules/@types']
        });

        // Add keyboard shortcuts
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            saveFile();
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR, () => {
            runCode();
        });
    };

    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined) {
            setFiles(files.map(f => 
                f.id === activeFileId ? { ...f, content: value } : f
            ));
        }
    };

    const saveFile = () => {
        toast.success(`Saved ${activeFile.name}`);
        // In production, save to backend/database
    };

    const runCode = () => {
        setConsoleOutput([]);
        toast.loading('Running code...');

        try {
            // Simulate code execution
            setTimeout(() => {
                setConsoleOutput([
                    '> Running code...',
                    '> Compiling TypeScript...',
                    '> Build successful!',
                    '> Starting development server...',
                    '> Server running on http://localhost:3000',
                    '> ✓ Compiled successfully'
                ]);
                toast.dismiss();
                toast.success('Code executed successfully!');
            }, 1500);
        } catch (error) {
            toast.dismiss();
            toast.error('Execution failed');
            setConsoleOutput([
                '> Error: Compilation failed',
                `> ${error}`
            ]);
        }
    };

    const createNewFile = () => {
        const newFile: CodeFile = {
            id: Date.now().toString(),
            name: 'untitled.tsx',
            language: 'typescript',
            path: '/src/untitled.tsx',
            content: '// New file\n'
        };
        setFiles([...files, newFile]);
        setActiveFileId(newFile.id);
        toast.success('New file created');
    };

    const closeFile = (fileId: string) => {
        if (files.length === 1) {
            toast.error('Cannot close the last file');
            return;
        }

        const newFiles = files.filter(f => f.id !== fileId);
        setFiles(newFiles);

        if (activeFileId === fileId) {
            setActiveFileId(newFiles[0].id);
        }

        toast.success('File closed');
    };

    const formatCode = () => {
        if (editorRef.current) {
            editorRef.current.getAction('editor.action.formatDocument').run();
            toast.success('Code formatted');
        }
    };

    const downloadFile = () => {
        const blob = new Blob([activeFile.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = activeFile.name;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('File downloaded');
    };

    return (
        <div className={`h-full flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
                <div className="flex items-center gap-4">
                    <FileCode className={`h-6 w-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Advanced Code Editor
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={createNewFile}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 rounded-lg transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        New File
                    </button>
                    <button
                        type="button"
                        onClick={saveFile}
                        className="flex items-center gap-2 px-3 py-2 bg-green-500/20 text-green-500 hover:bg-green-500/30 rounded-lg transition-all"
                    >
                        <Save className="h-4 w-4" />
                        Save
                    </button>
                    <button
                        type="button"
                        onClick={runCode}
                        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all"
                    >
                        <Play className="h-4 w-4" />
                        Run
                    </button>
                    <button
                        type="button"
                        onClick={formatCode}
                        className={`p-2 rounded-lg transition-all ${
                            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                        }`}
                    >
                        <Bug className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    </button>
                    <button
                        type="button"
                        onClick={downloadFile}
                        className={`p-2 rounded-lg transition-all ${
                            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                        }`}
                    >
                        <Download className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-2 rounded-lg transition-all ${
                            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                        }`}
                    >
                        <Settings className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    </button>
                </div>
            </div>

            {/* File Tabs */}
            <div className={`flex items-center gap-1 px-4 py-2 border-b overflow-x-auto ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
            }`}>
                {files.map(file => (
                    <div
                        key={file.id}
                        className={`flex items-center gap-2 px-4 py-2 rounded-t-lg cursor-pointer transition-all ${
                            activeFileId === file.id
                                ? isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
                                : isDarkMode ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                        onClick={() => setActiveFileId(file.id)}
                    >
                        <span className="text-sm font-medium">{file.name}</span>
                        {files.length > 1 && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    closeFile(file.id);
                                }}
                                className="hover:bg-red-500/20 rounded p-1"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Editor */}
            <div className="flex-1 relative">
                <Editor
                    height="100%"
                    language={activeFile.language}
                    value={activeFile.content}
                    theme={editorTheme}
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    options={{
                        fontSize,
                        minimap: { enabled: true },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        wordWrap: 'on',
                        formatOnPaste: true,
                        formatOnType: true,
                        suggestOnTriggerCharacters: true,
                        quickSuggestions: true,
                        parameterHints: { enabled: true },
                        folding: true,
                        lineNumbers: 'on',
                        renderWhitespace: 'selection',
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on'
                    }}
                />
            </div>

            {/* Console Output */}
            {consoleOutput.length > 0 && (
                <div className={`h-48 border-t overflow-y-auto ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
                }`}>
                    <div className="flex items-center gap-2 px-4 py-2 border-b">
                        <Terminal className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                        <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Console
                        </span>
                    </div>
                    <div className="p-4 font-mono text-sm space-y-1">
                        {consoleOutput.map((line, index) => (
                            <div key={index} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                {line}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Settings Panel */}
            {showSettings && (
                <div className={`absolute top-16 right-4 w-80 p-6 rounded-2xl border shadow-2xl z-50 ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                    <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Editor Settings
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Theme
                            </label>
                            <select
                                value={editorTheme}
                                onChange={(e) => setEditorTheme(e.target.value as any)}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                    isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                                }`}
                            >
                                <option value="vs-dark">Dark</option>
                                <option value="light">Light</option>
                            </select>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Font Size: {fontSize}px
                            </label>
                            <input
                                type="range"
                                min="10"
                                max="24"
                                value={fontSize}
                                onChange={(e) => setFontSize(parseInt(e.target.value))}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedCodeEditor;

