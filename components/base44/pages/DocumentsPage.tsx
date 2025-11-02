/**
 * Documents Page - Connected to CortexBuild API
 * Version: 1.1.0 GOLDEN
 */

import React, { useState, useEffect, useCallback } from 'react';
import { CreateDocumentModal } from '../modals/CreateDocumentModal';

interface Document {
    id: number | string;
    name: string;
    type: string;
    sizeLabel: string;
    project: string;
    category: string;
    uploadedBy: string;
    uploadDate?: string;
}

const formatDate = (value?: string | null) => {
    if (!value) return undefined;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value ?? undefined;
    return parsed.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

const formatFileSize = (size?: number | string | null): string => {
    if (size === undefined || size === null) return 'Unknown size';
    if (typeof size === 'string') {
        const numeric = Number(size);
        if (Number.isFinite(numeric)) {
            return formatFileSize(numeric);
        }
        return size;
    }

    if (size === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const exponent = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
    const value = size / 1024 ** exponent;
    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[exponent]}`;
};

const normalizeDocument = (raw: any): Document => {
    const type = (raw.type ?? raw.file_type ?? 'file').toString().toLowerCase();

    return {
        id: raw.id ?? raw.document_id ?? `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: raw.name ?? raw.title ?? 'Untitled document',
        type,
        sizeLabel: formatFileSize(raw.size ?? raw.file_size),
        project: raw.project ?? raw.project_name ?? raw.projectName ?? 'General',
        category: raw.category ?? raw.folder ?? 'uncategorized',
        uploadedBy: raw.uploadedBy ?? raw.uploaded_by_name ?? raw.uploaded_by ?? 'Unknown user',
        uploadDate: formatDate(raw.uploadDate ?? raw.upload_date ?? raw.created_at)
    };
};

const MOCK_DOCUMENTS: Document[] = [
    {
        id: 1,
        name: 'Project Blueprint - Phase 1.pdf',
        type: 'pdf',
        sizeLabel: '2.4 MB',
        project: 'Downtown Office Complex',
        uploadedBy: 'Adrian Stanca',
        uploadDate: '01 Nov 2024',
        category: 'blueprints'
    },
    {
        id: 2,
        name: 'Safety Inspection Report.docx',
        type: 'docx',
        sizeLabel: '156 KB',
        project: 'Riverside Luxury Apartments',
        uploadedBy: 'John Smith',
        uploadDate: '05 Dec 2024',
        category: 'reports'
    },
    {
        id: 3,
        name: 'Material Specifications.xlsx',
        type: 'xlsx',
        sizeLabel: '89 KB',
        project: 'Manufacturing Facility Expansion',
        uploadedBy: 'Sarah Johnson',
        uploadDate: '10 Dec 2024',
        category: 'specifications'
    }
];

export const DocumentsPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [documents, setDocuments] = useState<Document[]>(MOCK_DOCUMENTS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);

    const fetchDocuments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const params = new URLSearchParams({ page: '1', limit: '50' });
            if (searchQuery) params.append('search', searchQuery);
            if (typeFilter !== 'all') params.append('category', typeFilter);

            const response = await fetch(`/api/documents?${params}`);
            const data = await response.json();

            if (data.success) {
                const normalized = Array.isArray(data.data) ? data.data.map(normalizeDocument) : [];
                setDocuments(normalized.length > 0 ? normalized : MOCK_DOCUMENTS);
                if (!normalized.length) {
                    setError('No documents found for the selected filters.');
                }
            } else {
                setError(data.error ?? 'Unable to load documents.');
                setDocuments(MOCK_DOCUMENTS);
            }
        } catch (err: any) {
            setError(err.message ?? 'Failed to communicate with the documents API.');
            setDocuments(MOCK_DOCUMENTS);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, typeFilter]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

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
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={`document-skeleton-${index}`} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                            <div className="flex items-start space-x-3 mb-4">
                                <div className="w-12 h-12 rounded bg-gray-200" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 bg-gray-100 rounded w-2/3" />
                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                                <div className="h-3 bg-gray-100 rounded w-1/3" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map((doc) => (
                    <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-3 mb-4">
                            <div className="text-4xl">{getFileIcon(doc.type)}</div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-gray-900 truncate mb-1">{doc.name}</h3>
                                <p className="text-xs text-gray-500">{doc.sizeLabel}</p>
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
                                Uploaded by {doc.uploadedBy} {doc.uploadDate ? `on ${doc.uploadDate}` : ''}
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
