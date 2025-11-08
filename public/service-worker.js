/**
 * Service Worker for CortexBuild
 * Implements caching strategies for offline support and performance optimization
 */

const CACHE_VERSION = 'v1';
const CACHE_NAMES = {
  STATIC: `cortexbuild-static-${CACHE_VERSION}`,
  DYNAMIC: `cortexbuild-dynamic-${CACHE_VERSION}`,
  API: `cortexbuild-api-${CACHE_VERSION}`,
  IMAGES: `cortexbuild-images-${CACHE_VERSION}`,
};

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAMES.STATIC).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Service Worker] Failed to cache some assets:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!Object.values(CACHE_NAMES).includes(cacheName)) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // API requests - Network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, CACHE_NAMES.API));
    return;
  }

  // Image requests - Cache first, fallback to network
  if (isImageRequest(request)) {
    event.respondWith(cacheFirstStrategy(request, CACHE_NAMES.IMAGES));
    return;
  }

  // Static assets (JS, CSS) - Cache first, fallback to network
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirstStrategy(request, CACHE_NAMES.STATIC));
    return;
  }

  // HTML and other requests - Network first, fallback to cache
  event.respondWith(networkFirstStrategy(request, CACHE_NAMES.DYNAMIC));
});

/**
 * Cache-first strategy: Try cache first, fallback to network
 * Best for: Static assets, images
 */
function cacheFirstStrategy(request, cacheName) {
  return caches.match(request).then((response) => {
    if (response) {
      console.log('[Service Worker] Cache hit:', request.url);
      return response;
    }

    return fetch(request)
      .then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(cacheName).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        console.log('[Service Worker] Fetch failed, returning offline response:', request.url);
        return getOfflineFallback(request);
      });
  });
}

/**
 * Network-first strategy: Try network first, fallback to cache
 * Best for: API calls, dynamic content
 */
function networkFirstStrategy(request, cacheName) {
  return fetch(request)
    .then((response) => {
      // Don't cache non-successful responses
      if (!response || response.status !== 200) {
        return response;
      }

      // Clone the response
      const responseToCache = response.clone();

      caches.open(cacheName).then((cache) => {
        cache.put(request, responseToCache);
      });

      return response;
    })
    .catch(() => {
      console.log('[Service Worker] Network request failed, trying cache:', request.url);
      return caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        return getOfflineFallback(request);
      });
    });
}

/**
 * Check if request is for an image
 */
function isImageRequest(request) {
  return /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(request.url) ||
         request.headers.get('accept')?.includes('image');
}

/**
 * Check if request is for a static asset
 */
function isStaticAsset(request) {
  return /\.(js|css|woff2|woff|ttf|eot)$/i.test(request.url);
}

/**
 * Get offline fallback response
 */
function getOfflineFallback(request) {
  // For HTML requests, return offline page
  if (request.headers.get('accept')?.includes('text/html')) {
    return caches.match('/index.html').then((response) => {
      if (response) {
        return response;
      }
      return new Response(
        '<html><body><h1>Offline</h1><p>You are currently offline. Please check your connection.</p></body></html>',
        {
          headers: { 'Content-Type': 'text/html' },
          status: 503,
          statusText: 'Service Unavailable',
        }
      );
    });
  }

  // For API requests, return error response
  if (request.url.includes('/api/')) {
    return new Response(
      JSON.stringify({ error: 'Offline - API unavailable' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 503,
        statusText: 'Service Unavailable',
      }
    );
  }

  // For other requests, return generic offline response
  return new Response('Offline', {
    status: 503,
    statusText: 'Service Unavailable',
  });
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    });
  }
});

console.log('[Service Worker] Loaded successfully');

