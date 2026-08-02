const CACHE = "dozify-v2";
const ASSETS = ["/", "/dashboard", "/medications", "/labs", "/manifest.webmanifest"];
self.addEventListener("install", (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS))));
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const detail = event.notification.data || {};
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
    const client = clientList[0];
    if (client) { client.postMessage({ type: event.action === "taken" ? "DOSE_TAKEN" : "OPEN_DOZIFY", detail }); return client.focus(); }
    const params = new URLSearchParams({ confirm: detail.medicationId || "", profile: detail.profileId || "", time: detail.scheduledTime || "" });
    return self.clients.openWindow(`/medications?${params.toString()}`);
  }));
});
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    const clone = response.clone();
    caches.open(CACHE).then((cache) => cache.put(event.request, clone));
    return response;
  }).catch(() => caches.match("/dashboard"))));
});
