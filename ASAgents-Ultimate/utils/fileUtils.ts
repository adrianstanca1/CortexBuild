/**
 * File utility functions for file size formatting, icon retrieval, 
 * MIME type detection, and file categorization.
 */

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface FileCategory {
  name: string;
  extensions: string[];
  icon: string;
  color: string;
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
}

/**
 * Get MIME type from file extension
 */
export function getMimeType(filename: string): string {
  const extension = getFileExtension(filename);
  
  const mimeTypes: Record<string, string> = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'bmp': 'image/bmp',
    'ico': 'image/x-icon',
    
    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'txt': 'text/plain',
    'rtf': 'application/rtf',
    
    // Archives
    'zip': 'application/zip',
    'rar': 'application/vnd.rar',
    '7z': 'application/x-7z-compressed',
    'tar': 'application/x-tar',
    'gz': 'application/gzip',
    
    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'flac': 'audio/flac',
    'm4a': 'audio/mp4',
    
    // Video
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv',
    'flv': 'video/x-flv',
    'webm': 'video/webm',
    
    // Code
    'js': 'text/javascript',
    'ts': 'text/typescript',
    'jsx': 'text/jsx',
    'tsx': 'text/tsx',
    'html': 'text/html',
    'css': 'text/css',
    'json': 'application/json',
    'xml': 'application/xml',
    'py': 'text/x-python',
    'java': 'text/x-java-source',
    'cpp': 'text/x-c++src',
    'c': 'text/x-csrc',
    'php': 'text/x-php',
    'rb': 'text/x-ruby',
    'go': 'text/x-go',
    'rs': 'text/x-rust',
    'swift': 'text/x-swift',
    'kt': 'text/x-kotlin',
    'sql': 'text/x-sql',
    'sh': 'text/x-shellscript',
    'md': 'text/markdown',
    'yml': 'text/yaml',
    'yaml': 'text/yaml',
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
}

/**
 * File categories for organization
 */
export const FILE_CATEGORIES: FileCategory[] = [
  {
    name: 'Images',
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'],
    icon: '🖼️',
    color: 'text-blue-600'
  },
  {
    name: 'Documents',
    extensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf'],
    icon: '📄',
    color: 'text-green-600'
  },
  {
    name: 'Archives',
    extensions: ['zip', 'rar', '7z', 'tar', 'gz'],
    icon: '📦',
    color: 'text-yellow-600'
  },
  {
    name: 'Audio',
    extensions: ['mp3', 'wav', 'ogg', 'flac', 'm4a'],
    icon: '🎵',
    color: 'text-purple-600'
  },
  {
    name: 'Video',
    extensions: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
    icon: '🎬',
    color: 'text-red-600'
  },
  {
    name: 'Code',
    extensions: ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'sql', 'sh', 'md', 'yml', 'yaml'],
    icon: '💻',
    color: 'text-indigo-600'
  }
];

/**
 * Get file category based on extension
 */
export function getFileCategory(filename: string): FileCategory | null {
  const extension = getFileExtension(filename);
  
  for (const category of FILE_CATEGORIES) {
    if (category.extensions.includes(extension)) {
      return category;
    }
  }
  
  return null;
}

/**
 * Get file icon based on extension
 */
export function getFileIcon(filename: string): string {
  const category = getFileCategory(filename);
  return category?.icon || '📁';
}

/**
 * Check if file is an image
 */
export function isImageFile(filename: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
  return imageExtensions.includes(getFileExtension(filename));
}

/**
 * Check if file is a document
 */
export function isDocumentFile(filename: string): boolean {
  const docExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf'];
  return docExtensions.includes(getFileExtension(filename));
}

/**
 * Check if file is code
 */
export function isCodeFile(filename: string): boolean {
  const codeExtensions = ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'sql', 'sh', 'md', 'yml', 'yaml'];
  return codeExtensions.includes(getFileExtension(filename));
}

/**
 * Validate file size against limit
 */
export function validateFileSize(file: File, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

/**
 * Validate file type against allowed types
 */
export function validateFileType(filename: string, allowedExtensions: string[]): boolean {
  const extension = getFileExtension(filename);
  return allowedExtensions.includes(extension);
}

/**
 * Generate a safe filename by removing/replacing invalid characters
 */
export function sanitizeFilename(filename: string): string {
  // Remove or replace invalid characters
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Get file info from File object
 */
export function getFileInfo(file: File): FileInfo {
  return {
    name: file.name,
    size: file.size,
    type: file.type || getMimeType(file.name),
    lastModified: file.lastModified
  };
}
