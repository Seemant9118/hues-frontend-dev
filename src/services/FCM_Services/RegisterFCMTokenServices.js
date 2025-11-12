/* eslint-disable no-console */

import { fcmAPIs } from '@/api/fcmApis/fcmApis';
import { messaging } from '@/lib/firebaseConfig';
import { LocalStorageService } from '@/lib/utils';
import axios from 'axios';
import { getToken } from 'firebase/messaging';

const FCM_TOKEN_KEY = 'fcm_web_token';

const registerFcmToken = (data) => {
  return axios.post(
    `${process.env.NEXT_PUBLIC_BASE_URL}${fcmAPIs.registerFcmToken.endpoint}`,
    data,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LocalStorageService.get('token')}`,
      },
    },
  );
};

// Register valid token to backend
async function registerValidFcmToken(token) {
  try {
    if (typeof token === 'string' && token.length > 50) {
      const userToken = LocalStorageService.get('token');
      if (userToken) {
        await registerFcmToken({ token, deviceType: 'web' });
        console.log('FCM token registered successfully to backend.');
      } else {
        console.warn('No user token available; skipping backend registration.');
      }
    } else {
      console.warn('Invalid FCM token format; skipping backend registration.');
    }
  } catch (err) {
    console.error('Failed to register token with backend:', err);
  }
}

export async function initializeFcmToken() {
  if (!messaging) {
    console.warn('Firebase messaging not supported in this browser.');
    return null;
  }

  try {
    // 1. Ask user for notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied.');
      return null;
    }

    // 2️. Ensure service worker is registered
    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js',
      { scope: '/' },
    );

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

    // 3️. Get (or refresh) token
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      console.warn('No FCM token retrieved.');
      return null;
    }

    // 4️. Compare with saved token to avoid duplicate registration
    const savedToken = LocalStorageService.get(FCM_TOKEN_KEY);
    if (token !== savedToken) {
      console.log('🔄 New FCM Token detected:', token);
      await registerValidFcmToken(token);
      LocalStorageService.set(FCM_TOKEN_KEY, token);
    } else {
      console.log('FCM Token unchanged, using existing token.');
    }
    return token;
  } catch (err) {
    console.error('FCM initialization error:', err);
    return null;
  }
}
