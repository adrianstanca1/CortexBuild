import React, { useState, useCallback, useRef } from 'react';
import { MultimodalContent, MediaType } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface MultimodalInputProps {
  onContentSubmit: (content: Partial<MultimodalContent>) => void;
  onError: (error: string) => void;
  enabledTypes?: MediaType[];
  maxFileSize?: number;
  className?: string;
}

const SUPPORTED_TYPES: Record<MediaType, string[]> = {
  text: ['text/plain'],
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mpeg'],
  video: ['video/mp4', 'video/webm', 'video/avi', 'video/mov'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  mixed: []
};

export const MultimodalInput: React.FC<MultimodalInputProps> = ({
  onContentSubmit,
  onError,
  enabledTypes = ['text', 'image', 'audio', 'video', 'document'],
  maxFileSize = 100 * 1024 * 1024, // 100MB
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateFile = useCallback((file: File): { isValid: boolean; error?: string; mediaType?: MediaType } => {
    // Check file size
    if (file.size > maxFileSize) {
      return { isValid: false, error: `File size exceeds ${Math.round(maxFileSize / (1024 * 1024))}MB limit` };
    }

    // Determine media type
    let mediaType: MediaType | null = null;
    for (const [type, mimeTypes] of Object.entries(SUPPORTED_TYPES)) {
      if (mimeTypes.includes(file.type)) {
        mediaType = type as MediaType;
        break;
      }
    }

    if (!mediaType) {
      return { isValid: false, error: `Unsupported file type: ${file.type}` };
    }

    if (!enabledTypes.includes(mediaType)) {
      return { isValid: false, error: `${mediaType} files are not enabled` };
    }

    return { isValid: true, mediaType };
  }, [maxFileSize, enabledTypes]);

  const processFile = useCallback(async (file: File) => {
    const validation = validateFile(file);
    if (!validation.isValid) {
      onError(validation.error || 'Invalid file');
      return;
    }

    setIsProcessing(true);
    try {
      const content: Partial<MultimodalContent> = {
        type: validation.mediaType || 'document',
        metadata: {
          filename: file.name,
          fileSize: file.size,
          mimeType: file.type,
          source: 'upload'
        }
      };

      // For images, add dimensions
      if (validation.mediaType === 'image') {
        const img = new Image();
        img.onload = () => {
          content.metadata = {
            ...content.metadata,
            dimensions: { width: img.width, height: img.height }
          };
          onContentSubmit(content);
        };
        img.src = URL.createObjectURL(file);
      } else {
        onContentSubmit(content);
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  }, [validateFile, onContentSubmit, onError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 1) {
      onError('Please upload one file at a time');
      return;
    }

    if (files.length === 1) {
      processFile(files[0]);
    }
  }, [processFile, onError]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleTextSubmit = useCallback(() => {
    if (!textInput.trim()) {
      onError('Please enter some text');
      return;
    }

    const content: Partial<MultimodalContent> = {
      type: 'text',
      metadata: {
        source: 'text_input',
        textContent: textInput.trim()
      }
    };

    onContentSubmit(content);
    setTextInput('');
  }, [textInput, onContentSubmit, onError]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* File Upload Area */}
      <Card className={`relative transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : ''}`}>
        <button
          type="button"
          className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-gray-400 transition-colors bg-transparent"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          aria-label="Click to upload file or drag and drop"
        >
          <div className="space-y-4">
            <div className="text-4xl">📁</div>
            <div>
              <h3 className="text-lg font-semibold">Upload Multimodal Content</h3>
              <p className="text-gray-500 mt-2">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Supports: Images, Audio, Video, Documents (max {Math.round(maxFileSize / (1024 * 1024))}MB)
              </p>
            </div>
            {isProcessing && (
              <div className="text-blue-600">
                <div className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                Processing file...
              </div>
            )}
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          aria-label="Upload file for multimodal analysis"
          onChange={handleFileSelect}
          accept={enabledTypes.flatMap(type => SUPPORTED_TYPES[type]).join(',')}
        />
      </Card>

      {/* Text Input Area */}
      {enabledTypes.includes('text') && (
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Text Analysis</h3>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Enter text for AI analysis..."
              className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button
              onClick={handleTextSubmit}
              disabled={!textInput.trim() || isProcessing}
              className="w-full"
            >
              Analyze Text
            </Button>
          </div>
        </Card>
      )}

      {/* Supported Types Info */}
      <Card className="bg-gray-50">
        <div className="space-y-2">
          <h4 className="font-medium">Supported Content Types:</h4>
          <div className="flex flex-wrap gap-2">
            {enabledTypes.map(type => (
              <span
                key={type}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
