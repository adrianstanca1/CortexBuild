import React, { useState, useEffect } from 'react';
import { Project, RFI, User, Comment, Attachment } from '../../types';
import * as api from '../../api';
import { ChevronLeftIcon, PaperClipIcon, CalendarDaysIcon, UsersIcon, ClockIcon, TrashIcon } from '../Icons';
import DiffViewer from '../shared/DiffViewer';

interface RFIDetailScreenProps {
    rfiId: string;
    project: Project;
    goBack: () => void;
    currentUser: User;
}

const getStatusColor = (status: RFI['status']) => {
    switch (status) {
        case 'Open': return 'bg-red-100 text-red-800 border-2 border-red-300';
        case 'Closed': return 'bg-green-100 text-green-800 border-2 border-green-300';
        case 'Draft': return 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300';
        default: return 'bg-gray-100 text-gray-800 border-2 border-gray-300';
    }
};

const isRfiOverdue = (rfi: RFI): boolean => {
    if (rfi.status !== 'Open') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(rfi.dueDate) < today;
};

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-md ${isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
    >
        {label}
    </button>
);

const RFIDetailScreen: React.FC<RFIDetailScreenProps> = ({ rfiId, project, goBack, currentUser }) => {
    const [latestRfi, setLatestRfi] = useState<RFI | null>(null);
    const [allVersions, setAllVersions] = useState<RFI[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'details' | 'comparison'>('details');
    const [comparisonVersionId, setComparisonVersionId] = useState<string | null>(null);

    // States for new comment/answer
    const [newComment, setNewComment] = useState('');
    const [answer, setAnswer] = useState('');
    const [responseFiles, setResponseFiles] = useState<File[]>([]);
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    useEffect(() => {
        const loadRfiData = async () => {
            setIsLoading(true);
            const initialRfi = await api.fetchRFIById(rfiId);
            if (initialRfi) {
                const versions = await api.fetchRFIVersions(initialRfi.rfiNumber);
                setAllVersions(versions);
                const latest = versions[versions.length - 1];
                setLatestRfi(latest);
                // Pre-select the second to last version for comparison if it exists
                if (versions.length > 1) {
                    setComparisonVersionId(versions[versions.length - 2].id);
                }
            } else {
                setLatestRfi(null);
                setAllVersions([]);
            }
            setIsLoading(false);
        };
        loadRfiData();
    }, [rfiId]);
    
    const handleAddComment = async () => {
        if (!latestRfi || !newComment.trim()) return;
        const comment = await api.addCommentToRFI(latestRfi.id, newComment, currentUser);
        setLatestRfi(prev => prev ? { ...prev, comments: [...prev.comments, comment] } : null);
        setNewComment('');
    };

    const handleAnswerSubmit = async () => {
        if (!latestRfi || !answer.trim()) {
            alert("Please enter an answer before submitting.");
            return;
        }
        const attachmentsForApi: Attachment[] = await Promise.all(
            responseFiles.map(file => new Promise<Attachment>((resolve, reject) => {
                 const reader = new FileReader();
                reader.onload = (e) => {
                    resolve({ name: file.name, url: e.target?.result as string });
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            }))
        );

        const updatedRfi = await api.addAnswerToRFI(latestRfi.id, answer, attachmentsForApi, currentUser);
        if(updatedRfi) {
            setLatestRfi(updatedRfi);
        }
        setAnswer('');
        setResponseFiles([]);
    };

    const processFiles = (files: FileList) => {
        if (files) {
            setResponseFiles(prev => [...prev, ...Array.from(files)]);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            processFiles(event.target.files);
        }
        if (event.target) event.target.value = '';
    };

    const handleRemoveFile = (indexToRemove: number) => {
        setResponseFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(false); };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    };

    if (isLoading) {
        return <div className="text-center p-8">Loading RFI details...</div>;
    }

    if (!latestRfi) {
        return <div className="text-center p-8 text-red-500">RFI not found.</div>;
    }
    
    const comparisonRfi = allVersions.find(v => v.id === comparisonVersionId) || null;
    const overdue = isRfiOverdue(latestRfi);
    const canAnswer = (currentUser.role === 'company_admin' || currentUser.role === 'Project Manager');

    const renderComparisonView = () => {
        if (!comparisonRfi) {
            return <p className="text-center text-gray-500 p-8">Select a version to compare.</p>;
        }

        const attachmentsA = new Set(comparisonRfi.attachments.map(a => a.name));
        const attachmentsB = new Set(latestRfi.attachments.map(a => a.name));

        return (
            <div className="space-y-4">
                <div>
                    <h4 className="font-bold text-gray-800 mb-2">Question</h4>
                    <DiffViewer oldText={comparisonRfi.question} newText={latestRfi.question} />
                </div>
                <div>
                    <h4 className="font-bold text-gray-800 mb-2">Response</h4>
                    <DiffViewer oldText={comparisonRfi.response || ''} newText={latestRfi.response || ''} />
                </div>
                <div>
                    <h4 className="font-bold text-gray-800 mb-2">Attachments</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-md">
                             <h5 className="font-semibold text-sm mb-2">Version {comparisonRfi.version}</h5>
                             <ul className="list-disc list-inside text-sm space-y-1">
                                {comparisonRfi.attachments.map(att => <li key={att.name} className={!attachmentsB.has(att.name) ? 'text-red-600' : ''}>{att.name}</li>)}
                             </ul>
                        </div>
                         <div className="bg-gray-50 p-3 rounded-md">
                            <h5 className="font-semibold text-sm mb-2">Version {latestRfi.version} (Latest)</h5>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                {latestRfi.attachments.map(att => <li key={att.name} className={!attachmentsA.has(att.name) ? 'text-green-600' : ''}>{att.name}</li>)}
                             </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            <header className="bg-white p-4 flex items-center border-b mb-8">
                <button onClick={goBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 truncate" title={latestRfi.subject}>{latestRfi.rfiNumber}: {latestRfi.subject}</h1>
                    <p className="text-sm text-gray-500">{project.name}</p>
                </div>
            </header>
            
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                    <TabButton label="Details" isActive={activeTab === 'details'} onClick={() => setActiveTab('details')} />
                    <TabButton label="History & Comparison" isActive={activeTab === 'comparison'} onClick={() => setActiveTab('comparison')} />
                </div>
                <span className="text-sm font-semibold text-gray-500">Version: {latestRfi.version}</span>
            </div>

            <main className="flex-grow space-y-6">
                {activeTab === 'details' && (
                    <>
                        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <h3 className="font-bold text-lg text-gray-800 mb-2">Question</h3>
                                <p className="text-gray-600 whitespace-pre-wrap">{latestRfi.question}</p>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase">Status</p>
                                    <p className={`font-bold py-1 px-2 rounded-full inline-block text-xs mt-1 ${getStatusColor(latestRfi.status)}`}>{latestRfi.status}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1.5"><UsersIcon className="w-4 h-4"/>Assigned To</p>
                                    <p className="text-gray-800 font-semibold">{latestRfi.assignee}</p>
                                </div>
                                <div>
                                    <p className={`text-xs font-bold uppercase mb-1 flex items-center gap-1.5 ${overdue ? 'text-red-600' : 'text-gray-500'}`}>
                                        <CalendarDaysIcon className="w-4 h-4"/>Response Due
                                    </p>
                                    <p className={`font-semibold ${overdue ? 'text-red-600' : 'text-gray-800'}`}>
                                        {new Date(latestRfi.dueDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                            <h3 className="font-bold text-lg text-gray-800 mb-4">Official Response</h3>
                            {latestRfi.status === 'Closed' && latestRfi.response ? (
                                <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded-r-md">
                                    <p className="text-gray-700 whitespace-pre-wrap">{latestRfi.response}</p>
                                    <p className="text-xs text-gray-500 mt-2">Answered by {latestRfi.answeredBy}</p>
                                    {latestRfi.responseAttachments && latestRfi.responseAttachments.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="font-semibold text-sm text-gray-700 mb-2">Attachments:</h4>
                                            <ul className="space-y-2">
                                                {latestRfi.responseAttachments.map((att, index) => (
                                                    <li key={index} className="flex items-center gap-2">
                                                        <PaperClipIcon className="w-4 h-4 text-gray-500" />
                                                        <a href={att.url} className="text-sm text-blue-600 hover:underline">{att.name}</a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                canAnswer ? (
                                    <div>
                                        <textarea rows={4} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type the official response here..." className="w-full p-2 border border-gray-300 rounded-md" />
                                        <div className="mt-4">
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Attachments</label>
                                            <div onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop} className={`mt-2 flex justify-center rounded-lg border border-dashed px-6 py-10 transition-colors ${isDraggingOver ? 'border-blue-600 bg-blue-50' : 'border-gray-900/25'}`}>
                                                <div className="text-center">
                                                    <PaperClipIcon className="mx-auto h-12 w-12 text-gray-300" />
                                                    <div className="mt-4 flex text-sm text-gray-600"><label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 hover:text-blue-500"><span>Upload a file</span><input id="file-upload" type="file" className="sr-only" onChange={handleFileSelect} multiple /></label><p className="pl-1">or drag and drop</p></div>
                                                    <p className="text-xs text-gray-600">PDF, PNG, JPG up to 10MB</p>
                                                </div>
                                            </div>
                                            {responseFiles.length > 0 && (
                                                <div className="mt-4 space-y-2">
                                                    {responseFiles.map((file, index) => (
                                                        <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded-md text-sm">
                                                            <span className="font-medium text-gray-700 truncate">{file.name}</span>
                                                            <button onClick={() => handleRemoveFile(index)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right mt-4">
                                            <button onClick={handleAnswerSubmit} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700">Submit Answer & Close RFI</button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">Awaiting response from the assigned party.</p>
                                )
                            )}
                        </div>
                        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                            <h3 className="font-bold text-lg text-gray-800 mb-4">Comments ({latestRfi.comments.length})</h3>
                            {/* ... comment section ... */}
                        </div>
                    </>
                )}

                {activeTab === 'comparison' && (
                     <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <label htmlFor="comparison-version" className="font-semibold text-gray-700">Compare latest version with:</label>
                            <select 
                                id="comparison-version"
                                value={comparisonVersionId || ''}
                                onChange={(e) => setComparisonVersionId(e.target.value)}
                                className="p-2 border border-gray-300 rounded-md bg-white"
                            >
                                {allVersions.filter(v => v.id !== latestRfi.id).map(v => (
                                    <option key={v.id} value={v.id}>
                                        Version {v.version} ({new Date(v.history?.[v.history.length-1]?.timestamp || '').toLocaleDateString()})
                                    </option>
                                ))}
                            </select>
                        </div>
                        {renderComparisonView()}
                    </div>
                )}
            </main>
        </div>
    );
};

export default RFIDetailScreen;