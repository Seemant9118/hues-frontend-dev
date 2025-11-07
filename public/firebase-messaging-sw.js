/* eslint-disable no-restricted-syntax */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */

importScripts(
  'https://www.gstatic.com/firebasejs/10.11.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.11.1/firebase-messaging-compat.js',
);

let messaging = null;

// ✅ Utility: Convert snake_case, camelCase, kebab-case → Title Case
function convertSnakeToTitleCase(str = '') {
  if (!str) return '';
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2') // handle camelCase
    .replace(/[_-]+/g, ' ') // handle snake_case & kebab-case
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase()) // capitalize first letters
    .trim();
}

// ✅ Load Firebase config dynamically
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
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
self.addEventListener('push', async (event) => {
  if (!messaging) return;

  const payload = event.data?.json?.() || {};
  const { title, body, image, deepLink, endpointKey } = payload.data || {};
  const fallbackTitle = 'New notification received';
  const formattedTitle = convertSnakeToTitleCase(title) || fallbackTitle;

  // 🧠 Check if any client tab is currently visible/focused
  const allClients = await clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  });
  const hasActiveClient = allClients.some(
    (client) => client.visibilityState === 'visible',
  );

  if (hasActiveClient) {
    // ✅ App is open → only send to BroadcastChannel (no OS notification)
    const bc = new BroadcastChannel('fcm_channel');
    bc.postMessage({
      notification: {
        title: formattedTitle,
        body,
        image,
      },
      data: {
        endpointKey: endpointKey || null,
        deepLink: deepLink || null,
      },
    });
    return; // 🔹 stop here, no system notification
  }

  // ✅ App not open → show browser/system notification
  event.waitUntil(
    self.registration.showNotification(formattedTitle, {
      body,
      icon: image || '🔔',
      data: {
        url: deepLink || '/',
        endpointKey: endpointKey || null,
      },
    }),
  );
});

// ✅ Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const rawUrl = event.notification.data?.url || '/';
  const baseUrl = self.location.origin;

  // ✅ Ensure full absolute URL (handles Next.js locales)
  const targetUrl = rawUrl.startsWith('http')
    ? rawUrl
    : `${baseUrl}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;

  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      // ✅ Try to focus an existing tab with the same origin
      for (const client of allClients) {
        if (client.url.startsWith(baseUrl)) {
          // eslint-disable-next-line no-await-in-loop
          await client.focus();
          // Use postMessage to navigate client-side (for Next.js SPA routing)
          client.postMessage({ action: 'navigate', url: targetUrl });
          return;
        }
      }

      // ✅ Otherwise open a new tab
      if (clients.openWindow) {
        // eslint-disable-next-line consistent-return
        return clients.openWindow(targetUrl);
      }
    })(),
  );
});
