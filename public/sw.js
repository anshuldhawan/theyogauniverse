/* WEB-5: offline booking/check-in access and standards-based web push. */
const VERSION = "tyu-pwa-v1";
const SHELL_CACHE = `${VERSION}-shell`;
const PRIVATE_CACHE = `${VERSION}-private`;
const SHELL = ["/", "/directory", "/manifest.webmanifest", "/brand/mark.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function isOfflineEligible(url) {
  return url.pathname.startsWith("/booking/") || url.pathname === "/dashboard/bookings";
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (isOfflineEligible(url)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(PRIVATE_CACHE).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(async () => (await caches.match(event.request)) || caches.match("/")),
    );
    return;
  }
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(async () => (await caches.match(event.request)) || caches.match("/")));
  }
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "CACHE_PRIVATE_URL" && typeof event.data.url === "string") {
    const url = new URL(event.data.url, self.location.origin);
    if (url.origin === self.location.origin && isOfflineEligible(url)) {
      event.waitUntil(caches.open(PRIVATE_CACHE).then((cache) => cache.add(url.pathname + url.search)));
    }
  }
  if (event.data?.type === "CLEAR_PRIVATE_CACHE") {
    event.waitUntil(caches.delete(PRIVATE_CACHE));
  }
});

self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "The Yoga Universe", {
      body: data.body ?? "Your booking has an update.",
      icon: "/brand/mark.svg",
      badge: "/brand/mark.svg",
      data: { url: data.url ?? "/" },
      tag: data.tag,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data?.url ?? "/"));
});
