'use client';

import { useEffect } from 'react';
import { getToken, messaging } from '../lib/firebaseConfig';

export default function FCMProvider({ children }) {
  useEffect(() => {
    async function registerForPush() {
      if (!messaging) return;

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      const token = await getToken(messaging, { vapidKey });
      // eslint-disable-next-line no-console
      console.log('FCM Token:', token);
      // Save token to your backend
    }

    registerForPush();
  }, []);

  return <>{children}</>;
}
