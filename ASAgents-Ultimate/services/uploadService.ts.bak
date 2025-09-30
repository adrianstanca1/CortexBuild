// Upload service for handling file uploads with backend integration
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  category: string;
  url: string;
}

export interface UploadOptions {
  projectId?: string;
  companyId: string;
  userId: string;
  type?: 'contract' | 'permit' | 'drawing' | 'photo' | 'report' | 'other';
  onProgress?: (progress: UploadProgress) => void;
}

export interface SupportedFileTypes {
  documents: Array<{
    name: string;
    mimeTypes: string[];
    extensions: string[];
    maxSize: number;
  }>;
  images: Array<{
    name: string;
    mimeTypes: string[];
    extensions: string[];
    maxSize: number;
  }>;
  drawings: Array<{
    name: string;
    mimeTypes: string[];
    extensions: string[];
    maxSize: number;
  }>;
}

class UploadService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
  }

  // Upload single file
  async uploadSingle(file: File, options: UploadOptions): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('companyId', options.companyId);
    formData.append('userId', options.userId);
    
    if (options.projectId) {
      formData.append('projectId', options.projectId);
    }
    
    if (options.type) {
      formData.append('type', options.type);
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Progress tracking
      if (options.onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            options.onProgress!({
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100)
            });
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
              resolve(response.data);
            } else {
              reject(new Error(response.message || 'Upload failed'));
            }
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.message || `Upload failed with status ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was aborted'));
      });

      xhr.open('POST', `${this.baseURL}/uploads/single`);
      xhr.send(formData);
    });
  }

  // Upload multiple files
  async uploadMultiple(files: File[], options: UploadOptions): Promise<UploadedFile[]> {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });
    
    formData.append('companyId', options.companyId);
    formData.append('userId', options.userId);
    
    if (options.projectId) {
      formData.append('projectId', options.projectId);
    }
    
    if (options.type) {
      formData.append('type', options.type);
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Progress tracking
      if (options.onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            options.onProgress!({
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100)
            });
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
              resolve(response.data);
            } else {
              reject(new Error(response.message || 'Upload failed'));
            }
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.message || `Upload failed with status ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was aborted'));
      });

      xhr.open('POST', `${this.baseURL}/uploads/multiple`);
      xhr.send(formData);
    });
  }

  // Get file metadata
  async getFileMetadata(fileId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/uploads/metadata/${fileId}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch file metadata');
    }
    
    return data.data;
  }

  // List files with filtering
  async listFiles(filters: {
    projectId?: string;
    companyId?: string;
    type?: string;
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<{ files: any[]; meta: any }> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`${this.baseURL}/uploads/list?${params}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to list files');
    }
    
    return {
      files: data.data,
      meta: data.meta
    };
  }

  // Delete file
  async deleteFile(fileId: string, userId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/uploads/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to delete file');
    }
  }

  // Get supported file types
  async getSupportedFileTypes(): Promise<SupportedFileTypes> {
    const response = await fetch(`${this.baseURL}/uploads/supported-types`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch supported file types');
    }
    
    return data.data;
  }

  // Get file URL
  getFileUrl(fileId: string): string {
    return `${this.baseURL}/uploads/file/${fileId}`;
  }

  // Format file size
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Validate file before upload
  validateFile(file: File, supportedTypes: SupportedFileTypes): { isValid: boolean; error?: string } {
    // Check file size (basic check - server will do detailed validation)
    const maxSize = 100 * 1024 * 1024; // 100MB general limit
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size exceeds limit (${UploadService.formatFileSize(maxSize)})`
      };
    }

    // Check if file type is supported
    const allTypes = [
      ...supportedTypes.documents,
      ...supportedTypes.images,
      ...supportedTypes.drawings
    ];

    const isSupported = allTypes.some(type => 
      type.mimeTypes.includes(file.type) || 
      type.extensions.some(ext => file.name.toLowerCase().endsWith(ext))
    );

    if (!isSupported) {
      return {
        isValid: false,
        error: 'File type not supported'
      };
    }

    return { isValid: true };
  }
}

export default new UploadService();