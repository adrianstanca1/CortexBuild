import React, { useState, useRef, useCallback } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Image, FileText, Zap } from 'lucide-react';
import uploadService, { UploadOptions, UploadProgress, UploadedFile, SupportedFileTypes } from '../../services/uploadService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../contexts/ToastContext';
import './FileUpload.css';

interface FileUploadProps {
    projectId?: string;
    type?: 'contract' | 'permit' | 'drawing' | 'photo' | 'report' | 'other';
    multiple?: boolean;
    accept?: string;
    maxFiles?: number;
    className?: string;
    onUploadComplete?: (files: UploadedFile[]) => void;
    onUploadStart?: () => void;
    onUploadError?: (error: string) => void;
    showPreview?: boolean;
    disabled?: boolean;
}

interface FileWithProgress extends File {
    id: string;
    progress: number;
    status: 'uploading' | 'completed' | 'error';
    error?: string;
    uploadedFile?: UploadedFile;
}

const FileUpload: React.FC<FileUploadProps> = ({
    projectId,
    type = 'other',
    multiple = true,
    accept,
    maxFiles = 10,
    className = '',
    onUploadComplete,
    onUploadStart,
    onUploadError,
    showPreview = true,
    disabled = false
}) => {
    const { user, company } = useAuth();
    const [isDragOver, setIsDragOver] = useState(false);
    const [files, setFiles] = useState<FileWithProgress[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [supportedTypes, setSupportedTypes] = useState<SupportedFileTypes | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load supported file types on mount
    React.useEffect(() => {
        uploadService.getSupportedFileTypes()
            .then(setSupportedTypes)
            .catch(error => {
                console.error('Failed to load supported file types:', error);
            });
    }, []);

    const generateFileId = () => {
        return Math.random().toString(36).substr(2, 9);
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) {
            setIsDragOver(true);
        }
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        if (disabled) return;

        const droppedFiles = Array.from(e.dataTransfer.files);
        handleFiles(droppedFiles);
    }, [disabled]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            handleFiles(selectedFiles);
        }
    };

    const handleFiles = (newFiles: File[]) => {
        if (!user || !company || !supportedTypes) {
            console.error('Authentication required');
            return;
        }

        // Check file count limit
        if (files.length + newFiles.length > maxFiles) {
            console.error(`Maximum ${maxFiles} files allowed`);
            return;
        }

        // Validate and add files
        const validFiles: FileWithProgress[] = [];

        for (const file of newFiles) {
            const validation = uploadService.validateFile(file, supportedTypes);

            if (!validation.isValid) {
                console.error(`${file.name}: ${validation.error}`);
                continue;
            }

            // Check if file already exists
            const exists = files.some(f => f.name === file.name && f.size === file.size);
            if (exists) {
                console.warn(`File ${file.name} already selected`);
                continue;
            }

            validFiles.push({
                ...file,
                id: generateFileId(),
                progress: 0,
                status: 'uploading'
            });
        }

        if (validFiles.length === 0) return;

        setFiles(prev => [...prev, ...validFiles]);
        uploadFiles(validFiles);
    };

    const uploadFiles = async (filesToUpload: FileWithProgress[]) => {
        if (!user || !company) return;

        setIsUploading(true);
        onUploadStart?.();

        const uploadOptions: UploadOptions = {
            projectId,
            companyId: company.id,
            userId: user.id,
            type
        };

        const uploadedFiles: UploadedFile[] = [];

        for (const fileWithProgress of filesToUpload) {
            try {
                const progressCallback = (progress: UploadProgress) => {
                    setFiles(prev => prev.map(f =>
                        f.id === fileWithProgress.id
                            ? { ...f, progress: progress.percentage }
                            : f
                    ));
                };

                const uploadedFile = await uploadService.uploadSingle(
                    fileWithProgress,
                    { ...uploadOptions, onProgress: progressCallback }
                );

                setFiles(prev => prev.map(f =>
                    f.id === fileWithProgress.id
                        ? { ...f, status: 'completed', uploadedFile }
                        : f
                ));

                uploadedFiles.push(uploadedFile);
                console.log(`${fileWithProgress.name} uploaded successfully`);

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Upload failed';

                setFiles(prev => prev.map(f =>
                    f.id === fileWithProgress.id
                        ? { ...f, status: 'error', error: errorMessage }
                        : f
                ));

                console.error(`${fileWithProgress.name}: ${errorMessage}`);
                onUploadError?.(errorMessage);
            }
        }

        setIsUploading(false);

        if (uploadedFiles.length > 0) {
            onUploadComplete?.(uploadedFiles);
        }
    };

    const removeFile = (fileId: string) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    if (file.type.startsWith('image/')) {
        return <Image className="w-5 h-5 text-blue-500" />;
    } else if (file.type === 'application/pdf') {
        return <FileText className="w-5 h-5 text-red-500" />;
    } else if (file.type.includes('drawing') || file.name.toLowerCase().includes('dwg')) {
        return <Zap className="w-5 h-5 text-green-500" />;
    } else {
        return <File className="w-5 h-5 text-gray-500" />;
    }
};

const getStatusIcon = (file: FileWithProgress) => {
    switch (file.status) {
        case 'completed':
            return <CheckCircle className="w-5 h-5 text-green-500" />;
        case 'error':
            return <AlertCircle className="w-5 h-5 text-red-500" />;
        default:
            return null;
    }
};

return (
    <div className={`file-upload ${className}`}>
        {/* Drop Zone */}
        <div
            className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragOver
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
            role="button"
            tabIndex={disabled ? -1 : 0}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !disabled && fileInputRef.current?.click()}
            onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
                    fileInputRef.current?.click();
                }
            }}
            aria-label="Upload files area"
        >
            <Upload className={`mx-auto mb-4 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} size={48} />

            <div className="text-lg font-medium text-gray-700 mb-2">
                {isDragOver ? 'Drop files here' : 'Upload files'}
            </div>

            <div className="text-sm text-gray-500 mb-4">
                Drag and drop files here, or click to select files
            </div>

            <div className="text-xs text-gray-400">
                {multiple ? `Up to ${maxFiles} files` : 'Single file only'} •
                Documents, Images, Drawings supported • Max 100MB per file
            </div>

            <input
                ref={fileInputRef}
                type="file"
                multiple={multiple}
                accept={accept}
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled}
                aria-label="File upload input"
            />
        </div>

        {/* File List */}
        {files.length > 0 && showPreview && (
            <div className="mt-6">
                <div className="text-sm font-medium text-gray-700 mb-3">
                    Selected Files ({files.length})
                </div>

                <div className="space-y-3">
                    {files.map(file => (
                        <div
                            key={file.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                            {getFileIcon(file)}

                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                    {file.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {formatFileSize(file.size)}
                                </div>

                                {file.status === 'uploading' && (
                                    <div className="mt-2">
                                        <div className="bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full transition-all"
                                                style={{ width: `${file.progress}%` }}
                                            />
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {file.progress}%
                                        </div>
                                    </div>
                                )}

                                {file.status === 'error' && (
                                    <div className="text-xs text-red-500 mt-1">
                                        {file.error}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                {getStatusIcon(file)}

                                {file.status !== 'uploading' && (
                                    <button
                                        onClick={() => removeFile(file.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                        disabled={isUploading}
                                        aria-label={`Remove ${file.name}`}
                                        title={`Remove ${file.name}`}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Upload Status */}
        {isUploading && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-700">
                    Uploading files... Please wait.
                </div>
            </div>
        )}
    </div>
);

export default FileUpload;