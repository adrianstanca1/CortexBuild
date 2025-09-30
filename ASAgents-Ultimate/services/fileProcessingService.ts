import uploadService, { UploadedFile } from './uploadService';
import multimodalService from './multimodalService';

interface FileProcessingResult {
  fileId: string;
  extractedText?: string;
  analysis?: string;
  metadata?: Record<string, any>;
  insights?: string[];
  status: 'completed' | 'failed' | 'processing';
  error?: string;
}

class FileProcessingService {
  private processingQueue = new Map<string, Promise<FileProcessingResult>>();

  // Process uploaded file using existing multimodal service
  async processUploadedFile(file: UploadedFile): Promise<FileProcessingResult> {
    // Check if already processing
    const existingProcess = this.processingQueue.get(file.id);
    if (existingProcess) {
      return existingProcess;
    }

    const processingPromise = this.performProcessing(file);
    this.processingQueue.set(file.id, processingPromise);

    try {
      const result = await processingPromise;
      this.processingQueue.delete(file.id);
      return result;
    } catch (error) {
      this.processingQueue.delete(file.id);
      throw error;
    }
  }

  private async performProcessing(file: UploadedFile): Promise<FileProcessingResult> {
    try {
      const fileUrl = uploadService.getFileUrl(file.id);
      
      // Create multimodal content object
      const content = {
        id: file.id,
        type: this.getContentType(file.mimetype),
        data: fileUrl,
        metadata: {
          filename: file.filename,
          originalName: file.originalName,
          size: file.size,
          category: file.category
        }
      };

      // Process with multimodal service
      const results = await multimodalService.processContent(content);

      return {
        fileId: file.id,
        extractedText: results.text?.content,
        analysis: results.analysis?.summary,
        metadata: results.metadata,
        insights: results.analysis?.insights || [],
        status: 'completed'
      };
    } catch (error) {
      console.error('File processing error:', error);
      return {
        fileId: file.id,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Processing failed'
      };
    }
  }

  private getContentType(mimeType: string): 'text' | 'image' | 'audio' | 'video' | 'document' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('text/')) return 'text';
    if (mimeType === 'application/pdf') return 'document';
    if (mimeType.includes('document') || mimeType.includes('sheet') || mimeType.includes('presentation')) {
      return 'document';
    }
    return 'document';
  }

  // Extract text from document files
  async extractText(file: UploadedFile): Promise<string> {
    try {
      const result = await this.processUploadedFile(file);
      return result.extractedText || '';
    } catch (error) {
      console.error('Text extraction error:', error);
      return '';
    }
  }

  // Analyze construction-related images
  async analyzeConstructionImage(file: UploadedFile): Promise<{
    objects: string[];
    safety_issues: string[];
    progress_indicators: string[];
    equipment: string[];
  }> {
    try {
      const result = await this.processUploadedFile(file);
      
      // Parse analysis for construction-specific insights
      const analysis = result.analysis || '';
      
      return {
        objects: this.extractObjects(analysis),
        safety_issues: this.extractSafetyIssues(analysis),
        progress_indicators: this.extractProgressIndicators(analysis),
        equipment: this.extractEquipment(analysis)
      };
    } catch (error) {
      console.error('Construction image analysis error:', error);
      return {
        objects: [],
        safety_issues: [],
        progress_indicators: [],
        equipment: []
      };
    }
  }

  private extractObjects(analysis: string): string[] {
    // Simple keyword extraction - could be enhanced with NLP
    const objectKeywords = [
      'building', 'structure', 'foundation', 'wall', 'roof', 'beam', 'column',
      'window', 'door', 'floor', 'ceiling', 'concrete', 'steel', 'wood'
    ];
    
    const found = objectKeywords.filter(keyword => 
      analysis.toLowerCase().includes(keyword)
    );
    
    return [...new Set(found)];
  }

  private extractSafetyIssues(analysis: string): string[] {
    const safetyKeywords = [
      'unsafe', 'hazard', 'danger', 'risk', 'violation', 'exposed', 'unstable',
      'missing helmet', 'no harness', 'unprotected', 'safety concern'
    ];
    
    const found = safetyKeywords.filter(keyword => 
      analysis.toLowerCase().includes(keyword)
    );
    
    return [...new Set(found)];
  }

  private extractProgressIndicators(analysis: string): string[] {
    const progressKeywords = [
      'completed', 'in progress', 'started', 'finished', 'under construction',
      'foundation laid', 'framing complete', 'roofing done', 'painting finished'
    ];
    
    const found = progressKeywords.filter(keyword => 
      analysis.toLowerCase().includes(keyword)
    );
    
    return [...new Set(found)];
  }

  private extractEquipment(analysis: string): string[] {
    const equipmentKeywords = [
      'crane', 'excavator', 'bulldozer', 'mixer', 'drill', 'saw', 'hammer',
      'scaffolding', 'ladder', 'forklift', 'generator', 'compressor'
    ];
    
    const found = equipmentKeywords.filter(keyword => 
      analysis.toLowerCase().includes(keyword)
    );
    
    return [...new Set(found)];
  }

  // Generate AI insights for multiple files
  async generateProjectInsights(files: UploadedFile[]): Promise<{
    summary: string;
    recommendations: string[];
    risks: string[];
    opportunities: string[];
  }> {
    try {
      const processedFiles = await Promise.all(
        files.map(file => this.processUploadedFile(file))
      );

      const successfulResults = processedFiles.filter(result => result.status === 'completed');
      
      if (successfulResults.length === 0) {
        return {
          summary: 'No files could be processed for insights',
          recommendations: [],
          risks: [],
          opportunities: []
        };
      }

      // Combine all analysis text
      const combinedAnalysis = successfulResults
        .map(result => result.analysis || '')
        .join(' ');

      const allInsights = successfulResults
        .flatMap(result => result.insights || []);

      return {
        summary: this.generateSummary(combinedAnalysis),
        recommendations: this.extractRecommendations(combinedAnalysis, allInsights),
        risks: this.extractRisks(combinedAnalysis, allInsights),
        opportunities: this.extractOpportunities(combinedAnalysis, allInsights)
      };
    } catch (error) {
      console.error('Project insights generation error:', error);
      return {
        summary: 'Error generating insights',
        recommendations: [],
        risks: [],
        opportunities: []
      };
    }
  }

  private generateSummary(combinedAnalysis: string): string {
    // Simple summary generation - could use AI for better results
    const sentences = combinedAnalysis.split('.').filter(s => s.trim().length > 10);
    const firstFewSentences = sentences.slice(0, 3).join('. ');
    return firstFewSentences + (sentences.length > 3 ? '.' : '');
  }

  private extractRecommendations(analysis: string, insights: string[]): string[] {
    const recommendations = insights.filter(insight => 
      insight.toLowerCase().includes('recommend') ||
      insight.toLowerCase().includes('suggest') ||
      insight.toLowerCase().includes('should')
    );

    return recommendations.length > 0 ? recommendations : [
      'Review all uploaded documents for completeness',
      'Ensure safety protocols are followed',
      'Monitor project progress regularly'
    ];
  }

  private extractRisks(analysis: string, insights: string[]): string[] {
    const risks = insights.filter(insight => 
      insight.toLowerCase().includes('risk') ||
      insight.toLowerCase().includes('danger') ||
      insight.toLowerCase().includes('hazard') ||
      insight.toLowerCase().includes('concern')
    );

    return risks.length > 0 ? risks : [
      'Review safety compliance in project documents',
      'Monitor for potential delays',
      'Ensure proper documentation is maintained'
    ];
  }

  private extractOpportunities(analysis: string, insights: string[]): string[] {
    const opportunities = insights.filter(insight => 
      insight.toLowerCase().includes('opportunity') ||
      insight.toLowerCase().includes('improve') ||
      insight.toLowerCase().includes('optimize')
    );

    return opportunities.length > 0 ? opportunities : [
      'Digitize document management processes',
      'Implement automated progress tracking',
      'Enhance team collaboration tools'
    ];
  }

  // Search within processed file content
  async searchFiles(query: string, files: UploadedFile[]): Promise<{
    results: Array<{
      fileId: string;
      fileName: string;
      relevanceScore: number;
      matchedContent: string;
      context: string;
    }>;
  }> {
    try {
      const processedFiles = await Promise.all(
        files.map(file => this.processUploadedFile(file))
      );

      const searchResults = processedFiles
        .filter(result => result.status === 'completed')
        .map(result => {
          const file = files.find(f => f.id === result.fileId);
          if (!file) return null;

          const content = result.extractedText || result.analysis || '';
          const relevanceScore = this.calculateRelevance(query, content);
          
          if (relevanceScore === 0) return null;

          const matchedContent = this.extractMatchedContent(query, content);
          
          return {
            fileId: file.id,
            fileName: file.originalName || file.filename,
            relevanceScore,
            matchedContent,
            context: this.extractContext(query, content)
          };
        })
        .filter(result => result !== null)
        .sort((a, b) => b!.relevanceScore - a!.relevanceScore);

      return {
        results: searchResults as any[]
      };
    } catch (error) {
      console.error('File search error:', error);
      return { results: [] };
    }
  }

  private calculateRelevance(query: string, content: string): number {
    const queryWords = query.toLowerCase().split(' ');
    const contentLower = content.toLowerCase();
    
    let matches = 0;
    for (const word of queryWords) {
      if (contentLower.includes(word)) {
        matches++;
      }
    }
    
    return matches / queryWords.length;
  }

  private extractMatchedContent(query: string, content: string): string {
    const queryWords = query.toLowerCase().split(' ');
    const sentences = content.split('.').map(s => s.trim());
    
    for (const sentence of sentences) {
      if (queryWords.some(word => sentence.toLowerCase().includes(word))) {
        return sentence.substring(0, 200) + (sentence.length > 200 ? '...' : '');
      }
    }
    
    return content.substring(0, 200) + (content.length > 200 ? '...' : '');
  }

  private extractContext(query: string, content: string): string {
    // Extract surrounding context of matched query
    const contentLower = content.toLowerCase();
    const queryLower = query.toLowerCase();
    
    const index = contentLower.indexOf(queryLower);
    if (index === -1) return '';
    
    const start = Math.max(0, index - 100);
    const end = Math.min(content.length, index + query.length + 100);
    
    return '...' + content.substring(start, end) + '...';
  }

  // Get processing status
  getProcessingStatus(fileId: string): 'idle' | 'processing' | 'completed' | 'failed' {
    if (this.processingQueue.has(fileId)) {
      return 'processing';
    }
    return 'idle';
  }

  // Clear processing cache
  clearCache(): void {
    this.processingQueue.clear();
  }
}

export default new FileProcessingService();