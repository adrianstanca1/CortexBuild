import React, { useState, useRef, useEffect, useMemo } from 'react';
// Fix: Added .ts extension to import
import { Project, User, UserRole, Task } from '../../types';
// Fix: Added .ts extension to import
import * as api from '../../api';
// Fix: Added .tsx extension to import
// Change: Swapped XMarkIcon for TrashIcon for photo removal UI.
import { ChevronLeftIcon, CalendarDaysIcon, UsersIcon, CameraIcon, TrashIcon, SparklesIcon, ArrowPathIcon, AlertTriangleIcon } from '../Icons';

interface NewTaskScreenProps {
    project: Project;
    goBack: () => void;
    currentUser: User;
}

const ROLES_AVAILABLE_FOR_ASSIGNMENT: UserRole[] = ['Foreman', 'operative'];

interface AITaskSuggestion {
    suggestedAssigneeIds: string[];
    suggestedDueDate: string;
    photosRecommended: boolean;
}

const NewTaskScreen: React.FC<NewTaskScreenProps> = ({ project, goBack, currentUser }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignmentValue, setAssignmentValue] = useState(''); // e.g., "user:user-id" or "role:operative"
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState<Task['priority']>('Medium');
    const [photos, setPhotos] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<AITaskSuggestion | null>(null);
    const [suggestionError, setSuggestionError] = useState<string | null>(null);

    // Change: Added state for drag-and-drop UI feedback.
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    useEffect(() => {
        const loadUsers = async () => {
            const users = await api.fetchUsersByCompany(currentUser.companyId);
            setAllUsers(users);
        };
        loadUsers();
    }, [currentUser.companyId]);
    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!title || !assignmentValue || !dueDate) {
            alert('Please fill in all required fields (Title, Assignee/Role, Due Date).');
            return;
        }

        const [type, value] = assignmentValue.split(':');
        
        const taskData: any = {
            projectId: project.id,
            title,
            description,
            status: 'To Do' as const,
            dueDate,
            priority,
            attachments: photos.map((photoUrl, index) => ({ name: `photo_${index + 1}.jpg`, url: photoUrl })),
        };

        if (type === 'user') {
            taskData.assignee = allUsers.find(u => u.id === value)?.name;
        } else if (type === 'role') {
            taskData.targetRoles = [value as UserRole];
        } else {
            alert('Invalid assignee or role.');
            return;
        }

        await api.createTask(taskData, currentUser);
        alert('Task created successfully!');
        goBack();
    };
    
    const handleGetAISuggestions = async () => {
        setSuggestionError(null);
        if (!description.trim()) {
            setSuggestionError("Please enter a description to get suggestions.");
            return;
        }
        setIsSuggesting(true);
        setAiSuggestion(null);
        try {
            const suggestions = await api.getAITaskSuggestions(description, allUsers);
            if (suggestions) {
                setAiSuggestion(suggestions);
            } else {
                setSuggestionError("AI could not generate suggestions for this task.");
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

        if (aiSuggestion.suggestedAssigneeIds && aiSuggestion.suggestedAssigneeIds.length > 0) {
            setAssignmentValue(`user:${aiSuggestion.suggestedAssigneeIds[0]}`);
        }
        if (aiSuggestion.suggestedDueDate) {
            setDueDate(aiSuggestion.suggestedDueDate);
        }
    };

    const { suggestedUsers, otherUsers } = useMemo(() => {
        const suggestedIds = new Set(aiSuggestion?.suggestedAssigneeIds || []);
        
        if (suggestedIds.size === 0) {
            return { suggestedUsers: [], otherUsers: allUsers };
        }
        
        const suggested: User[] = [];
        const others: User[] = [];
        
        allUsers.forEach(user => {
            if (suggestedIds.has(user.id)) {
                suggested.push(user);
            } else {
                others.push(user);
            }
        });

        // Sort suggested users based on the order from the AI suggestion
        const idOrder = aiSuggestion?.suggestedAssigneeIds || [];
        suggested.sort((a, b) => idOrder.indexOf(a.id) - idOrder.indexOf(b.id));

        return { suggestedUsers: suggested, otherUsers: others };
    }, [allUsers, aiSuggestion]);
    
    // Change: Extracted file processing logic to handle both click and drop.
    const processFiles = (files: FileList) => {
        if (files) {
            Array.from(files).forEach((file: File) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (e.target?.result) {
                        setPhotos(prev => [...prev, e.target!.result as string]);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            processFiles(event.target.files);
        }
        event.target.value = ''; // Reset file input to allow re-selection of the same file
    };
    
    const handleAddPhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemovePhoto = (indexToRemove: number) => {
        setPhotos(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    // Change: Added drag and drop event handlers.
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation(); // Necessary to allow dropping
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            processFiles(files);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-2xl mx-auto">
            <header className="bg-white p-4 flex items-center border-b mb-8">
                <button onClick={goBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">New Task</h1>
                    <p className="text-sm text-gray-500">{project.name}</p>
                </div>
            </header>

            <form id="new-task-form" onSubmit={handleSubmit} className="flex-grow space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-1">
                        Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-1">
                        Description
                    </label>
                    <div className="relative">
                        <textarea
                            id="description"
                            rows={5}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            placeholder="e.g., 'Install drywall on the 3rd floor, east wing. Use fire-rated board...'"
                        />
                         {aiSuggestion && (
                            <div title="AI suggestions are available for this description" className="absolute top-2 right-2 p-1 bg-purple-100 rounded-full">
                                <SparklesIcon className="w-5 h-5 text-purple-600" />
                            </div>
                        )}
                    </div>
                    <div className="mt-2">
                        <button
                            type="button"
                            onClick={handleGetAISuggestions}
                            disabled={isSuggesting || !description.trim()}
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
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                            >
                                Apply All Suggestions
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="assignee" className="block text-sm font-bold text-gray-700 mb-1">
                            Assignee / Role <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                             <select
                                id="assignee"
                                value={assignmentValue}
                                onChange={(e) => setAssignmentValue(e.target.value)}
                                className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm appearance-none"
                                required
                            >
                                <option value="" disabled>Select assignment</option>
                                <optgroup label="Roles">
                                    {ROLES_AVAILABLE_FOR_ASSIGNMENT.map(role => (
                                        <option key={role} value={`role:${role}`}>
                                            All {role}s
                                        </option>
                                    ))}
                                </optgroup>
                                {suggestedUsers.length > 0 && (
                                    <optgroup label="✨ Suggested Assignees">
                                        {suggestedUsers.map(user => (
                                            <option key={user.id} value={`user:${user.id}`}>
                                                {user.name} ({user.role})
                                            </option>
                                        ))}
                                    </optgroup>
                                )}
                                <optgroup label={suggestedUsers.length > 0 ? "Other Users" : "Users"}>
                                    {otherUsers.map(user => (
                                        <option key={user.id} value={`user:${user.id}`}>
                                            {user.name} ({user.role})
                                        </option>
                                    ))}
                                </optgroup>
                            </select>
                            <UsersIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                         {aiSuggestion?.suggestedAssigneeIds && aiSuggestion.suggestedAssigneeIds.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setAssignmentValue(`user:${aiSuggestion.suggestedAssigneeIds[0]}`)}
                                className="text-xs text-purple-600 hover:text-purple-800 font-semibold mt-1.5 flex items-center gap-1"
                            >
                                <SparklesIcon className="w-3.5 h-3.5"/>
                                Apply Suggestion: {allUsers.find(u => u.id === aiSuggestion.suggestedAssigneeIds[0])?.name}
                            </button>
                        )}
                    </div>

                    <div>
                        <label htmlFor="dueDate" className="block text-sm font-bold text-gray-700 mb-1">
                            Due Date <span className="text-red-500">*</span>
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

                    <div>
                        <label htmlFor="priority" className="block text-sm font-bold text-gray-700 mb-1">
                            Priority
                        </label>
                        <div className="relative">
                            <select
                                id="priority"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as Task['priority'])}
                                className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm appearance-none"
                                required
                            >
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                            <AlertTriangleIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>
                </div>

                {/* Change: Replaced the simple photo button with a rich drag-and-drop zone and improved previews. */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Photos</label>
                    {aiSuggestion?.photosRecommended && (
                        <div className="mb-2 p-2 bg-purple-50 border-l-4 border-purple-400 text-sm text-purple-800 rounded-r-md">
                            <p><SparklesIcon className="w-4 h-4 inline mr-1"/> AI suggests adding photos for this task.</p>
                        </div>
                    )}
                    <div
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={handleAddPhotoClick}
                        className={`mt-2 flex justify-center rounded-lg border border-dashed px-6 py-10 transition-colors ${
                            isDraggingOver ? 'border-blue-600 bg-blue-50' : 'border-gray-900/25 hover:border-blue-500'
                        } cursor-pointer`}
                    >
                        <div className="text-center">
                            <CameraIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                            <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                <p className="pl-1">
                                    <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                                </p>
                            </div>
                            <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
                        </div>
                    </div>

                    {photos.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {photos.map((photo, index) => (
                                <div key={index} className="relative group">
                                    <img src={photo} alt={`upload-preview-${index}`} className="w-full h-28 object-cover rounded-md" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                                        <button 
                                            type="button"
                                            onClick={() => handleRemovePhoto(index)}
                                            className="text-white rounded-full p-1.5 bg-black/50 hover:bg-red-500 transition-colors"
                                            aria-label="Remove photo"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*"
                        multiple
                    />
                </div>
            </form>
            
            <footer className="bg-white p-4 mt-8 border-t flex justify-end items-center gap-4">
                <button type="button" onClick={goBack} className="px-6 py-3 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 font-bold">
                    Cancel
                </button>
                <button type="submit" form="new-task-form" className="px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 font-bold">
                    Create Task
                </button>
            </footer>
        </div>
    );
};

export default NewTaskScreen;