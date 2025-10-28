

import React, { useState, useEffect, useCallback, useMemo } from 'react';
// FIX: Corrected import paths to be relative.
import { User, Project, AISearchResult, Document as Doc, Role } from '../types';
import { api } from '../services/apiService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface AISearchModalProps {
    user: User;
    currentProject: Project | null;
    onClose: () => void;
    addToast: (message: string, type: 'success' | 'error') => void;
}

const highlightText = (text: string, highlight: string): React.ReactNode => {
    if (!highlight.trim() || !text) {
        return text;
    }
    const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
        <span>
            {parts.map((part, i) =>
                regex.test(part) ? <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part}</mark> : part
            )}
        </span>
    );
};

export const AISearchModal: React.FC<AISearchModalProps> = ({ user, currentProject, onClose, addToast }) => {
    const [query, setQuery] = useState('');
    const [searchScope, setSearchScope] = useState<string>('current');
    const [userProjects, setUserProjects] = useState<Project[]>([]);
    const [allDocuments, setAllDocuments] = useState<Doc[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<AISearchResult | null>(null);

    // Fetch user's projects for the scope dropdown
    const fetchUserProjects = useCallback(async () => {
        try {
            if(!user.companyId) return;
            let projects: Project[] = [];
            if (user.role === Role.ADMIN) {
                projects = await api.getProjectsByCompany(user.companyId);
            } else if (user.role === Role.PM) {
                projects = await api.getProjectsByManager(user.id);
            } else {
                projects = await api.getProjectsByUser(user.id);
            }
            setUserProjects(projects);

            const allDocs = await api.getDocumentsByProjectIds(projects.map(p => p.id));
            setAllDocuments(allDocs);

        } catch (e) {
            addToast("Could not load project list.", "error");
        }
    }, [user, addToast]);
    
    useEffect(() => {
        fetchUserProjects();
        if (currentProject) {
            setSearchScope(currentProject.id.toString());
        } else {
            setSearchScope('all');
        }
    }, [currentProject, fetchUserProjects]);
    
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        
        let projectIdsToSearch: number[] = [];
        if (searchScope === 'all') {
            projectIdsToSearch = userProjects.map(p => p.id);
        } else {
            projectIdsToSearch = [parseInt(searchScope, 10)];
        }
        
        if (projectIdsToSearch.length === 0) {
            addToast("No projects selected to search within.", "error");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const searchResult = await api.searchAcrossDocuments(query, projectIdsToSearch, user.id);
            setResult(searchResult);
        } catch (err) {
            const message = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(message);
            addToast("AI search failed.", "error");
        } finally {
            setIsLoading(false);
        }
    };
    
    const getDocumentById = (id: number): Doc | undefined => {
        return allDocuments.find(d => d.id === id);
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="w-full max-w-3xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex-shrink-0">
                     <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12h.01M12 15h.01M9 12h.01M12 9h.01" />
                        </svg>
                        AI Project Search
                    </h2>
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Ask about rebar specs, safety procedures, deadlines..."
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-lg"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <select
                                value={searchScope}
                                onChange={e => setSearchScope(e.target.value)}
                                className="p-3 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
                            >
                                {currentProject && <option value={currentProject.id.toString()}>This Project</option>}
                                <option value="all">All My Projects</option>
                                <optgroup label="Specific Project">
                                    {userProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </optgroup>
                            </select>
                            <Button type="submit" size="lg" isLoading={isLoading} className="w-full sm:w-auto">Search</Button>
                        </div>
                    </form>
                </div>

                <div className="flex-grow mt-6 overflow-y-auto pr-2">
                    {isLoading && (
                         <div className="text-center py-10">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
                            <p className="mt-4 text-slate-600">AI is searching across documents...</p>
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-md">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}
                    {result && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider mb-2">AI Generated Summary</h3>
                                <blockquote className="p-4 bg-sky-50 border-l-4 border-sky-500 text-slate-800 rounded-r-md">
                                    {result.summary}
                                </blockquote>
                            </div>
                            
                            {result.sources.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider mb-2">Sources</h3>
                                    <div className="space-y-3">
                                        {result.sources.map((source, index) => {
                                            const doc = getDocumentById(source.documentId);
                                            return (
                                                <div key={index} className="p-3 border rounded-md bg-white">
                                                    <p className="font-semibold text-slate-700">{doc?.name || `Document #${source.documentId}`}</p>
                                                    <p className="text-xs text-slate-500 mb-2">{doc?.category}</p>
                                                    <p className="text-sm text-slate-600 italic border-l-2 border-slate-300 pl-2">
                                                        "...{highlightText(source.snippet, query)}..."
                                                    </p>
                                                     {doc && (
                                                         <div className="text-right mt-2">
                                                             <Button size="sm" variant="secondary" onClick={() => window.open(doc.url, '_blank')}>View Document</Button>
                                                         </div>
                                                     )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {!isLoading && !result && !error && (
                        <div className="text-center py-20 text-slate-500">
                            <p>Ask a question to get started.</p>
                        </div>
                    )}
                </div>

                 <div className="text-right mt-4 flex-shrink-0">
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                </div>
            </Card>
        </div>
    );
};