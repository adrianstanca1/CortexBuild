import { MultimodalInput, AIMessage, AIProvider } from './providers';
import { ConversationManager } from './conversation';

// File Processing Types
export interface FileContent {
  name: string;
  type: string;
  size: number;
  content: string | Uint8Array;
  url?: string;
  metadata?: Record<string, any>;
}

export interface ProcessedFile extends FileContent {
  extractedText?: string;
  detectedLanguage?: string;
  mediaType: 'image' | 'audio' | 'video' | 'document' | 'code';
}

// Voice Processing
export interface VoiceInput {
  audioBlob: Blob;
  language?: string;
  transcriptionProvider?: AIProvider;
}

export interface VoiceOutput {
  transcript: string;
  confidence: number;
  language: string;
  duration: number;
}

// Image Analysis
export interface ImageAnalysis {
  description: string;
  objects: string[];
  text?: string; // OCR results
  confidence: number;
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
}

// Multimodal Handler
export class MultimodalHandler {
  constructor(private conversationManager: ConversationManager) {}

  // Process uploaded files
  async processFiles(files: FileList | File[]): Promise<ProcessedFile[]> {
    const processedFiles: ProcessedFile[] = [];

    for (const file of Array.from(files)) {
      try {
        const processed = await this.processFile(file);
        processedFiles.push(processed);
      } catch (error) {
        console.error(`Failed to process file ${file.name}:`, error);
      }
    }

    return processedFiles;
  }

  private async processFile(file: File): Promise<ProcessedFile> {
    const content = await this.readFileContent(file);
    const mediaType = this.determineMediaType(file);

    const processed: ProcessedFile = {
      name: file.name,
      type: file.type,
      size: file.size,
      content,
      mediaType,
      metadata: {
        lastModified: file.lastModified,
        webkitRelativePath: (file as any).webkitRelativePath || ''
      }
    };

    // Extract text based on file type
    if (mediaType === 'image') {
      processed.extractedText = await this.extractTextFromImage(file);
    } else if (mediaType === 'document') {
      processed.extractedText = await this.extractTextFromDocument(file);
    } else if (mediaType === 'code') {
      processed.extractedText = content as string;
      processed.detectedLanguage = this.detectCodeLanguage(file.name);
    }

    return processed;
  }

  private async readFileContent(file: File): Promise<string | Uint8Array> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (this.isTextFile(file)) {
          resolve(reader.result as string);
        } else {
          resolve(new Uint8Array(reader.result as ArrayBuffer));
        }
      };
      
      reader.onerror = () => reject(reader.error);
      
      if (this.isTextFile(file)) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  }

  private determineMediaType(file: File): 'image' | 'audio' | 'video' | 'document' | 'code' {
    const { type, name } = file;

    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('audio/')) return 'audio';
    if (type.startsWith('video/')) return 'video';

    // Code files
    const codeExtensions = [
      '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.cs',
      '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.sh', '.bash',
      '.sql', '.html', '.css', '.scss', '.json', '.xml', '.yaml', '.yml'
    ];

    if (codeExtensions.some(ext => name.toLowerCase().endsWith(ext))) {
      return 'code';
    }

    // Document files
    return 'document';
  }

  private isTextFile(file: File): boolean {
    const textTypes = [
      'text/',
      'application/json',
      'application/javascript',
      'application/xml'
    ];

    return textTypes.some(type => file.type.startsWith(type)) ||
           this.determineMediaType(file) === 'code';
  }

  private detectCodeLanguage(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'jsx': 'javascript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'sh': 'bash',
      'bash': 'bash',
      'sql': 'sql',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml'
    };

    return languageMap[extension || ''] || 'text';
  }

  private async extractTextFromImage(file: File): Promise<string> {
    // This would typically use OCR service like Google Vision API
    // For now, return placeholder
    return `[Image: ${file.name} - OCR text extraction would be implemented here]`;
  }

  private async extractTextFromDocument(file: File): Promise<string> {
    // This would parse PDFs, Word docs, etc.
    // For now, return basic info
    return `[Document: ${file.name} - Text extraction would be implemented here]`;
  }

  // Voice to Text
  async processVoice(voiceInput: VoiceInput): Promise<VoiceOutput> {
    try {
      // Convert audio blob to base64
      const audioData = await this.blobToBase64(voiceInput.audioBlob);
      
      // Use speech-to-text API (would integrate with actual service)
      const transcript = await this.transcribeAudio(audioData, voiceInput.language);
      
      return {
        transcript: transcript.text,
        confidence: transcript.confidence,
        language: transcript.language,
        duration: transcript.duration
      };
    } catch (error) {
      console.error('Voice processing failed:', error);
      throw new Error('Failed to process voice input');
    }
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:audio/wav;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private async transcribeAudio(audioData: string, language?: string): Promise<{
    text: string;
    confidence: number;
    language: string;
    duration: number;
  }> {
    // This would integrate with actual speech-to-text service
    // Google Speech-to-Text, Azure Speech, AWS Transcribe, etc.
    
    // Placeholder implementation
    return {
      text: '[Audio transcription would be implemented here]',
      confidence: 0.95,
      language: language || 'en',
      duration: 0
    };
  }

  // Text to Speech
  async generateSpeech(
    text: string,
    language: string = 'en',
    voice?: string
  ): Promise<Blob> {
    try {
      // This would integrate with text-to-speech service
      // Google Text-to-Speech, Azure Speech, AWS Polly, etc.
      
      // For browser-based TTS (fallback)
      if ('speechSynthesis' in window) {
        return this.browserTextToSpeech(text, language, voice);
      }
      
      throw new Error('Text-to-speech not available');
    } catch (error) {
      console.error('Speech generation failed:', error);
      throw error;
    }
  }

  private async browserTextToSpeech(
    text: string,
    language: string,
    voice?: string
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      
      if (voice) {
        const voices = speechSynthesis.getVoices();
        const selectedVoice = voices.find(v => v.name === voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      // Note: Browser Speech Synthesis doesn't return audio data directly
      // This is a limitation - for actual audio file generation,
      // you'd need a server-side TTS service
      utterance.onend = () => {
        // Create empty blob as placeholder
        resolve(new Blob([], { type: 'audio/wav' }));
      };
      
      utterance.onerror = reject;
      speechSynthesis.speak(utterance);
    });
  }

  // Analyze Images with AI
  async analyzeImage(
    image: File | string,
    provider: AIProvider = 'gemini'
  ): Promise<ImageAnalysis> {
    try {
      let imageData: string;
      let metadata: any = {};

      if (typeof image === 'string') {
        imageData = image;
      } else {
        imageData = await this.fileToBase64(image);
        metadata = {
          width: 0, // Would be extracted from image
          height: 0,
          format: image.type,
          size: image.size
        };
      }

      // Create temporary conversation for image analysis
      const conversationId = this.conversationManager.createConversation(
        'Image Analysis',
        'technical',
        'en'
      );

      const input: MultimodalInput = {
        images: [{ data: imageData, type: 'image/jpeg' }]
      };

      const response = await this.conversationManager.sendMessage(
        conversationId,
        'Please analyze this image in detail. Describe what you see, identify objects, and extract any text.',
        input,
        provider
      );

      // Clean up temporary conversation
      this.conversationManager.deleteConversation(conversationId);

      return {
        description: response.content,
        objects: this.extractObjects(response.content),
        text: this.extractText(response.content),
        confidence: 0.9, // Would be provided by actual service
        metadata: metadata
      };
    } catch (error) {
      console.error('Image analysis failed:', error);
      throw error;
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private extractObjects(description: string): string[] {
    // Simple extraction - would use more sophisticated NLP
    const objects: string[] = [];
    const patterns = [
      /(?:I can see|I see|there is|there are)\s+(?:a|an|some|the)?\s*([a-zA-Z\s]+)/gi,
      /(?:object|item|thing)s?:\s*([a-zA-Z\s,]+)/gi
    ];

    patterns.forEach(pattern => {
      const matches = description.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const extracted = match.replace(pattern, '$1').trim();
          if (extracted) {
            objects.push(extracted);
          }
        });
      }
    });

    return [...new Set(objects)]; // Remove duplicates
  }

  private extractText(description: string): string | undefined {
    // Look for text mentions in the description
    const textPatterns = [
      /text(?:\s+(?:says|reads|shows)):\s*"([^"]+)"/gi,
      /(?:says|reads|shows):\s*"([^"]+)"/gi,
      /text.*?:\s*([^\n]+)/gi
    ];

    for (const pattern of textPatterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  // Create multimodal input from processed files
  createMultimodalInput(files: ProcessedFile[]): MultimodalInput {
    const input: MultimodalInput = {};

    const images = files.filter(f => f.mediaType === 'image');
    const audio = files.filter(f => f.mediaType === 'audio');
    const videos = files.filter(f => f.mediaType === 'video');

    if (images.length > 0) {
      input.images = images.map(img => ({
        data: img.content as string,
        type: img.type
      }));
    }

    if (audio.length > 0) {
      input.audio = {
        data: audio[0].content as string,
        type: audio[0].type
      };
    }

    if (videos.length > 0) {
      input.video = {
        data: videos[0].content as string,
        type: videos[0].type
      };
    }

    return input;
  }
}