/* global workbox */
/* eslint-disable no-undef */

// Import Workbox from CDN
self.importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

if (self.workbox) {
  // Skip waiting and take control ASAP
  workbox.core.skipWaiting();
  workbox.core.clientsClaim();

  // Precache offline page and basic assets
  workbox.precaching.precacheAndRoute([
    { url: '/offline.html', revision: '1' },
    { url: '/vite.svg', revision: '1' },
    { url: '/manifest.json', revision: '1' },
  ]);

  // Cache app shell JS/CSS with StaleWhileRevalidate
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'script' || request.destination === 'style',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'app-shell',
    })
  );

  // Fonts with CacheFirst long TTL
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'font',
    new workbox.strategies.CacheFirst({
      cacheName: 'fonts',
      plugins: [
        new workbox.expiration.ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 }),
      ],
    })
  );

  // Images with StaleWhileRevalidate
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.StaleWhileRevalidate({ cacheName: 'images' })
  );

  // Offline fallback for navigation
  workbox.routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    async ({ event }) => {
      try {
        const preload = event.preloadResponse;
        if (preload) return preload;
        return await fetch(event.request);
      } catch (e) {
        return caches.match('/offline.html');
      }
    }
  );

  // Cache the latest data snapshot
  workbox.routing.registerRoute(
    /\/latest_data\.json$/,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'latest-data',
      plugins: [
        new workbox.expiration.ExpirationPlugin({ maxEntries: 2, maxAgeSeconds: 60 * 60 })
      ]
    })
  );
} else {
  console.warn('Workbox failed to load');
}
