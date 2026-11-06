const CACHE = 'natureza-v2';
const BASE = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const ehPagina = req.mode === 'navigate' || req.url.endsWith('.html') || req.url.endsWith('/');
  if (ehPagina) {
    // página: tenta a internet primeiro (pega atualizações), senão usa a cópia salva
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put(req, c)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
  } else {
    // sons e ícones: usa a cópia salva (funciona offline) e salva os novos
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(resp => {
      if (resp.ok) { const c = resp.clone(); caches.open(CACHE).then(k => k.put(req, c)); }
      return resp;
    })));
  }
});
