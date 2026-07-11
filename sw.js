const CACHE = "foloneo-devis-v13";
const ASSETS = [
  "./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
  "https://cdn.tailwindcss.com"
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const isShell = e.request.mode === "navigate" || new URL(e.request.url).pathname.endsWith("/index.html");
  if (isShell) {
    // RÉSEAU D'ABORD : l'app se met à jour automatiquement à chaque lancement connecté
    e.respondWith(
      fetch(e.request).then((r) => {
        const copy = r.clone();
        caches.open(CACHE).then((c) => c.put("./index.html", copy));
        return r;
      }).catch(() => caches.match("./index.html"))
    );
  } else {
    // Cache d'abord pour les librairies (rapidité + hors-ligne)
    e.respondWith(caches.match(e.request).then((c) => c || fetch(e.request)));
  }
});
