import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Download, 
  Eye,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  File,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  mimeType: string;
  thumbnail?: string;
  duration?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  metadata?: Record<string, any>;
}

interface MediaRendererProps {
  file: MediaFile;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  onPlay?: () => void;
  onPause?: () => void;
}

export const MediaRenderer: React.FC<MediaRendererProps> = ({
  file,
  className = '',
  autoPlay = false,
  controls = true,
  maxWidth = 800,
  maxHeight = 600,
  onLoad,
  onError,
  onPlay,
  onPause,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getMediaType = useCallback(() => {
    const mimeType = file.mimeType.toLowerCase();
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('text/') || mimeType.includes('json') || mimeType.includes('xml')) return 'text';
    return 'file';
  }, [file.mimeType]);

  const mediaType = getMediaType();

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setError(null);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback((err: any) => {
    setIsLoading(false);
    const errorMessage = err?.message || 'Failed to load media';
    setError(errorMessage);
    onError?.(new Error(errorMessage));
  }, [onError]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    onPlay?.();
  }, [onPlay]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    onPause?.();
  }, [onPause]);

  const togglePlayPause = useCallback(() => {
    const media = mediaRef.current as HTMLVideoElement | HTMLAudioElement;
    if (!media) return;

    if (isPlaying) {
      media.pause();
    } else {
      media.play();
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    const media = mediaRef.current as HTMLVideoElement | HTMLAudioElement;
    if (!media) return;

    media.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    const media = mediaRef.current as HTMLVideoElement | HTMLAudioElement;
    if (!media) return;

    media.volume = newVolume;
    setVolume(newVolume);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const media = mediaRef.current as HTMLVideoElement | HTMLAudioElement;
    if (!media) return;

    setCurrentTime(media.currentTime);
    setDuration(media.duration || 0);
  }, []);

  const handleSeek = useCallback((time: number) => {
    const media = mediaRef.current as HTMLVideoElement | HTMLAudioElement;
    if (!media) return;

    media.currentTime = time;
    setCurrentTime(time);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  const handleZoom = useCallback((direction: 'in' | 'out' | 'reset') => {
    if (direction === 'reset') {
      setZoom(1);
    } else if (direction === 'in') {
      setZoom(prev => Math.min(prev * 1.2, 5));
    } else {
      setZoom(prev => Math.max(prev / 1.2, 0.2));
    }
  }, []);

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const downloadFile = useCallback(() => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [file.url, file.name]);

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const renderMediaControls = () => {
    if (!controls || (mediaType !== 'video' && mediaType !== 'audio')) return null;

    return (
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center gap-3 text-white">
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePlayPause}
            className="text-white hover:bg-white/20"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-white hover:bg-white/20"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-20"
            />
          </div>

          <div className="flex-1 flex items-center gap-2">
            <span className="text-sm">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm">{formatTime(duration)}</span>
          </div>

          {mediaType === 'video' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              <Maximize size={16} />
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderImageControls = () => {
    if (mediaType !== 'image') return null;

    return (
      <div className="absolute top-4 right-4 flex gap-2">
        <Button variant="outline" size="sm" onClick={() => handleZoom('in')}>
          <ZoomIn size={16} />
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleZoom('out')}>
          <ZoomOut size={16} />
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleZoom('reset')}>
          1:1
        </Button>
        <Button variant="outline" size="sm" onClick={handleRotate}>
          <RotateCw size={16} />
        </Button>
      </div>
    );
  };

  const renderMedia = () => {
    const commonProps = {
      ref: mediaRef,
      onLoad: handleLoad,
      onError: handleError,
      style: {
        maxWidth: `${maxWidth}px`,
        maxHeight: `${maxHeight}px`,
        transform: mediaType === 'image' ? `scale(${zoom}) rotate(${rotation}deg)` : undefined,
        transition: 'transform 0.3s ease',
      },
    };

    switch (mediaType) {
      case 'image':
        return (
          <img
            {...commonProps}
            src={file.url}
            alt={file.name}
            className="max-w-full h-auto object-contain"
          />
        );

      case 'video':
        return (
          <video
            {...commonProps}
            src={file.url}
            autoPlay={autoPlay}
            onPlay={handlePlay}
            onPause={handlePause}
            onTimeUpdate={handleTimeUpdate}
            className="max-w-full h-auto"
          />
        );

      case 'audio':
        return (
          <audio
            {...commonProps}
            src={file.url}
            autoPlay={autoPlay}
            onPlay={handlePlay}
            onPause={handlePause}
            onTimeUpdate={handleTimeUpdate}
            className="w-full"
          />
        );

      case 'pdf':
        return (
          <iframe
            src={file.url}
            className="w-full h-96 border-0"
            title={file.name}
            onLoad={handleLoad}
            onError={handleError}
          />
        );

      case 'text':
        return (
          <div className="p-4 bg-gray-50 rounded-lg max-h-96 overflow-auto">
            <iframe
              src={file.url}
              className="w-full h-full border-0"
              title={file.name}
              onLoad={handleLoad}
              onError={handleError}
            />
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
            <File size={48} className="text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">{file.name}</p>
            <p className="text-sm text-gray-500 mb-4">
              {file.mimeType} • {formatFileSize(file.size)}
            </p>
            <Button onClick={downloadFile} variant="outline">
              <Download size={16} className="mr-2" />
              Download
            </Button>
          </div>
        );
    }
  };

  const getMediaIcon = () => {
    switch (mediaType) {
      case 'image': return <ImageIcon size={16} />;
      case 'video': return <Video size={16} />;
      case 'audio': return <Music size={16} />;
      case 'pdf': return <FileText size={16} />;
      case 'text': return <FileText size={16} />;
      default: return <File size={16} />;
    }
  };

  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center text-center">
          <div className="text-red-500 mb-4">
            {getMediaIcon()}
          </div>
          <h3 className="font-medium text-red-700 mb-2">Failed to load media</h3>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.open(file.url, '_blank')}>
              <ExternalLink size={16} className="mr-2" />
              Open in new tab
            </Button>
            <Button variant="outline" onClick={downloadFile}>
              <Download size={16} className="mr-2" />
              Download
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`relative overflow-hidden ${className}`} ref={containerRef}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          {getMediaIcon()}
          <div>
            <h3 className="font-medium">{file.name}</h3>
            <p className="text-sm text-muted-foreground">
              {file.mimeType} • {formatFileSize(file.size)}
              {file.dimensions && ` • ${file.dimensions.width}×${file.dimensions.height}`}
              {file.duration && ` • ${formatTime(file.duration)}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open(file.url, '_blank')}>
            <Eye size={16} />
          </Button>
          <Button variant="outline" size="sm" onClick={downloadFile}>
            <Download size={16} />
          </Button>
        </div>
      </div>

      {/* Media Content */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        
        {renderMedia()}
        {renderMediaControls()}
        {renderImageControls()}
      </div>
    </Card>
  );
};
