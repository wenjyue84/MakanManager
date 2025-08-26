const CACHE_NAME = 'makan-cache-v1';
const APP_SHELL = [
  '/',
  '/index.html'
];
const TRANSLATION_ASSETS = [
  '/locales/en.json',
  '/locales/id.json',
  '/locales/vi.json',
  '/locales/my.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([...APP_SHELL, ...TRANSLATION_ASSETS]))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null)))
    )
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const url = new URL(event.request.url);
          if (
            APP_SHELL.includes(url.pathname) ||
            url.pathname.startsWith('/locales/')
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match('/index.html'));
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'schedule-reminder') {
    const { title, options, timestamp } = event.data;
    const delay = Math.max(0, timestamp - Date.now());
    setTimeout(() => {
      self.registration.showNotification(title, options);
    }, delay);
  }
});
