/**
 * File Explorer Component
 * Modern file browser with tree view, search, and file operations
 */

import React, { useState } from 'react';
import {
    Folder,
    File,
    ChevronRight,
    ChevronDown,
    Search,
    Plus,
    Trash2,
    Edit,
    Download,
    Upload,
    RefreshCw
} from 'lucide-react';

interface FileNode {
    id: string;
    name: string;
    type: 'file' | 'folder';
    children?: FileNode[];
    size?: string;
    modified?: string;
}

interface FileExplorerProps {
    isDarkMode: boolean;
    onFileSelect?: (file: FileNode) => void;
}

const MOCK_FILE_STRUCTURE: FileNode[] = [
    {
        id: '1',
        name: 'src',
        type: 'folder',
        children: [
            {
                id: '1-1',
                name: 'components',
                type: 'folder',
                children: [
                    { id: '1-1-1', name: 'Button.tsx', type: 'file', size: '2.4 KB', modified: '2 hours ago' },
                    { id: '1-1-2', name: 'Input.tsx', type: 'file', size: '1.8 KB', modified: '3 hours ago' },
                    { id: '1-1-3', name: 'Modal.tsx', type: 'file', size: '3.2 KB', modified: '1 day ago' }
                ]
            },
            {
                id: '1-2',
                name: 'utils',
                type: 'folder',
                children: [
                    { id: '1-2-1', name: 'helpers.ts', type: 'file', size: '4.1 KB', modified: '5 hours ago' },
                    { id: '1-2-2', name: 'api.ts', type: 'file', size: '6.3 KB', modified: '2 days ago' }
                ]
            },
            { id: '1-3', name: 'App.tsx', type: 'file', size: '5.7 KB', modified: '1 hour ago' },
            { id: '1-4', name: 'index.tsx', type: 'file', size: '0.8 KB', modified: '1 week ago' }
        ]
    },
    {
        id: '2',
        name: 'public',
        type: 'folder',
        children: [
            { id: '2-1', name: 'index.html', type: 'file', size: '1.2 KB', modified: '3 days ago' },
            { id: '2-2', name: 'favicon.ico', type: 'file', size: '15 KB', modified: '1 month ago' }
        ]
    },
    { id: '3', name: 'package.json', type: 'file', size: '2.1 KB', modified: '2 days ago' },
    { id: '4', name: 'tsconfig.json', type: 'file', size: '0.9 KB', modified: '1 week ago' },
    { id: '5', name: 'README.md', type: 'file', size: '3.5 KB', modified: '4 days ago' }
];

const FileExplorer: React.FC<FileExplorerProps> = ({ isDarkMode, onFileSelect }) => {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['1']));
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFile, setSelectedFile] = useState<string | null>(null);

    const toggleFolder = (folderId: string) => {
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(folderId)) {
            newExpanded.delete(folderId);
        } else {
            newExpanded.add(folderId);
        }
        setExpandedFolders(newExpanded);
    };

    const handleFileClick = (file: FileNode) => {
        if (file.type === 'file') {
            setSelectedFile(file.id);
            onFileSelect?.(file);
        } else {
            toggleFolder(file.id);
        }
    };

    const renderFileTree = (nodes: FileNode[], level: number = 0) => {
        return nodes.map(node => {
            const isExpanded = expandedFolders.has(node.id);
            const isSelected = selectedFile === node.id;
            const matchesSearch = searchQuery === '' || 
                node.name.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch && node.type === 'file') return null;

            return (
                <div key={node.id}>
                    <div
                        onClick={() => handleFileClick(node)}
                        className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-all rounded-lg ${
                            isSelected
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                                : isDarkMode
                                ? 'hover:bg-gray-700 text-gray-300'
                                : 'hover:bg-gray-100 text-gray-700'
                        }`}
                        style={{ paddingLeft: `${level * 20 + 12}px` }}
                    >
                        {node.type === 'folder' && (
                            <span className="flex-shrink-0">
                                {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </span>
                        )}
                        {node.type === 'folder' ? (
                            <Folder className={`h-4 w-4 flex-shrink-0 ${isExpanded ? 'text-yellow-500' : 'text-blue-500'}`} />
                        ) : (
                            <File className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        )}
                        <span className="flex-1 text-sm font-medium truncate">{node.name}</span>
                        {node.type === 'file' && node.size && (
                            <span className={`text-xs ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                                {node.size}
                            </span>
                        )}
                    </div>
                    {node.type === 'folder' && isExpanded && node.children && (
                        <div>{renderFileTree(node.children, level + 1)}</div>
                    )}
                </div>
            );
        });
    };

    const bgClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    const inputClass = isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300';

    return (
        <div className={`${bgClass} border rounded-xl shadow-lg h-full flex flex-col`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        File Explorer
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className={`p-2 rounded-lg transition-colors ${
                                isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                            }`}
                            title="Refresh"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            className={`p-2 rounded-lg transition-colors ${
                                isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                            }`}
                            title="New File"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${inputClass} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    />
                </div>
            </div>

            {/* File Tree */}
            <div className="flex-1 overflow-y-auto p-2">
                {renderFileTree(MOCK_FILE_STRUCTURE)}
            </div>

            {/* Footer Stats */}
            <div className={`p-3 border-t ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center justify-between text-xs">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        12 files, 3 folders
                    </span>
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Total: 45.2 KB
                    </span>
                </div>
            </div>
        </div>
    );
};

export default FileExplorer;

