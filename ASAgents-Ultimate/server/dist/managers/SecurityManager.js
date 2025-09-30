import crypto from 'crypto';
import { promisify } from 'util';
import { ManagerError } from '../types/managers.js';
const scrypt = promisify(crypto.scrypt);
export class SecurityManager {
    policy;
    static instance;
    algorithm = 'aes-256-gcm';
    keyLength = 32;
    ivLength = 16;
    saltLength = 32;
    tagLength = 16;
    iterations = 100000;
    constructor(policy) {
        this.policy = policy;
    }
    static getInstance(policy) {
        if (!SecurityManager.instance) {
            if (!policy) {
                throw new ManagerError('SecurityManager requires a policy for initialization', 'MISSING_POLICY');
            }
            SecurityManager.instance = new SecurityManager(policy);
        }
        return SecurityManager.instance;
    }
    // ===== ENCRYPTION METHODS =====
    /**
     * Encrypt a value using AES-256-GCM with PBKDF2 key derivation
     */
    async encrypt(value, masterKey) {
        try {
            const salt = crypto.randomBytes(this.saltLength);
            const iv = crypto.randomBytes(this.ivLength);
            // Derive key using PBKDF2
            const key = await scrypt(masterKey, salt, this.keyLength);
            // Create cipher
            const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
            // Encrypt the value
            let encrypted = cipher.update(value, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            // Get authentication tag
            const tag = cipher.getAuthTag();
            // Combine encrypted data and tag
            const encryptedWithTag = encrypted + tag.toString('hex');
            return {
                encrypted: encryptedWithTag,
                salt: salt.toString('hex'),
                iv: iv.toString('hex'),
                algorithm: this.algorithm,
                keyDerivation: 'pbkdf2'
            };
        }
        catch (error) {
            throw new ManagerError('Encryption failed', 'ENCRYPTION_ERROR', 500, { originalError: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    /**
     * Decrypt a value using AES-256-GCM
     */
    async decrypt(encryptionResult, masterKey) {
        try {
            const salt = Buffer.from(encryptionResult.salt, 'hex');
            const iv = Buffer.from(encryptionResult.iv, 'hex');
            // Derive the same key
            const key = await scrypt(masterKey, salt, this.keyLength);
            // Split encrypted data and tag
            const encryptedWithTag = encryptionResult.encrypted;
            const encrypted = encryptedWithTag.slice(0, -this.tagLength * 2);
            const tag = Buffer.from(encryptedWithTag.slice(-this.tagLength * 2), 'hex');
            // Create decipher
            const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
            decipher.setAuthTag(tag);
            // Decrypt the value
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
        catch (error) {
            throw new ManagerError('Decryption failed', 'DECRYPTION_ERROR', 500, { originalError: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    // ===== HASHING METHODS =====
    /**
     * Generate a secure hash using SHA-256
     */
    generateHash(value, salt) {
        const actualSalt = salt || crypto.randomBytes(this.saltLength).toString('hex');
        const hash = crypto.createHash('sha256').update(value + actualSalt).digest('hex');
        return { hash, salt: actualSalt };
    }
    /**
     * Verify a hash
     */
    verifyHash(value, hash, salt) {
        const { hash: computedHash } = this.generateHash(value, salt);
        return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'));
    }
    /**
     * Generate a checksum for data integrity
     */
    generateChecksum(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }
    /**
     * Verify data integrity using checksum
     */
    verifyChecksum(data, checksum) {
        const computedChecksum = this.generateChecksum(data);
        return crypto.timingSafeEqual(Buffer.from(checksum, 'hex'), Buffer.from(computedChecksum, 'hex'));
    }
    // ===== TOKEN GENERATION =====
    /**
     * Generate a cryptographically secure random token
     */
    generateSecureToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }
    /**
     * Generate an API key with specific format
     */
    generateAPIKey(prefix = 'ak') {
        const timestamp = Date.now().toString(36);
        const random = crypto.randomBytes(16).toString('hex');
        return `${prefix}_${timestamp}_${random}`;
    }
    /**
     * Generate a UUID v4
     */
    generateUUID() {
        return crypto.randomUUID();
    }
    // ===== VALIDATION METHODS =====
    /**
     * Validate password strength
     */
    validatePassword(password) {
        const errors = [];
        if (password.length < this.policy.passwordMinLength) {
            errors.push(`Password must be at least ${this.policy.passwordMinLength} characters long`);
        }
        if (this.policy.passwordRequireUppercase && !/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (this.policy.passwordRequireLowercase && !/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (this.policy.passwordRequireNumbers && !/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        if (this.policy.passwordRequireSymbols && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Sanitize input to prevent XSS and injection attacks
     */
    sanitizeInput(input) {
        return input
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/['"]/g, '') // Remove quotes
            .replace(/[;&|`$]/g, '') // Remove command injection characters
            .trim();
    }
    /**
     * Validate email format
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    /**
     * Validate URL format
     */
    validateURL(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Validate IP address
     */
    validateIPAddress(ip) {
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        return ipv4Regex.test(ip) || ipv6Regex.test(ip);
    }
    // ===== SECURITY HEADERS =====
    /**
     * Get security headers for HTTP responses
     */
    getSecurityHeaders() {
        return {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'Content-Security-Policy': "default-src 'self'",
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
            ...this.policy.securityHeaders
        };
    }
    // ===== RATE LIMITING HELPERS =====
    /**
     * Generate rate limit key
     */
    generateRateLimitKey(identifier, endpoint) {
        return `rate_limit:${identifier}:${endpoint}`;
    }
    /**
     * Check if IP is in whitelist
     */
    isIPWhitelisted(ip, whitelist) {
        return whitelist.includes(ip) || whitelist.includes('*');
    }
    // ===== MEMORY SECURITY =====
    /**
     * Securely clear sensitive data from memory
     */
    clearSensitiveData(data) {
        if (typeof data === 'string') {
            // Overwrite string memory (best effort)
            for (let i = 0; i < data.length; i++) {
                data = data.substring(0, i) + '\0' + data.substring(i + 1);
            }
        }
        else if (Buffer.isBuffer(data)) {
            data.fill(0);
        }
        else if (typeof data === 'object' && data !== null) {
            Object.keys(data).forEach(key => {
                delete data[key];
            });
        }
    }
    // ===== TIMING ATTACK PREVENTION =====
    /**
     * Constant-time string comparison to prevent timing attacks
     */
    constantTimeCompare(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        const bufferA = Buffer.from(a);
        const bufferB = Buffer.from(b);
        return crypto.timingSafeEqual(bufferA, bufferB);
    }
    // ===== POLICY MANAGEMENT =====
    /**
     * Update security policy
     */
    updatePolicy(newPolicy) {
        this.policy = { ...this.policy, ...newPolicy };
    }
    /**
     * Get current security policy
     */
    getPolicy() {
        return { ...this.policy };
    }
}
