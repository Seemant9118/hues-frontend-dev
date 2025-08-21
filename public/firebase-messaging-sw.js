/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */

// Load Firebase scripts
importScripts(
  'https://www.gstatic.com/firebasejs/10.11.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.11.1/firebase-messaging-compat.js',
);

firebase.initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

const messaging = firebase.messaging();

// Background messages
messaging.onBackgroundMessage((payload) => {
  const { title, body, image } = payload.notification || {};
  const { endpointKey } = payload.data || {}; // ✅ FIXED: safely extract from payload.data
  const fallbackTitle = 'New notification received';

  // ✅ Show one system notification
  self.registration.showNotification(title || fallbackTitle, {
    body,
    icon: image || '🔔',
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
    },
  });
});
