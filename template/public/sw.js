let cachedUrls = [
  'index.html',
  '.',
]

self.addEventListener('install', () => {
  return self.skipWaiting();
});

self.addEventListener('activate', () => {
  event.waitUntil(
    caches.open('wiederlist')
      .then((cache) => {
        return cache.addAll(cachedUrls);
      })
  )
  .then(() => {
    return self.clients.claim();
  })
  .catch((error) => {
    console.log(`Error during cache handling: ${error}`);
  })
})