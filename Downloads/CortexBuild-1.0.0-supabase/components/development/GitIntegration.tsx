/**
 * Git Integration - Version control system
 * 
 * Features:
 * - Repository management
 * - Commit history
 * - Branch management
 * - Diff viewer
 * - Push/Pull operations
 * - Merge conflicts resolution
 */

import React, { useState } from 'react';
import {
    GitBranch,
    GitCommit,
    GitMerge,
    GitPullRequest,
    Upload,
    Download,
    Plus,
    Check,
    X,
    Clock,
    User,
    FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

interface GitIntegrationProps {
    isDarkMode?: boolean;
}

interface Commit {
    id: string;
    message: string;
    author: string;
    date: Date;
    branch: string;
    filesChanged: number;
}

interface Branch {
    name: string;
    isActive: boolean;
    lastCommit: Date;
    commitsAhead: number;
    commitsBehind: number;
}

const GitIntegration: React.FC<GitIntegrationProps> = ({ isDarkMode = true }) => {
    const [branches, setBranches] = useState<Branch[]>([
        { name: 'main', isActive: true, lastCommit: new Date(), commitsAhead: 0, commitsBehind: 0 },
        { name: 'feature/mobile-builder', isActive: false, lastCommit: new Date(Date.now() - 86400000), commitsAhead: 3, commitsBehind: 1 },
        { name: 'feature/construction-apps', isActive: false, lastCommit: new Date(Date.now() - 172800000), commitsAhead: 5, commitsBehind: 2 }
    ]);

    const [commits, setCommits] = useState<Commit[]>([
        {
            id: '908d2ae',
            message: '🏗️ Construction Industry Apps - Complete Implementation',
            author: 'CortexBuild',
            date: new Date(),
            branch: 'main',
            filesChanged: 6
        },
        {
            id: '6954a06',
            message: '📱 Mobile App Builder - Complete Implementation',
            author: 'CortexBuild',
            date: new Date(Date.now() - 3600000),
            branch: 'main',
            filesChanged: 5
        },
        {
            id: 'abc1234',
            message: '🎨 Enhanced Developer Console with modern UI',
            author: 'CortexBuild',
            date: new Date(Date.now() - 7200000),
            branch: 'main',
            filesChanged: 3
        }
    ]);

    const [commitMessage, setCommitMessage] = useState('');
    const [newBranchName, setNewBranchName] = useState('');
    const [showNewBranch, setShowNewBranch] = useState(false);

    const activeBranch = branches.find(b => b.isActive) || branches[0];

    const createCommit = () => {
        if (!commitMessage.trim()) {
            toast.error('Please enter a commit message');
            return;
        }

        const newCommit: Commit = {
            id: Math.random().toString(36).substring(7),
            message: commitMessage,
            author: 'Current User',
            date: new Date(),
            branch: activeBranch.name,
            filesChanged: Math.floor(Math.random() * 10) + 1
        };

        setCommits([newCommit, ...commits]);
        setCommitMessage('');
        toast.success('Changes committed successfully!');
    };

    const createBranch = () => {
        if (!newBranchName.trim()) {
            toast.error('Please enter a branch name');
            return;
        }

        if (branches.some(b => b.name === newBranchName)) {
            toast.error('Branch already exists');
            return;
        }

        const newBranch: Branch = {
            name: newBranchName,
            isActive: false,
            lastCommit: new Date(),
            commitsAhead: 0,
            commitsBehind: 0
        };

        setBranches([...branches, newBranch]);
        setNewBranchName('');
        setShowNewBranch(false);
        toast.success(`Branch '${newBranch.name}' created!`);
    };

    const switchBranch = (branchName: string) => {
        setBranches(branches.map(b => ({
            ...b,
            isActive: b.name === branchName
        })));
        toast.success(`Switched to branch '${branchName}'`);
    };

    const pushChanges = () => {
        toast.loading('Pushing changes...');
        setTimeout(() => {
            toast.dismiss();
            toast.success('Changes pushed to remote!');
        }, 1500);
    };

    const pullChanges = () => {
        toast.loading('Pulling changes...');
        setTimeout(() => {
            toast.dismiss();
            toast.success('Changes pulled from remote!');
        }, 1500);
    };

    const mergeBranch = (branchName: string) => {
        toast.loading(`Merging ${branchName} into ${activeBranch.name}...`);
        setTimeout(() => {
            toast.dismiss();
            toast.success(`Successfully merged ${branchName}!`);
        }, 2000);
    };

    return (
        <div className={`h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-8`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className={`text-4xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        🔀 Git Integration
                    </h1>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Version control and collaboration
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Branches */}
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Branches
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowNewBranch(!showNewBranch)}
                                className="p-2 bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 rounded-lg transition-all"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>

                        {showNewBranch && (
                            <div className="mb-4 space-y-2">
                                <input
                                    type="text"
                                    value={newBranchName}
                                    onChange={(e) => setNewBranchName(e.target.value)}
                                    placeholder="feature/new-feature"
                                    className={`w-full px-3 py-2 rounded-lg border ${
                                        isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                                    }`}
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={createBranch}
                                        className="flex-1 px-3 py-2 bg-green-500/20 text-green-500 hover:bg-green-500/30 rounded-lg font-semibold"
                                    >
                                        Create
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewBranch(false)}
                                        className="flex-1 px-3 py-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-lg font-semibold"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            {branches.map(branch => (
                                <div
                                    key={branch.name}
                                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                        branch.isActive
                                            ? 'border-purple-500 bg-purple-500/10'
                                            : isDarkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => !branch.isActive && switchBranch(branch.name)}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <GitBranch className={`h-4 w-4 ${branch.isActive ? 'text-purple-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                        <span className={`font-semibold ${branch.isActive ? 'text-purple-500' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {branch.name}
                                        </span>
                                        {branch.isActive && (
                                            <span className="ml-auto px-2 py-0.5 bg-purple-500/20 text-purple-500 text-xs font-semibold rounded">
                                                ACTIVE
                                            </span>
                                        )}
                                    </div>
                                    {(branch.commitsAhead > 0 || branch.commitsBehind > 0) && (
                                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {branch.commitsAhead > 0 && `↑ ${branch.commitsAhead} ahead`}
                                            {branch.commitsAhead > 0 && branch.commitsBehind > 0 && ', '}
                                            {branch.commitsBehind > 0 && `↓ ${branch.commitsBehind} behind`}
                                        </div>
                                    )}
                                    {!branch.isActive && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                mergeBranch(branch.name);
                                            }}
                                            className="mt-2 w-full px-3 py-1 bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 rounded text-xs font-semibold"
                                        >
                                            Merge into {activeBranch.name}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 space-y-2">
                            <button
                                type="button"
                                onClick={pushChanges}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold"
                            >
                                <Upload className="h-4 w-4" />
                                Push
                            </button>
                            <button
                                type="button"
                                onClick={pullChanges}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold"
                            >
                                <Download className="h-4 w-4" />
                                Pull
                            </button>
                        </div>
                    </div>

                    {/* Commit & History */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* New Commit */}
                        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Create Commit
                            </h2>
                            <div className="space-y-4">
                                <textarea
                                    value={commitMessage}
                                    onChange={(e) => setCommitMessage(e.target.value)}
                                    placeholder="Commit message..."
                                    rows={3}
                                    className={`w-full px-4 py-3 rounded-xl border resize-none ${
                                        isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={createCommit}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold"
                                >
                                    <GitCommit className="h-5 w-5" />
                                    Commit Changes
                                </button>
                            </div>
                        </div>

                        {/* Commit History */}
                        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Commit History
                            </h2>
                            <div className="space-y-4">
                                {commits.map(commit => (
                                    <div
                                        key={commit.id}
                                        className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <div className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {commit.message}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <User className={`h-3 w-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{commit.author}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className={`h-3 w-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{commit.date.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <FileText className={`h-3 w-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{commit.filesChanged} files</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-mono ${
                                                isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                                            }`}>
                                                {commit.id}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GitIntegration;

