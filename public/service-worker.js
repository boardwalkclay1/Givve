// service-worker.js

const CACHE_NAME = "givve-v1";

const ASSETS = [
  "/",
  "/index.html",
  "/app.html",
  "/suggest.html",
  "/vote.html",
  "/account.html",
  "/winners.html",
  "/css/styles.css",
  "/js/main.js",
  "/manifest.webmanifest"
];

// ----------------------
// INSTALL
// ----------------------
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ----------------------
// ACTIVATE
// ----------------------
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ----------------------
// FETCH
// ----------------------
self.addEventListener("fetch", event => {
  const url = event.request.url;

  // Never cache API calls
  if (url.includes("/api/")) {
    return;
  }

  // Network-first for HTML pages (SPA routing)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then(cached => {
      return (
        cached ||
        fetch(event.request).then(response => {
          return response;
        })
      );
    })
  );
});
