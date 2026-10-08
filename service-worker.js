/* Offline support: the app shell is cached so guides, plans and spending work without signal.
   Live data (weather, exchange rates, map tiles, place lookups) always goes to the network. */
const VERSION = 'trip-v17-flat-2026-10-09';
const SHELL = [
  '/', '/index.html', '/manifest.webmanifest',
  '/app.css?v=17', '/v16.css?v=17',
  '/data-base.js?v=17', '/data-core.js?v=17', '/data-more-my.js?v=17', '/data-more-th.js?v=17',
  '/features.js?v=17', '/journey.js?v=17', '/app.js?v=17',
  '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png'
];
const LIVE_HOSTS = ['api.open-meteo.com', 'api.data.gov.my', 'open.er-api.com', 'nominatim.openstreetmap.org', 'basemaps.cartocdn.com'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (LIVE_HOSTS.some(h => url.hostname.endsWith(h))) return; // never cache live data

  // Pages: network first, fall back to the cached shell when offline
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put('/index.html', copy));
        return res;
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Same-origin assets + the Supabase library: serve cached, refresh in the background
  if (url.origin === location.origin || url.hostname === 'cdn.jsdelivr.net') {
    event.respondWith(
      caches.open(VERSION).then(cache => cache.match(req).then(hit => {
        const net = fetch(req).then(res => {
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        }).catch(() => hit);
        return hit || net;
      }))
    );
  }
});
