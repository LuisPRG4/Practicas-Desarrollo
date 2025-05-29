// service-worker.js

// Nombre de la caché. CÁMBIALO cada vez que actualices los archivos de tu app
// para forzar al navegador a descargar las nuevas versiones.
const CACHE_NAME = 'gestion-ventas-v1'; // <-- Asegúrate que este sea 'gestion-ventas-v1'

// Lista de URLs a precachear (guardar en caché al instalar el Service Worker)
// Asegúrate de que esta lista incluya TODOS los archivos estáticos de tu app.
const urlsToCache = [
    './', // Ruta raíz, para index.html cuando se accede directamente al dominio
    './index.html', // Ruta explícita para index.html
    './styles.css',
    './script.js',
    './db.js',
    './charts.js',
    'https://cdn.jsdelivr.net/npm/chart.js', // URL del CDN de Chart.js
    // Si ya tienes la carpeta 'icons' y los archivos, descomenta y añádelos:
    './icons/icon-192x192.png',
    './icons/icon-512x512.png'
];

// Evento 'install': se dispara cuando el Service Worker se instala por primera vez
self.addEventListener('install', (event) => {
    console.log('Service Worker: Evento de instalación. Intentando precargar recursos...');
    event.waitUntil(
        caches.open(CACHE_NAME) // Abre la caché con el nombre definido
            .then((cache) => {
                console.log('Service Worker: Precargando recursos al caché...');
                return cache.addAll(urlsToCache); // Añade todas las URLs a la caché
            })
            .then(() => {
                // Forzar que el nuevo Service Worker se active inmediatamente
                console.log('Service Worker: Instalación completada, saltando espera.');
                self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: FALLÓ la precarga de recursos:', error);
                // Si hay un error aquí, es probable que se deba a una URL incorrecta o inalcanzable.
            })
    );
});

// Evento 'activate': se dispara cuando el Service Worker se activa (toma control)
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Evento de activación.');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Elimina cachés antiguas que no coincidan con el CACHE_NAME actual
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Eliminando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Toma el control de todas las páginas abiertas bajo el alcance de este SW
            console.log('Service Worker: Activación completada, tomando control de los clientes.');
            self.clients.claim();
        })
    );
});

// Evento 'fetch': se dispara cada vez que el navegador solicita un recurso
self.addEventListener('fetch', (event) => {
    // Solo maneja peticiones que son para nuestro propio origen (para evitar problemas con otros dominios)
    if (event.request.url.startsWith(self.location.origin) || event.request.url.startsWith('https://cdn.jsdelivr.net/npm/chart.js')) { // <--- AÑADIDO: Incluir explícitamente Chart.js del CDN
        event.respondWith(
            caches.match(event.request) // Intenta encontrar el recurso en la caché
                .then((response) => {
                    // Si el recurso está en caché, lo devuelve
                    if (response) {
                        console.log('Service Worker: Sirviendo desde caché:', event.request.url);
                        return response;
                    }
                    // Si no está en caché, intenta obtenerlo de la red
                    console.log('Service Worker: Buscando en la red:', event.request.url);
                    return fetch(event.request).then((networkResponse) => {
                        // Clonar la respuesta porque es un Stream y solo se puede consumir una vez
                        const responseToCache = networkResponse.clone();
                        // Si la respuesta de la red es válida (status 200 y tipo 'basic'), la guarda en caché
                        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                            caches.open(CACHE_NAME).then((cache) => {
                                console.log('Service Worker: Almacenando en caché:', event.request.url);
                                cache.put(event.request, responseToCache);
                            });
                        }
                        return networkResponse;
                    }).catch(() => {
                        // Si falla la red y el recurso no estaba en caché
                        console.log('Service Worker: Fallo en la red y no hay caché para:', event.request.url);
                        // Opcional: devolver una página offline.html si la creas
                        // return caches.match('/offline.html');
                    });
                })
        );
    }
    // Si la petición no es de nuestro origen o no es Chart.js, la ignoramos y la dejamos ir a la red
    // Esto es importante para que otras peticiones (ej. Google Fonts, etc.) no se bloqueen si no están en caché.
    // else {
    //    return fetch(event.request);
    // }
});