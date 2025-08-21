/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */

// Load Firebase scripts
importScripts(
  'https://www.gstatic.com/firebasejs/10.11.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.11.1/firebase-messaging-compat.js',
);

firebase.initializeApp({
  apiKey: 'AIzaSyCc73JvHJcvJelLXvNdgQ4OO-_wuXV5_Go',
  authDomain: 'ptpl-2fb85.firebaseapp.com',
  projectId: 'ptpl-2fb85',
  messagingSenderId: '17176120773',
  appId: '1:17176120773:web:a9b26d6496e8870b228fac',
});

const messaging = firebase.messaging();

// ✅ Background messages (only `data` payload is sent)
messaging.onBackgroundMessage((payload) => {
  const { title, body, image, deepLink, endpointKey } = payload.data || {};
  const fallbackTitle = 'New notification received';

  // ✅ Show system notification
  self.registration.showNotification(title || fallbackTitle, {
    body,
    icon: image || '🔔',
    data: {
      url: deepLink || '/', // pass deep link to notification click handler
      endpointKey: endpointKey || null,
    },
  });

  // ✅ Broadcast simplified payload to all open tabs
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

      // focus existing tab if open
      // eslint-disable-next-line no-restricted-syntax
      for (const client of allClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }

      // otherwise open new tab
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })(),
  );
});
