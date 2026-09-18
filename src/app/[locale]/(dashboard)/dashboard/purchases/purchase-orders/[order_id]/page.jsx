'use client';

import { getEnterpriseId } from '@/appUtils/helperFunctions';
import PINVerifyModal from '@/components/invoices/PINVerifyModal';
import NegotiationHistory from '@/components/orders/NegotiationHistory';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/hooks/useMetaData';
import { usePermission } from '@/hooks/usePermissions';
import { useRouter } from '@/i18n/routing';
import ProxyAcceptanceModal from '@/components/Modals/ProxyAcceptanceModal';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useParams, useSearchParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import Loading from '@/components/ui/Loading';
import AccessDenied from '@/components/shared/AccessDenied';
import MakePaymentNew from '@/components/payments/MakePaymentNew';
import { usePurchaseOrderQueries } from './hooks/usePurchaseOrderQueries';
import { usePurchaseOrderActions } from './hooks/usePurchaseOrderActions';
import PurchaseOrderHeader from './components/PurchaseOrderHeader';
import PurchaseOrderTabs from './components/PurchaseOrderTabs';

const NegotiationComponent = dynamic(
  () => import('@/components/orders/NegotiationComponent'),
  { loading: () => <Loading /> },
);
const EditOrder = dynamic(() => import('@/components/orders/EditOrderS'), {
  loading: () => <Loading />,
});
const EditOrderServices = dynamic(
  () => import('@/components/orders/CreateOrderServices'),
  { loading: () => <Loading /> },
);
const PastInvoices = dynamic(
  () => import('@/components/invoices/PastInvoices'),
  { loading: () => <Loading /> },
);

const ViewOrder = () => {
  useMetaData('Hues! - Purchase Order Details', 'HUES PURCHASES'); // dynamic title

  const translations = useTranslations(
    'purchases.purchase-orders.order_details',
  );
  const { hasPermission } = usePermission();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const enterpriseId = getEnterpriseId();

  const [tab, setTab] = useState('overview');
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [proxyModalOpen, setProxyModalOpen] = useState(false);
  const [isPINError, setIsPINError] = useState(false);

  const {
    isEditingOrder,
    setIsEditingOrder,
    isEditingPurchaseService,
    setIsEditingPurchaseService,
    isPastInvoices,
    setIsPastInvoices,
    isNegotiation,
    setIsNegotiation,
    isNegotiateOnBehalf,
    setIsNegotiateOnBehalf,
    isPaymentAdvicing,
    setIsPaymentAdvicing,
    viewNegotiationHistory,
    setViewNegotiationHistory,
    isTimeLinesDataLoading,
    timeLineData,
    isLoading,
    orderDetails,
    error,
  } = usePurchaseOrderQueries({
    orderId: params.order_id,
    tab,
    hasPermission,
    router,
    searchParams,
  });

  const {
    ctaList,
    recommendedActions,
    ancillaryActions,
    cancelAction,
    hasAnyActions,
    handleProxyAccept,
    withdrawOrderMutation,
    acceptOnBehalfMutation,
  } = usePurchaseOrderActions({
    orderDetails,
    isPastInvoices,
    isPaymentAdvicing,
    isNegotiation,
    viewNegotiationHistory,
    hasPermission,
    enterpriseId,
    params,
    translations,
    setIsNegotiation,
    setIsNegotiateOnBehalf,
    setProxyModalOpen,
    setIsPaymentAdvicing,
    setIsEditingOrder,
    setIsEditingPurchaseService,
    setWithdrawModalOpen,
    setIsPINError,
  });

  const customFormsGroups = useMemo(() => {
    const responses = orderDetails?.customFormResponses || [];
    if (!responses.length) return [];

    const groupsMap = new Map();

    responses.forEach((res) => {
      const formId = res.formConfigurationId;
      if (!groupsMap.has(formId)) {
        groupsMap.set(formId, {
          formId,
          formName: res.formConfiguration?.name || 'Custom Form',
          fields: res.formConfiguration?.fields || [],
          data: [],
        });
      }

      const group = groupsMap.get(formId);
      group.data.push({
        ...res.values,
        __id: res.id,
      });
    });

    return Array.from(groupsMap.values());
  }, [orderDetails?.customFormResponses]);

  const orderAttachments =
    orderDetails?.attachments || orderDetails?.orderAttachments || [];
  const orderStatus = orderDetails?.metaData?.buyerData?.orderStatus;
  const negotiationStatus = orderDetails?.negotiationStatus;

  const buyerStatus =
    negotiationStatus === 'WITHDRAWN'
      ? 'WITHDRAWN'
      : orderStatus && orderStatus !== 'NOT_INVOICED'
        ? orderStatus
        : negotiationStatus;

  const multiStatus = (
    <div className="flex gap-2">
      <ConditionalRenderingStatus status={buyerStatus} />
      <ConditionalRenderingStatus
        status={orderDetails?.metaData?.buyerData?.stockIn}
      />
      {orderStatus !== 'NOT_INVOICED' && (
        <ConditionalRenderingStatus
          status={orderDetails?.metaData?.payment?.status}
        />
      )}
    </div>
  );

  const purchaseOrdersBreadCrumbs = [
    {
      id: 1,
      name: translations('title.purchases'),
      path: '/dashboard/purchases/purchase-orders',
      show: true,
    },
    {
      id: 2,
      name: translations('title.order_details'),
      path: `/dashboard/purchases/purchase-orders/${params.order_id}`,
      show: true,
    },
    {
      id: 3,
      name: isNegotiateOnBehalf
        ? 'Negotiate on Behalf'
        : translations('title.negotiation'),
      path: `/dashboard/purchases/purchase-orders/${params.order_id}/`,
      show: isNegotiation,
    },
    {
      id: 4,
      name: translations('title.invoice'),
      path: `/dashboard/purchases/purchase-orders/${params.order_id}/`,
      show: isPastInvoices,
    },
    {
      id: 5,
      name: translations('title.payment_advice'),
      path: `/purchases/purchase-orders/${params.order_id}`,
      show: isPaymentAdvicing,
    },
    {
      id: 6,
      name: 'Negotiation History',
      path: `/dashboard/purchases/purchase-orders/${params.order_id}`,
      show: viewNegotiationHistory,
    },
    {
      id: 7,
      name: 'Edit Order',
      path: `/dashboard/purchases/purchase-orders/${params.order_id}`,
      show: isEditingOrder || isEditingPurchaseService,
    },
  ];

  return (
    <ProtectedWrapper permissionCode={'permission:purchase-view'}>
      <Wrapper className="h-full py-2">
        {isLoading && (
          <div className="flex h-full w-full items-center justify-center">
            <Loading />
          </div>
        )}

        {!isLoading && error && (
          <div className="flex h-full w-full items-center justify-center">
            <AccessDenied />
          </div>
        )}

        {/* withdraw pin modal */}
        <PINVerifyModal
          open={withdrawModalOpen}
          setOpen={setWithdrawModalOpen}
          order={orderDetails}
          handleCreateFn={(updatedOrder) => {
            withdrawOrderMutation.mutate({
              orderId: Number(params.order_id),
              pin: updatedOrder.pin,
              invoiceType:
                orderDetails?.invoiceType ||
                (orderDetails?.orderType === 'PURCHASE' ? 'GOODS' : 'GOODS'),
            });
          }}
          isPINError={isPINError}
          setIsPINError={setIsPINError}
          isPendingInvoice={withdrawOrderMutation.isPending}
        />

        <ProxyAcceptanceModal
          open={proxyModalOpen}
          setOpen={setProxyModalOpen}
          orderId={params.order_id}
          orderRefNumber={orderDetails?.referenceNumber}
          userRole="Receiver"
          onConfirm={handleProxyAccept}
          isPending={acceptOnBehalfMutation.isPending}
        />

        {!isEditingOrder &&
          !isEditingPurchaseService &&
          !isLoading &&
          !error &&
          orderDetails && (
            <>
              <PurchaseOrderHeader
                params={params}
                purchaseOrdersBreadCrumbs={purchaseOrdersBreadCrumbs}
                setIsNegotiation={setIsNegotiation}
                setIsPastInvoices={setIsPastInvoices}
                isPaymentAdvicing={isPaymentAdvicing}
                isNegotiation={isNegotiation}
                viewNegotiationHistory={viewNegotiationHistory}
                orderDetails={orderDetails}
                orderAttachments={orderAttachments}
                ctaList={ctaList}
              />

              {/* switch tabs */}
              {!isNegotiation &&
                !isPaymentAdvicing &&
                !viewNegotiationHistory && (
                  <PurchaseOrderTabs
                    tab={tab}
                    onTabChange={setTab}
                    translations={translations}
                    customFormsGroups={customFormsGroups}
                    hasAnyActions={hasAnyActions}
                    orderDetails={orderDetails}
                    multiStatus={multiStatus}
                    setViewNegotiationHistory={setViewNegotiationHistory}
                    params={params}
                    recommendedActions={recommendedActions}
                    ancillaryActions={ancillaryActions}
                    cancelAction={cancelAction}
                    orderAttachments={orderAttachments}
                    isTimeLinesDataLoading={isTimeLinesDataLoading}
                    timeLineData={timeLineData}
                  />
                )}

              {/* Negotiation Component */}
              {isNegotiation && !isPastInvoices && !viewNegotiationHistory && (
                <NegotiationComponent
                  orderDetails={orderDetails}
                  isNegotiation={isNegotiation}
                  setIsNegotiation={setIsNegotiation}
                  isNegotiateOnBehalf={isNegotiateOnBehalf}
                  setIsNegotiateOnBehalf={setIsNegotiateOnBehalf}
                />
              )}

              {/* Invoices Component */}
              {isPastInvoices && !isNegotiation && !viewNegotiationHistory && (
                <PastInvoices />
              )}

              {isPaymentAdvicing &&
                !isNegotiation &&
                !viewNegotiationHistory && (
                  <MakePaymentNew
                    orderId={params.order_id}
                    orderDetails={orderDetails}
                    setIsRecordingPayment={setIsPaymentAdvicing}
                    contextType="PAYMENT_ADVICE"
                  />
                )}

              {/* negotiation history */}
              {viewNegotiationHistory &&
                !isNegotiation &&
                !isPastInvoices &&
                !isEditingOrder &&
                !isPaymentAdvicing && (
                  <NegotiationHistory orderId={params.order_id} />
                )}
            </>
          )}

        {/* editOrder Component */}
        {isEditingOrder && (
          <EditOrder
            cta="bid"
            isOrder="order"
            orderId={params.order_id}
            onCancel={() => setIsEditingOrder(false)}
          />
        )}

        {/* editOrderServices Component */}
        {isEditingPurchaseService && (
          <EditOrderServices
            createSalesServiceBreadCrumbs={purchaseOrdersBreadCrumbs}
            setIsCreatingSalesService={setIsEditingPurchaseService}
            cta="bid"
            orderId={params.order_id}
          />
        )}
      </Wrapper>
    </ProtectedWrapper>
  );
};

export default ViewOrder;
