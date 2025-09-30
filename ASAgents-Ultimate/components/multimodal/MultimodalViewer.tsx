import React, { useState, useCallback } from 'react';
import { MultimodalContent, ProcessingResults } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';

interface MultimodalViewerProps {
  content: MultimodalContent;
  results?: ProcessingResults;
  onReprocess: (contentId: string) => void;
  onDelete: (contentId: string) => void;
  className?: string;
}

export const MultimodalViewer: React.FC<MultimodalViewerProps> = ({
  content,
  results,
  onReprocess,
  onDelete,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'analysis' | 'metadata'>('content');

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'processing': return 'blue';
      case 'failed': return 'red';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  }, []);

  const renderContentPreview = useCallback(() => {
    switch (content.type) {
      case 'image':
        return (
          <div className="space-y-4">
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-gray-500">🖼️ Image Preview</div>
            </div>
            {content.metadata?.dimensions && (
              <p className="text-sm text-gray-600">
                Dimensions: {content.metadata.dimensions.width} × {content.metadata.dimensions.height}
              </p>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="space-y-4">
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-gray-500">🎥 Video Preview</div>
            </div>
            <p className="text-sm text-gray-600">Video content</p>
          </div>
        );

      case 'audio':
        return (
          <div className="space-y-4">
            <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-gray-500">🎵 Audio Preview</div>
            </div>
            <p className="text-sm text-gray-600">Audio content</p>
          </div>
        );

      case 'document':
        return (
          <div className="space-y-4">
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-gray-500">📄 Document Preview</div>
            </div>
            <p className="text-sm text-gray-600">Document content</p>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                {content.metadata?.textContent || 'Text content'}
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-gray-500">📁 Content Preview</div>
          </div>
        );
    }
  }, [content]);

  const renderAnalysisResults = useCallback(() => {
    if (!results) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No analysis results available</p>
          <Button onClick={() => onReprocess(content.id)} className="mt-4">
            Run Analysis
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Analysis Summary */}
        <Card>
          <h4 className="font-semibold mb-3">Analysis Summary</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">AI Provider</p>
              <p className="font-medium">{results.aiProvider}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Model Version</p>
              <p className="font-medium">{results.modelVersion}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Confidence</p>
              <p className="font-medium">{(results.confidence * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Processing Time</p>
              <p className="font-medium">{results.processingTime}ms</p>
            </div>
          </div>
        </Card>

        {/* Type-specific Analysis */}
        {results.imageAnalysis && (
          <Card>
            <h4 className="font-semibold mb-3">Image Analysis</h4>
            <div className="space-y-3">
              {results.imageAnalysis.objects && results.imageAnalysis.objects.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Detected Objects:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {results.imageAnalysis.objects.map((obj, index) => (
                      <Tag
                        key={index}
                        label={`${obj.name} (${(obj.confidence * 100).toFixed(1)}%)`}
                        color="blue"
                      />
                    ))}
                  </div>
                </div>
              )}

              {results.imageAnalysis.text && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Extracted Text:</p>
                  <p className="text-sm text-gray-600 mt-1">{results.imageAnalysis.text}</p>
                </div>
              )}

              {results.imageAnalysis.description && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Description:</p>
                  <p className="text-sm text-gray-600 mt-1">{results.imageAnalysis.description}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {results.textAnalysis && (
          <Card>
            <h4 className="font-semibold mb-3">Text Analysis</h4>
            <div className="space-y-3">
              {results.textAnalysis.sentiment && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Sentiment:</p>
                  <Tag
                    label={`${results.textAnalysis.sentiment.label} (${(results.textAnalysis.sentiment.score * 100).toFixed(1)}%)`}
                    color={results.textAnalysis.sentiment.label === 'positive' ? 'green' :
                      results.textAnalysis.sentiment.label === 'negative' ? 'red' : 'yellow'}
                  />
                </div>
              )}

              {results.textAnalysis.entities && results.textAnalysis.entities.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Entities:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {results.textAnalysis.entities.map((entity, index) => (
                      <Tag
                        key={index}
                        label={`${entity.text} (${entity.type})`}
                        color="purple"
                      />
                    ))}
                  </div>
                </div>
              )}

              {results.textAnalysis.summary && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Summary:</p>
                  <p className="text-sm text-gray-600 mt-1">{results.textAnalysis.summary}</p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    );
  }, [results, content.id, onReprocess]);

  const renderMetadata = useCallback(() => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Content ID</p>
            <p className="font-mono text-sm">{content.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Type</p>
            <Tag label={content.type} color="blue" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <Tag label={content.status} color={getStatusColor(content.status)} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Created</p>
            <p className="text-sm">{new Date(content.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {content.metadata && (
          <div className="space-y-3">
            <h4 className="font-semibold">File Information</h4>
            <div className="grid grid-cols-2 gap-4">
              {content.metadata.filename && (
                <div>
                  <p className="text-sm text-gray-600">Filename</p>
                  <p className="text-sm font-mono">{content.metadata.filename}</p>
                </div>
              )}
              {content.metadata.fileSize && (
                <div>
                  <p className="text-sm text-gray-600">File Size</p>
                  <p className="text-sm">{formatFileSize(content.metadata.fileSize)}</p>
                </div>
              )}
              {content.metadata.mimeType && (
                <div>
                  <p className="text-sm text-gray-600">MIME Type</p>
                  <p className="text-sm font-mono">{content.metadata.mimeType}</p>
                </div>
              )}
              {content.metadata.source && (
                <div>
                  <p className="text-sm text-gray-600">Source</p>
                  <p className="text-sm">{content.metadata.source}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }, [content, formatFileSize, getStatusColor]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold">Content Viewer</h3>
          <p className="text-gray-600">
            {content.metadata?.filename || `${content.type} content`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onReprocess(content.id)}
          >
            Reprocess
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(content.id)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {['content', 'analysis', 'metadata'].map((tab) => (
            <button
              type="button"
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'content' && renderContentPreview()}
        {activeTab === 'analysis' && renderAnalysisResults()}
        {activeTab === 'metadata' && renderMetadata()}
      </div>
    </div>
  );
};
