const VERSION = '0.1.27';
const CACHE_VERSION = 'v' + VERSION;
const OFFLINE_URL = 'icons/offline.png';


let cachedUrls = [
  '/',
  'index.html',
  'scr.js',
  OFFLINE_URL
]

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_VERSION)
    .then(cache => {
      return cache.addAll(cachedUrls);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
    .then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (CACHE_VERSION !== cacheName) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  console.log(`fetch: ${event.request}`);
  event.respondWith(
    caches.match(event.request)
    .then(response => {
      if (response) {
        return response;
      }

      return fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL);
        });
    })
  );
});
