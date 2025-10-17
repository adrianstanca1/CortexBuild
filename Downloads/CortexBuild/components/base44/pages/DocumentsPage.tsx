/**
 * Documents Page - Connected to CortexBuild API
 * Version: 1.1.0 GOLDEN
 */

import React, { useState, useEffect } from 'react';
import { CreateDocumentModal } from '../modals/CreateDocumentModal';

interface Document {
    id: number;
    name: string;
    file_type?: string;
    file_size?: number;
    project_name?: string;
    uploaded_by_name?: string;
    created_at?: string;
    category?: string;
}

export const DocumentsPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, [searchQuery, typeFilter]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ page: '1', limit: '50' });
            if (searchQuery) params.append('search', searchQuery);
            if (typeFilter !== 'all') params.append('category', typeFilter);

            const response = await fetch(`/api/documents?${params}`);
            const data = await response.json();

            if (data.success) {
                setDocuments(data.data);
            } else {
                setError(data.error);
            }
        } catch (err: any) {
            setError(err.message);
            setDocuments(mockDocuments);
        } finally {
            setLoading(false);
        }
    };

    const mockDocuments: Document[] = [
        {
            id: '1',
            name: 'Project Blueprint - Phase 1.pdf',
            type: 'pdf',
            size: '2.4 MB',
            project: 'Downtown Office Complex',
            uploadedBy: 'Adrian Stanca',
            uploadDate: 'Dec 1, 2024',
            category: 'blueprints'
        },
        {
            id: '2',
            name: 'Safety Inspection Report.docx',
            type: 'docx',
            size: '156 KB',
            project: 'Riverside Luxury Apartments',
            uploadedBy: 'John Smith',
            uploadDate: 'Dec 5, 2024',
            category: 'reports'
        },
        {
            id: '3',
            name: 'Material Specifications.xlsx',
            type: 'xlsx',
            size: '89 KB',
            project: 'Manufacturing Facility Expansion',
            uploadedBy: 'Sarah Johnson',
            uploadDate: 'Dec 10, 2024',
            category: 'specifications'
        }
    ];

    const getFileIcon = (type: string) => {
        const icons: Record<string, string> = {
            'pdf': '📄',
            'docx': '📝',
            'xlsx': '📊',
            'jpg': '🖼️',
            'png': '🖼️',
            'zip': '📦'
        };
        return icons[type] || '📁';
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Documents</h1>
                        <p className="text-gray-600">Manage project files and documents</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Search */}
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search documents..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                            />
                        </div>

                        {/* Type Filter */}
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Types</option>
                            <option value="pdf">PDF</option>
                            <option value="docx">Word</option>
                            <option value="xlsx">Excel</option>
                            <option value="images">Images</option>
                        </select>

                        {/* Upload Button */}
                        <button
                            type="button"
                            onClick={() => setShowUploadModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span>Upload Document</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map((doc) => (
                    <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-3 mb-4">
                            <div className="text-4xl">{getFileIcon(doc.type)}</div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-gray-900 truncate mb-1">{doc.name}</h3>
                                <p className="text-xs text-gray-500">{doc.size}</p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="text-sm">
                                <span className="text-gray-600">Project: </span>
                                <span className="font-medium text-gray-900">{doc.project}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-gray-600">Category: </span>
                                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    {doc.category}
                                </span>
                            </div>
                            <div className="text-xs text-gray-500">
                                Uploaded by {doc.uploadedBy} on {doc.uploadDate}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                                Download
                            </button>
                            <button
                                type="button"
                                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Document Modal */}
            <CreateDocumentModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onSuccess={() => {
                    setShowUploadModal(false);
                    fetchDocuments();
                }}
            />
        </div>
    );
};

