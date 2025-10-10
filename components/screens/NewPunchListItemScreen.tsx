import React, { useState, useRef } from 'react';
// Fix: Corrected import paths to include file extensions.
import { Project, User } from '../../types';
// Fix: Corrected import paths to include file extensions.
// Fix: Corrected the import path for the 'api' module.
import * as api from '../../api';
// Fix: Corrected import paths to include file extensions.
// Change: Swapped XMarkIcon for TrashIcon for photo removal UI.
import { ChevronLeftIcon, UsersIcon, MapPinIcon, CameraIcon, TrashIcon } from '../Icons';

interface NewPunchListItemScreenProps {
    project: Project;
    goBack: () => void;
    currentUser: User;
}

const NewPunchListItemScreen: React.FC<NewPunchListItemScreenProps> = ({ project, goBack, currentUser }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [assignee, setAssignee] = useState('');
    const [photos, setPhotos] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Change: Added state for drag-and-drop UI feedback.
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    // In a real app, this would be a more sophisticated list
    const possibleAssignees = ['Painting Sub', 'Flooring Sub', 'Plumbing Sub', 'Doors & Hardware', 'General Contractor'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !location || !assignee) {
            alert('Please fill in all required fields.');
            return;
        }
        
        const newItem = {
            projectId: project.id,
            title,
            description,
            location,
            status: 'Open' as const,
            assignee,
            photos,
        };
        
        await api.createPunchListItem(newItem, currentUser);
        alert('Punch list item created successfully!');
        goBack();
    };

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
        event.target.value = ''; // Reset file input
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
                    <h1 className="text-2xl font-bold text-gray-900">New Punch List Item</h1>
                    <p className="text-sm text-gray-500">{project.name}</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="flex-grow space-y-6">
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
                    <textarea
                        id="description"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="location" className="block text-sm font-bold text-gray-700 mb-1">
                            Location <span className="text-red-500">*</span>
                        </label>
                         <div className="relative">
                            <input
                                type="text"
                                id="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm"
                                required
                            />
                             <MapPinIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="assignee" className="block text-sm font-bold text-gray-700 mb-1">
                            Assignee <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                             <select
                                id="assignee"
                                value={assignee}
                                onChange={(e) => setAssignee(e.target.value)}
                                className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm appearance-none"
                                required
                            >
                                <option value="" disabled>Select an assignee</option>
                                {possibleAssignees.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                            <UsersIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>
                </div>
                
                {/* Change: Replaced the simple photo button with a rich drag-and-drop zone and improved previews. */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Photos</label>
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
                <button type="submit" onClick={handleSubmit} className="px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 font-bold">
                    Create Item
                </button>
            </footer>
        </div>
    );
};

export default NewPunchListItemScreen;
