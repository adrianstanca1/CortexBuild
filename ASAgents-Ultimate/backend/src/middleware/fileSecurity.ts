import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFileAsync = promisify(fs.readFile);

// File security configuration
export interface SecurityConfig {
  maxFileSize: number;
  allowedMimeTypes: string[];
  blockedExtensions: string[];
  scanForMalware: boolean;
  quarantineDir: string;
}

const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedMimeTypes: [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    // CAD/Technical drawings
    'application/acad',
    'application/x-acad',
    'application/autocad_dwg',
    'application/dxf',
    'application/x-autocad'
  ],
  blockedExtensions: [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
    '.app', '.deb', '.pkg', '.dmg', '.rpm', '.run', '.bin', '.sh'
  ],
  scanForMalware: true,
  quarantineDir: path.join(__dirname, '../../quarantine')
};

// File signature validation (magic numbers)
const FILE_SIGNATURES: Record<string, Buffer[]> = {
  'application/pdf': [Buffer.from([0x25, 0x50, 0x44, 0x46])], // %PDF
  'image/jpeg': [
    Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]),
    Buffer.from([0xFF, 0xD8, 0xFF, 0xE1]),
    Buffer.from([0xFF, 0xD8, 0xFF, 0xE8])
  ],
  'image/png': [Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])],
  'image/gif': [
    Buffer.from([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]),
    Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
  ]
};

// Validate file signature against MIME type
async function validateFileSignature(filePath: string, mimeType: string): Promise<boolean> {
  try {
    const signatures = FILE_SIGNATURES[mimeType];
    if (!signatures) {
      // No signature validation for this type, allow it
      return true;
    }

    const buffer = await readFileAsync(filePath);
    const fileHeader = buffer.subarray(0, Math.max(...signatures.map(s => s.length)));

    return signatures.some(signature => 
      fileHeader.subarray(0, signature.length).equals(signature)
    );
  } catch (error) {
    console.error('File signature validation error:', error);
    return false;
  }
}

// Basic malware scanning (simple pattern matching)
async function basicMalwareCheck(filePath: string): Promise<boolean> {
  try {
    const buffer = await readFileAsync(filePath);
    const content = buffer.toString('binary');
    
    // Common malware patterns (this is basic - use proper antivirus in production)
    const malwarePatterns = [
      /eval\s*\(/gi,
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onclick\s*=/gi,
      /onerror\s*=/gi,
      /onload\s*=/gi
    ];

    return !malwarePatterns.some(pattern => pattern.test(content));
  } catch (error) {
    console.error('Malware check error:', error);
    return false;
  }
}

// Sanitize filename
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 255);
}

// File security middleware
export function fileSecurityMiddleware(config: Partial<SecurityConfig> = {}) {
  const securityConfig = { ...DEFAULT_SECURITY_CONFIG, ...config };

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.file ? [req.file] : (req.files as Express.Multer.File[] || []);

      if (files.length === 0) {
        return next();
      }

      for (const file of files) {
        // Check file size
        if (file.size > securityConfig.maxFileSize) {
          fs.unlinkSync(file.path); // Clean up
          return res.status(400).json({
            success: false,
            message: `File too large. Maximum size: ${securityConfig.maxFileSize / (1024 * 1024)}MB`
          });
        }

        // Check MIME type
        if (!securityConfig.allowedMimeTypes.includes(file.mimetype)) {
          fs.unlinkSync(file.path); // Clean up
          return res.status(400).json({
            success: false,
            message: `File type not allowed: ${file.mimetype}`
          });
        }

        // Check file extension
        const extension = path.extname(file.originalname).toLowerCase();
        if (securityConfig.blockedExtensions.includes(extension)) {
          fs.unlinkSync(file.path); // Clean up
          return res.status(400).json({
            success: false,
            message: `File extension not allowed: ${extension}`
          });
        }

        // Validate file signature
        const isValidSignature = await validateFileSignature(file.path, file.mimetype);
        if (!isValidSignature) {
          fs.unlinkSync(file.path); // Clean up
          return res.status(400).json({
            success: false,
            message: 'File signature does not match MIME type'
          });
        }

        // Basic malware check
        if (securityConfig.scanForMalware) {
          const isClean = await basicMalwareCheck(file.path);
          if (!isClean) {
            // Move to quarantine instead of deleting
            const quarantinePath = path.join(
              securityConfig.quarantineDir,
              `quarantine_${Date.now()}_${file.filename}`
            );
            
            if (!fs.existsSync(securityConfig.quarantineDir)) {
              fs.mkdirSync(securityConfig.quarantineDir, { recursive: true });
            }
            
            fs.renameSync(file.path, quarantinePath);
            
            return res.status(400).json({
              success: false,
              message: 'File contains potentially malicious content'
            });
          }
        }

        // Sanitize filename in memory (actual file is already saved)
        file.originalname = sanitizeFilename(file.originalname);
      }

      next();
    } catch (error) {
      console.error('File security middleware error:', error);
      
      // Clean up files on error
      const files = req.file ? [req.file] : (req.files as Express.Multer.File[] || []);
      files.forEach(file => {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
      });

      res.status(500).json({
        success: false,
        message: 'File security validation failed'
      });
    }
  };
}

// Rate limiting for uploads
export function uploadRateLimit() {
  const uploadCounts = new Map<string, { count: number; resetTime: number }>();
  const MAX_UPLOADS = 20; // per hour
  const RESET_INTERVAL = 60 * 60 * 1000; // 1 hour

  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    const record = uploadCounts.get(clientIP);
    
    if (!record || now > record.resetTime) {
      uploadCounts.set(clientIP, {
        count: 1,
        resetTime: now + RESET_INTERVAL
      });
      return next();
    }

    if (record.count >= MAX_UPLOADS) {
      return res.status(429).json({
        success: false,
        message: 'Upload rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }

    record.count++;
    next();
  };
}

// File cleanup job (to be run periodically)
export async function cleanupTempFiles(tempDir: string, maxAge: number = 24 * 60 * 60 * 1000) {
  try {
    const files = fs.readdirSync(tempDir);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = fs.statSync(filePath);

      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up temp file: ${file}`);
      }
    }
  } catch (error) {
    console.error('Temp file cleanup error:', error);
  }
}

export default {
  fileSecurityMiddleware,
  uploadRateLimit,
  sanitizeFilename,
  cleanupTempFiles
};