import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Upload, 
  X, 
  File, 
  Image as ImageIcon, 
  Video, 
  Music, 
  FileText,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { validateFileUpload } from '../../utils/validation';

interface FileUploadProps {
  onFilesSelect: (files: File[]) => void;
  onUploadComplete?: (uploadedFiles: UploadedFile[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
  uploadEndpoint?: string;
  className?: string;
  multiple?: boolean;
  autoUpload?: boolean;
  showPreview?: boolean;
}

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

interface FileWithPreview extends File {
  id: string;
  preview?: string;
  uploadProgress?: number;
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error';
  uploadError?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelect,
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = [],
  allowedExtensions = [],
  uploadEndpoint = '/api/upload',
  className = '',
  multiple = true,
  autoUpload = false,
  showPreview = true,
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFileId = () => Math.random().toString(36).substr(2, 9);

  const createFilePreview = useCallback((file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  }, []);

  const validateFiles = useCallback((fileList: File[]): { valid: File[]; invalid: Array<{ file: File; error: string }> } => {
    const valid: File[] = [];
    const invalid: Array<{ file: File; error: string }> = [];

    for (const file of fileList) {
      const validation = validateFileUpload(file, {
        maxSize: maxFileSize,
        allowedTypes,
        allowedExtensions,
      });

      if (validation.valid) {
        valid.push(file);
      } else {
        invalid.push({ file, error: validation.error || 'Invalid file' });
      }
    }

    // Check total file count
    if (files.length + valid.length > maxFiles) {
      const excess = files.length + valid.length - maxFiles;
      const excessFiles = valid.splice(-excess);
      excessFiles.forEach(file => {
        invalid.push({ file, error: `Maximum ${maxFiles} files allowed` });
      });
    }

    return { valid, invalid };
  }, [files.length, maxFiles, maxFileSize, allowedTypes, allowedExtensions]);

  const addFiles = useCallback(async (newFiles: File[]) => {
    const { valid, invalid } = validateFiles(newFiles);

    // Show errors for invalid files
    invalid.forEach(({ file, error }) => {
      console.error(`File validation error for ${file.name}: ${error}`);
      onUploadError?.(error);
    });

    if (valid.length === 0) return;

    // Create file objects with previews
    const filesWithPreviews: FileWithPreview[] = await Promise.all(
      valid.map(async (file) => {
        const preview = await createFilePreview(file);
        return Object.assign(file, {
          id: generateFileId(),
          preview,
          uploadProgress: 0,
          uploadStatus: 'pending' as const,
        });
      })
    );

    setFiles(prev => [...prev, ...filesWithPreviews]);
    onFilesSelect(valid);

    if (autoUpload) {
      uploadFiles(filesWithPreviews);
    }
  }, [validateFiles, createFilePreview, onFilesSelect, autoUpload]);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      onFilesSelect(updated);
      return updated;
    });
  }, [onFilesSelect]);

  const uploadFiles = useCallback(async (filesToUpload?: FileWithPreview[]) => {
    const targetFiles = filesToUpload || files.filter(f => f.uploadStatus === 'pending');
    if (targetFiles.length === 0) return;

    setIsUploading(true);
    const uploadedFiles: UploadedFile[] = [];

    for (const file of targetFiles) {
      try {
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, uploadStatus: 'uploading' as const, uploadProgress: 0 }
            : f
        ));

        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setFiles(prev => prev.map(f => 
              f.id === file.id 
                ? { ...f, uploadProgress: progress }
                : f
            ));
          }
        };

        // Handle upload completion
        const uploadPromise = new Promise<UploadedFile>((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status === 200) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve({
                  id: response.id || file.id,
                  name: file.name,
                  url: response.url,
                  type: file.type,
                  size: file.size,
                });
              } catch (error) {
                reject(new Error('Invalid response format'));
              }
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error('Upload failed'));
        });

        xhr.open('POST', uploadEndpoint);
        xhr.send(formData);

        const uploadedFile = await uploadPromise;
        uploadedFiles.push(uploadedFile);

        // Update status to success
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, uploadStatus: 'success' as const, uploadProgress: 100 }
            : f
        ));

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        
        // Update status to error
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, uploadStatus: 'error' as const, uploadError: errorMessage }
            : f
        ));

        onUploadError?.(errorMessage);
      }
    }

    setIsUploading(false);
    
    if (uploadedFiles.length > 0) {
      onUploadComplete?.(uploadedFiles);
    }
  }, [files, uploadEndpoint, onUploadComplete, onUploadError]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length > 0) {
      addFiles(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addFiles]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(event.dataTransfer.files);
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  }, [addFiles]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const getFileIcon = useCallback((type: string) => {
    if (type.startsWith('image/')) return <ImageIcon size={24} />;
    if (type.startsWith('video/')) return <Video size={24} />;
    if (type.startsWith('audio/')) return <Music size={24} />;
    if (type.includes('pdf') || type.includes('text')) return <FileText size={24} />;
    return <File size={24} />;
  }, []);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const getStatusIcon = useCallback((status: FileWithPreview['uploadStatus']) => {
    switch (status) {
      case 'uploading':
        return <Loader className="animate-spin text-blue-500" size={16} />;
      case 'success':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={16} />;
      default:
        return null;
    }
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <Card
        className={`
          border-2 border-dashed p-8 text-center cursor-pointer transition-colors
          ${isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto mb-4 text-muted-foreground" size={48} />
        <h3 className="text-lg font-medium mb-2">
          {isDragOver ? 'Drop files here' : 'Upload files'}
        </h3>
        <p className="text-muted-foreground mb-4">
          Drag and drop files here, or click to select files
        </p>
        <p className="text-sm text-muted-foreground">
          Maximum {maxFiles} files, {formatFileSize(maxFileSize)} each
          {allowedExtensions.length > 0 && (
            <span className="block mt-1">
              Allowed: {allowedExtensions.join(', ')}
            </span>
          )}
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={allowedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Selected Files ({files.length})</h4>
            {!autoUpload && (
              <Button
                onClick={() => uploadFiles()}
                disabled={isUploading || files.every(f => f.uploadStatus !== 'pending')}
              >
                {isUploading ? 'Uploading...' : 'Upload All'}
              </Button>
            )}
          </div>

          {showPreview && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {files.map((file) => (
                <Card key={file.id} className="p-3">
                  <div className="flex items-start gap-3">
                    {/* Preview or Icon */}
                    <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                      {file.preview ? (
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          {getFileIcon(file.type)}
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm truncate" title={file.name}>
                        {file.name}
                      </h5>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                      
                      {/* Upload Progress */}
                      {file.uploadStatus === 'uploading' && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-primary h-1 rounded-full transition-all duration-300"
                              style={{ width: `${file.uploadProgress || 0}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {file.uploadProgress || 0}%
                          </p>
                        </div>
                      )}
                      
                      {/* Error Message */}
                      {file.uploadStatus === 'error' && file.uploadError && (
                        <p className="text-xs text-red-600 mt-1">
                          {file.uploadError}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {getStatusIcon(file.uploadStatus)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="text-muted-foreground hover:text-red-600"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
