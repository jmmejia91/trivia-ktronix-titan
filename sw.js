// Service worker: guarda la trivia en la tablet para que abra y funcione sin internet.
// Si se cambia algún archivo, subir el número de versión para que la tablet tome la nueva.
const VERSION = 'ktx-trivia-v3';
const FILES = [
  './', './index.html', './config.js', './manifest.json',
  './assets/ktronix.png', './assets/hotsale.png', './assets/icon-512.png',
  './assets/fonts/eurostile_cond_regular.otf', './assets/fonts/eurostile_cond_bold.otf'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c =>
    Promise.all(FILES.map(f => c.add(f).catch(() => null)))   // si falta un archivo (p. ej. fuentes borradas), sigue
  ).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;                              // los envíos a Google no se tocan
  if (url.hostname.endsWith('script.google.com') || url.hostname.endsWith('googleusercontent.com')) return;
  // Fuentes de Google: guardarlas la primera vez para usarlas sin internet
  if (url.hostname.endsWith('fonts.googleapis.com') || url.hostname.endsWith('fonts.gstatic.com')) {
    e.respondWith(caches.open(VERSION).then(c => c.match(req).then(hit => hit ||
      fetch(req).then(r => { c.put(req, r.clone()); return r; }).catch(() => new Response('', { status: 503 })))));
    return;
  }
  // Archivos propios: primero la red (para tomar cambios), si no hay red, la copia guardada
  e.respondWith(fetch(req).then(r => {
    if (r.ok && url.origin === location.origin) caches.open(VERSION).then(c => c.put(req, r.clone()));
    return r;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match('./index.html'))));
});
