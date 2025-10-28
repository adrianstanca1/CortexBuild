// components/FileUpload.tsx
import React, { useRef, useState } from 'react';
import { Upload, X, File, Check, AlertCircle } from 'lucide-react';
import { uploadFile, formatFileSize, getFileIcon, type UploadResult } from '../utils/fileUpload';

interface FileUploadProps {
    onUploadComplete: (files: UploadResult[]) => void;
    folder: string;
    maxSize?: number;
    accept?: string;
    multiple?: boolean;
    className?: string;
}

interface FileWithProgress extends File {
    id: string;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    onUploadComplete,
    folder,
    maxSize = 100 * 1024 * 1024, // 100MB
    accept = '*/*',
    multiple = false,
    className = ''
}) => {
    const [files, setFiles] = useState<FileWithProgress[]>([]);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (selectedFiles: FileList | null) => {
        if (!selectedFiles) return;

        const fileArray = Array.from(selectedFiles);

        // Validate files
        const validFiles: FileWithProgress[] = fileArray.map(file => {
            const fileWithProgress = file as FileWithProgress;
            fileWithProgress.id = `${Date.now()}-${Math.random()}`;
            fileWithProgress.progress = 0;
            fileWithProgress.status = 'pending';

            // Validate file size
            if (file.size > maxSize) {
                fileWithProgress.status = 'error';
                fileWithProgress.error = `File exceeds maximum size of ${formatFileSize(maxSize)}`;
            }

            return fileWithProgress;
        });

        setFiles(prev => multiple ? [...prev, ...validFiles] : validFiles);
    };

    const handleUpload = async () => {
        const validFiles = files.filter(f => f.status === 'pending');
        if (validFiles.length === 0) return;

        setUploading(true);
        const uploadedFiles: UploadResult[] = [];

        try {
            for (const file of validFiles) {
                try {
                    // Update status to uploading
                    setFiles(prev =>
                        prev.map(f =>
                            f.id === file.id ? { ...f, status: 'uploading', progress: 0 } : f
                        )
                    );

                    const result = await uploadFile(file, {
                        folder,
                        onProgress: (progress) => {
                            setFiles(prev =>
                                prev.map(f =>
                                    f.id === file.id ? { ...f, progress } : f
                                )
                            );
                        }
                    });

                    uploadedFiles.push(result);

                    // Update status to success
                    setFiles(prev =>
                        prev.map(f =>
                            f.id === file.id ? { ...f, status: 'success', progress: 100 } : f
                        )
                    );
                } catch (error) {
                    // Update status to error
                    setFiles(prev =>
                        prev.map(f =>
                            f.id === file.id ? {
                                ...f,
                                status: 'error',
                                error: error instanceof Error ? error.message : 'Upload failed'
                            } : f
                        )
                    );
                }
            }

            if (uploadedFiles.length > 0) {
                onUploadComplete(uploadedFiles);
            }
        } finally {
            setUploading(false);
        }
    };

    const removeFile = (fileId: string) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files);
        }
    };

    const getStatusIcon = (status: FileWithProgress['status']) => {
        switch (status) {
            case 'success': return <Check className="w-4 h-4 text-green-600" />;
            case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
            case 'uploading': return <Upload className="w-4 h-4 text-blue-600 animate-pulse" />;
            default: return <File className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: FileWithProgress['status']) => {
        switch (status) {
            case 'success': return 'border-green-200 bg-green-50';
            case 'error': return 'border-red-200 bg-red-50';
            case 'uploading': return 'border-blue-200 bg-blue-50';
            default: return 'border-gray-200 bg-gray-50';
        }
    };

    return (
        <div className={`file-upload ${className}`}>
            <input
                ref={fileInputRef}
                type="file"
                multiple={multiple}
                accept={accept}
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                aria-label="File upload input"
            />

            {/* Upload Area */}
            <div
                className={`border-2 border-dashed rounded-lg p-6 transition-colors ${dragActive
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-2 py-8 hover:bg-gray-50 transition-colors rounded-lg"
                >
                    <Upload className="w-12 h-12 text-gray-400" />
                    <span className="text-gray-600 font-medium">
                        {dragActive ? 'Drop files here' : 'Click to upload files'}
                    </span>
                    <span className="text-sm text-gray-500">
                        or drag and drop
                    </span>
                    <span className="text-xs text-gray-400">
                        Max size: {formatFileSize(maxSize)}
                    </span>
                </button>
            </div>

            {/* Files List */}
            {files.length > 0 && (
                <div className="mt-4 space-y-2">
                    {files.map((file) => (
                        <div
                            key={file.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(file.status)}`}
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <span className="text-lg">{getFileIcon(file.type)}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-700 truncate">
                                        {file.name}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>{formatFileSize(file.size)}</span>
                                        {file.status === 'uploading' && (
                                            <span>{file.progress}%</span>
                                        )}
                                        {file.error && (
                                            <span className="text-red-600">{file.error}</span>
                                        )}
                                    </div>
                                    {file.status === 'uploading' && (
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                            <div
                                                className="bg-blue-600 h-1.5 rounded-full transition-all"
                                                style={{ width: `${file.progress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(file.status)}
                                    <button
                                        onClick={() => removeFile(file.id)}
                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                                        title="Remove file"
                                    >
                                        <X className="w-4 h-4 text-gray-500" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Button */}
            {files.length > 0 && !uploading && (
                <button
                    onClick={handleUpload}
                    disabled={files.every(f => f.status !== 'pending')}
                    className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Upload {files.filter(f => f.status === 'pending').length} file{files.filter(f => f.status === 'pending').length !== 1 ? 's' : ''}
                </button>
            )}

            {uploading && (
                <div className="mt-4 text-center text-gray-600">
                    Uploading files...
                </div>
            )}
        </div>
    );
};
