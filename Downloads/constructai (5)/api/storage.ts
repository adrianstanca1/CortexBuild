/**
 * Storage API
 * 
 * File upload, download, and management using Supabase Storage
 */

import { supabase } from '../supabaseClient';

export interface FileUploadResult {
    id: string;
    path: string;
    url: string;
    size: number;
    type: string;
    name: string;
}

export interface FileMetadata {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    created_at: string;
    updated_at: string;
    bucket: string;
    path: string;
}

// ============================================================================
// FILE UPLOAD
// ============================================================================

/**
 * Upload a file to Supabase Storage
 */
export const uploadFile = async (
    file: File,
    bucket: string,
    folder: string = '',
    options?: {
        upsert?: boolean;
        cacheControl?: string;
        contentType?: string;
    }
): Promise<FileUploadResult> => {
    try {
        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const extension = file.name.split('.').pop();
        const filename = `${timestamp}-${randomString}.${extension}`;
        
        // Construct path
        const path = folder ? `${folder}/${filename}` : filename;

        // Upload file
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file, {
                cacheControl: options?.cacheControl || '3600',
                upsert: options?.upsert || false,
                contentType: options?.contentType || file.type,
            });

        if (error) {
            console.error('Error uploading file:', error);
            throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(path);

        return {
            id: data.id || path,
            path: data.path,
            url: publicUrl,
            size: file.size,
            type: file.type,
            name: file.name,
        };
    } catch (error) {
        console.error('File upload failed:', error);
        throw error;
    }
};

/**
 * Upload multiple files
 */
export const uploadFiles = async (
    files: File[],
    bucket: string,
    folder: string = ''
): Promise<FileUploadResult[]> => {
    const uploadPromises = files.map(file => uploadFile(file, bucket, folder));
    return Promise.all(uploadPromises);
};

// ============================================================================
// FILE DOWNLOAD
// ============================================================================

/**
 * Download a file from Supabase Storage
 */
export const downloadFile = async (
    bucket: string,
    path: string
): Promise<Blob> => {
    try {
        const { data, error } = await supabase.storage
            .from(bucket)
            .download(path);

        if (error) {
            console.error('Error downloading file:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('File download failed:', error);
        throw error;
    }
};

/**
 * Get signed URL for private file
 */
export const getSignedUrl = async (
    bucket: string,
    path: string,
    expiresIn: number = 3600
): Promise<string> => {
    try {
        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(path, expiresIn);

        if (error) {
            console.error('Error creating signed URL:', error);
            throw error;
        }

        return data.signedUrl;
    } catch (error) {
        console.error('Signed URL creation failed:', error);
        throw error;
    }
};

// ============================================================================
// FILE MANAGEMENT
// ============================================================================

/**
 * List files in a bucket/folder
 */
export const listFiles = async (
    bucket: string,
    folder: string = '',
    options?: {
        limit?: number;
        offset?: number;
        sortBy?: { column: string; order: 'asc' | 'desc' };
    }
): Promise<FileMetadata[]> => {
    try {
        const { data, error } = await supabase.storage
            .from(bucket)
            .list(folder, {
                limit: options?.limit || 100,
                offset: options?.offset || 0,
                sortBy: options?.sortBy || { column: 'created_at', order: 'desc' },
            });

        if (error) {
            console.error('Error listing files:', error);
            throw error;
        }

        // Get public URLs for all files
        return (data || []).map(file => {
            const filePath = folder ? `${folder}/${file.name}` : file.name;
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            return {
                id: file.id,
                name: file.name,
                size: file.metadata?.size || 0,
                type: file.metadata?.mimetype || '',
                url: publicUrl,
                created_at: file.created_at,
                updated_at: file.updated_at,
                bucket,
                path: filePath,
            };
        });
    } catch (error) {
        console.error('File listing failed:', error);
        throw error;
    }
};

/**
 * Delete a file
 */
export const deleteFile = async (
    bucket: string,
    path: string
): Promise<void> => {
    try {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([path]);

        if (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    } catch (error) {
        console.error('File deletion failed:', error);
        throw error;
    }
};

/**
 * Delete multiple files
 */
export const deleteFiles = async (
    bucket: string,
    paths: string[]
): Promise<void> => {
    try {
        const { error } = await supabase.storage
            .from(bucket)
            .remove(paths);

        if (error) {
            console.error('Error deleting files:', error);
            throw error;
        }
    } catch (error) {
        console.error('Files deletion failed:', error);
        throw error;
    }
};

/**
 * Move/rename a file
 */
export const moveFile = async (
    bucket: string,
    fromPath: string,
    toPath: string
): Promise<void> => {
    try {
        const { error } = await supabase.storage
            .from(bucket)
            .move(fromPath, toPath);

        if (error) {
            console.error('Error moving file:', error);
            throw error;
        }
    } catch (error) {
        console.error('File move failed:', error);
        throw error;
    }
};

/**
 * Copy a file
 */
export const copyFile = async (
    bucket: string,
    fromPath: string,
    toPath: string
): Promise<void> => {
    try {
        const { error } = await supabase.storage
            .from(bucket)
            .copy(fromPath, toPath);

        if (error) {
            console.error('Error copying file:', error);
            throw error;
        }
    } catch (error) {
        console.error('File copy failed:', error);
        throw error;
    }
};

// ============================================================================
// BUCKET MANAGEMENT
// ============================================================================

/**
 * Create a new storage bucket
 */
export const createBucket = async (
    name: string,
    options?: {
        public?: boolean;
        fileSizeLimit?: number;
        allowedMimeTypes?: string[];
    }
): Promise<void> => {
    try {
        const { error } = await supabase.storage.createBucket(name, {
            public: options?.public || false,
            fileSizeLimit: options?.fileSizeLimit,
            allowedMimeTypes: options?.allowedMimeTypes,
        });

        if (error) {
            console.error('Error creating bucket:', error);
            throw error;
        }
    } catch (error) {
        console.error('Bucket creation failed:', error);
        throw error;
    }
};

/**
 * List all buckets
 */
export const listBuckets = async (): Promise<any[]> => {
    try {
        const { data, error } = await supabase.storage.listBuckets();

        if (error) {
            console.error('Error listing buckets:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Bucket listing failed:', error);
        throw error;
    }
};

/**
 * Delete a bucket
 */
export const deleteBucket = async (name: string): Promise<void> => {
    try {
        const { error } = await supabase.storage.deleteBucket(name);

        if (error) {
            console.error('Error deleting bucket:', error);
            throw error;
        }
    } catch (error) {
        console.error('Bucket deletion failed:', error);
        throw error;
    }
};

/**
 * Empty a bucket (delete all files)
 */
export const emptyBucket = async (name: string): Promise<void> => {
    try {
        const { error } = await supabase.storage.emptyBucket(name);

        if (error) {
            console.error('Error emptying bucket:', error);
            throw error;
        }
    } catch (error) {
        console.error('Bucket emptying failed:', error);
        throw error;
    }
};

