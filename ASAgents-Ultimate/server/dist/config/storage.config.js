// Storage Configuration for Multimodal System
// Environment-specific storage settings and provider configurations
// Development configuration - Local storage with minimal optimization
const developmentConfig = {
    provider: 'local',
    encryption: false,
    compression: false,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    retentionDays: 30,
    cacheTTL: 1800 // 30 minutes
};
// Staging configuration - Cloud storage with moderate optimization
const stagingConfig = {
    provider: 'gcp',
    bucket: process.env.STAGING_STORAGE_BUCKET || 'multimodal-staging',
    region: process.env.STAGING_STORAGE_REGION || 'us-central1',
    encryption: true,
    compression: true,
    maxFileSize: 100 * 1024 * 1024, // 100MB
    retentionDays: 90,
    cacheTTL: 3600 // 1 hour
};
// Production configuration - Cloud storage with full optimization
const productionConfig = {
    provider: 'gcp',
    bucket: process.env.PRODUCTION_STORAGE_BUCKET || 'multimodal-production',
    region: process.env.PRODUCTION_STORAGE_REGION || 'us-central1',
    encryption: true,
    compression: true,
    maxFileSize: 500 * 1024 * 1024, // 500MB
    retentionDays: 365,
    cacheTTL: 7200 // 2 hours
};
// AWS configuration template
const awsConfig = {
    provider: 'aws',
    bucket: process.env.AWS_S3_BUCKET || 'multimodal-content',
    region: process.env.AWS_REGION || 'us-east-1',
    accessKey: process.env.AWS_ACCESS_KEY_ID,
    secretKey: process.env.AWS_SECRET_ACCESS_KEY,
    encryption: true,
    compression: true,
    maxFileSize: 500 * 1024 * 1024, // 500MB
    retentionDays: 365,
    cacheTTL: 7200 // 2 hours
};
// Azure configuration template
const azureConfig = {
    provider: 'azure',
    bucket: process.env.AZURE_CONTAINER_NAME || 'multimodal-content',
    region: process.env.AZURE_REGION || 'eastus',
    accessKey: process.env.AZURE_STORAGE_ACCOUNT,
    secretKey: process.env.AZURE_STORAGE_KEY,
    encryption: true,
    compression: true,
    maxFileSize: 500 * 1024 * 1024, // 500MB
    retentionDays: 365,
    cacheTTL: 7200 // 2 hours
};
// Environment configurations
export const storageConfigs = {
    development: developmentConfig,
    staging: stagingConfig,
    production: productionConfig
};
// Get current environment configuration
export function getCurrentStorageConfig() {
    const env = process.env.NODE_ENV || 'development';
    // Override with specific provider if requested
    const provider = process.env.STORAGE_PROVIDER;
    if (provider === 'aws') {
        return awsConfig;
    }
    else if (provider === 'azure') {
        return azureConfig;
    }
    return storageConfigs[env] || developmentConfig;
}
// Storage optimization settings
export const optimizationSettings = {
    image: {
        maxWidth: 2048,
        maxHeight: 2048,
        quality: 85,
        formats: ['webp', 'jpeg', 'png'],
        thumbnailSizes: [150, 300, 600]
    },
    audio: {
        maxBitrate: 320, // kbps
        formats: ['mp3', 'ogg', 'wav'],
        sampleRates: [44100, 48000]
    },
    video: {
        maxBitrate: 5000, // kbps
        maxResolution: '1920x1080',
        formats: ['mp4', 'webm'],
        thumbnailCount: 3
    },
    document: {
        maxPages: 100,
        previewPages: 3,
        formats: ['pdf', 'txt', 'docx']
    }
};
// Cache configuration
export const cacheConfig = {
    maxSize: 500 * 1024 * 1024, // 500MB
    maxItemSize: 10 * 1024 * 1024, // 10MB per item
    evictionPolicy: 'lru', // Least Recently Used
    compressionThreshold: 1024 * 1024, // 1MB
    encryptionEnabled: true
};
// CDN configuration
export const cdnConfig = {
    enabled: process.env.CDN_ENABLED === 'true',
    baseUrl: process.env.CDN_BASE_URL || '',
    cacheTTL: 86400, // 24 hours
    regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1']
};
// Monitoring and metrics configuration
export const monitoringConfig = {
    metricsEnabled: true,
    alertThresholds: {
        storageUsage: 0.8, // 80%
        cacheHitRate: 0.7, // 70%
        averageUploadTime: 5000, // 5 seconds
        errorRate: 0.05 // 5%
    },
    retentionPeriod: 30 // days
};
// Security configuration
export const securityConfig = {
    encryptionAlgorithm: 'AES-256-GCM',
    keyRotationDays: 90,
    accessLogging: true,
    virusScanEnabled: true,
    allowedMimeTypes: [
        // Images
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/bmp',
        'image/svg+xml',
        // Audio
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'audio/m4a',
        'audio/flac',
        // Video
        'video/mp4',
        'video/avi',
        'video/mov',
        'video/mkv',
        'video/webm',
        // Documents
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    maxFileSize: {
        image: 50 * 1024 * 1024, // 50MB
        audio: 100 * 1024 * 1024, // 100MB
        video: 500 * 1024 * 1024, // 500MB
        document: 25 * 1024 * 1024 // 25MB
    }
};
// Backup configuration
export const backupConfig = {
    enabled: process.env.BACKUP_ENABLED === 'true',
    frequency: 'daily', // daily, weekly, monthly
    retentionDays: 30,
    crossRegionReplication: true,
    compressionEnabled: true,
    encryptionEnabled: true
};
// Export all configurations
export { developmentConfig, stagingConfig, productionConfig, awsConfig, azureConfig };
