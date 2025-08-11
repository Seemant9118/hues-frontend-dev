/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */

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
messaging.onBackgroundMessage((payload) => {
  const { title, body, image } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: image,
  });
});
