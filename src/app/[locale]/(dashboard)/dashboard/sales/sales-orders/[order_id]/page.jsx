'use client';

import { getEnterpriseId } from '@/appUtils/helperFunctions';
import DynamicModal from '@/components/Modals/DynamicModal';
import ProxyAcceptanceModal from '@/components/Modals/ProxyAcceptanceModal';
import PINVerifyModal from '@/components/invoices/PINVerifyModal';
import EditOrder from '@/components/orders/EditOrderS';
import NegotiationHistory from '@/components/orders/NegotiationHistory';
import AccessDenied from '@/components/shared/AccessDenied';
import Loading from '@/components/ui/Loading';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/hooks/useMetaData';
import { usePermission } from '@/hooks/usePermissions';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { CheckCheck } from 'lucide-react';
import SalesOrderHeader from './components/SalesOrderHeader';
import SalesOrderTabs from './components/SalesOrderTabs';
import { useSalesOrderActions } from './hooks/useSalesOrderActions';
import { useSalesOrderQueries } from './hooks/useSalesOrderQueries';

// dynamic imports
const NegotiationComponent = dynamic(
  () => import('@/components/orders/NegotiationComponent'),
  {
    loading: () => <Loading />,
  },
);
const GenerateInvoice = dynamic(
  () => import('@/components/invoices/GenerateInvoice'),
  {
    loading: () => <Loading />,
  },
);

const MakePaymentNew = dynamic(
  () => import('@/components/payments/MakePaymentNew'),
  {
    loading: () => <Loading />,
  },
);

const EditOrderServices = dynamic(
  () => import('@/components/orders/CreateOrderServices'),
  {
    loading: () => <Loading />,
  },
);

const ViewOrder = () => {
  useMetaData('Hues! - Sales Order Details', 'HUES SALES'); // dynamic title

  const translations = useTranslations('sales.sales-orders.order_details');
  const { hasPermission } = usePermission();
  const router = useRouter();
  const params = useParams();
  const enterpriseId = getEnterpriseId();
  const searchParams = useSearchParams();

  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [isEditingServiceOrder, setIsEditingServiceOrder] = useState(false);
  const [isNegotiation, setIsNegotiation] = useState(false);
  const [isGenerateInvoice, setIsGenerateInvoice] = useState(false);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [viewNegotiationHistory, setViewNegotiationHistory] = useState(false);
  const [tab, setTab] = useState('overview');
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [proxyModalOpen, setProxyModalOpen] = useState(false);
  const [isNegotiateOnBehalf, setIsNegotiateOnBehalf] = useState(false);
  const [isPINError, setIsPINError] = useState(false);
  const [modalData, setModalData] = useState({
    isOpen: false,
    title: '',
    description: '',
    buttons: [],
  });

  const onTabChange = (value) => {
    setTab(value);
  };

  useEffect(() => {
    const state = searchParams.get('state');
    setIsEditingOrder(state === 'editOrder');
    setIsEditingServiceOrder(state === 'editServiceOrder');
    setIsNegotiation(
      state === 'negotiation' || state === 'negotiationByBehalf',
    );
    setIsNegotiateOnBehalf(state === 'negotiationByBehalf');
    setIsGenerateInvoice(state === 'generateInvoice');
    setIsRecordingPayment(state === 'recordPayment');
    setViewNegotiationHistory(state === 'negotiationHistory');
  }, [searchParams]);

  useEffect(() => {
    let newPath = `/dashboard/sales/sales-orders/${params.order_id}`;

    if (isNegotiation) {
      newPath += isNegotiateOnBehalf
        ? '?state=negotiationByBehalf'
        : '?state=negotiation';
    } else if (isGenerateInvoice) {
      newPath += '?state=generateInvoice';
    } else if (isRecordingPayment) {
      newPath += '?state=recordPayment';
    } else if (viewNegotiationHistory) {
      newPath += '?state=negotiationHistory';
    } else if (isEditingOrder) {
      newPath += '?state=editOrder';
    } else if (isEditingServiceOrder) {
      newPath += '?state=editServiceOrder';
    } else {
      newPath += '';
    }

    router.push(newPath);
  }, [
    isNegotiation,
    isNegotiateOnBehalf,
    isGenerateInvoice,
    viewNegotiationHistory,
    isRecordingPayment,
    isEditingOrder,
    isEditingServiceOrder,
    params.order_id,
    router,
  ]);

  const {
    isTimeLinesDataLoading,
    timeLineData,
    isLoading,
    orderDetails,
    error,
    invitationData,
    acceptMutation,
    handleAccept,
    handleProxyAccept,
    stockOutMutation,
    acceptOrderMutation,
    withdrawOrderMutation,
    remindOrderMutation,
    unRepliedInvoiceMutation,
  } = useSalesOrderQueries({
    orderId: params.order_id,
    tab,
    hasPermission,
    translations,
    setModalData,
    setWithdrawModalOpen,
    setIsPINError,
    router,
  });

  const {
    ctaList,
    recommendedActions,
    ancillaryActions,
    cancelAction,
    hasAnyActions,
  } = useSalesOrderActions({
    orderDetails,
    isGenerateInvoice,
    isRecordingPayment,
    isNegotiation,
    viewNegotiationHistory,
    hasPermission,
    enterpriseId,
    tab,
    params,
    translations,
    acceptMutation,
    handleAccept,
    setIsNegotiation,
    setIsNegotiateOnBehalf,
    setProxyModalOpen,
    setIsRecordingPayment,
    setIsEditingOrder,
    setIsEditingServiceOrder,
    acceptOrderMutation,
    setModalData,
    remindOrderMutation,
    unRepliedInvoiceMutation,
    setIsGenerateInvoice,
    stockOutMutation,
    setWithdrawModalOpen,
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

  const orderStatus = orderDetails?.metaData?.sellerData?.orderStatus;
  const negotiationStatus = orderDetails?.negotiationStatus;

  const sellerStatus =
    negotiationStatus === 'WITHDRAWN'
      ? 'WITHDRAWN'
      : orderStatus && orderStatus !== 'NOT_INVOICED'
        ? orderStatus
        : negotiationStatus;

  const multiStatus = (
    <div className="flex gap-2">
      <ConditionalRenderingStatus status={sellerStatus} />
      <ConditionalRenderingStatus
        status={orderDetails?.metaData?.sellerData?.stockOut}
      />
      {orderStatus !== 'NOT_INVOICED' && (
        <ConditionalRenderingStatus
          status={orderDetails?.metaData?.payment?.status}
        />
      )}
    </div>
  );

  return (
    <ProtectedWrapper permissionCode={'permission:sales-view'}>
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

        {!isLoading &&
          !error &&
          !isEditingOrder &&
          !isEditingServiceOrder &&
          orderDetails && (
            <>
              <SalesOrderHeader
                params={params}
                viewNegotiationHistory={viewNegotiationHistory}
                isGenerateInvoice={isGenerateInvoice}
                isRecordingPayment={isRecordingPayment}
                isEditingOrder={isEditingOrder}
                isEditingServiceOrder={isEditingServiceOrder}
                isNegotiation={isNegotiation}
                isNegotiateOnBehalf={isNegotiateOnBehalf}
                ctaList={ctaList}
                tab={tab}
                orderDetails={orderDetails}
                orderAttachments={orderAttachments}
              />

              {!isGenerateInvoice &&
                !isNegotiation &&
                !isRecordingPayment &&
                !viewNegotiationHistory && (
                  <SalesOrderTabs
                    tab={tab}
                    onTabChange={onTabChange}
                    translations={translations}
                    customFormsGroups={customFormsGroups}
                    hasAnyActions={hasAnyActions}
                    orderDetails={orderDetails}
                    multiStatus={multiStatus}
                    invitationData={invitationData}
                    setViewNegotiationHistory={setViewNegotiationHistory}
                    params={params}
                    recommendedActions={recommendedActions}
                    ancillaryActions={ancillaryActions}
                    cancelAction={cancelAction}
                    orderAttachments={orderAttachments}
                    isTimeLinesDataLoading={isTimeLinesDataLoading}
                    timeLineData={timeLineData}
                    setIsRecordingPayment={setIsRecordingPayment}
                  />
                )}

              {/* Negotiation Component */}
              {isNegotiation &&
                !isGenerateInvoice &&
                !isRecordingPayment &&
                !viewNegotiationHistory && (
                  <NegotiationComponent
                    orderDetails={orderDetails}
                    isNegotiation={isNegotiation}
                    setIsNegotiation={setIsNegotiation}
                    isNegotiateOnBehalf={isNegotiateOnBehalf}
                    setIsNegotiateOnBehalf={setIsNegotiateOnBehalf}
                  />
                )}

              {/* seprator */}
              {!isNegotiation &&
                !isGenerateInvoice &&
                !isRecordingPayment &&
                !viewNegotiationHistory && (
                  <div className="mt-auto h-[1px] bg-neutral-300"></div>
                )}

              {/* generate Invoice component */}
              {isGenerateInvoice &&
                !isNegotiation &&
                !isRecordingPayment &&
                !viewNegotiationHistory && (
                  <GenerateInvoice
                    orderDetails={orderDetails}
                    setIsGenerateInvoice={setIsGenerateInvoice}
                  />
                )}

              {/* recordPayment component */}
              {isRecordingPayment &&
                !isGenerateInvoice &&
                !isNegotiation &&
                !viewNegotiationHistory && (
                  <MakePaymentNew
                    orderId={params.order_id}
                    orderDetails={orderDetails}
                    setIsRecordingPayment={setIsRecordingPayment}
                    contextType="PAYMENT"
                  />
                )}

              {/* negotiation history */}
              {viewNegotiationHistory &&
                !isGenerateInvoice &&
                !isNegotiation &&
                !isEditingOrder &&
                !isRecordingPayment && (
                  <NegotiationHistory orderId={params.order_id} />
                )}
            </>
          )}

        {/* editOrder Component - goods */}
        {isEditingOrder && (
          <EditOrder
            cta="offer"
            isOrder="order"
            orderId={params.order_id}
            onCancel={() => setIsEditingOrder(false)}
          />
        )}

        {/* editOrder Component - service */}
        {isEditingServiceOrder && (
          <EditOrderServices
            createSalesServiceBreadCrumbs={[]}
            cta="offer"
            orderId={params.order_id}
            setIsCreatingSalesService={setIsEditingServiceOrder}
          />
        )}
      </Wrapper>

      {/* MODALS */}
      <ProxyAcceptanceModal
        modalOpen={proxyModalOpen}
        setModalOpen={setProxyModalOpen}
        onAccept={handleProxyAccept}
        header="Negotiate On Behalf"
        buttonText="Accept Proposal"
        buttonIcon={<CheckCheck size={14} />}
        subHeading="You will be accepting this order on behalf of the customer"
      />
      <PINVerifyModal
        orderId={params.order_id}
        open={withdrawModalOpen}
        setOpen={setWithdrawModalOpen}
        cancelAction={() => withdrawOrderMutation.mutate(params.order_id)}
        actionString="Cancel"
        isPINError={isPINError}
        setIsPINError={setIsPINError}
      />
      <DynamicModal
        open={modalData?.isOpen}
        setOpen={(val) =>
          setModalData((prev) => ({
            ...prev,
            isOpen: val,
          }))
        }
        title={modalData?.title}
        description={modalData?.description}
        buttons={modalData?.buttons}
      />
    </ProtectedWrapper>
  );
};

export default ViewOrder;
