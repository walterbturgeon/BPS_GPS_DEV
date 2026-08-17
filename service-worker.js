const CACHE = 'draglog-v98';
const ASSETS = ['./', './index.html', './manifest.json', './logo.svg', './icon-192.webp', './icon-512.webp'];

self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Reseau d'abord, cache en secours (hors-ligne seulement) : les mises a jour
// publiees sur GitHub Pages sont visibles au prochain chargement, sans purge
// manuelle du cache. L'ancienne strategie cache-d'abord servait l'index.html
// perime indefiniment sur Android (Chrome), pendant que Bluefy/iOS, qui ne
// persiste pas le service worker pareil, rechargeait la page fraiche.
self.addEventListener('fetch', (ev) => {
  ev.respondWith(
    fetch(ev.request)
      .then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE).then((c) => c.put(ev.request, copy)).catch(() => {});
        return resp;
      })
      .catch(() => caches.match(ev.request))
  );
});
