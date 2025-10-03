// Service Worker - PWA placeholder
// This is a minimal service worker for PWA support
// Caching and offline functionality can be added here when needed

const CACHE_NAME = 'merchant-pos-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Simple pass-through for now
  // Add caching logic here when implementing offline support
  event.respondWith(fetch(event.request));
});
