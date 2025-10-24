/**
 * Cache Configuration
 * Defines caching strategies and policies for different resource types
 */

export interface CachePolicy {
  name: string;
  maxAge: number; // in seconds
  strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
  description: string;
}

export const CACHE_POLICIES: Record<string, CachePolicy> = {
  // Static assets - cache for 1 year (immutable)
  STATIC_ASSETS: {
    name: 'static-assets',
    maxAge: 31536000, // 1 year
    strategy: 'cache-first',
    description: 'Hashed static assets (JS, CSS) - cached for 1 year',
  },

  // Images - cache for 30 days
  IMAGES: {
    name: 'images',
    maxAge: 2592000, // 30 days
    strategy: 'cache-first',
    description: 'Images - cached for 30 days',
  },

  // Fonts - cache for 1 year
  FONTS: {
    name: 'fonts',
    maxAge: 31536000, // 1 year
    strategy: 'cache-first',
    description: 'Web fonts - cached for 1 year',
  },

  // HTML - cache for 1 hour
  HTML: {
    name: 'html',
    maxAge: 3600, // 1 hour
    strategy: 'network-first',
    description: 'HTML pages - network first, cache for 1 hour',
  },

  // API responses - cache for 5 minutes
  API: {
    name: 'api',
    maxAge: 300, // 5 minutes
    strategy: 'network-first',
    description: 'API responses - network first, cache for 5 minutes',
  },

  // User data - cache for 1 minute
  USER_DATA: {
    name: 'user-data',
    maxAge: 60, // 1 minute
    strategy: 'network-first',
    description: 'User data - network first, cache for 1 minute',
  },

  // Analytics - no cache
  ANALYTICS: {
    name: 'analytics',
    maxAge: 0,
    strategy: 'network-first',
    description: 'Analytics - always fresh, no cache',
  },
};

/**
 * Get cache policy for a URL
 */
export function getCachePolicyForUrl(url: string): CachePolicy {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;

  // Static assets with hash
  if (/\.(js|css)$/.test(pathname) && /[a-f0-9]{8}/.test(pathname)) {
    return CACHE_POLICIES.STATIC_ASSETS;
  }

  // Images
  if (/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(pathname)) {
    return CACHE_POLICIES.IMAGES;
  }

  // Fonts
  if (/\.(woff|woff2|ttf|eot)$/i.test(pathname)) {
    return CACHE_POLICIES.FONTS;
  }

  // HTML
  if (/\.html$/.test(pathname) || pathname === '/') {
    return CACHE_POLICIES.HTML;
  }

  // API routes
  if (pathname.startsWith('/api/')) {
    // User data endpoints
    if (pathname.includes('/user') || pathname.includes('/profile')) {
      return CACHE_POLICIES.USER_DATA;
    }
    // Analytics endpoints
    if (pathname.includes('/analytics') || pathname.includes('/metrics')) {
      return CACHE_POLICIES.ANALYTICS;
    }
    return CACHE_POLICIES.API;
  }

  // Default to HTML policy
  return CACHE_POLICIES.HTML;
}

/**
 * Get cache headers for a URL
 */
export function getCacheHeadersForUrl(url: string): Record<string, string> {
  const policy = getCachePolicyForUrl(url);

  if (policy.maxAge === 0) {
    return {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    };
  }

  if (policy.strategy === 'cache-first') {
    return {
      'Cache-Control': `public, max-age=${policy.maxAge}, immutable`,
    };
  }

  return {
    'Cache-Control': `public, max-age=${policy.maxAge}, must-revalidate`,
  };
}

/**
 * Cache statistics
 */
export interface CacheStats {
  totalSize: number;
  cacheCount: number;
  caches: {
    name: string;
    size: number;
    items: number;
  }[];
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<CacheStats> {
  try {
    const cacheNames = await caches.keys();
    const stats: CacheStats = {
      totalSize: 0,
      cacheCount: cacheNames.length,
      caches: [],
    };

    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      const cacheSize = keys.length;

      stats.caches.push({
        name,
        size: cacheSize,
        items: keys.length,
      });

      stats.totalSize += cacheSize;
    }

    return stats;
  } catch (error) {
    console.error('Failed to get cache stats:', error);
    return {
      totalSize: 0,
      cacheCount: 0,
      caches: [],
    };
  }
}

/**
 * Clear cache by name
 */
export async function clearCacheByName(cacheName: string): Promise<boolean> {
  try {
    return await caches.delete(cacheName);
  } catch (error) {
    console.error(`Failed to clear cache ${cacheName}:`, error);
    return false;
  }
}

/**
 * Clear all caches
 */
export async function clearAllCaches(): Promise<void> {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
    console.log('All caches cleared');
  } catch (error) {
    console.error('Failed to clear all caches:', error);
  }
}

/**
 * Preload critical resources
 */
export async function preloadCriticalResources(): Promise<void> {
  try {
    const cache = await caches.open(CACHE_POLICIES.STATIC_ASSETS.name);
    const criticalResources = [
      '/',
      '/index.html',
    ];

    await cache.addAll(criticalResources);
    console.log('Critical resources preloaded');
  } catch (error) {
    console.error('Failed to preload critical resources:', error);
  }
}

