import fs from 'fs/promises';
import path from 'path';
import { 
  Secret, 
  SecretMetadata, 
  SecretValue, 
  SecretAccess, 
  SecretsManagerConfig, 
  Environment, 
  SecretType,
  SecretsError 
} from '../types/managers.js';
import { SecurityManager } from './SecurityManager.js';

export class SecretsManager {
  private static instance: SecretsManager;
  private securityManager: SecurityManager;
  private cache: Map<string, { secret: Secret; timestamp: number }> = new Map();
  private auditLog: SecretAccess[] = [];

  private constructor(
    private config: SecretsManagerConfig,
    private masterKey: string
  ) {
    this.securityManager = SecurityManager.getInstance();
  }

  public static async getInstance(
    config?: SecretsManagerConfig,
    masterKey?: string
  ): Promise<SecretsManager> {
    if (!SecretsManager.instance) {
      if (!config || !masterKey) {
        throw new SecretsError('SecretsManager requires config and masterKey for initialization', 'MISSING_CONFIG');
      }
      SecretsManager.instance = new SecretsManager(config, masterKey);
      await SecretsManager.instance.initialize();
    }
    return SecretsManager.instance;
  }

  private async initialize(): Promise<void> {
    try {
      // Ensure storage directory exists
      if (this.config.storageBackend === 'file' && this.config.storagePath) {
        await fs.mkdir(this.config.storagePath, { recursive: true });
      }
      
      // Load existing secrets into cache if caching is enabled
      if (this.config.cacheEnabled) {
        await this.loadSecretsToCache();
      }
    } catch (error) {
      throw new SecretsError(
        'Failed to initialize SecretsManager',
        'INITIALIZATION_ERROR',
        { originalError: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  // ===== CORE SECRET OPERATIONS =====

  /**
   * Store a secret securely
   */
  public async setSecret(
    key: string,
    value: string,
    metadata: Partial<SecretMetadata>,
    userId?: string
  ): Promise<void> {
    try {
      const secretId = this.securityManager.generateUUID();
      const now = new Date();
      
      // Encrypt the secret value
      const encryptionResult = await this.securityManager.encrypt(value, this.masterKey);
      
      // Create secret metadata
      const secret: Secret = {
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
      
    } catch (error) {
      await this.auditSecretAccess(key, 'write', userId, false, error instanceof Error ? error.message : 'Unknown error');
      throw new SecretsError(
        `Failed to store secret: ${key}`,
        'STORE_ERROR',
        { key, originalError: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  /**
   * Retrieve a secret securely
   */
  public async getSecret(
    key: string,
    environment: Environment = 'development',
    userId?: string
  ): Promise<string> {
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
      
    } catch (error) {
      await this.auditSecretAccess(key, 'read', userId, false, error instanceof Error ? error.message : 'Unknown error');
      if (error instanceof SecretsError) {
        throw error;
      }
      throw new SecretsError(
        `Failed to retrieve secret: ${key}`,
        'RETRIEVE_ERROR',
        { key, environment, originalError: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  /**
   * Rotate a secret (generate new value)
   */
  public async rotateSecret(
    key: string,
    environment: Environment = 'development',
    newValue?: string,
    userId?: string
  ): Promise<string> {
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
      const updatedSecret: Secret = {
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
      
    } catch (error) {
      await this.auditSecretAccess(key, 'rotate', userId, false, error instanceof Error ? error.message : 'Unknown error');
      throw new SecretsError(
        `Failed to rotate secret: ${key}`,
        'ROTATE_ERROR',
        { key, environment, originalError: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  /**
   * Delete a secret
   */
  public async deleteSecret(
    key: string,
    environment: Environment = 'development',
    userId?: string
  ): Promise<void> {
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
      
    } catch (error) {
      await this.auditSecretAccess(key, 'delete', userId, false, error instanceof Error ? error.message : 'Unknown error');
      throw new SecretsError(
        `Failed to delete secret: ${key}`,
        'DELETE_ERROR',
        { key, environment, originalError: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  /**
   * List all secrets (metadata only)
   */
  public async listSecrets(environment?: Environment): Promise<SecretMetadata[]> {
    try {
      const secrets = await this.loadAllSecrets(environment);
      return secrets.map(secret => {
        const { encryptedValue, salt, iv, ...metadata } = secret;
        return metadata;
      });
    } catch (error) {
      throw new SecretsError(
        'Failed to list secrets',
        'LIST_ERROR',
        { environment, originalError: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  private async decryptSecret(secret: Secret): Promise<string> {
    const encryptionResult = {
      encrypted: secret.encryptedValue,
      salt: secret.salt,
      iv: secret.iv,
      algorithm: this.config.encryptionAlgorithm,
      keyDerivation: 'pbkdf2'
    };
    
    return await this.securityManager.decrypt(encryptionResult, this.masterKey);
  }

  private generateSecretValue(type: SecretType): string {
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

  private getCacheKey(key: string, environment: Environment): string {
    return `${environment}:${key}`;
  }

  private isCacheValid(timestamp: number): boolean {
    return (Date.now() - timestamp) < (this.config.cacheTTL * 1000);
  }

  private async updateSecretAccess(secretId: string, userId?: string): Promise<void> {
    // This would update the access count and last accessed time in storage
    // Implementation depends on storage backend
  }

  private async auditSecretAccess(
    secretId: string,
    action: 'read' | 'write' | 'rotate' | 'delete',
    userId?: string,
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    if (!this.config.auditLogging) return;
    
    const auditEntry: SecretAccess = {
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

  private async storeSecret(secret: Secret): Promise<void> {
    if (this.config.storageBackend === 'file') {
      await this.storeSecretToFile(secret);
    } else {
      throw new SecretsError('Storage backend not implemented', 'STORAGE_NOT_IMPLEMENTED');
    }
  }

  private async loadSecret(key: string, environment: Environment): Promise<Secret | null> {
    if (this.config.storageBackend === 'file') {
      return await this.loadSecretFromFile(key, environment);
    } else {
      throw new SecretsError('Storage backend not implemented', 'STORAGE_NOT_IMPLEMENTED');
    }
  }

  private async loadAllSecrets(environment?: Environment): Promise<Secret[]> {
    if (this.config.storageBackend === 'file') {
      return await this.loadAllSecretsFromFile(environment);
    } else {
      throw new SecretsError('Storage backend not implemented', 'STORAGE_NOT_IMPLEMENTED');
    }
  }

  private async removeSecret(key: string, environment: Environment): Promise<void> {
    if (this.config.storageBackend === 'file') {
      await this.removeSecretFromFile(key, environment);
    } else {
      throw new SecretsError('Storage backend not implemented', 'STORAGE_NOT_IMPLEMENTED');
    }
  }

  private async loadSecretsToCache(): Promise<void> {
    const secrets = await this.loadAllSecrets();
    secrets.forEach(secret => {
      const cacheKey = this.getCacheKey(secret.key, secret.environment);
      this.cache.set(cacheKey, { secret, timestamp: Date.now() });
    });
  }

  // File storage implementation
  private async storeSecretToFile(secret: Secret): Promise<void> {
    if (!this.config.storagePath) {
      throw new SecretsError('Storage path not configured', 'STORAGE_PATH_MISSING');
    }
    
    const filename = `${secret.environment}_${secret.key}.json`;
    const filepath = path.join(this.config.storagePath, filename);
    await fs.writeFile(filepath, JSON.stringify(secret, null, 2));
  }

  private async loadSecretFromFile(key: string, environment: Environment): Promise<Secret | null> {
    if (!this.config.storagePath) {
      throw new SecretsError('Storage path not configured', 'STORAGE_PATH_MISSING');
    }
    
    const filename = `${environment}_${key}.json`;
    const filepath = path.join(this.config.storagePath, filename);
    
    try {
      const data = await fs.readFile(filepath, 'utf8');
      return JSON.parse(data) as Secret;
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  private async loadAllSecretsFromFile(environment?: Environment): Promise<Secret[]> {
    if (!this.config.storagePath) {
      throw new SecretsError('Storage path not configured', 'STORAGE_PATH_MISSING');
    }
    
    const files = await fs.readdir(this.config.storagePath);
    const secrets: Secret[] = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const [env] = file.split('_');
        if (!environment || env === environment) {
          const filepath = path.join(this.config.storagePath, file);
          const data = await fs.readFile(filepath, 'utf8');
          secrets.push(JSON.parse(data) as Secret);
        }
      }
    }
    
    return secrets;
  }

  private async removeSecretFromFile(key: string, environment: Environment): Promise<void> {
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
  public getAuditLog(): SecretAccess[] {
    return [...this.auditLog];
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0 // Would need to track hits/misses for real implementation
    };
  }
}
