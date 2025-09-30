import React, { useCallback, useState, useRef } from 'react';
import { aiSystem } from '../../services/ai/index';
import type { ProcessedFile } from '../../services/ai/index';

interface FileUploadProps {
    onFilesProcessed?: (files: ProcessedFile[]) => void;
    onAnalysisComplete?: (analysis: string) => void;
    acceptedTypes?: string;
    maxFiles?: number;
    className?: string;
}

export const AIFileUpload: React.FC<FileUploadProps> = ({
    onFilesProcessed,
    onAnalysisComplete,
    acceptedTypes = 'image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.json,.js,.ts,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.sh,.sql,.html,.css,.scss,.xml,.yaml,.yml',
    maxFiles = 5,
    className = ''
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = useCallback(async (files: FileList) => {
        if (files.length === 0 || files.length > maxFiles) {
            alert(`Please select between 1 and ${maxFiles} files.`);
            return;
        }

        setIsProcessing(true);
        setProgress(0);

        try {
            // Process files using AI system
            const processed = await aiSystem.multimodalHandler.processFiles(files);
            setProcessedFiles(processed);
            onFilesProcessed?.(processed);

            // If there are images, perform AI analysis
            const images = processed.filter(f => f.mediaType === 'image');
            if (images.length > 0 && onAnalysisComplete) {
                setProgress(50);

                for (let i = 0; i < images.length; i++) {
                    const file = files[Array.from(files).findIndex(f => f.name === images[i].name)];
                    if (file) {
                        const analysis = await aiSystem.processImage(file);
                        onAnalysisComplete(`Analysis of ${images[i].name}: ${analysis}`);
                    }
                    setProgress(50 + (50 * (i + 1) / images.length));
                }
            }

            setProgress(100);
            setTimeout(() => setProgress(0), 1000);
        } catch (error) {
            console.error('File processing error:', error);
            alert('Failed to process files. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    }, [maxFiles, onFilesProcessed, onAnalysisComplete]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const { files } = e.dataTransfer;
        if (files && files.length > 0) {
            handleFileUpload(files);
        }
    }, [handleFileUpload]);

    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files);
        }
    }, [handleFileUpload]);

    const handleClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const removeFile = useCallback((index: number) => {
        const updated = processedFiles.filter((_, i) => i !== index);
        setProcessedFiles(updated);
        onFilesProcessed?.(updated);
    }, [processedFiles, onFilesProcessed]);

    const getFileIcon = (mediaType: string) => {
        switch (mediaType) {
            case 'image': return '🖼️';
            case 'audio': return '🎵';
            case 'video': return '🎬';
            case 'code': return '💻';
            case 'document': return '📄';
            default: return '📎';
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className={`w-full ${className}`}>
            {/* Upload Area */}
            <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragging
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }
          ${isProcessing ? 'pointer-events-none opacity-50' : ''}
        `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedTypes}
                    multiple
                    className="hidden"
                    onChange={handleFileInputChange}
                    disabled={isProcessing}
                />

                <div className="space-y-4">
                    <div className="text-4xl">
                        {isProcessing ? '⏳' : isDragging ? '📤' : '📁'}
                    </div>

                    <div>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                            {isProcessing
                                ? 'Processing files...'
                                : isDragging
                                    ? 'Drop files here'
                                    : 'Upload files for AI analysis'
                            }
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {isProcessing
                                ? 'Please wait while we analyze your files'
                                : `Drag & drop or click to select (max ${maxFiles} files)`
                            }
                        </p>
                    </div>

                    <div className="text-xs text-gray-400 dark:text-gray-500">
                        Supported: Images, Audio, Video, Documents, Code files
                    </div>
                </div>

                {/* Progress Bar */}
                {isProcessing && progress > 0 && (
                    <div className="absolute bottom-2 left-2 right-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                            {progress}% complete
                        </p>
                    </div>
                )}
            </div>

            {/* Processed Files List */}
            {processedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Processed Files ({processedFiles.length})
                    </h3>

                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {processedFiles.map((file, index) => (
                            <div
                                key={`${file.name}-${index}`}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                            >
                                <div className="flex items-center space-x-3 flex-1">
                                    <span className="text-lg">{getFileIcon(file.mediaType)}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {file.name}
                                        </p>
                                        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                                            <span>{formatFileSize(file.size)}</span>
                                            <span>•</span>
                                            <span className="capitalize">{file.mediaType}</span>
                                            {file.detectedLanguage && (
                                                <>
                                                    <span>•</span>
                                                    <span className="uppercase">{file.detectedLanguage}</span>
                                                </>
                                            )}
                                        </div>
                                        {file.extractedText && (
                                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                                {file.extractedText.length > 100
                                                    ? `${file.extractedText.substring(0, 100)}...`
                                                    : file.extractedText
                                                }
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => removeFile(index)}
                                    className="ml-3 p-1 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                                    title="Remove file"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};