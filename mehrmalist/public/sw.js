const VERSION = '0.1.1';
const CACHE_VERSION = 'v' + VERSION;

let cachedUrls = [
  '/',
  'index.html',
  'app.js',
  'templates.js'
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
  console.log(`fetch: ${event.request.url}`);
  event.respondWith(
    caches.match(event.request)
    .then(response => {
      if (response) {
        return response;
      } else {
        return fetch(event.request)
      }
    })
  );
});
