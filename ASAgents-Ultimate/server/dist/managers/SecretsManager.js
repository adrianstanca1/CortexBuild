import fs from 'fs/promises';
import path from 'path';
import { SecretsError } from '../types/managers.js';
import { SecurityManager } from './SecurityManager.js';
export class SecretsManager {
    config;
    masterKey;
    static instance;
    securityManager;
    cache = new Map();
    auditLog = [];
    constructor(config, masterKey) {
        this.config = config;
        this.masterKey = masterKey;
        this.securityManager = SecurityManager.getInstance();
    }
    static async getInstance(config, masterKey) {
        if (!SecretsManager.instance) {
            if (!config || !masterKey) {
                throw new SecretsError('SecretsManager requires config and masterKey for initialization', 'MISSING_CONFIG');
            }
            SecretsManager.instance = new SecretsManager(config, masterKey);
            await SecretsManager.instance.initialize();
        }
        return SecretsManager.instance;
    }
    async initialize() {
        try {
            // Ensure storage directory exists
            if (this.config.storageBackend === 'file' && this.config.storagePath) {
                await fs.mkdir(this.config.storagePath, { recursive: true });
            }
            // Load existing secrets into cache if caching is enabled
            if (this.config.cacheEnabled) {
                await this.loadSecretsToCache();
            }
        }
        catch (error) {
            throw new SecretsError('Failed to initialize SecretsManager', 'INITIALIZATION_ERROR', { originalError: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    // ===== CORE SECRET OPERATIONS =====
    /**
     * Store a secret securely
     */
    async setSecret(key, value, metadata, userId) {
        try {
            const secretId = this.securityManager.generateUUID();
            const now = new Date();
            // Encrypt the secret value
            const encryptionResult = await this.securityManager.encrypt(value, this.masterKey);
            // Create secret metadata
            const secret = {
                id: secretId,
                key,
                type: metadata.type || 'api_key',
                environment: metadata.environment || 'development',
                description: metadata.description,
                tags: metadata.tags || [],
                createdAt: now,
                updatedAt: now,
                expiresAt: metadata.expiresAt,
                rotationInterval: metadata.rotationInterval || this.config.defaultRotationInterval,
                lastRotated: now,
                accessCount: 0,
                isActive: true,
                permissions: metadata.permissions || [],
                encryptedValue: encryptionResult.encrypted,
                salt: encryptionResult.salt,
                iv: encryptionResult.iv
            };
            // Store the secret
            await this.storeSecret(secret);
            // Update cache
            if (this.config.cacheEnabled) {
                this.cache.set(this.getCacheKey(key, secret.environment), {
                    secret,
                    timestamp: Date.now()
                });
            }
            // Audit log
            await this.auditSecretAccess(secretId, 'write', userId, true);
        }
        catch (error) {
            await this.auditSecretAccess(key, 'write', userId, false, error instanceof Error ? error.message : 'Unknown error');
            throw new SecretsError(`Failed to store secret: ${key}`, 'STORE_ERROR', { key, originalError: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    /**
     * Retrieve a secret securely
     */
    async getSecret(key, environment = 'development', userId) {
        try {
            const cacheKey = this.getCacheKey(key, environment);
            // Check cache first
            if (this.config.cacheEnabled) {
                const cached = this.cache.get(cacheKey);
                if (cached && this.isCacheValid(cached.timestamp)) {
                    const decryptedValue = await this.decryptSecret(cached.secret);
                    await this.updateSecretAccess(cached.secret.id, userId);
                    await this.auditSecretAccess(cached.secret.id, 'read', userId, true);
                    return decryptedValue;
                }
            }
            // Load from storage
            const secret = await this.loadSecret(key, environment);
            if (!secret) {
                throw new SecretsError(`Secret not found: ${key}`, 'SECRET_NOT_FOUND', { key, environment });
            }
            if (!secret.isActive) {
                throw new SecretsError(`Secret is inactive: ${key}`, 'SECRET_INACTIVE', { key, environment });
            }
            if (secret.expiresAt && secret.expiresAt < new Date()) {
                throw new SecretsError(`Secret has expired: ${key}`, 'SECRET_EXPIRED', { key, environment });
            }
            // Decrypt the secret
            const decryptedValue = await this.decryptSecret(secret);
            // Update cache
            if (this.config.cacheEnabled) {
                this.cache.set(cacheKey, { secret, timestamp: Date.now() });
            }
            // Update access tracking
            await this.updateSecretAccess(secret.id, userId);
            await this.auditSecretAccess(secret.id, 'read', userId, true);
            return decryptedValue;
        }
        catch (error) {
            await this.auditSecretAccess(key, 'read', userId, false, error instanceof Error ? error.message : 'Unknown error');
            if (error instanceof SecretsError) {
                throw error;
            }
            throw new SecretsError(`Failed to retrieve secret: ${key}`, 'RETRIEVE_ERROR', { key, environment, originalError: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    /**
     * Rotate a secret (generate new value)
     */
    async rotateSecret(key, environment = 'development', newValue, userId) {
        try {
            const secret = await this.loadSecret(key, environment);
            if (!secret) {
                throw new SecretsError(`Secret not found: ${key}`, 'SECRET_NOT_FOUND', { key, environment });
            }
            // Generate new value if not provided
            const rotatedValue = newValue || this.generateSecretValue(secret.type);
            // Encrypt new value
            const encryptionResult = await this.securityManager.encrypt(rotatedValue, this.masterKey);
            // Update secret
            const updatedSecret = {
                ...secret,
                encryptedValue: encryptionResult.encrypted,
                salt: encryptionResult.salt,
                iv: encryptionResult.iv,
                updatedAt: new Date(),
                lastRotated: new Date()
            };
            // Store updated secret
            await this.storeSecret(updatedSecret);
            // Update cache
            if (this.config.cacheEnabled) {
                const cacheKey = this.getCacheKey(key, environment);
                this.cache.set(cacheKey, { secret: updatedSecret, timestamp: Date.now() });
            }
            // Audit log
            await this.auditSecretAccess(secret.id, 'rotate', userId, true);
            return rotatedValue;
        }
        catch (error) {
            await this.auditSecretAccess(key, 'rotate', userId, false, error instanceof Error ? error.message : 'Unknown error');
            throw new SecretsError(`Failed to rotate secret: ${key}`, 'ROTATE_ERROR', { key, environment, originalError: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    /**
     * Delete a secret
     */
    async deleteSecret(key, environment = 'development', userId) {
        try {
            const secret = await this.loadSecret(key, environment);
            if (!secret) {
                throw new SecretsError(`Secret not found: ${key}`, 'SECRET_NOT_FOUND', { key, environment });
            }
            // Remove from storage
            await this.removeSecret(key, environment);
            // Remove from cache
            if (this.config.cacheEnabled) {
                const cacheKey = this.getCacheKey(key, environment);
                this.cache.delete(cacheKey);
            }
            // Audit log
            await this.auditSecretAccess(secret.id, 'delete', userId, true);
        }
        catch (error) {
            await this.auditSecretAccess(key, 'delete', userId, false, error instanceof Error ? error.message : 'Unknown error');
            throw new SecretsError(`Failed to delete secret: ${key}`, 'DELETE_ERROR', { key, environment, originalError: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    /**
     * List all secrets (metadata only)
     */
    async listSecrets(environment) {
        try {
            const secrets = await this.loadAllSecrets(environment);
            return secrets.map(secret => {
                const { encryptedValue, salt, iv, ...metadata } = secret;
                return metadata;
            });
        }
        catch (error) {
            throw new SecretsError('Failed to list secrets', 'LIST_ERROR', { environment, originalError: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    // ===== PRIVATE HELPER METHODS =====
    async decryptSecret(secret) {
        const encryptionResult = {
            encrypted: secret.encryptedValue,
            salt: secret.salt,
            iv: secret.iv,
            algorithm: this.config.encryptionAlgorithm,
            keyDerivation: 'pbkdf2'
        };
        return await this.securityManager.decrypt(encryptionResult, this.masterKey);
    }
    generateSecretValue(type) {
        switch (type) {
            case 'api_key':
                return this.securityManager.generateAPIKey();
            case 'jwt_secret':
                return this.securityManager.generateSecureToken(64);
            case 'encryption_key':
                return this.securityManager.generateSecureToken(32);
            default:
                return this.securityManager.generateSecureToken(32);
        }
    }
    getCacheKey(key, environment) {
        return `${environment}:${key}`;
    }
    isCacheValid(timestamp) {
        return (Date.now() - timestamp) < (this.config.cacheTTL * 1000);
    }
    async updateSecretAccess(secretId, userId) {
        // This would update the access count and last accessed time in storage
        // Implementation depends on storage backend
    }
    async auditSecretAccess(secretId, action, userId, success = true, errorMessage) {
        if (!this.config.auditLogging)
            return;
        const auditEntry = {
            secretId,
            userId,
            action,
            timestamp: new Date(),
            success,
            errorMessage
        };
        this.auditLog.push(auditEntry);
        // In a real implementation, this would be persisted to storage
        // For now, we keep it in memory
    }
    // ===== STORAGE BACKEND METHODS =====
    // These methods would be implemented based on the chosen storage backend
    async storeSecret(secret) {
        if (this.config.storageBackend === 'file') {
            await this.storeSecretToFile(secret);
        }
        else {
            throw new SecretsError('Storage backend not implemented', 'STORAGE_NOT_IMPLEMENTED');
        }
    }
    async loadSecret(key, environment) {
        if (this.config.storageBackend === 'file') {
            return await this.loadSecretFromFile(key, environment);
        }
        else {
            throw new SecretsError('Storage backend not implemented', 'STORAGE_NOT_IMPLEMENTED');
        }
    }
    async loadAllSecrets(environment) {
        if (this.config.storageBackend === 'file') {
            return await this.loadAllSecretsFromFile(environment);
        }
        else {
            throw new SecretsError('Storage backend not implemented', 'STORAGE_NOT_IMPLEMENTED');
        }
    }
    async removeSecret(key, environment) {
        if (this.config.storageBackend === 'file') {
            await this.removeSecretFromFile(key, environment);
        }
        else {
            throw new SecretsError('Storage backend not implemented', 'STORAGE_NOT_IMPLEMENTED');
        }
    }
    async loadSecretsToCache() {
        const secrets = await this.loadAllSecrets();
        secrets.forEach(secret => {
            const cacheKey = this.getCacheKey(secret.key, secret.environment);
            this.cache.set(cacheKey, { secret, timestamp: Date.now() });
        });
    }
    // File storage implementation
    async storeSecretToFile(secret) {
        if (!this.config.storagePath) {
            throw new SecretsError('Storage path not configured', 'STORAGE_PATH_MISSING');
        }
        const filename = `${secret.environment}_${secret.key}.json`;
        const filepath = path.join(this.config.storagePath, filename);
        await fs.writeFile(filepath, JSON.stringify(secret, null, 2));
    }
    async loadSecretFromFile(key, environment) {
        if (!this.config.storagePath) {
            throw new SecretsError('Storage path not configured', 'STORAGE_PATH_MISSING');
        }
        const filename = `${environment}_${key}.json`;
        const filepath = path.join(this.config.storagePath, filename);
        try {
            const data = await fs.readFile(filepath, 'utf8');
            return JSON.parse(data);
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                return null;
            }
            throw error;
        }
    }
    async loadAllSecretsFromFile(environment) {
        if (!this.config.storagePath) {
            throw new SecretsError('Storage path not configured', 'STORAGE_PATH_MISSING');
        }
        const files = await fs.readdir(this.config.storagePath);
        const secrets = [];
        for (const file of files) {
            if (file.endsWith('.json')) {
                const [env] = file.split('_');
                if (!environment || env === environment) {
                    const filepath = path.join(this.config.storagePath, file);
                    const data = await fs.readFile(filepath, 'utf8');
                    secrets.push(JSON.parse(data));
                }
            }
        }
        return secrets;
    }
    async removeSecretFromFile(key, environment) {
        if (!this.config.storagePath) {
            throw new SecretsError('Storage path not configured', 'STORAGE_PATH_MISSING');
        }
        const filename = `${environment}_${key}.json`;
        const filepath = path.join(this.config.storagePath, filename);
        await fs.unlink(filepath);
    }
    // ===== PUBLIC UTILITY METHODS =====
    /**
     * Get audit log
     */
    getAuditLog() {
        return [...this.auditLog];
    }
    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            hitRate: 0 // Would need to track hits/misses for real implementation
        };
    }
}
