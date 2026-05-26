'use strict';

const CACHE_VERSION = 'v1';
const CACHE_NAME = `sovereign-${CACHE_VERSION}`;
const FONT_CACHE = 'sovereign-fonts-v1';

const STATIC_ASSETS = [
  '/index.html',
  '/manifest.json',
  '/css/styles.css',
  '/js/storage.js',
  '/js/utils.js',
  '/js/claude.js',
  '/js/reminders.js',
  '/js/curriculum-data.js',
  '/js/onboarding.js',
  '/js/app.js',
  '/js/sections/today.js',
  '/js/sections/academy.js',
  '/js/sections/work.js',
  '/js/sections/wellness.js',
  '/js/sections/tasks.js',
  '/js/sections/vault.js',
  '/js/sections/codelab.js',
  '/js/sections/journal.js',
  '/js/sections/assistant.js',
  '/js/sections/settings.js',
  '/icons/icon.svg',
  '/icons/icon-maskable.svg'
];

// Install: cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' }))))
      .catch(err => console.warn('[SW] Install cache error:', err))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys
        .filter(k => k !== CACHE_NAME && k !== FONT_CACHE)
        .map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Fetch: strategy by request type
self.addEventListener('fetch', event => {
  const { request } = event;

  // Skip non-GET
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip Anthropic API calls (always network)
  if (url.hostname === 'api.anthropic.com') return;

  // Fonts: cache-first with long TTL
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE).then(cache =>
        cache.match(request).then(cached => {
          if (cached) return cached;
          return fetch(request).then(response => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          }).catch(() => cached);
        })
      )
    );
    return;
  }

  // CDN resources (Monaco, etc): cache-first
  if (url.hostname === 'cdnjs.cloudflare.com' || url.hostname === 'cdn.jsdelivr.net') {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(request).then(cached => {
          if (cached) return cached;
          return fetch(request).then(response => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          }).catch(() => new Response('// offline', { headers: { 'Content-Type': 'text/javascript' } }));
        })
      )
    );
    return;
  }

  // Unsplash images: cache with stale-while-revalidate
  if (url.hostname === 'images.unsplash.com') {
    event.respondWith(
      caches.open(CACHE_NAME + '-images').then(cache =>
        cache.match(request).then(cached => {
          const fetchPromise = fetch(request).then(response => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          });
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // App shell & static: cache-first, network fallback
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback
        if (request.destination === 'document') {
          return caches.match('/index.html');
        }
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});

// Push notifications
self.addEventListener('push', event => {
  let data = { title: 'Sovereign', body: 'Time for your scheduled activity', type: 'reminder' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {}

  const options = {
    body: data.body,
    icon: '/icons/icon.svg',
    badge: '/icons/icon.svg',
    vibrate: [200, 100, 200, 100, 100],
    silent: false,
    requireInteraction: data.type === 'work' || data.type === 'study',
    data: data,
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'snooze', title: 'Snooze 10m' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Sovereign', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'snooze') {
    // Re-schedule after 10 minutes
    const data = event.notification.data;
    const snoozeTime = 10 * 60 * 1000;
    setTimeout(() => {
      self.registration.showNotification(data.title, {
        body: `(Snoozed) ${data.body}`,
        icon: '/icons/icon.svg'
      });
    }, snoozeTime);
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('/index.html') && 'focus' in client) {
          client.postMessage({ type: 'reminder-click', data: event.notification.data });
          return client.focus();
        }
      }
      return clients.openWindow('/index.html');
    })
  );
});

// Background sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Future: sync data to cloud backup
}
