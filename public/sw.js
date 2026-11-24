// Service worker des Délices d'Orodis (portée « / »).
// 1. Espace du personnel installable (PWA) : page hors ligne quand /gestion ne répond pas.
//    Les pages et l'API ne sont jamais mises en cache : elles contiennent des données du restaurant.
// 2. Notifications push du personnel (selon le rôle) et des clients à table (suivi de commande).
const VERSION = "orodis-v1";
const OFFLINE_URL = "/hors-ligne-personnel.html";
const PRECACHE = [OFFLINE_URL, "/logo-delices-orodis-blanc-web.png", "/pwa/icone-192.png", "/pwa/badge-96.png"];

// Vibrations par type d'alerte (le son personnalisé n'existe pas pour les notifications web).
const VIBRATIONS = { commande: [400, 150, 400, 150, 400, 150, 400], appel: [300, 120, 300, 120, 300], defaut: [200] };

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigation dans l'espace du personnel : réseau d'abord, page hors ligne sinon.
  if (request.mode === "navigate" && url.pathname.startsWith("/gestion")) {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }
  // Fichiers de la page hors ligne : depuis le cache s'il le faut.
  if (PRECACHE.includes(url.pathname)) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
  }
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Les Délices d’Orodis", body: event.data ? event.data.text() : "" };
  }
  const url = data.url || "/gestion";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      // Écran déjà ouvert et au premier plan sur la bonne page : il sonne déjà (polling), on le prévient seulement.
      const visible = windows.find(
        (w) => w.focused && w.visibilityState === "visible" && new URL(w.url).pathname.startsWith(url),
      );
      if (visible) {
        visible.postMessage({ type: "push", data });
        return undefined;
      }
      return self.registration.showNotification(data.title || "Les Délices d’Orodis", {
        body: data.body || "",
        icon: "/pwa/icone-192.png",
        badge: "/pwa/badge-96.png",
        tag: data.tag,
        renotify: Boolean(data.tag),
        // Commande et appel restent affichés jusqu’au geste ; les rappels du serveur refont sonner (même tag).
        requireInteraction: data.sound === "commande" || data.sound === "appel",
        vibrate: VIBRATIONS[data.sound] || VIBRATIONS.defaut,
        lang: "fr",
        data: { url },
      });
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || "/gestion", self.location.origin);
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      // Fenêtre déjà ouverte sur la même partie (personnel ou table) : on la réutilise.
      const area = target.pathname.startsWith("/t/") ? target.pathname.split("/").slice(0, 3).join("/") : "/gestion";
      const existing = windows.find((w) => new URL(w.url).pathname.startsWith(area));
      if (existing) {
        return existing.focus().then((w) => (w && "navigate" in w ? w.navigate(target.href) : undefined));
      }
      return self.clients.openWindow(target.href);
    }),
  );
});
