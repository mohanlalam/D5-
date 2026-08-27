/**
 * Service Worker for D5 IPL Fantasy Platform
 * Enables offline capability and native mobile caching
 */

const CACHE_NAME = "d5-ipl-v2.1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./css/app.css",
  "./js/app.js",
  "./manifest.json"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => console.warn("Caching fallback:", err));
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || e.request.url.includes("cricapi.com") || e.request.url.includes("firebaseio.com")) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request).catch(() => caches.match("./index.html"));
    })
  );
});
