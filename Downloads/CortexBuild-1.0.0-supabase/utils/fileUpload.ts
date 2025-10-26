// utils/fileUpload.ts
import { supabase } from './supabaseClient';

export interface UploadOptions {
  folder: string;
  fileName?: string;
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  path: string;
  url: string;
  size: number;
  type: string;
}

export const uploadFile = async (
  file: File,
  options: UploadOptions
): Promise<UploadResult> => {
  const fileName = options.fileName || `${Date.now()}-${file.name}`;
  const filePath = `${options.folder}/${fileName}`;

  // Validate file size (100MB limit)
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    throw new Error(`File size exceeds maximum limit of 100MB`);
  }

  // Validate file type
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip', 'text/plain', 'text/csv'
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed`);
  }

  const { data, error } = await supabase.storage
    .from('documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('documents')
    .getPublicUrl(data.path);

  return {
    path: data.path,
    url: urlData.publicUrl,
    size: file.size,
    type: file.type
  };
};

export const deleteFile = async (path: string): Promise<void> => {
  const { error } = await supabase.storage
    .from('documents')
    .remove([path]);

  if (error) throw error;
};

export const getFileUrl = (path: string): string => {
  const { data } = supabase.storage
    .from('documents')
    .getPublicUrl(path);

  return data.publicUrl;
};

export const downloadFile = async (path: string): Promise<Blob> => {
  const { data, error } = await supabase.storage
    .from('documents')
    .download(path);

  if (error) throw error;
  return data;
};

export const listFiles = async (folder: string, limit: number = 100) => {
  const { data, error } = await supabase.storage
    .from('documents')
    .list(folder, {
      limit,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' }
    });

  if (error) throw error;
  return data;
};

export const getFileInfo = async (path: string) => {
  const { data, error } = await supabase.storage
    .from('documents')
    .getPublicUrl(path);

  if (error) throw error;
  return data;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (fileType: string): string => {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('word') || fileType.includes('document')) return '📝';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
  if (fileType.includes('zip') || fileType.includes('archive')) return '📦';
  if (fileType.includes('text')) return '📄';
  return '📁';
};
