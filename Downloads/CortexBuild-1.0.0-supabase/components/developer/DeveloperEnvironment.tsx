import React, { useState } from 'react';
import { Code, Play, Save, FolderOpen, File, Plus, Trash2, Download } from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
}

export const DeveloperEnvironment: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([
    { id: '1', name: 'index.ts', type: 'file', content: '// Welcome to CortexBuild Code Editor\nconsole.log("Hello, Developer!");', language: 'typescript' },
    { id: '2', name: 'api.ts', type: 'file', content: 'export const fetchData = async () => {\n  // Your API code here\n};', language: 'typescript' },
    { id: '3', name: 'styles.css', type: 'file', content: '/* Your styles */\n.container {\n  padding: 20px;\n}', language: 'css' }
  ]);
  const [activeFile, setActiveFile] = useState<FileItem | null>(files[0]);
  const [code, setCode] = useState(files[0]?.content || '');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleFileSelect = (file: FileItem) => {
    setActiveFile(file);
    setCode(file.content || '');
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (activeFile) {
      setFiles(prev => prev.map(f => 
        f.id === activeFile.id ? { ...f, content: newCode } : f
      ));
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running code...\n');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/developer/code/run', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          language: activeFile?.language || 'javascript'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setOutput(prev => prev + '\n✅ Execution successful\n\n' + (data.output || 'No output'));
      } else {
        setOutput(prev => prev + '\n❌ Execution failed\n\n' + (data.error || 'Unknown error'));
      }
    } catch (error: any) {
      setOutput(prev => prev + '\n❌ Error: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const saveFile = async () => {
    if (!activeFile) return;

    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:3001/api/developer/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          path: activeFile.name,
          content: code
        })
      });

      setOutput('✅ File saved successfully');
    } catch (error: any) {
      setOutput('❌ Failed to save file: ' + error.message);
    }
  };

  const createNewFile = () => {
    const fileName = prompt('Enter file name:');
    if (fileName) {
      const newFile: FileItem = {
        id: Date.now().toString(),
        name: fileName,
        type: 'file',
        content: '',
        language: fileName.endsWith('.ts') ? 'typescript' : fileName.endsWith('.js') ? 'javascript' : 'plaintext'
      };
      setFiles(prev => [...prev, newFile]);
      setActiveFile(newFile);
      setCode('');
    }
  };

  const deleteFile = (fileId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      setFiles(prev => prev.filter(f => f.id !== fileId));
      if (activeFile?.id === fileId) {
        setActiveFile(files[0] || null);
        setCode(files[0]?.content || '');
      }
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-200px)]">
      {/* File Explorer */}
      <div className="col-span-3 bg-[#252526] rounded-lg border border-[#3e3e42] overflow-hidden">
        <div className="bg-[#2d2d30] px-4 py-3 border-b border-[#3e3e42] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-white">Files</span>
          </div>
          <button
            type="button"
            onClick={createNewFile}
            className="p-1 hover:bg-[#3e3e42] rounded transition-colors"
            title="New file"
          >
            <Plus className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        
        <div className="p-2">
          {files.map(file => (
            <div
              key={file.id}
              className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer transition-colors ${
                activeFile?.id === file.id ? 'bg-[#37373d]' : 'hover:bg-[#2a2d2e]'
              }`}
              onClick={() => handleFileSelect(file)}
            >
              <div className="flex items-center gap-2">
                <File className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">{file.name}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFile(file.id);
                }}
                className="p-1 hover:bg-[#3e3e42] rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3 text-red-400" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Code Editor */}
      <div className="col-span-9 flex flex-col gap-4">
        {/* Editor */}
        <div className="flex-1 bg-[#1e1e1e] rounded-lg border border-[#3e3e42] overflow-hidden flex flex-col">
          <div className="bg-[#252526] px-4 py-3 border-b border-[#3e3e42] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-white">{activeFile?.name || 'No file selected'}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={saveFile}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white transition-colors"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                type="button"
                onClick={runCode}
                disabled={isRunning}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-sm text-white transition-colors"
              >
                <Play className="w-4 h-4" />
                Run
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <textarea
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="w-full h-full p-4 bg-[#1e1e1e] text-gray-300 font-mono text-sm resize-none outline-none"
              style={{ fontFamily: 'Fira Code, JetBrains Mono, monospace' }}
              placeholder="Start coding..."
              spellCheck={false}
            />
          </div>
        </div>

        {/* Output Panel */}
        <div className="h-48 bg-[#1e1e1e] rounded-lg border border-[#3e3e42] overflow-hidden">
          <div className="bg-[#252526] px-4 py-2 border-b border-[#3e3e42]">
            <span className="text-sm font-semibold text-white">Output</span>
          </div>
          <div className="h-[calc(100%-40px)] overflow-y-auto p-4">
            <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap" style={{ fontFamily: 'Fira Code, JetBrains Mono, monospace' }}>
              {output || 'No output yet. Run your code to see results.'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

