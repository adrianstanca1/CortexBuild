import React, { useState, useEffect } from 'react';
// Fix: Corrected import paths to include file extensions.
import { Project, Document, User } from '../../types';
// Fix: Corrected import paths to include file extensions.
// Fix: Corrected the import path for the 'api' module.
import * as api from '../../api';
// Fix: Added .tsx extension to icon import
import { ChevronLeftIcon, PlusIcon, FileIcon } from '../Icons';

interface DocumentsScreenProps {
    project: Project;
    goBack: () => void;
    currentUser: User;
}

const DocumentsScreen: React.FC<DocumentsScreenProps> = ({ project, goBack, currentUser }) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const canCreate = ['company_admin', 'supervisor', 'super_admin'].includes(currentUser.role);

    useEffect(() => {
        const loadDocs = async () => {
            setIsLoading(true);
            const fetchedDocs = await api.fetchDocuments();
            setDocuments(fetchedDocs.filter(d => d.projectId === project.id));
            setIsLoading(false);
        };
        loadDocs();
    }, [project.id]);

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            {/* Header */}
            <header className="bg-white p-4 flex justify-between items-center border-b mb-8">
                <div className="flex items-center">
                    <button onClick={goBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                        <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
                        <p className="text-sm text-gray-500">{project.name}</p>
                    </div>
                </div>
                 {canCreate && (
                    <button className="bg-blue-600 text-white p-2.5 rounded-full shadow hover:bg-blue-700">
                        <PlusIcon className="w-6 h-6"/>
                    </button>
                 )}
            </header>

            <main className="flex-grow bg-white rounded-lg shadow-md border border-gray-100">
                {isLoading ? (
                    <p className="text-center text-slate-500 p-8">Loading documents...</p>
                ) : (
                    <ul className="divide-y divide-slate-200">
                        {documents.map(doc => (
                            <li key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <FileIcon className="w-8 h-8 text-blue-600" />
                                    <div>
                                        <p className="font-semibold text-gray-800">{doc.name}</p>
                                        <p className="text-xs text-slate-500">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            </li>
                        ))}
                    </ul>
                )}
            </main>
        </div>
    );
};

export default DocumentsScreen;