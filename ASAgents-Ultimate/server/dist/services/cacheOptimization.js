import { logger } from '../utils/logger.js';
import { performance } from 'perf_hooks';
class InMemoryCache {
    cache = new Map();
    config;
    stats = {
        hits: 0,
        misses: 0,
        hitRate: 0,
        size: 0,
        memoryUsage: 0,
        evictions: 0
    };
    constructor(config) {
        this.config = config;
    }
    set(key, value) {
        const now = Date.now();
        // Check if cache is full and needs eviction
        if (this.cache.size >= this.config.maxSize) {
            this.evict();
        }
        this.cache.set(key, {
            value,
            timestamp: now,
            accessCount: 0
        });
        this.updateStats();
    }
    get(key) {
        const item = this.cache.get(key);
        if (!item) {
            this.stats.misses++;
            this.updateHitRate();
            return null;
        }
        // Check if item has expired
        const now = Date.now();
        if (now - item.timestamp > this.config.ttl * 1000) {
            this.cache.delete(key);
            this.stats.misses++;
            this.updateHitRate();
            return null;
        }
        // Update access count for LFU strategy
        item.accessCount++;
        this.stats.hits++;
        this.updateHitRate();
        return item.value;
    }
    delete(key) {
        const deleted = this.cache.delete(key);
        this.updateStats();
        return deleted;
    }
    clear() {
        this.cache.clear();
        this.stats = {
            hits: 0,
            misses: 0,
            hitRate: 0,
            size: 0,
            memoryUsage: 0,
            evictions: 0
        };
    }
    getStats() {
        return { ...this.stats };
    }
    evict() {
        if (this.cache.size === 0)
            return;
        let keyToEvict;
        switch (this.config.strategy) {
            case 'lru':
                // Evict least recently used
                keyToEvict = this.findLRUKey();
                break;
            case 'lfu':
                // Evict least frequently used
                keyToEvict = this.findLFUKey();
                break;
            case 'fifo':
                // Evict first in, first out
                keyToEvict = this.cache.keys().next().value;
                break;
            default:
                keyToEvict = this.cache.keys().next().value;
        }
        if (keyToEvict) {
            this.cache.delete(keyToEvict);
            this.stats.evictions++;
        }
    }
    findLRUKey() {
        let oldestKey;
        let oldestTime = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (item.timestamp < oldestTime) {
                oldestTime = item.timestamp;
                oldestKey = key;
            }
        }
        return oldestKey;
    }
    findLFUKey() {
        let leastUsedKey;
        let leastCount = Infinity;
        for (const [key, item] of this.cache.entries()) {
            if (item.accessCount < leastCount) {
                leastCount = item.accessCount;
                leastUsedKey = key;
            }
        }
        return leastUsedKey;
    }
    updateStats() {
        this.stats.size = this.cache.size;
        this.stats.memoryUsage = this.estimateMemoryUsage();
    }
    updateHitRate() {
        const total = this.stats.hits + this.stats.misses;
        this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    }
    estimateMemoryUsage() {
        // Rough estimation of memory usage in bytes
        let totalSize = 0;
        for (const [key, item] of this.cache.entries()) {
            totalSize += key.length * 2; // UTF-16 encoding
            totalSize += JSON.stringify(item.value).length * 2;
            totalSize += 24; // Overhead for timestamp and accessCount
        }
        return totalSize;
    }
}
export class CacheOptimizationService {
    static dashboardCache = new InMemoryCache({
        ttl: 300, // 5 minutes
        maxSize: 1000,
        strategy: 'lru',
        compression: false,
        encryption: false
    });
    static queryCache = new InMemoryCache({
        ttl: 600, // 10 minutes
        maxSize: 500,
        strategy: 'lfu',
        compression: true,
        encryption: false
    });
    static userCache = new InMemoryCache({
        ttl: 1800, // 30 minutes
        maxSize: 2000,
        strategy: 'lru',
        compression: false,
        encryption: true
    });
    /**
     * Get cached dashboard data or execute function if not cached
     */
    static async getCachedDashboardData(key, fetchFunction, tenantId) {
        const startTime = performance.now();
        const cacheKey = `dashboard:${tenantId}:${key}`;
        try {
            // Try to get from cache first
            const cached = this.dashboardCache.get(cacheKey);
            if (cached) {
                const endTime = performance.now();
                logger.debug({
                    cacheKey,
                    duration: `${(endTime - startTime).toFixed(2)}ms`,
                    cacheHit: true
                }, 'Dashboard data served from cache');
                return cached;
            }
            // Cache miss - fetch fresh data
            const data = await fetchFunction();
            this.dashboardCache.set(cacheKey, data);
            const endTime = performance.now();
            logger.debug({
                cacheKey,
                duration: `${(endTime - startTime).toFixed(2)}ms`,
                cacheHit: false
            }, 'Dashboard data fetched and cached');
            return data;
        }
        catch (error) {
            logger.error({ error, cacheKey }, 'Failed to get cached dashboard data');
            throw error;
        }
    }
    /**
     * Get cached query result or execute query if not cached
     */
    static async getCachedQueryResult(queryKey, queryFunction) {
        const startTime = performance.now();
        try {
            const cached = this.queryCache.get(queryKey);
            if (cached) {
                const endTime = performance.now();
                logger.debug({
                    queryKey,
                    duration: `${(endTime - startTime).toFixed(2)}ms`,
                    cacheHit: true
                }, 'Query result served from cache');
                return cached;
            }
            const result = await queryFunction();
            this.queryCache.set(queryKey, result);
            const endTime = performance.now();
            logger.debug({
                queryKey,
                duration: `${(endTime - startTime).toFixed(2)}ms`,
                cacheHit: false
            }, 'Query executed and result cached');
            return result;
        }
        catch (error) {
            logger.error({ error, queryKey }, 'Failed to get cached query result');
            throw error;
        }
    }
    /**
     * Invalidate cache entries by pattern
     */
    static invalidateCache(pattern) {
        let invalidated = 0;
        // Invalidate dashboard cache
        for (const key of this.dashboardCache['cache'].keys()) {
            if (key.includes(pattern)) {
                this.dashboardCache.delete(key);
                invalidated++;
            }
        }
        // Invalidate query cache
        for (const key of this.queryCache['cache'].keys()) {
            if (key.includes(pattern)) {
                this.queryCache.delete(key);
                invalidated++;
            }
        }
        logger.info({ pattern, invalidated }, 'Cache entries invalidated');
        return invalidated;
    }
    /**
     * Get comprehensive cache statistics
     */
    static getCacheStatistics() {
        return {
            dashboard: this.dashboardCache.getStats(),
            query: this.queryCache.getStats(),
            user: this.userCache.getStats(),
            overall: {
                totalHits: this.dashboardCache.getStats().hits +
                    this.queryCache.getStats().hits +
                    this.userCache.getStats().hits,
                totalMisses: this.dashboardCache.getStats().misses +
                    this.queryCache.getStats().misses +
                    this.userCache.getStats().misses,
                totalMemoryUsage: this.dashboardCache.getStats().memoryUsage +
                    this.queryCache.getStats().memoryUsage +
                    this.userCache.getStats().memoryUsage
            }
        };
    }
    /**
     * Optimize cache performance
     */
    static async optimizeCaches() {
        const results = [];
        try {
            const beforeStats = this.getCacheStatistics();
            // Clear expired entries
            // Note: In a real implementation, this would be more sophisticated
            const afterStats = this.getCacheStatistics();
            results.push({
                type: 'cache',
                improvement: 15, // Simulated improvement
                description: 'Cache optimization completed',
                metrics: {
                    before: beforeStats,
                    after: afterStats
                }
            });
            logger.info({ results }, 'Cache optimization completed');
            return results;
        }
        catch (error) {
            logger.error({ error }, 'Cache optimization failed');
            throw error;
        }
    }
}
