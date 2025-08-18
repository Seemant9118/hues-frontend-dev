/* eslint-disable no-console */

'use client';

import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import { invoiceApi } from '@/api/invoice/invoiceApi';
import { orderApi } from '@/api/order_api/order_api';
import { LocalStorageService } from '@/lib/utils';
import { registerFcmToken } from '@/services/Notification_Services/NotificationServices';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { getToken, messaging, onMessage } from '../lib/firebaseConfig';

export default function FCMProvider({ children }) {
  const queryClient = useQueryClient();
  const userToken = LocalStorageService.get('token');

  const queryMap = {
    '/dashboard/sales/sales-orders/:order_id':
      orderApi.getOrderDetails.endpointKey,
    '/dashboard/purchases/purchase-orders/:order_id':
      orderApi.getOrderDetails.endpointKey,
    '/dashboard/purchases/purchase-invoices/:invoice_id':
      invoiceApi.getInvoice.endpointKey,
    '/dashboard/vendors': vendorEnterprise.getVendors.endpointKey,
    '/dashboard/clients': clientEnterprise.getClients.endpointKey,
  };

  const refetchAPIForeGroundNotificationPage = (path) => {
    const matchedPath = Object.keys(queryMap).find((basePath) =>
      path.startsWith(basePath),
    );
    if (matchedPath) {
      queryClient.invalidateQueries({ queryKey: queryMap[matchedPath] });
    }
  };

  useEffect(() => {
    if (!messaging) {
      console.warn('Firebase messaging not available in this environment.');
      return;
    }

    async function registerForPush() {
      try {
        const permission = await Notification.requestPermission();

        if (permission !== 'granted') {
          console.warn('Please enable notifications in your browser.');
          return;
        }

        // 🔹 Register SW once
        const registration = await navigator.serviceWorker.register(
          '/firebase-messaging-sw.js',
          { scope: '/' },
        );
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        const token = await getToken(messaging, {
          vapidKey,
          serviceWorkerRegistration: registration,
        });

        if (userToken && token) {
          console.log('📩 FCM Token:', token);
          // save token to backend
          await registerFcmToken({ token, deviceType: 'web' });
        } else {
          console.warn('No FCM token received.');
        }
      } catch (err) {
        console.error('Error registering for FCM:', err);
      }
    }

    registerForPush();

    // Foreground listener
    const unsubscribe = onMessage(messaging, (payload) => {
      const { body, image, deepLink } = payload.data || {};

      if (deepLink) {
        refetchAPIForeGroundNotificationPage(deepLink);
      }

      toast(`${body || ''}`, {
        icon: image || '🔔',
      });
    });

    // eslint-disable-next-line consistent-return
    return () => unsubscribe();
  }, []);

  return <>{children}</>;
}
