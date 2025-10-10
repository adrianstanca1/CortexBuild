import React, { useState, useEffect, useMemo } from 'react';
import { Project, Drawing, Screen, User } from '../../types';
import * as api from '../../api';
import { ChevronLeftIcon, PlusIcon, DocumentDuplicateIcon, MagnifyingGlassIcon, SparklesIcon, ChevronDownIcon } from '../Icons';
import NewDrawingModal from '../modals/NewDrawingModal';
// Fix: Imported the 'usePermissions' hook.
import { usePermissions } from '../../hooks/usePermissions';

interface DrawingsScreenProps {
    project: Project;
    goBack: () => void;
    navigateTo: (screen: Screen, params?: any) => void;
    currentUser: User;
}

interface DrawingGroup {
    drawingNumber: string;
    title: string;
    latest: Drawing;
    history: Drawing[];
}

const DrawingsScreen: React.FC<DrawingsScreenProps> = ({ project, goBack, navigateTo, currentUser }) => {
    const [allDrawings, setAllDrawings] = useState<Drawing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [expandedHistories, setExpandedHistories] = useState<Set<string>>(new Set());
    const [compareSelection, setCompareSelection] = useState<{[key: string]: string[]}>({});
    
    const { can } = usePermissions(currentUser);
    const canCreate = can('create', 'drawing');

    useEffect(() => {
        const loadDrawings = async () => {
            setIsLoading(true);
            const fetchedDrawings = await api.fetchDrawings();
            setAllDrawings(fetchedDrawings.filter(d => d.projectId === project.id));
            setIsLoading(false);
        };
        loadDrawings();
    }, [project.id]);

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        allDrawings.forEach(d => d.tags.forEach(t => tags.add(t)));
        return Array.from(tags).sort();
    }, [allDrawings]);

    const drawingGroups = useMemo((): DrawingGroup[] => {
        const groups: { [key: string]: Drawing[] } = {};
        allDrawings.forEach(d => {
            if (!groups[d.drawingNumber]) {
                groups[d.drawingNumber] = [];
            }
            groups[d.drawingNumber].push(d);
        });

        return Object.values(groups)
            .map(drawings => {
                const sorted = [...drawings].sort((a, b) => b.revision - a.revision);
                return {
                    drawingNumber: sorted[0].drawingNumber,
                    title: sorted[0].title,
                    latest: sorted[0],
                    history: sorted,
                };
            })
            .sort((a, b) => a.drawingNumber.localeCompare(b.drawingNumber));
    }, [allDrawings]);

    const filteredDrawingGroups = useMemo(() => {
        return drawingGroups.filter(group => {
            const query = searchQuery.toLowerCase();
            const matchesQuery = group.drawingNumber.toLowerCase().includes(query) || group.title.toLowerCase().includes(query);
            const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => group.latest.tags.includes(tag));
            return matchesQuery && matchesTags;
        });
    }, [drawingGroups, searchQuery, selectedTags]);

    const handleUploadSubmit = async (drawingData: { drawingNumber: string; title: string; date: string; file: File }) => {
        try {
            const newDrawing = await api.createDrawing(project.id, drawingData, currentUser);
            // Instead of just adding, we should refetch or cleverly update the state
            // For simplicity in mock environment, let's just add it. The grouping will handle it.
            setAllDrawings(prevDrawings => [newDrawing, ...prevDrawings]);
            setIsUploadModalOpen(false);
        } catch (error) {
            console.error("Failed to create drawing:", error);
            alert("Failed to upload drawing. Please try again.");
        }
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const toggleHistory = (drawingNumber: string) => {
        setExpandedHistories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(drawingNumber)) {
                newSet.delete(drawingNumber);
            } else {
                newSet.add(drawingNumber);
            }
            return newSet;
        });
    };
    
    const handleCompareSelect = (drawingNumber: string, drawingId: string) => {
        setCompareSelection(prev => {
            const currentSelection = prev[drawingNumber] || [];
            let newSelection;
            if (currentSelection.includes(drawingId)) {
                newSelection = currentSelection.filter(id => id !== drawingId);
            } else {
                newSelection = [...currentSelection, drawingId].slice(-2); // Keep only last 2
            }
            return { ...prev, [drawingNumber]: newSelection };
        });
    };

    const handleCompare = (drawingNumber: string) => {
        const selection = compareSelection[drawingNumber];
        if (selection && selection.length === 2) {
            const drawingA = allDrawings.find(d => d.id === selection[0]);
            const drawingB = allDrawings.find(d => d.id === selection[1]);
            if (drawingA && drawingB) {
                // Ensure A is the older revision
                const [older, newer] = [drawingA, drawingB].sort((a,b) => a.revision - b.revision);
                navigateTo('drawing-comparison', { drawingA: older, drawingB: newer });
            }
        }
    };

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto">
            <header className="bg-white p-4 flex justify-between items-center border-b mb-8">
                <div className="flex items-center">
                    <button onClick={goBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                        <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Drawings</h1>
                        <p className="text-sm text-gray-500">{project.name}</p>
                    </div>
                </div>
                {canCreate && (
                    <button onClick={() => setIsUploadModalOpen(true)} className="bg-blue-600 text-white p-2.5 rounded-full shadow hover:bg-blue-700">
                        <PlusIcon className="w-6 h-6"/>
                    </button>
                )}
            </header>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                <div className="relative mb-4">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                    <input 
                        type="text" 
                        placeholder="Search by drawing number or title..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full p-2 pl-10 border border-gray-300 rounded-md"
                    />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-purple-500"/> AI Generated Tags</h3>
                    <div className="flex flex-wrap gap-2">
                        {allTags.map(tag => (
                            <button key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${selectedTags.includes(tag) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-500'}`}>
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="flex-grow bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                {isLoading ? (
                    <p className="text-center text-slate-500 p-8">Loading drawings...</p>
                ) : (
                    <ul className="divide-y divide-slate-200">
                        {filteredDrawingGroups.map(group => (
                             <li key={group.drawingNumber}>
                                <div onClick={() => navigateTo('plans', { url: group.latest.url, title: `${group.latest.drawingNumber} - ${group.latest.title}` })} className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <DocumentDuplicateIcon className="w-8 h-8 text-fuchsia-500 flex-shrink-0" />
                                        <div>
                                            <p className="font-bold text-gray-800">{group.drawingNumber} - {group.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Latest Rev: {group.latest.revision}</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {group.latest.tags.map(tag => <span key={tag} className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-gray-200 text-gray-700">{tag}</span>)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); toggleHistory(group.drawingNumber); }} className="p-2 rounded-full hover:bg-gray-200">
                                        <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${expandedHistories.has(group.drawingNumber) ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                                {expandedHistories.has(group.drawingNumber) && (
                                    <div className="pl-16 pr-4 pb-4 bg-slate-50">
                                        <h4 className="text-sm font-bold text-gray-600 mb-2 pt-2">Version History</h4>
                                        <ul className="space-y-2">
                                            {group.history.map(d => (
                                                <li key={d.id} className="p-2 rounded-md bg-white border flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <input type="checkbox"
                                                            checked={(compareSelection[d.drawingNumber] || []).includes(d.id)}
                                                            onChange={() => handleCompareSelect(d.drawingNumber, d.id)}
                                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                         />
                                                        <span className="font-semibold text-sm">Rev {d.revision}</span>
                                                        <span className="text-xs text-gray-500">({d.date})</span>
                                                    </div>
                                                    <button onClick={() => navigateTo('plans', { url: d.url, title: `${d.drawingNumber} - ${d.title}` })} className="text-xs font-semibold text-blue-600 hover:underline">View</button>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="mt-3 text-right">
                                             <button
                                                onClick={() => handleCompare(group.drawingNumber)}
                                                disabled={(compareSelection[group.drawingNumber] || []).length !== 2}
                                                className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-md text-sm disabled:bg-gray-400"
                                             >Compare Selected</button>
                                        </div>
                                    </div>
                                )}
                             </li>
                        ))}
                    </ul>
                )}
            </main>

            {isUploadModalOpen && (
                <NewDrawingModal
                    project={project}
                    onClose={() => setIsUploadModalOpen(false)}
                    onSubmit={handleUploadSubmit}
                />
            )}
        </div>
    );
};

export default DrawingsScreen;