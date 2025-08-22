/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */

importScripts(
  'https://www.gstatic.com/firebasejs/10.11.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.11.1/firebase-messaging-compat.js',
);

let messaging = null;

// Load env config dynamically at install
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        // ✅ Fetch envs from API route
        const res = await fetch('/api/env');
        const config = await res.json();

        firebase.initializeApp(config);
        messaging = firebase.messaging();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('❌ Failed to load Firebase config:', err);
      }
    })(),
  );
});

// ✅ Background messages
self.addEventListener('push', (event) => {
  if (!messaging) return; // not yet initialized

  const payload = event.data.json();
  const { title, body, image, deepLink, endpointKey } = payload.data || {};
  const fallbackTitle = 'New notification received';

  self.registration.showNotification(title || fallbackTitle, {
    body,
    icon: image || '🔔',
    data: {
      url: deepLink || '/',
      endpointKey: endpointKey || null,
    },
  });

  const bc = new BroadcastChannel('fcm_channel');
  bc.postMessage({
    notification: {
      title: title || fallbackTitle,
      body,
      image,
    },
    data: {
      endpointKey: endpointKey || null,
      deepLink: deepLink || null,
    },
  });
});

// ✅ Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    // eslint-disable-next-line consistent-return
    (async () => {
      const allClients = await clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      // eslint-disable-next-line no-restricted-syntax
      for (const client of allClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })(),
  );
});
