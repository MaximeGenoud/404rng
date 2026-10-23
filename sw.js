// Service worker minimal : rend le site installable comme une appli.
// Les données viennent toujours du réseau (Firebase), rien n'est mis en cache de façon durable.
const SHELL = "hypass-shell-v1";
self.addEventListener("install", e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(["./", "./index.html", "./icon-192.png"])).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== SHELL).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  // Réseau d'abord ; la copie en cache ne sert que hors connexion.
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(SHELL).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match("./index.html")))
  );
});
