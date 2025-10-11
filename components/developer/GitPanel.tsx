/**
 * Git Integration Panel
 * Git status, commit, push, pull, branch management
 */

import React, { useState } from 'react';
import {
    GitBranch,
    GitCommit,
    GitPullRequest,
    GitMerge,
    Upload,
    Download,
    RefreshCw,
    Check,
    X,
    Plus,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface GitFile {
    path: string;
    status: 'modified' | 'added' | 'deleted' | 'untracked';
}

interface GitPanelProps {
    isDarkMode: boolean;
}

const MOCK_GIT_STATUS: GitFile[] = [
    { path: 'src/components/Button.tsx', status: 'modified' },
    { path: 'src/utils/api.ts', status: 'modified' },
    { path: 'src/components/NewFeature.tsx', status: 'added' },
    { path: 'public/old-icon.png', status: 'deleted' },
    { path: 'README.md', status: 'untracked' }
];

const GitPanel: React.FC<GitPanelProps> = ({ isDarkMode }) => {
    const [currentBranch, setCurrentBranch] = useState('main');
    const [commitMessage, setCommitMessage] = useState('');
    const [stagedFiles, setStagedFiles] = useState<Set<string>>(new Set());
    const [isCommitting, setIsCommitting] = useState(false);

    const toggleStageFile = (path: string) => {
        const newStaged = new Set(stagedFiles);
        if (newStaged.has(path)) {
            newStaged.delete(path);
        } else {
            newStaged.add(path);
        }
        setStagedFiles(newStaged);
    };

    const stageAll = () => {
        setStagedFiles(new Set(MOCK_GIT_STATUS.map(f => f.path)));
        toast.success('All files staged');
    };

    const unstageAll = () => {
        setStagedFiles(new Set());
        toast.success('All files unstaged');
    };

    const handleCommit = async () => {
        if (!commitMessage.trim()) {
            toast.error('Please enter a commit message');
            return;
        }
        if (stagedFiles.size === 0) {
            toast.error('No files staged for commit');
            return;
        }

        setIsCommitting(true);
        // Simulate commit
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsCommitting(false);
        
        toast.success(`Committed ${stagedFiles.size} files`);
        setCommitMessage('');
        setStagedFiles(new Set());
    };

    const handlePush = () => {
        toast.success('Pushed to origin/main');
    };

    const handlePull = () => {
        toast.success('Pulled from origin/main');
    };

    const getStatusIcon = (status: GitFile['status']) => {
        switch (status) {
            case 'modified': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            case 'added': return <Plus className="h-4 w-4 text-green-500" />;
            case 'deleted': return <X className="h-4 w-4 text-red-500" />;
            case 'untracked': return <AlertCircle className="h-4 w-4 text-blue-500" />;
        }
    };

    const getStatusColor = (status: GitFile['status']) => {
        switch (status) {
            case 'modified': return 'text-yellow-500';
            case 'added': return 'text-green-500';
            case 'deleted': return 'text-red-500';
            case 'untracked': return 'text-blue-500';
        }
    };

    const bgClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    const inputClass = isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300';

    return (
        <div className={`${bgClass} border rounded-xl shadow-lg h-full flex flex-col`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <GitBranch className="h-5 w-5 text-purple-500" />
                        <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Git Integration
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={handlePull}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                    >
                        <Download className="h-4 w-4" />
                        Pull
                    </button>
                </div>

                {/* Current Branch */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <GitBranch className="h-4 w-4 text-purple-500" />
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {currentBranch}
                    </span>
                    <span className={`ml-auto text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {MOCK_GIT_STATUS.length} changes
                    </span>
                </div>
            </div>

            {/* Changes List */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-3">
                    <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Changes ({MOCK_GIT_STATUS.length})
                    </h4>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={stageAll}
                            className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                        >
                            Stage All
                        </button>
                        <button
                            type="button"
                            onClick={unstageAll}
                            className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                        >
                            Unstage All
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    {MOCK_GIT_STATUS.map((file) => {
                        const isStaged = stagedFiles.has(file.path);
                        return (
                            <div
                                key={file.path}
                                onClick={() => toggleStageFile(file.path)}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                    isStaged
                                        ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/50'
                                        : isDarkMode
                                        ? 'hover:bg-gray-700 border border-transparent'
                                        : 'hover:bg-gray-50 border border-transparent'
                                }`}
                            >
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                    isStaged
                                        ? 'bg-purple-600 border-purple-600'
                                        : isDarkMode
                                        ? 'border-gray-600'
                                        : 'border-gray-300'
                                }`}>
                                    {isStaged && <Check className="h-3 w-3 text-white" />}
                                </div>
                                {getStatusIcon(file.status)}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {file.path}
                                    </p>
                                    <p className={`text-xs ${getStatusColor(file.status)}`}>
                                        {file.status}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Commit Section */}
            <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
                <textarea
                    placeholder="Commit message..."
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${inputClass} focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none mb-3`}
                    rows={3}
                />
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleCommit}
                        disabled={isCommitting || stagedFiles.size === 0 || !commitMessage.trim()}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <GitCommit className="h-4 w-4" />
                        {isCommitting ? 'Committing...' : `Commit (${stagedFiles.size})`}
                    </button>
                    <button
                        type="button"
                        onClick={handlePush}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                        <Upload className="h-4 w-4" />
                        Push
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GitPanel;

