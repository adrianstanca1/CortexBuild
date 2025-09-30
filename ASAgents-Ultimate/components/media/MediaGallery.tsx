import React, { useState, useCallback, useMemo } from 'react';
import { MediaRenderer, type MediaFile } from './MediaRenderer';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { 
  Grid, 
  List, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  X,
  Download,
  Share2,
  Trash2,
  Eye,
  MoreHorizontal
} from 'lucide-react';

interface MediaGalleryProps {
  files: MediaFile[];
  className?: string;
  viewMode?: 'grid' | 'list';
  allowDelete?: boolean;
  allowDownload?: boolean;
  allowShare?: boolean;
  onFileSelect?: (file: MediaFile) => void;
  onFileDelete?: (file: MediaFile) => void;
  onFileShare?: (file: MediaFile) => void;
  onFilesUpload?: (files: File[]) => void;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  files,
  className = '',
  viewMode: initialViewMode = 'grid',
  allowDelete = false,
  allowDownload = true,
  allowShare = false,
  onFileSelect,
  onFileDelete,
  onFileShare,
  onFilesUpload,
}) => {
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const mediaTypes = useMemo(() => {
    const types = new Set(files.map(file => {
      const mimeType = file.mimeType.toLowerCase();
      if (mimeType.startsWith('image/')) return 'image';
      if (mimeType.startsWith('video/')) return 'video';
      if (mimeType.startsWith('audio/')) return 'audio';
      if (mimeType === 'application/pdf') return 'pdf';
      return 'other';
    }));
    return Array.from(types);
  }, [files]);

  const filteredAndSortedFiles = useMemo(() => {
    let filtered = files;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(file => {
        const mimeType = file.mimeType.toLowerCase();
        switch (filterType) {
          case 'image': return mimeType.startsWith('image/');
          case 'video': return mimeType.startsWith('video/');
          case 'audio': return mimeType.startsWith('audio/');
          case 'pdf': return mimeType === 'application/pdf';
          case 'other': return !mimeType.startsWith('image/') && 
                              !mimeType.startsWith('video/') && 
                              !mimeType.startsWith('audio/') && 
                              mimeType !== 'application/pdf';
          default: return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'type':
          comparison = a.mimeType.localeCompare(b.mimeType);
          break;
        case 'date':
          // Assuming files have a createdAt or similar field
          comparison = (a.metadata?.createdAt || 0) - (b.metadata?.createdAt || 0);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [files, searchQuery, filterType, sortBy, sortOrder]);

  const handleFileClick = useCallback((file: MediaFile) => {
    setSelectedFile(file);
    onFileSelect?.(file);
  }, [onFileSelect]);

  const handleCloseModal = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const handleDelete = useCallback((file: MediaFile, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
      onFileDelete?.(file);
    }
  }, [onFileDelete]);

  const handleShare = useCallback((file: MediaFile, event: React.MouseEvent) => {
    event.stopPropagation();
    onFileShare?.(file);
  }, [onFileShare]);

  const handleDownload = useCallback((file: MediaFile, event: React.MouseEvent) => {
    event.stopPropagation();
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const getFileIcon = useCallback((mimeType: string) => {
    const type = mimeType.toLowerCase();
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type === 'application/pdf') return '📄';
    return '📁';
  }, []);

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredAndSortedFiles.map((file) => (
        <Card
          key={file.id}
          className="cursor-pointer hover:shadow-lg transition-shadow group"
          onClick={() => handleFileClick(file)}
        >
          <div className="aspect-square relative overflow-hidden rounded-t-lg">
            {file.thumbnail ? (
              <img
                src={file.thumbnail}
                alt={file.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-4xl">
                {getFileIcon(file.mimeType)}
              </div>
            )}
            
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" className="bg-white/90">
                <Eye size={16} />
              </Button>
              {allowDownload && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/90"
                  onClick={(e) => handleDownload(file, e)}
                >
                  <Download size={16} />
                </Button>
              )}
              {allowShare && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/90"
                  onClick={(e) => handleShare(file, e)}
                >
                  <Share2 size={16} />
                </Button>
              )}
              {allowDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/90 text-red-600 hover:bg-red-50"
                  onClick={(e) => handleDelete(file, e)}
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          </div>
          
          <div className="p-3">
            <h3 className="font-medium text-sm truncate" title={file.name}>
              {file.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {formatFileSize(file.size)}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-2">
      {filteredAndSortedFiles.map((file) => (
        <Card
          key={file.id}
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => handleFileClick(file)}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex-shrink-0">
              {file.thumbnail ? (
                <img
                  src={file.thumbnail}
                  alt={file.name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center text-xl">
                  {getFileIcon(file.mimeType)}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{file.name}</h3>
              <p className="text-sm text-muted-foreground">
                {file.mimeType} • {formatFileSize(file.size)}
                {file.dimensions && ` • ${file.dimensions.width}×${file.dimensions.height}`}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {allowDownload && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDownload(file, e)}
                >
                  <Download size={16} />
                </Button>
              )}
              {allowShare && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleShare(file, e)}
                >
                  <Share2 size={16} />
                </Button>
              )}
              {allowDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                  onClick={(e) => handleDelete(file, e)}
                >
                  <Trash2 size={16} />
                </Button>
              )}
              <Button variant="ghost" size="sm">
                <MoreHorizontal size={16} />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Types</option>
            {mediaTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
          
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as any);
              setSortOrder(order as any);
            }}
            className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="size-asc">Size (Small)</option>
            <option value="size-desc">Size (Large)</option>
            <option value="type-asc">Type A-Z</option>
            <option value="type-desc">Type Z-A</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid size={16} />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List size={16} />
          </Button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredAndSortedFiles.length} of {files.length} files
      </div>

      {/* File grid/list */}
      {filteredAndSortedFiles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No files found</p>
        </div>
      ) : (
        viewMode === 'grid' ? renderGridView() : renderListView()
      )}

      {/* Modal for selected file */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10"
            >
              <X size={16} />
            </Button>
            
            <MediaRenderer
              file={selectedFile}
              className="border-0 shadow-none"
              controls={true}
              maxWidth={800}
              maxHeight={600}
            />
          </div>
        </div>
      )}
    </div>
  );
};
