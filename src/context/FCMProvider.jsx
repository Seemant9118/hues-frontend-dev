/* eslint-disable no-console */
/* eslint-disable consistent-return */

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
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    // ✅ Run only in browser
    if (typeof window === 'undefined') return;

    // ✅ If messaging is not available, don't setup listeners
    if (!messaging) {
      console.warn('Firebase messaging not supported. Skipping FCM setup.');
      return;
    }

    (async () => {
      try {
        await initializeFcmToken();
      } catch (e) {
        console.warn('FCM init failed safely:', e);
      }
    })();

    // ✅ Foreground listener
    let unsubscribe = () => {};
    try {
      unsubscribe = onMessage(messaging, (payload) => {
        isForegroundHandledRef.current = true;

        const { body, image, endpointKey } = payload.data || {};

        if (endpointKey) refetchAPI(endpointKey);

        toast(body || 'New notification', {
          icon: image || '🔔',
        });

        setTimeout(() => {
          isForegroundHandledRef.current = false;
        }, 1500);
      });
    } catch (e) {
      console.warn('onMessage listener setup failed:', e);
    }

    // ✅ BroadcastChannel safe setup
    let bc = null;
    if ('BroadcastChannel' in window) {
      bc = new BroadcastChannel('fcm_channel');
      bc.onmessage = (event) => {
        const { data } = event.data || {};

        if (isForegroundHandledRef.current) {
          if (data?.endpointKey) refetchAPI(data.endpointKey);
          return;
        }

        if (data?.endpointKey) refetchAPI(data.endpointKey);
      };
    } else {
      console.warn('BroadcastChannel not supported in this browser.');
    }

    return () => {
      unsubscribe?.();
      bc?.close?.();
    };
  }, []);

  return <>{children}</>;
}
