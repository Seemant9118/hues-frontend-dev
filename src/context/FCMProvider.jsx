/* eslint-disable no-console */

'use client';

import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import { invoiceApi } from '@/api/invoice/invoiceApi';
import { notificationApi } from '@/api/notifications/notificationApi';
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
    // order creation
    sales_order_created: orderApi.getSales.endpointKey,
    purchase_order_created: orderApi.getPurchases.endpointKey,

    // order negotiation
    offer_received: orderApi.getOrderDetails.endpointKey,
    bid_received: orderApi.getOrderDetails.endpointKey,

    // order accepted
    order_accepted: orderApi.getOrderDetails.endpointKey,

    // invoice received
    invoice_received: invoiceApi.getAllPurchaseInvoices.endpointKey,

    // invitation as client
    invitation_sent_as_client: vendorEnterprise.getVendors.endpointKey,
    invitation_accepted_as_client: vendorEnterprise.getVendors.endpointKey,
    invitation_rejected_as_client: vendorEnterprise.getVendors.endpointKey,

    // invitation as vendor
    invitation_sent_as_vendor: clientEnterprise.getClients.endpointKey,
    invitation_accepted_as_vendor: clientEnterprise.getClients.endpointKey,
    invitation_rejected_as_vendor: clientEnterprise.getClients.endpointKey,
  };

  const refetchAPIForeGroundNotificationPage = (eventKey) => {
    const endpointKey = queryMap[eventKey];

    console.log('eventKey from props:', eventKey);
    console.log('endpointKey that matched:', endpointKey);

    if (endpointKey) {
      queryClient.invalidateQueries({ queryKey: [endpointKey] });
    }

    // Always refetch notifications (unread count etc.)
    queryClient.invalidateQueries({
      queryKey: [notificationApi.getNotifications.endpointKey],
    });
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
      const { body, image, endpointKey } = payload.data || {};
      console.log('foreground message received 2', payload?.data);

      if (endpointKey) {
        console.log('endpointKey from payload:', endpointKey);
        refetchAPIForeGroundNotificationPage(endpointKey);
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
