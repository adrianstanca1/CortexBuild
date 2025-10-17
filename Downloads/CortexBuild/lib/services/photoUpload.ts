/**
 * Photo Upload Service - Real photo upload to Supabase Storage
 */

import { supabase } from '../supabase/client';
import toast from 'react-hot-toast';

export interface PhotoUploadOptions {
    bucket?: string;
    folder?: string;
    maxSizeMB?: number;
    allowedTypes?: string[];
    compress?: boolean;
}

export interface UploadedPhoto {
    url: string;
    path: string;
    size: number;
    type: string;
}

const DEFAULT_OPTIONS: PhotoUploadOptions = {
    bucket: 'photos',
    folder: '',
    maxSizeMB: 10,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
    compress: true
};

/**
 * Upload photo to Supabase Storage
 */
export async function uploadPhoto(
    file: File,
    options: PhotoUploadOptions = {}
): Promise<UploadedPhoto> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    // Validate file type
    if (opts.allowedTypes && !opts.allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} not allowed. Allowed types: ${opts.allowedTypes.join(', ')}`);
    }
    
    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (opts.maxSizeMB && fileSizeMB > opts.maxSizeMB) {
        throw new Error(`File size ${fileSizeMB.toFixed(2)}MB exceeds maximum ${opts.maxSizeMB}MB`);
    }
    
    // Compress image if needed
    let fileToUpload = file;
    if (opts.compress && file.type.startsWith('image/')) {
        fileToUpload = await compressImage(file);
    }
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = opts.folder ? `${opts.folder}/${fileName}` : fileName;
    
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from(opts.bucket!)
        .upload(filePath, fileToUpload, {
            cacheControl: '3600',
            upsert: false
        });
    
    if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload photo: ${uploadError.message}`);
    }
    
    // Get public URL
    const { data } = supabase.storage
        .from(opts.bucket!)
        .getPublicUrl(filePath);
    
    return {
        url: data.publicUrl,
        path: filePath,
        size: fileToUpload.size,
        type: fileToUpload.type
    };
}

/**
 * Upload multiple photos
 */
export async function uploadPhotos(
    files: File[],
    options: PhotoUploadOptions = {},
    onProgress?: (progress: number) => void
): Promise<UploadedPhoto[]> {
    const results: UploadedPhoto[] = [];
    
    for (let i = 0; i < files.length; i++) {
        try {
            const result = await uploadPhoto(files[i], options);
            results.push(result);
            
            if (onProgress) {
                onProgress(((i + 1) / files.length) * 100);
            }
        } catch (error) {
            console.error(`Failed to upload ${files[i].name}:`, error);
            toast.error(`Failed to upload ${files[i].name}`);
        }
    }
    
    return results;
}

/**
 * Delete photo from Supabase Storage
 */
export async function deletePhoto(
    path: string,
    bucket: string = 'photos'
): Promise<void> {
    const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);
    
    if (error) {
        throw new Error(`Failed to delete photo: ${error.message}`);
    }
}

/**
 * Compress image using Canvas API
 */
async function compressImage(file: File, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Resize if too large
                const maxDimension = 1920;
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = (height / width) * maxDimension;
                        width = maxDimension;
                    } else {
                        width = (width / height) * maxDimension;
                        height = maxDimension;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }
                
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Failed to compress image'));
                            return;
                        }
                        
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });
                        
                        resolve(compressedFile);
                    },
                    'image/jpeg',
                    quality
                );
            };
            
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target?.result as string;
        };
        
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

/**
 * Capture photo from camera
 */
export async function capturePhoto(): Promise<File | null> {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment'; // Use rear camera on mobile
        
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            resolve(file || null);
        };
        
        input.oncancel = () => resolve(null);
        input.click();
    });
}

/**
 * Select photos from gallery
 */
export async function selectPhotos(multiple: boolean = false): Promise<File[]> {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = multiple;
        
        input.onchange = (e) => {
            const files = Array.from((e.target as HTMLInputElement).files || []);
            resolve(files);
        };
        
        input.oncancel = () => resolve([]);
        input.click();
    });
}

/**
 * Upload photo with progress tracking
 */
export async function uploadPhotoWithProgress(
    file: File,
    onProgress: (progress: number) => void,
    options: PhotoUploadOptions = {}
): Promise<UploadedPhoto> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    // Simulate progress for compression
    onProgress(10);
    
    let fileToUpload = file;
    if (opts.compress && file.type.startsWith('image/')) {
        fileToUpload = await compressImage(file);
        onProgress(30);
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = opts.folder ? `${opts.folder}/${fileName}` : fileName;
    
    onProgress(50);
    
    const { error: uploadError } = await supabase.storage
        .from(opts.bucket!)
        .upload(filePath, fileToUpload);
    
    if (uploadError) {
        throw new Error(`Failed to upload photo: ${uploadError.message}`);
    }
    
    onProgress(90);
    
    const { data } = supabase.storage
        .from(opts.bucket!)
        .getPublicUrl(filePath);
    
    onProgress(100);
    
    return {
        url: data.publicUrl,
        path: filePath,
        size: fileToUpload.size,
        type: fileToUpload.type
    };
}

