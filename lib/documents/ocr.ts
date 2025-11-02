/**
 * OCR (Optical Character Recognition) Service
 * Extract text from scanned PDFs and images using Tesseract.js
 */

import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
  paragraphs: string[];
  processedAt: string;
}

export interface OCRProgress {
  status: string;
  progress: number;
}

/**
 * Extract text from an image file
 */
export async function extractTextFromImage(
  file: File | Blob,
  onProgress?: (progress: OCRProgress) => void
): Promise<OCRResult> {
  try {
    const { data } = await Tesseract.recognize(file, 'eng', {
      logger: (m) => {
        if (onProgress && m.status === 'recognizing text') {
          onProgress({
            status: m.status,
            progress: m.progress || 0
          });
        }
      }
    });

    const words = (data as any).words.map(word => ({
      text: word.text,
      confidence: word.confidence,
      bbox: {
        x0: word.bbox.x0,
        y0: word.bbox.y0,
        x1: word.bbox.x1,
        y1: word.bbox.y1
      }
    }));

    // Extract paragraphs
    const paragraphs = data.text
      .split('\n\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    return {
      text: data.text,
      confidence: data.confidence,
      words,
      paragraphs,
      processedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error('Failed to extract text from image');
  }
}

/**
 * Extract text from multiple images (batch processing)
 */
export async function extractTextFromMultipleImages(
  files: File[],
  onProgress?: (fileIndex: number, progress: OCRProgress) => void
): Promise<OCRResult[]> {
  const results: OCRResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    const progressHandler = (progress: OCRProgress) => {
      if (onProgress) {
        onProgress(i, progress);
      }
    };

    const result = await extractTextFromImage(file, progressHandler);
    results.push(result);
  }

  return results;
}

/**
 * Extract text from a specific language
 */
export async function extractTextFromImageWithLanguage(
  file: File | Blob,
  language: string = 'eng',
  onProgress?: (progress: OCRProgress) => void
): Promise<OCRResult> {
  try {
    const { data } = await Tesseract.recognize(file, language, {
      logger: (m) => {
        if (onProgress && m.status === 'recognizing text') {
          onProgress({
            status: m.status,
            progress: m.progress || 0
          });
        }
      }
    });

    const words = (data as any).words.map(word => ({
      text: word.text,
      confidence: word.confidence,
      bbox: {
        x0: word.bbox.x0,
        y0: word.bbox.y0,
        x1: word.bbox.x1,
        y1: word.bbox.y1
      }
    }));

    const paragraphs = data.text
      .split('\n\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    return {
      text: data.text,
      confidence: data.confidence,
      words,
      paragraphs,
      processedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error(`Failed to extract text from image in ${language}`);
  }
}

/**
 * Get available OCR languages
 */
// export async function getAvailableLanguages(): Promise<string[]> {
//   try {
//     const { data } = await Tesseract.getLanguages();
//     return data.languages;
//   } catch (error) {
//     console.error('Error fetching languages:', error);
//     return ['eng']; // Fallback to English
//   }
// }

/**
 * Process PDF page as image (requires pdf.js conversion first)
 */
export async function extractTextFromPDFPage(
  imageData: Blob,
  pageNumber: number,
  onProgress?: (progress: OCRProgress) => void
): Promise<OCRResult & { pageNumber: number }> {
  const result = await extractTextFromImage(imageData, onProgress);
  return { ...result, pageNumber };
}

