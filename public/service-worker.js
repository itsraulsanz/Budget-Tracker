const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";
const cacheURLs = [
  "/",
  "/index.html",
  "/manifest.json",
  "/styles.css",
  "/db.js",
  "/index.js",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// INSTALL Service Worker
self.addEventListener("install", function (evt) {
  // pre cache static elements (URLs))
  evt.waitUntil(
    caches.open(DATA_CACHE_NAME).then((cache) => cache.addAll(cacheURLs))
  );
  // Activate service worker after installation
  self.skipWaiting();
});

// ACTIVATE Service Worker - cleaning up old caches
self.addEventListener("activate", function (evt) {
  evt.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
            console.log("Remove old cache data", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// RESPONSE / FETCH of Service Worker

self.addEventListener("fetch", function (evt) {
  // cache successful requests to the API
  if (evt.request.url.includes("/api/")) {
    evt.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then((cache) => {
          return fetch(evt.request)
            .then((response) => {
              // If the response = good, clone + cache.
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }
              return response;
            })
            .catch((err) => {
              // If Network request fails, get data from the cache.
              return cache.match(evt.request);
            });
        })
        .catch((err) => console.log(err))
    );

    return;
  }
  // Event reponds with static cache
  evt.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(evt.request).then((response) => {
        return response || fetch(evt.request);
      });
    })
  );
});