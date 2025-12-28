// sw.js
const CACHE_NAME = 'tiboyce-cache-v1';

// We use relative paths. 
// Since sw.js is in the root, './' refers to the site root.
const URLS_TO_CACHE = [
  './',                // The homepage
  './faq.html',        // Generated from faq.md
  './blog/',           // The blog index
  './saveconverter/',  // Save converter folder
  './converter/',      // ROM converter folder
  './assets/css/style.css' // Approximate path - the SW will learn the real CSS path on first load anyway
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        // fetchPromise attempts to get a fresh version from network
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // If valid network response, update cache
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Network failed
        });

        // Return cached response if we have it, otherwise wait for network
        return cachedResponse || fetchPromise;
      });
    })
  );
});
