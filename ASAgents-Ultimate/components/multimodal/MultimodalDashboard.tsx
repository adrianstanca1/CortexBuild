// Multimodal Dashboard Component
// Main interface for multimodal AI system

import React, { useState, useCallback, useEffect } from 'react';
import {
  MultimodalContent,
  MultimodalSearchQuery,
  MultimodalSearchResult,
  ProcessingJob,
  User
} from '../../types';
import { multimodalService } from '../../services/multimodalService';
import { MultimodalInput } from './MultimodalInput';
import { MultimodalViewer } from './MultimodalViewer';
import { MultimodalSearch } from './MultimodalSearch';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Tag } from '../ui/Tag';
import './MultimodalDashboard.css';

interface MultimodalDashboardProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  className?: string;
}

export const MultimodalDashboard: React.FC<MultimodalDashboardProps> = ({
  user,
  addToast,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'search' | 'library' | 'jobs'>('upload');
  const [contentLibrary, setContentLibrary] = useState<MultimodalContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<MultimodalContent | null>(null);
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    loadContentLibrary();
    loadProcessingJobs();
  }, []);

  // Load content library (mock implementation)
  const loadContentLibrary = useCallback(async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch from your backend
      const mockContent: MultimodalContent[] = [
        {
          id: 'content_1',
          type: 'image',
          status: 'completed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: user.id,
          metadata: {
            filename: 'construction_site.jpg',
            fileSize: 2048000,
            mimeType: 'image/jpeg',
            dimensions: { width: 1920, height: 1080 },
            source: 'upload'
          },
          description: 'Construction site overview',
          tags: ['construction', 'site', 'overview'],
          processingResults: {
            aiProvider: 'gemini',
            modelVersion: 'gemini-2.0-flash-001',
            confidence: 0.85,
            processingTime: 1500,
            imageAnalysis: {
              objects: [
                { name: 'crane', confidence: 0.9, boundingBox: { x: 100, y: 50, width: 200, height: 300 } },
                { name: 'building', confidence: 0.85, boundingBox: { x: 300, y: 100, width: 400, height: 500 } }
              ],
              faces: [],
              scenes: [{ name: 'construction site', confidence: 0.9 }],
              colors: [
                { hex: '#8B4513', percentage: 25, name: 'brown' },
                { hex: '#87CEEB', percentage: 30, name: 'sky blue' }
              ],
              safetyLabels: [],
              description: 'A busy construction site with cranes and partially built structures',
              tags: ['construction', 'industrial', 'urban development']
            }
          }
        }
      ];
      setContentLibrary(mockContent);
    } catch (error: unknown) {
      console.error('Failed to load content library:', error);
      addToast('Failed to load content library', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [user.id, addToast]);

  // Load processing jobs
  const loadProcessingJobs = useCallback(() => {
    const jobs = multimodalService.getAllJobs();
    setProcessingJobs(jobs);
  }, []);

  // Handle content submission
  const handleContentSubmit = useCallback(async (content: Partial<MultimodalContent>) => {
    try {
      // Create full content object
      const fullContent: MultimodalContent = {
        id: `content_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user.id,
        ...content
      } as MultimodalContent;

      // Add to library
      setContentLibrary(prev => [fullContent, ...prev]);

      // Start processing
      setIsLoading(true);
      const results = await multimodalService.processContent(fullContent);

      // Update content with results
      const updatedContent = {
        ...fullContent,
        status: 'completed' as const,
        processingResults: results,
        updatedAt: new Date().toISOString()
      };

      setContentLibrary(prev =>
        prev.map(c => c.id === fullContent.id ? updatedContent : c)
      );

      addToast('Content processed successfully', 'success');
      setActiveTab('library');
    } catch (error) {
      addToast('Failed to process content', 'error');
      console.error('Content processing error:', error);
    } finally {
      setIsLoading(false);
      loadProcessingJobs();
    }
  }, [user.id, addToast]);

  // Handle search
  const handleSearch = useCallback(async (query: MultimodalSearchQuery): Promise<MultimodalSearchResult[]> => {
    // Mock search implementation
    const filteredContent = contentLibrary.filter(content => {
      // Filter by media types
      if (query.filters.mediaTypes && query.filters.mediaTypes.length > 0) {
        if (!query.filters.mediaTypes.includes(content.type)) return false;
      }

      // Filter by confidence
      if (query.filters.minConfidence && content.processingResults) {
        if (content.processingResults.confidence < query.filters.minConfidence) return false;
      }

      // Text search
      if (query.text) {
        const searchText = query.text.toLowerCase();
        const contentText = [
          content.description,
          ...(content.tags || []),
          content.processingResults?.textAnalysis?.extractedText,
          content.processingResults?.imageAnalysis?.description,
          ...(content.processingResults?.imageAnalysis?.tags || [])
        ].filter(Boolean).join(' ').toLowerCase();

        if (!contentText.includes(searchText)) return false;
      }

      return true;
    });

    // Convert to search results
    const results: MultimodalSearchResult[] = filteredContent.map(content => ({
      content,
      relevanceScore: Math.random() * 0.4 + 0.6, // Mock relevance score
      matchedFields: ['description', 'tags'],
      snippet: content.description?.substring(0, 150) + '...'
    }));

    // Sort by relevance
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Apply limit
    return results.slice(0, query.limit || 20);
  }, [contentLibrary]);

  // Handle content reprocessing
  const handleReprocess = useCallback(async (contentId: string) => {
    const content = contentLibrary.find(c => c.id === contentId);
    if (!content) return;

    try {
      setIsLoading(true);
      const results = await multimodalService.processContent(content);

      const updatedContent = {
        ...content,
        processingResults: results,
        updatedAt: new Date().toISOString()
      };

      setContentLibrary(prev =>
        prev.map(c => c.id === contentId ? updatedContent : c)
      );

      addToast('Content reprocessed successfully', 'success');
    } catch (error: unknown) {
      console.error('Failed to reprocess content:', error);
      addToast('Failed to reprocess content', 'error');
    } finally {
      setIsLoading(false);
      loadProcessingJobs();
    }
  }, [contentLibrary, addToast]);

  // Handle content deletion
  const handleDelete = useCallback((contentId: string) => {
    setContentLibrary(prev => prev.filter(c => c.id !== contentId));
    if (selectedContent?.id === contentId) {
      setSelectedContent(null);
    }
    addToast('Content deleted', 'success');
  }, [selectedContent, addToast]);

  // Get status color for jobs
  const getJobStatusColor = (status: string): 'green' | 'blue' | 'red' | 'gray' | 'yellow' => {
    switch (status) {
      case 'completed': return 'green';
      case 'processing': return 'blue';
      case 'failed': return 'red';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  };

  // Tab configuration
  const tabs = [
    { id: 'upload', label: 'Upload', icon: '📤' },
    { id: 'search', label: 'Search', icon: '🔍' },
    { id: 'library', label: 'Library', icon: '📚' },
    { id: 'jobs', label: 'Jobs', icon: '⚙️' }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Multimodal AI System</h2>
          <p className="text-muted-foreground">
            Upload, analyze, and search across text, images, audio, video, and documents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tag label={`${contentLibrary.length} items`} color="blue" />
          <Tag label={`${processingJobs.filter((j: ProcessingJob) => j.status === 'processing').length} processing`} color="yellow" />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tab.id
              ? 'bg-primary text-primary-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <MultimodalInput
            onContentSubmit={handleContentSubmit}
            onError={(error: string) => addToast(error, 'error')}
          />
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <MultimodalSearch
            onSearch={handleSearch}
            onResultSelect={(result: MultimodalSearchResult) => {
              setSelectedContent(result.content);
              setActiveTab('library');
            }}
          />
        )}

        {/* Library Tab */}
        {activeTab === 'library' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content List */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Content Library</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {contentLibrary.map((content: MultimodalContent) => (
                  <button
                    key={content.id}
                    type="button"
                    className={`w-full p-3 border rounded-lg cursor-pointer transition-colors text-left ${selectedContent?.id === content.id
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted/50'
                      }`}
                    onClick={() => setSelectedContent(content)}
                    aria-label={`Select content: ${content.description || 'Untitled'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {content.type === 'text' && '📝'}
                          {content.type === 'image' && '🖼️'}
                          {content.type === 'audio' && '🎵'}
                          {content.type === 'video' && '🎥'}
                          {content.type === 'document' && '📄'}
                        </span>
                        <div>
                          <p className="font-medium text-sm">
                            {content.description || 'Untitled'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(content.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Tag
                        label={content.status}
                        color={getJobStatusColor(content.status)}
                      />
                    </div>
                  </button>
                ))}
                {contentLibrary.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No content yet. Upload some files to get started!
                  </div>
                )}
              </div>
            </Card>

            {/* Content Viewer */}
            <div>
              {selectedContent ? (
                <MultimodalViewer
                  content={selectedContent}
                  onReprocess={handleReprocess}
                  onDelete={handleDelete}
                />
              ) : (
                <Card className="p-8 text-center">
                  <div className="text-4xl mb-4">👆</div>
                  <h3 className="text-lg font-medium mb-2">Select Content</h3>
                  <p className="text-muted-foreground">
                    Choose an item from the library to view details and analysis
                  </p>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Processing Jobs</h3>
              <Button variant="secondary" size="sm" onClick={loadProcessingJobs}>
                🔄 Refresh
              </Button>
            </div>
            <div className="space-y-3">
              {processingJobs.map(job => (
                <div key={job.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{job.type}</p>
                      <p className="text-sm text-muted-foreground">
                        Content ID: {job.contentId}
                      </p>
                    </div>
                    <div className="text-right">
                      <Tag label={job.status} color={getJobStatusColor(job.status)} />
                      <p className="text-sm text-muted-foreground mt-1">
                        {job.progress}% complete
                      </p>
                    </div>
                  </div>
                  {job.status === 'processing' && (
                    <div className="mt-2">
                      <div className="progress-bar">
                        <div
                          className="progress-bar-fill"
                          data-progress={job.progress}
                        />
                      </div>
                    </div>
                  )}
                  {job.error && (
                    <p className="text-sm text-red-500 mt-2">{job.error}</p>
                  )}
                </div>
              ))}
              {processingJobs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No processing jobs
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 text-center">
            <div className="text-4xl mb-4 animate-spin">⚙️</div>
            <h3 className="text-lg font-medium mb-2">Processing...</h3>
            <p className="text-muted-foreground">
              Analyzing your content with AI
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};
