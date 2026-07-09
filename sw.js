// sw.js
const CACHE_NAME = 'azizshop-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  // Si vous avez d'autres assets (CSS, images) ajoutez-les ici
];

// Installation
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache ouvert, ajout des ressources');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation - nettoyage des anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
});

// Interception des requêtes
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si la ressource est dans le cache, on la renvoie
        if (response) {
          return response;
        }
        // Sinon, on fait une requête réseau et on met en cache (stratégie stale-while-revalidate)
        return fetch(event.request).then(
          networkResponse => {
            // On ne met en cache que les réponses valides (statut 200)
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            return networkResponse;
          }
        );
      })
      .catch(() => {
        // En cas d'échec réseau, on peut renvoyer une page offline (optionnel)
        return caches.match('./index.html');
      })
  );
});