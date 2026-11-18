const CACHE_NAME = 'finflow-cache-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/css/rezet.css',
    '/src/main.js',
    '/src/ui.js',
    '/src/db.js',
    '/icon/balance-bk.png'
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        for (const url of ASSETS) {
            try {
                await cache.add(url);
            } catch (e) {
                console.warn('Failed to cache', url, e);
            }
        }
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => {
            if (key !== CACHE_NAME) return caches.delete(key);
        }));
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', event => {
    const req = event.request;
    if (req.method !== 'GET') return;

    event.respondWith(
        caches.match(req).then(cached => {
            if (cached) return cached;
            return fetch(req).then(res => {
                if (!res || res.status !== 200 || res.type !== 'basic') return res;
                const resClone = res.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
                return res;
            }).catch(() => {
                if (req.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            });
        })
    );
});