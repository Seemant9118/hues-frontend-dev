/* eslint-disable no-console */
/* eslint-disable consistent-return */

'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { getToken, messaging, onMessage } from '../lib/firebaseConfig';

export default function FCMProvider({ children }) {
  useEffect(() => {
    if (!messaging) {
      console.warn('Firebase messaging is not available in this environment.');
      return;
    }

    let unsubscribeMessage = () => {};

    async function registerForPush() {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          // eslint-disable-next-line no-alert
          alert(
            'You have blocked notifications. Please enable them in your browser settings to receive updates.',
          );
          return;
        }

        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        const token = await getToken(messaging, { vapidKey });

        if (token) {
          console.log('📩 FCM Token:', token);
          // TODO: Save token to backend for sending notifications
        } else {
          console.warn('No FCM token received.');
        }
      } catch (err) {
        console.error('Error getting FCM token', err);
      }
    }

    registerForPush();

    unsubscribeMessage = onMessage(messaging, (payload) => {
      console.log('📩 Foreground message received:', payload);

      const { title, body, image } = payload.notification || {};
      toast(`${title || 'Notification'}: ${body || ''}`, {
        icon: image || '🔔',
      });
    });

    return () => {
      if (unsubscribeMessage) unsubscribeMessage();
    };
  }, []);

  return <>{children}</>;
}
