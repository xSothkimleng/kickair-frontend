/*
 * KickAir service worker — browser (web push) notifications.
 *
 * The Laravel API sends a JSON payload built from WebPushMirror
 * (title, body, icon, data.url). This worker shows the native
 * Chrome/Edge/Firefox notification and handles click-through.
 */

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "KickAir";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/assets/images/kickair-logo.png",
    data: payload.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = (event.notification.data && event.notification.data.url) || "/notifications";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Prefer focusing an already-open KickAir tab and navigating it.
        for (const client of windowClients) {
          if ("focus" in client) {
            client.focus();
            if ("navigate" in client) client.navigate(url);
            return;
          }
        }
        return self.clients.openWindow(url);
      })
  );
});
