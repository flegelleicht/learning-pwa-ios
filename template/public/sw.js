let cachedUrls = [
  'index.html',
  '.',
]

self.addEventListener('install', () => {
  return self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.open('wiederlist')
      .then((cache) => {
        return cache.addAll(cachedUrls);
      })
      .then(() => {
        return self.clients.claim();
      })
      .catch((error) => {
        console.log(`Error during cache handling: ${error}`);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if(response) { return response; }

        return fetch(event.request)
                .then((response) => {
                  return caches.open('wiederlist')
                          .then((cache) => {
                            cache.put(event.request, response.clone());
                            return response;
                          });
                });
      })
      .catch((error) => {
        console.log(`Error fetching resource from cache: ${error.message}`);
      })
  );
});
