const CACHE_NAME = 'mk-gestao-v4';

function indexRequestUrl() {
  return new URL('index.html', self.registration.scope).href;
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.add(indexRequestUrl()).catch(() => {})
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          try {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(indexRequestUrl(), copy));
          } catch (e) {
            /* ignore cache write errors */
          }
          return response;
        })
        .catch(() => caches.match(indexRequestUrl()))
    );
    return;
  }
});
