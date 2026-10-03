// Service worker de la Bitácora HOTLUB: guarda la app en el celular para que abra sin señal.
// Si cambias la app, sube el número de versión para que los celulares la actualicen.
const CACHE = "bitacora-v15";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// Archivos propios: primero la red (para recibir actualizaciones) y, si no hay señal, la copia guardada.
// Firebase y las fuentes van directos a la red; Firebase ya guarda sus datos sin conexión por su cuenta.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: "no-cache" }).then((r) => {
      const copia = r.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copia));
      return r;
    }).catch(() => caches.match(e.request).then((m) => m || caches.match("./index.html")))
  );
});
