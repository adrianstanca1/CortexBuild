import React, { useState, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { MediaRenderer, type MediaFile } from '../media/MediaRenderer';
import { MediaGallery } from '../media/MediaGallery';
import { FileUpload } from '../media/FileUpload';
import { useRealTimeSync } from '../../hooks/useRealTimeSync';
import { 
  Upload, 
  Image as ImageIcon, 
  Video, 
  Music, 
  FileText, 
  Download,
  Share2,
  Trash2,
  RefreshCw,
  Zap,
  Globe,
  Database
} from 'lucide-react';

// Sample media files for demonstration
const sampleMediaFiles: MediaFile[] = [
  {
    id: '1',
    name: 'project-blueprint.jpg',
    url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop',
    type: 'image/jpeg',
    size: 245760,
    mimeType: 'image/jpeg',
    thumbnail: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=200&h=150&fit=crop',
    dimensions: { width: 800, height: 600 },
    metadata: { createdAt: Date.now() - 86400000 }
  },
  {
    id: '2',
    name: 'construction-timelapse.mp4',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    type: 'video/mp4',
    size: 1048576,
    mimeType: 'video/mp4',
    thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&h=150&fit=crop',
    duration: 30,
    dimensions: { width: 1280, height: 720 },
    metadata: { createdAt: Date.now() - 172800000 }
  },
  {
    id: '3',
    name: 'project-specifications.pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    type: 'application/pdf',
    size: 524288,
    mimeType: 'application/pdf',
    metadata: { createdAt: Date.now() - 259200000 }
  },
  {
    id: '4',
    name: 'ambient-construction.mp3',
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    type: 'audio/mpeg',
    size: 3145728,
    mimeType: 'audio/mpeg',
    duration: 180,
    metadata: { createdAt: Date.now() - 345600000 }
  },
  {
    id: '5',
    name: 'site-survey.jpg',
    url: 'https://images.unsplash.com/photo-1590725175499-8b8c8c4e8c8c?w=800&h=600&fit=crop',
    type: 'image/jpeg',
    size: 189440,
    mimeType: 'image/jpeg',
    thumbnail: 'https://images.unsplash.com/photo-1590725175499-8b8c8c4e8c8c?w=200&h=150&fit=crop',
    dimensions: { width: 800, height: 600 },
    metadata: { createdAt: Date.now() - 432000000 }
  }
];

export const MultimodalDemo: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>(sampleMediaFiles);
  const [activeTab, setActiveTab] = useState<'renderer' | 'gallery' | 'upload' | 'realtime'>('renderer');

  // Real-time sync demonstration
  const [syncState, syncActions] = useRealTimeSync<MediaFile>({
    endpoint: '/api/media',
    enableOptimisticUpdates: true,
    enableConflictResolution: true,
    syncInterval: 10000,
  });

  const handleFileUpload = useCallback((files: File[]) => {
    console.log('Files selected for upload:', files);
    // In a real app, these would be uploaded to the server
  }, []);

  const handleUploadComplete = useCallback((uploadedFiles: any[]) => {
    console.log('Files uploaded successfully:', uploadedFiles);
    // Add uploaded files to the gallery
    const newFiles: MediaFile[] = uploadedFiles.map(file => ({
      id: file.id,
      name: file.name,
      url: file.url,
      type: file.type,
      size: file.size,
      mimeType: file.type,
      metadata: { createdAt: Date.now() }
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleFileDelete = useCallback((file: MediaFile) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== file.id));
    console.log('File deleted:', file.name);
  }, []);

  const handleFileShare = useCallback((file: MediaFile) => {
    if (navigator.share) {
      navigator.share({
        title: file.name,
        url: file.url,
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(file.url).then(() => {
        console.log('File URL copied to clipboard');
      }).catch(console.error);
    }
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'renderer':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Select a Media File</h3>
                <div className="grid grid-cols-2 gap-2">
                  {sampleMediaFiles.slice(0, 4).map((file) => (
                    <Button
                      key={file.id}
                      variant={selectedFile?.id === file.id ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedFile(file)}
                      className="flex items-center gap-2 text-left justify-start"
                    >
                      {file.mimeType.startsWith('image/') && <ImageIcon size={16} />}
                      {file.mimeType.startsWith('video/') && <Video size={16} />}
                      {file.mimeType.startsWith('audio/') && <Music size={16} />}
                      {file.mimeType === 'application/pdf' && <FileText size={16} />}
                      <span className="truncate">{file.name}</span>
                    </Button>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Features</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Zap className="text-yellow-500" size={16} />
                    <span>Real-time media processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="text-blue-500" size={16} />
                    <span>Multi-format support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="text-green-500" size={16} />
                    <span>Optimized caching</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="text-purple-500" size={16} />
                    <span>Auto-sync capabilities</span>
                  </div>
                </div>
              </Card>
            </div>

            {selectedFile && (
              <MediaRenderer
                file={selectedFile}
                controls={true}
                autoPlay={false}
                maxWidth={800}
                maxHeight={600}
                onLoad={() => console.log('Media loaded:', selectedFile.name)}
                onError={(error) => console.error('Media error:', error)}
                onPlay={() => console.log('Media playing:', selectedFile.name)}
                onPause={() => console.log('Media paused:', selectedFile.name)}
              />
            )}
          </div>
        );

      case 'gallery':
        return (
          <MediaGallery
            files={uploadedFiles}
            viewMode="grid"
            allowDelete={true}
            allowDownload={true}
            allowShare={true}
            onFileSelect={setSelectedFile}
            onFileDelete={handleFileDelete}
            onFileShare={handleFileShare}
          />
        );

      case 'upload':
        return (
          <div className="space-y-6">
            <FileUpload
              onFilesSelect={handleFileUpload}
              onUploadComplete={handleUploadComplete}
              onUploadError={(error) => console.error('Upload error:', error)}
              maxFiles={10}
              maxFileSize={50 * 1024 * 1024} // 50MB
              allowedTypes={['image/*', 'video/*', 'audio/*', 'application/pdf']}
              allowedExtensions={['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov', '.mp3', '.wav', '.pdf']}
              multiple={true}
              autoUpload={false}
              showPreview={true}
            />

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Upload Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Supported Formats</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Images: JPG, PNG, GIF, WebP</li>
                    <li>• Videos: MP4, MOV, AVI, WebM</li>
                    <li>• Audio: MP3, WAV, OGG, AAC</li>
                    <li>• Documents: PDF, TXT, DOC</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Features</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Drag & drop interface</li>
                    <li>• Progress tracking</li>
                    <li>• File validation</li>
                    <li>• Preview generation</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'realtime':
        return (
          <div className="space-y-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Real-Time Synchronization</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                    syncState.isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <p className="text-sm font-medium">Connection</p>
                  <p className="text-xs text-muted-foreground">
                    {syncState.isConnected ? 'Connected' : 'Disconnected'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {syncState.pendingUpdates}
                  </div>
                  <p className="text-sm font-medium">Pending Updates</p>
                  <p className="text-xs text-muted-foreground">
                    Optimistic changes
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {syncState.conflicts.length}
                  </div>
                  <p className="text-sm font-medium">Conflicts</p>
                  <p className="text-xs text-muted-foreground">
                    Require resolution
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button onClick={syncActions.refresh} size="sm">
                  <RefreshCw size={16} className="mr-2" />
                  Refresh
                </Button>
                <Button onClick={syncActions.forceSync} variant="outline" size="sm">
                  Force Sync
                </Button>
                <Button onClick={syncActions.clearError} variant="outline" size="sm">
                  Clear Errors
                </Button>
              </div>

              {syncState.lastSync && (
                <p className="text-xs text-muted-foreground mt-4">
                  Last sync: {syncState.lastSync.toLocaleTimeString()}
                </p>
              )}
            </Card>

            {syncState.error && (
              <Card className="p-4 border-red-200 bg-red-50">
                <h4 className="font-medium text-red-800 mb-2">Sync Error</h4>
                <p className="text-sm text-red-700">{syncState.error}</p>
              </Card>
            )}

            {syncState.conflicts.length > 0 && (
              <Card className="p-4 border-yellow-200 bg-yellow-50">
                <h4 className="font-medium text-yellow-800 mb-4">Conflicts Detected</h4>
                <div className="space-y-3">
                  {syncState.conflicts.map((conflict) => (
                    <div key={conflict.id} className="bg-white p-3 rounded border">
                      <p className="text-sm font-medium mb-2">Conflict ID: {conflict.id}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => syncActions.resolveConflict(conflict.id, 'local')}
                        >
                          Use Local
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => syncActions.resolveConflict(conflict.id, 'server')}
                        >
                          Use Server
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Multimodal Demo</h1>
          <p className="text-muted-foreground mt-2">
            Showcase of enhanced media rendering, file management, and real-time synchronization capabilities
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: 'renderer', label: 'Media Renderer', icon: ImageIcon },
            { id: 'gallery', label: 'Media Gallery', icon: Video },
            { id: 'upload', label: 'File Upload', icon: Upload },
            { id: 'realtime', label: 'Real-Time Sync', icon: RefreshCw },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {renderTabContent()}
      </div>
    </div>
  );
};
