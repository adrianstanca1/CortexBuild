// Advanced Multimodal Search and Retrieval Service
// Semantic search, visual similarity, audio content search, and cross-modal queries

import { MultimodalContent, MediaType, ProcessingResult } from '../types/multimodal';

export interface SearchQuery {
  text?: string;
  mediaType?: MediaType | MediaType[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  similarity?: {
    contentId: string;
    threshold: number;
  };
  filters?: SearchFilters;
  sortBy?: 'relevance' | 'date' | 'size' | 'similarity';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SearchFilters {
  fileSize?: { min?: number; max?: number };
  duration?: { min?: number; max?: number };
  dimensions?: { minWidth?: number; maxWidth?: number; minHeight?: number; maxHeight?: number };
  quality?: { min?: number; max?: number };
  confidence?: { min?: number; max?: number };
  hasText?: boolean;
  hasFaces?: boolean;
  hasObjects?: boolean;
  language?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface SearchResult {
  content: MultimodalContent;
  score: number;
  highlights?: string[];
  similarityScore?: number;
  matchedFields: string[];
  explanation?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  took: number; // milliseconds
  aggregations?: SearchAggregations;
  suggestions?: string[];
}

export interface SearchAggregations {
  mediaTypes: Record<MediaType, number>;
  tags: Record<string, number>;
  dateHistogram: Array<{ date: string; count: number }>;
  sizeRanges: Array<{ range: string; count: number }>;
}

export interface SearchIndex {
  contentId: string;
  text: string;
  embeddings: number[];
  metadata: Record<string, any>;
  tags: string[];
  mediaType: MediaType;
  createdAt: Date;
  features: ContentFeatures;
}

export interface ContentFeatures {
  textFeatures?: {
    keywords: string[];
    entities: string[];
    sentiment: number;
    language: string;
    topics: string[];
  };
  visualFeatures?: {
    colors: string[];
    objects: string[];
    faces: number;
    scenes: string[];
    aestheticScore: number;
  };
  audioFeatures?: {
    tempo: number;
    key: string;
    loudness: number;
    speechRatio: number;
    emotions: string[];
  };
  videoFeatures?: {
    scenes: string[];
    motionLevel: number;
    qualityScore: number;
    audioTrack: boolean;
  };
}

class MultimodalSearchService {
  private searchIndex: Map<string, SearchIndex> = new Map();
  private embeddings: Map<string, number[]> = new Map();
  private invertedIndex: Map<string, Set<string>> = new Map();

  constructor() {
    this.initializeSearch();
  }

  private async initializeSearch(): Promise<void> {
    console.log('Initializing multimodal search service...');
    // In a real implementation, this would connect to Elasticsearch, Pinecone, or similar
  }

  // Index content for search
  async indexContent(content: MultimodalContent, processingResult: ProcessingResult): Promise<void> {
    try {
      // Extract searchable text
      const searchableText = this.extractSearchableText(content, processingResult);
      
      // Generate embeddings
      const embeddings = await this.generateEmbeddings(searchableText);
      
      // Extract features
      const features = this.extractContentFeatures(processingResult);
      
      // Create search index entry
      const indexEntry: SearchIndex = {
        contentId: content.id,
        text: searchableText,
        embeddings,
        metadata: content.metadata,
        tags: content.tags || [],
        mediaType: content.type,
        createdAt: new Date(content.createdAt),
        features
      };
      
      // Add to search index
      this.searchIndex.set(content.id, indexEntry);
      this.embeddings.set(content.id, embeddings);
      
      // Update inverted index
      this.updateInvertedIndex(content.id, searchableText, content.tags || []);
      
      console.log(`Indexed content: ${content.id}`);
    } catch (error) {
      console.error('Indexing error:', error);
      throw new Error(`Failed to index content: ${error}`);
    }
  }

  // Main search method
  async search(query: SearchQuery): Promise<SearchResponse> {
    const startTime = Date.now();
    
    try {
      // Parse and validate query
      const normalizedQuery = this.normalizeQuery(query);
      
      // Get candidate results
      let candidates = await this.getCandidates(normalizedQuery);
      
      // Apply filters
      candidates = this.applyFilters(candidates, normalizedQuery.filters);
      
      // Score and rank results
      const scoredResults = await this.scoreResults(candidates, normalizedQuery);
      
      // Sort results
      const sortedResults = this.sortResults(scoredResults, normalizedQuery.sortBy, normalizedQuery.sortOrder);
      
      // Apply pagination
      const paginatedResults = this.paginateResults(sortedResults, normalizedQuery.offset, normalizedQuery.limit);
      
      // Generate aggregations
      const aggregations = this.generateAggregations(candidates);
      
      // Generate suggestions
      const suggestions = await this.generateSuggestions(normalizedQuery.text);
      
      const took = Date.now() - startTime;
      
      return {
        results: paginatedResults,
        total: sortedResults.length,
        took,
        aggregations,
        suggestions
      };
    } catch (error) {
      console.error('Search error:', error);
      throw new Error(`Search failed: ${error}`);
    }
  }

  // Semantic similarity search
  async findSimilar(contentId: string, threshold: number = 0.7, limit: number = 10): Promise<SearchResult[]> {
    const targetEmbeddings = this.embeddings.get(contentId);
    if (!targetEmbeddings) {
      throw new Error(`Content not found: ${contentId}`);
    }
    
    const similarities: Array<{ contentId: string; score: number }> = [];
    
    // Calculate cosine similarity with all other content
    for (const [id, embeddings] of this.embeddings.entries()) {
      if (id === contentId) continue;
      
      const similarity = this.cosineSimilarity(targetEmbeddings, embeddings);
      if (similarity >= threshold) {
        similarities.push({ contentId: id, score: similarity });
      }
    }
    
    // Sort by similarity score
    similarities.sort((a, b) => b.score - a.score);
    
    // Convert to search results
    const results: SearchResult[] = [];
    for (const { contentId: id, score } of similarities.slice(0, limit)) {
      const indexEntry = this.searchIndex.get(id);
      if (indexEntry) {
        // Get full content (in real implementation, fetch from database)
        const content = await this.getContentById(id);
        if (content) {
          results.push({
            content,
            score,
            similarityScore: score,
            matchedFields: ['embeddings'],
            explanation: `${Math.round(score * 100)}% similar based on content analysis`
          });
        }
      }
    }
    
    return results;
  }

  // Cross-modal search (e.g., search images using text description)
  async crossModalSearch(query: string, targetMediaType: MediaType, limit: number = 20): Promise<SearchResult[]> {
    // Generate embeddings for the text query
    const queryEmbeddings = await this.generateEmbeddings(query);
    
    const results: Array<{ content: MultimodalContent; score: number }> = [];
    
    // Search across the target media type
    for (const [contentId, indexEntry] of this.searchIndex.entries()) {
      if (indexEntry.mediaType === targetMediaType) {
        const similarity = this.cosineSimilarity(queryEmbeddings, indexEntry.embeddings);
        
        // Get full content
        const content = await this.getContentById(contentId);
        if (content) {
          results.push({ content, score: similarity });
        }
      }
    }
    
    // Sort by relevance
    results.sort((a, b) => b.score - a.score);
    
    return results.slice(0, limit).map(({ content, score }) => ({
      content,
      score,
      matchedFields: ['cross-modal'],
      explanation: `Cross-modal match: "${query}" → ${targetMediaType}`
    }));
  }

  // Visual similarity search for images
  async visualSimilaritySearch(imageId: string, threshold: number = 0.8): Promise<SearchResult[]> {
    const targetIndex = this.searchIndex.get(imageId);
    if (!targetIndex || targetIndex.mediaType !== 'image') {
      throw new Error('Invalid image ID for visual similarity search');
    }
    
    const targetFeatures = targetIndex.features.visualFeatures;
    if (!targetFeatures) {
      throw new Error('No visual features available for comparison');
    }
    
    const results: SearchResult[] = [];
    
    for (const [contentId, indexEntry] of this.searchIndex.entries()) {
      if (contentId === imageId || indexEntry.mediaType !== 'image') continue;
      
      const features = indexEntry.features.visualFeatures;
      if (!features) continue;
      
      // Calculate visual similarity based on multiple factors
      const colorSimilarity = this.calculateColorSimilarity(targetFeatures.colors, features.colors);
      const objectSimilarity = this.calculateObjectSimilarity(targetFeatures.objects, features.objects);
      const sceneSimilarity = this.calculateSceneSimilarity(targetFeatures.scenes, features.scenes);
      
      const overallSimilarity = (colorSimilarity + objectSimilarity + sceneSimilarity) / 3;
      
      if (overallSimilarity >= threshold) {
        const content = await this.getContentById(contentId);
        if (content) {
          results.push({
            content,
            score: overallSimilarity,
            similarityScore: overallSimilarity,
            matchedFields: ['visual_features'],
            explanation: `Visual similarity: ${Math.round(overallSimilarity * 100)}%`
          });
        }
      }
    }
    
    return results.sort((a, b) => b.score - a.score);
  }

  // Audio content search
  async audioContentSearch(query: string, filters?: { tempo?: number; key?: string; emotion?: string }): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    for (const [contentId, indexEntry] of this.searchIndex.entries()) {
      if (indexEntry.mediaType !== 'audio') continue;
      
      const audioFeatures = indexEntry.features.audioFeatures;
      if (!audioFeatures) continue;
      
      let score = 0;
      const matchedFields: string[] = [];
      
      // Text-based matching (transcription, metadata)
      if (indexEntry.text.toLowerCase().includes(query.toLowerCase())) {
        score += 0.5;
        matchedFields.push('transcription');
      }
      
      // Feature-based matching
      if (filters) {
        if (filters.tempo && Math.abs(audioFeatures.tempo - filters.tempo) < 20) {
          score += 0.3;
          matchedFields.push('tempo');
        }
        
        if (filters.key && audioFeatures.key === filters.key) {
          score += 0.2;
          matchedFields.push('key');
        }
        
        if (filters.emotion && audioFeatures.emotions.includes(filters.emotion)) {
          score += 0.4;
          matchedFields.push('emotion');
        }
      }
      
      if (score > 0) {
        const content = await this.getContentById(contentId);
        if (content) {
          results.push({
            content,
            score,
            matchedFields,
            explanation: `Audio content match: ${matchedFields.join(', ')}`
          });
        }
      }
    }
    
    return results.sort((a, b) => b.score - a.score);
  }

  // Helper methods
  private extractSearchableText(content: MultimodalContent, result: ProcessingResult): string {
    const textParts: string[] = [];
    
    // Add content text if available
    if (content.text) {
      textParts.push(content.text);
    }
    
    // Add processing results
    if (result.textAnalysis?.extractedText) {
      textParts.push(result.textAnalysis.extractedText);
    }
    
    if (result.imageAnalysis?.ocrText) {
      textParts.push(result.imageAnalysis.ocrText);
    }
    
    if (result.audioAnalysis?.transcription) {
      textParts.push(result.audioAnalysis.transcription);
    }
    
    // Add metadata
    if (content.metadata.title) {
      textParts.push(content.metadata.title);
    }
    
    if (content.metadata.description) {
      textParts.push(content.metadata.description);
    }
    
    // Add tags
    if (content.tags) {
      textParts.push(...content.tags);
    }
    
    return textParts.join(' ').toLowerCase();
  }

  private async generateEmbeddings(text: string): Promise<number[]> {
    // In a real implementation, this would use a proper embedding model
    // For now, return a simple hash-based embedding
    const hash = this.simpleHash(text);
    const embeddings: number[] = [];
    
    for (let i = 0; i < 384; i++) {
      embeddings.push(Math.sin(hash + i) * 0.5 + 0.5);
    }
    
    return embeddings;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private extractContentFeatures(result: ProcessingResult): ContentFeatures {
    const features: ContentFeatures = {};
    
    if (result.textAnalysis) {
      features.textFeatures = {
        keywords: result.textAnalysis.keywords || [],
        entities: result.textAnalysis.entities || [],
        sentiment: result.textAnalysis.sentiment || 0,
        language: result.textAnalysis.language || 'en',
        topics: result.textAnalysis.topics || []
      };
    }
    
    if (result.imageAnalysis) {
      features.visualFeatures = {
        colors: result.imageAnalysis.dominantColors || [],
        objects: result.imageAnalysis.detectedObjects || [],
        faces: result.imageAnalysis.faceCount || 0,
        scenes: result.imageAnalysis.sceneLabels || [],
        aestheticScore: result.imageAnalysis.qualityScore || 0
      };
    }
    
    if (result.audioAnalysis) {
      features.audioFeatures = {
        tempo: result.audioAnalysis.tempo || 0,
        key: result.audioAnalysis.key || '',
        loudness: result.audioAnalysis.loudness || 0,
        speechRatio: result.audioAnalysis.speechRatio || 0,
        emotions: result.audioAnalysis.emotions || []
      };
    }
    
    if (result.videoAnalysis) {
      features.videoFeatures = {
        scenes: result.videoAnalysis.sceneLabels || [],
        motionLevel: result.videoAnalysis.motionLevel || 0,
        qualityScore: result.videoAnalysis.qualityScore || 0,
        audioTrack: result.videoAnalysis.hasAudio || false
      };
    }
    
    return features;
  }

  private updateInvertedIndex(contentId: string, text: string, tags: string[]): void {
    // Tokenize text
    const tokens = text.toLowerCase().split(/\s+/).filter(token => token.length > 2);
    
    // Add tokens to inverted index
    for (const token of [...tokens, ...tags]) {
      if (!this.invertedIndex.has(token)) {
        this.invertedIndex.set(token, new Set());
      }
      this.invertedIndex.get(token)!.add(contentId);
    }
  }

  private normalizeQuery(query: SearchQuery): SearchQuery {
    return {
      ...query,
      limit: query.limit || 20,
      offset: query.offset || 0,
      sortBy: query.sortBy || 'relevance',
      sortOrder: query.sortOrder || 'desc'
    };
  }

  private async getCandidates(query: SearchQuery): Promise<string[]> {
    if (query.text) {
      // Text-based search using inverted index
      const tokens = query.text.toLowerCase().split(/\s+/);
      const candidateSets = tokens.map(token => this.invertedIndex.get(token) || new Set());
      
      // Intersection of all token matches
      if (candidateSets.length === 0) return [];
      
      let candidates = candidateSets[0];
      for (let i = 1; i < candidateSets.length; i++) {
        candidates = new Set([...candidates].filter(id => candidateSets[i].has(id)));
      }
      
      return Array.from(candidates);
    } else {
      // Return all content IDs
      return Array.from(this.searchIndex.keys());
    }
  }

  private applyFilters(candidates: string[], filters?: SearchFilters): string[] {
    if (!filters) return candidates;
    
    return candidates.filter(contentId => {
      const indexEntry = this.searchIndex.get(contentId);
      if (!indexEntry) return false;
      
      // Apply various filters
      if (filters.fileSize) {
        const size = indexEntry.metadata.fileSize || 0;
        if (filters.fileSize.min && size < filters.fileSize.min) return false;
        if (filters.fileSize.max && size > filters.fileSize.max) return false;
      }
      
      if (filters.hasText && !indexEntry.text) return false;
      if (filters.hasFaces && (!indexEntry.features.visualFeatures || indexEntry.features.visualFeatures.faces === 0)) return false;
      
      return true;
    });
  }

  private async scoreResults(candidates: string[], query: SearchQuery): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    for (const contentId of candidates) {
      const indexEntry = this.searchIndex.get(contentId);
      if (!indexEntry) continue;
      
      const content = await this.getContentById(contentId);
      if (!content) continue;
      
      // Calculate relevance score
      let score = 0;
      const matchedFields: string[] = [];
      
      if (query.text) {
        const textScore = this.calculateTextScore(query.text, indexEntry.text);
        score += textScore;
        if (textScore > 0) matchedFields.push('text');
      }
      
      results.push({
        content,
        score,
        matchedFields,
        explanation: `Relevance score: ${Math.round(score * 100)}%`
      });
    }
    
    return results;
  }

  private calculateTextScore(query: string, text: string): number {
    const queryTokens = query.toLowerCase().split(/\s+/);
    const textTokens = text.toLowerCase().split(/\s+/);
    
    let matches = 0;
    for (const token of queryTokens) {
      if (textTokens.includes(token)) {
        matches++;
      }
    }
    
    return matches / queryTokens.length;
  }

  private sortResults(results: SearchResult[], sortBy?: string, sortOrder?: string): SearchResult[] {
    const order = sortOrder === 'asc' ? 1 : -1;
    
    return results.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return order * (new Date(a.content.createdAt).getTime() - new Date(b.content.createdAt).getTime());
        case 'size':
          return order * ((a.content.metadata.fileSize || 0) - (b.content.metadata.fileSize || 0));
        case 'similarity':
          return order * ((a.similarityScore || 0) - (b.similarityScore || 0));
        default: // relevance
          return order * (b.score - a.score);
      }
    });
  }

  private paginateResults(results: SearchResult[], offset?: number, limit?: number): SearchResult[] {
    const start = offset || 0;
    const end = start + (limit || 20);
    return results.slice(start, end);
  }

  private generateAggregations(candidates: string[]): SearchAggregations {
    const mediaTypes: Record<MediaType, number> = {
      text: 0, image: 0, audio: 0, video: 0, document: 0, mixed: 0
    };
    const tags: Record<string, number> = {};
    
    for (const contentId of candidates) {
      const indexEntry = this.searchIndex.get(contentId);
      if (!indexEntry) continue;
      
      mediaTypes[indexEntry.mediaType]++;
      
      for (const tag of indexEntry.tags) {
        tags[tag] = (tags[tag] || 0) + 1;
      }
    }
    
    return {
      mediaTypes,
      tags,
      dateHistogram: [], // Would be implemented with proper date aggregation
      sizeRanges: [] // Would be implemented with size range aggregation
    };
  }

  private async generateSuggestions(query?: string): Promise<string[]> {
    // Simple suggestion generation
    if (!query) return [];
    
    const suggestions: string[] = [];
    const queryLower = query.toLowerCase();
    
    // Find similar terms in the index
    for (const term of this.invertedIndex.keys()) {
      if (term.includes(queryLower) && term !== queryLower) {
        suggestions.push(term);
      }
    }
    
    return suggestions.slice(0, 5);
  }

  private calculateColorSimilarity(colors1: string[], colors2: string[]): number {
    const intersection = colors1.filter(color => colors2.includes(color));
    const union = [...new Set([...colors1, ...colors2])];
    return intersection.length / union.length;
  }

  private calculateObjectSimilarity(objects1: string[], objects2: string[]): number {
    const intersection = objects1.filter(obj => objects2.includes(obj));
    const union = [...new Set([...objects1, ...objects2])];
    return intersection.length / union.length;
  }

  private calculateSceneSimilarity(scenes1: string[], scenes2: string[]): number {
    const intersection = scenes1.filter(scene => scenes2.includes(scene));
    const union = [...new Set([...scenes1, ...scenes2])];
    return intersection.length / union.length;
  }

  private async getContentById(contentId: string): Promise<MultimodalContent | null> {
    // In a real implementation, this would fetch from the database
    // For now, return a mock content object
    const indexEntry = this.searchIndex.get(contentId);
    if (!indexEntry) return null;
    
    return {
      id: contentId,
      type: indexEntry.mediaType,
      text: indexEntry.text,
      metadata: indexEntry.metadata,
      tags: indexEntry.tags,
      createdAt: indexEntry.createdAt.toISOString(),
      updatedAt: indexEntry.createdAt.toISOString()
    };
  }

  // Public API methods
  async removeFromIndex(contentId: string): Promise<void> {
    this.searchIndex.delete(contentId);
    this.embeddings.delete(contentId);
    
    // Remove from inverted index
    for (const [term, contentIds] of this.invertedIndex.entries()) {
      contentIds.delete(contentId);
      if (contentIds.size === 0) {
        this.invertedIndex.delete(term);
      }
    }
  }

  async updateIndex(contentId: string, content: MultimodalContent, processingResult: ProcessingResult): Promise<void> {
    await this.removeFromIndex(contentId);
    await this.indexContent(content, processingResult);
  }

  getIndexStats(): { totalContent: number; totalTerms: number; indexSize: number } {
    return {
      totalContent: this.searchIndex.size,
      totalTerms: this.invertedIndex.size,
      indexSize: JSON.stringify(Array.from(this.searchIndex.values())).length
    };
  }
}

// Export singleton instance
export const multimodalSearch = new MultimodalSearchService();
export { MultimodalSearchService };
