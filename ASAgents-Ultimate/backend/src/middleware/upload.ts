import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// File type definitions
export interface FileTypeConfig {
  mimeTypes: string[];
  extensions: string[];
  maxSize: number; // in bytes
  category: 'document' | 'image' | 'drawing' | 'other';
}

// Supported file types configuration
export const SUPPORTED_FILE_TYPES: Record<string, FileTypeConfig> = {
  // Documents
  pdf: {
    mimeTypes: ['application/pdf'],
    extensions: ['.pdf'],
    maxSize: 50 * 1024 * 1024, // 50MB
    category: 'document'
  },
  doc: {
    mimeTypes: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    extensions: ['.doc', '.docx'],
    maxSize: 20 * 1024 * 1024, // 20MB
    category: 'document'
  },
  spreadsheet: {
    mimeTypes: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    extensions: ['.xls', '.xlsx'],
    maxSize: 20 * 1024 * 1024, // 20MB
    category: 'document'
  },
  presentation: {
    mimeTypes: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    extensions: ['.ppt', '.pptx'],
    maxSize: 50 * 1024 * 1024, // 50MB
    category: 'document'
  },
  text: {
    mimeTypes: ['text/plain', 'text/csv'],
    extensions: ['.txt', '.csv'],
    maxSize: 10 * 1024 * 1024, // 10MB
    category: 'document'
  },
  
  // Images
  jpeg: {
    mimeTypes: ['image/jpeg'],
    extensions: ['.jpg', '.jpeg'],
    maxSize: 10 * 1024 * 1024, // 10MB
    category: 'image'
  },
  png: {
    mimeTypes: ['image/png'],
    extensions: ['.png'],
    maxSize: 10 * 1024 * 1024, // 10MB
    category: 'image'
  },
  gif: {
    mimeTypes: ['image/gif'],
    extensions: ['.gif'],
    maxSize: 5 * 1024 * 1024, // 5MB
    category: 'image'
  },
  webp: {
    mimeTypes: ['image/webp'],
    extensions: ['.webp'],
    maxSize: 10 * 1024 * 1024, // 10MB
    category: 'image'
  },
  
  // Technical drawings and CAD files
  dwg: {
    mimeTypes: ['application/acad', 'application/x-acad', 'application/autocad_dwg'],
    extensions: ['.dwg'],
    maxSize: 100 * 1024 * 1024, // 100MB
    category: 'drawing'
  },
  dxf: {
    mimeTypes: ['application/dxf', 'application/x-autocad'],
    extensions: ['.dxf'],
    maxSize: 50 * 1024 * 1024, // 50MB
    category: 'drawing'
  },
  svg: {
    mimeTypes: ['image/svg+xml'],
    extensions: ['.svg'],
    maxSize: 5 * 1024 * 1024, // 5MB
    category: 'drawing'
  }
};

// Create uploads directory if it doesn't exist
const ensureUploadDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Initialize upload directories
const uploadsDir = path.join(__dirname, '../../uploads');
ensureUploadDir(uploadsDir);
ensureUploadDir(path.join(uploadsDir, 'documents'));
ensureUploadDir(path.join(uploadsDir, 'images'));
ensureUploadDir(path.join(uploadsDir, 'drawings'));
ensureUploadDir(path.join(uploadsDir, 'temp'));

// File filter function
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = Object.values(SUPPORTED_FILE_TYPES).flatMap(config => config.mimeTypes);
  const allowedExtensions = Object.values(SUPPORTED_FILE_TYPES).flatMap(config => config.extensions);
  
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not supported. Allowed types: ${allowedExtensions.join(', ')}`));
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine file category and set destination
    let category = 'temp';
    
    for (const [key, config] of Object.entries(SUPPORTED_FILE_TYPES)) {
      if (config.mimeTypes.includes(file.mimetype)) {
        category = config.category;
        break;
      }
    }
    
    const destinationPath = path.join(uploadsDir, category === 'other' ? 'temp' : `${category}s`);
    ensureUploadDir(destinationPath);
    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const uniqueSuffix = `${uuidv4()}-${Date.now()}`;
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${extension}`);
  }
});

// File size limit function
const limits = {
  fileSize: Math.max(...Object.values(SUPPORTED_FILE_TYPES).map(config => config.maxSize)),
  files: 10 // Maximum 10 files per upload
};

// Create multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits
});

// Helper function to get file type config
export const getFileTypeConfig = (mimeType: string): FileTypeConfig | null => {
  for (const config of Object.values(SUPPORTED_FILE_TYPES)) {
    if (config.mimeTypes.includes(mimeType)) {
      return config;
    }
  }
  return null;
};

// Helper function to validate file size for specific type
export const validateFileSize = (file: Express.Multer.File): boolean => {
  const config = getFileTypeConfig(file.mimetype);
  if (!config) return false;
  
  return file.size <= config.maxSize;
};

// Helper function to get file info
export const getFileInfo = (file: Express.Multer.File) => {
  const config = getFileTypeConfig(file.mimetype);
  return {
    originalName: file.originalname,
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size,
    category: config?.category || 'other',
    path: file.path
  };
};