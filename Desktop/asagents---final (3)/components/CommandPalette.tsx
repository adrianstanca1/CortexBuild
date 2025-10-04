import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { User, View, Project, Role } from '../types';
import { api } from '../services/apiService';

interface CommandPaletteProps {
  user: User;
  onClose: () => void;
  setActiveView: (view: View) => void;
}

interface Command {
  id: string;
  type: 'navigation' | 'project' | 'action';
  title: string;
  category: string;
  action: () => void;
  keywords?: string;
  icon: React.ReactNode;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ user, onClose, setActiveView }) => {
    const [search, setSearch] = useState('');
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            if (!user.companyId) return;
            try {
                const userProjects = user.role === Role.ADMIN
                    ? await api.getProjectsByCompany(user.companyId)
                    : await api.getProjectsByUser(user.id);
                setProjects(userProjects);
            } catch (error) {
                console.error("Failed to load projects for command palette", error);
            }
        };
        fetchProjects();
    }, [user]);

    const allCommands = useMemo<Command[]>(() => {
        const navCommands: Command[] = [
            { id: 'nav-dashboard', type: 'navigation', title: 'Go to Dashboard', category: 'Navigation', action: () => setActiveView('dashboard'), keywords: 'home main', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>},
            { id: 'nav-timesheets', type: 'navigation', title: 'Go to Timesheets', category: 'Navigation', action: () => setActiveView('timesheets'), icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
            { id: 'nav-documents', type: 'navigation', title: 'Go to Documents', category: 'Navigation', action: () => setActiveView('documents'), icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
            { id: 'nav-settings', type: 'navigation', title: 'Go to Settings', category: 'Navigation', action: () => setActiveView('settings'), icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
        ];
        const projectCommands: Command[] = projects.map(p => ({
            id: `proj-${p.id}`,
            type: 'project',
            title: p.name,
            category: 'Projects',
            action: () => console.log('Navigate to project', p.id), // Replace with actual navigation
            keywords: p.location.address,
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        }));
        return [...navCommands, ...projectCommands];
    }, [projects, setActiveView]);

    const filteredCommands = useMemo(() => {
        if (!search) return allCommands;
        const lowerCaseSearch = search.toLowerCase();
        return allCommands.filter(cmd =>
            cmd.title.toLowerCase().includes(lowerCaseSearch) ||
            cmd.category.toLowerCase().includes(lowerCaseSearch) ||
            cmd.keywords?.toLowerCase().includes(lowerCaseSearch)
        );
    }, [search, allCommands]);

    useEffect(() => {
        setActiveIndex(0);
    }, [filteredCommands]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(i => (i + 1) % filteredCommands.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(i => (i - 1 + filteredCommands.length) % filteredCommands.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCommands[activeIndex]) {
                handleSelect(filteredCommands[activeIndex]);
            }
        }
    }, [filteredCommands, activeIndex]);


    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const handleSelect = (command: Command) => {
        command.action();
        onClose();
    };
    
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center pt-24" onClick={onClose}>
            <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl h-fit max-h-[60vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-3 border-b flex items-center gap-3">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search commands or projects..."
                        className="w-full bg-transparent focus:outline-none"
                    />
                </div>
                <div className="overflow-y-auto flex-grow">
                    {filteredCommands.length > 0 ? (
                        <ul>
                            {filteredCommands.map((cmd, index) => (
                                <li key={cmd.id}>
                                    <button
                                        onClick={() => handleSelect(cmd)}
                                        className={`w-full text-left p-3 flex items-center justify-between gap-3 ${index === activeIndex ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-400">{cmd.icon}</span>
                                            <span>{cmd.title}</span>
                                        </div>
                                        <span className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{cmd.category}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-slate-500 py-10">No results found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
