'use client';

import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import { invoiceApi } from '@/api/invoice/invoiceApi';
import { notificationApi } from '@/api/notifications/notificationApi';
import { orderApi } from '@/api/order_api/order_api';
import { messaging, onMessage } from '@/lib/firebaseConfig';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { initializeFcmToken } from '@/services/FCM_Services/RegisterFCMTokenServices';

export default function FCMProvider({ children }) {
  const queryClient = useQueryClient();
  const isInitializedRef = useRef(false);
  const isForegroundHandledRef = useRef(false);

  const queryMap = {
    sales_order_created: orderApi.getSales.endpointKey,
    purchase_order_created: orderApi.getPurchases.endpointKey,
    offer_received: orderApi.getOrderDetails.endpointKey,
    bid_received: orderApi.getOrderDetails.endpointKey,
    order_accepted: orderApi.getOrderDetails.endpointKey,
    invoice_received: invoiceApi.getAllPurchaseInvoices.endpointKey,
    invitation_sent_as_client: vendorEnterprise.getVendors.endpointKey,
    invitation_accepted_as_client: vendorEnterprise.getVendors.endpointKey,
    invitation_rejected_as_client: vendorEnterprise.getVendors.endpointKey,
    invitation_sent_as_vendor: clientEnterprise.getClients.endpointKey,
    invitation_accepted_as_vendor: clientEnterprise.getClients.endpointKey,
    invitation_rejected_as_vendor: clientEnterprise.getClients.endpointKey,
  };

  const refetchAPI = (eventKey) => {
    const endpointKey = queryMap[eventKey];
    if (endpointKey) queryClient.invalidateQueries({ queryKey: [endpointKey] });
    queryClient.invalidateQueries({
      queryKey: [notificationApi.getNotifications.endpointKey],
    });
  };

  useEffect(() => {
    // Prevent double run under React Strict Mode
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    (async () => {
      await initializeFcmToken();
    })();

    // Foreground listener
    const unsubscribe = onMessage(messaging, (payload) => {
      isForegroundHandledRef.current = true; // mark foreground as handled

      const { body, image, endpointKey } = payload.data || {};

      // Refetch queries for real-time data updates
      if (endpointKey) refetchAPI(endpointKey);

      // Show toast only once (foreground)
      toast(body || 'New notification', {
        icon: image || '🔔',
      });

      // Reset flag after a short delay (so BC message is ignored)
      setTimeout(() => {
        isForegroundHandledRef.current = false;
      }, 1500);
    });

    // Background listener via BroadcastChannel
    const bc = new BroadcastChannel('fcm_channel');
    bc.onmessage = (event) => {
      const { data } = event.data || {};
      // notification,
      // Skip duplicate toast if handled in foreground
      if (isForegroundHandledRef.current) {
        // Still refetch silently (important)
        if (data?.endpointKey) {
          refetchAPI(data.endpointKey);
        }
        return;
      }

      // If not handled in foreground (e.g., inactive tab or delayed BC message)
      if (data?.endpointKey) {
        refetchAPI(data.endpointKey);
      }

      // Show toast only if foreground handler didn’t already do it
      // toast(notification?.title || 'New notification', {
      //   description: notification?.body,
      //   icon: notification?.image || '🔔',
      // });
    };

    // eslint-disable-next-line consistent-return
    return () => {
      unsubscribe();
      bc.close();
    };
  }, []);

  return <>{children}</>;
}
