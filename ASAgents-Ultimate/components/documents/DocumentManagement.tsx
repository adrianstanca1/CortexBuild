import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
    File, Folder, Upload, Download, Search, Filter,
    MoreVertical, Eye, Trash2, Share,
    FileText, Image, Video, Archive,
    Calendar, User, Grid, List
} from 'lucide-react';

interface DocumentItem {
    id: string;
    name: string;
    type: 'file' | 'folder';
    size?: number;
    mimeType?: string;
    uploadedBy: string;
    uploadedAt: string;
    modifiedAt: string;
    tags: string[];
    category: string;
    status: 'active' | 'archived' | 'deleted';
    permissions: {
        read: string[];
        write: string[];
        delete: string[];
    };
    parentId?: string;
    path: string;
    version: number;
    isShared: boolean;
}

export const DocumentManagement: React.FC = () => {
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [currentPath, setCurrentPath] = useState('/');
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        loadDocuments();
    }, [currentPath]);

    const loadDocuments = async () => {
        setLoading(true);
        try {
            // Mock document data
            setDocuments([
                {
                    id: 'folder-001',
                    name: 'Project Documents',
                    type: 'folder',
                    uploadedBy: 'john.smith@company.com',
                    uploadedAt: '2025-09-20T10:00:00Z',
                    modifiedAt: '2025-09-28T15:30:00Z',
                    tags: ['projects', 'official'],
                    category: 'projects',
                    status: 'active',
                    permissions: {
                        read: ['all'],
                        write: ['project_managers', 'admin'],
                        delete: ['admin']
                    },
                    path: '/Project Documents',
                    version: 1,
                    isShared: true
                },
                {
                    id: 'file-001',
                    name: 'Safety Protocol v2.1.pdf',
                    type: 'file',
                    size: 2456789,
                    mimeType: 'application/pdf',
                    uploadedBy: 'safety.manager@company.com',
                    uploadedAt: '2025-09-25T14:20:00Z',
                    modifiedAt: '2025-09-27T09:15:00Z',
                    tags: ['safety', 'protocol', 'current'],
                    category: 'safety',
                    status: 'active',
                    permissions: {
                        read: ['all'],
                        write: ['safety_managers', 'admin'],
                        delete: ['admin']
                    },
                    path: '/Safety Protocol v2.1.pdf',
                    version: 2,
                    isShared: false
                },
                {
                    id: 'file-002',
                    name: 'Construction Plans - Phase 1.dwg',
                    type: 'file',
                    size: 15678901,
                    mimeType: 'application/dwg',
                    uploadedBy: 'architect@company.com',
                    uploadedAt: '2025-09-22T11:45:00Z',
                    modifiedAt: '2025-09-26T16:20:00Z',
                    tags: ['blueprints', 'phase1', 'construction'],
                    category: 'blueprints',
                    status: 'active',
                    permissions: {
                        read: ['engineers', 'project_managers', 'admin'],
                        write: ['architects', 'admin'],
                        delete: ['admin']
                    },
                    path: '/Construction Plans - Phase 1.dwg',
                    version: 3,
                    isShared: true
                },
                {
                    id: 'folder-002',
                    name: 'Financial Reports',
                    type: 'folder',
                    uploadedBy: 'finance@company.com',
                    uploadedAt: '2025-09-15T08:30:00Z',
                    modifiedAt: '2025-09-28T17:45:00Z',
                    tags: ['finance', 'reports', 'confidential'],
                    category: 'finance',
                    status: 'active',
                    permissions: {
                        read: ['finance_team', 'executives', 'admin'],
                        write: ['finance_managers', 'admin'],
                        delete: ['admin']
                    },
                    path: '/Financial Reports',
                    version: 1,
                    isShared: false
                },
                {
                    id: 'file-003',
                    name: 'Site Inspection Report - September.docx',
                    type: 'file',
                    size: 1234567,
                    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    uploadedBy: 'inspector@company.com',
                    uploadedAt: '2025-09-28T13:10:00Z',
                    modifiedAt: '2025-09-28T13:10:00Z',
                    tags: ['inspection', 'september', 'site-a'],
                    category: 'reports',
                    status: 'active',
                    permissions: {
                        read: ['inspectors', 'project_managers', 'safety_team', 'admin'],
                        write: ['inspectors', 'admin'],
                        delete: ['admin']
                    },
                    path: '/Site Inspection Report - September.docx',
                    version: 1,
                    isShared: true
                }
            ]);
        } catch (error) {
            console.error('Failed to load documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = (item: DocumentItem) => {
        if (item.type === 'folder') {
            return <Folder className="h-5 w-5 text-blue-500" />;
        }

        const mimeType = item.mimeType || '';
        if (mimeType.includes('pdf')) {
            return <FileText className="h-5 w-5 text-red-500" />;
        }
        if (mimeType.includes('image')) {
            return <Image className="h-5 w-5 text-green-500" />;
        }
        if (mimeType.includes('video')) {
            return <Video className="h-5 w-5 text-purple-500" />;
        }
        if (mimeType.includes('zip') || mimeType.includes('rar')) {
            return <Archive className="h-5 w-5 text-orange-500" />;
        }

        return <File className="h-5 w-5 text-gray-500" />;
    };

    const formatFileSize = (bytes: number | undefined): string => {
        if (!bytes) return '-';

        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getCategoryColor = (category: string): 'outline' | 'secondary' | 'default' => {
        switch (category) {
            case 'safety':
                return 'secondary';
            case 'finance':
                return 'default';
            case 'projects':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const handleItemClick = (item: DocumentItem) => {
        if (item.type === 'folder') {
            setCurrentPath(item.path);
        } else {
            // Handle file preview/download
            console.log('Opening file:', item.name);
        }
    };

    const handleItemSelect = (itemId: string) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const simulateUpload = async () => {
        setIsUploading(true);
        setUploadProgress(0);

        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
            setUploadProgress(i);
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        setIsUploading(false);
        setUploadProgress(0);
        await loadDocuments();
    };

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = searchTerm === '' ||
            doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;

        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
                    <p className="text-gray-600">Organize and manage project documents</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button variant="outline" className="flex items-center space-x-2">
                        <Folder className="h-4 w-4" />
                        <span>New Folder</span>
                    </Button>
                    <Button className="flex items-center space-x-2" onClick={simulateUpload}>
                        <Upload className="h-4 w-4" />
                        <span>Upload Files</span>
                    </Button>
                </div>
            </div>

            {/* Current Path */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Home</span>
                {currentPath !== '/' && (
                    <>
                        <span>/</span>
                        <span className="font-medium">{currentPath.replace('/', '')}</span>
                    </>
                )}
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                            aria-label="Filter documents by category"
                        >
                            <option value="all">All Categories</option>
                            <option value="projects">Projects</option>
                            <option value="safety">Safety</option>
                            <option value="finance">Finance</option>
                            <option value="blueprints">Blueprints</option>
                            <option value="reports">Reports</option>
                        </select>
                    </div>
                    <div className="relative">
                        <Search className="h-4 w-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search documents and tags..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm w-80"
                        />
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant={viewMode === 'list' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'grid' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                    >
                        <Grid className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Uploading files...</span>
                            <span className="text-sm text-gray-500">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-300 ${uploadProgress > 0 ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                                data-width={`${uploadProgress}%`}
                            ></div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Selected Items Actions */}
            {selectedItems.length > 0 && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                                {selectedItems.length} item(s) selected
                            </span>
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Share className="h-4 w-4 mr-2" />
                                    Share
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Document List/Grid */}
            {viewMode === 'list' ? (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left py-3 px-4">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300"
                                                aria-label="Select all documents"
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedItems(documents.map(doc => doc.id));
                                                    } else {
                                                        setSelectedItems([]);
                                                    }
                                                }}
                                            />
                                        </th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-900">Size</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-900">Modified</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-900">Shared</th>
                                        <th className="text-right py-3 px-4 font-medium text-gray-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredDocuments.map((document) => (
                                        <tr key={document.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300"
                                                    aria-label={`Select ${document.name}`}
                                                    checked={selectedItems.includes(document.id)}
                                                    onChange={() => handleItemSelect(document.id)}
                                                />
                                            </td>
                                            <td className="py-3 px-4">
                                                <button
                                                    className="flex items-center space-x-3 text-left hover:text-blue-600 w-full bg-transparent border-none p-0"
                                                    onClick={() => handleItemClick(document)}
                                                >
                                                    {getFileIcon(document)}
                                                    <div>
                                                        <div className="font-medium text-gray-900">{document.name}</div>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            {document.tags.slice(0, 3).map(tag => (
                                                                <Badge key={tag} variant="outline" className="text-xs">
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </button>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-500">
                                                {formatFileSize(document.size)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant={getCategoryColor(document.category)}>
                                                    {document.category}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-500">
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{new Date(document.modifiedAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center space-x-1 mt-1">
                                                    <User className="h-3 w-3" />
                                                    <span className="text-xs">{document.uploadedBy.split('@')[0]}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                {document.isShared ? (
                                                    <Badge variant="secondary">Shared</Badge>
                                                ) : (
                                                    <Badge variant="outline">Private</Badge>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {filteredDocuments.map((document) => (
                        <Card
                            key={document.id}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleItemClick(document)}
                        >
                            <CardContent className="p-4 text-center">
                                <div className="flex flex-col items-center space-y-2">
                                    {getFileIcon(document)}
                                    <div className="text-sm font-medium text-gray-900 truncate w-full">
                                        {document.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {formatFileSize(document.size)}
                                    </div>
                                    <Badge variant={getCategoryColor(document.category)} className="text-xs">
                                        {document.category}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {filteredDocuments.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <FileText className="h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                        <p className="text-gray-500 mb-4">
                            {searchTerm || filterCategory !== 'all'
                                ? 'Try adjusting your search or filters.'
                                : 'Upload your first document to get started.'
                            }
                        </p>
                        <Button>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Documents
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};