const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "static";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/index.js",
  "/manifest.webmanifest",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

// install
self.addEventListener("install", function (evt) {
  // pre cache image data
  evt.waitUntil(
    caches.open(DATA_CACHE_NAME).then((cache) => cache.add(FILES_TO_CACHE))
  );
  // has finished installing
  self.skipWaiting();
});

// fetch
self.addEventListener("fetch", function (evt) {
  evt.respondWith(
    cache.match(evt.request).then((response) => {
      return response || fetch(evt.request);
    })
  );
});
