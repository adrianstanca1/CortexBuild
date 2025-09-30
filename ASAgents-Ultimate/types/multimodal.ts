// Multimodal type definitions
export interface MultimodalContent {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio';
  content: string | Blob;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface MultimodalAnalysis {
  contentId: string;
  analysis: Record<string, any>;
  confidence: number;
  timestamp: Date;
}

export interface MultimodalSearchQuery {
  query: string;
  types?: Array<'text' | 'image' | 'video' | 'audio'>;
  limit?: number;
  offset?: number;
}

export interface MultimodalSearchResult {
  content: MultimodalContent;
  score: number;
  highlights?: string[];
}

export interface MultimodalStorageConfig {
  maxFileSize: number;
  allowedTypes: string[];
  storagePath: string;
}
