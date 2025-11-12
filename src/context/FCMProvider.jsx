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
    (async () => {
      await initializeFcmToken();
    })();

    // 🔔 Foreground notifications
    const unsubscribe = onMessage(messaging, (payload) => {
      isForegroundHandledRef.current = true;
      const { body, image, endpointKey } = payload.data || {};
      if (endpointKey) refetchAPI(endpointKey);

      toast(body || 'New notification received', {
        icon: image || '🔔',
      });

      // eslint-disable-next-line no-return-assign
      setTimeout(() => (isForegroundHandledRef.current = false), 1200);
    });

    // 🪄 Background channel sync
    const bc = new BroadcastChannel('fcm_channel');
    bc.onmessage = (event) => {
      const { data } = event.data || {};
      if (data?.endpointKey) refetchAPI(data.endpointKey);
    };

    return () => {
      unsubscribe();
      bc.close();
    };
  }, []);

  return <>{children}</>;
}
