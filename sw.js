/* ════════════════════════════════════
   ConnectLoop — Service Worker
   Storage on Site · v4

   Strategy:
     - HTML / navigation → NETWORK FIRST, cache fallback.
       Keeps the demo fresh on every visit while still
       working with no signal on site.
     - Icons / manifest / fonts → CACHE FIRST.

   IMPORTANT: bump CACHE_VERSION on every release, or
   returning devices may serve the previous build.
════════════════════════════════════ */

const CACHE_VERSION = 'connectloop-v4';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './favicon.png',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png'
];

// ── INSTALL: pre-cache the shell ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

// ── ACTIVATE: bin any older cache versions ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── FETCH ──
self.addEventListener('fetch', event => {
  const req = event.request;

  // Only handle GET
  if (req.method !== 'GET') return;

  // Never intercept cross-origin POSTs, analytics, etc.
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // Navigation / HTML → network first
  const isDoc = req.mode === 'navigate' ||
                (req.headers.get('accept') || '').includes('text/html');

  if (isDoc) {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put('./index.html', copy));
          return res;
        })
        .catch(() =>
          caches.match('./index.html').then(r => r || caches.match('./'))
        )
    );
    return;
  }

  // Everything else (icons, manifest, Google Fonts) → cache first
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        // Only cache successful same-origin or font responses
        if (res && (res.status === 200 || res.type === 'opaque')) {
          const copy = res.clone();
          if (sameOrigin || url.hostname.indexOf('fonts.') === 0 ||
              url.hostname.indexOf('fonts.g') !== -1) {
            caches.open(CACHE_VERSION).then(c => c.put(req, copy));
          }
        }
        return res;
      }).catch(() => cached);
    })
  );
});
