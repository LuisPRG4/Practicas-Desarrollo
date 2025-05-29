// service-worker.js

const CACHE_NAME = 'gestion-ventas-v1';
const urlsToCache = [
    './', // Caché el index.html
    './index.html',
    './style.css',
    './script.js',
    './db.js',
    './charts.js',
    'https://cdn.jsdelivr.net/npm/chart.js', // Chart.js CDN
    // Asegúrate de incluir los íconos si los creas
    './icons/icon-192x192.png',
    './icons/icon-512x512.png'
];

// Evento 'install': se ejecuta cuando el Service Worker se instala
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Abriendo caché y precacheando URLs...');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting()) // Forzar la activación del nuevo SW inmediatamente
    );
});

// Evento 'activate': se ejecuta cuando el Service Worker se activa
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Eliminando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Tomar control de las páginas existentes
    );
});

// Evento 'fetch': se ejecuta cada vez que la página solicita un recurso
self.addEventListener('fetch', (event) => {
    // Ignorar peticiones de extensiones o de otros orígenes que no sean tus URLs
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    // Si el recurso está en caché, lo devuelve
                    if (response) {
                        return response;
                    }
                    // Si no está en caché, intenta obtenerlo de la red
                    return fetch(event.request).then((networkResponse) => {
                        // Clonar la respuesta porque la respuesta es un Stream y solo se puede consumir una vez
                        const responseToCache = networkResponse.clone();
                        // Si la respuesta es válida, la guarda en caché
                        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        }
                        return networkResponse;
                    }).catch(() => {
                        // Si la red falla y no está en caché, puedes devolver un "offline page"
                        console.log('Service Worker: Fallo en la red y no hay caché para:', event.request.url);
                        // Opcional: devolver una página offline predefinida
                        // return caches.match('/offline.html');
                    });
                })
        );
    }
});