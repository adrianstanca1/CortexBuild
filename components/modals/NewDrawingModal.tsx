import React, { useState } from 'react';
import { Project } from '../../types';
import { XMarkIcon, DocumentPlusIcon, SparklesIcon } from '../Icons';

interface NewDrawingModalProps {
    project: Project;
    onClose: () => void;
    onSubmit: (drawingData: { drawingNumber: string; title: string; date: string; file: File }) => void;
}

const NewDrawingModal: React.FC<NewDrawingModalProps> = ({ project, onClose, onSubmit }) => {
    const [drawingNumber, setDrawingNumber] = useState('');
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!drawingNumber || !title || !date || !file) {
            setError('Please fill out all fields and select a file.');
            return;
        }
        setError('');
        onSubmit({ drawingNumber, title, date, file });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };
    
    const applyTemplate = (type: 'arch' | 'struct' | 'mep') => {
        const nextNumber = '101'; // Simplified logic
        switch (type) {
            case 'arch':
                setDrawingNumber(`A-${nextNumber}`);
                setTitle('Architectural Floor Plan - Level ');
                break;
            case 'struct':
                setDrawingNumber(`S-${nextNumber}`);
                setTitle('Structural Framing Plan - Level ');
                break;
            case 'mep':
                setDrawingNumber(`M-${nextNumber}`);
                setTitle('Mechanical Plan - Level ');
                break;
        }
    };


    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Upload New Drawing</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                        <XMarkIcon className="w-6 h-6 text-gray-600" />
                    </button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        
                        <div>
                            <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><SparklesIcon className="w-4 h-4 text-purple-500"/> Use a Template</h3>
                            <div className="grid grid-cols-3 gap-2">
                                <button type="button" onClick={() => applyTemplate('arch')} className="p-2 text-sm border rounded hover:bg-gray-100">Architectural</button>
                                <button type="button" onClick={() => applyTemplate('struct')} className="p-2 text-sm border rounded hover:bg-gray-100">Structural</button>
                                <button type="button" onClick={() => applyTemplate('mep')} className="p-2 text-sm border rounded hover:bg-gray-100">MEP</button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="dwg-number" className="block text-sm font-bold text-gray-700 mb-1">Drawing Number</label>
                            <input type="text" id="dwg-number" value={drawingNumber} onChange={e => setDrawingNumber(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" required placeholder="e.g. A-101" />
                            <p className="text-xs text-gray-500 mt-1">If this number exists, a new revision will be created.</p>
                        </div>
                        <div>
                            <label htmlFor="dwg-title" className="block text-sm font-bold text-gray-700 mb-1">Drawing Title</label>
                            <input type="text" id="dwg-title" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="dwg-date" className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                                <input type="date" id="dwg-date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" required />
                            </div>
                        </div>
                        <div>
                             <label className="block text-sm font-bold text-gray-700 mb-1">PDF File</label>
                             <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                                <div className="text-center">
                                    <DocumentPlusIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                                    <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500">
                                            <span>Upload a file</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf" />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs leading-5 text-gray-600">PDF up to 10MB</p>
                                    {file && <p className="text-sm text-gray-800 font-semibold mt-2">{file.name}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <footer className="p-4 bg-gray-50 border-t flex justify-end items-center gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded font-semibold">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded font-semibold">Upload</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default NewDrawingModal;