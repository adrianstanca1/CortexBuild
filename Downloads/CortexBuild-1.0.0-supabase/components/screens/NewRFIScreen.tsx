import React, { useState, useRef } from 'react';
// Fix: Added .ts extension to import
import { Project, User, Attachment } from '../../types';
// Fix: Corrected the import path for the 'api' module.
import * as api from '../../api';
// Fix: Added .tsx extension to import
import { ChevronLeftIcon, CalendarDaysIcon, UsersIcon, PaperClipIcon, SparklesIcon, ArrowPathIcon, TrashIcon } from '../Icons';

interface NewRFIScreenProps {
    project: Project;
    goBack: () => void;
    currentUser: User;
}

interface AIRFISuggestion {
    suggestedAssignee: string;
    suggestedDueDate: string;
}

const NewRFIScreen: React.FC<NewRFIScreenProps> = ({ project, goBack, currentUser }) => {
    const [subject, setSubject] = useState('');
    const [question, setQuestion] = useState('');
    const [assignee, setAssignee] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isSuggesting, setIsSuggesting] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<AIRFISuggestion | null>(null);
    const [suggestionError, setSuggestionError] = useState<string | null>(null);
    
    // In a real app, this would be a more sophisticated list
    const possibleAssignees = ['Architect Team', 'Structural Engineer', 'MEP Consultant', 'General Contractor'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !question || !assignee || !dueDate) {
            alert('Please fill in all required fields.');
            return;
        }

        const attachmentsForApi: Attachment[] = await Promise.all(
            attachments.map(file => new Promise<Attachment>((resolve, reject) => {
                 const reader = new FileReader();
                reader.onload = (e) => {
                    resolve({ name: file.name, url: e.target?.result as string });
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            }))
        );
        
        const newRFI = {
            projectId: project.id,
            subject,
            question,
            status: 'Open' as const,
            assignee,
            dueDate,
            attachments: attachmentsForApi,
        };
        
        await api.createRFI(newRFI, currentUser);
        alert('RFI created successfully!');
        goBack();
    };

    const handleGetAISuggestions = async () => {
        setSuggestionError(null);
        if (!subject.trim() && !question.trim()) {
            setSuggestionError("Please enter a subject or question to get suggestions.");
            return;
        }
        setIsSuggesting(true);
        setAiSuggestion(null);
        try {
            const suggestions = await api.getAIRFISuggestions(subject, question, possibleAssignees);
            if (suggestions) {
                setAiSuggestion(suggestions);
            } else {
                setSuggestionError("AI could not generate suggestions for this RFI.");
            }
        } catch (error) {
            console.error("Failed to get AI suggestions:", error);
            setSuggestionError("Could not get suggestions at this time.");
        } finally {
            setIsSuggesting(false);
        }
    };
    
    const handleApplyAllSuggestions = () => {
        if (!aiSuggestion) return;
        if (aiSuggestion.suggestedAssignee) {
            setAssignee(aiSuggestion.suggestedAssignee);
        }
        if (aiSuggestion.suggestedDueDate) {
            setDueDate(aiSuggestion.suggestedDueDate);
        }
    };

    const processFiles = (files: FileList) => {
        if (files) {
            setAttachments(prev => [...prev, ...Array.from(files)]);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            processFiles(event.target.files);
        }
        if(event.target) event.target.value = '';
    };

    const handleRemoveFile = (indexToRemove: number) => {
        setAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
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


    return (
        <div className="flex flex-col h-full max-w-2xl mx-auto">
            <header className="bg-white p-4 flex items-center border-b mb-8">
                <button onClick={goBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">New RFI</h1>
                    <p className="text-sm text-gray-500">{project.name}</p>
                </div>
            </header>

            <form id="rfi-form" onSubmit={handleSubmit} className="flex-grow space-y-6">
                <div>
                    <label htmlFor="subject" className="block text-sm font-bold text-gray-700 mb-1">
                        Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="question" className="block text-sm font-bold text-gray-700 mb-1">
                        Question <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="question"
                        rows={6}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        required
                    />
                </div>
                
                <div className="mt-2">
                    <button
                        type="button"
                        onClick={handleGetAISuggestions}
                        disabled={isSuggesting || (!subject.trim() && !question.trim())}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSuggesting ? <ArrowPathIcon className="w-5 h-5 animate-spin"/> : <SparklesIcon className="w-5 h-5"/>}
                        Get AI Suggestions
                    </button>
                    {suggestionError && <p className="text-xs text-center text-red-600 mt-2">{suggestionError}</p>}
                </div>

                {aiSuggestion && !isSuggesting && (
                    <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg text-center transition-opacity duration-500">
                        <h4 className="font-bold text-purple-800 flex items-center justify-center gap-2">
                            <SparklesIcon className="w-5 h-5"/>
                            AI Suggestions Ready!
                        </h4>
                        <p className="text-sm text-purple-700 mt-1 mb-3">Apply all suggestions with one click, or apply them individually below.</p>
                        <button
                            type="button"
                            onClick={handleApplyAllSuggestions}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                        >
                            Apply All Suggestions
                        </button>
                    </div>
                )}


                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="assignee" className="block text-sm font-bold text-gray-700 mb-1">
                            Assigned To <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                             <select
                                id="assignee"
                                value={assignee}
                                onChange={(e) => setAssignee(e.target.value)}
                                className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm appearance-none"
                                required
                            >
                                <option value="" disabled>Select a team or person</option>
                                {possibleAssignees.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                            <UsersIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                        {aiSuggestion?.suggestedAssignee && (
                            <button
                                type="button"
                                onClick={() => setAssignee(aiSuggestion.suggestedAssignee)}
                                className="text-xs text-purple-600 hover:text-purple-800 font-semibold mt-1.5 flex items-center gap-1"
                            >
                                <SparklesIcon className="w-3.5 h-3.5"/>
                                Apply Suggestion: {aiSuggestion.suggestedAssignee}
                            </button>
                        )}
                    </div>

                    <div>
                        <label htmlFor="dueDate" className="block text-sm font-bold text-gray-700 mb-1">
                            Response Due <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                id="dueDate"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm"
                                required
                            />
                             <CalendarDaysIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                        {aiSuggestion?.suggestedDueDate && (
                            <button
                                type="button"
                                onClick={() => setDueDate(aiSuggestion.suggestedDueDate)}
                                className="text-xs text-purple-600 hover:text-purple-800 font-semibold mt-1.5 flex items-center gap-1"
                            >
                                <SparklesIcon className="w-3.5 h-3.5"/>
                                Apply Suggestion: {new Date(aiSuggestion.suggestedDueDate + 'T00:00:00').toLocaleDateString()}
                            </button>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Attachments</label>
                    <div
                        onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`mt-2 flex justify-center rounded-lg border border-dashed px-6 py-10 transition-colors cursor-pointer ${
                            isDraggingOver ? 'border-blue-600 bg-blue-50' : 'border-gray-900/25 hover:border-blue-500'
                        }`}
                    >
                        <div className="text-center">
                            <PaperClipIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                            <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                <p className="pl-1">
                                    <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                                </p>
                            </div>
                            <p className="text-xs leading-5 text-gray-600">PDF, PNG, JPG up to 10MB</p>
                        </div>
                    </div>

                    {attachments.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {attachments.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded-md text-sm">
                                    <span className="font-medium text-gray-700 truncate">{file.name}</span>
                                    <button type="button" onClick={() => handleRemoveFile(index)} className="p-1 text-gray-400 hover:text-red-500">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" multiple />
                </div>
            </form>

            <footer className="bg-white p-4 mt-8 border-t flex justify-end items-center gap-4">
                <button type="button" onClick={goBack} className="px-6 py-3 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 font-bold">
                    Cancel
                </button>
                <button type="submit" form="rfi-form" className="px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 font-bold">
                    Submit RFI
                </button>
            </footer>
        </div>
    );
};

export default NewRFIScreen;