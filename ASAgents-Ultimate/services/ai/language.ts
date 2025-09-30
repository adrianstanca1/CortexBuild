import { AIProviderBase, AIMessage, AIResponse, MultimodalInput, MediaType } from './providers';

// Language Detection and Processing
export interface DetectedLanguage {
  code: string; // ISO 639-1 code (en, es, fr, etc.)
  name: string;
  confidence: number;
  script?: string; // Latin, Cyrillic, Arabic, etc.
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: DetectedLanguage;
  targetLanguage: DetectedLanguage;
  confidence: number;
}

// Code Language Detection
export interface CodeLanguage {
  language: string;
  confidence: number;
  framework?: string;
  version?: string;
}

// Language Service Interface
export interface ILanguageService {
  detectLanguage(text: string): Promise<DetectedLanguage>;
  detectCodeLanguage(code: string): Promise<CodeLanguage>;
  translateText(text: string, targetLanguage: string, sourceLanguage?: string): Promise<TranslationResult>;
  getSupportedLanguages(): Promise<string[]>;
}

// Built-in Language Detection (simple heuristics)
export class BasicLanguageDetector implements ILanguageService {
  private readonly languagePatterns = new Map([
    ['en', /\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/gi],
    ['es', /\b(el|la|los|las|y|o|pero|en|con|de|por|para)\b/gi],
    ['fr', /\b(le|la|les|et|ou|mais|dans|sur|à|pour|de|avec)\b/gi],
    ['de', /\b(der|die|das|und|oder|aber|in|auf|zu|für|von|mit)\b/gi],
    ['it', /\b(il|la|i|le|e|o|ma|in|su|a|per|di|con)\b/gi],
    ['pt', /\b(o|a|os|as|e|ou|mas|em|sobre|para|de|com)\b/gi],
    ['ru', /\b(и|или|но|в|на|к|для|от|с|по)\b/gi],
    ['zh', /[\u4e00-\u9fff]/g],
    ['ja', /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]/g],
    ['ar', /[\u0600-\u06ff]/g],
  ]);

  private readonly codePatterns = new Map([
    ['javascript', /\b(function|const|let|var|=>|console\.log|require|import)\b/gi],
    ['typescript', /\b(interface|type|enum|implements|extends|as|keyof)\b/gi],
    ['python', /\b(def|class|import|from|if __name__|print|self)\b/gi],
    ['java', /\b(public|private|protected|class|interface|extends|implements|static)\b/gi],
    ['csharp', /\b(using|namespace|public|private|protected|class|interface|var)\b/gi],
    ['cpp', /\b(#include|using namespace|public:|private:|protected:|class|struct)\b/gi],
    ['rust', /\b(fn|let|mut|impl|trait|use|mod|pub)\b/gi],
    ['go', /\b(func|package|import|var|const|type|interface)\b/gi],
    ['php', /<\?php|\$\w+|function|class|public|private|protected/gi],
    ['ruby', /\b(def|class|module|require|include|attr_accessor|puts)\b/gi],
    ['swift', /\b(func|var|let|class|struct|protocol|import|public|private)\b/gi],
    ['kotlin', /\b(fun|val|var|class|interface|object|companion|data)\b/gi],
  ]);

  async detectLanguage(text: string): Promise<DetectedLanguage> {
    let bestMatch: DetectedLanguage = {
      code: 'en',
      name: 'English',
      confidence: 0.1
    };

    for (const [langCode, pattern] of this.languagePatterns) {
      const matches = text.match(pattern);
      const confidence = matches ? matches.length / text.split(/\s+/).length : 0;
      
      if (confidence > bestMatch.confidence) {
        bestMatch = {
          code: langCode,
          name: this.getLanguageName(langCode),
          confidence: Math.min(confidence, 1.0)
        };
      }
    }

    return bestMatch;
  }

  async detectCodeLanguage(code: string): Promise<CodeLanguage> {
    let bestMatch: CodeLanguage = {
      language: 'plaintext',
      confidence: 0.0
    };

    for (const [language, pattern] of this.codePatterns) {
      const matches = code.match(pattern);
      const confidence = matches ? matches.length / 10 : 0; // Normalize against expected patterns
      
      if (confidence > bestMatch.confidence) {
        bestMatch = {
          language,
          confidence: Math.min(confidence, 1.0)
        };
      }
    }

    return bestMatch;
  }

  async translateText(text: string, targetLanguage: string, sourceLanguage?: string): Promise<TranslationResult> {
    // Basic implementation - in production, use Google Translate API or similar
    const detected = sourceLanguage ? 
      { code: sourceLanguage, name: this.getLanguageName(sourceLanguage), confidence: 1.0 } :
      await this.detectLanguage(text);

    return {
      originalText: text,
      translatedText: `[TRANSLATED TO ${targetLanguage.toUpperCase()}] ${text}`,
      sourceLanguage: detected,
      targetLanguage: {
        code: targetLanguage,
        name: this.getLanguageName(targetLanguage),
        confidence: 1.0
      },
      confidence: 0.8
    };
  }

  async getSupportedLanguages(): Promise<string[]> {
    return Array.from(this.languagePatterns.keys());
  }

  private getLanguageName(code: string): string {
    const names: Record<string, string> = {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese',
      ru: 'Russian',
      zh: 'Chinese',
      ja: 'Japanese',
      ar: 'Arabic'
    };
    return names[code] || code.toUpperCase();
  }
}

// Advanced Language Processing with AI
export class AILanguageProcessor {
  constructor(private aiProvider: AIProviderBase) {}

  async enhancedLanguageDetection(text: string): Promise<DetectedLanguage> {
    const prompt = `Detect the language of the following text and return only a JSON object with this format:
{
  "code": "ISO_639_1_CODE",
  "name": "LANGUAGE_NAME",
  "confidence": 0.95,
  "script": "SCRIPT_TYPE"
}

Text to analyze: "${text}"`;

    try {
      const response = await this.aiProvider.sendMessage([
        { id: '1', role: 'system', content: 'You are a language detection expert. Respond only with valid JSON.', timestamp: new Date() },
        { id: '2', role: 'user', content: prompt, timestamp: new Date() }
      ]);

      return JSON.parse(response.content);
    } catch (error) {
      console.error('AI language detection failed:', error);
      // Fallback to basic detection
      const basicDetector = new BasicLanguageDetector();
      return basicDetector.detectLanguage(text);
    }
  }

  async enhancedCodeAnalysis(code: string): Promise<CodeLanguage & { suggestions: string[]; complexity: number }> {
    const prompt = `Analyze the following code and return a JSON object with this format:
{
  "language": "PROGRAMMING_LANGUAGE",
  "confidence": 0.95,
  "framework": "FRAMEWORK_NAME",
  "version": "VERSION_IF_DETECTABLE",
  "suggestions": ["improvement suggestion 1", "improvement suggestion 2"],
  "complexity": 0.7
}

Code to analyze:
\`\`\`
${code}
\`\`\``;

    try {
      const response = await this.aiProvider.sendMessage([
        { id: '1', role: 'system', content: 'You are a code analysis expert. Respond only with valid JSON.', timestamp: new Date() },
        { id: '2', role: 'user', content: prompt, timestamp: new Date() }
      ]);

      return JSON.parse(response.content);
    } catch (error) {
      console.error('AI code analysis failed:', error);
      const basicDetector = new BasicLanguageDetector();
      const basic = await basicDetector.detectCodeLanguage(code);
      return {
        ...basic,
        suggestions: [],
        complexity: 0.5
      };
    }
  }

  async smartTranslation(
    text: string, 
    targetLanguage: string, 
    context?: string,
    preserveFormatting?: boolean
  ): Promise<TranslationResult> {
    const prompt = `Translate the following text to ${targetLanguage}. 
${context ? `Context: ${context}` : ''}
${preserveFormatting ? 'Preserve all formatting, markdown, and code blocks.' : ''}

Return only a JSON object with this format:
{
  "translatedText": "TRANSLATED_TEXT",
  "sourceLanguage": {"code": "XX", "name": "Language Name", "confidence": 0.95},
  "targetLanguage": {"code": "XX", "name": "Language Name", "confidence": 0.95},
  "confidence": 0.95
}

Text to translate: "${text}"`;

    try {
      const response = await this.aiProvider.sendMessage([
        { id: '1', role: 'system', content: 'You are a professional translator. Respond only with valid JSON.', timestamp: new Date() },
        { id: '2', role: 'user', content: prompt, timestamp: new Date() }
      ]);

      const result = JSON.parse(response.content);
      return {
        originalText: text,
        ...result
      };
    } catch (error) {
      console.error('AI translation failed:', error);
      const basicDetector = new BasicLanguageDetector();
      return basicDetector.translateText(text, targetLanguage);
    }
  }
}

// Multilingual Content Manager
export class MultilingualContentManager {
  private translations = new Map<string, Map<string, string>>();
  private currentLanguage = 'en';

  constructor(
    private languageProcessor: AILanguageProcessor,
    private fallbackDetector = new BasicLanguageDetector()
  ) {}

  setLanguage(language: string): void {
    this.currentLanguage = language;
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  async translateContent(key: string, content: string, targetLanguages: string[]): Promise<Map<string, string>> {
    const translations = new Map<string, string>();
    
    for (const lang of targetLanguages) {
      if (lang === this.currentLanguage) {
        translations.set(lang, content);
        continue;
      }

      try {
        const result = await this.languageProcessor.smartTranslation(
          content,
          lang,
          `UI content translation for key: ${key}`
        );
        translations.set(lang, result.translatedText);
      } catch (error) {
        console.error(`Translation failed for ${lang}:`, error);
        translations.set(lang, content); // Fallback to original
      }
    }

    this.translations.set(key, translations);
    return translations;
  }

  getTranslation(key: string, language?: string): string {
    const lang = language || this.currentLanguage;
    const translations = this.translations.get(key);
    return translations?.get(lang) || key;
  }

  async bulkTranslate(contentMap: Record<string, string>, targetLanguages: string[]): Promise<void> {
    const promises = Object.entries(contentMap).map(([key, content]) =>
      this.translateContent(key, content, targetLanguages)
    );

    await Promise.all(promises);
  }

  exportTranslations(language: string): Record<string, string> {
    const result: Record<string, string> = {};
    
    for (const [key, translations] of this.translations.entries()) {
      const translation = translations.get(language);
      if (translation) {
        result[key] = translation;
      }
    }

    return result;
  }
}