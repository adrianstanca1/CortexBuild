// Development service worker cleanup script
// Run this in browser console to fix service worker issues during development

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('Found service worker registrations:', registrations.length);
    
    registrations.forEach(registration => {
      console.log('Unregistering service worker:', registration.scope);
      registration.unregister().then(success => {
        console.log('Service worker unregistered:', success);
      });
    });
  });
  
  // Clear all caches
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      console.log('Found caches:', cacheNames);
      cacheNames.forEach(cacheName => {
        caches.delete(cacheName).then(success => {
          console.log('Cache deleted:', cacheName, success);
        });
      });
    });
  }
}