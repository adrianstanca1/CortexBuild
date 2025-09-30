import React, { useState, useEffect } from 'react';
import {
    Download,
    Trash2,
    Eye,
    Search,
    Filter,
    Grid,
    List,
    File,
    Image,
    FileText,
    Zap,
    FolderOpen
} from 'lucide-react';
import uploadService, { UploadedFile } from '../../services/uploadService';
import { useAuth } from '../../contexts/AuthContext';

interface FileManagerProps {
    projectId?: string;
    showProjectFilter?: boolean;
    onFileSelect?: (file: UploadedFile) => void;
    selectionMode?: 'single' | 'multiple' | 'none';
    className?: string;
}

interface FileFilters {
    type?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
}

const FileManager: React.FC<FileManagerProps> = ({
    projectId,
    showProjectFilter = true,
    onFileSelect,
    selectionMode = 'none',
    className = ''
}) => {
    const { user, company } = useAuth();
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filters, setFilters] = useState<FileFilters>({});
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    const filesPerPage = 20;

    useEffect(() => {
        loadFiles();
    }, [projectId, filters, currentPage]);

    const loadFiles = async () => {
        if (!company) return;

        setLoading(true);
        setError(null);

        try {
            const response = await uploadService.listFiles({
                projectId,
                companyId: company.id,
                type: filters.type,
                search: filters.search,
                page: currentPage,
                limit: filesPerPage
            });

            setFiles(response.files);
            setTotalPages(Math.ceil((response.meta?.total || 0) / filesPerPage));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load files');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (fileId: string) => {
        if (!user || !confirm('Are you sure you want to delete this file?')) return;

        try {
            await uploadService.deleteFile(fileId, user.id);
            setFiles(prev => prev.filter(f => f.id !== fileId));
            setSelectedFiles(prev => {
                const updated = new Set(prev);
                updated.delete(fileId);
                return updated;
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete file');
        }
    };

    const handleDownload = (file: UploadedFile) => {
        const url = uploadService.getFileUrl(file.id);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.originalName || file.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileSelect = (file: UploadedFile) => {
        if (selectionMode === 'none') return;

        if (selectionMode === 'single') {
            setSelectedFiles(new Set([file.id]));
            onFileSelect?.(file);
        } else {
            setSelectedFiles(prev => {
                const updated = new Set(prev);
                if (updated.has(file.id)) {
                    updated.delete(file.id);
                } else {
                    updated.add(file.id);
                }
                return updated;
            });
        }
    };

    const getFileIcon = (file: UploadedFile) => {
        const iconClass = "w-6 h-6";

        if (file.mimetype.startsWith('image/')) {
            return <Image className={`${iconClass} text-blue-500`} />;
        } else if (file.mimetype === 'application/pdf') {
            return <FileText className={`${iconClass} text-red-500`} />;
        } else if (file.category === 'drawings' || file.filename.toLowerCase().includes('dwg')) {
            return <Zap className={`${iconClass} text-green-500`} />;
        } else {
            return <File className={`${iconClass} text-gray-500`} />;
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                <span className="ml-2 text-gray-600">Loading files...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                    <div className="text-red-600 font-medium">Error loading files</div>
                </div>
                <div className="text-red-600 text-sm mt-1">{error}</div>
                <button
                    onClick={() => loadFiles()}
                    className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className={`file-manager ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                        File Manager
                    </h2>
                    <span className="text-sm text-gray-500">
                        ({files.length} files)
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                            }`}
                        title="Toggle filters"
                    >
                        <Filter className="w-4 h-4" />
                    </button>

                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                                }`}
                            title="Grid view"
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                                }`}
                            title="List view"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="search-files" className="block text-sm font-medium text-gray-700 mb-1">
                                Search
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    id="search-files"
                                    type="text"
                                    placeholder="Search files..."
                                    value={filters.search || ''}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="file-type-filter" className="block text-sm font-medium text-gray-700 mb-1">
                                File Type
                            </label>
                            <select
                                id="file-type-filter"
                                value={filters.type || ''}
                                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value || undefined }))}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                title="Filter by file type"
                            >
                                <option value="">All types</option>
                                <option value="contract">Contracts</option>
                                <option value="permit">Permits</option>
                                <option value="drawing">Drawings</option>
                                <option value="photo">Photos</option>
                                <option value="report">Reports</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={() => setFilters({})}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                            >
                                Clear filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Files Grid/List */}
            {files.length === 0 ? (
                <div className="text-center py-12">
                    <FolderOpen className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                    <div className="text-gray-600 font-medium">No files found</div>
                    <div className="text-gray-500 text-sm mt-1">
                        {filters.search || filters.type
                            ? 'Try adjusting your filters'
                            : 'Upload some files to get started'
                        }
                    </div>
                </div>
            ) : (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                            {files.map(file => (
                                <div
                                    key={file.id}
                                    className={`
                    border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer
                    ${selectedFiles.has(file.id) ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'}
                    ${selectionMode !== 'none' ? 'hover:border-gray-300' : ''}
                  `}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => handleFileSelect(file)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            handleFileSelect(file);
                                        }
                                    }}
                                    aria-label={`Select file ${file.originalName || file.filename}`}
                                >
                                    <div className="flex flex-col items-center text-center">
                                        <div className="mb-2">
                                            {getFileIcon(file)}
                                        </div>

                                        <div className="text-sm font-medium text-gray-900 truncate w-full">
                                            {file.originalName || file.filename}
                                        </div>

                                        <div className="text-xs text-gray-500 mt-1">
                                            {formatFileSize(file.size)}
                                        </div>

                                        <div className="flex gap-1 mt-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDownload(file);
                                                }}
                                                className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                                                title="Download"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(uploadService.getFileUrl(file.id), '_blank');
                                                }}
                                                className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                                                title="View"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(file.id);
                                                }}
                                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {files.map(file => (
                                <div
                                    key={file.id}
                                    className={`
                    flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer
                    ${selectedFiles.has(file.id) ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'}
                  `}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => handleFileSelect(file)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            handleFileSelect(file);
                                        }
                                    }}
                                    aria-label={`Select file ${file.originalName || file.filename}`}
                                >
                                    {getFileIcon(file)}

                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-900 truncate">
                                            {file.originalName || file.filename}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {formatFileSize(file.size)} • {formatDate(file.url)} • {file.category}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownload(file);
                                            }}
                                            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                                            title="Download"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(uploadService.getFileUrl(file.id), '_blank');
                                            }}
                                            className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                                            title="View"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(file.id);
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                            <div className="text-sm text-gray-500">
                                Page {currentPage} of {totalPages}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default FileManager;