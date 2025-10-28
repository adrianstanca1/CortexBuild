/**
 * Advanced caching service with TTL, LRU eviction, and persistence
 */

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  persistent?: boolean; // Whether to persist to localStorage
  namespace?: string; // Cache namespace for isolation
}

export class CacheService {
  private cache = new Map<string, CacheEntry>();
  private readonly defaultTtl: number;
  private readonly maxSize: number;
  private readonly persistent: boolean;
  private readonly namespace: string;

  private isTestEnv(): boolean {
    try {
      // vitest exposes VITEST_WORKER_ID; NODE_ENV may be 'test'
      return typeof process !== 'undefined' && !!((process as any).env?.VITEST || (process as any).env?.VITEST_WORKER_ID || process.env?.NODE_ENV === 'test');
    } catch {
      return false;
    }
  }

  constructor(options: CacheOptions = {}) {
    this.defaultTtl = options.ttl || 5 * 60 * 1000; // 5 minutes default
    this.maxSize = options.maxSize || 100;
    this.persistent = options.persistent || false;
    this.namespace = options.namespace || 'app-cache';

    if (this.persistent) {
      this.loadFromStorage();
    }

    // Cleanup expired entries every minute (only in browser environment and not during tests)
    if (typeof window !== 'undefined' && !this.isTestEnv()) {
      setInterval(() => this.cleanup(), 60 * 1000);
    }
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl: ttl || this.defaultTtl,
      accessCount: 0,
      lastAccessed: now,
    };

    // Evict LRU entry if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, entry);

    if (this.persistent) {
      this.saveToStorage();
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    
    // Check if expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      if (this.persistent) this.saveToStorage();
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = now;

    return entry.data as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted && this.persistent) {
      this.saveToStorage();
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    if (this.persistent) {
      this.saveToStorage();
    }
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  size(): number {
    return this.cache.size;
  }

  getStats() {
    const entries = Array.from(this.cache.values());
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalAccesses: entries.reduce((sum, entry) => sum + entry.accessCount, 0),
      averageAge: entries.length > 0 
        ? entries.reduce((sum, entry) => sum + (Date.now() - entry.timestamp), 0) / entries.length
        : 0,
    };
  }

  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    if (keysToDelete.length > 0 && this.persistent) {
      this.saveToStorage();
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      const serialized = JSON.stringify(Array.from(this.cache.entries()));
      localStorage.setItem(`${this.namespace}-cache`, serialized);
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      const stored = localStorage.getItem(`${this.namespace}-cache`);
      if (stored) {
        const entries = JSON.parse(stored);
        this.cache = new Map(entries);
        this.cleanup(); // Remove any expired entries
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }
}

// Global cache instances
export const apiCache = new CacheService({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 200,
  persistent: true,
  namespace: 'api-cache',
});

export const userCache = new CacheService({
  ttl: 30 * 60 * 1000, // 30 minutes
  maxSize: 50,
  persistent: true,
  namespace: 'user-cache',
});

export const projectCache = new CacheService({
  ttl: 10 * 60 * 1000, // 10 minutes
  maxSize: 100,
  persistent: true,
  namespace: 'project-cache',
});

// Cache key generators
export const cacheKeys = {
  user: (id: string) => `user:${id}`,
  project: (id: string) => `project:${id}`,
  projectsByCompany: (companyId: string) => `projects:company:${companyId}`,
  tasksByProject: (projectId: string) => `tasks:project:${projectId}`,
  notifications: (userId: string) => `notifications:${userId}`,
  companySettings: (companyId: string) => `settings:company:${companyId}`,
  financials: (companyId: string, period: string) => `financials:${companyId}:${period}`,
  weather: (lat: number, lng: number) => `weather:${lat.toFixed(2)}:${lng.toFixed(2)}`,
};
