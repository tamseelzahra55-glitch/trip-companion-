/* Offline support: the app shell is cached so guides, plans and spending work without signal.
   Live data (weather, exchange rates, Community) always goes to the network. */
const VERSION = 'trip-v16.1-flat-2026-10-09';
const SHELL = [
  '/', '/index.html', '/manifest.webmanifest',
  '/app.css', '/v16.css',
  '/config.js', '/data-base.js', '/data-core.js', '/data-more-my.js', '/data-more-th.js',
  '/features.js', '/app.js',
  '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png'
];
const LIVE_HOSTS = ['api.open-meteo.com', 'api.data.gov.my', 'open.er-api.com', 'supabase.co'];

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
