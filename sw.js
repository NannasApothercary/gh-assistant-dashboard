// GH Assistant — Service Worker
// Caches the shell so the app loads instantly even on slow connections.
// Live data (tasks, calendar, email) always fetches fresh from the network.

const CACHE_NAME = 'gh-assistant-v1';
const SHELL_FILES = [
  '/',
  '/index.html',
  '/icon-192.png',
  '/icon-512.png'
];

// Install: cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API calls, cache-first for shell files
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Always go to network for Google APIs (live data)
  if (url.includes('script.google.com') || url.includes('googleapis.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Cache-first for shell files
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
