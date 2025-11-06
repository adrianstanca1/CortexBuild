// CortexBuild Service Worker - Advanced PWA Support
const CACHE_NAME = 'cortexbuild-v2.0.0';
const STATIC_CACHE = 'cortexbuild-static-v2.0.0';
const DYNAMIC_CACHE = 'cortexbuild-dynamic-v2.0.0';
const API_CACHE = 'cortexbuild-api-v2.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/projects',
  '/api/tasks',
  '/api/users',
  '/api/analytics',
  '/api/notifications'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('CortexBuild Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('CortexBuild Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('CortexBuild Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('CortexBuild Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.method === 'GET') {
    if (url.pathname.startsWith('/api/')) {
      // API requests - Network First with Cache Fallback
      event.respondWith(handleApiRequest(request));
    } else if (request.destination === 'image') {
      // Images - Cache First
      event.respondWith(handleImageRequest(request));
    } else if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
      // Static assets - Cache First
      event.respondWith(handleStaticAssetRequest(request));
    } else {
      // HTML pages - Network First with Cache Fallback
      event.respondWith(handlePageRequest(request));
    }
  }
});

// Handle API requests with Network First strategy
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('CortexBuild Service Worker: Network failed, trying cache for:', request.url);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API calls
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This feature requires an internet connection',
        offline: true
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle image requests with Cache First strategy
async function handleImageRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return placeholder image for offline
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#9ca3af">Image Offline</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

// Handle static asset requests with Cache First strategy
async function handleStaticAssetRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    throw error;
  }
}

// Handle page requests with Network First strategy
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('CortexBuild Service Worker: Network failed, trying cache for:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    const offlineResponse = await caches.match('/');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Fallback offline page
    return new Response(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>CortexBuild - Offline</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                 margin: 0; padding: 2rem; text-align: center; background: #f9fafb; }
          .container { max-width: 400px; margin: 0 auto; padding: 2rem; background: white; 
                      border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .icon { font-size: 4rem; margin-bottom: 1rem; }
          h1 { color: #1f2937; margin-bottom: 1rem; }
          p { color: #6b7280; margin-bottom: 2rem; }
          button { background: #3b82f6; color: white; border: none; padding: 0.75rem 1.5rem; 
                  border-radius: 6px; cursor: pointer; font-size: 1rem; }
          button:hover { background: #2563eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">🏗️</div>
          <h1>CortexBuild</h1>
          <p>You're currently offline. Some features may not be available.</p>
          <button onclick="window.location.reload()">Try Again</button>
        </div>
      </body>
      </html>`,
      {
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('CortexBuild Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-tasks') {
    event.waitUntil(syncOfflineActions());
  }
});

// Sync offline actions when back online
async function syncOfflineActions() {
  try {
    // Get offline actions from IndexedDB (would be implemented)
    console.log('CortexBuild Service Worker: Syncing offline actions...');
    
    // Sync offline task updates, form submissions, etc.
    // This would integrate with the app's offline storage
    
    // Notify the app that sync is complete
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        data: { success: true }
      });
    });
  } catch (error) {
    console.error('CortexBuild Service Worker: Sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', event => {
  console.log('CortexBuild Service Worker: Push notification received');
  
  const options = {
    body: 'You have new updates in CortexBuild',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Updates',
        icon: '/icons/action-view.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/action-close.png'
      }
    ]
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data = { ...options.data, ...data };
  }
  
  event.waitUntil(
    self.registration.showNotification('CortexBuild', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('CortexBuild Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling from the main app
self.addEventListener('message', event => {
  console.log('CortexBuild Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then(cache => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

console.log('CortexBuild Service Worker: Loaded successfully');
