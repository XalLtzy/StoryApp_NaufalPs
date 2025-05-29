const BASE_PATH = '/StoryApp_NaufalPs';
const CACHE_NAME = 'Story-App-cache-v1';

const urlsToCache = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/app.bundle.js`,
  `${BASE_PATH}/app.css`, 
  `${BASE_PATH}/icons/icon-192x192.png`,
  `${BASE_PATH}/icons/icon-512x512.png`,
];

self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).catch(() => {

          return new Response('', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
      })
  );
});

self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  const title = 'Ada laporan baru untuk Anda!';
  const options = {
    body: 'Terdapat Story baru yang perlu Anda baca.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
