import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Upload, Download, Trash2, Eye, Search, Filter, Folder, File, Image, FileCode, Archive, Plus, X } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import toast from 'react-hot-toast';

interface Document {
    id: string;
    name: string;
    file_path: string;
    file_type: string;
    file_size: number;
    category: 'contract' | 'drawing' | 'photo' | 'report' | 'invoice' | 'permit' | 'other';
    project_id?: string;
    project_name?: string;
    uploaded_by: string;
    uploaded_by_name?: string;
    version: number;
    description?: string;
    tags?: string[];
    created_at: string;
    updated_at?: string;
}

interface DocumentsManagementProps {
    currentUser?: any;
    projectId?: string;
}

const DocumentsManagement: React.FC<DocumentsManagementProps> = ({ currentUser, projectId }) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);

    // Upload form state
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadData, setUploadData] = useState({
        project_id: projectId || '',
        category: 'other' as Document['category'],
        description: '',
        tags: ''
    });

    useEffect(() => {
        loadDocuments();
        loadProjects();
    }, [projectId, currentUser]);

    const loadProjects = async () => {
        try {
            let query = supabase.from('projects').select('id, name');
            if (currentUser?.role === 'company_admin' && currentUser?.companyId) {
                query = query.eq('company_id', currentUser.companyId);
            }
            const { data, error } = await query;
            if (error) throw error;
            setProjects(data || []);
        } catch (error: any) {
            console.error('Error loading projects:', error);
        }
    };

    const loadDocuments = async () => {
        try {
            setLoading(true);
            let query = supabase.from('documents').select(`
                *,
                projects(name),
                users(name)
            `);

            if (projectId) {
                query = query.eq('project_id', projectId);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;

            const formattedDocs = (data || []).map((doc: any) => ({
                ...doc,
                project_name: doc.projects?.name,
                uploaded_by_name: doc.users?.name
            }));

            setDocuments(formattedDocs);
        } catch (error: any) {
            console.error('Error loading documents:', error);
            toast.error('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadFile) {
            toast.error('Please select a file');
            return;
        }

        try {
            // Upload file to Supabase Storage
            const fileExt = uploadFile.name.split('.').pop();
            const fileName = `${Date.now()}_${uploadFile.name}`;
            const filePath = `documents/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('project-files')
                .upload(filePath, uploadFile);

            if (uploadError) throw uploadError;

            // Create document record
            const tags = uploadData.tags ? uploadData.tags.split(',').map(t => t.trim()) : [];

            const { error: dbError } = await supabase.from('documents').insert({
                id: crypto.randomUUID(),
                name: uploadFile.name,
                file_path: filePath,
                file_type: uploadFile.type || 'application/octet-stream',
                file_size: uploadFile.size,
                category: uploadData.category,
                project_id: uploadData.project_id || null,
                uploaded_by: currentUser?.id,
                version: 1,
                description: uploadData.description || null,
                tags: tags.length > 0 ? tags : null,
                created_at: new Date().toISOString()
            });

            if (dbError) throw dbError;

            toast.success('Document uploaded successfully!');
            setShowUploadModal(false);
            setUploadFile(null);
            setUploadData({ project_id: projectId || '', category: 'other', description: '', tags: '' });
            loadDocuments();
        } catch (error: any) {
            console.error('Error uploading document:', error);
            toast.error('Failed to upload document');
        }
    };

    const handleDownload = async (doc: Document) => {
        try {
            const { data, error } = await supabase.storage
                .from('project-files')
                .download(doc.file_path);

            if (error) throw error;

            const url = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success('Download started');
        } catch (error: any) {
            console.error('Error downloading document:', error);
            toast.error('Failed to download document');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this document?')) return;

        try {
            const doc = documents.find(d => d.id === id);
            if (doc) {
                await supabase.storage.from('project-files').remove([doc.file_path]);
            }

            const { error } = await supabase.from('documents').delete().eq('id', id);
            if (error) throw error;

            toast.success('Document deleted successfully!');
            loadDocuments();
        } catch (error: any) {
            console.error('Error deleting document:', error);
            toast.error('Failed to delete document');
        }
    };

    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            const matchesSearch = !searchQuery ||
                doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.project_name?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;

            return matchesSearch && matchesCategory;
        });
    }, [documents, searchQuery, filterCategory]);

    const stats = {
        total: documents.length,
        contracts: documents.filter(d => d.category === 'contract').length,
        drawings: documents.filter(d => d.category === 'drawing').length,
        photos: documents.filter(d => d.category === 'photo').length,
        totalSize: documents.reduce((sum, d) => sum + d.file_size, 0)
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileIcon = (fileType: string) => {
        if (fileType.startsWith('image/')) return <Image className="w-5 h-5" />;
        if (fileType.includes('pdf')) return <FileText className="w-5 h-5" />;
        if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="w-5 h-5" />;
        if (fileType.includes('code') || fileType.includes('text')) return <FileCode className="w-5 h-5" />;
        return <File className="w-5 h-5" />;
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            contract: 'bg-blue-100 text-blue-800',
            drawing: 'bg-purple-100 text-purple-800',
            photo: 'bg-pink-100 text-pink-800',
            report: 'bg-green-100 text-green-800',
            invoice: 'bg-yellow-100 text-yellow-800',
            permit: 'bg-orange-100 text-orange-800',
            other: 'bg-gray-100 text-gray-800'
        };
        return colors[category] || colors.other;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Documents Management</h1>
                        <p className="text-gray-600">Organize and manage project documents</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowUploadModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2"
                    >
                        <Upload className="w-5 h-5" />
                        Upload Document
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Documents</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <FileText className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Contracts</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.contracts}</p>
                            </div>
                            <FileText className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Drawings</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.drawings}</p>
                            </div>
                            <Folder className="w-8 h-8 text-purple-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Photos</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.photos}</p>
                            </div>
                            <Image className="w-8 h-8 text-pink-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Size</p>
                                <p className="text-2xl font-bold text-gray-900">{formatFileSize(stats.totalSize)}</p>
                            </div>
                            <Archive className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-6">
                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search documents..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        aria-label="Filter by category"
                    >
                        <option value="all">All Categories</option>
                        <option value="contract">Contracts</option>
                        <option value="drawing">Drawings</option>
                        <option value="photo">Photos</option>
                        <option value="report">Reports</option>
                        <option value="invoice">Invoices</option>
                        <option value="permit">Permits</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>

            {/* Documents List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredDocuments.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-md">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No documents found</h3>
                    <p className="text-gray-600 mb-6">Upload your first document to get started</p>
                    <button
                        type="button"
                        onClick={() => setShowUploadModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                    >
                        Upload Document
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDocuments.map((doc) => (
                        <div
                            key={doc.id}
                            className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                        {getFileIcon(doc.file_type)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{doc.name}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(doc.category)}`}>
                                            {doc.category.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {doc.description && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{doc.description}</p>
                            )}

                            <div className="space-y-2 text-sm text-gray-500 mb-4">
                                {doc.project_name && (
                                    <div className="flex items-center gap-2">
                                        <Folder className="w-4 h-4" />
                                        <span>{doc.project_name}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <File className="w-4 h-4" />
                                    <span>{formatFileSize(doc.file_size)}</span>
                                </div>
                                {doc.uploaded_by_name && (
                                    <div className="flex items-center gap-2">
                                        <span>Uploaded by: {doc.uploaded_by_name}</span>
                                    </div>
                                )}
                            </div>

                            {doc.tags && doc.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {doc.tags.map((tag, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedDocument(doc);
                                        setShowViewModal(true);
                                    }}
                                    className="flex-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Eye className="w-4 h-4" />
                                    View
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDownload(doc)}
                                    className="flex-1 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Download
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(doc.id)}
                                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    aria-label="Delete document"
                                    title="Delete document"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Upload Document</h2>
                            <button
                                type="button"
                                onClick={() => setShowUploadModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label="Close modal"
                                title="Close modal"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpload} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    File *
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                    aria-label="Document file"
                                    title="Document file"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category *
                                </label>
                                <select
                                    value={uploadData.category}
                                    onChange={(e) => setUploadData({ ...uploadData, category: e.target.value as Document['category'] })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                    aria-label="Document category"
                                    title="Document category"
                                >
                                    <option value="contract">Contract</option>
                                    <option value="drawing">Drawing</option>
                                    <option value="photo">Photo</option>
                                    <option value="report">Report</option>
                                    <option value="invoice">Invoice</option>
                                    <option value="permit">Permit</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Project (Optional)
                                </label>
                                <select
                                    value={uploadData.project_id}
                                    onChange={(e) => setUploadData({ ...uploadData, project_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    aria-label="Associated project"
                                    title="Associated project"
                                >
                                    <option value="">No Project</option>
                                    {projects.map(project => (
                                        <option key={project.id} value={project.id}>{project.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={uploadData.description}
                                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={3}
                                    placeholder="Brief description of the document..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tags (Optional, comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={uploadData.tags}
                                    onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., urgent, final, approved"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                                >
                                    Upload
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentsManagement;

