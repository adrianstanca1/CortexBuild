import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, RefreshCw, Download, Share2, Code, Eye, Terminal, AlertCircle, CheckCircle } from 'lucide-react';

interface CodeSandboxProps {
  code: string;
  language?: 'typescript' | 'javascript' | 'html';
  onCodeChange?: (code: string) => void;
}

export const CodeSandbox: React.FC<CodeSandboxProps> = ({ 
  code, 
  language = 'typescript',
  onCodeChange 
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'console'>('code');
  const [editableCode, setEditableCode] = useState(code);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setEditableCode(code);
  }, [code]);

  const runCode = async () => {
    setIsRunning(true);
    setOutput([]);
    setErrors([]);

    try {
      // For React/TypeScript code, we need to transpile and render
      if (language === 'typescript' || language === 'javascript') {
        // Create a sandboxed iframe environment
        const iframe = iframeRef.current;
        if (!iframe) return;

        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) return;

        // Inject React and ReactDOM from CDN
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
              <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
              <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                body { margin: 0; padding: 16px; font-family: system-ui, -apple-system, sans-serif; }
                * { box-sizing: border-box; }
              </style>
            </head>
            <body>
              <div id="root"></div>
              <script type="text/babel">
                const { useState, useEffect } = React;
                
                // Capture console logs
                const originalLog = console.log;
                const originalError = console.error;
                
                console.log = (...args) => {
                  window.parent.postMessage({ type: 'log', data: args.join(' ') }, '*');
                  originalLog.apply(console, args);
                };
                
                console.error = (...args) => {
                  window.parent.postMessage({ type: 'error', data: args.join(' ') }, '*');
                  originalError.apply(console, args);
                };

                try {
                  ${editableCode}
                  
                  // Try to render the component
                  const componentName = ${editableCode}.match(/export\\s+(?:default\\s+)?(?:const|function)\\s+(\\w+)/)?.[1];
                  if (componentName && window[componentName]) {
                    ReactDOM.render(React.createElement(window[componentName]), document.getElementById('root'));
                  } else {
                    // Try to find any exported component
                    const match = ${editableCode}.match(/export\\s+default\\s+(\\w+)/);
                    if (match && window[match[1]]) {
                      ReactDOM.render(React.createElement(window[match[1]]), document.getElementById('root'));
                    }
                  }
                  
                  window.parent.postMessage({ type: 'success', data: 'Code executed successfully' }, '*');
                } catch (error) {
                  window.parent.postMessage({ type: 'error', data: error.message }, '*');
                  console.error(error);
                }
              </script>
            </body>
          </html>
        `;

        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();

        setOutput(['Executing code...']);
      }
    } catch (error: any) {
      setErrors([error.message]);
    } finally {
      setTimeout(() => setIsRunning(false), 1000);
    }
  };

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'log') {
        setOutput(prev => [...prev, `> ${event.data.data}`]);
      } else if (event.data.type === 'error') {
        setErrors(prev => [...prev, event.data.data]);
      } else if (event.data.type === 'success') {
        setOutput(prev => [...prev, '✓ ' + event.data.data]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const stopExecution = () => {
    setIsRunning(false);
    if (iframeRef.current) {
      iframeRef.current.src = 'about:blank';
    }
  };

  const resetCode = () => {
    setEditableCode(code);
    setOutput([]);
    setErrors([]);
    if (onCodeChange) onCodeChange(code);
  };

  const handleCodeEdit = (newCode: string) => {
    setEditableCode(newCode);
    if (onCodeChange) onCodeChange(newCode);
  };

  const downloadCode = () => {
    const blob = new Blob([editableCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `component.${language === 'typescript' ? 'tsx' : 'jsx'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Run Code</span>
              </>
            )}
          </button>

          {isRunning && (
            <button
              onClick={stopExecution}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Square className="w-4 h-4" />
              <span>Stop</span>
            </button>
          )}

          <button
            onClick={resetCode}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={downloadCode}
            className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <nav className="flex space-x-8 px-4">
          {[
            { id: 'code', label: 'Code', icon: Code },
            { id: 'preview', label: 'Preview', icon: Eye },
            { id: 'console', label: 'Console', icon: Terminal }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="h-96">
        {activeTab === 'code' && (
          <textarea
            value={editableCode}
            onChange={(e) => handleCodeEdit(e.target.value)}
            className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-gray-100 focus:outline-none resize-none"
            spellCheck={false}
          />
        )}

        {activeTab === 'preview' && (
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
            title="Code Preview"
          />
        )}

        {activeTab === 'console' && (
          <div className="h-full overflow-y-auto bg-gray-900 text-gray-100 p-4 font-mono text-sm">
            {output.length === 0 && errors.length === 0 ? (
              <div className="text-gray-500">Console output will appear here...</div>
            ) : (
              <>
                {output.map((line, i) => (
                  <div key={`out-${i}`} className="flex items-start space-x-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{line}</span>
                  </div>
                ))}
                {errors.map((error, i) => (
                  <div key={`err-${i}`} className="flex items-start space-x-2 mb-1 text-red-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

